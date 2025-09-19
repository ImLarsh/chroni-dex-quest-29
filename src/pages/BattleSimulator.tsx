import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Sword, Shield, Zap, Heart, Search, 
  RotateCcw, Play, Trophy, AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Pokeball, PokemonBattle } from "@/components/PokemonIcons";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface BattlePokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  currentHp: number;
  maxHp: number;
  moves: string[];
}

const typeEffectiveness: Record<string, Record<string, number>> = {
  fire: { grass: 2, ice: 2, bug: 2, steel: 2, water: 0.5, fire: 0.5, rock: 0.5, dragon: 0.5 },
  water: { fire: 2, ground: 2, rock: 2, grass: 0.5, water: 0.5, dragon: 0.5 },
  grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, flying: 2, grass: 0.5, electric: 0.5, dragon: 0.5, ground: 0 },
  // Simplified type chart for demo
};

export default function BattleSimulator() {
  const [playerPokemon, setPlayerPokemon] = useState<BattlePokemon | null>(null);
  const [opponentPokemon, setOpponentPokemon] = useState<BattlePokemon | null>(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'opponent'>('player');
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchPokemon();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

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

  const loadPokemon = async (pokemon: any): Promise<BattlePokemon> => {
    const response = await axios.get(pokemon.url);
    const data = response.data;
    
    const battlePokemon: BattlePokemon = {
      id: data.id,
      name: data.name,
      sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
      types: data.types.map((t: any) => t.type.name),
      stats: {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        speed: data.stats[5].base_stat,
      },
      currentHp: data.stats[0].base_stat,
      maxHp: data.stats[0].base_stat,
      moves: ['Tackle', 'Quick Attack', 'Thunderbolt', 'Flamethrower'].slice(0, Math.floor(Math.random() * 3) + 2),
    };
    
    return battlePokemon;
  };

  const selectPlayerPokemon = async (pokemon: any) => {
    try {
      const battlePokemon = await loadPokemon(pokemon);
      setPlayerPokemon(battlePokemon);
      setSearchTerm("");
      setSearchResults([]);
      toast({
        title: "Pokémon Selected",
        description: `${battlePokemon.name} is ready for battle!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Pokémon",
        variant: "destructive",
      });
    }
  };

  const generateRandomOpponent = async () => {
    try {
      const randomId = Math.floor(Math.random() * 150) + 1;
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const battlePokemon = await loadPokemon({ url: response.config.url });
      setOpponentPokemon(battlePokemon);
      toast({
        title: "Wild Pokémon Appears!",
        description: `A wild ${battlePokemon.name} wants to battle!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate opponent",
        variant: "destructive",
      });
    }
  };

  const startBattle = () => {
    if (!playerPokemon || !opponentPokemon) return;
    
    setBattleStarted(true);
    setCurrentTurn(playerPokemon.stats.speed >= opponentPokemon.stats.speed ? 'player' : 'opponent');
    setBattleLog([`${playerPokemon.name} vs ${opponentPokemon.name} - Battle Start!`]);
    setWinner(null);
  };

  const calculateDamage = (attacker: BattlePokemon, defender: BattlePokemon, move: string): number => {
    const baseDamage = Math.floor((attacker.stats.attack / defender.stats.defense) * 25);
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 - 1.2
    let effectiveness = 1;
    
    // Simple type effectiveness (would be more complex in real implementation)
    if (move === 'Thunderbolt' && defender.types.includes('water')) effectiveness = 2;
    if (move === 'Flamethrower' && defender.types.includes('grass')) effectiveness = 2;
    if (move === 'Flamethrower' && defender.types.includes('water')) effectiveness = 0.5;
    
    return Math.max(1, Math.floor(baseDamage * randomFactor * effectiveness));
  };

  const executeMove = (attacker: BattlePokemon, defender: BattlePokemon, move: string) => {
    const damage = calculateDamage(attacker, defender, move);
    const newHp = Math.max(0, defender.currentHp - damage);
    
    if (defender === playerPokemon) {
      setPlayerPokemon({ ...defender, currentHp: newHp });
    } else {
      setOpponentPokemon({ ...defender, currentHp: newHp });
    }
    
    const effectiveness = damage > 25 ? "It's super effective!" : damage < 15 ? "It's not very effective..." : "";
    setBattleLog(prev => [
      ...prev,
      `${attacker.name} used ${move}! Dealt ${damage} damage. ${effectiveness}`,
      ...(newHp === 0 ? [`${defender.name} fainted!`] : [])
    ]);
    
    if (newHp === 0) {
      setWinner(attacker === playerPokemon ? 'player' : 'opponent');
      setBattleStarted(false);
    } else {
      setCurrentTurn(currentTurn === 'player' ? 'opponent' : 'player');
    }
  };

  const playerAttack = (move: string) => {
    if (!playerPokemon || !opponentPokemon || currentTurn !== 'player') return;
    executeMove(playerPokemon, opponentPokemon, move);
  };

  useEffect(() => {
    if (currentTurn === 'opponent' && battleStarted && opponentPokemon) {
      const timer = setTimeout(() => {
        const randomMove = opponentPokemon.moves[Math.floor(Math.random() * opponentPokemon.moves.length)];
        executeMove(opponentPokemon, playerPokemon!, randomMove);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, battleStarted]);

  const resetBattle = () => {
    if (playerPokemon) {
      setPlayerPokemon({ ...playerPokemon, currentHp: playerPokemon.maxHp });
    }
    if (opponentPokemon) {
      setOpponentPokemon({ ...opponentPokemon, currentHp: opponentPokemon.maxHp });
    }
    setBattleStarted(false);
    setBattleLog([]);
    setWinner(null);
    setCurrentTurn('player');
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
              <PokemonBattle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Battle Simulator</h1>
              <p className="text-muted-foreground">Simple Pokémon battle mechanics</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Setup Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Battle Setup</h3>
              
              {/* Player Pokemon Selection */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Pokémon</label>
                  {playerPokemon ? (
                    <Card className="p-3 border-primary/20">
                      <div className="flex items-center gap-3">
                        <img src={playerPokemon.sprite} alt={playerPokemon.name} className="w-12 h-12" />
                        <div>
                          <h4 className="font-medium capitalize">{playerPokemon.name}</h4>
                          <div className="flex gap-1">
                            {playerPokemon.types.map(type => (
                              <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search Pokémon..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
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
                            onClick={() => selectPlayerPokemon(pokemon)}
                          >
                            <span className="text-sm capitalize">{pokemon.name}</span>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={generateRandomOpponent} 
                  variant="outline" 
                  className="w-full"
                  disabled={battleStarted}
                >
                  <Sword className="h-4 w-4 mr-2" />
                  Generate Opponent
                </Button>

                {playerPokemon && opponentPokemon && !battleStarted && (
                  <Button onClick={startBattle} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Battle
                  </Button>
                )}

                {(playerPokemon || opponentPokemon) && (
                  <Button onClick={resetBattle} variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Battle
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Battle Arena */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="font-semibold mb-6">Battle Arena</h3>
              
              {playerPokemon && opponentPokemon ? (
                <div className="space-y-6">
                  {/* Pokemon Display */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* Player Pokemon */}
                    <div className="text-center">
                      <div className="relative">
                        <img
                          src={playerPokemon.sprite}
                          alt={playerPokemon.name}
                          className={`w-32 h-32 mx-auto mb-3 ${currentTurn === 'player' ? 'brightness-110' : ''}`}
                        />
                        {currentTurn === 'player' && battleStarted && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <h4 className="font-semibold capitalize mb-2">{playerPokemon.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>HP</span>
                          <span>{playerPokemon.currentHp}/{playerPokemon.maxHp}</span>
                        </div>
                        <Progress 
                          value={(playerPokemon.currentHp / playerPokemon.maxHp) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>

                    {/* Opponent Pokemon */}
                    <div className="text-center">
                      <div className="relative">
                        <img
                          src={opponentPokemon.sprite}
                          alt={opponentPokemon.name}
                          className={`w-32 h-32 mx-auto mb-3 ${currentTurn === 'opponent' ? 'brightness-110' : ''}`}
                        />
                        {currentTurn === 'opponent' && battleStarted && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <h4 className="font-semibold capitalize mb-2">{opponentPokemon.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>HP</span>
                          <span>{opponentPokemon.currentHp}/{opponentPokemon.maxHp}</span>
                        </div>
                        <Progress 
                          value={(opponentPokemon.currentHp / opponentPokemon.maxHp) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Battle Controls */}
                  {battleStarted && currentTurn === 'player' && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Choose your move:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {playerPokemon.moves.map((move) => (
                          <Button
                            key={move}
                            onClick={() => playerAttack(move)}
                            variant="outline"
                            className="justify-start"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            {move}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Winner Display */}
                  {winner && (
                    <div className="text-center border-t pt-4">
                      <Trophy className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                      <h3 className="text-lg font-bold">
                        {winner === 'player' ? 'You Win!' : 'You Lose!'}
                      </h3>
                      <p className="text-muted-foreground">
                        {winner === 'player' 
                          ? `${playerPokemon.name} emerged victorious!`
                          : `${opponentPokemon.name} proved too strong!`
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Battle in Progress</h3>
                  <p className="text-muted-foreground">
                    Select your Pokémon and generate an opponent to start battling!
                  </p>
                </div>
              )}

              {/* Battle Log */}
              {battleLog.length > 0 && (
                <div className="border-t pt-4 mt-6">
                  <h4 className="font-semibold mb-3">Battle Log</h4>
                  <div className="bg-muted rounded p-3 max-h-32 overflow-y-auto">
                    {battleLog.map((log, index) => (
                      <div key={index} className="text-sm mb-1 last:mb-0">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}