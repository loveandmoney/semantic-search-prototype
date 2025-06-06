import { apiService } from '@/lib/apiService';
import {
  IChatMessage,
  IHouseWithTextContent,
  ITypesenseVectorSearchHit,
} from '@/types';
import { useRef, useState } from 'react';

export const useTypesenseRagChat = () => {
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
    useState<IHouseWithTextContent | null>(null);
  const [recommendations, setRecommendations] = useState<
    ITypesenseVectorSearchHit<IHouseWithTextContent>[]
  >([]);

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

  const determineIfIsFollowUpQuestion = async (): Promise<boolean> => {
    if (!followUpTarget) {
      return false;
    }

    const systemPrompt: IChatMessage = {
      role: 'system',
      content: `
          Determine whether the following user query is a follow-up question about results from a previous query.
          If the user is changing their mind, or wanting to explore a different options, it is not a follow-up.
          
          Conversation history:
          ${conversation.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}

          User query:
          "${query}"

          Reply with only "yes" or "no".
        `,
    };

    const response = await apiService.openAi({
      conversation: [systemPrompt],
    });

    console.log('Follow-up question response:', response);
    if (response.toLowerCase().trim() === 'yes') {
      return true;
    }

    return false;
  };

  const askGenericQuestion = async (
    conversationWithNewQuery: IChatMessage[]
  ) => {
    try {
      const results = await apiService.typesenseVectorSearchCollection({
        query,
      });

      setRecommendations(results);

      const topRecommendation = results[0]?.document;
      if (topRecommendation) {
        setFollowUpTarget(topRecommendation);
      }

      const matchesFormattedForLLM = results
        .map(
          (match) =>
            `Vector distance: ${match.vector_distance}\n${match.document.textContent}`
        )
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
      content: `User is asking a follow-up question about "${followUpTarget.name}", which has the following details:\n\n${followUpTarget.textContent}`,
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

    setIsLoading(true);
    setQuery('');
    setConversation(conversationWithNewQuery);

    const isFirstQuestion = conversationWithNewQuery.length === 2; // System prompt + user query

    if (isFirstQuestion) {
      askGenericQuestion(conversationWithNewQuery);
      return;
    }

    const isFollowUp = await determineIfIsFollowUpQuestion();
    if (isFollowUp) {
      askFollowUpQuestion(conversationWithNewQuery);
    } else {
      askGenericQuestion(conversationWithNewQuery);
    }
  };

  return {
    conversation,
    followUpTarget,
    response,
    handleSubmit,
    isLoading,
    query,
    setQuery,
    handleQuerySubmit,
    recommendations,
  };
};
