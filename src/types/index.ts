export interface PokemonListResponse {
    results: { name: string; url: string }[];
    count: number;
  }
  
  export interface Pokemon {
    name: string;
    types: { type: { name: string } }[];
    stats: { stat: { name: string }; base_stat: number }[];
    sprites: { front_default: string };
  }
  
  export interface Type {
    name: string;
    damage_relations: {
      double_damage_to: string[];
      half_damage_to: string[];
      no_damage_to: string[];
    };
  }