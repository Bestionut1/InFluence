import type { RelationType, Person, Relation } from '../types/genogram';

export interface ExtractedRelationship {
  person1Name: string;
  person2Name: string;
  type: RelationType;
  confidence: number; // 0-1 score
  context?: string;
  person1Details?: PersonDetails;
  person2Details?: PersonDetails;
}

export interface PersonDetails {
  age?: number;
  gender?: 'male' | 'female';
  occupation?: string;
}


/**
 * Extract relationship information from chat messages
 * Detects patterns like "I quarreled with X", "X and Y are divorced", etc.
 * Also extracts person details: age, gender, occupation, relationships
 */
export function extractRelationshipsFromChat(
  userMessage: string,
  assistantResponse: string
): ExtractedRelationship[] {
  const relationships: ExtractedRelationship[] = [];
  
  // Combine both user and assistant messages for analysis
  const textToAnalyze = `${userMessage} ${assistantResponse}`;
  const textLower = textToAnalyze.toLowerCase();

  console.log('🔍 Extracting from text:', textToAnalyze);

  // PATTERN 1: "X is [masculin/masculine/male/boy] [age] [ani/years] [este] [relationship description]"
  // Example: "Iulian masculin 16 ani este fratele lui Ionut si este elev"
  // More flexible regex that handles variations
  const detailedPersonPattern = /\b([a-zA-Z]+)\s+(masculin|masculine|male|boy|feminin|feminine|female|girl)\s+(\d+)\s+(ani|years?|años)(?:\s+(este|is|are))?\s*(.+?)(?=[.!?]|$)/gi;
  
  let match;
  while ((match = detailedPersonPattern.exec(textToAnalyze)) !== null) {
    const [fullMatch, personName, genderStr, ageStr, , , restOfInfo] = match;
    console.log('✅ Pattern 1 matched:', { personName, genderStr, ageStr, restOfInfo: restOfInfo?.trim() });
    
    const gender = genderStr.toLowerCase().includes('masculin') || genderStr.toLowerCase().includes('male') || genderStr.toLowerCase().includes('boy') ? 'male' : 'female';
    const fullContext = fullMatch; // Store full match for context
    
    // Extract relationship from restOfInfo
    if (restOfInfo) {
      const relationships_in_info = extractRelationshipsFromPhrase(personName, fullContext, gender);
      console.log('  Relationships found:', relationships_in_info);
      relationships.push(...relationships_in_info);
    }
  }

  // PATTERN 2: "I had a conflict/quarrel with X" or "I fought with X"
  const conflictPatterns = [
    /(?:i\s+)?(?:had|got|got\s+into|been|had\s+a)\s+(?:conflict|quarrel|fight|argument|disagrement|fight|issue)\s+with\s+([a-z]+)/gi,
    /(?:i\s+)?(?:argued|fought|quarreled|quarelled)\s+with\s+([a-z]+)/gi,
    /(?:i\s+)?(?:had\s+problems?|clash(?:ed)?)\s+with\s+([a-z]+)/gi,
  ];

  conflictPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(textToAnalyze)) !== null) {
      const personName = match[1].trim();
      if (personName.length > 2 && !['the', 'and', 'but', 'was', 'are'].includes(personName)) {
        // Try to identify if this is mentioned as a family member
        const context = extractContext(userMessage, assistantResponse, personName);
        relationships.push({
          person1Name: 'self', // Current user
          person2Name: personName,
          type: 'conflict',
          confidence: 0.85,
          context,
        });
      }
    }
  });

  // PATTERN 3: "X and Y are divorced" / "X and Y broke up"
  const divorcePatterns = [
    /([a-z]+)\s+(?:and|with)\s+([a-z]+)\s+(?:are|is|were)\s+(?:divorced|divorcee|breakup|broke\s+up|separated)/gi,
    /([a-z]+)\s+(?:and|with)\s+([a-z]+)\s+(?:split|parted|ended)/gi,
  ];

  divorcePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(textLower)) !== null) {
      const [, person1, person2] = match;
      if (isValidPersonName(person1) && isValidPersonName(person2)) {
        relationships.push({
          person1Name: person1,
          person2Name: person2,
          type: 'ex-partner',
          confidence: 0.9,
          context: 'Detected divorce/separation',
        });
      }
    }
  });

  // PATTERN 4: "X is my mother/father/sister/brother"
  const relationshipPatterns = [
    /([a-z]+)\s+(?:is|are)\s+(?:my\s+)?(?:mother|mom|mama|father|dad|tata|sister|brother|sibling|wife|husband|partner)/gi,
    /(?:my|the)\s+(?:mother|mom|mama|father|dad|tata|sister|brother|sibling|wife|husband|partner)\s+(?:is|are)\s+([a-z]+)/gi,
  ];

  relationshipPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(textLower)) !== null) {
      const personName = match[1].trim();
      if (isValidPersonName(personName)) {
        const relationshipType = extractRelationshipType(match[0]);
        if (relationshipType) {
          relationships.push({
            person1Name: 'self',
            person2Name: personName,
            type: relationshipType,
            confidence: 0.8,
            context: match[0],
          });
        }
      }
    }
  });

  // PATTERN 5: "X and Y are close/distant/fused"
  const emotionalPatterns = [
    /([a-z]+)\s+(?:and|with)\s+([a-z]+)\s+(?:are|were)\s+(?:very\s+)?(?:close|distant|fused|enmeshed|estranged)/gi,
  ];

  emotionalPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(textLower)) !== null) {
      const [, person1, person2] = match;
      if (isValidPersonName(person1) && isValidPersonName(person2)) {
        const emotionalType = extractEmotionalType(match[0]);
        relationships.push({
          person1Name: person1,
          person2Name: person2,
          type: emotionalType,
          confidence: 0.75,
          context: match[0],
        });
      }
    }
  });

  // Remove duplicates and keep highest confidence
  const uniqueRelationships = new Map<string, ExtractedRelationship>();
  relationships.forEach(rel => {
    const key = `${rel.person1Name}|${rel.person2Name}|${rel.type}`;
    const existing = uniqueRelationships.get(key);
    if (!existing || rel.confidence > existing.confidence) {
      uniqueRelationships.set(key, rel);
    }
  });

  return Array.from(uniqueRelationships.values());
}

function isValidPersonName(name: string): boolean {
  if (!name || name.length < 2) return false;
  const invalid = ['the', 'and', 'but', 'was', 'are', 'is', 'were', 'i', 'me', 'my', 'self'];
  return !invalid.includes(name.toLowerCase());
}

function extractRelationshipsFromPhrase(personName: string, phrase: string, gender: string): ExtractedRelationship[] {
  const rels: ExtractedRelationship[] = [];
  const lowerPhrase = phrase.toLowerCase();

  console.log(`🔎 Analyzing phrase for ${personName}:`, phrase);

  // Extract age from phrase: "16 ani", "16 years"
  let age: number | undefined;
  const ageMatch = /(\d+)\s+(?:ani|years?|años)/i.exec(phrase);
  if (ageMatch) {
    age = parseInt(ageMatch[1], 10);
    console.log(`  📅 Age extracted: ${age}`);
  }

  // Extract occupation from phrase: "elev", "student", "profesor", etc.
  let occupation: string | undefined;
  const occupationMatch = /(?:este|is|are)\s+([a-z\s]+?)(?:\s+(?:și|and|si|,|\.))/i.exec(phrase);
  if (occupationMatch) {
    occupation = occupationMatch[1]?.trim();
    console.log(`  💼 Occupation extracted: ${occupation}`);
  }

  const personDetails: PersonDetails = {
    age,
    gender: gender.toLowerCase().includes('masculin') || gender.toLowerCase().includes('male') || gender.toLowerCase().includes('boy') ? 'male' : 'female',
    occupation,
  };

  // Extract relationship types from phrase
  // "este fratele lui Ionut" = "is the brother of Ionut"
  if (lowerPhrase.includes('fratele') || lowerPhrase.includes('brother')) {
    const match = /(?:fratele|brother)\s+(?:lui|de|of)?\s*([a-zA-Z]+)/i.exec(phrase);
    if (match) {
      const relatedPerson = match[1].trim();
      console.log(`  👥 Found brother relationship: ${personName} → ${relatedPerson}`);
      rels.push({
        person1Name: personName,
        person2Name: relatedPerson,
        type: 'full-sibling',
        confidence: 0.95,
        context: phrase,
        person1Details: personDetails,
      });
    }
  }

  if (lowerPhrase.includes('sora') || lowerPhrase.includes('sister')) {
    const match = /(?:sora|sister)\s+(?:lui|de|of)?\s*([a-zA-Z]+)/i.exec(phrase);
    if (match) {
      const relatedPerson = match[1].trim();
      rels.push({
        person1Name: personName,
        person2Name: relatedPerson,
        type: 'full-sibling',
        confidence: 0.95,
        context: phrase,
        person1Details: personDetails,
      });
    }
  }

  if (lowerPhrase.includes('mama') || lowerPhrase.includes('mother')) {
    const match = /(?:mama|mother)\s+(?:lui|de|of)?\s*([a-zA-Z]+)/i.exec(phrase);
    if (match) {
      const relatedPerson = match[1].trim();
      rels.push({
        person1Name: relatedPerson, // Mother
        person2Name: personName, // Child
        type: 'parent-child',
        confidence: 0.95,
        context: phrase,
        person2Details: personDetails,
      });
    }
  }

  if (lowerPhrase.includes('tata') || lowerPhrase.includes('papa') || lowerPhrase.includes('father')) {
    const match = /(?:tata|papa|father)\s+(?:lui|de|of)?\s*([a-zA-Z]+)/i.exec(phrase);
    if (match) {
      const relatedPerson = match[1].trim();
      rels.push({
        person1Name: relatedPerson, // Father
        person2Name: personName, // Child
        type: 'parent-child',
        confidence: 0.95,
        context: phrase,
        person2Details: personDetails,
      });
    }
  }

  return rels;
}

function extractContext(userMsg: string, assistantMsg: string, personName: string): string {
  // Find the sentence containing this person's name
  const allText = `${userMsg} ${assistantMsg}`;
  const sentences = allText.match(/[^.!?]+[.!?]+/g) || [];
  
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(personName.toLowerCase())) {
      return sentence.trim();
    }
  }
  
  return '';
}

function extractRelationshipType(text: string): RelationType | null {
  const lower = text.toLowerCase();
  
  if (lower.includes('mother') || lower.includes('mom') || lower.includes('mama')) {
    return 'parent-child';
  }
  if (lower.includes('father') || lower.includes('dad') || lower.includes('tata')) {
    return 'parent-child';
  }
  if (lower.includes('sister') || lower.includes('brother') || lower.includes('sibling')) {
    return 'full-sibling';
  }
  if (lower.includes('wife') || lower.includes('husband') || lower.includes('partner')) {
    return 'married-couple';
  }
  
  return null;
}

function extractEmotionalType(text: string): RelationType {
  const lower = text.toLowerCase();
  
  if (lower.includes('close')) return 'close';
  if (lower.includes('distant') || lower.includes('estranged')) return 'distant';
  if (lower.includes('fused') || lower.includes('enmeshed')) return 'fused';
  
  return 'close'; // default
}

/**
 * Match extracted relationships to existing people in the genogram
 * Handles "self" as the principal person
 */
export function resolveExtractedRelationships(
  extracted: ExtractedRelationship[],
  existingPeople: Person[]
): {
  newPeople: Person[];
  newRelations: Relation[];
  updates: string[];
} {
  const newPeople: Person[] = [];
  const newRelations: Relation[] = [];
  const updates: string[] = [];
  
  console.log('🎯 Resolving relationships, extracted count:', extracted.length);
  console.log('🎯 Existing people count:', existingPeople.length);
  
  // Find principal person (isPrincipal or first person)
  const principal = existingPeople.find(p => p.isPrincipal) || existingPeople[0];
  console.log('🎯 Principal person:', principal ? principal.name : 'NONE');
  
  if (!principal) {
    console.log('⚠️ No principal person found, cannot resolve relationships');
    return { newPeople, newRelations, updates };
  }

  extracted.forEach(rel => {
    console.log(`\n🔗 Processing relationship: ${rel.person1Name} ↔ ${rel.person2Name} (${rel.type})`);
    
    let person1Id = principal.id; // "self" refers to principal
    let person2Id: string | null = null;

    if (rel.person1Name !== 'self') {
      // Find or create person1 with details from extraction
      person1Id = findOrCreatePersonId(rel.person1Name, existingPeople, newPeople, rel.context, rel.person1Details);
      console.log(`  ✅ Person1 ID: ${person1Id} (${rel.person1Name})`);
    }

    // Find or create person2 with details from extraction
    person2Id = findOrCreatePersonId(rel.person2Name, existingPeople, newPeople, rel.context, rel.person2Details);
    console.log(`  ✅ Person2 ID: ${person2Id} (${rel.person2Name})`);

    // Check if relation already exists
    const relationExists = existingPeople.some(p =>
      (p.id === person1Id || newPeople.some(np => np.id === person1Id)) &&
      rel.type === 'parent-child' // Only prevent duplicates for parent-child
    );

    if (!relationExists) {
      const relationId = `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      newRelations.push({
        id: relationId,
        sourceId: person1Id,
        targetId: person2Id,
        type: rel.type,
      });

      const person1Name = rel.person1Name === 'self' ? principal.name : rel.person1Name;
      const person2Name = rel.person2Name;
      const updateMsg = `✨ Added ${rel.type.replace('-', ' ')}: ${person1Name} ↔ ${person2Name}`;
      updates.push(updateMsg);
      console.log(`  ✅ Relation created: ${updateMsg}`);
    } else {
      console.log(`  ⚠️ Relation already exists, skipping`);
    }
  });

  console.log('\n📊 Final result - New people:', newPeople.length, 'New relations:', newRelations.length);
  return { newPeople, newRelations, updates };
}

function findOrCreatePersonId(
  name: string,
  existing: Person[],
  newArray: Person[],
  context?: string,
  details?: PersonDetails
): string {
  // Check existing people
  const existingMatch = existing.find(
    p => p.name.toLowerCase() === name.toLowerCase()
  );
  if (existingMatch) return existingMatch.id;

  // Check new people
  const newMatch = newArray.find(
    p => p.name.toLowerCase() === name.toLowerCase()
  );
  if (newMatch) return newMatch.id;

  // Create new person with details
  const newId = `person-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Use provided details if available, otherwise extract from context
  let age: number | undefined = details?.age;
  let gender: 'male' | 'female' | 'non-binary' | 'unknown' = (details?.gender as any) || 'unknown';
  let occupation: string | undefined = details?.occupation;

  // If no details provided, try to extract from context
  if (!details && context) {
    // Extract age: "16 ani", "16 years"
    const ageMatch = /(\d+)\s+(?:ani|years?|años)/i.exec(context);
    if (ageMatch) {
      age = parseInt(ageMatch[1], 10);
    }

    // Extract gender
    if (/masculin|masculine|male|boy|băiat/i.test(context)) {
      gender = 'male';
    } else if (/feminin|feminine|female|girl|fată/i.test(context)) {
      gender = 'female';
    }

    // Extract occupation/status: "elev", "student", "profesor", "doctor", etc.
    const occupationPatterns = [
      /(?:este|is|are)\s+([a-z\s]+?)(?:\s+(?:și|and|\.))/i,
      /\b(?:elev|student|profesor|teacher|doctor|inginer|lawyer|student|worker|artist)\b/i,
    ];
    
    for (const pattern of occupationPatterns) {
      const occMatch = pattern.exec(context);
      if (occMatch) {
        occupation = occMatch[1]?.trim();
        if (occupation && occupation.length > 2) break;
      }
    }
  }

  newArray.push({
    id: newId,
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
    gender,
    status: 'living',
    age,
    attributes: occupation ? [occupation] : [],
  });

  return newId;
}
