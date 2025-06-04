'use client';

import { RagSearchResultHouseTile } from '@/components/RagSearchResultHouseTile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/apiService';
import { IChatMessage, IPineconeVectorResponse } from '@/types';
import { useRef, useState } from 'react';

const systemPrompt = `
You are a helpful assistant for a real estate website.
When responding, recommend one best-fit property from the provided context, and briefly mention 1-2 other suitable options as alternatives. Use details from the context only, and do not fabricate information.
If none of the properties seem suitable, say so. Always answer concisely and professionally.
Use plain text formatting, no markdown or code blocks.
`;

export default function RagSearchPage() {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<IChatMessage[]>([
    { content: systemPrompt, role: 'system' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [vectorResults, setVectorResults] = useState<IPineconeVectorResponse[]>(
    []
  );

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

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      return;
    }

    const userQueryMessage: IChatMessage = {
      content: query,
      role: 'user',
    };

    const conversationWithNewQuery: IChatMessage[] = [
      ...conversation,
      userQueryMessage,
    ];

    responseRef.current = '';

    setIsLoading(true);
    setVectorResults([]);
    setQuery('');
    setConversation(conversationWithNewQuery);

    try {
      const { topMatches } = await apiService.vectorSearch({
        query,
      });
      setVectorResults(topMatches);

      const matchesFormattedForLLM = topMatches
        .map((match) => `Score: ${match.score}\n${match.metadata.pageContent}`)
        .join('\n\n');

      const contextSystemMessage: IChatMessage = {
        content: `
          Here is some relevant context to help answer the user's question:\n\n
          ${matchesFormattedForLLM}
        `,
        role: 'system',
      };

      const llmConversation: IChatMessage[] = [
        ...conversationWithNewQuery.slice(0, -1),
        contextSystemMessage,
        userQueryMessage,
      ];

      apiService.openAiStream({
        onContent: onStreamContent,
        onComplete: onStreamComplete,
        conversation: llmConversation,
      });
    } catch (error) {
      console.error('Error sending query:', error);
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

      {vectorResults?.[0] && !isLoading && (
        <div className="grid grid-cols-3 gap-4">
          {vectorResults.map((house, i) => (
            <div
              key={house.id}
              className="animate-scale-in opacity-0"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <RagSearchResultHouseTile
                matchScore={house.score}
                house={house.metadata}
              />
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Ask a question"
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
