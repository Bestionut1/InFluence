/**
 * FAZA 1: Arhitectura Datelor - Temporal Models
 * 
 * Definește structurile de bază pentru logica temporală în genogramă.
 * Suportă:
 * - Estimări de dată cu grad de încredere
 * - Calcule retroactive de dată de naștere
 * - Validări de sănătate (sanity checks)
 */

/**
 * FuzzyDate: O dată care poate fi exactă, calculată sau inferată
 * 
 * Exemplu: 
 * - { year: 1954, isEstimated: false, reliability: 'EXACT' } -> "1954"
 * - { year: 1950, isEstimated: true, reliability: 'INFERRED' } -> "~1950"
 */
export interface FuzzyDate {
  year: number;
  month?: number; // 1-12, optional
  day?: number;   // 1-31, optional
  isEstimated: boolean;
  reliability: 'EXACT' | 'CALCULATED' | 'INFERRED';
}

/**
 * Formează stringul pentru FuzzyDate
 * Dacă reliability != 'EXACT', adaugă prefixul ~
 */
export const formatFuzzyDate = (date: FuzzyDate | null | undefined): string => {
  if (!date) return 'Unknown';
  
  const prefix = date.reliability !== 'EXACT' ? '~' : '';
  
  if (date.day && date.month) {
    const d = String(date.day).padStart(2, '0');
    const m = String(date.month).padStart(2, '0');
    return `${prefix}${d}.${m}.${date.year}`;
  }
  
  if (date.month) {
    const m = String(date.month).padStart(2, '0');
    return `${prefix}${m}.${date.year}`;
  }
  
  return `${prefix}${date.year}`;
};

/**
 * Tip de input pentru dată personală
 * - DATE: Utilizatorul a introdus data exactă
 * - AGE_CURRENT: Utilizatorul a introdus vârsta curentă
 * - AGE_AT_DEATH: Utilizatorul a introdus vârsta la moarte
 */
export type DateInputMode = 'DATE' | 'AGE_CURRENT' | 'AGE_AT_DEATH';

/**
 * Extended Person cu câmpuri temporale
 * 
 * Fluxul de date:
 * 1. Utilizatorul selectează inputMode și introduceNumericValue
 * 2. Sistema calculează computedBirthDate și computedDeathDate
 * 3. layoutEngine folosește aceste date pentru poziționare
 */
export interface PersonTemporal {
  // Identitate de bază
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary' | 'unknown';
  status: 'living' | 'deceased' | 'pregnant' | 'miscarriage' | 'stillbirth' | 'abortion';
  
  // INPUT: Cum a introdus utilizatorul data
  inputMode?: DateInputMode;
  numericValue?: number; // Vârsta sau anul
  referenceYear?: number; // Anul morții (pentru AGE_AT_DEATH)
  
  // OUTPUT: Calculat de sistem
  computedBirthDate?: FuzzyDate;
  computedDeathDate?: FuzzyDate;
  
  // Metadata
  lastCalculatedAt?: number; // Timestamp când au fost calculate datele
  calculationMethod?: 'DIRECT_INPUT' | 'INFERRED_FROM_CHILDREN' | 'INFERRED_FROM_PARENT' | 'ESTIMATED';
}

/**
 * Tipuri de relații structurale
 */
export type RelationStructureType = 
  | 'BIOLOGICAL_PARENT_CHILD'
  | 'ADOPTED_PARENT_CHILD'
  | 'FOSTER_PARENT_CHILD'
  | 'STEP_PARENT_CHILD'
  | 'MARRIAGE' // Cuplu oficial
  | 'PARTNERSHIP' // Cuplu neoficial
  | 'SIBLING' // Fraternitate (autogenerat din UnionNode)
  | 'TWIN'; // Gemeni (autogenerat din detectare automată)

/**
 * Dinamica relației (Stratul Emoțional)
 * - Suportă schimbări în timp (history)
 * - Suportă direcționalitate pentru relații speciale
 */
export type RelationDynamicsStatus = 
  | 'CLOSE'
  | 'DISTANT'
  | 'CONFLICTED'
  | 'HOSTILE'
  | 'ABUSIVE'
  | 'ENMESHED'
  | 'FUSED'
  | 'ONE_SIDED_LOVE'
  | 'NEUTRAL'
  | 'UNKNOWN';

/**
 * Direcția relației (pentru relații speciale)
 */
export type RelationDirection = 'BIDIRECTIONAL' | 'FROM_A_TO_B' | 'FROM_B_TO_A';

/**
 * Înregistrare istorică a unei dinamici
 */
export interface DynamicsHistoryEntry {
  status: RelationDynamicsStatus;
  startDate: number; // Timestamp
  endDate?: number; // Timestamp - undefined dacă e curent
  notes?: string;
}

/**
 * Dinamica unei relații (Stratul Emoțional - MUTABIL)
 */
export interface RelationDynamics {
  currentStatus: RelationDynamicsStatus;
  statusStartDate: number; // Timestamp
  direction: RelationDirection;
  history: DynamicsHistoryEntry[];
  notes?: string;
  strength?: 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';
}

/**
 * Structura unei relații (Stratul Structural - IMUABIL)
 * 
 * Nota: Pentru relații de tip MARRIAGE/PARTNERSHIP, se crează automat un UnionNode
 */
export interface RelationStructure {
  id: string;
  type: RelationStructureType;
  
  // Pentru relații standard
  sourcePersonId?: string; // Primul participant (ex: mama)
  targetPersonId?: string; // Al doilea participant (ex: copilul)
  
  // Pentru cuplu - se crează UnionNode
  unionId?: string; // ID-ul nodului virtual de cuplu
  isTwin?: boolean; // True dacă sunt gemeni (detectat automat)
  twinType?: 'IDENTICAL' | 'FRATERNAL' | 'UNKNOWN'; // Doar dacă isTwin=true
  
  // Metadata
  createdAt: number; // Timestamp
  createdByUserId?: string;
}

/**
 * Union Node: Nod virtual pentru cuplu
 * 
 * Scopul: Să se creeze automat când utilizatorul adaugă relație MARRIAGE/PARTNERSHIP.
 * De ce? Pentru că în genogramă, copiii unui cuplu se leagă de cuplu (ca nod virtual),
 * nu de părinți individuali. Asta face layout-ul mult mai clean.
 * 
 * Exemplu visual:
 * ```
 *      [Mama] ---- [UnionNode] ---- [Tata]
 *                      |
 *           +----------+----------+
 *           |          |          |
 *        [Copil1]  [Copil2]  [Copil3]
 * ```
 */
export interface UnionNode {
  id: string; // Generat automat
  members: string[]; // Array de personId (de obicei 2, dar suportă polyamory)
  status: 'MARRIED' | 'PARTNERSHIP' | 'DIVORCED' | 'DISSOLVED';
  marriageDate?: FuzzyDate;
  divorceDate?: FuzzyDate;
  children: string[]; // Array de personId - copiii acestui cuplu
  notes?: string;
  createdAt: number;
}

/**
 * Extended Relation cu structură + dinamică
 */
export interface RelationExtended {
  structure: RelationStructure;
  dynamics: RelationDynamics;
}

/**
 * Configurații globale pentru temporal inference
 */
export interface TemporalEngineConfig {
  GENERATION_OFFSET: number; // Default: 30 ani - diferența mediană între generații
  MIN_PARENT_CHILD_AGE: number; // Default: 12 ani
  MAX_PARENT_CHILD_AGE: number; // Default: 70 ani
  CURRENT_YEAR: number; // Actualizat la construirea motorului
  WARNING_THRESHOLD_LOW: number; // Default: 12 ani
  WARNING_THRESHOLD_HIGH: number; // Default: 70 ani
}

/**
 * Rezultat al validării de sănătate
 */
export interface SanityCheckResult {
  isValid: boolean;
  warnings: SanityWarning[];
  errors: SanityError[];
}

export interface SanityWarning {
  type: 'AGE_GAP_TOO_SMALL' | 'AGE_GAP_TOO_LARGE' | 'FUTURE_BIRTH' | 'ILLOGICAL_SIBLING_ORDER';
  personId?: string;
  relatedPersonId?: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SanityError {
  type: 'INVALID_DATE' | 'CHILD_OLDER_THAN_PARENT' | 'DEATH_BEFORE_BIRTH' | 'CIRCULAR_RELATION';
  personId?: string;
  relatedPersonId?: string;
  message: string;
}
