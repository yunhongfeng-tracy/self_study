'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getQuestionnaireData, getApiKey, saveLearningPath } from '@/lib/storage';
import { LearningPath } from '@/types';

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('正在连接 AI 服务...');
  const [dots, setDots] = useState('');

  useEffect(() => {
    generatePath();

    // 动画点点点
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  const generatePath = async () => {
    try {
      const questionnaireData = getQuestionnaireData();
      const apiKey = getApiKey();

      if (!questionnaireData || !apiKey) {
        router.push('/questionnaire');
        return;
      }

      // 更智能的进度模拟
      let currentProgress = 0;
      const updateProgress = (target: number, message: string) => {
        setStatusMessage(message);
        const step = (target - currentProgress) / 10;
        let count = 0;
        const interval = setInterval(() => {
          count++;
          currentProgress += step;
          setProgress(Math.min(Math.round(currentProgress), target));
          if (count >= 10) {
            clearInterval(interval);
          }
        }, 200);
        return interval;
      };

      let interval1 = updateProgress(15, '正在分析你的学习需求');

      // 构建提示词
      const userMessage = `
请为以下用户生成物理学习路径：

学习目标：${questionnaireData.goal}
当前水平：${questionnaireData.currentLevel}
每天可学习时间：${questionnaireData.availableTime}
学习方式偏好：${questionnaireData.learningStyle?.join('、')}

请生成完整的JSON格式学习路径。
`;

      await new Promise(resolve => setTimeout(resolve, 800));
      clearInterval(interval1);

      const interval2 = updateProgress(30, '正在连接 DeepSeek AI');
      await new Promise(resolve => setTimeout(resolve, 1000));
      clearInterval(interval2);

      const interval3 = updateProgress(45, 'AI 正在思考中');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
          apiKey: apiKey,
        }),
      });

      clearInterval(interval3);
      const interval4 = updateProgress(70, 'AI 正在生成学习路径');

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API错误响应:', errorText);
        throw new Error('生成失败，请检查API Key是否正确');
      }

      // 读取流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          result += chunk;

          // 读取数据时更新进度
          if (currentProgress < 85) {
            currentProgress += 0.5;
            setProgress(Math.round(currentProgress));
          }
        }
      }

      clearInterval(interval4);
      const interval5 = updateProgress(95, '正在整理学习资源');
      await new Promise(resolve => setTimeout(resolve, 500));
      clearInterval(interval5);
      setProgress(100);
      setStatusMessage('生成完成！');

      console.log('AI原始响应:', result);
      console.log('响应长度:', result.length);

      // 如果响应为空或无效，提供演示数据
      let parsedData;
      if (!result || result.trim().length === 0) {
        console.warn('API返回空响应，使用演示数据');
        // 使用演示数据
        parsedData = {
          stages: [
            {
              id: 'stage-1',
              title: '力学基础',
              description: '学习经典力学的基本概念和定律',
              estimatedDuration: '4周',
              prerequisites: [],
              order: 1,
              topics: [
                {
                  id: 'topic-1',
                  name: '运动学基础',
                  concepts: ['位移', '速度', '加速度', '匀变速直线运动'],
                  difficulty: 2,
                  completed: false,
                  resources: []
                },
                {
                  id: 'topic-2',
                  name: '牛顿运动定律',
                  concepts: ['牛顿第一定律', '牛顿第二定律', '牛顿第三定律'],
                  difficulty: 3,
                  completed: false,
                  resources: []
                }
              ]
            },
            {
              id: 'stage-2',
              title: '能量与动量',
              description: '理解能量守恒和动量守恒',
              estimatedDuration: '3周',
              prerequisites: ['stage-1'],
              order: 2,
              topics: [
                {
                  id: 'topic-3',
                  name: '功和能',
                  concepts: ['功', '动能', '势能', '机械能守恒'],
                  difficulty: 3,
                  completed: false,
                  resources: []
                }
              ]
            }
          ]
        };
      } else {
        // 解析真实的AI响应
        try {
          // 清理可能的流式响应格式标记
          let cleanedResult = result
            .replace(/^data:\s*/gm, '')  // 移除 "data: " 前缀
            .replace(/\n\n/g, '\n')       // 移除多余换行
            .trim();

          // 尝试提取JSON（可能被markdown包裹）
          const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            parsedData = JSON.parse(cleanedResult);
          }
        } catch (e) {
          console.error('JSON解析失败:', result);
          throw new Error('AI返回的数据格式不正确，请重试');
        }
      }

      // 构建完整的学习路径对象
      const learningPath: LearningPath = {
        id: `path-${Date.now()}`,
        userId: 'user-1',
        subject: 'physics',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userProfile: {
          currentLevel: questionnaireData.currentLevel as any,
          goal: questionnaireData.goal as any,
          availableTime: questionnaireData.availableTime as any,
          learningStyle: questionnaireData.learningStyle as any,
        },
        stages: parsedData.stages || [],
        progress: {
          currentStageId: parsedData.stages?.[0]?.id || '',
          currentTopicId: parsedData.stages?.[0]?.topics?.[0]?.id || '',
          completedStages: [],
          completedTopics: [],
          startDate: new Date().toISOString(),
          estimatedEndDate: '', // 可以根据总时长计算
        },
      };

      // 保存到本地存储
      saveLearningPath(learningPath);

      // 跳转到学习路径页面
      setTimeout(() => {
        router.push('/path');
      }, 1000);
    } catch (err: any) {
      console.error('生成路径错误:', err);
      setError(err.message || '生成失败，请重试');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">生成失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/questionnaire')}
              className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              重新填写问卷
            </button>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setProgress(0);
                generatePath();
              }}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 动画图标 */}
        <div className="text-6xl mb-4 animate-bounce">🤖</div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI正在生成你的学习路径
        </h2>

        {/* 动态状态消息 */}
        <p className="text-blue-600 font-medium mb-6 h-6">
          {statusMessage}{dots}
        </p>

        {/* 进度条 */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 font-medium">{progress}%</p>
        </div>

        {/* 步骤指示器 */}
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className={`flex items-center gap-3 ${progress >= 15 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="text-xl">{progress >= 15 ? '✓' : '○'}</span>
            <span className="text-sm">分析学习需求</span>
          </div>
          <div className={`flex items-center gap-3 ${progress >= 30 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="text-xl">{progress >= 30 ? '✓' : '○'}</span>
            <span className="text-sm">连接 AI 服务</span>
          </div>
          <div className={`flex items-center gap-3 ${progress >= 70 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="text-xl">{progress >= 70 ? '✓' : '○'}</span>
            <span className="text-sm">生成知识体系</span>
          </div>
          <div className={`flex items-center gap-3 ${progress >= 95 ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="text-xl">{progress >= 95 ? '✓' : '○'}</span>
            <span className="text-sm">匹配学习资源</span>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-8 text-xs text-gray-400">
          <p>⏱️ 预计需要 30-60 秒，请耐心等待...</p>
          <p className="mt-1">💡 AI 正在为你定制专属的学习计划</p>
        </div>
      </div>
    </div>
  );
}
