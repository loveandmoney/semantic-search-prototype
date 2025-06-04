'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/apiService';
import { IChatMessage } from '@/types';
import { useRef, useState } from 'react';

const systemPrompt = `
  You are an opposite machine. Your answers are always incorrect. 
  Your responses should be no longer than 2 sentences.
`;

export default function RagSearchPage() {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<IChatMessage[]>([
    { content: systemPrompt, role: 'system' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const responseRef = useRef('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuerySubmit();
  };

  const onStreamContent = (chunk: string) => {
    responseRef.current += chunk;
    setResponse(responseRef.current);
  };

  const onStreamComplete = () => {
    setIsLoading(false);
    setConversation((prev) => [
      ...prev,
      { content: responseRef.current, role: 'assistant' },
    ]);
    setResponse('');
  };

  console.log(conversation);

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    responseRef.current = '';

    try {
      const updatedConversation: IChatMessage[] = [
        ...conversation,
        { content: query, role: 'user' },
      ];

      setConversation(updatedConversation);
      setQuery('');

      apiService.openAiStream({
        onContent: onStreamContent,
        onComplete: onStreamComplete,
        conversation: updatedConversation,
      });
    } catch (error) {
      console.error('Error sending query:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="space-y-6 max-w-[600px] m-auto">
      <h1 className="text-2xl font-bold">RAG Search</h1>

      <div className="space-y-4">
        {conversation.map((message, i) => (
          <div key={i}>
            {message.role === 'user' && (
              <div className="flex justify-end">
                <p className="bg-black/10 px-2 py-1 rounded inline-block max-w-[75%]">
                  {message.content}
                </p>
              </div>
            )}

            {message.role === 'assistant' && (
              <p className="inline-block max-w-[75%]">{message.content}</p>
            )}
          </div>
        ))}

        {response && <p className="inline-block max-w-[75%]">{response}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Describe your dream home"
          value={query}
          disabled={isLoading}
          onChange={(e) => setQuery(e.target.value)}
        />

        <Button disabled={isLoading} onClick={handleQuerySubmit}>
          Ask AI
        </Button>
      </form>
    </main>
  );
}
