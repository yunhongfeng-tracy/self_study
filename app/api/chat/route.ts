import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const runtime = 'nodejs';
export const maxDuration = 300; // 设置为 5 分钟（300 秒）

const physicsResources = {
  "mechanics": {
    "kinematics": [
      {
        "type": "video",
        "title": "李永乐老师 - 运动学基础",
        "url": "https://search.bilibili.com/all?keyword=李永乐+运动学",
        "description": "通俗易懂讲解运动的描述、速度和加速度概念。点击链接在B站搜索相关视频",
        "estimatedTime": "30分钟",
        "difficulty": 1,
        "recommended": true
      },
      {
        "type": "book",
        "title": "《费曼物理学讲义》第1卷",
        "url": "http://www.feynmanlectures.caltech.edu/",
        "description": "第1-3章，深入浅出介绍运动学基础。加州理工学院官方在线版（英文），免费阅读",
        "estimatedTime": "2小时",
        "difficulty": 3,
        "recommended": true
      },
      {
        "type": "interactive",
        "title": "PhET 运动模拟器",
        "url": "https://phet.colorado.edu/zh_CN/simulations/moving-man",
        "description": "交互式运动学可视化工具",
        "estimatedTime": "20分钟",
        "difficulty": 1,
        "recommended": true
      }
    ],
    "newton-laws": [
      {
        "type": "video",
        "title": "3Blue1Brown - 牛顿运动定律的本质",
        "url": "https://search.bilibili.com/all?keyword=3Blue1Brown+牛顿运动定律",
        "description": "从数学角度深入理解牛顿三定律。点击链接在B站搜索相关视频",
        "estimatedTime": "25分钟",
        "difficulty": 3,
        "recommended": true
      },
      {
        "type": "book",
        "title": "《普通物理学》程守洙",
        "url": "https://abook.hep.com.cn/1261861",
        "description": "第二章，系统讲解牛顿运动定律及应用。高等教育出版社官方数字课程，含视频动画资源",
        "estimatedTime": "3小时",
        "difficulty": 2,
        "recommended": true
      }
    ],
    "energy": [
      {
        "type": "video",
        "title": "Khan Academy - 功和能",
        "url": "https://www.khanacademy.org/science/physics/work-and-energy",
        "description": "详细讲解功、动能、势能和机械能守恒",
        "estimatedTime": "45分钟",
        "difficulty": 2,
        "recommended": true
      },
      {
        "type": "interactive",
        "title": "PhET 能量滑板公园",
        "url": "https://phet.colorado.edu/zh_CN/simulations/energy-skate-park",
        "description": "可视化能量转换过程",
        "estimatedTime": "15分钟",
        "difficulty": 1,
        "recommended": true
      }
    ]
  },
  "electromagnetics": {
    "electric-field": [
      {
        "type": "video",
        "title": "李永乐老师 - 电场强度与电势",
        "url": "https://search.bilibili.com/all?keyword=李永乐+电场",
        "description": "图解电场概念，深入浅出。点击链接在B站搜索相关视频",
        "estimatedTime": "35分钟",
        "difficulty": 2,
        "recommended": true
      },
      {
        "type": "book",
        "title": "《电磁学》赵凯华",
        "url": "http://abook.hep.com.cn/1238955",
        "description": "第1-2章，电场基础理论。高等教育出版社官方数字课程，含视频文档资源",
        "estimatedTime": "4小时",
        "difficulty": 3,
        "recommended": false
      }
    ],
    "circuits": [
      {
        "type": "interactive",
        "title": "PhET 电路模拟实验",
        "url": "https://phet.colorado.edu/zh_CN/simulations/circuit-construction-kit-dc",
        "description": "搭建虚拟电路，理解欧姆定律",
        "estimatedTime": "30分钟",
        "difficulty": 2,
        "recommended": true
      }
    ]
  },
  "thermodynamics": {
    "basic": [
      {
        "type": "video",
        "title": "中科大 - 热力学基础",
        "url": "https://search.bilibili.com/all?keyword=中科大+热力学",
        "description": "温度、内能、热力学第一定律。点击链接在B站搜索相关视频",
        "estimatedTime": "50分钟",
        "difficulty": 3,
        "recommended": true
      }
    ]
  }
};

const SYSTEM_PROMPT = `你是一位经验丰富的物理学习规划专家和教育顾问。

你的任务是根据用户的背景信息，生成一个详细的、个性化的物理学习路径。

用户信息包括：
- 学习目标（goal）
- 当前水平（currentLevel）
- 每天可学习时间（availableTime）
- 学习方式偏好（learningStyle）

【可用的物理学习资源库】：
${JSON.stringify(physicsResources, null, 2)}

请生成一个JSON格式的学习路径，格式如下：

{
  "stages": [
    {
      "id": "stage-1",
      "title": "阶段标题",
      "description": "阶段描述",
      "estimatedDuration": "预计时间（如：4周）",
      "prerequisites": [],
      "order": 1,
      "topics": [
        {
          "id": "topic-1",
          "name": "主题名称",
          "concepts": ["概念1", "概念2"],
          "difficulty": 1-5,
          "completed": false,
          "resources": [
            {
              "type": "video",
              "title": "资源标题",
              "url": "资源链接",
              "description": "资源描述",
              "estimatedTime": "预计时间",
              "difficulty": 1-5,
              "recommended": true
            }
          ]
        }
      ]
    }
  ],
  "tips": "整体学习建议"
}

要求：
1. 根据用户水平调整起点和深度
2. 根据可用时间调整学习节奏
3. 优先推荐用户偏好的学习方式（视频、书籍、互动工具）
4. 循序渐进，标注前置知识
5. 生成3-5个阶段，每个阶段包含2-4个主题
6. **重要：每个主题必须从上面的【可用的物理学习资源库】中选择2-3个相关资源填入resources数组**
7. 根据主题内容和难度，匹配合适的资源（如运动学主题匹配mechanics.kinematics中的资源）
8. 优先选择recommended为true的资源
9. 根据用户学习方式偏好，优先推荐对应type的资源
10. 只返回JSON，不要额外的文字说明
11. 确保JSON格式完全正确，可以直接解析

重要：请只返回纯JSON对象，不要使用markdown代码块包裹。`;

export async function POST(req: Request) {
  try {
    const { messages, apiKey } = await req.json();

    console.log('=== API Route Called ===');
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey?.length);

    if (!apiKey) {
      return new Response('API Key is required', { status: 400 });
    }

    // 重试机制
    let lastError;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries}: Calling DeepSeek API...`);

        // 直接使用原生 fetch 调用 DeepSeek API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时

        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: SYSTEM_PROMPT,
              },
              ...messages,
            ],
            temperature: 0.7,
            stream: false, // 明确不使用流式响应
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('DeepSeek API response received');

        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('No content in DeepSeek response');
        }

        console.log('Response length:', content.length);
        console.log('First 200 chars:', content.substring(0, 200));

        return new Response(content, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);

        // 如果是最后一次尝试，不等待直接抛出错误
        if (attempt === maxRetries) {
          break;
        }

        // 等待后重试（指数退避）
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // 所有重试都失败
    throw lastError;
  } catch (error: any) {
    console.error('API错误:', error);
    console.error('Error stack:', error.stack);
    return new Response(error.message || 'Internal Server Error', {
      status: 500,
    });
  }
}
