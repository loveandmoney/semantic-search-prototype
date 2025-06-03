import Image from 'next/image';

export const HouseTile = ({
  image,
  matchScore,
  name,
}: {
  image: string;
  name: string;
  matchScore: number;
}) => {
  return (
    <div className="border rounded p-3 space-y-2">
      <h3 className="font-bold text-xl">{name}</h3>
      <p>Match score: {matchScore}</p>

      <div className="relative aspect-[3/2] rounded overflow-hidden">
        <Image
          alt={name}
          src={`${image}?q=80&w=500`}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};
