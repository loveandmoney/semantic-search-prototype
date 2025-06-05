import { EMBEDDING_DIMENSIONS } from '@/lib/openAi';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export const POST = async (req: Request) => {
  const { textContent } = (await req.json()) as {
    textContent: string;
  };

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textContent,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return NextResponse.json({ embedding: res.data[0].embedding });
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    );
  }
};
