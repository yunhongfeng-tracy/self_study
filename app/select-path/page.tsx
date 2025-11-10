'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllLearningPaths, findMatchingPath, setCurrentLearningPath, deleteLearningPath, getQuestionnaireData } from '@/lib/storage';
import { LearningPath } from '@/types';

export default function SelectPathPage() {
  const router = useRouter();
  const [allPaths, setAllPaths] = useState<LearningPath[]>([]);
  const [matchingPath, setMatchingPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const questionnaireData = getQuestionnaireData();

    if (!questionnaireData) {
      router.push('/questionnaire');
      return;
    }

    // 获取所有路径
    const paths = getAllLearningPaths();
    setAllPaths(paths);

    // 查找匹配的路径
    const matched = findMatchingPath(questionnaireData);
    setMatchingPath(matched);

    setLoading(false);
  }, [router]);

  const handleUseExisting = (pathId: string) => {
    setCurrentLearningPath(pathId);
    router.push('/path');
  };

  const handleGenerateNew = () => {
    router.push('/generate');
  };

  const handleDelete = (pathId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个学习方案吗？')) {
      deleteLearningPath(pathId);
      const paths = getAllLearningPaths();
      setAllPaths(paths);

      // 如果删除的是匹配的路径，清除匹配状态
      if (matchingPath?.id === pathId) {
        setMatchingPath(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLevelText = (level: string) => {
    const levels: Record<string, string> = {
      'beginner': '零基础',
      'high-school': '高中物理基础',
      'undergraduate': '大学物理基础',
      'advanced': '深入研究'
    };
    return levels[level] || level;
  };

  const getGoalText = (goal: string) => {
    const goals: Record<string, string> = {
      'exam': '应对考试',
      'interest': '兴趣爱好',
      'research': '学术研究',
      'career': '职业发展'
    };
    return goals[goal] || goal;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="text-2xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">选择学习方案</h1>
        <p className="text-gray-600 mb-8">您可以使用已有的方案，或生成新的个性化学习路径</p>

        {/* 匹配的方案推荐 */}
        {matchingPath && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">⭐</span>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">推荐使用已有方案</h2>
                <p className="text-gray-700 mb-4">我们找到了一个完全匹配您当前需求的学习方案，可以直接使用！</p>

                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">学习目标：</span>
                      <span className="font-medium ml-2">{getGoalText(matchingPath.userProfile.goal)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">当前水平：</span>
                      <span className="font-medium ml-2">{getLevelText(matchingPath.userProfile.currentLevel)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">每日时间：</span>
                      <span className="font-medium ml-2">{matchingPath.userProfile.availableTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">学习方式：</span>
                      <span className="font-medium ml-2">{matchingPath.userProfile.learningStyle?.join('、')}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-gray-500 text-sm">包含：</span>
                    <span className="font-medium ml-2">{matchingPath.stages.length} 个阶段</span>
                    <span className="text-gray-500 mx-2">•</span>
                    <span className="font-medium">{matchingPath.stages.reduce((sum, stage) => sum + stage.topics.length, 0)} 个主题</span>
                    <span className="text-gray-500 mx-2">•</span>
                    <span className="text-gray-500 text-sm">创建于：{formatDate(matchingPath.createdAt)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleUseExisting(matchingPath.id)}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    ✓ 使用这个方案
                  </button>
                  <button
                    onClick={handleGenerateNew}
                    className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    生成新方案
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 所有已有方案 */}
        {allPaths.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {matchingPath ? '其他已有方案' : '所有已有方案'}
              <span className="text-gray-500 text-base font-normal ml-2">({allPaths.length})</span>
            </h2>

            <div className="space-y-4">
              {allPaths.map((path) => (
                <div
                  key={path.id}
                  className={`border rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer ${
                    path.id === matchingPath?.id ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => handleUseExisting(path.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">
                          {path.id === matchingPath?.id ? '⭐' : '📚'}
                        </span>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {getGoalText(path.userProfile.goal)} - {getLevelText(path.userProfile.currentLevel)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            创建于 {formatDate(path.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          每日 {path.userProfile.availableTime}
                        </span>
                        {path.userProfile.learningStyle?.map((style) => (
                          <span key={style} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {style}
                          </span>
                        ))}
                      </div>

                      <div className="text-sm text-gray-600">
                        {path.stages.length} 个阶段 • {' '}
                        {path.stages.reduce((sum, stage) => sum + stage.topics.length, 0)} 个主题 • {' '}
                        已完成 {path.progress.completedTopics.length} 个主题
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(path.id, e)}
                      className="ml-4 text-gray-400 hover:text-red-600 transition-colors text-xl"
                      title="删除此方案"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 生成新方案按钮 */}
        {!matchingPath && (
          <div className="text-center">
            {allPaths.length === 0 && (
              <p className="text-gray-500 mb-6">暂无已保存的学习方案</p>
            )}
            <button
              onClick={handleGenerateNew}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium text-lg"
            >
              🤖 生成新的学习方案
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
