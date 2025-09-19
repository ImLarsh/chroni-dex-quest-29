import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Star, Clock, Gift, Heart, Zap, Shield, Sword } from "lucide-react";
import { Link } from "react-router-dom";
import { Pokeball, PokemonCalendar } from "@/components/PokemonIcons";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface DailyPokemon {
  id: number;
  name: string;
  sprites: any;
  types: Array<{ type: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  height: number;
  weight: number;
  species: any;
  abilities: Array<{ ability: { name: string }; is_hidden: boolean }>;
}

interface Species {
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
  generation: { name: string };
  habitat?: { name: string };
  is_legendary: boolean;
  is_mythical: boolean;
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

const statIcons: Record<string, any> = {
  hp: Heart,
  attack: Sword,
  defense: Shield,
  "special-attack": Zap,
  "special-defense": Shield,
  speed: Zap
};

export default function PokemonDaily() {
  const [dailyPokemon, setDailyPokemon] = useState<DailyPokemon | null>(null);
  const [species, setSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [lastVisit, setLastVisit] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDailyPokemon();
    checkStreak();
  }, []);

  const getDayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const loadDailyPokemon = async () => {
    setLoading(true);
    try {
      // Use day of year to get consistent daily Pokémon
      const dayOfYear = getDayOfYear();
      const pokemonId = (dayOfYear % 1010) + 1; // Cycle through available Pokémon
      
      const [pokemonResponse, speciesResponse] = await Promise.all([
        axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
        axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)
      ]);
      
      setDailyPokemon(pokemonResponse.data);
      setSpecies(speciesResponse.data);
    } catch (error) {
      toast({
        title: "Loading Error",
        description: "Failed to load today's Pokémon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkStreak = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('pokemonDaily');
    
    if (stored) {
      const data = JSON.parse(stored);
      const lastVisitDate = new Date(data.lastVisit);
      const todayDate = new Date();
      const yesterday = new Date(todayDate);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (data.lastVisit === today) {
        // Already visited today
        setStreak(data.streak || 0);
        setLastVisit(data.lastVisit);
      } else if (lastVisitDate.toDateString() === yesterday.toDateString()) {
        // Visited yesterday, continue streak
        const newStreak = (data.streak || 0) + 1;
        setStreak(newStreak);
        setLastVisit(today);
        localStorage.setItem('pokemonDaily', JSON.stringify({
          lastVisit: today,
          streak: newStreak
        }));
        
        if (newStreak > 1) {
          toast({
            title: `${newStreak} Day Streak!`,
            description: "Keep coming back daily to maintain your streak!",
          });
        }
      } else {
        // Streak broken, start over
        setStreak(1);
        setLastVisit(today);
        localStorage.setItem('pokemonDaily', JSON.stringify({
          lastVisit: today,
          streak: 1
        }));
      }
    } else {
      // First visit
      setStreak(1);
      setLastVisit(today);
      localStorage.setItem('pokemonDaily', JSON.stringify({
        lastVisit: today,
        streak: 1
      }));
      
      toast({
        title: "Welcome!",
        description: "Check back daily to build your streak!",
      });
    }
  };

  const getFlavorText = () => {
    if (!species) return "No description available.";
    const englishEntry = species.flavor_text_entries.find(entry => entry.language.name === 'en');
    return englishEntry?.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') || "No description available.";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReward = () => {
    if (streak >= 30) return { icon: Gift, text: "Legendary Trainer!", color: "text-purple-500" };
    if (streak >= 14) return { icon: Star, text: "Master Trainer!", color: "text-yellow-500" };
    if (streak >= 7) return { icon: Zap, text: "Dedicated Trainer!", color: "text-blue-500" };
    if (streak >= 3) return { icon: Heart, text: "Committed Trainer!", color: "text-green-500" };
    return { icon: PokemonCalendar, text: "New Trainer!", color: "text-muted-foreground" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <div>
              <h2 className="text-xl font-semibold">Loading Today's Pokémon</h2>
              <p className="text-muted-foreground mt-1">Discovering your daily friend...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!dailyPokemon || !species) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <PokemonCalendar className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Unable to Load Daily Pokémon</h2>
          <Button onClick={loadDailyPokemon}>Try Again</Button>
        </Card>
      </div>
    );
  }

  const reward = getReward();
  const RewardIcon = reward.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pokédex
            </Link>
          </Button>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <PokemonCalendar className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pokémon of the Day</h1>
              <p className="text-muted-foreground">{formatDate()}</p>
            </div>
          </div>

          {/* Streak Info */}
          <Card className="inline-block p-4 mb-6">
            <div className="flex items-center gap-3">
              <RewardIcon className={cn("h-6 w-6", reward.color)} />
              <div className="text-left">
                <div className="font-semibold">{streak} Day Streak</div>
                <div className={cn("text-sm", reward.color)}>{reward.text}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pokemon Display */}
            <div className="space-y-6">
              <Card className="p-8 text-center">
                <div className="mb-6">
                  <img
                    src={dailyPokemon.sprites.other?.['official-artwork']?.front_default || dailyPokemon.sprites.front_default}
                    alt={dailyPokemon.name}
                    className="w-48 h-48 mx-auto object-contain"
                  />
                </div>
                
                <h2 className="text-3xl font-bold capitalize mb-2">{dailyPokemon.name}</h2>
                <p className="text-muted-foreground mb-4">#{dailyPokemon.id.toString().padStart(3, '0')}</p>
                
                <div className="flex justify-center gap-2 mb-6">
                  {dailyPokemon.types.map(type => (
                    <Badge key={type.type.name} className={cn("text-white", typeColors[type.type.name])}>
                      {type.type.name}
                    </Badge>
                  ))}
                </div>

                {/* Special Badges */}
                <div className="flex justify-center gap-2">
                  {species.is_legendary && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Legendary
                    </Badge>
                  )}
                  {species.is_mythical && (
                    <Badge className="bg-purple-500 text-white">
                      <Gift className="h-3 w-3 mr-1" />
                      Mythical
                    </Badge>
                  )}
                </div>
              </Card>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{(dailyPokemon.height / 10).toFixed(1)}m</div>
                  <div className="text-sm text-muted-foreground">Height</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{(dailyPokemon.weight / 10).toFixed(1)}kg</div>
                  <div className="text-sm text-muted-foreground">Weight</div>
                </Card>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Description */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{getFlavorText()}</p>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Generation:</span>
                    <span className="font-medium capitalize">{species.generation.name.replace('-', ' ')}</span>
                  </div>
                  {species.habitat && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Habitat:</span>
                      <span className="font-medium capitalize">{species.habitat.name}</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Base Stats</h3>
                <div className="space-y-4">
                  {dailyPokemon.stats.map((stat) => {
                    const StatIcon = statIcons[stat.stat.name] || Zap;
                    const percentage = (stat.base_stat / 200) * 100; // Assuming max stat of 200 for visualization
                    
                    return (
                      <div key={stat.stat.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <StatIcon className="h-4 w-4 text-secondary" />
                            <span className="font-medium">{statNames[stat.stat.name]}</span>
                          </div>
                          <span className="font-bold text-secondary">{stat.base_stat}</span>
                        </div>
                        <Progress value={Math.min(percentage, 100)} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Abilities */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Abilities</h3>
                <div className="space-y-3">
                  {dailyPokemon.abilities.map((ability, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium capitalize">
                        {ability.ability.name.replace('-', ' ')}
                      </span>
                      {ability.is_hidden && (
                        <Badge variant="secondary" className="text-xs">
                          Hidden
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Fun Fact */}
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Daily Challenge
                </h3>
                <p className="text-sm text-muted-foreground">
                  Come back tomorrow to discover a new Pokémon and continue your streak! 
                  The longer your streak, the more special rewards you'll unlock.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}