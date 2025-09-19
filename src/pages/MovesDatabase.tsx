import { useState, useEffect } from "react";
import { ArrowLeft, Search, Filter, Zap, Shield, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import axios from "axios";

interface Move {
  id: number;
  name: string;
  type: { name: string };
  power: number | null;
  pp: number;
  accuracy: number | null;
  priority: number;
  damage_class: { name: string };
  effect_entries: { effect: string; short_effect: string }[];
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
  target: { name: string };
  meta: {
    ailment: { name: string };
    category: { name: string };
    min_hits: number | null;
    max_hits: number | null;
    min_turns: number | null;
    max_turns: number | null;
    drain: number;
    healing: number;
    crit_rate: number;
    ailment_chance: number;
    flinch_chance: number;
    stat_chance: number;
  };
}

const types = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", 
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", 
  "dragon", "dark", "steel", "fairy"
];

const damageClasses = ["physical", "special", "status"];

export default function MovesDatabase() {
  const [moves, setMoves] = useState<Move[]>([]);
  const [filteredMoves, setFilteredMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const movesPerPage = 20;

  useEffect(() => {
    fetchMoves();
  }, []);

  useEffect(() => {
    filterMoves();
  }, [moves, searchTerm, selectedType, selectedClass]);

  const fetchMoves = async () => {
    try {
      setLoading(true);
      // First, get the total count of moves
      const initialResponse = await axios.get('https://pokeapi.co/api/v2/move?limit=1');
      const totalMoves = initialResponse.data.count;
      
      // Fetch all moves (there are ~850 total moves)
      const response = await axios.get(`https://pokeapi.co/api/v2/move?limit=${totalMoves}`);
      const moveList = response.data.results;

      // Fetch detailed data for all moves in batches to avoid overwhelming the API
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < moveList.length; i += batchSize) {
        batches.push(moveList.slice(i, i + batchSize));
      }

      const allDetailedMoves: Move[] = [];
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`Fetching moves batch ${batchIndex + 1} of ${batches.length}...`);
        
        const batchPromises = batch.map(async (move: { url: string }) => {
          try {
            const moveResponse = await axios.get(move.url);
            return moveResponse.data;
          } catch (error) {
            console.error(`Error fetching move ${move.url}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        const validBatchMoves = batchResults.filter((move): move is Move => move !== null);
        allDetailedMoves.push(...validBatchMoves);
        
        // Add a small delay between batches to be respectful to the API
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Successfully loaded ${allDetailedMoves.length} moves!`);
      setMoves(allDetailedMoves);
    } catch (error) {
      console.error('Error fetching moves:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMoves = () => {
    let filtered = moves.filter(move => {
      const matchesSearch = move.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || move.type.name === selectedType;
      const matchesClass = selectedClass === 'all' || move.damage_class.name === selectedClass;
      
      return matchesSearch && matchesType && matchesClass;
    });

    setFilteredMoves(filtered);
    setCurrentPage(1);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-500",
      grass: "bg-green-500",
      ice: "bg-cyan-400",
      fighting: "bg-red-700",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-green-400",
      rock: "bg-yellow-800",
      ghost: "bg-purple-700",
      dragon: "bg-indigo-700",
      dark: "bg-gray-800",
      steel: "bg-gray-500",
      fairy: "bg-pink-300"
    };
    return colors[type] || "bg-gray-400";
  };

  const getDamageClassIcon = (damageClass: string) => {
    switch (damageClass) {
      case 'physical': return <Target className="h-4 w-4" />;
      case 'special': return <Zap className="h-4 w-4" />;
      case 'status': return <Shield className="h-4 w-4" />;
      default: return null;
    }
  };

  const formatMoveName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getEnglishFlavorText = (move: Move) => {
    const englishEntry = move.flavor_text_entries?.find(
      entry => entry.language.name === 'en'
    );
    return englishEntry?.flavor_text || 'No description available.';
  };

  const getEnglishEffect = (move: Move) => {
    const englishEntry = move.effect_entries?.find(
      entry => entry.effect
    );
    return englishEntry?.short_effect || englishEntry?.effect || 'No effect description available.';
  };

  const paginatedMoves = filteredMoves.slice(
    (currentPage - 1) * movesPerPage,
    currentPage * movesPerPage
  );

  const totalPages = Math.ceil(filteredMoves.length / movesPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading complete moves database...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a moment as we fetch all ~850 Pokemon moves</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pokédex
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Moves Database</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Complete database of all {moves.length} Pokémon moves and abilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filters and Move List */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search Moves</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search moves..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {types.map(type => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${getTypeColor(type)}`} />
                              <span className="capitalize">{type}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {damageClasses.map(cls => (
                          <SelectItem key={cls} value={cls}>
                            <div className="flex items-center gap-2">
                              {getDamageClassIcon(cls)}
                              <span className="capitalize">{cls}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredMoves.length} of {moves.length} moves
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Move List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paginatedMoves.map((move) => (
                    <div
                      key={move.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                        selectedMove?.id === move.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedMove(move)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${getTypeColor(move.type.name)}`} />
                            {getDamageClassIcon(move.damage_class.name)}
                          </div>
                          <div>
                            <div className="font-medium">{formatMoveName(move.name)}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {move.type.name} • {move.damage_class.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {move.power && <div className="font-medium">{move.power} Power</div>}
                          <div className="text-muted-foreground">PP: {move.pp}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Move Details */}
          <div className="space-y-6">
            {selectedMove ? (
              <Card>
                <CardHeader>
                  <CardTitle>{formatMoveName(selectedMove.name)}</CardTitle>
                  <CardDescription>Move Details</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="stats" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="stats">Stats</TabsTrigger>
                      <TabsTrigger value="description">Description</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="stats" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTypeColor(selectedMove.type.name)} text-white`}>
                            {selectedMove.type.name.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getDamageClassIcon(selectedMove.damage_class.name)}
                            {selectedMove.damage_class.name.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Power</div>
                            <div className="text-muted-foreground">
                              {selectedMove.power || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">Accuracy</div>
                            <div className="text-muted-foreground">
                              {selectedMove.accuracy ? `${selectedMove.accuracy}%` : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">PP</div>
                            <div className="text-muted-foreground">{selectedMove.pp}</div>
                          </div>
                          <div>
                            <div className="font-medium">Priority</div>
                            <div className="text-muted-foreground">
                              {selectedMove.priority > 0 ? `+${selectedMove.priority}` : selectedMove.priority}
                            </div>
                          </div>
                        </div>

                        {selectedMove.meta && (
                          <div className="pt-3 border-t space-y-2">
                            <h4 className="font-medium">Additional Effects</h4>
                            <div className="text-sm space-y-1">
                              {selectedMove.meta.crit_rate > 0 && (
                                <div className="flex items-center gap-2">
                                  <Star className="h-3 w-3" />
                                  High critical hit ratio
                                </div>
                              )}
                              {selectedMove.meta.drain > 0 && (
                                <div>Drains {selectedMove.meta.drain}% of damage dealt</div>
                              )}
                              {selectedMove.meta.healing > 0 && (
                                <div>Heals {selectedMove.meta.healing}% of max HP</div>
                              )}
                              {selectedMove.meta.ailment_chance > 0 && (
                                <div>{selectedMove.meta.ailment_chance}% chance to inflict {selectedMove.meta.ailment.name}</div>
                              )}
                              {selectedMove.meta.flinch_chance > 0 && (
                                <div>{selectedMove.meta.flinch_chance}% chance to flinch</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="description" className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Effect</h4>
                        <p className="text-sm text-muted-foreground">
                          {getEnglishEffect(selectedMove)}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {getEnglishFlavorText(selectedMove)}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Target</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {selectedMove.target.name.replace('-', ' ')}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select a move from the list to view its details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}