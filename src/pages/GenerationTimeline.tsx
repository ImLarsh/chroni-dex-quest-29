import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Search, 
  Gamepad2, MapPin, Users, Zap 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Pokeball } from "@/components/PokemonIcons";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface Generation {
  id: number;
  name: string;
  region: string;
  year: number;
  games: string[];
  pokemonCount: number;
  pokemonRange: [number, number];
  legendaries: string[];
  description: string;
  color: string;
  features: string[];
}

const generations: Generation[] = [
  {
    id: 1,
    name: "Generation I",
    region: "Kanto",
    year: 1996,
    games: ["Red", "Blue", "Yellow"],
    pokemonCount: 151,
    pokemonRange: [1, 151],
    legendaries: ["Articuno", "Zapdos", "Moltres", "Mewtwo", "Mew"],
    description: "The original generation that started it all, introducing the world to Pokémon.",
    color: "bg-red-500",
    features: ["Original 151 Pokémon", "Gym Leaders", "Elite Four", "Trading"]
  },
  {
    id: 2,
    name: "Generation II",
    region: "Johto",
    year: 1999,
    games: ["Gold", "Silver", "Crystal"],
    pokemonCount: 100,
    pokemonRange: [152, 251],
    legendaries: ["Raikou", "Entei", "Suicune", "Lugia", "Ho-Oh", "Celebi"],
    description: "Introduced day/night cycles, breeding, and Steel/Dark types.",
    color: "bg-yellow-500",
    features: ["Day/Night Cycle", "Breeding System", "2 New Types", "Real-time Clock"]
  },
  {
    id: 3,
    name: "Generation III",
    region: "Hoenn",
    year: 2002,
    games: ["Ruby", "Sapphire", "Emerald"],
    pokemonCount: 135,
    pokemonRange: [252, 386],
    legendaries: ["Kyogre", "Groudon", "Rayquaza", "Latios", "Latias", "Jirachi", "Deoxys"],
    description: "Featured abilities, double battles, and contests.",
    color: "bg-emerald-500",
    features: ["Pokémon Abilities", "Double Battles", "Secret Bases", "Contests"]
  },
  {
    id: 4,
    name: "Generation IV",
    region: "Sinnoh",
    year: 2006,
    games: ["Diamond", "Pearl", "Platinum"],
    pokemonCount: 107,
    pokemonRange: [387, 493],
    legendaries: ["Dialga", "Palkia", "Giratina", "Uxie", "Mesprit", "Azelf"],
    description: "Introduced physical/special split and online trading.",
    color: "bg-blue-500",
    features: ["Physical/Special Split", "Underground", "Online Trading", "Touch Screen"]
  },
  {
    id: 5,
    name: "Generation V",
    region: "Unova",
    year: 2010,
    games: ["Black", "White", "Black 2", "White 2"],
    pokemonCount: 156,
    pokemonRange: [494, 649],
    legendaries: ["Reshiram", "Zekrom", "Kyurem", "Cobalion", "Terrakion", "Virizion"],
    description: "Featured only new Pokémon initially and seasonal changes.",
    color: "bg-gray-700",
    features: ["Only New Pokémon", "Seasonal Changes", "Hidden Abilities", "3D Graphics"]
  },
  {
    id: 6,
    name: "Generation VI",
    region: "Kalos",
    year: 2013,
    games: ["X", "Y"],
    pokemonCount: 72,
    pokemonRange: [650, 721],
    legendaries: ["Xerneas", "Yveltal", "Zygarde"],
    description: "Introduced 3D graphics, Mega Evolution, and Fairy type.",
    color: "bg-pink-500",
    features: ["3D Graphics", "Mega Evolution", "Fairy Type", "Character Customization"]
  },
  {
    id: 7,
    name: "Generation VII",
    region: "Alola",
    year: 2016,
    games: ["Sun", "Moon", "Ultra Sun", "Ultra Moon"],
    pokemonCount: 88,
    pokemonRange: [722, 809],
    legendaries: ["Solgaleo", "Lunala", "Necrozma"],
    description: "Featured Z-Moves, regional variants, and Trials instead of Gyms.",
    color: "bg-orange-500",
    features: ["Z-Moves", "Regional Variants", "Island Trials", "Festival Plaza"]
  },
  {
    id: 8,
    name: "Generation VIII",
    region: "Galar",
    year: 2019,
    games: ["Sword", "Shield"],
    pokemonCount: 96,
    pokemonRange: [810, 905],
    legendaries: ["Zacian", "Zamazenta", "Eternatus"],
    description: "Introduced Dynamax, Wild Area, and Raid Battles.",
    color: "bg-purple-500",
    features: ["Dynamax", "Wild Area", "Raid Battles", "Camp"]
  },
  {
    id: 9,
    name: "Generation IX",
    region: "Paldea",
    year: 2022,
    games: ["Scarlet", "Violet"],
    pokemonCount: 105,
    pokemonRange: [906, 1010],
    legendaries: ["Koraidon", "Miraidon"],
    description: "Open world gameplay with three storylines and Terastalization.",
    color: "bg-teal-500",
    features: ["Open World", "Terastalization", "Three Storylines", "Co-op Multiplayer"]
  }
];

export default function GenerationTimeline() {
  const [selectedGeneration, setSelectedGeneration] = useState<Generation>(generations[0]);
  const [pokemonSample, setPokemonSample] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadPokemonSample();
  }, [selectedGeneration]);

  const loadPokemonSample = async () => {
    setLoading(true);
    try {
      const [start, end] = selectedGeneration.pokemonRange;
      const sampleIds = [];
      
      // Get a sample of 6 Pokemon from the generation
      for (let i = 0; i < 6; i++) {
        const randomId = Math.floor(Math.random() * (end - start + 1)) + start;
        if (!sampleIds.includes(randomId)) {
          sampleIds.push(randomId);
        }
      }
      
      const pokemonData = await Promise.all(
        sampleIds.slice(0, 6).map(async (id) => {
          try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
            return response.data;
          } catch {
            return null;
          }
        })
      );
      
      setPokemonSample(pokemonData.filter(p => p !== null));
    } catch (error) {
      toast({
        title: "Loading Error",
        description: "Failed to load Pokémon sample",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextGeneration = () => {
    const currentIndex = generations.findIndex(g => g.id === selectedGeneration.id);
    const nextIndex = (currentIndex + 1) % generations.length;
    setSelectedGeneration(generations[nextIndex]);
  };

  const previousGeneration = () => {
    const currentIndex = generations.findIndex(g => g.id === selectedGeneration.id);
    const prevIndex = currentIndex === 0 ? generations.length - 1 : currentIndex - 1;
    setSelectedGeneration(generations[prevIndex]);
  };

  const filteredGenerations = generations.filter(gen =>
    searchTerm === "" ||
    gen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gen.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gen.games.some(game => game.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Generation Timeline</h1>
              <p className="text-muted-foreground">Explore Pokémon history by generation</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Generation Selector */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Generations</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search generations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredGenerations.map((gen) => (
                    <Card
                      key={gen.id}
                      className={cn(
                        "p-3 cursor-pointer transition-colors",
                        selectedGeneration.id === gen.id 
                          ? "bg-primary/10 border-primary/20" 
                          : "hover:bg-accent"
                      )}
                      onClick={() => setSelectedGeneration(gen)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", gen.color)} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Gen {gen.id}</div>
                          <div className="text-xs text-muted-foreground">{gen.region}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{gen.year}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Generation Header */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <Button variant="outline" size="sm" onClick={previousGeneration}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="text-center">
                  <div className={cn("w-4 h-4 rounded-full mx-auto mb-2", selectedGeneration.color)} />
                  <h2 className="text-2xl font-bold">{selectedGeneration.name}</h2>
                  <p className="text-muted-foreground">{selectedGeneration.region} Region • {selectedGeneration.year}</p>
                </div>
                
                <Button variant="outline" size="sm" onClick={nextGeneration}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <p className="text-center text-lg mb-6">{selectedGeneration.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedGeneration.pokemonCount}</div>
                  <div className="text-sm text-muted-foreground">New Pokémon</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedGeneration.games.length}</div>
                  <div className="text-sm text-muted-foreground">Main Games</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedGeneration.legendaries.length}</div>
                  <div className="text-sm text-muted-foreground">Legendaries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedGeneration.features.length}</div>
                  <div className="text-sm text-muted-foreground">New Features</div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Games & Features */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5" />
                  Games & Features
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Main Games</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGeneration.games.map(game => (
                        <Badge key={game} variant="secondary">{game}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Key Features</h4>
                    <ul className="space-y-1">
                      {selectedGeneration.features.map((feature, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Legendary Pokémon */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Legendary Pokémon
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {selectedGeneration.legendaries.map(legendary => (
                    <div
                      key={legendary}
                      className="p-2 bg-muted rounded text-sm text-center font-medium"
                    >
                      {legendary}
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-accent rounded">
                  <div className="text-sm">
                    <span className="font-medium">Pokémon Range: </span>
                    #{selectedGeneration.pokemonRange[0].toString().padStart(3, '0')} - 
                    #{selectedGeneration.pokemonRange[1].toString().padStart(3, '0')}
                  </div>
                </div>
              </Card>
            </div>

            {/* Pokémon Sample */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Pokémon Sample
                </h3>
                <Button variant="outline" size="sm" onClick={loadPokemonSample}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Refresh Sample
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Loading Pokémon...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {pokemonSample.map((pokemon) => (
                    <Card key={pokemon.id} className="p-3 text-center hover:shadow-md transition-shadow">
                      <img
                        src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default}
                        alt={pokemon.name}
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <div className="text-xs font-medium capitalize">{pokemon.name}</div>
                      <div className="text-xs text-muted-foreground">#{pokemon.id.toString().padStart(3, '0')}</div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}