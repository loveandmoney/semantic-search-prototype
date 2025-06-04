'use client';

import { RagSearchResultHouseTile } from '@/components/RagSearchResultHouseTile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/apiService';
import {
  IPineconeVectorResponse,
  IRagConversationMessage,
  TRagConversationItem,
} from '@/types';
import { useRef, useState } from 'react';

const systemPrompt = `
You are a helpful assistant for a real estate website.
When responding, recommend one best-fit property from the provided context, and briefly mention 1-2 other suitable options as alternatives. Use details from the context only, and do not fabricate information.
If none of the properties seem suitable, say so. Always answer concisely and professionally.
Use plain text formatting, no markdown or code blocks.
`;

export default function RagSearchPage() {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<TRagConversationItem[]>([
    { _type: 'message', content: systemPrompt, role: 'system' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');

  const responseRef = useRef('');
  const vectorMatchesRef = useRef<IPineconeVectorResponse[]>([]);

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
      { _type: 'message', content: responseRef.current, role: 'assistant' },
      { _type: 'vector_items', items: vectorMatchesRef.current },
    ]);
    setResponse('');
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      return;
    }

    const userQueryMessage: IRagConversationMessage = {
      content: query,
      role: 'user',
      _type: 'message',
    };

    const conversationWithNewQuery: TRagConversationItem[] = [
      ...conversation,
      userQueryMessage,
    ];

    responseRef.current = '';

    setIsLoading(true);
    setQuery('');
    setConversation(conversationWithNewQuery);

    try {
      const { topMatches } = await apiService.vectorSearch({
        query,
      });
      vectorMatchesRef.current = topMatches;

      const matchesFormattedForLLM = topMatches
        .map((match) => `Score: ${match.score}\n${match.metadata.pageContent}`)
        .join('\n\n');

      const contextSystemMessage: IRagConversationMessage = {
        _type: 'message',
        content: `
          Here is some relevant context to help answer the user's question:\n\n
          ${matchesFormattedForLLM}
        `,
        role: 'system',
      };

      const llmConversation: IRagConversationMessage[] = [
        ...conversationWithNewQuery.slice(0, -1),
        contextSystemMessage,
        userQueryMessage,
      ].filter((item) => item._type !== 'vector_items');

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
        {conversation.map((item, i) => (
          <div key={i}>
            {item._type === 'message' && item.role === 'user' && (
              <div className="flex justify-end">
                <p className="bg-black/10 px-2 py-1 rounded inline-block max-w-[75%]">
                  {item.content}
                </p>
              </div>
            )}

            {item._type === 'message' && item.role === 'assistant' && (
              <p className="inline-block max-w-[75%]">{item.content}</p>
            )}

            {item._type === 'vector_items' && (
              <div className="grid grid-cols-3 gap-4">
                {item.items.map((house, i) => (
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
          </div>
        ))}

        {response && <p className="inline-block max-w-[75%]">{response}</p>}
      </div>

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
