import { useState, useEffect } from "react";
import { ArrowLeft, Ruler, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { usePokemon } from "@/hooks/usePokemon";

export default function SizeComparison() {
  const { pokemon, loading } = usePokemon();
  const [selectedPokemon1, setSelectedPokemon1] = useState<any>(null);
  const [selectedPokemon2, setSelectedPokemon2] = useState<any>(null);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [showSuggestions1, setShowSuggestions1] = useState(false);
  const [showSuggestions2, setShowSuggestions2] = useState(false);

  const filteredPokemon1 = pokemon.filter(p => 
    p.name.toLowerCase().includes(search1.toLowerCase())
  ).slice(0, 5);

  const filteredPokemon2 = pokemon.filter(p => 
    p.name.toLowerCase().includes(search2.toLowerCase())
  ).slice(0, 5);

  const convertHeight = (height: number) => {
    const meters = height / 10;
    const feet = Math.floor(meters * 3.28084);
    const inches = Math.round((meters * 3.28084 - feet) * 12);
    return {
      metric: `${meters.toFixed(1)}m`,
      imperial: `${feet}'${inches}"`
    };
  };

  const convertWeight = (weight: number) => {
    const kg = weight / 10;
    const lbs = Math.round(kg * 2.20462);
    return {
      metric: `${kg.toFixed(1)} kg`,
      imperial: `${lbs} lbs`
    };
  };

  const getRelativeSize = (height1: number, height2: number) => {
    const ratio = height1 / height2;
    if (ratio > 1.5) return "Much larger";
    if (ratio > 1.2) return "Larger";
    if (ratio > 1.1) return "Slightly larger";
    if (ratio < 0.67) return "Much smaller";
    if (ratio < 0.83) return "Smaller";
    if (ratio < 0.91) return "Slightly smaller";
    return "Similar size";
  };

  const selectRandomPair = () => {
    if (pokemon.length < 2) return;
    const shuffled = [...pokemon].sort(() => 0.5 - Math.random());
    setSelectedPokemon1(shuffled[0]);
    setSelectedPokemon2(shuffled[1]);
    setSearch1(shuffled[0].name);
    setSearch2(shuffled[1].name);
  };

  const visualScale = selectedPokemon1 && selectedPokemon2 ? {
    pokemon1: Math.min(200, Math.max(40, (selectedPokemon1.height / 10) * 20)),
    pokemon2: Math.min(200, Math.max(40, (selectedPokemon2.height / 10) * 20))
  } : null;

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
            <Ruler className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Size Comparison</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Compare the physical dimensions of different Pokémon
          </p>
        </div>

        <div className="mb-6">
          <Button onClick={selectRandomPair} variant="outline" disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Random Comparison
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pokemon 1 Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pokémon 1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a Pokémon..."
                    value={search1}
                    onChange={(e) => {
                      setSearch1(e.target.value);
                      setShowSuggestions1(true);
                    }}
                    onFocus={() => setShowSuggestions1(true)}
                  />
                </div>
                
                {showSuggestions1 && search1 && (
                  <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg">
                    {filteredPokemon1.map((poke) => (
                      <div
                        key={poke.id}
                        className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setSelectedPokemon1(poke);
                          setSearch1(poke.name);
                          setShowSuggestions1(false);
                        }}
                      >
                        <img
                          src={poke.sprites.front_default}
                          alt={poke.name}
                          className="w-8 h-8"
                        />
                        <span className="capitalize">{poke.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedPokemon1 && (
                <div className="mt-4 text-center">
                  <img
                    src={selectedPokemon1.sprites.other['official-artwork'].front_default}
                    alt={selectedPokemon1.name}
                    className="w-32 h-32 mx-auto mb-2"
                  />
                  <h3 className="text-xl font-bold capitalize">{selectedPokemon1.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div>Height: {convertHeight(selectedPokemon1.height).metric} ({convertHeight(selectedPokemon1.height).imperial})</div>
                    <div>Weight: {convertWeight(selectedPokemon1.weight).metric} ({convertWeight(selectedPokemon1.weight).imperial})</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pokemon 2 Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pokémon 2</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for a Pokémon..."
                    value={search2}
                    onChange={(e) => {
                      setSearch2(e.target.value);
                      setShowSuggestions2(true);
                    }}
                    onFocus={() => setShowSuggestions2(true)}
                  />
                </div>
                
                {showSuggestions2 && search2 && (
                  <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg">
                    {filteredPokemon2.map((poke) => (
                      <div
                        key={poke.id}
                        className="p-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setSelectedPokemon2(poke);
                          setSearch2(poke.name);
                          setShowSuggestions2(false);
                        }}
                      >
                        <img
                          src={poke.sprites.front_default}
                          alt={poke.name}
                          className="w-8 h-8"
                        />
                        <span className="capitalize">{poke.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedPokemon2 && (
                <div className="mt-4 text-center">
                  <img
                    src={selectedPokemon2.sprites.other['official-artwork'].front_default}
                    alt={selectedPokemon2.name}
                    className="w-32 h-32 mx-auto mb-2"
                  />
                  <h3 className="text-xl font-bold capitalize">{selectedPokemon2.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div>Height: {convertHeight(selectedPokemon2.height).metric} ({convertHeight(selectedPokemon2.height).imperial})</div>
                    <div>Weight: {convertWeight(selectedPokemon2.weight).metric} ({convertWeight(selectedPokemon2.weight).imperial})</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visual Comparison */}
        {selectedPokemon1 && selectedPokemon2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visual Size Comparison</CardTitle>
                <CardDescription>
                  Relative height comparison (scaled for visualization)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-center gap-8 min-h-[300px] bg-gradient-to-t from-accent/20 to-transparent rounded-lg p-8">
                  <div className="text-center">
                    <div
                      style={{ height: `${visualScale?.pokemon1}px` }}
                      className="flex items-end justify-center mb-2"
                    >
                      <img
                        src={selectedPokemon1.sprites.other['official-artwork'].front_default}
                        alt={selectedPokemon1.name}
                        className="max-h-full w-auto"
                      />
                    </div>
                    <div className="text-sm font-medium capitalize">{selectedPokemon1.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {convertHeight(selectedPokemon1.height).metric}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div
                      style={{ height: `${visualScale?.pokemon2}px` }}
                      className="flex items-end justify-center mb-2"
                    >
                      <img
                        src={selectedPokemon2.sprites.other['official-artwork'].front_default}
                        alt={selectedPokemon2.name}
                        className="max-h-full w-auto"
                      />
                    </div>
                    <div className="text-sm font-medium capitalize">{selectedPokemon2.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {convertHeight(selectedPokemon2.height).metric}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Height Comparison</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{selectedPokemon1.name}</span>
                        <span>{convertHeight(selectedPokemon1.height).metric}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="capitalize">{selectedPokemon2.name}</span>
                        <span>{convertHeight(selectedPokemon2.height).metric}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Difference</span>
                        <span>
                          {Math.abs(selectedPokemon1.height - selectedPokemon2.height) / 10}m
                        </span>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {getRelativeSize(selectedPokemon1.height, selectedPokemon2.height)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Weight Comparison</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="capitalize">{selectedPokemon1.name}</span>
                        <span>{convertWeight(selectedPokemon1.weight).metric}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="capitalize">{selectedPokemon2.name}</span>
                        <span>{convertWeight(selectedPokemon2.weight).metric}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Difference</span>
                        <span>
                          {Math.abs(selectedPokemon1.weight - selectedPokemon2.weight) / 10} kg
                        </span>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {selectedPokemon1.weight > selectedPokemon2.weight ? "Heavier" : 
                         selectedPokemon1.weight < selectedPokemon2.weight ? "Lighter" : "Same weight"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}