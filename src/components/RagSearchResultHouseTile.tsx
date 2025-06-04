import { IHouse } from '@/types';
import { Button } from './ui/button';
import Link from 'next/link';

export const RagSearchResultHouseTile = ({
  house,
  matchScore,
}: {
  house: IHouse;
  matchScore?: number;
}) => {
  const { imageUrl, name } = house;

  return (
    <div className="border rounded p-3 space-y-2">
      <h3 className="font-bold text-xl">{name}</h3>

      {matchScore && <p>Score: {matchScore.toFixed(2)}</p>}

      <div className="relative aspect-[3/2] rounded overflow-hidden">
        <img
          src={`${imageUrl}?q=80&w=500`}
          alt=""
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>

      <Link href="/info" className="block">
        <Button className="w-full">View Page</Button>
      </Link>
    </div>
  );
};
