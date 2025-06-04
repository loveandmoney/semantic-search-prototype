import { apiService } from '@/lib/apiService';
import { IChatMessage, IHouseWithPageContent, IRagVectorItem } from '@/types';
import { useEffect, useRef, useState } from 'react';

export const useRagChat = () => {
  const systemPrompt = `
You are a helpful assistant for a real estate website.
When responding, recommend one best-fit property from the provided context, and briefly mention 1-2 other suitable options as alternatives.
The earlier items in the context are more relevant, so prioritize them.
Use details from the context only, and do not fabricate information.
If none of the properties seem suitable, say so. Always answer concisely and professionally.
Use plain text formatting, no markdown or code blocks.
`;

  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<IChatMessage[]>([
    { content: systemPrompt, role: 'system' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [followUpTarget, setFollowUpTarget] =
    useState<IHouseWithPageContent | null>(null);
  // const [recommendations, setRecommendations] = useState<IRagVectorItem[]>([]);

  const responseRef = useRef('');
  const vectorMatchesRef = useRef<IRagVectorItem[]>([]);

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

  const askGenericQuestion = async (
    conversationWithNewQuery: IChatMessage[]
  ) => {
    try {
      const { topMatches } = await apiService.vectorSearch({ query });

      vectorMatchesRef.current = topMatches.map((match) => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
      }));

      const topRecommendation = topMatches[0]?.metadata;
      if (topRecommendation) {
        setFollowUpTarget(topRecommendation);
      }

      const matchesFormattedForLLM = topMatches
        .map((match) => `Score: ${match.score}\n${match.metadata.pageContent}`)
        .join('\n\n');

      const contextSystemMessage: IChatMessage = {
        content: `Here is some relevant context to help answer the user's question:\n\n${matchesFormattedForLLM}`,
        role: 'system',
      };

      const conversationWithoutUserQuery = conversationWithNewQuery.slice(
        0,
        -1
      );
      const userQueryMessage: IChatMessage =
        conversationWithNewQuery[conversationWithNewQuery.length - 1];
      const updatedConversation = [
        ...conversationWithoutUserQuery,
        contextSystemMessage,
        userQueryMessage,
      ];

      // Fire the stream
      apiService.openAiStream({
        onContent: onStreamContent,
        onComplete: onStreamComplete,
        conversation: updatedConversation,
      });

      // Update state
      setConversation(updatedConversation);
    } catch (error) {
      console.error('Error sending query:', error);
    }
  };

  const askFollowUpQuestion = async (
    conversationWithNewQuery: IChatMessage[]
  ) => {
    if (!followUpTarget) {
      console.error('No follow-up target selected');
      return;
    }

    const contextSystemMessage: IChatMessage = {
      role: 'system',
      content: `User is asking a follow-up question about "${followUpTarget.name}", which has the following details:\n\n${followUpTarget.pageContent}`,
    };

    const conversationWithoutUserQuery = conversationWithNewQuery.slice(0, -1);
    const userQueryMessage: IChatMessage =
      conversationWithNewQuery[conversationWithNewQuery.length - 1];
    const updatedConversation = [
      ...conversationWithoutUserQuery,
      contextSystemMessage,
      userQueryMessage,
    ];

    setConversation(updatedConversation);

    try {
      apiService.openAiStream({
        onContent: onStreamContent,
        onComplete: onStreamComplete,
        conversation: updatedConversation,
      });
    } catch (error) {
      console.error('Error sending query:', error);
    }
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
    vectorMatchesRef.current = [];

    setIsLoading(true);
    setQuery('');
    setConversation(conversationWithNewQuery);

    if (followUpTarget) {
      askFollowUpQuestion(conversationWithNewQuery);
    } else {
      askGenericQuestion(conversationWithNewQuery);
    }
  };

  useEffect(() => {
    console.log(conversation);
  }, [conversation]);

  return {
    conversation,
    followUpTarget,
    response,
    handleSubmit,
    isLoading,
    query,
    setQuery,
    handleQuerySubmit,
  };
};
