import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface TestResult {
  id?: string;
  userId: string;
  testId: string;
  testName: string;
  answers: Record<string, number>;
  scores: Record<string, number>;
  duration: number; // in seconds
  completedAt: Timestamp;
  interpretation?: string;
}

export interface TestResultWithMetadata extends TestResult {
  id: string;
  createdAt: Date;
}

/**
 * Save test result to Firebase
 */
export const saveTestResult = async (result: Omit<TestResult, 'completedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'testResults'), {
      ...result,
      completedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving test result:', error);
    throw error;
  }
};

/**
 * Get all test results for a specific person in a genogram
 */
export const getPersonTestResults = async (
  userId: string,
  personId: string,
  genogramId: string
): Promise<TestResultWithMetadata[]> => {
  try {
    // Query for results linked to this person
    const q = query(
      collection(db, 'testResults'),
      where('userId', '==', userId),
      where('personId', '==', personId),
      where('genogramId', '==', genogramId),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().completedAt.toDate(),
    })) as TestResultWithMetadata[];
  } catch (error) {
    console.error('Error fetching person test results:', error);
    return [];
  }
};

/**
 * Save test result linked to a specific person in a genogram
 */
export const savePersonTestResult = async (
  result: Omit<TestResult, 'completedAt'> & { 
    personId: string; 
    genogramId: string;
  }
) => {
  try {
    const docRef = await addDoc(collection(db, 'testResults'), {
      ...result,
      completedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving person test result:', error);
    throw error;
  }
};

/**
 * Get all test results for a user
 */
export const getUserTestResults = async (userId: string): Promise<TestResultWithMetadata[]> => {
  try {
    const q = query(
      collection(db, 'testResults'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().completedAt.toDate(),
    })) as TestResultWithMetadata[];
  } catch (error) {
    console.error('Error fetching test results:', error);
    return [];
  }
};

/**
 * Get all results for a specific test type
 */
export const getTestResultsByType = async (
  userId: string,
  testId: string
): Promise<TestResultWithMetadata[]> => {
  try {
    const q = query(
      collection(db, 'testResults'),
      where('userId', '==', userId),
      where('testId', '==', testId),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().completedAt.toDate(),
    })) as TestResultWithMetadata[];
  } catch (error) {
    console.error('Error fetching test results by type:', error);
    return [];
  }
};

/**
 * Update test result interpretation
 */
export const updateTestInterpretation = async (
  resultId: string,
  interpretation: string
) => {
  try {
    const docRef = doc(db, 'testResults', resultId);
    await updateDoc(docRef, {
      interpretation,
    });
  } catch (error) {
    console.error('Error updating test interpretation:', error);
    throw error;
  }
};

/**
 * Calculate Big Five scores from answers
 */
export const calculateBigFiveScores = (answers: Record<string, number>) => {
  const reverseScoreQuestions = ['bf-6']; // "I am reserved" - extraversion reverse
  
  let extraversion = 0;
  let agreeableness = 0;
  let conscientiousness = 0;
  let neuroticism = 0;
  let openness = 0;

  // Extraversion: questions 1, 6
  extraversion += reverseScoreQuestions.includes('bf-1') ? 6 - answers['bf-1'] : answers['bf-1'];
  extraversion += reverseScoreQuestions.includes('bf-6') ? 6 - answers['bf-6'] : answers['bf-6'];

  // Agreeableness: questions 2, 7
  agreeableness += reverseScoreQuestions.includes('bf-2') ? 6 - answers['bf-2'] : answers['bf-2'];
  agreeableness += reverseScoreQuestions.includes('bf-7') ? 6 - answers['bf-7'] : answers['bf-7'];

  // Conscientiousness: questions 3, 8
  conscientiousness += reverseScoreQuestions.includes('bf-3') ? 6 - answers['bf-3'] : answers['bf-3'];
  conscientiousness += reverseScoreQuestions.includes('bf-8') ? 6 - answers['bf-8'] : answers['bf-8'];

  // Neuroticism: questions 4, 9
  neuroticism += reverseScoreQuestions.includes('bf-4') ? 6 - answers['bf-4'] : answers['bf-4'];
  neuroticism += reverseScoreQuestions.includes('bf-9') ? 6 - answers['bf-9'] : answers['bf-9'];

  // Openness: questions 5, 10
  openness += reverseScoreQuestions.includes('bf-5') ? 6 - answers['bf-5'] : answers['bf-5'];
  openness += reverseScoreQuestions.includes('bf-10') ? 6 - answers['bf-10'] : answers['bf-10'];

  return {
    extraversion: Math.round((extraversion / 10) * 100),
    agreeableness: Math.round((agreeableness / 10) * 100),
    conscientiousness: Math.round((conscientiousness / 10) * 100),
    neuroticism: Math.round((neuroticism / 10) * 100),
    openness: Math.round((openness / 10) * 100),
  };
};

/**
 * Calculate MBTI result from answers
 */
export const calculateMBTIResult = (answers: Record<string, number>) => {
  // Map answers to MBTI dimensions
  const ei = answers['mbti-1'] + answers['mbti-5'];
  const sn = answers['mbti-2'] + answers['mbti-6'];
  const tf = answers['mbti-3'] + answers['mbti-7'];
  const jp = answers['mbti-4'] + answers['mbti-8'];

  const result = {
    introversion_extraversion: Math.round((ei / 10) * 100),
    sensing_intuition: Math.round((sn / 10) * 100),
    thinking_feeling: Math.round((tf / 10) * 100),
    judging_perceiving: Math.round((jp / 10) * 100),
  };

  return result;
};

/**
 * Calculate DISC result from answers
 */
export const calculateDISCResult = (answers: Record<string, number>) => {
  let dominance = 0;
  let influence = 0;
  let steadiness = 0;
  let conscientiousness = 0;

  // D: Direct, results-oriented - questions 1, 5
  dominance = (answers['disc-1'] + answers['disc-5']) / 2;
  // I: Influential, outgoing - questions 2, 6
  influence = (answers['disc-2'] + answers['disc-6']) / 2;
  // S: Steady, reliable - questions 3, 7
  steadiness = (answers['disc-3'] + answers['disc-7']) / 2;
  // C: Conscientious, detailed - questions 4, 8
  conscientiousness = (answers['disc-4'] + answers['disc-8']) / 2;

  return {
    dominance: Math.round(dominance * 20),
    influence: Math.round(influence * 20),
    steadiness: Math.round(steadiness * 20),
    conscientiousness: Math.round(conscientiousness * 20),
  };
};

/**
 * Calculate Attachment Style result from answers
 */
export const calculateAttachmentResult = (answers: Record<string, number>) => {
  let secure = 0;
  let anxious = 0;
  let dismissive = 0;
  let fearful = 0;

  // Secure: comfortable with intimacy - questions 2, 4
  secure = (answers['att-2'] + answers['att-4']) / 2;
  // Anxious: needs reassurance - questions 1, 3, 6
  anxious = (answers['att-1'] + answers['att-3'] + answers['att-6']) / 3;
  // Dismissive: avoids closeness - questions 5, 7
  dismissive = (answers['att-5'] + answers['att-7']) / 2;
  // Fearful: conflicted - questions 8, 9
  fearful = (answers['att-8'] + answers['att-9']) / 2;

  // Normalize to 0-100
  return {
    secure: Math.round(secure * 20),
    anxious: Math.round(anxious * 20),
    dismissive: Math.round(dismissive * 20),
    fearful: Math.round(fearful * 20),
  };
};

/**
 * Calculate DASS-21 result from answers
 */
export const calculateDASSResult = (answers: Record<string, number>) => {
  let depression = 0;
  let anxiety = 0;
  let stress = 0;

  // Depression: questions 3, 5, 10, 13, 14, 16, 17 (0-indexed)
  depression =
    (answers['dass-3'] +
      answers['dass-5'] +
      answers['dass-10'] +
      answers['dass-13'] +
      answers['dass-14'] +
      answers['dass-16'] +
      answers['dass-17']) *
    2;

  // Anxiety: questions 2, 4, 7, 8, 12, 15, 18 (0-indexed)
  anxiety =
    (answers['dass-2'] +
      answers['dass-4'] +
      answers['dass-7'] +
      answers['dass-8'] +
      answers['dass-12'] +
      answers['dass-15'] +
      answers['dass-20']) *
    2;

  // Stress: questions 1, 6, 11, 19, 21 (0-indexed)
  stress =
    (answers['dass-1'] +
      answers['dass-6'] +
      answers['dass-11'] +
      answers['dass-19'] +
      answers['dass-21']) *
    2;

  return {
    depression: Math.min(depression, 126),
    anxiety: Math.min(anxiety, 126),
    stress: Math.min(stress, 126),
  };
};

/**
 * Get severity level for DASS-21
 */
export const getDASSLevel = (
  score: number,
  type: 'depression' | 'anxiety' | 'stress'
): string => {
  const ranges: Record<string, { min: number; max: number }[]> = {
    depression: [
      { min: 0, max: 9 },
      { min: 10, max: 13 },
      { min: 14, max: 20 },
      { min: 21, max: 27 },
      { min: 28, max: 126 },
    ],
    anxiety: [
      { min: 0, max: 7 },
      { min: 8, max: 9 },
      { min: 10, max: 14 },
      { min: 15, max: 19 },
      { min: 20, max: 126 },
    ],
    stress: [
      { min: 0, max: 14 },
      { min: 15, max: 18 },
      { min: 19, max: 25 },
      { min: 26, max: 33 },
      { min: 34, max: 126 },
    ],
  };

  const levels = ['Normal', 'Mild', 'Moderate', 'Severe', 'Extremely Severe'];
  const range = ranges[type] || ranges.depression;

  for (let i = 0; i < range.length; i++) {
    if (score >= range[i].min && score <= range[i].max) {
      return levels[i];
    }
  }

  return 'Unknown';
};
