'use client';

import { LinkButton } from './LinkButton';

export const Header = () => {
  return (
    <header>
      <nav className="flex gap-4 p-8">
        <LinkButton href="/" title="Home" />
        <LinkButton href="/rag" title="RAG" />
        <LinkButton href="/typesense" title="Typesense" />
        <LinkButton href="/suburb-search" title="Suburbs" />
        <LinkButton href="/danger-zone" title="Danger Zone" />
      </nav>
    </header>
  );
};
