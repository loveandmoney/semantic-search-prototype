export async function handleStreamResponse({
  response,
  onContent,
  onComplete
}: {
  response: Response;
  onContent: (chunk: string) => void;
  onComplete?: () => void;
}) {
  if (!response.ok) {
    throw new Error('Stream response failed');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No reader available');
  }

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      onComplete?.();
      break;
    }

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            onContent(data.content);
          }
        } catch {
          // skip invalid JSON
        }
      }
    }
  }
}
