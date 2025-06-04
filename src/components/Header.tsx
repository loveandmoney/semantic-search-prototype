'use client';

import { LinkButton } from './LinkButton';

export const Header = () => {
  return (
    <header>
      <nav className="flex gap-4 p-8">
        <LinkButton href="/" title="Semantic Search" />
        <LinkButton href="/rag" title="RAG Search" />
        <LinkButton href="/update-index" title="Update Index" />
      </nav>
    </header>
  );
};
