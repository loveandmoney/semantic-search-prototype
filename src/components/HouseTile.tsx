import { IHouse } from '@/types';
import Image from 'next/image';

export const HouseTile = ({
  house,
  matchScore,
}: {
  house: IHouse;
  matchScore: number;
}) => {
  const { description, imageUrl, name, tags } = house;

  return (
    <div className="border rounded p-3 space-y-2">
      <h3 className="font-bold text-xl">{name}</h3>
      <p>Match score: {matchScore}</p>

      <div className="relative aspect-[3/2] rounded overflow-hidden">
        <Image
          alt={name}
          src={`${imageUrl}?q=80&w=500`}
          fill
          className="object-cover"
        />
      </div>

      <p>{description}</p>

      <div className="gap-2 flex flex-wrap">
        {tags.map((tag, i) => (
          <span key={i} className="bg-black/10 px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
