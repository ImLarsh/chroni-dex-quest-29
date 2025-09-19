import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Plus, X, Search, Shield, Sword, Zap, AlertTriangle,
  CheckCircle, Circle, RotateCcw, Download, Share, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { Pokeball } from "@/components/PokemonIcons";
import { usePokemon } from "@/hooks/usePokemon";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface TeamPokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

const typeChart: Record<string, { weak: string[], resist: string[], immune: string[] }> = {
  normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
  fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
  water: { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'], immune: [] },
  electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [] },
  grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'electric', 'grass', 'ground'], immune: [] },
  ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [] },
  poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
  ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'] },
  flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [] },
  bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [] },
  ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'electric', 'grass'], immune: [] },
  dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'] },
  steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
  fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'] }
};

export default function TeamBuilder() {
  const [team, setTeam] = useState<(TeamPokemon | null)[]>(Array(6).fill(null));
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchPokemon();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchPokemon = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
      const filtered = response.data.results
        .filter((p: any) => p.name.includes(searchTerm.toLowerCase()))
        .slice(0, 10);
      setSearchResults(filtered);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search Pokémon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToTeam = async (pokemon: any, slotIndex: number) => {
    try {
      const response = await axios.get(pokemon.url);
      const pokemonData = response.data;
      
      const teamPokemon: TeamPokemon = {
        id: pokemonData.id,
        name: pokemonData.name,
        types: pokemonData.types.map((t: any) => t.type.name),
        sprite: pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default,
        stats: {
          hp: pokemonData.stats[0].base_stat,
          attack: pokemonData.stats[1].base_stat,
          defense: pokemonData.stats[2].base_stat,
          specialAttack: pokemonData.stats[3].base_stat,
          specialDefense: pokemonData.stats[4].base_stat,
          speed: pokemonData.stats[5].base_stat,
        }
      };

      const newTeam = [...team];
      newTeam[slotIndex] = teamPokemon;
      setTeam(newTeam);
      setSelectedSlot(null);
      setSearchTerm("");
      setSearchResults([]);

      toast({
        title: "Pokémon Added",
        description: `${pokemonData.name} added to your team!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add Pokémon to team",
        variant: "destructive",
      });
    }
  };

  const removeFromTeam = (index: number) => {
    const newTeam = [...team];
    newTeam[index] = null;
    setTeam(newTeam);
  };

  const clearTeam = () => {
    setTeam(Array(6).fill(null));
    toast({
      title: "Team Cleared",
      description: "All Pokémon removed from your team",
    });
  };

  const analyzeTeamCoverage = () => {
    const teamTypes = team
      .filter(p => p !== null)
      .flatMap(p => p!.types);
    
    const allTypes = Object.keys(typeChart);
    const coverage = allTypes.map(type => {
      const effectiveness = teamTypes.some(teamType => 
        typeChart[teamType]?.weak?.includes(type)
      );
      return { type, covered: effectiveness };
    });

    return coverage;
  };

  const getTeamWeaknesses = () => {
    const teamTypes = team
      .filter(p => p !== null)
      .flatMap(p => p!.types);
    
    const weaknesses = new Set<string>();
    teamTypes.forEach(type => {
      typeChart[type]?.weak?.forEach(weakness => weaknesses.add(weakness));
    });

    return Array.from(weaknesses);
  };

  const getTeamResistances = () => {
    const teamTypes = team
      .filter(p => p !== null)
      .flatMap(p => p!.types);
    
    const resistances = new Set<string>();
    teamTypes.forEach(type => {
      typeChart[type]?.resist?.forEach(resistance => resistances.add(resistance));
    });

    return Array.from(resistances);
  };

  const shareTeam = () => {
    const teamData = team.filter(p => p !== null).map(p => p!.name).join(', ');
    navigator.clipboard.writeText(teamData);
    toast({
      title: "Team Copied",
      description: "Team composition copied to clipboard!",
    });
  };

  const coverage = analyzeTeamCoverage();
  const weaknesses = getTeamWeaknesses();
  const resistances = getTeamResistances();
  const teamSize = team.filter(p => p !== null).length;

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
              <h1 className="text-3xl font-bold">Team Builder</h1>
              <p className="text-muted-foreground">Build your perfect Pokémon team</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {teamSize}/6 Pokémon
            </Badge>
            <Button variant="outline" size="sm" onClick={clearTeam} disabled={teamSize === 0}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Team
            </Button>
            <Button variant="outline" size="sm" onClick={shareTeam} disabled={teamSize === 0}>
              <Share className="h-4 w-4 mr-2" />
              Share Team
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Team Slots */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Your Team</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {team.map((pokemon, index) => (
                  <div key={index} className="relative">
                    {pokemon ? (
                      <Card className="p-4 border-2 border-primary/20">
                        <button
                          onClick={() => removeFromTeam(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="text-center space-y-2">
                          <img
                            src={pokemon.sprite}
                            alt={pokemon.name}
                            className="w-16 h-16 mx-auto object-contain"
                          />
                          <h3 className="font-medium capitalize">{pokemon.name}</h3>
                          <div className="flex gap-1 justify-center">
                            {pokemon.types.map(type => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card
                        className="p-4 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedSlot(index)}
                      >
                        <div className="text-center text-muted-foreground">
                          <Plus className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Add Pokémon</p>
                        </div>
                      </Card>
                    )}
                  </div>
                ))}
              </div>

              {/* Search Interface */}
              {selectedSlot !== null && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Add to Slot {selectedSlot + 1}</h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search Pokémon..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {loading && (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {searchResults.map((pokemon) => (
                      <Card
                        key={pokemon.name}
                        className="p-3 cursor-pointer hover:bg-accent"
                        onClick={() => addToTeam(pokemon, selectedSlot)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <Circle className="h-4 w-4" />
                          </div>
                          <span className="font-medium capitalize">{pokemon.name}</span>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => setSelectedSlot(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Team Analysis */}
          <div className="space-y-6">
            {/* Team Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Team Analysis
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Team Size</span>
                    <span className="font-medium">{teamSize}/6</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(teamSize / 6) * 100}%` }}
                    />
                  </div>
                </div>

                {teamSize > 0 && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Team Weaknesses
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {weaknesses.map(weakness => (
                          <Badge key={weakness} variant="destructive" className="text-xs">
                            {weakness}
                          </Badge>
                        ))}
                        {weaknesses.length === 0 && (
                          <span className="text-xs text-muted-foreground">None identified</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Team Resistances
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {resistances.map(resistance => (
                          <Badge key={resistance} variant="secondary" className="text-xs">
                            {resistance}
                          </Badge>
                        ))}
                        {resistances.length === 0 && (
                          <span className="text-xs text-muted-foreground">None identified</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Type Coverage */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Type Coverage
              </h3>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                {coverage.map(({ type, covered }) => (
                  <div
                    key={type}
                    className={`p-2 rounded text-center capitalize ${
                      covered 
                        ? 'bg-green-500/20 text-green-700 dark:text-green-300' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {type}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coverage:</span>
                  <span className="font-medium">
                    {coverage.filter(c => c.covered).length}/{coverage.length} types
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}