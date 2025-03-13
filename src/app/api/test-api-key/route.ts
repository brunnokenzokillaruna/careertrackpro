import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    
    if (!key) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    // Determine the provider based on the key format
    if (key.startsWith('sk-ant-')) {
      // Test Anthropic API key
      return await testAnthropicKey(key);
    } else if (key.startsWith('AIza')) {
      // Test Google AI (Gemini) API key
      return await testGeminiKey(key);
    } else if (key.startsWith('sk-')) {
      // Test OpenAI API key
      return await testOpenAIKey(key);
    } else {
      return NextResponse.json({ error: 'Unsupported API key format' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error testing API key:', error);
    return NextResponse.json({ error: error.message || 'Failed to test API key' }, { status: 500 });
  }
}

async function testOpenAIKey(key: string) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true, provider: 'OpenAI' });
    } else {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'Invalid OpenAI API key' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to test OpenAI API key' }, { status: 500 });
  }
}

async function testAnthropicKey(key: string) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Say hello'
          }
        ]
      }),
    });

    if (response.ok) {
      return NextResponse.json({ success: true, provider: 'Anthropic' });
    } else {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'Invalid Anthropic API key' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to test Anthropic API key' }, { status: 500 });
  }
}

async function testGeminiKey(key: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return NextResponse.json({ success: true, provider: 'Google AI (Gemini)' });
    } else {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'Invalid Google AI API key' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to test Google AI API key' }, { status: 500 });
  }
} 