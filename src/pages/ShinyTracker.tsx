import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Plus, Trash2, Star, Search, Trophy, 
  Calendar, MapPin, Clock, Target, RotateCcw, Shuffle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Pokeball } from "@/components/PokemonIcons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface ShinyEncounter {
  id: string;
  pokemonId: number;
  pokemonName: string;
  sprite: string;
  shinySprite: string;
  method: string;
  attempts: number;
  location: string;
  date: Date;
  notes: string;
  odds: string;
}

interface HuntingSession {
  pokemonId: number;
  pokemonName: string;
  sprite: string;
  method: string;
  attempts: number;
  location: string;
  startDate: Date;
  targetOdds: string;
}

const huntingMethods = [
  { name: "Random Encounter", odds: "1/4096", color: "bg-gray-500" },
  { name: "Masuda Method", odds: "1/683", color: "bg-blue-500" },
  { name: "Shiny Charm", odds: "1/1365", color: "bg-yellow-500" },
  { name: "Masuda + Charm", odds: "1/512", color: "bg-green-500" },
  { name: "Chain Fishing", odds: "1/100", color: "bg-cyan-500" },
  { name: "Friend Safari", odds: "1/512", color: "bg-purple-500" },
  { name: "Radar Chain", odds: "1/99", color: "bg-red-500" },
  { name: "SOS Chain", odds: "1/273", color: "bg-pink-500" },
];

export default function ShinyTracker() {
  const [encounters, setEncounters] = useState<ShinyEncounter[]>([]);
  const [currentHunt, setCurrentHunt] = useState<HuntingSession | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState(huntingMethods[0]);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchPokemon();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const loadData = () => {
    const savedEncounters = localStorage.getItem('shiny-encounters');
    const savedHunt = localStorage.getItem('current-hunt');
    
    if (savedEncounters) {
      const encounters = JSON.parse(savedEncounters).map((e: any) => ({
        ...e,
        date: new Date(e.date)
      }));
      setEncounters(encounters);
    }
    
    if (savedHunt) {
      const hunt = JSON.parse(savedHunt);
      setCurrentHunt({
        ...hunt,
        startDate: new Date(hunt.startDate)
      });
    }
  };

  const saveData = (newEncounters?: ShinyEncounter[], newHunt?: HuntingSession | null) => {
    const encountersToSave = newEncounters || encounters;
    const huntToSave = newHunt !== undefined ? newHunt : currentHunt;
    
    localStorage.setItem('shiny-encounters', JSON.stringify(encountersToSave));
    if (huntToSave) {
      localStorage.setItem('current-hunt', JSON.stringify(huntToSave));
    } else {
      localStorage.removeItem('current-hunt');
    }
  };

  const searchPokemon = async () => {
    setIsSearching(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
      const filtered = response.data.results
        .filter((p: any) => p.name.includes(searchTerm.toLowerCase()))
        .slice(0, 8);
      setSearchResults(filtered);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search Pokémon",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const startHunt = async (pokemon: any) => {
    try {
      const response = await axios.get(pokemon.url);
      const data = response.data;
      
      const hunt: HuntingSession = {
        pokemonId: data.id,
        pokemonName: data.name,
        sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
        method: selectedMethod.name,
        attempts: 0,
        location: location || "Unknown",
        startDate: new Date(),
        targetOdds: selectedMethod.odds,
      };
      
      setCurrentHunt(hunt);
      saveData(undefined, hunt);
      setShowAddForm(false);
      setSearchTerm("");
      setLocation("");
      
      toast({
        title: "Hunt Started!",
        description: `Now hunting ${data.name} using ${selectedMethod.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start hunt",
        variant: "destructive",
      });
    }
  };

  const addAttempt = () => {
    if (!currentHunt) return;
    
    const updatedHunt = {
      ...currentHunt,
      attempts: currentHunt.attempts + 1
    };
    
    setCurrentHunt(updatedHunt);
    saveData(undefined, updatedHunt);
  };

  const foundShiny = () => {
    if (!currentHunt) return;
    
    const newEncounter: ShinyEncounter = {
      id: Date.now().toString(),
      pokemonId: currentHunt.pokemonId,
      pokemonName: currentHunt.pokemonName,
      sprite: currentHunt.sprite,
      shinySprite: currentHunt.sprite, // In reality, would fetch shiny sprite
      method: currentHunt.method,
      attempts: currentHunt.attempts,
      location: currentHunt.location,
      date: new Date(),
      notes: notes,
      odds: currentHunt.targetOdds,
    };
    
    const newEncounters = [newEncounter, ...encounters];
    setEncounters(newEncounters);
    setCurrentHunt(null);
    setNotes("");
    saveData(newEncounters, null);
    
    toast({
      title: "🌟 Shiny Found!",
      description: `Congratulations! Found ${currentHunt.pokemonName} after ${currentHunt.attempts} attempts!`,
    });
  };

  const stopHunt = () => {
    setCurrentHunt(null);
    saveData(undefined, null);
    toast({
      title: "Hunt Stopped",
      description: "You can start a new hunt anytime",
    });
  };

  const deleteEncounter = (id: string) => {
    const newEncounters = encounters.filter(e => e.id !== id);
    setEncounters(newEncounters);
    saveData(newEncounters);
    
    toast({
      title: "Encounter Deleted",
      description: "Shiny encounter has been removed",
    });
  };

  const getHuntProgress = () => {
    if (!currentHunt) return 0;
    const baseOdds = parseInt(currentHunt.targetOdds.split('/')[1]);
    return Math.min((currentHunt.attempts / baseOdds) * 100, 100);
  };

  const getHuntLuck = () => {
    if (!currentHunt) return 0;
    const baseOdds = parseInt(currentHunt.targetOdds.split('/')[1]);
    const probability = 1 - Math.pow((baseOdds - 1) / baseOdds, currentHunt.attempts);
    return probability * 100;
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
              <Shuffle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Shiny Tracker</h1>
              <p className="text-muted-foreground">Track your shiny encounters and hunting progress</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Hunt */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Current Hunt</h3>
                {!currentHunt && (
                  <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Hunt
                  </Button>
                )}
              </div>
              
              {currentHunt ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <img
                      src={currentHunt.sprite}
                      alt={currentHunt.pokemonName}
                      className="w-20 h-20 mx-auto mb-2"
                    />
                    <h4 className="font-semibold capitalize">{currentHunt.pokemonName}</h4>
                    <Badge variant="secondary">{currentHunt.method}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attempts</span>
                      <span className="font-bold">{currentHunt.attempts}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target Odds</span>
                      <span>{currentHunt.targetOdds}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Probability</span>
                      <span>{getHuntLuck().toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <Progress value={getHuntProgress()} className="h-2" />
                  
                  <div className="text-xs text-muted-foreground">
                    <div>Location: {currentHunt.location}</div>
                    <div>Started: {formatDistanceToNow(currentHunt.startDate, { addSuffix: true })}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button onClick={addAttempt} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      +1 Attempt
                    </Button>
                    <Button onClick={foundShiny} variant="outline" className="w-full">
                      <Star className="h-4 w-4 mr-2" />
                      Found Shiny!
                    </Button>
                    <Button onClick={stopHunt} variant="outline" size="sm" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Stop Hunt
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Add notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              ) : showAddForm ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search Pokémon..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Input
                    placeholder="Location (optional)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hunting Method</label>
                    <div className="grid grid-cols-1 gap-2">
                      {huntingMethods.map((method) => (
                        <Card
                          key={method.name}
                          className={cn(
                            "p-2 cursor-pointer text-sm",
                            selectedMethod.name === method.name ? "bg-primary/10 border-primary/20" : "hover:bg-accent"
                          )}
                          onClick={() => setSelectedMethod(method)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", method.color)} />
                              <span>{method.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{method.odds}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {isSearching && (
                    <div className="text-center py-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  )}
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {searchResults.map((pokemon) => (
                      <Card
                        key={pokemon.name}
                        className="p-2 cursor-pointer hover:bg-accent"
                        onClick={() => startHunt(pokemon)}
                      >
                        <span className="text-sm capitalize">{pokemon.name}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No active hunt</p>
                </div>
              )}
            </Card>
            
            {/* Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Shinies</span>
                  <span className="font-bold">{encounters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">This Month</span>
                  <span className="font-bold">
                    {encounters.filter(e => 
                      e.date.getMonth() === new Date().getMonth() &&
                      e.date.getFullYear() === new Date().getFullYear()
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Active Hunt</span>
                  <span className="font-bold">{currentHunt ? '1' : '0'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Encounters List */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Shiny Encounters ({encounters.length})</h3>
              </div>
              
              {encounters.length > 0 ? (
                <div className="space-y-4">
                  {encounters.map((encounter) => (
                    <Card key={encounter.id} className="p-4 border-l-4 border-l-yellow-500">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <img
                              src={encounter.sprite}
                              alt={encounter.pokemonName}
                              className="w-16 h-16"
                            />
                            <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-current" />
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold capitalize">{encounter.pokemonName}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(encounter.date, { addSuffix: true })}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">{encounter.method}</Badge>
                              <Badge variant="outline">{encounter.attempts} attempts</Badge>
                              <Badge variant="outline">{encounter.odds}</Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {encounter.location}
                            </div>
                            
                            {encounter.notes && (
                              <p className="text-sm text-muted-foreground italic">
                                "{encounter.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteEncounter(encounter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Shiny Encounters Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your first hunt to begin tracking your shiny encounters!
                  </p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start First Hunt
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}