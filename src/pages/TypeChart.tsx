import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Shield, Sword, Ban } from "lucide-react";
import { Link } from "react-router-dom";
import { Pokeball } from "@/components/PokemonIcons";
import { cn } from "@/lib/utils";

const typeChart = {
  normal: { weak: ['fighting'], resist: [], immune: ['ghost'], strong: [] },
  fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [], strong: ['grass', 'ice', 'bug', 'steel'] },
  water: { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'], immune: [], strong: ['fire', 'ground', 'rock'] },
  electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [], strong: ['water', 'flying'] },
  grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'electric', 'grass', 'ground'], immune: [], strong: ['water', 'ground', 'rock'] },
  ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [], strong: ['grass', 'ground', 'flying', 'dragon'] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [], strong: ['normal', 'ice', 'rock', 'dark', 'steel'] },
  poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [], strong: ['grass', 'fairy'] },
  ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'], strong: ['fire', 'electric', 'poison', 'rock', 'steel'] },
  flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'], strong: ['grass', 'fighting', 'bug'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [], strong: ['fighting', 'poison'] },
  bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [], strong: ['grass', 'psychic', 'dark'] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [], strong: ['fire', 'ice', 'flying', 'bug'] },
  ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'], strong: ['psychic', 'ghost'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'electric', 'grass'], immune: [], strong: ['dragon'] },
  dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'], strong: ['psychic', 'ghost'] },
  steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'], strong: ['ice', 'rock', 'fairy'] },
  fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'], strong: ['fighting', 'dragon', 'dark'] }
};

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

export default function TypeChart() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const types = Object.keys(typeChart);
  const filteredTypes = searchTerm 
    ? types.filter(type => type.includes(searchTerm.toLowerCase()))
    : types;

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness === 2) return "bg-green-500 text-white";
    if (effectiveness === 0.5) return "bg-red-500 text-white";
    if (effectiveness === 0) return "bg-gray-500 text-white";
    return "bg-muted";
  };

  const getEffectiveness = (attackingType: string, defendingType: string) => {
    const attacking = typeChart[attackingType as keyof typeof typeChart];
    if (attacking.strong.includes(defendingType)) return 2;
    
    const defending = typeChart[defendingType as keyof typeof typeChart];
    if (defending.immune.includes(attackingType)) return 0;
    if (defending.resist.includes(attackingType)) return 0.5;
    if (defending.weak.includes(attackingType)) return 2;
    
    return 1;
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
              <h1 className="text-3xl font-bold">Type Effectiveness Chart</h1>
              <p className="text-muted-foreground">Master type matchups and battle strategies</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            {selectedType && (
              <Button variant="outline" onClick={() => setSelectedType(null)}>
                Clear Selection
              </Button>
            )}
          </div>

          {/* Legend */}
          <Card className="p-4 mb-6">
            <h3 className="font-semibold mb-3">Effectiveness Legend</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-green-500 rounded text-xs flex items-center justify-center text-white font-medium">2×</div>
                <span className="text-sm">Super Effective</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-muted rounded text-xs flex items-center justify-center font-medium">1×</div>
                <span className="text-sm">Normal Damage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-red-500 rounded text-xs flex items-center justify-center text-white font-medium">½×</div>
                <span className="text-sm">Not Very Effective</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 bg-gray-500 rounded text-xs flex items-center justify-center text-white font-medium">0×</div>
                <span className="text-sm">No Effect</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Type Selection */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Select Type</h3>
              <div className="space-y-2">
                {filteredTypes.map((type) => (
                  <Button
                    key={type}
                    variant={selectedType === type ? "default" : "outline"}
                    className="w-full justify-start capitalize"
                    onClick={() => setSelectedType(type)}
                  >
                    <div className={cn("w-4 h-4 rounded mr-2", typeColors[type])} />
                    {type}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Type Details */}
          <div className="lg:col-span-3">
            {selectedType ? (
              <div className="space-y-6">
                {/* Selected Type Info */}
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("w-8 h-8 rounded-lg", typeColors[selectedType])} />
                    <h2 className="text-2xl font-bold capitalize">{selectedType} Type</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Attacking */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Sword className="h-5 w-5" />
                        When Attacking
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-green-600">Super Effective Against:</h4>
                          <div className="flex flex-wrap gap-1">
                            {typeChart[selectedType as keyof typeof typeChart].strong.map(type => (
                              <Badge key={type} className="bg-green-500 text-white capitalize">
                                {type}
                              </Badge>
                            ))}
                            {typeChart[selectedType as keyof typeof typeChart].strong.length === 0 && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Defending */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        When Defending
                      </h3>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-red-600">Weak To:</h4>
                          <div className="flex flex-wrap gap-1">
                            {typeChart[selectedType as keyof typeof typeChart].weak.map(type => (
                              <Badge key={type} className="bg-red-500 text-white capitalize">
                                {type}
                              </Badge>
                            ))}
                            {typeChart[selectedType as keyof typeof typeChart].weak.length === 0 && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 text-blue-600">Resists:</h4>
                          <div className="flex flex-wrap gap-1">
                            {typeChart[selectedType as keyof typeof typeChart].resist.map(type => (
                              <Badge key={type} className="bg-blue-500 text-white capitalize">
                                {type}
                              </Badge>
                            ))}
                            {typeChart[selectedType as keyof typeof typeChart].resist.length === 0 && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2 text-gray-600">Immune To:</h4>
                          <div className="flex flex-wrap gap-1">
                            {typeChart[selectedType as keyof typeof typeChart].immune.map(type => (
                              <Badge key={type} className="bg-gray-500 text-white capitalize">
                                {type}
                              </Badge>
                            ))}
                            {typeChart[selectedType as keyof typeof typeChart].immune.length === 0 && (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Full Effectiveness Chart */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">
                    {selectedType} vs All Types
                  </h3>
                  <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                    {types.map(defendingType => {
                      const effectiveness = getEffectiveness(selectedType, defendingType);
                      return (
                        <div
                          key={defendingType}
                          className={cn(
                            "p-3 rounded text-center transition-colors",
                            getEffectivenessColor(effectiveness)
                          )}
                        >
                          <div className={cn("w-6 h-6 rounded mx-auto mb-1", typeColors[defendingType])} />
                          <div className="text-xs capitalize">{defendingType}</div>
                          <div className="text-xs font-bold mt-1">
                            {effectiveness === 0 ? "0×" : 
                             effectiveness === 0.5 ? "½×" :
                             effectiveness === 2 ? "2×" : "1×"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Pokeball className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Type</h3>
                <p className="text-muted-foreground">
                  Choose a type from the left to see detailed effectiveness information
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}