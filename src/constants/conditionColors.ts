/**
 * Color mappings for psychological and medical conditions
 * Used for visual indicators on genogram nodes
 */

export const CONDITION_COLORS: Record<string, { light: string; dark: string; border: string }> = {
  // Mental Health Conditions
  'depression': { light: '#3b82f6', dark: '#1e40af', border: '#1e3a8a' },
  'anxiety': { light: '#f59e0b', dark: '#b45309', border: '#92400e' },
  'bipolar-disorder': { light: '#8b5cf6', dark: '#5b21b6', border: '#4c1d95' },
  'schizophrenia': { light: '#ec4899', dark: '#be185d', border: '#831843' },
  'ptsd': { light: '#ef4444', dark: '#b91c1c', border: '#7f1d1d' },
  'ocd': { light: '#06b6d4', dark: '#0891b2', border: '#164e63' },
  'adhd': { light: '#f97316', dark: '#c2410c', border: '#7c2d12' },
  'autism': { light: '#14b8a6', dark: '#0d9488', border: '#134e4a' },

  // Substance Use
  'alcoholism': { light: '#a16207', dark: '#78350f', border: '#451a03' },
  'addiction': { light: '#dc2626', dark: '#991b1b', border: '#7f1d1d' },
  'substance-abuse': { light: '#ea580c', dark: '#c2410c', border: '#7c2d12' },

  // Physical Health
  'diabetes': { light: '#d97706', dark: '#b45309', border: '#78350f' },
  'hypertension': { light: '#dc2626', dark: '#991b1b', border: '#7f1d1d' },
  'heart-disease': { light: '#e11d48', dark: '#be185d', border: '#831843' },
  'cancer': { light: '#6b21a8', dark: '#581c87', border: '#3f0f5c' },
  'arthritis': { light: '#64748b', dark: '#475569', border: '#334155' },
  'asthma': { light: '#06b6d4', dark: '#0891b2', border: '#164e63' },

  // Neurological
  'dementia': { light: '#7c3aed', dark: '#6d28d9', border: '#4c1d95' },
  'parkinson': { light: '#8b5cf6', dark: '#7c3aed', border: '#6d28d9' },
  'stroke': { light: '#dc2626', dark: '#991b1b', border: '#7f1d1d' },
  'epilepsy': { light: '#f59e0b', dark: '#d97706', border: '#b45309' },

  // Sleep Disorders
  'insomnia': { light: '#6366f1', dark: '#4f46e5', border: '#4338ca' },
  'sleep-apnea': { light: '#0ea5e9', dark: '#0284c7', border: '#0c4a6e' },

  // Other
  'trauma': { light: '#ef4444', dark: '#dc2626', border: '#991b1b' },
  'grief': { light: '#9333ea', dark: '#7e22ce', border: '#5b21b6' },
  'stress': { light: '#f59e0b', dark: '#d97706', border: '#b45309' },
  'abuse-history': { light: '#e11d48', dark: '#be185d', border: '#831843' },
};

/**
 * Common conditions for quick selection
 */
export const COMMON_CONDITIONS = [
  { value: 'depression', label: 'Depression', category: 'Mental Health' },
  { value: 'anxiety', label: 'Anxiety', category: 'Mental Health' },
  { value: 'bipolar-disorder', label: 'Bipolar Disorder', category: 'Mental Health' },
  { value: 'schizophrenia', label: 'Schizophrenia', category: 'Mental Health' },
  { value: 'ptsd', label: 'PTSD', category: 'Mental Health' },
  { value: 'ocd', label: 'OCD', category: 'Mental Health' },
  { value: 'adhd', label: 'ADHD', category: 'Mental Health' },
  { value: 'autism', label: 'Autism Spectrum', category: 'Mental Health' },
  
  { value: 'alcoholism', label: 'Alcoholism', category: 'Substance Use' },
  { value: 'addiction', label: 'Addiction', category: 'Substance Use' },
  { value: 'substance-abuse', label: 'Substance Abuse', category: 'Substance Use' },
  
  { value: 'diabetes', label: 'Diabetes', category: 'Physical Health' },
  { value: 'hypertension', label: 'Hypertension', category: 'Physical Health' },
  { value: 'heart-disease', label: 'Heart Disease', category: 'Physical Health' },
  { value: 'cancer', label: 'Cancer', category: 'Physical Health' },
  { value: 'arthritis', label: 'Arthritis', category: 'Physical Health' },
  { value: 'asthma', label: 'Asthma', category: 'Physical Health' },
  
  { value: 'dementia', label: 'Dementia', category: 'Neurological' },
  { value: 'parkinson', label: "Parkinson's Disease", category: 'Neurological' },
  { value: 'stroke', label: 'Stroke', category: 'Neurological' },
  { value: 'epilepsy', label: 'Epilepsy', category: 'Neurological' },
  
  { value: 'insomnia', label: 'Insomnia', category: 'Sleep' },
  { value: 'sleep-apnea', label: 'Sleep Apnea', category: 'Sleep' },
  
  { value: 'trauma', label: 'Trauma History', category: 'Psychological' },
  { value: 'grief', label: 'Grief/Loss', category: 'Psychological' },
  { value: 'stress', label: 'Chronic Stress', category: 'Psychological' },
  { value: 'abuse-history', label: 'Abuse History', category: 'Psychological' },
];

/**
 * Condition severity levels
 */
export const SEVERITY_LEVELS = [
  { value: 'mild', label: 'Mild', color: '#fbbf24' },
  { value: 'moderate', label: 'Moderate', color: '#fb923c' },
  { value: 'severe', label: 'Severe', color: '#ef4444' },
  { value: 'critical', label: 'Critical', color: '#991b1b' },
];

/**
 * Condition status types
 */
export const CONDITION_STATUS = [
  { value: 'active', label: 'Active', icon: '🔴' },
  { value: 'managed', label: 'Managed', icon: '🟡' },
  { value: 'remission', label: 'Remission', icon: '🟢' },
  { value: 'resolved', label: 'Resolved', icon: '⚪' },
  { value: 'deceased-cause', label: 'Deceased (Cause)', icon: '⚫' },
];

/**
 * Cause of death categories
 */
export const CAUSE_OF_DEATH = [
  { value: 'natural', label: 'Natural Causes' },
  { value: 'illness', label: 'Illness/Disease' },
  { value: 'accident', label: 'Accident' },
  { value: 'suicide', label: 'Suicide' },
  { value: 'homicide', label: 'Homicide' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'other', label: 'Other' },
];
