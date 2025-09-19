import { useState, useEffect } from 'react';
import axios from 'axios';

interface EvolutionChain {
  chain: {
    evolution_details: Array<{
      min_level?: number;
      trigger: {
        name: string;
      };
      item?: {
        name: string;
      };
    }>;
    evolves_to: Array<any>;
    species: {
      name: string;
      url: string;
    };
  };
}

export interface EvolutionStage {
  id: number;
  name: string;
  sprite: string;
  evolutionDetails?: {
    minLevel?: number;
    trigger?: string;
    item?: string;
  };
}

export function useEvolution(evolutionChainUrl?: string) {
  const [evolutionChain, setEvolutionChain] = useState<EvolutionStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evolutionChainUrl) return;

    const fetchEvolutionChain = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch evolution chain data
        const evolutionResponse = await axios.get(evolutionChainUrl);
        const evolutionData: EvolutionChain = evolutionResponse.data;

        // Parse evolution chain recursively
        const parseEvolutionChain = async (chain: any, evolutionDetails?: any): Promise<EvolutionStage[]> => {
          const stages: EvolutionStage[] = [];

          // Get pokemon ID from species URL
          const speciesId = parseInt(chain.species.url.split('/').slice(-2, -1)[0]);

          // Fetch pokemon data for sprite
          const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);
          const pokemonData = pokemonResponse.data;

          const stage: EvolutionStage = {
            id: speciesId,
            name: chain.species.name,
            sprite: pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default,
            evolutionDetails: evolutionDetails ? {
              minLevel: evolutionDetails.min_level,
              trigger: evolutionDetails.trigger?.name,
              item: evolutionDetails.item?.name,
            } : undefined,
          };

          stages.push(stage);

          // Process evolutions recursively
          for (const evolution of chain.evolves_to) {
            const nextStages = await parseEvolutionChain(evolution, evolution.evolution_details[0]);
            stages.push(...nextStages);
          }

          return stages;
        };

        const stages = await parseEvolutionChain(evolutionData.chain);
        setEvolutionChain(stages);
      } catch (err) {
        console.error('Error fetching evolution chain:', err);
        setError('Failed to load evolution data');
      } finally {
        setLoading(false);
      }
    };

    fetchEvolutionChain();
  }, [evolutionChainUrl]);

  return { evolutionChain, loading, error };
}