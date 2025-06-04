import { IHouse } from '@/types';
import Image from 'next/image';
import { Button } from './ui/button';
import Link from 'next/link';
import clsx from 'clsx';

export const RagSearchResultHouseTile = ({
  house,
  matchScore,
  handleClickAskQuestion,
  askingAbout,
}: {
  house: IHouse;
  matchScore?: number;
  handleClickAskQuestion: (house: IHouse) => void;
  askingAbout: IHouse | null;
}) => {
  const { imageUrl, name } = house;

  return (
    <div className="border rounded p-3 space-y-2">
      <h3 className="font-bold text-xl">{name}</h3>

      {matchScore && <p>Score: {matchScore.toFixed(2)}</p>}

      <div className="relative aspect-[3/2] rounded overflow-hidden">
        <Image
          alt={name}
          src={`${imageUrl}?q=80&w=500`}
          fill
          className="object-cover"
        />
      </div>

      <Link href="/info" className="block">
        <Button className="w-full">View Page</Button>
      </Link>

      <Button
        onClick={() => handleClickAskQuestion(house)}
        variant="outline"
        className={clsx(
          'w-full',
          askingAbout?.id === house.id && 'bg-green-300 hover:bg-green-400'
        )}
      >
        Ask Question
      </Button>
    </div>
  );
};
