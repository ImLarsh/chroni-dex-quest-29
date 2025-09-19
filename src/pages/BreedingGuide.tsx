import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Search, Users, Clock, Star, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { usePokemon } from "@/hooks/usePokemon";

const eggGroups = [
  "monster", "water1", "water2", "water3", "bug", "flying", "field", "fairy",
  "grass", "human-like", "mineral", "amorphous", "ditto", "dragon", "undiscovered"
];

const breedingTips = [
  {
    title: "Destiny Knot",
    description: "Pass down 5 random IVs from both parents combined",
    icon: <Star className="h-5 w-5" />
  },
  {
    title: "Everstone",
    description: "Pass down the holder's nature to the offspring",
    icon: <Heart className="h-5 w-5" />
  },
  {
    title: "Power Items",
    description: "Guarantee passing a specific IV stat from the holder",
    icon: <Gift className="h-5 w-5" />
  },
  {
    title: "Oval Charm",
    description: "Increases the chance of finding an egg at the daycare",
    icon: <Clock className="h-5 w-5" />
  }
];

const compatibilityChart = {
  "same-species": { rate: 69.3, description: "Same species, different OT" },
  "same-egg-group": { rate: 49.5, description: "Same egg group, different species" },
  "different-groups": { rate: 0, description: "Different egg groups (incompatible)" },
  "ditto": { rate: 49.5, description: "One parent is Ditto" },
  "undiscovered": { rate: 0, description: "Undiscovered egg group (no breeding)" }
};

export default function BreedingGuide() {
  const { pokemon, loading } = usePokemon();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEggGroup, setSelectedEggGroup] = useState("all");
  const [selectedPokemon1, setSelectedPokemon1] = useState<any>(null);
  const [selectedPokemon2, setSelectedPokemon2] = useState<any>(null);
  const [pokemonSpecies, setPokemonSpecies] = useState<any[]>([]);

  // Simulate species data with egg groups (would normally come from API)
  useEffect(() => {
    if (pokemon.length > 0) {
      const species = pokemon.slice(0, 50).map(p => ({
        ...p,
        eggGroups: getRandomEggGroups(),
        baseEggSteps: Math.floor(Math.random() * 10000) + 2560,
        genderRate: Math.floor(Math.random() * 9) - 1 // -1 for genderless, 0-8 for ratios
      }));
      setPokemonSpecies(species);
    }
  }, [pokemon]);

  const getRandomEggGroups = () => {
    const primaryGroup = eggGroups[Math.floor(Math.random() * eggGroups.length)];
    const hasSecondary = Math.random() > 0.7;
    if (hasSecondary && primaryGroup !== "ditto" && primaryGroup !== "undiscovered") {
      const secondaryGroup = eggGroups.filter(g => g !== primaryGroup)[
        Math.floor(Math.random() * (eggGroups.length - 1))
      ];
      return [primaryGroup, secondaryGroup];
    }
    return [primaryGroup];
  };

  const filteredPokemon = pokemonSpecies.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEggGroup = selectedEggGroup === 'all' || p.eggGroups.includes(selectedEggGroup);
    return matchesSearch && matchesEggGroup;
  });

  const checkBreedingCompatibility = (pokemon1: any, pokemon2: any) => {
    if (!pokemon1 || !pokemon2) return null;

    // Special cases
    if (pokemon1.eggGroups.includes("undiscovered") || pokemon2.eggGroups.includes("undiscovered")) {
      return { ...compatibilityChart["undiscovered"], compatible: false };
    }

    if (pokemon1.eggGroups.includes("ditto") || pokemon2.eggGroups.includes("ditto")) {
      return { ...compatibilityChart["ditto"], compatible: true };
    }

    // Check if they share an egg group
    const sharedGroups = pokemon1.eggGroups.filter((group: string) => 
      pokemon2.eggGroups.includes(group)
    );

    if (pokemon1.name === pokemon2.name) {
      return { ...compatibilityChart["same-species"], compatible: true };
    }

    if (sharedGroups.length > 0) {
      return { ...compatibilityChart["same-egg-group"], compatible: true };
    }

    return { ...compatibilityChart["different-groups"], compatible: false };
  };

  const getGenderRatio = (genderRate: number) => {
    if (genderRate === -1) return "Genderless";
    const femaleRatio = (genderRate / 8) * 100;
    const maleRatio = 100 - femaleRatio;
    return `${maleRatio.toFixed(1)}% ♂ / ${femaleRatio.toFixed(1)}% ♀`;
  };

  const formatEggSteps = (steps: number) => {
    return `${steps.toLocaleString()} steps`;
  };

  const compatibility = checkBreedingCompatibility(selectedPokemon1, selectedPokemon2);

  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getEggGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      monster: "bg-green-500",
      water1: "bg-blue-500",
      water2: "bg-cyan-500",
      water3: "bg-teal-500",
      bug: "bg-lime-500",
      flying: "bg-indigo-500",
      field: "bg-yellow-500",
      fairy: "bg-pink-500",
      grass: "bg-green-600",
      "human-like": "bg-orange-500",
      mineral: "bg-gray-500",
      amorphous: "bg-purple-500",
      ditto: "bg-purple-600",
      dragon: "bg-indigo-700",
      undiscovered: "bg-red-500"
    };
    return colors[group] || "bg-gray-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading breeding data...</p>
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
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Breeding Guide</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Complete guide to Pokémon breeding mechanics and egg groups
          </p>
        </div>

        <Tabs defaultValue="compatibility" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
            <TabsTrigger value="egg-groups">Egg Groups</TabsTrigger>
            <TabsTrigger value="guide">Breeding Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compatibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Breeding Compatibility Checker
                </CardTitle>
                <CardDescription>
                  Select two Pokémon to check if they can breed together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pokemon 1 Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Parent 1</label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search Pokémon..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto border rounded-md">
                      {filteredPokemon.slice(0, 10).map((poke) => (
                        <div
                          key={poke.id}
                          className={`p-2 hover:bg-accent cursor-pointer border-b last:border-b-0 ${
                            selectedPokemon1?.id === poke.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setSelectedPokemon1(poke)}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={poke.sprites.front_default}
                              alt={poke.name}
                              className="w-8 h-8"
                            />
                            <div>
                              <div className="font-medium">{formatName(poke.name)}</div>
                              <div className="flex gap-1">
                                {poke.eggGroups.map((group: string) => (
                                  <Badge 
                                    key={group} 
                                    className={`${getEggGroupColor(group)} text-white text-xs`}
                                  >
                                    {group}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pokemon 2 Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Parent 2</label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search Pokémon..."
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto border rounded-md">
                      {filteredPokemon.slice(0, 10).map((poke) => (
                        <div
                          key={poke.id}
                          className={`p-2 hover:bg-accent cursor-pointer border-b last:border-b-0 ${
                            selectedPokemon2?.id === poke.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setSelectedPokemon2(poke)}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={poke.sprites.front_default}
                              alt={poke.name}
                              className="w-8 h-8"
                            />
                            <div>
                              <div className="font-medium">{formatName(poke.name)}</div>
                              <div className="flex gap-1">
                                {poke.eggGroups.map((group: string) => (
                                  <Badge 
                                    key={group} 
                                    className={`${getEggGroupColor(group)} text-white text-xs`}
                                  >
                                    {group}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compatibility Results */}
                {selectedPokemon1 && selectedPokemon2 && compatibility && (
                  <div className="mt-6 p-4 border rounded-lg">
                    <div className="text-center mb-4">
                      <div className={`text-2xl font-bold ${compatibility.compatible ? 'text-green-500' : 'text-red-500'}`}>
                        {compatibility.compatible ? 'Compatible!' : 'Not Compatible'}
                      </div>
                      <p className="text-muted-foreground">{compatibility.description}</p>
                    </div>

                    {compatibility.compatible && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Breeding Rate</h4>
                          <div className="flex items-center gap-2">
                            <Progress value={compatibility.rate} className="flex-1" />
                            <span className="text-sm">{compatibility.rate.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Egg Hatching</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatEggSteps(selectedPokemon1.baseEggSteps)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="egg-groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Egg Group Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedEggGroup} onValueChange={setSelectedEggGroup}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Egg Groups</SelectItem>
                    {eggGroups.map(group => (
                      <SelectItem key={group} value={group}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${getEggGroupColor(group)}`} />
                          <span className="capitalize">{group.replace("-", " ")}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pokémon by Egg Group</CardTitle>
                <CardDescription>
                  {filteredPokemon.length} Pokémon found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPokemon.slice(0, 12).map((poke) => (
                    <div key={poke.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={poke.sprites.front_default}
                          alt={poke.name}
                          className="w-12 h-12"
                        />
                        <div>
                          <div className="font-medium">{formatName(poke.name)}</div>
                          <div className="text-sm text-muted-foreground">
                            {getGenderRatio(poke.genderRate)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Egg Groups:</div>
                        <div className="flex gap-1 flex-wrap">
                          {poke.eggGroups.map((group: string) => (
                            <Badge 
                              key={group} 
                              className={`${getEggGroupColor(group)} text-white text-xs`}
                            >
                              {group.replace("-", " ")}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Hatch time: {formatEggSteps(poke.baseEggSteps)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="guide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Breeding Basics</CardTitle>
                <CardDescription>
                  Essential knowledge for successful Pokémon breeding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Breeding Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {breedingTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="text-primary">{tip.icon}</div>
                        <div>
                          <div className="font-medium">{tip.title}</div>
                          <div className="text-sm text-muted-foreground">{tip.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Breeding Steps</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">1</div>
                      <div>
                        <div className="font-medium">Choose Compatible Pokémon</div>
                        <div className="text-sm text-muted-foreground">Select two Pokémon that share at least one egg group</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">2</div>
                      <div>
                        <div className="font-medium">Equip Breeding Items</div>
                        <div className="text-sm text-muted-foreground">Use Destiny Knot, Everstone, or Power items to influence offspring</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">3</div>
                      <div>
                        <div className="font-medium">Leave at Daycare</div>
                        <div className="text-sm text-muted-foreground">Place both Pokémon at the daycare and wait for an egg</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">4</div>
                      <div>
                        <div className="font-medium">Hatch the Egg</div>
                        <div className="text-sm text-muted-foreground">Walk with the egg until it hatches (varies by species)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">IV Breeding Strategy</h3>
                  <div className="p-4 bg-accent/20 rounded-lg">
                    <ul className="space-y-2 text-sm">
                      <li>• Start with high IV parent Pokémon (caught from raids or bred)</li>
                      <li>• Use Destiny Knot to pass down 5 IVs from both parents combined</li>
                      <li>• Use Power items to guarantee specific IV inheritance</li>
                      <li>• Replace parents with better offspring as you progress</li>
                      <li>• Perfect 6 IV Pokémon may take several generations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}