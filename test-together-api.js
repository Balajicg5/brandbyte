require('dotenv').config({ path: '.env.local' });

async function testTogetherAPI() {
    const apiKey = process.env.TOGETHER_API_KEY;
    
    if (!apiKey) {
        console.error('❌ TOGETHER_API_KEY not found in environment variables');
        console.log('Please add TOGETHER_API_KEY to your .env.local file');
        return;
    }
    
    console.log('✅ API Key found');
    console.log('🧪 Testing Together.ai API...');
    
    try {
        // Test 1: Simple prompt generation
        console.log('\n📝 Testing prompt generation...');
        const promptResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
                messages: [
                    { role: 'user', content: 'Hello, can you respond with just "API working"?' }
                ],
                max_tokens: 50,
                temperature: 0.1,
            }),
        });
        
        if (!promptResponse.ok) {
            const errorText = await promptResponse.text();
            console.error('❌ Prompt generation failed:', promptResponse.status, errorText);
        } else {
            const data = await promptResponse.json();
            console.log('✅ Prompt generation successful:', data.choices[0]?.message?.content);
        }
        
        // Test 2: Image generation
        console.log('\n🖼️ Testing image generation...');
        const imageResponse = await fetch('https://api.together.xyz/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'black-forest-labs/FLUX.1-schnell-Free',
                prompt: 'A simple red circle on white background',
                steps: 4,
                n: 1
            }),
        });
        
        if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            console.error('❌ Image generation failed:', imageResponse.status, errorText);
        } else {
            const imageData = await imageResponse.json();
            console.log('✅ Image generation successful');
            console.log('Image URL available:', !!imageData.data?.[0]?.url);
            console.log('Image base64 available:', !!imageData.data?.[0]?.b64_json);
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

testTogetherAPI(); 