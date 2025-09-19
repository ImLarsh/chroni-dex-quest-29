import { useState, useEffect } from "react";
import { X, ArrowLeft, Heart, Zap, Shield, Swords, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useEvolution } from "@/hooks/useEvolution";
import { getPokemonStatIcon } from "@/components/PokemonIcons";
import axios from "axios";

interface PokemonDetail {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny: string;
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
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }>;
  species: {
    url: string;
  };
}

interface Species {
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
  }>;
  evolution_chain: {
    url: string;
  };
  generation: {
    name: string;
  };
}

interface Move {
  move: {
    name: string;
    url: string;
  };
  version_group_details: Array<{
    level_learned_at: number;
    move_learn_method: {
      name: string;
    };
    version_group: {
      name: string;
    };
  }>;
}

interface MoveDetail {
  name: string;
  type: {
    name: string;
  };
  damage_class: {
    name: string;
  };
  power: number | null;
  accuracy: number | null;
  pp: number;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
  }>;
}

interface PokemonDetailProps {
  pokemonId: number;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onSwitchPokemon?: (pokemonId: number) => void;
}

const typeColors: Record<string, string> = {
  normal: "bg-muted",
  fire: "bg-gradient-to-r from-red-500 to-orange-500",
  water: "bg-gradient-to-r from-blue-500 to-cyan-500",
  electric: "bg-gradient-to-r from-yellow-400 to-yellow-600",
  grass: "bg-gradient-to-r from-green-400 to-green-600",
  ice: "bg-gradient-to-r from-cyan-300 to-blue-300",
  fighting: "bg-gradient-to-r from-red-600 to-red-800",
  poison: "bg-gradient-to-r from-purple-500 to-purple-700",
  ground: "bg-gradient-to-r from-yellow-600 to-amber-600",
  flying: "bg-gradient-to-r from-indigo-400 to-sky-400",
  psychic: "bg-gradient-to-r from-pink-500 to-rose-500",
  bug: "bg-gradient-to-r from-lime-500 to-green-500",
  rock: "bg-gradient-to-r from-amber-600 to-yellow-700",
  ghost: "bg-gradient-to-r from-purple-600 to-indigo-600",
  dragon: "bg-gradient-to-r from-indigo-600 to-purple-600",
  dark: "bg-gradient-to-r from-gray-700 to-gray-900",
  steel: "bg-gradient-to-r from-slate-500 to-slate-700",
  fairy: "bg-gradient-to-r from-pink-400 to-rose-400",
};

const statNames: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

const statIcons: Record<string, any> = {
  hp: Heart,
  attack: Swords,
  defense: Shield,
  "special-attack": Zap,
  "special-defense": Shield,
  speed: ArrowRight,
};

export function PokemonDetail({ pokemonId, onClose, isFavorite, onToggleFavorite, onSwitchPokemon }: PokemonDetailProps) {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [species, setSpecies] = useState<Species | null>(null);
  const [moves, setMoves] = useState<MoveDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [movesLoading, setMovesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShiny, setShowShiny] = useState(false);

  const { evolutionChain, loading: evolutionLoading } = useEvolution(species?.evolution_chain?.url);

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch Pokemon data
        const pokemonResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const pokemonData = pokemonResponse.data;
        setPokemon(pokemonData);

        // Fetch species data
        const speciesResponse = await axios.get(pokemonData.species.url);
        const speciesData = speciesResponse.data;
        setSpecies(speciesData);

        // Fetch moves data (limit to first 20 for performance)
        setMovesLoading(true);
        const movePromises = pokemonData.moves
          .slice(0, 20)
          .map((moveData: Move) => axios.get(moveData.move.url));
        
        try {
          const moveResponses = await Promise.all(movePromises);
          const moveDetails = moveResponses.map(response => response.data);
          setMoves(moveDetails);
        } catch (moveError) {
          console.error('Error fetching moves:', moveError);
        } finally {
          setMovesLoading(false);
        }

      } catch (err) {
        console.error('Error fetching Pokemon detail:', err);
        setError('Failed to load Pokemon details');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [pokemonId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="p-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p>Loading Pokemon details...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">{error || 'Pokemon not found'}</p>
          <Button onClick={onClose}>Close</Button>
        </Card>
      </div>
    );
  }

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const cardBg = typeColors[primaryType] || typeColors.normal;

  const description = species?.flavor_text_entries
    ?.find(entry => entry.language.name === 'en')
    ?.flavor_text?.replace(/\f/g, ' ') || 'No description available.';

  const artworkUrl = showShiny 
    ? pokemon.sprites.other?.['official-artwork']?.front_shiny
    : pokemon.sprites.other?.['official-artwork']?.front_default;

  const spriteUrl = showShiny 
    ? pokemon.sprites.front_shiny 
    : pokemon.sprites.front_default;

  const imageUrl = artworkUrl || spriteUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Background */}
        <div className={cn("absolute inset-0 opacity-10", cardBg)} />
        
        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
              <p className="text-muted-foreground">#{pokemon.id.toString().padStart(3, '0')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(pokemon.id)}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-red-500 text-red-500")} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Image and Basic Info */}
              <div className="space-y-6">
                {/* Pokemon Image */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={imageUrl}
                      alt={pokemon.name}
                      className="w-64 h-64 object-contain mx-auto"
                    />
                    {pokemon.sprites.front_shiny && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowShiny(!showShiny)}
                        className="absolute bottom-0 right-0"
                      >
                        ✨ {showShiny ? 'Normal' : 'Shiny'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Types */}
                <div className="flex justify-center gap-2">
                  {pokemon.types.map((type) => (
                    <Badge
                      key={type.type.name}
                      className={cn(
                        "text-white border-0 capitalize font-medium px-4 py-2",
                        typeColors[type.type.name]
                      )}
                    >
                      {type.type.name}
                    </Badge>
                  ))}
                </div>

                {/* Basic Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{(pokemon.height / 10).toFixed(1)}m</p>
                    <p className="text-sm text-muted-foreground">Height</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{(pokemon.weight / 10).toFixed(1)}kg</p>
                    <p className="text-sm text-muted-foreground">Weight</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Detailed Info */}
              <div className="space-y-6">
                <Tabs defaultValue="stats" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="moves">Moves</TabsTrigger>
                    <TabsTrigger value="evolution">Evolution</TabsTrigger>
                  </TabsList>

                  <TabsContent value="stats" className="space-y-4">
                    {pokemon.stats.map((stat) => {
                      const StatIcon = getPokemonStatIcon(stat.stat.name);
                      const percentage = Math.min((stat.base_stat / 255) * 100, 100);
                      
                      return (
                        <div key={stat.stat.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <StatIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                {statNames[stat.stat.name] || stat.stat.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold">{stat.base_stat}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="info" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Abilities</h3>
                      <div className="space-y-1">
                        {pokemon.abilities.map((ability) => (
                          <Badge
                            key={ability.ability.name}
                            variant={ability.is_hidden ? "secondary" : "outline"}
                            className="capitalize"
                          >
                            {ability.ability.name} {ability.is_hidden && "(Hidden)"}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {species && (
                      <div>
                        <h3 className="font-semibold mb-2">Generation</h3>
                        <Badge variant="outline" className="capitalize">
                          {species.generation.name.replace('generation-', 'Gen ')}
                        </Badge>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="moves" className="space-y-4">
                    {movesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="ml-2 text-sm text-muted-foreground">Loading moves...</p>
                      </div>
                    ) : moves.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Moves (Top 20)</h3>
                        <div className="grid gap-3 max-h-80 overflow-y-auto">
                          {moves.map((move) => {
                            const description = move.flavor_text_entries
                              ?.find(entry => entry.language.name === 'en')
                              ?.flavor_text?.replace(/\f/g, ' ') || 'No description available.';
                            
                            return (
                              <div key={move.name} className="p-3 bg-muted rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium capitalize">{move.name.replace(/-/g, ' ')}</h4>
                                  <div className="flex items-center gap-2">
                                    <Badge className={cn("text-xs", typeColors[move.type.name])}>
                                      {move.type.name}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {move.damage_class.name}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                  {move.power && <span>Power: {move.power}</span>}
                                  {move.accuracy && <span>Accuracy: {move.accuracy}%</span>}
                                  <span>PP: {move.pp}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-8 text-center">No moves data available</p>
                    )}
                  </TabsContent>

                  <TabsContent value="evolution" className="space-y-4">
                    {evolutionLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : evolutionChain.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Evolution Chain</h3>
                        <div className="flex flex-wrap items-center gap-4">
                          {evolutionChain.map((stage, index) => (
                            <div key={stage.id} className="flex items-center">
                              <button
                                onClick={() => {
                                  if (stage.id !== pokemonId && onSwitchPokemon) {
                                    onSwitchPokemon(stage.id);
                                  }
                                }}
                                className={cn(
                                  "text-center p-2 rounded-lg transition-all hover:bg-muted/50",
                                  stage.id === pokemonId 
                                    ? "bg-primary/10 ring-2 ring-primary" 
                                    : "hover:scale-105 cursor-pointer"
                                )}
                                disabled={stage.id === pokemonId}
                              >
                                <img
                                  src={stage.sprite}
                                  alt={stage.name}
                                  className="w-16 h-16 object-contain mx-auto"
                                />
                                <p className="text-xs capitalize mt-1">{stage.name}</p>
                                {stage.evolutionDetails && (
                                  <p className="text-xs text-muted-foreground">
                                    {stage.evolutionDetails.minLevel && `Lv. ${stage.evolutionDetails.minLevel}`}
                                    {stage.evolutionDetails.item && stage.evolutionDetails.item}
                                  </p>
                                )}
                              </button>
                              {index < evolutionChain.length - 1 && (
                                <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground py-8 text-center">No evolution data available</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}