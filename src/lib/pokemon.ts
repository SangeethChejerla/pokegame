import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
});

export const getPokemonList = async (limit: number, offset: number) => {
  const response = await api.get(`/pokemon?limit=${limit}&offset=${offset}`);
  return response.data;
};

export const getPokemonDetails = async (name: string) => {
  const response = await api.get(`/pokemon/${name}`);
  return response.data;
};

export const getAllTypes = async () => {
  const response = await api.get('/type');
  return response.data.results.map((type: any) => ({
    name: type.name,
    url: type.url,
  }));
};

export const getTypeDetails = async (url: string) => {
  const response = await axios.get(url);
  return {
    name: response.data.name,
    damage_relations: {
      double_damage_to: response.data.damage_relations.double_damage_to.map((t: any) => t.name),
      half_damage_to: response.data.damage_relations.half_damage_to.map((t: any) => t.name),
      no_damage_to: response.data.damage_relations.no_damage_to.map((t: any) => t.name),
    },
  };
};