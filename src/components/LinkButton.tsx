'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';

export const LinkButton = ({
  href,
  title,
}: {
  href: string;
  title: string;
}) => {
  const pathname = usePathname();

  return (
    <Button asChild variant={pathname === href ? 'default' : 'outline'}>
      <Link href={href}>{title}</Link>
    </Button>
  );
};
