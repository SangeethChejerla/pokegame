'use client';

import { useState, useEffect } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getAllTypes, getPokemonDetails, getPokemonList, getTypeDetails } from '@/services/pokemonService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pokemon, Type } from '@/types';

export default function Game() {
  const [userCards, setUserCards] = useState<Pokemon[]>([]);
  const [pcCards, setPcCards] = useState<Pokemon[]>([]);
  const [userSelected, setUserSelected] = useState<Pokemon | null>(null);
  const [pcSelected, setPcSelected] = useState<Pokemon | null>(null);
  const [roundResult, setRoundResult] = useState<string>('');
  const [userScore, setUserScore] = useState(0);
  const [pcScore, setPcScore] = useState(0);
  const [round, setRound] = useState(1);

  // Fetch all Pokémon names
  const { data: pokemonList } = useQuery({
    queryKey: ['pokemonListInitial'],
    queryFn: () => getPokemonList(1000, 0),
  });

  // Fetch all types
  const { data: typesData } = useQuery({
    queryKey: ['types'],
    queryFn: async () => {
      const types = await getAllTypes();
      const typeDetails = await Promise.all(types.map((t) => getTypeDetails(t.url)));
      return typeDetails.reduce((acc, type) => {
        acc[type.name] = type;
        return acc;
      }, {} as Record<string, Type>);
    },
  });

  // Initialize game
  useEffect(() => {
    if (pokemonList && !userCards.length) {
      const shuffled = pokemonList.results.sort(() => 0.5 - Math.random());
      const selectedNames = shuffled.slice(0, 12).map((p) => p.name);
      const userNames = selectedNames.slice(0, 6);
      const pcNames = selectedNames.slice(6, 12);

      const fetchCards = async (names: string[]) => {
        const details = await Promise.all(names.map((name) => getPokemonDetails(name)));
        return details;
      };

      Promise.all([fetchCards(userNames), fetchCards(pcNames)]).then(([user, pc]) => {
        setUserCards(user);
        setPcCards(pc);
      });
    }
  }, [pokemonList]);

  const getStat = (pokemon: Pokemon, statName: string) => {
    const stat = pokemon.stats.find((s) => s.stat.name === statName);
    return stat ? stat.base_stat : 0;
  };

  const getEffectiveness = (moveType: string, defenderTypes: string[]): number => {
    if (!typesData) return 1;
    const type = typesData[moveType];
    let effectiveness = 1;
    for (const defType of defenderTypes) {
      if (type.damage_relations.double_damage_to.includes(defType)) effectiveness *= 2;
      else if (type.damage_relations.half_damage_to.includes(defType)) effectiveness *= 0.5;
      else if (type.damage_relations.no_damage_to.includes(defType)) effectiveness *= 0;
    }
    return effectiveness;
  };

  const playRound = (selected: Pokemon) => {
    if (!typesData) return;
    setUserSelected(selected);
    const pcCard = pcCards[Math.floor(Math.random() * pcCards.length)];
    setPcSelected(pcCard);

    const userAttack = getStat(selected, 'attack');
    const pcDefense = getStat(pcCard, 'defense');
    const userEff = getEffectiveness(selected.types[0].type.name, pcCard.types.map((t) => t.type.name));
    const userDamage = (userAttack / pcDefense) * 50 * userEff;

    const pcAttack = getStat(pcCard, 'attack');
    const userDefense = getStat(selected, 'defense');
    const pcEff = getEffectiveness(pcCard.types[0].type.name, selected.types.map((t) => t.type.name));
    const pcDamage = (pcAttack / userDefense) * 50 * pcEff;

    if (userDamage > pcDamage) {
      setRoundResult('User wins this round!');
      setUserScore((prev) => prev + 1);
    } else if (pcDamage > userDamage) {
      setRoundResult('PC wins this round!');
      setPcScore((prev) => prev + 1);
    } else {
      setRoundResult('It’s a draw!');
    }

    setTimeout(() => {
      setUserCards((prev) => prev.filter((p) => p.name !== selected.name));
      setPcCards((prev) => prev.filter((p) => p.name !== pcCard.name));
      setUserSelected(null);
      setPcSelected(null);
      setRoundResult('');
      setRound((prev) => prev + 1);
    }, 2000);
  };

  if (!userCards.length || !pcCards.length) return <div className="text-center p-4">Loading game...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pokémon Card Game</h1>
      <div className="flex justify-between mb-4">
        <p>User Score: {userScore}</p>
        <p>Round: {round}/6</p>
        <p>PC Score: {pcScore}</p>
      </div>

      {/* User Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Cards</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {userCards.map((pokemon) => (
            <Card key={pokemon.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={pokemon.sprites.front_default} alt={pokemon.name} className="mx-auto" />
                <Button onClick={() => playRound(pokemon)} disabled={!!userSelected} className="mt-2">
                  Select
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Battle Area */}
      {userSelected && pcSelected && (
        <div className="flex justify-around items-center mb-8">
          <Card>
            <CardHeader><CardTitle>User</CardTitle></CardHeader>
            <CardContent><img src={userSelected.sprites.front_default} alt={userSelected.name} /></CardContent>
          </Card>
          <p className="text-lg font-semibold">VS</p>
          <Card>
            <CardHeader><CardTitle>PC</CardTitle></CardHeader>
            <CardContent><img src={pcSelected.sprites.front_default} alt={pcSelected.name} /></CardContent>
          </Card>
        </div>
      )}
      {roundResult && <p className="text-center text-xl">{roundResult}</p>}

      {/* Game Over */}
      {round > 6 && (
        <div className="text-center">
          <h2 className="text-2xl font-bold">Game Over!</h2>
          <p>{userScore > pcScore ? 'You Win!' : pcScore > userScore ? 'PC Wins!' : 'It’s a Tie!'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Play Again</Button>
        </div>
      )}
    </div>
  );
}