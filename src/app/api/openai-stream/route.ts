import { IChatMessage } from '@/types';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const origin = req.headers.get('origin') || 'null';

  const headers = {
    'Access-Control-Allow-Origin': origin === 'null' ? 'null' : origin,
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };

  try {
    const { conversation } = (await req.json()) as {
      conversation: IChatMessage[];
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversation,
        temperature: 0.8,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from OpenAI');
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const json = JSON.parse(line.slice(6));
                  const content = json.choices[0]?.delta?.content || '';
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch (error) {
                  console.error('Error parsing stream JSON:', error);
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error('Failed to get AI reply:', error);

    return NextResponse.json(
      { error: 'Failed to get AI reply' },
      { status: 500, headers }
    );
  }
};
