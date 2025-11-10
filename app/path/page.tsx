'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLearningPath, updateProgress } from '@/lib/storage';
import { LearningPath, Stage, Topic } from '@/types';

export default function PathPage() {
  const router = useRouter();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  useEffect(() => {
    const learningPath = getLearningPath();
    if (!learningPath) {
      router.push('/');
      return;
    }
    setPath(learningPath);
    // 默认展开第一个未完成的阶段
    const firstIncompleteStage = learningPath.stages.find(
      (stage) => !learningPath.progress.completedStages.includes(stage.id)
    );
    if (firstIncompleteStage) {
      setExpandedStage(firstIncompleteStage.id);
    }
  }, [router]);

  const handleToggleComplete = (stageId: string, topicId: string, completed: boolean) => {
    updateProgress(stageId, topicId, !completed);
    // 重新加载路径
    const updatedPath = getLearningPath();
    if (updatedPath) {
      setPath(updatedPath);
    }
  };

  if (!path) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  const totalTopics = path.stages.reduce(
    (sum, stage) => sum + stage.topics.length,
    0
  );
  const completedTopics = path.progress.completedTopics.length;
  const progressPercent = Math.round((completedTopics / totalTopics) * 100);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        {/* 总体进度 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">我的学习路径</h2>
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700"
            >
              返回首页
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>整体进度</span>
              <span>{completedTopics} / {totalTopics} 已完成</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-600">学习目标</p>
              <p className="font-semibold">{path.userProfile.goal}</p>
            </div>
            <div>
              <p className="text-gray-600">当前水平</p>
              <p className="font-semibold">{path.userProfile.currentLevel}</p>
            </div>
            <div>
              <p className="text-gray-600">每日学习</p>
              <p className="font-semibold">{path.userProfile.availableTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 学习阶段列表 */}
      <div className="space-y-4">
        {path.stages.map((stage, index) => {
          const isCompleted = path.progress.completedStages.includes(stage.id);
          const isExpanded = expandedStage === stage.id;
          const completedInStage = stage.topics.filter(t => t.completed).length;

          return (
            <div
              key={stage.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                isCompleted ? 'border-2 border-green-500' : ''
              }`}
            >
              {/* 阶段标题 */}
              <button
                onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {stage.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {stage.description} • 预计 {stage.estimatedDuration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {completedInStage}/{stage.topics.length} 完成
                    </div>
                    <svg
                      className={`w-6 h-6 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* 主题列表 */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="space-y-3">
                    {stage.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="bg-white rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={topic.completed}
                              onChange={() =>
                                handleToggleComplete(stage.id, topic.id, topic.completed)
                              }
                              className="mt-1 w-5 h-5 text-blue-600 rounded"
                            />
                            <div className="flex-1">
                              <h4
                                className={`font-semibold ${
                                  topic.completed
                                    ? 'text-gray-500 line-through'
                                    : 'text-gray-900'
                                }`}
                              >
                                {topic.name}
                              </h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {topic.concepts.map((concept, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                  >
                                    {concept}
                                  </span>
                                ))}
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  难度：{'⭐'.repeat(topic.difficulty)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedTopic(topic)}
                            className="ml-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            查看资源 →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 资源详情弹窗 */}
      {selectedTopic && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTopic(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedTopic.name}
                </h3>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">核心概念：</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.concepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3">推荐学习资源：</h4>
                {selectedTopic.resources && selectedTopic.resources.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTopic.resources.map((resource, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 transition-colors ${
                          resource.url
                            ? 'border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onClick={() => {
                          if (resource.url) {
                            window.open(resource.url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-2xl">
                                {resource.type === 'video' && '🎥'}
                                {resource.type === 'book' && '📖'}
                                {resource.type === 'interactive' && '🔬'}
                                {resource.type === 'article' && '📄'}
                              </span>
                              <h5 className="font-semibold text-gray-900">
                                {resource.title}
                              </h5>
                              {resource.recommended && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                                  ⭐ 推荐
                                </span>
                              )}
                              {!resource.url && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                  参考资料
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {resource.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <span>⏱️</span>
                                <span>{resource.estimatedTime}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span>📊</span>
                                <span>难度 {'⭐'.repeat(resource.difficulty)}</span>
                              </span>
                              {resource.type === 'video' && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  🎬 视频课程
                                </span>
                              )}
                              {resource.type === 'book' && (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                  📚 书籍教材
                                </span>
                              )}
                              {resource.type === 'interactive' && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  🎮 互动工具
                                </span>
                              )}
                            </div>
                            {resource.url && (
                              <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                <span>🔗</span>
                                <span className="truncate">{resource.url}</span>
                              </div>
                            )}
                          </div>
                          {resource.url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(resource.url, '_blank', 'noopener,noreferrer');
                              }}
                              className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap flex items-center gap-1"
                            >
                              立即访问 →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    暂无推荐资源
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
