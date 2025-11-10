// 用户学习资料类型定义

export interface UserProfile {
  currentLevel: 'zero' | 'high-school' | 'college' | 'advanced';
  goal: 'gaokao' | 'postgrad' | 'interest' | 'other';
  availableTime: '<1h' | '1-2h' | '2h+';
  learningStyle: ('video' | 'book' | 'interactive')[];
}

export interface Resource {
  type: 'video' | 'book' | 'article' | 'interactive';
  title: string;
  url?: string;
  description: string;
  estimatedTime: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  recommended: boolean;
}

export interface Topic {
  id: string;
  name: string;
  concepts: string[];
  resources: Resource[];
  completed: boolean;
  notes?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface Stage {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string;
  prerequisites: string[];
  topics: Topic[];
  order: number;
}

export interface Progress {
  currentStageId: string;
  currentTopicId: string;
  completedStages: string[];
  completedTopics: string[];
  startDate: string;
  estimatedEndDate: string;
}

export interface LearningPath {
  id: string;
  userId: string;
  subject: 'physics';
  createdAt: string;
  updatedAt: string;
  userProfile: UserProfile;
  stages: Stage[];
  progress: Progress;
}

export interface QuestionnaireData {
  goal?: string;
  currentLevel?: string;
  availableTime?: string;
  learningStyle?: string[];
}
