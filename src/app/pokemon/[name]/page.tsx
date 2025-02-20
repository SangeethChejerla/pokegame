'use client';

import { useQuery } from '@tanstack/react-query';
import { getPokemonDetails } from '@/lib/pokemon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function PokemonDetail({ params }: { params: { name: string } }) {
  const { data: pokemon, isLoading } = useQuery({
    queryKey: ['pokemon', params.name],
    queryFn: () => getPokemonDetails(params.name),
  });

  if (isLoading) return <Skeleton className="h-64 w-full max-w-md mx-auto" />;

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</CardTitle>
        </CardHeader>
        <CardContent>
          <img src={pokemon.sprites.front_default} alt={pokemon.name} className="mx-auto" />
          <h3 className="font-semibold mt-2">Types:</h3>
          <ul>{pokemon.types.map((t) => <li key={t.type.name}>{t.type.name}</li>)}</ul>
          <h3 className="font-semibold mt-2">Stats:</h3>
          <ul>{pokemon.stats.map((s) => <li key={s.stat.name}>{s.stat.name}: {s.base_stat}</li>)}</ul>
        </CardContent>
      </Card>
    </div>
  );
}