'use client';

import { useQuery } from '@tanstack/react-query';
import { parseAsInteger, useQueryState } from 'nuqs';
import { getPokemonList } from '@/lib/pokemon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Define interfaces for type safety
interface Pokemon {
  name: string;
  url: string;
}

interface PokemonListResponse {
  count: number;
  results: Pokemon[];
}

export default function Home() {
  // Fix the useQueryState implementation
  const [type, setType] = useQueryState('type');
  const [page, setPage] = useQueryState('page', {
    parse: (value: string) => Number(value) || 1,
    serialize: (value: number) => String(value),
  });
  
  const ITEMS_PER_PAGE = 20;

  // Add proper typing to useQuery
  const { data, isLoading } = useQuery<PokemonListResponse>({
    queryKey: ['pokemonList', page],
    queryFn: () => getPokemonList(ITEMS_PER_PAGE, ((page || 1) - 1) * ITEMS_PER_PAGE),
  });

  const totalPages = data ? Math.ceil(data.count / ITEMS_PER_PAGE) : 1;

  // Handle pagination with proper type checking
  const handlePreviousPage = () => {
    if (page && page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page && page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pokémon List</h1>
      
      {/* Type Filter */}
      <Select value={type || ''} onValueChange={setType}>
        <SelectTrigger className="w-[180px] mb-4">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          {['fire', 'water', 'grass', 'electric', 'psychic'].map((t) => (
            <SelectItem key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Pokémon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
            <Skeleton key={idx} className="h-40 w-full" />
          ))
        ) : (
          data?.results.map((pokemon: Pokemon) => (
            <Link href={`/pokemon/${pokemon.name}`} key={pokemon.name}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[6]}.png`}
                    alt={pokemon.name}
                    className="mx-auto"
                  />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <Button 
          disabled={page === 1} 
          onClick={handlePreviousPage}
        >
          Previous
        </Button>
        <span>Page {page || 1} of {totalPages}</span>
        <Button 
          disabled={page >= totalPages} 
          onClick={handleNextPage}
        >
          Next
        </Button>
      </div>

      <Link href="/game" className="mt-4 inline-block">
        <Button>Play Game</Button>
      </Link>
    </div>
  );
}