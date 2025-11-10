// Node.js test script to verify the complete DeepSeek API flow
const fetch = require('node-fetch');

async function testDeepSeekAPI() {
  console.log('=== Testing DeepSeek API Integration ===\n');

  const apiKey = 'sk-ba931fec9ce040b4b0bcb7dfe2fa6dde';
  const userMessage = `
请为以下用户生成物理学习路径：

学习目标：掌握经典力学基础
当前水平：高中物理基础
每天可学习时间：1-2小时
学习方式偏好：视频、互动工具

请生成完整的JSON格式学习路径。
`;

  console.log('1. Sending request to API...');
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  console.log('Request URL: http://localhost:3000/api/chat\n');

  const startTime = Date.now();

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
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

    const elapsed = Date.now() - startTime;

    console.log(`2. Response received in ${elapsed}ms`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', JSON.stringify([...response.headers.entries()], null, 2));
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const content = await response.text();

    console.log('3. Response content received');
    console.log('Content length:', content.length, 'characters');
    console.log('First 300 characters:');
    console.log(content.substring(0, 300));
    console.log('...\n');

    // Try to parse as JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON');
        console.log('Number of stages:', parsed.stages?.length || 0);

        if (parsed.stages && parsed.stages.length > 0) {
          console.log('\n4. Verifying first stage:');
          console.log('Stage ID:', parsed.stages[0].id);
          console.log('Stage Title:', parsed.stages[0].title);
          console.log('Number of topics:', parsed.stages[0].topics?.length || 0);

          if (parsed.stages[0].topics && parsed.stages[0].topics.length > 0) {
            console.log('\n5. Verifying first topic:');
            console.log('Topic Name:', parsed.stages[0].topics[0].name);
            console.log('Number of resources:', parsed.stages[0].topics[0].resources?.length || 0);

            if (parsed.stages[0].topics[0].resources && parsed.stages[0].topics[0].resources.length > 0) {
              console.log('\n6. Sample resource:');
              console.log('Type:', parsed.stages[0].topics[0].resources[0].type);
              console.log('Title:', parsed.stages[0].topics[0].resources[0].title);
              console.log('Recommended:', parsed.stages[0].topics[0].resources[0].recommended);
            }
          }
        }

        console.log('\n✅ TEST PASSED: DeepSeek API integration working correctly!');
      } else {
        console.log('⚠️ No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('Raw content:', content);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testDeepSeekAPI();
