'use client';

import { UpdateEmbeddingsButton } from '@/components/UpdateEmbeddingsButton';

export default function UpdateIndexPage() {
  return (
    <main className="space-y-6 max-w-[600px] m-auto">
      <p>
        Clicking this button will rebuild the whole index! Please don&apos;t
        press unless you know what you&apos;re doing.
      </p>
      <p className="text-2xl">🥺🥺🥺</p>
      <UpdateEmbeddingsButton />
    </main>
  );
}
