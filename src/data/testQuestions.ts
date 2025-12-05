export interface TestQuestion {
  id: string;
  text: string;
  options: Array<{
    value: number;
    label: string;
  }>;
}

export interface TestData {
  id: string;
  name: string;
  description: string;
  duration: number;
  questionCount: number;
  questions: TestQuestion[];
  scoringGuide: Record<string, {
    min: number;
    max: number;
    label: string;
    description: string;
  }>;
}

// Big Five Personality Test
export const bigFiveTest: TestData = {
  id: 'big-five',
  name: 'Big Five Personality',
  description: 'Assess your personality across five major dimensions',
  duration: 10,
  questionCount: 50,
  questions: [
    {
      id: 'bf-1',
      text: 'I am the life of the party.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'bf-2',
      text: 'I feel little concern for others.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'bf-3',
      text: 'I am always prepared.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'bf-4',
      text: 'I am depressed, blue.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'bf-5',
      text: 'I am original, come up with new ideas.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'bf-6',
      text: 'I am reserved.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'bf-7',
      text: 'I help others at the expense of myself.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'bf-8',
      text: 'I can be somewhat careless.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'bf-9',
      text: 'I am relaxed, handle stress well.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'bf-10',
      text: 'I am curious about many different things.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
  ],
  scoringGuide: {
    openness: {
      min: 10,
      max: 50,
      label: 'Openness to Experience',
      description: 'Reflects curiosity, creativity, and appreciation for art and ideas',
    },
    conscientiousness: {
      min: 10,
      max: 50,
      label: 'Conscientiousness',
      description: 'Relates to organization, discipline, and dependability',
    },
    extraversion: {
      min: 10,
      max: 50,
      label: 'Extraversion',
      description: 'Indicates sociability, energy, and positive emotions',
    },
    agreeableness: {
      min: 10,
      max: 50,
      label: 'Agreeableness',
      description: 'Reflects compassion, cooperativeness, and empathy',
    },
    neuroticism: {
      min: 10,
      max: 50,
      label: 'Neuroticism',
      description: 'Indicates emotional stability and tendency to experience negative emotions',
    },
  },
};

// MBTI - Myers-Briggs Type Indicator (simplified 16-question version)
export const mbtiTest: TestData = {
  id: 'mbti',
  name: 'Myers-Briggs Type Indicator',
  description: 'Discover your personality type based on cognitive preferences',
  duration: 8,
  questionCount: 16,
  questions: [
    {
      id: 'mbti-1',
      text: 'At a party, do you interact with many, including strangers (E) or interact with a few, known to you (I)?',
      options: [
        { value: 1, label: 'Strongly - Many (E)' },
        { value: 2, label: 'Somewhat - Many (E)' },
        { value: 4, label: 'Somewhat - Few (I)' },
        { value: 5, label: 'Strongly - Few (I)' },
      ],
    },
    {
      id: 'mbti-2',
      text: 'Do you prefer focusing on the world of ideas (N) or the world of concrete facts (S)?',
      options: [
        { value: 1, label: 'Strongly - Ideas (N)' },
        { value: 2, label: 'Somewhat - Ideas (N)' },
        { value: 4, label: 'Somewhat - Facts (S)' },
        { value: 5, label: 'Strongly - Facts (S)' },
      ],
    },
    {
      id: 'mbti-3',
      text: 'When making decisions, do you prioritize logic (T) or people/values (F)?',
      options: [
        { value: 1, label: 'Strongly - Logic (T)' },
        { value: 2, label: 'Somewhat - Logic (T)' },
        { value: 4, label: 'Somewhat - Values (F)' },
        { value: 5, label: 'Strongly - Values (F)' },
      ],
    },
    {
      id: 'mbti-4',
      text: 'Do you prefer a structured lifestyle (J) or a flexible lifestyle (P)?',
      options: [
        { value: 1, label: 'Strongly - Structured (J)' },
        { value: 2, label: 'Somewhat - Structured (J)' },
        { value: 4, label: 'Somewhat - Flexible (P)' },
        { value: 5, label: 'Strongly - Flexible (P)' },
      ],
    },
    {
      id: 'mbti-5',
      text: 'After a busy day, do you feel energized (E) or drained (I)?',
      options: [
        { value: 1, label: 'Strongly - Energized (E)' },
        { value: 2, label: 'Somewhat - Energized (E)' },
        { value: 4, label: 'Somewhat - Drained (I)' },
        { value: 5, label: 'Strongly - Drained (I)' },
      ],
    },
    {
      id: 'mbti-6',
      text: 'Do you trust intuition (N) or past experience (S) more?',
      options: [
        { value: 1, label: 'Strongly - Intuition (N)' },
        { value: 2, label: 'Somewhat - Intuition (N)' },
        { value: 4, label: 'Somewhat - Experience (S)' },
        { value: 5, label: 'Strongly - Experience (S)' },
      ],
    },
    {
      id: 'mbti-7',
      text: 'Do you find it easier to compliment (F) or criticize (T)?',
      options: [
        { value: 1, label: 'Strongly - Compliment (F)' },
        { value: 2, label: 'Somewhat - Compliment (F)' },
        { value: 4, label: 'Somewhat - Criticize (T)' },
        { value: 5, label: 'Strongly - Criticize (T)' },
      ],
    },
    {
      id: 'mbti-8',
      text: 'Do you prefer keeping lists (J) or going with the flow (P)?',
      options: [
        { value: 1, label: 'Strongly - Lists (J)' },
        { value: 2, label: 'Somewhat - Lists (J)' },
        { value: 4, label: 'Somewhat - Flow (P)' },
        { value: 5, label: 'Strongly - Flow (P)' },
      ],
    },
  ],
  scoringGuide: {
    introversionExtraversion: {
      min: 0,
      max: 100,
      label: 'Introversion vs Extraversion',
      description: 'Measures where you fall on the introversion-extraversion spectrum',
    },
    sensingIntuition: {
      min: 0,
      max: 100,
      label: 'Sensing vs Intuition',
      description: 'Reflects how you perceive and process information',
    },
    thinkingFeeling: {
      min: 0,
      max: 100,
      label: 'Thinking vs Feeling',
      description: 'Shows your preference in decision-making style',
    },
    judgingPerceiving: {
      min: 0,
      max: 100,
      label: 'Judging vs Perceiving',
      description: 'Indicates your lifestyle and organizational preferences',
    },
  },
};

// DISC Assessment
export const discTest: TestData = {
  id: 'disc',
  name: 'DISC Assessment',
  description: 'Evaluate your behavioral style and communication patterns',
  duration: 10,
  questionCount: 24,
  questions: [
    {
      id: 'disc-1',
      text: 'I am a direct, results-oriented person.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'disc-2',
      text: 'I enjoy inspiring and motivating others.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'disc-3',
      text: 'I am patient and steady in my approach.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'disc-4',
      text: 'I pay close attention to details and accuracy.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'disc-5',
      text: 'I challenge the status quo and seek improvements.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'disc-6',
      text: 'People describe me as optimistic and enthusiastic.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'disc-7',
      text: 'I prefer harmony and avoiding conflict.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'disc-8',
      text: 'I focus on processes and procedures.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
  ],
  scoringGuide: {
    dominance: {
      min: 0,
      max: 100,
      label: 'Dominance (D)',
      description: 'Direct, results-oriented, competitive, and decisive',
    },
    influence: {
      min: 0,
      max: 100,
      label: 'Influence (I)',
      description: 'Outgoing, enthusiastic, persuasive, and people-oriented',
    },
    steadiness: {
      min: 0,
      max: 100,
      label: 'Steadiness (S)',
      description: 'Patient, reliable, cooperative, and supportive',
    },
    conscientiousness: {
      min: 0,
      max: 100,
      label: 'Conscientiousness (C)',
      description: 'Detail-oriented, analytical, accurate, and systematic',
    },
  },
};

// Attachment Style Assessment
export const attachmentTest: TestData = {
  id: 'attachment',
  name: 'Attachment Style Assessment',
  description: 'Understand your romantic and relational attachment patterns',
  duration: 8,
  questionCount: 18,
  questions: [
    {
      id: 'att-1',
      text: 'I need a lot of reassurance from my partner.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'att-2',
      text: 'I feel comfortable being intimate with others.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'att-3',
      text: 'I worry that my partner does not really love me.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'att-4',
      text: 'I am comfortable depending on others.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'att-5',
      text: 'I prefer not to show a partner how I feel deep down.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'att-6',
      text: 'I am afraid of losing my partner.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'att-7',
      text: 'I am comfortable without close emotional bonds.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'att-8',
      text: 'I find it difficult to trust others.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
    {
      id: 'att-9',
      text: 'My partner makes me doubt myself.',
      options: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' },
      ],
    },
  ],
  scoringGuide: {
    secure: {
      min: 0,
      max: 100,
      label: 'Secure Attachment',
      description: 'Comfortable with intimacy, confident in relationships',
    },
    anxious: {
      min: 0,
      max: 100,
      label: 'Anxious Attachment',
      description: 'Seeks reassurance, fears abandonment, needs closeness',
    },
    dismissive: {
      min: 0,
      max: 100,
      label: 'Dismissive-Avoidant',
      description: 'Uncomfortable with closeness, values independence',
    },
    fearful: {
      min: 0,
      max: 100,
      label: 'Fearful-Avoidant',
      description: 'Conflicted about relationships, fears both closeness and abandonment',
    },
  },
};

// DASS-21 (Depression, Anxiety, Stress Scale)
export const dass21Test: TestData = {
  id: 'dass-21',
  name: 'DASS-21 Assessment',
  description: 'Screen for depression, anxiety, and stress levels',
  duration: 5,
  questionCount: 21,
  questions: [
    {
      id: 'dass-1',
      text: 'I found it hard to wind down.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-2',
      text: 'I was aware of dryness of my mouth.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-3',
      text: 'I could not experience positive feelings at all.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-4',
      text: 'I experienced breathing difficulty.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-5',
      text: 'I found it difficult to work up the initiative to do things.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-6',
      text: 'I tended to over-react to situations.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-7',
      text: 'I experienced trembling.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-8',
      text: 'I was worried about situations in which I might panic.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-9',
      text: 'I was unable to relax.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-10',
      text: 'I felt downhearted and blue.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-11',
      text: 'I was intolerant of anything that kept me from getting on with what I was doing.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-12',
      text: 'I felt I was close to panic.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-13',
      text: 'I was not interested in other people.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-14',
      text: 'I felt I was worthless.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-15',
      text: 'I felt I was rather irritable.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-16',
      text: 'I felt I was not worth much as a person.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-17',
      text: 'I felt that life was meaningless.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-18',
      text: 'I found it hard to wind down.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-19',
      text: 'I was intolerant of interruptions.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-20',
      text: 'I was in a state of upset.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
    {
      id: 'dass-21',
      text: 'I felt I was not in control of my thoughts.',
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree' },
        { value: 2, label: 'Applied to me to a considerable degree' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
      ],
    },
  ],
  scoringGuide: {
    depression: {
      min: 0,
      max: 63,
      label: 'Depression',
      description: 'Measures symptoms of depression including hopelessness and anhedonia',
    },
    anxiety: {
      min: 0,
      max: 63,
      label: 'Anxiety',
      description: 'Assesses anxiety symptoms including worry and panic',
    },
    stress: {
      min: 0,
      max: 63,
      label: 'Stress',
      description: 'Evaluates stress levels including irritability and tension',
    },
  },
};

// Export all tests
export const allTests: TestData[] = [
  bigFiveTest,
  mbtiTest,
  discTest,
  attachmentTest,
  dass21Test,
];

// Helper function to get test by ID
export const getTestById = (testId: string): TestData | undefined => {
  return allTests.find((test) => test.id === testId);
};
