import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { savePokemonDataToFile, loadPokemonDataFromFile, saveFavoritesToFile, loadFavoritesFromFile, isTauri } from '@/lib/tauri';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
}

interface UsePokemonReturn {
  pokemon: Pokemon[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedGeneration: string;
  setSelectedGeneration: (generation: string) => void;
  selectedGame: string;
  setSelectedGame: (game: string) => void;
  filteredPokemon: Pokemon[];
  getRandomPokemon: () => Pokemon | null;
  favorites: number[];
  toggleFavorite: (id: number) => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
}

const GENERATION_RANGES: Record<string, [number, number]> = {
  '1': [1, 151],
  '2': [152, 251],
  '3': [252, 386],
  '4': [387, 493],
  '5': [494, 649],
  '6': [650, 721],
  '7': [722, 809],
  '8': [810, 905],
  '9': [906, 1010],
};

// Pokemon available in specific games
const GAME_POKEMON: Record<string, number[]> = {
  'red-blue': Array.from({length: 150}, (_, i) => i + 1), // Original 150 (excluding Mew)
  'yellow': Array.from({length: 151}, (_, i) => i + 1), // All Gen 1 including Mew
  'gold-silver': Array.from({length: 251}, (_, i) => i + 1), // Gen 1-2
  'crystal': Array.from({length: 251}, (_, i) => i + 1), // Gen 1-2
  'ruby-sapphire': [
    ...Array.from({length: 135}, (_, i) => i + 252), // Gen 3 Pokemon
    ...Array.from({length: 151}, (_, i) => i + 1).filter(id => 
      [25, 26, 39, 40, 54, 55, 72, 73, 118, 119, 129, 130, 183, 184, 194, 195, 296, 297, 298].includes(id)
    ) // Select Gen 1-2 Pokemon available
  ],
  'emerald': [
    ...Array.from({length: 135}, (_, i) => i + 252), // All Gen 3
    ...Array.from({length: 151}, (_, i) => i + 1).filter(id => 
      [25, 26, 39, 40, 54, 55, 72, 73, 118, 119, 129, 130, 183, 184, 194, 195, 296, 297, 298].includes(id)
    )
  ],
  'diamond-pearl': Array.from({length: 493}, (_, i) => i + 1), // Gen 1-4
  'platinum': Array.from({length: 493}, (_, i) => i + 1), // Gen 1-4
  'black-white': Array.from({length: 156}, (_, i) => i + 494), // Only Gen 5 initially
  'black2-white2': Array.from({length: 649}, (_, i) => i + 1), // Gen 1-5
  'x-y': Array.from({length: 721}, (_, i) => i + 1), // Gen 1-6
  'sun-moon': Array.from({length: 809}, (_, i) => i + 1), // Gen 1-7
  'sword-shield': Array.from({length: 905}, (_, i) => i + 1), // Gen 1-8
  'scarlet-violet': Array.from({length: 1010}, (_, i) => i + 1), // All current Pokemon
};

export function usePokemon(): UsePokemonReturn {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedGeneration, setSelectedGeneration] = useState('all');
  const [selectedGame, setSelectedGame] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // Load favorites from file system (Tauri) or localStorage (web)
  useEffect(() => {
    const loadFavorites = async () => {
      if (isTauri) {
        const savedFavorites = await loadFavoritesFromFile();
        setFavorites(savedFavorites);
      } else {
        const savedFavorites = localStorage.getItem('pokemon-favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      }
    };
    
    loadFavorites();
  }, []);

  // Save favorites to file system (Tauri) or localStorage (web)
  useEffect(() => {
    const saveFavorites = async () => {
      if (isTauri) {
        await saveFavoritesToFile(favorites);
      } else {
        localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
      }
    };
    
    if (favorites.length > 0) {
      saveFavorites();
    }
  }, [favorites]);

  const fetchPokemon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from local cache first (Tauri only)
      if (isTauri) {
        const cachedData = await loadPokemonDataFromFile();
        if (cachedData && cachedData.length > 0) {
          setPokemon(cachedData);
          setLoading(false);
          console.log('Loaded Pokemon data from local cache');
          return;
        }
      }

      // Fetch first 1010 Pokemon (up to Gen 9)
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1010');
      const pokemonList = response.data.results;

      // Fetch detailed data for each Pokemon
      const detailedPokemon = await Promise.all(
        pokemonList.map(async (poke: { url: string }, index: number) => {
          try {
            const pokemonResponse = await axios.get(poke.url);
            return {
              id: index + 1,
              name: pokemonResponse.data.name,
              sprites: pokemonResponse.data.sprites,
              types: pokemonResponse.data.types,
              height: pokemonResponse.data.height,
              weight: pokemonResponse.data.weight,
            };
          } catch (error) {
            console.error(`Error fetching ${poke.url}:`, error);
            return null;
          }
        })
      );

      const validPokemon = detailedPokemon.filter((p): p is Pokemon => p !== null);
      setPokemon(validPokemon);

      // Save to local cache (Tauri only)
      if (isTauri) {
        await savePokemonDataToFile(validPokemon);
      }
      
    } catch (err) {
      setError('Failed to fetch Pokemon data. Please check your internet connection and try again.');
      console.error('Error fetching Pokemon:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  }, []);

  const filteredPokemon = pokemon.filter(poke => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      poke.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poke.id.toString().includes(searchTerm);

    // Type filter
    const matchesType = selectedType === 'all' || 
      poke.types.some(type => type.type.name === selectedType);

    // Generation filter
    const matchesGeneration = selectedGeneration === 'all' || 
      (GENERATION_RANGES[selectedGeneration] && 
       poke.id >= GENERATION_RANGES[selectedGeneration][0] && 
       poke.id <= GENERATION_RANGES[selectedGeneration][1]);

    // Game filter
    const matchesGame = selectedGame === 'all' || 
      (GAME_POKEMON[selectedGame] && GAME_POKEMON[selectedGame].includes(poke.id));

    // Favorites filter
    const matchesFavorites = !showFavorites || favorites.includes(poke.id);

    return matchesSearch && matchesType && matchesGeneration && matchesGame && matchesFavorites;
  });

  const getRandomPokemon = useCallback(() => {
    if (filteredPokemon.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredPokemon.length);
    return filteredPokemon[randomIndex];
  }, [filteredPokemon]);

  return {
    pokemon,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedGeneration,
    setSelectedGeneration,
    selectedGame,
    setSelectedGame,
    filteredPokemon,
    getRandomPokemon,
    favorites,
    toggleFavorite,
    showFavorites,
    setShowFavorites,
  };
}