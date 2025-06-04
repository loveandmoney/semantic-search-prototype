'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRagChat } from './useRagChat';
import { RagSearchResultHouseTile } from '@/components/RagSearchResultHouseTile';
import clsx from 'clsx';
import { IRagVectorItem } from '@/types';

export default function RagSearchPage() {
  const {
    conversation,
    followUpTarget,
    handleQuerySubmit,
    handleSubmit,
    isLoading,
    query,
    response,
    setQuery,
    recommendations,
  } = useRagChat();

  return (
    <main
      className={clsx(
        'space-y-6 m-auto',
        recommendations?.[0] ? 'max-w-[1200px]' : 'max-w-[600px]'
      )}
    >
      <h1 className="text-2xl font-bold">RAG Search</h1>

      <div className={clsx(recommendations?.[0] && 'grid grid-cols-5 gap-4')}>
        <div className="space-y-6 col-span-3">
          <div className="space-y-4">
            {conversation.map((item, i) => (
              <div key={i}>
                {item.role === 'user' && (
                  <div className="flex justify-end">
                    <p className="bg-black/10 px-2 py-1 rounded inline-block max-w-[75%]">
                      {item.content}
                    </p>
                  </div>
                )}

                {item.role === 'assistant' && (
                  <p className="inline-block max-w-[75%]">{item.content}</p>
                )}
              </div>
            ))}

            {response && <p className="inline-block max-w-[75%]">{response}</p>}
          </div>

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
        </div>

        <Recommendations recommendations={recommendations} />
      </div>
    </main>
  );
}

const Recommendations = ({
  recommendations,
}: {
  recommendations: IRagVectorItem[];
}) => {
  if (!recommendations?.[0]) {
    return null;
  }

  return (
    <div className="col-span-2 space-y-2">
      <div key={recommendations[0].id} className="animate-scale-in opacity-0">
        <RagSearchResultHouseTile
          matchScore={recommendations[0].score}
          house={recommendations[0].metadata}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {recommendations.slice(1).map((house, i) => (
          <div
            key={house.id}
            className="animate-scale-in opacity-0"
            style={{ animationDelay: `${i + 1 * 100}ms` }}
          >
            <RagSearchResultHouseTile
              matchScore={house.score}
              house={house.metadata}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
