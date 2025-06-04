'use client';

import { RagSearchResultHouseTile } from '@/components/RagSearchResultHouseTile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRagChat } from './useRagChat';

export default function RagSearchPage() {
  const {
    conversationUI,
    followUpTarget,
    handleQuerySubmit,
    handleSubmit,
    isLoading,
    query,
    response,
    setQuery,
  } = useRagChat();

  return (
    <main className="space-y-6 max-w-[600px] m-auto">
      <h1 className="text-2xl font-bold">RAG Search</h1>

      <div className="space-y-4">
        {conversationUI.map((item, i) => (
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

      {followUpTarget && <p>Following up on {followUpTarget.name}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder={
            followUpTarget
              ? `Ask a question about ${followUpTarget.name}`
              : 'Ask a question'
          }
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
