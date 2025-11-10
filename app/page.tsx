'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLearningPath, getAllLearningPaths } from '@/lib/storage';
import { LearningPath } from '@/types';

export default function Home() {
  const router = useRouter();
  const [existingPath, setExistingPath] = useState<LearningPath | null>(null);
  const [allPathsCount, setAllPathsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查是否已有学习路径
    const path = getLearningPath();
    setExistingPath(path);

    // 获取所有方案数量
    const allPaths = getAllLearningPaths();
    setAllPathsCount(allPaths.length);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  // 如果已有学习路径，显示继续学习
  if (existingPath) {
    const totalTopics = existingPath.stages.reduce(
      (sum, stage) => sum + stage.topics.length,
      0
    );
    const completedTopics = existingPath.progress.completedTopics.length;
    const progress = Math.round((completedTopics / totalTopics) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            欢迎回来！
          </h2>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">你的学习进度</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              已完成 {completedTopics} / {totalTopics} 个主题 ({progress}%)
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/path')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              继续学习
            </button>

            {allPathsCount > 1 && (
              <button
                onClick={() => router.push('/select-path')}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                查看所有方案 ({allPathsCount})
              </button>
            )}

            <button
              onClick={() => router.push('/questionnaire')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              创建新的学习方案
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 新用户，显示欢迎页面
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          开始你的物理学习之旅
        </h2>

        <p className="text-lg text-gray-600 mb-8">
          通过AI对话，获得专属的个性化学习路径和优质资源推荐
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-blue-50 rounded-lg">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900 mb-2">快速问卷</h3>
            <p className="text-sm text-gray-600">
              3个问题了解你的学习需求
            </p>
          </div>

          <div className="p-6 bg-green-50 rounded-lg">
            <div className="text-4xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-2">AI规划</h3>
            <p className="text-sm text-gray-600">
              生成个性化学习路径
            </p>
          </div>

          <div className="p-6 bg-purple-50 rounded-lg">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="font-semibold text-gray-900 mb-2">精选资源</h3>
            <p className="text-sm text-gray-600">
              推荐最适合你的教材和视频
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/questionnaire')}
            className="bg-blue-600 text-white py-4 px-8 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            开始定制我的学习计划
          </button>

          {allPathsCount > 0 && (
            <div className="mt-4">
              <button
                onClick={() => router.push('/select-path')}
                className="bg-green-100 text-green-700 py-3 px-6 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                查看已有方案 ({allPathsCount})
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-6">
          预计耗时：5分钟
        </p>
      </div>
    </div>
  );
}
