'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveQuestionnaireData, saveApiKey } from '@/lib/storage';
import { QuestionnaireData } from '@/types';

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>({});
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const questions = [
    {
      id: 'goal',
      question: '你的学习目标是什么？',
      options: [
        { value: 'gaokao', label: '准备高考', icon: '🎓' },
        { value: 'postgrad', label: '准备考研', icon: '📖' },
        { value: 'interest', label: '个人兴趣', icon: '✨' },
        { value: 'other', label: '其他', icon: '🎯' },
      ],
    },
    {
      id: 'currentLevel',
      question: '你目前的物理水平？',
      options: [
        { value: 'zero', label: '零基础', icon: '🌱' },
        { value: 'high-school', label: '高中水平', icon: '📚' },
        { value: 'college', label: '大学水平', icon: '🎓' },
        { value: 'uncertain', label: '不确定（AI测试）', icon: '🤔' },
      ],
    },
    {
      id: 'availableTime',
      question: '每天可以学习多久？',
      options: [
        { value: '<1h', label: '少于1小时', icon: '⏰' },
        { value: '1-2h', label: '1-2小时', icon: '⏱️' },
        { value: '2h+', label: '2小时以上', icon: '⏳' },
      ],
    },
    {
      id: 'learningStyle',
      question: '你更喜欢哪种学习方式？（多选）',
      multiple: true,
      options: [
        { value: 'video', label: '视频课程', icon: '🎥' },
        { value: 'book', label: '阅读教材', icon: '📖' },
        { value: 'interactive', label: '互动实验', icon: '🔬' },
      ],
    },
  ];

  const currentQuestion = questions[step];

  const handleSelect = (value: string) => {
    if (currentQuestion.multiple) {
      // 多选
      const currentValues = (formData[currentQuestion.id as keyof QuestionnaireData] as string[]) || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setFormData({ ...formData, [currentQuestion.id]: newValues });
    } else {
      // 单选
      setFormData({ ...formData, [currentQuestion.id]: value });
    }
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // 完成问卷，显示API Key输入
      setShowApiKeyInput(true);
    }
  };

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      alert('请输入您的DeepSeek API Key');
      return;
    }

    // 保存数据
    saveQuestionnaireData(formData);
    saveApiKey(apiKey);

    // 跳转到方案选择页面（检查是否有已有方案）
    router.push('/select-path');
  };

  const isCurrentStepValid = () => {
    const value = formData[currentQuestion.id as keyof QuestionnaireData];
    if (currentQuestion.multiple) {
      return Array.isArray(value) && value.length > 0;
    }
    return !!value;
  };

  if (showApiKeyInput) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            最后一步：配置AI服务
          </h2>

          <p className="text-gray-600 mb-6">
            为了生成个性化学习路径，我们需要调用DeepSeek的API。请输入您的API Key。
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              DeepSeek API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              还没有API Key？{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                点击这里注册
              </a>
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowApiKeyInput(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              返回
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              生成我的学习路径
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* 进度指示器 */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded ${
                  index <= step ? 'bg-blue-600' : 'bg-gray-200'
                } ${index > 0 ? 'ml-2' : ''}`}
              ></div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            问题 {step + 1} / {questions.length}
          </p>
        </div>

        {/* 问题 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>

        {/* 选项 */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option) => {
            const isSelected = currentQuestion.multiple
              ? ((formData[currentQuestion.id as keyof QuestionnaireData] as string[]) || []).includes(option.value)
              : formData[currentQuestion.id as keyof QuestionnaireData] === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className="text-3xl mr-4">{option.icon}</span>
                <span className="font-medium text-gray-900">{option.label}</span>
                {isSelected && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 导航按钮 */}
        <div className="flex gap-4">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              上一步
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isCurrentStepValid()}
            className={`flex-1 py-3 px-6 rounded-lg transition-colors font-medium ${
              isCurrentStepValid()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {step < questions.length - 1 ? '下一步' : '完成问卷'}
          </button>
        </div>
      </div>
    </div>
  );
}
