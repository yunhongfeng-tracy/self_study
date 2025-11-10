// 本地存储工具

import { LearningPath, QuestionnaireData } from '@/types';

const STORAGE_KEYS = {
  LEARNING_PATH: 'learning_path', // 当前使用的学习路径
  LEARNING_PATHS: 'learning_paths', // 所有已生成的学习路径列表
  QUESTIONNAIRE: 'questionnaire_data',
  USER_API_KEY: 'user_api_key',
};

// 保存学习路径（保存为当前使用的路径，同时添加到路径列表）
export function saveLearningPath(path: LearningPath): void {
  if (typeof window === 'undefined') return;

  try {
    // 保存为当前路径
    localStorage.setItem(STORAGE_KEYS.LEARNING_PATH, JSON.stringify(path));

    // 同时添加到路径列表
    const paths = getAllLearningPaths();
    const existingIndex = paths.findIndex(p => p.id === path.id);

    if (existingIndex >= 0) {
      // 更新已存在的路径
      paths[existingIndex] = path;
    } else {
      // 添加新路径
      paths.unshift(path); // 最新的放在最前面
    }

    localStorage.setItem(STORAGE_KEYS.LEARNING_PATHS, JSON.stringify(paths));
  } catch (error) {
    console.error('保存学习路径失败:', error);
  }
}

// 获取学习路径
export function getLearningPath(): LearningPath | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEARNING_PATH);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('读取学习路径失败:', error);
    return null;
  }
}

// 更新进度
export function updateProgress(stageId: string, topicId: string, completed: boolean): void {
  const path = getLearningPath();
  if (!path) return;

  // 更新 topic 完成状态
  for (const stage of path.stages) {
    for (const topic of stage.topics) {
      if (topic.id === topicId) {
        topic.completed = completed;

        // 更新进度记录
        if (completed && !path.progress.completedTopics.includes(topicId)) {
          path.progress.completedTopics.push(topicId);
        } else if (!completed) {
          path.progress.completedTopics = path.progress.completedTopics.filter(
            id => id !== topicId
          );
        }
      }
    }
  }

  // 检查整个 stage 是否完成
  for (const stage of path.stages) {
    const allCompleted = stage.topics.every(t => t.completed);
    if (allCompleted && !path.progress.completedStages.includes(stage.id)) {
      path.progress.completedStages.push(stage.id);
    }
  }

  path.updatedAt = new Date().toISOString();
  saveLearningPath(path);
}

// 保存问卷数据
export function saveQuestionnaireData(data: QuestionnaireData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONNAIRE, JSON.stringify(data));
  } catch (error) {
    console.error('保存问卷数据失败:', error);
  }
}

// 获取问卷数据
export function getQuestionnaireData(): QuestionnaireData | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONNAIRE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('读取问卷数据失败:', error);
    return null;
  }
}

// 保存 API Key
export function saveApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.USER_API_KEY, apiKey);
  } catch (error) {
    console.error('保存API Key失败:', error);
  }
}

// 获取 API Key
export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(STORAGE_KEYS.USER_API_KEY);
  } catch (error) {
    console.error('读取API Key失败:', error);
    return null;
  }
}

// 获取所有学习路径列表
export function getAllLearningPaths(): LearningPath[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEARNING_PATHS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('读取学习路径列表失败:', error);
    return [];
  }
}

// 根据ID获取特定的学习路径
export function getLearningPathById(id: string): LearningPath | null {
  const paths = getAllLearningPaths();
  return paths.find(p => p.id === id) || null;
}

// 删除指定的学习路径
export function deleteLearningPath(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const paths = getAllLearningPaths();
    const filteredPaths = paths.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.LEARNING_PATHS, JSON.stringify(filteredPaths));

    // 如果删除的是当前路径，清除当前路径
    const currentPath = getLearningPath();
    if (currentPath?.id === id) {
      localStorage.removeItem(STORAGE_KEYS.LEARNING_PATH);
    }
  } catch (error) {
    console.error('删除学习路径失败:', error);
  }
}

// 设置当前使用的学习路径
export function setCurrentLearningPath(id: string): boolean {
  const path = getLearningPathById(id);
  if (path) {
    saveLearningPath(path);
    return true;
  }
  return false;
}

// 检查是否有匹配的缓存路径
export function findMatchingPath(questionnaireData: QuestionnaireData): LearningPath | null {
  const paths = getAllLearningPaths();

  // 查找完全匹配的路径（目标、水平、时间、学习方式都一致）
  return paths.find(path => {
    const profile = path.userProfile;
    return (
      profile.goal === questionnaireData.goal &&
      profile.currentLevel === questionnaireData.currentLevel &&
      profile.availableTime === questionnaireData.availableTime &&
      JSON.stringify(profile.learningStyle?.sort()) === JSON.stringify(questionnaireData.learningStyle?.sort())
    );
  }) || null;
}

// 清除所有数据
export function clearAllData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.LEARNING_PATH);
    localStorage.removeItem(STORAGE_KEYS.LEARNING_PATHS);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONNAIRE);
  } catch (error) {
    console.error('清除数据失败:', error);
  }
}
