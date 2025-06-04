import { apiService } from '@/lib/apiService';
import {
  IChatMessage,
  IHouse,
  IPineconeVectorResponse,
  IRagConversationMessage,
  TRagConversationItem,
} from '@/types';
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
  const [conversationUI, setConversationUI] = useState<TRagConversationItem[]>([
    { _type: 'message', content: systemPrompt, role: 'system' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [askingAbout, setAskingAbout] = useState<IHouse | null>(null);

  const responseRef = useRef('');
  const vectorMatchesRef = useRef<IPineconeVectorResponse[]>([]);

  const parseLLMConversation = (
    items: TRagConversationItem[]
  ): IChatMessage[] => {
    return items
      .filter((item) => item._type === 'message')
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuerySubmit();
  };

  const handleClickAskQuestion = (house: IHouse) => {
    if (askingAbout?.id === house.id) {
      setAskingAbout(null);
    } else {
      setAskingAbout(house);
    }
  };

  const onStreamContent = (chunk: string) => {
    responseRef.current += chunk;
    setResponse(responseRef.current);
  };

  const onStreamComplete = () => {
    setIsLoading(false);

    setConversationUI((prev) => {
      const updatedConversation: TRagConversationItem[] = [
        ...prev,
        { _type: 'message', content: responseRef.current, role: 'assistant' },
      ];

      if (vectorMatchesRef.current) {
        updatedConversation.push({
          _type: 'vector_items',
          items: vectorMatchesRef.current,
        });
      }

      return updatedConversation;
    });

    setResponse('');
  };

  const askGenericQuestion = async (conversation: IChatMessage[]) => {
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

      const conversationWithoutUserQuery = [...conversation.slice(0, -1)];
      const userQueryMessage = conversation[conversation.length - 1];
      const updatedConversation = [
        ...conversationWithoutUserQuery,
        contextSystemMessage,
        userQueryMessage,
      ];

      setConversationUI((prev) => [
        ...prev,
        {
          ...contextSystemMessage,
          _type: 'message',
        },
      ]);

      apiService.openAiStream({
        onContent: onStreamContent,
        onComplete: onStreamComplete,
        conversation: updatedConversation,
      });
    } catch (error) {
      console.error('Error sending query:', error);
    }
  };

  const askFollowUpQuestion = async (conversation: IChatMessage[]) => {
    const contextSystemMessage: IRagConversationMessage = {
      _type: 'message',
      content: `User is asking a follow up question about ${askingAbout?.name}`,
      role: 'system',
    };

    const conversationWithoutUserQuery = [...conversation.slice(0, -1)];
    const userQueryMessage = conversation[conversation.length - 1];
    const updatedConversation = [
      ...conversationWithoutUserQuery,
      contextSystemMessage,
      userQueryMessage,
    ];

    setConversationUI((prev) => [
      ...prev,
      {
        ...contextSystemMessage,
        _type: 'message',
      },
    ]);

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

    const userQueryMessage: IRagConversationMessage = {
      content: query,
      role: 'user',
      _type: 'message',
    };

    const conversationWithNewQuery: TRagConversationItem[] = [
      ...conversationUI,
      userQueryMessage,
    ];

    responseRef.current = '';
    vectorMatchesRef.current = [];

    setIsLoading(true);
    setQuery('');
    setConversationUI(conversationWithNewQuery);

    const conversation = parseLLMConversation(conversationWithNewQuery);

    if (askingAbout) {
      askFollowUpQuestion(conversation);
    } else {
      askGenericQuestion(conversation);
    }
  };

  useEffect(() => {
    console.log('Conversation UI updated:', conversationUI);
  }, [conversationUI]);

  return {
    conversationUI,
    handleClickAskQuestion,
    askingAbout,
    response,
    handleSubmit,
    isLoading,
    query,
    setQuery,
    handleQuerySubmit,
  };
};
