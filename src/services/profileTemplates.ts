import type { TemplateCategory } from '../types/genogram';

export interface ProfileTemplate {
  id: TemplateCategory;
  name: string;
  description: string;
  emoji: string;
  psychologicalTraits: string[];
  coreWounds: string[];
  copingMechanisms: string[];
  strengthsAndResources: string[];
  therapeuticRecommendations: string[];
}

export const PROFILE_TEMPLATE_EMOJIS: Record<TemplateCategory, string> = {
  'authoritarian-parent': '👨‍⚖️',
  'neglectful-parent': '🌫️',
  'enabling-parent': '🤗',
  'dependent-child': '🤲',
  'rebellious-child': '🔥',
  'peacekeeper': '☮️',
  'scapegoat': '🐐',
  'hero': '🦸',
  'lost-child': '🔍',
  'traumatized-adult': '⚔️',
  'achiever': '🏆',
  'codependent': '🔗',
};

export const PROFILE_TEMPLATES: Record<TemplateCategory, ProfileTemplate> = {
  'authoritarian-parent': {
    id: 'authoritarian-parent',
    name: 'Authoritarian Parent',
    description: 'Strict, controlling parent who emphasizes obedience and discipline',
    emoji: '👨‍⚖️',
    psychologicalTraits: [
      'High control needs',
      'Perfectionism',
      'Low emotional openness',
      'Rule-oriented',
      'Limited empathy'
    ],
    coreWounds: [
      'Fear of loss of control',
      'Unprocessed trauma from own childhood',
      'Need for validation through control'
    ],
    copingMechanisms: [
      'Strict discipline',
      'Conditional approval',
      'Emotional distance',
      'Rigid boundary-setting'
    ],
    strengthsAndResources: [
      'Provides structure',
      'Strong work ethic',
      'Protective instincts',
      'Consistency in expectations'
    ],
    therapeuticRecommendations: [
      'Explore childhood patterns and intergenerational trauma',
      'Develop emotional awareness and attunement',
      'Practice authoritative (not authoritarian) parenting',
      'Work on anxiety management and control issues',
      'Family therapy to improve communication'
    ]
  },
  'neglectful-parent': {
    id: 'neglectful-parent',
    name: 'Neglectful Parent',
    description: 'Emotionally unavailable or physically absent parent',
    emoji: '🌫️',
    psychologicalTraits: [
      'Emotional unavailability',
      'Detachment',
      'Low involvement',
      'Self-centered',
      'Avoidant attachment style'
    ],
    coreWounds: [
      'Unresolved abandonment issues',
      'Lack of secure attachment in own history',
      'Depression or burnout',
      'Inability to prioritize relationships'
    ],
    copingMechanisms: [
      'Emotional withdrawal',
      'Excessive work/activity focus',
      'Denial of needs',
      'Avoidance of intimacy'
    ],
    strengthsAndResources: [
      'May be independent',
      'Professional competence',
      'Self-reliance',
      'Non-intrusive boundaries'
    ],
    therapeuticRecommendations: [
      'Process own attachment trauma',
      'Develop emotional capacity and presence',
      'Increase mindfulness about parenting role',
      'Address depression or burnout',
      'Build secure attachment with children through small consistent acts'
    ]
  },
  'enabling-parent': {
    id: 'enabling-parent',
    name: 'Enabling Parent',
    description: 'Overprotective parent who rescues and removes natural consequences',
    emoji: '🤗',
    psychologicalTraits: [
      'High anxiety',
      'People-pleasing',
      'Low boundaries',
      'Rescue mentality',
      'Codependency patterns'
    ],
    coreWounds: [
      'Own unmet needs from childhood',
      'Anxiety about abandonment',
      'Need to feel needed',
      'Fear of rejection'
    ],
    copingMechanisms: [
      'Overgiving',
      'Removing consequences',
      'Over-involvement',
      'Emotional fusion'
    ],
    strengthsAndResources: [
      'High empathy',
      'Nurturing instincts',
      'Loyalty to family',
      'Willingness to sacrifice'
    ],
    therapeuticRecommendations: [
      'Establish healthy boundaries',
      'Address codependency patterns',
      'Develop self-worth independent of rescuing',
      'Learn to tolerate child\'s discomfort and consequences',
      'Process own childhood deprivation'
    ]
  },
  'dependent-child': {
    id: 'dependent-child',
    name: 'Dependent Child',
    description: 'Child who relies heavily on parent/caregiver, struggles with independence',
    emoji: '🤲',
    psychologicalTraits: [
      'Low self-confidence',
      'Anxiety in separation',
      'Indecisiveness',
      'Submissive behavior',
      'High need for reassurance'
    ],
    coreWounds: [
      'Insecure attachment',
      'Perceived parental abandonment or inconsistency',
      'Early neglect or trauma',
      'Learned helplessness'
    ],
    copingMechanisms: [
      'Compliance and appeasement',
      'Avoidance of challenges',
      'Emotional dependence',
      'Regression when stressed'
    ],
    strengthsAndResources: [
      'Loyalty',
      'Sensitivity to others',
      'Desire for connection',
      'Teachability'
    ],
    therapeuticRecommendations: [
      'Build secure attachment with a consistent caregiver',
      'Gradual exposure to age-appropriate independence',
      'Build self-efficacy through small successes',
      'Trauma-informed therapy if abuse/neglect present',
      'Develop healthy assertiveness'
    ]
  },
  'rebellious-child': {
    id: 'rebellious-child',
    name: 'Rebellious Child',
    description: 'Child who opposes authority and resists control; defiant behavior',
    emoji: '🔥',
    psychologicalTraits: [
      'Defiance',
      'Oppositional behavior',
      'Low compliance',
      'Risk-taking',
      'Anger/frustration issues'
    ],
    coreWounds: [
      'Feeling controlled or powerless',
      'Unmet autonomy needs',
      'Invalidation of feelings',
      'Harsh parenting responses'
    ],
    copingMechanisms: [
      'Active resistance',
      'Rule-breaking',
      'Aggressive responses',
      'Asserting false independence'
    ],
    strengthsAndResources: [
      'Strong sense of self',
      'Independence drive',
      'Leadership potential',
      'Authenticity',
      'Courage to question authority'
    ],
    therapeuticRecommendations: [
      'Recognize legitimacy of autonomy needs',
      'Provide structured choices and control',
      'Address underlying anger/trauma',
      'Develop healthy ways to express independence',
      'Parent-child therapy to improve relationships',
      'Channel strength into positive leadership'
    ]
  },
  'peacekeeper': {
    id: 'peacekeeper',
    name: 'Peacekeeper',
    description: 'Family member who mediates conflicts and suppresses own needs for harmony',
    emoji: '☮️',
    psychologicalTraits: [
      'Conflict avoidance',
      'High empathy',
      'Mediation skills',
      'People-pleasing',
      'Emotional suppression'
    ],
    coreWounds: [
      'Childhood trauma related to conflict',
      'Feeling responsible for family stability',
      'Unprocessed anger',
      'Loss of authentic self'
    ],
    copingMechanisms: [
      'Minimizing conflicts',
      'Sacrificing needs',
      'Over-accommodating others',
      'Emotional numbing'
    ],
    strengthsAndResources: [
      'Strong emotional intelligence',
      'Diplomatic skills',
      'Ability to see multiple perspectives',
      'Stabilizing influence'
    ],
    therapeuticRecommendations: [
      'Process childhood conflict/trauma',
      'Develop authentic voice and assertiveness',
      'Set healthy boundaries',
      'Release false responsibility for family peace',
      'Explore and honor suppressed emotions',
      'Learn healthy conflict resolution'
    ]
  },
  'scapegoat': {
    id: 'scapegoat',
    name: 'Scapegoat',
    description: 'Family member blamed for family problems; identified as the problem',
    emoji: '🐐',
    psychologicalTraits: [
      'Low self-esteem',
      'Shame-based',
      'Self-blame',
      'Acting-out behaviors',
      'Depression/anxiety'
    ],
    coreWounds: [
      'Chronic blame and judgment',
      'Displaced family dysfunction onto self',
      'Invalidation of reality',
      'Rejection and isolation'
    ],
    copingMechanisms: [
      'Acting out to confirm negative identity',
      'Self-harm or risk behaviors',
      'Emotional explosion or withdrawal',
      'Internalized shame'
    ],
    strengthsAndResources: [
      'Often authenticity and honesty',
      'Awareness of family dysfunction',
      'Resilience in adversity',
      'Capacity for deep empathy'
    ],
    therapeuticRecommendations: [
      'Separate identity from family\'s projections',
      'Heal from chronic blame and shame',
      'Develop healthy self-concept',
      'Process family dysfunction realistically',
      'Family therapy if possible',
      'Build supportive community outside family'
    ]
  },
  'hero': {
    id: 'hero',
    name: 'Hero/High Achiever',
    description: 'Family member who excels and overcompensates for family dysfunction',
    emoji: '🦸',
    psychologicalTraits: [
      'High achievement drive',
      'Perfectionism',
      'Responsibility-taking',
      'Workaholic tendencies',
      'Limited emotional expression'
    ],
    coreWounds: [
      'Conditional worth based on achievement',
      'Pressure to fix family problems',
      'Emotional neglect despite recognition',
      'Burnout and exhaustion'
    ],
    copingMechanisms: [
      'Over-achieving',
      'Controlling through success',
      'Emotional distance',
      'Denial of limitations'
    ],
    strengthsAndResources: [
      'Leadership ability',
      'Strong work ethic',
      'Discipline and focus',
      'Ability to inspire others',
      'Competence and reliability'
    ],
    therapeuticRecommendations: [
      'Separate self-worth from achievement',
      'Develop emotional awareness',
      'Set realistic expectations',
      'Process family pressure and expectations',
      'Balance work with relationships and rest',
      'Explore what you truly want vs. what you think you should do'
    ]
  },
  'lost-child': {
    id: 'lost-child',
    name: 'Lost Child',
    description: 'Family member who withdraws and becomes invisible to avoid attention',
    emoji: '🔍',
    psychologicalTraits: [
      'Shyness/withdrawal',
      'Quiet demeanor',
      'Low visibility',
      'Independent but isolated',
      'Limited social skills'
    ],
    coreWounds: [
      'Neglect in crowded or chaotic family',
      'Fear of attention or judgment',
      'Learned invisibility as safety strategy',
      'Loneliness and disconnection'
    ],
    copingMechanisms: [
      'Social withdrawal',
      'Self-entertainment',
      'Avoiding involvement',
      'Emotional detachment'
    ],
    strengthsAndResources: [
      'Self-sufficiency',
      'Ability to entertain themselves',
      'Observation skills',
      'Low demand on others',
      'Inner world richness'
    ],
    therapeuticRecommendations: [
      'Gradual exposure to social connection',
      'Build confidence and social skills',
      'Explore reasons for withdrawal',
      'Develop healthy interdependence',
      'Process loneliness and invisibility',
      'Find safe communities and belongings'
    ]
  },
  'traumatized-adult': {
    id: 'traumatized-adult',
    name: 'Traumatized Adult',
    description: 'Adult carrying unresolved trauma from family history or experiences',
    emoji: '⚔️',
    psychologicalTraits: [
      'Hypervigilance',
      'Emotional dysregulation',
      'Trust issues',
      'PTSD symptoms',
      'Relationship difficulties'
    ],
    coreWounds: [
      'Childhood trauma or abuse',
      'Intergenerational trauma',
      'Loss and grief',
      'Betrayal and violated trust'
    ],
    copingMechanisms: [
      'Avoidance and numbing',
      'Aggression or submission',
      'Relationship patterns repeating trauma',
      'Self-harm or addiction'
    ],
    strengthsAndResources: [
      'Survival strength',
      'Resilience and determination',
      'Capacity for healing',
      'Often deep empathy for others',
      'Meaning-making ability'
    ],
    therapeuticRecommendations: [
      'Trauma-focused therapy (EMDR, CPT, DBT)',
      'Build safety and grounding techniques',
      'Process and integrate trauma memories',
      'Develop emotional regulation skills',
      'Explore how trauma affects current relationships',
      'Build healthy attachment and trust',
      'Community and support networks'
    ]
  },
  'achiever': {
    id: 'achiever',
    name: 'Achiever',
    description: 'Ambitious individual focused on goals and personal development',
    emoji: '🏆',
    psychologicalTraits: [
      'Goal-oriented',
      'Driven',
      'Competitive',
      'Confident',
      'Self-focused'
    ],
    coreWounds: [
      'May hide insecurity beneath success',
      'Fear of failure',
      'Need to prove worth',
      'Pressure to maintain image'
    ],
    copingMechanisms: [
      'Goal pursuit',
      'Image management',
      'Workaholism',
      'Perfectionism'
    ],
    strengthsAndResources: [
      'Motivation and drive',
      'Resilience',
      'Leadership',
      'Success-orientation',
      'Influence on others'
    ],
    therapeuticRecommendations: [
      'Balance achievement with relationships',
      'Explore underlying insecurities',
      'Develop intrinsic motivation',
      'Build emotional intelligence',
      'Find sustainable pace and meaning'
    ]
  },
  'codependent': {
    id: 'codependent',
    name: 'Codependent',
    description: 'Individual with excessive emotional reliance on others; caretaking focus',
    emoji: '🔗',
    psychologicalTraits: [
      'Excessive caregiving',
      'Low boundaries',
      'People-pleasing',
      'Low self-worth',
      'Fear of abandonment'
    ],
    coreWounds: [
      'Childhood role reversal or emotional parentification',
      'Unstable attachment',
      'Unmet needs leading to hypervigilance to others\'s needs',
      'Shame and unworthiness'
    ],
    copingMechanisms: [
      'Controlling through caretaking',
      'Abandoning self for others',
      'Tolerating poor treatment',
      'Enabling dysfunction'
    ],
    strengthsAndResources: [
      'Strong empathy',
      'Loyalty',
      'Caretaking skills',
      'Emotional depth',
      'Desire for connection'
    ],
    therapeuticRecommendations: [
      'Extensive boundary work',
      'Separate identity from role',
      'Address abandonment fears',
      'Build self-love and self-care',
      'Therapy groups (CoDA, ACA)',
      'Explore childhood patterns',
      'Learn healthy interdependence'
    ]
  }
};

export function getProfileTemplate(category: TemplateCategory): ProfileTemplate {
  return PROFILE_TEMPLATES[category];
}

export function getAllTemplateCategories(): TemplateCategory[] {
  return Object.keys(PROFILE_TEMPLATES) as TemplateCategory[];
}
