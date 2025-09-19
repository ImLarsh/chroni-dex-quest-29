import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Search, ArrowRight, RotateCcw, TrendingUp, TrendingDown, Equal } from "lucide-react";
import { Link } from "react-router-dom";
import { Pokeball } from "@/components/PokemonIcons";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface PokemonData {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{ type: { name: string } }>;
  height: number;
  weight: number;
  base_experience: number;
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
  abilities: Array<{
    ability: { name: string };
    is_hidden: boolean;
  }>;
}

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-700",
  ghost: "bg-purple-600",
  dragon: "bg-indigo-600",
  dark: "bg-gray-700",
  steel: "bg-slate-500",
  fairy: "bg-pink-400",
};

const statNames: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed"
};

export default function PokemonCompare() {
  const [pokemon1, setPokemon1] = useState<PokemonData | null>(null);
  const [pokemon2, setPokemon2] = useState<PokemonData | null>(null);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const { toast } = useToast();

  const fetchPokemon = async (query: string, setData: (data: PokemonData | null) => void, setLoading: (loading: boolean) => void) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
      setData(response.data);
      toast({
        title: "Pokémon Loaded",
        description: `${response.data.name} data loaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Pokémon Not Found",
        description: `Could not find "${query}". Try using the Pokémon's name or ID.`,
        variant: "destructive",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch1 = () => fetchPokemon(search1, setPokemon1, setLoading1);
  const handleSearch2 = () => fetchPokemon(search2, setPokemon2, setLoading2);

  const clearComparison = () => {
    setPokemon1(null);
    setPokemon2(null);
    setSearch1("");
    setSearch2("");
  };

  const getStatComparison = (stat1: number, stat2: number) => {
    if (stat1 > stat2) return { icon: TrendingUp, color: "text-green-500", diff: stat1 - stat2 };
    if (stat1 < stat2) return { icon: TrendingDown, color: "text-red-500", diff: stat2 - stat1 };
    return { icon: Equal, color: "text-muted-foreground", diff: 0 };
  };

  const calculateBST = (pokemon: PokemonData) => {
    return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pokédex
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Pokeball className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pokémon Comparison</h1>
              <p className="text-muted-foreground">Compare stats and abilities between two Pokémon</p>
            </div>
          </div>

          <Button variant="outline" onClick={clearComparison}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Comparison
          </Button>
        </div>

        {/* Search Interface */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">First Pokémon</h3>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Pokémon name or ID..."
                  value={search1}
                  onChange={(e) => setSearch1(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch1()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch1} disabled={loading1 || !search1.trim()}>
                {loading1 ? "Loading..." : "Search"}
              </Button>
            </div>
            
            {pokemon1 && (
              <div className="text-center">
                <img
                  src={pokemon1.sprites.other['official-artwork'].front_default}
                  alt={pokemon1.name}
                  className="w-24 h-24 mx-auto mb-2 object-contain"
                />
                <h4 className="font-semibold capitalize">{pokemon1.name}</h4>
                <p className="text-sm text-muted-foreground">#{pokemon1.id.toString().padStart(3, '0')}</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Second Pokémon</h3>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Pokémon name or ID..."
                  value={search2}
                  onChange={(e) => setSearch2(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch2()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch2} disabled={loading2 || !search2.trim()}>
                {loading2 ? "Loading..." : "Search"}
              </Button>
            </div>
            
            {pokemon2 && (
              <div className="text-center">
                <img
                  src={pokemon2.sprites.other['official-artwork'].front_default}
                  alt={pokemon2.name}
                  className="w-24 h-24 mx-auto mb-2 object-contain"
                />
                <h4 className="font-semibold capitalize">{pokemon2.name}</h4>
                <p className="text-sm text-muted-foreground">#{pokemon2.id.toString().padStart(3, '0')}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Comparison Results */}
        {pokemon1 && pokemon2 && (
          <div className="space-y-6">
            {/* Basic Info Comparison */}
            <Card className="p-6">
              <h3 className="font-semibold mb-6 text-center">Basic Information</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <img
                    src={pokemon1.sprites.other['official-artwork'].front_default}
                    alt={pokemon1.name}
                    className="w-32 h-32 mx-auto mb-4 object-contain"
                  />
                  <h4 className="text-xl font-bold capitalize mb-2">{pokemon1.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-center gap-1">
                      {pokemon1.types.map(type => (
                        <Badge key={type.type.name} className={cn("text-white", typeColors[type.type.name])}>
                          {type.type.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Height:</span> {(pokemon1.height / 10).toFixed(1)}m</p>
                      <p><span className="font-medium">Weight:</span> {(pokemon1.weight / 10).toFixed(1)}kg</p>
                      <p><span className="font-medium">Base EXP:</span> {pokemon1.base_experience}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <ArrowRight className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">VS</p>
                  </div>
                </div>

                <div className="text-center">
                  <img
                    src={pokemon2.sprites.other['official-artwork'].front_default}
                    alt={pokemon2.name}
                    className="w-32 h-32 mx-auto mb-4 object-contain"
                  />
                  <h4 className="text-xl font-bold capitalize mb-2">{pokemon2.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-center gap-1">
                      {pokemon2.types.map(type => (
                        <Badge key={type.type.name} className={cn("text-white", typeColors[type.type.name])}>
                          {type.type.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Height:</span> {(pokemon2.height / 10).toFixed(1)}m</p>
                      <p><span className="font-medium">Weight:</span> {(pokemon2.weight / 10).toFixed(1)}kg</p>
                      <p><span className="font-medium">Base EXP:</span> {pokemon2.base_experience}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Comparison */}
            <Card className="p-6">
              <h3 className="font-semibold mb-6">Base Stats Comparison</h3>
              <div className="space-y-4">
                {pokemon1.stats.map((stat, index) => {
                  const stat2 = pokemon2.stats[index];
                  const comparison = getStatComparison(stat.base_stat, stat2.base_stat);
                  const ComparisonIcon = comparison.icon;
                  const maxStat = Math.max(stat.base_stat, stat2.base_stat);
                  
                  return (
                    <div key={stat.stat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{statNames[stat.stat.name]}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={cn("font-bold", stat.base_stat >= stat2.base_stat ? "text-green-600" : "text-red-600")}>
                            {stat.base_stat}
                          </span>
                          <ComparisonIcon className={cn("h-4 w-4", comparison.color)} />
                          <span className={cn("font-bold", stat2.base_stat >= stat.base_stat ? "text-green-600" : "text-red-600")}>
                            {stat2.base_stat}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Progress value={(stat.base_stat / maxStat) * 100} className="h-2" />
                        <Progress value={(stat2.base_stat / maxStat) * 100} className="h-2" />
                      </div>
                      {comparison.diff > 0 && (
                        <p className="text-xs text-center text-muted-foreground">
                          Difference: {comparison.diff} points
                        </p>
                      )}
                    </div>
                  );
                })}
                
                {/* Total Stats */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Base Stat Total</span>
                    <div className="flex items-center gap-4">
                      <span className={cn("font-bold text-lg", 
                        calculateBST(pokemon1) >= calculateBST(pokemon2) ? "text-green-600" : "text-red-600")}>
                        {calculateBST(pokemon1)}
                      </span>
                      <span className="text-muted-foreground">vs</span>
                      <span className={cn("font-bold text-lg",
                        calculateBST(pokemon2) >= calculateBST(pokemon1) ? "text-green-600" : "text-red-600")}>
                        {calculateBST(pokemon2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Abilities Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">{pokemon1.name} Abilities</h3>
                <div className="space-y-2">
                  {pokemon1.abilities.map((ability, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize">{ability.ability.name.replace('-', ' ')}</span>
                      {ability.is_hidden && (
                        <Badge variant="secondary" className="text-xs">Hidden</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">{pokemon2.name} Abilities</h3>
                <div className="space-y-2">
                  {pokemon2.abilities.map((ability, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize">{ability.ability.name.replace('-', ' ')}</span>
                      {ability.is_hidden && (
                        <Badge variant="secondary" className="text-xs">Hidden</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!pokemon1 && !pokemon2 && (
          <Card className="p-12 text-center">
            <Pokeball className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Compare</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search for two Pokémon above to see a detailed comparison of their stats, types, and abilities.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}