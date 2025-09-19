import { useState } from "react";
import { ArrowLeft, Shield, Zap, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const types = [
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", 
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", 
  "dragon", "dark", "steel", "fairy"
];

const typeEffectiveness: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, ice: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, poison: 0.5, fighting: 2, dragon: 2, dark: 2, steel: 0.5 }
};

export default function WeaknessCalculator() {
  const [attackingType, setAttackingType] = useState<string>("");
  const [defendingType1, setDefendingType1] = useState<string>("");
  const [defendingType2, setDefendingType2] = useState<string>("");

  const calculateEffectiveness = (attacking: string, defending1: string, defending2: string) => {
    if (!attacking || !defending1) return 1;

    let effectiveness1 = typeEffectiveness[attacking]?.[defending1] ?? 1;
    let effectiveness2 = defending2 ? (typeEffectiveness[attacking]?.[defending2] ?? 1) : 1;

    return effectiveness1 * effectiveness2;
  };

  const effectiveness = calculateEffectiveness(attackingType, defendingType1, defendingType2);

  const getEffectivenessText = (value: number) => {
    if (value === 0) return "No Effect";
    if (value === 0.25) return "Not Very Effective (¼×)";
    if (value === 0.5) return "Not Very Effective (½×)";
    if (value === 1) return "Normal Damage (1×)";
    if (value === 2) return "Super Effective (2×)";
    if (value === 4) return "Super Effective (4×)";
    return `${value}× Damage`;
  };

  const getEffectivenessColor = (value: number) => {
    if (value === 0) return "bg-gray-500";
    if (value < 1) return "bg-red-500";
    if (value === 1) return "bg-gray-400";
    if (value > 1) return "bg-green-500";
    return "bg-gray-400";
  };

  const calculateAllMatchups = () => {
    if (!attackingType) return [];

    return types.map(type => ({
      type,
      single: calculateEffectiveness(attackingType, type, ""),
      withSecondary: defendingType2 ? calculateEffectiveness(attackingType, type, defendingType2) : null
    })).sort((a, b) => b.single - a.single);
  };

  const calculateDefensiveChart = () => {
    if (!defendingType1) return [];

    return types.map(type => ({
      type,
      effectiveness: calculateEffectiveness(type, defendingType1, defendingType2)
    })).sort((a, b) => b.effectiveness - a.effectiveness);
  };

  const typeMatchups = calculateAllMatchups();
  const defensiveChart = calculateDefensiveChart();

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
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Weakness Calculator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Calculate type effectiveness and damage multipliers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Type Matchup Calculator
                </CardTitle>
                <CardDescription>
                  Calculate damage effectiveness between types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Attacking Type</label>
                  <Select value={attackingType} onValueChange={setAttackingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attacking type" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <label className="text-sm font-medium mb-2 block">Defending Type 1</label>
                  <Select value={defendingType1} onValueChange={setDefendingType1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select first defending type" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <label className="text-sm font-medium mb-2 block">Defending Type 2 (Optional)</label>
                  <Select value={defendingType2} onValueChange={setDefendingType2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select second defending type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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

                {attackingType && defendingType1 && (
                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">{effectiveness}×</div>
                      <Badge 
                        className={`${getEffectivenessColor(effectiveness)} text-white`}
                        variant="secondary"
                      >
                        {getEffectivenessText(effectiveness)}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {defendingType1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Defensive Coverage
                  </CardTitle>
                  <CardDescription>
                    How all types affect your Pokémon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {defensiveChart.map(({ type, effectiveness }) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${getTypeColor(type)}`} />
                          <span className="capitalize">{type}</span>
                        </div>
                        <Badge
                          className={`${getEffectivenessColor(effectiveness)} text-white text-xs`}
                          variant="secondary"
                        >
                          {effectiveness}×
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Type Chart Reference */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Type Effectiveness Chart</CardTitle>
                <CardDescription>
                  Quick reference for type matchups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded" />
                      Super Effective (2×)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Moves deal double damage. Aim for these matchups in battle.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded" />
                      Normal Effectiveness (1×)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Moves deal standard damage with no type advantage or disadvantage.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded" />
                      Not Very Effective (0.5×)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Moves deal half damage. Consider switching to a different move type.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-500 rounded" />
                      No Effect (0×)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Moves have no effect. The target is immune to this type.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {attackingType && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {attackingType.charAt(0).toUpperCase() + attackingType.slice(1)} Type Effectiveness
                  </CardTitle>
                  <CardDescription>
                    How {attackingType} moves affect all types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {typeMatchups.map(({ type, single }) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${getTypeColor(type)}`} />
                          <span className="capitalize">{type}</span>
                        </div>
                        <Badge
                          className={`${getEffectivenessColor(single)} text-white text-xs`}
                          variant="secondary"
                        >
                          {single}×
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}