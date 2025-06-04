import { LLM_MODEL, OPENAI_API_URL } from '@/lib/openAi';
import { IChatMessage } from '@/types';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const origin = req.headers.get('origin') || 'null';

  const headers = {
    'Access-Control-Allow-Origin': origin === 'null' ? 'null' : origin,
    'Content-Type': 'application/json',
  };

  try {
    const { conversation } = (await req.json()) as {
      conversation: IChatMessage[];
    };

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: conversation,
        temperature: 0.65,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from OpenAI');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ content }, { status: 200, headers });
  } catch (error) {
    console.error('Failed to get AI reply:', error);

    return NextResponse.json(
      { error: 'Failed to get AI reply' },
      { status: 500, headers }
    );
  }
};
