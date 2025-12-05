export type Gender = 'male' | 'female' | 'non-binary' | 'unknown';
export type PersonStatus = 'living' | 'deceased';
export type Status = PersonStatus; // Alias for backward compatibility
export type ProfileType = 'template' | 'custom';
export type RelationQuality = 'strong' | 'moderate' | 'weak' | 'conflicted' | 'neutral';
export type TemplateCategory = 
  | 'authoritarian-parent' 
  | 'neglectful-parent' 
  | 'enabling-parent' 
  | 'dependent-child' 
  | 'rebellious-child' 
  | 'peacekeeper' 
  | 'scapegoat' 
  | 'hero' 
  | 'lost-child' 
  | 'traumatized-adult' 
  | 'achiever' 
  | 'codependent';

// Health record types
export interface HealthRecord {
  id: string;
  personId: string;
  condition: string; // e.g., 'depression', 'diabetes', 'heart-disease'
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  status: 'active' | 'managed' | 'remission' | 'resolved';
  diagnosedDate?: string; // YYYY-MM-DD format
  resolvedDate?: string; // YYYY-MM-DD format
  notes?: string;
  treatedBy?: string; // Healthcare provider
}

export interface MedicationRecord {
  id: string;
  personId: string;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
  prescribedBy?: string;
  notes?: string;
  sideEffects?: string[];
}

export type CauseOfDeath = 
  | 'natural'
  | 'illness'
  | 'accident'
  | 'suicide'
  | 'homicide'
  | 'unknown'
  | 'other';

export interface PersonProfile {
  id: string;
  personId: string;
  profileType: ProfileType;
  templateCategory?: TemplateCategory;
  description?: string;
  psychologicalTraits?: string[];
  coreWounds?: string[];
  copingMechanisms?: string[];
  strengthsAndResources?: string[];
  therapeuticRecommendations?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  id: string;
  name: string;
  age?: number;
  gender: Gender;
  status: Status;
  attributes?: string[]; // e.g., 'depression', 'anxiety', 'alcoholism'
  notes?: string;
  profileId?: string; // Reference to PersonProfile
  templateCategory?: TemplateCategory; // Current profile template emoji/type
  isPrincipal?: boolean; // If true, this person is the main focus and stays centered
  position?: { x: number; y: number }; // Saved position on canvas
  dateOfBirth?: string; // YYYY-MM-DD format
  dateOfDeath?: string; // YYYY-MM-DD format
  occupation?: string;
  medicalConditions?: string[]; // Health conditions (legacy - prefer healthHistory)
  significantEvents?: string[]; // Important life events
  profileImage?: string; // Base64 or URL
  
  // Health tracking
  healthHistory?: HealthRecord[]; // Medical/psychological conditions with details
  medications?: MedicationRecord[]; // Current and past medications
  causeOfDeath?: CauseOfDeath; // If deceased, cause of death
}

export type RelationType = 
  // Blood relations
  | 'parent-child' 
  | 'biological-sibling'
  | 'half-sibling'
  | 'full-sibling'
  | 'twin'
  | 'fraternal-twin'
  | 'identical-twin'
  | 'grandparent-grandchild'
  | 'uncle-aunt-niece-nephew'
  | 'cousin'
  | 'step-sibling'
  | 'step-parent'
  | 'step-child'
  // Family bonds
  | 'partner'
  | 'married-couple'
  | 'domestic-partnership'
  | 'ex-partner'
  | 'ex-spouse'
  | 'engaged'
  // Adoption/guardianship
  | 'adoptive-parent'
  | 'adoptive-child'
  | 'foster-parent'
  | 'foster-child'
  // Relationship qualities
  | 'close'
  | 'distant'
  | 'fused'
  | 'conflict'
  | 'estranged'
  | 'dependent'
  | 'supportive';

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  // Relationship metadata
  startDate?: string; // YYYY-MM-DD format - when relationship started
  endDate?: string; // YYYY-MM-DD format - when relationship ended (if applicable)
  quality?: RelationQuality; // Quality of relationship
  notes?: string; // Additional notes about the relationship
}

export interface GenogramData {
  people: Person[];
  relations: Relation[];
  profiles?: PersonProfile[];
}

