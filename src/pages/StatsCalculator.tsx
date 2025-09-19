import { useState, useCallback } from "react";
import { ArrowLeft, Calculator, TrendingUp, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface StatCalculation {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

const natures = {
  Hardy: { increase: null, decrease: null },
  Lonely: { increase: 'attack', decrease: 'defense' },
  Brave: { increase: 'attack', decrease: 'speed' },
  Adamant: { increase: 'attack', decrease: 'spAttack' },
  Naughty: { increase: 'attack', decrease: 'spDefense' },
  Bold: { increase: 'defense', decrease: 'attack' },
  Docile: { increase: null, decrease: null },
  Relaxed: { increase: 'defense', decrease: 'speed' },
  Impish: { increase: 'defense', decrease: 'spAttack' },
  Lax: { increase: 'defense', decrease: 'spDefense' },
  Timid: { increase: 'speed', decrease: 'attack' },
  Hasty: { increase: 'speed', decrease: 'defense' },
  Serious: { increase: null, decrease: null },
  Jolly: { increase: 'speed', decrease: 'spAttack' },
  Naive: { increase: 'speed', decrease: 'spDefense' },
  Modest: { increase: 'spAttack', decrease: 'attack' },
  Mild: { increase: 'spAttack', decrease: 'defense' },
  Quiet: { increase: 'spAttack', decrease: 'speed' },
  Bashful: { increase: null, decrease: null },
  Rash: { increase: 'spAttack', decrease: 'spDefense' },
  Calm: { increase: 'spDefense', decrease: 'attack' },
  Gentle: { increase: 'spDefense', decrease: 'defense' },
  Sassy: { increase: 'spDefense', decrease: 'speed' },
  Careful: { increase: 'spDefense', decrease: 'spAttack' },
  Quirky: { increase: null, decrease: null },
};

export default function StatsCalculator() {
  const [level, setLevel] = useState(50);
  const [nature, setNature] = useState("Hardy");
  const [baseStats, setBaseStats] = useState({
    hp: 100,
    attack: 100,
    defense: 100,
    spAttack: 100,
    spDefense: 100,
    speed: 100,
  });
  const [ivs, setIvs] = useState({
    hp: 31,
    attack: 31,
    defense: 31,
    spAttack: 31,
    spDefense: 31,
    speed: 31,
  });
  const [evs, setEvs] = useState({
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0,
  });

  const calculateStat = useCallback((statName: keyof StatCalculation, base: number, iv: number, ev: number) => {
    const selectedNature = natures[nature as keyof typeof natures];
    let natureMultiplier = 1.0;
    
    if (selectedNature.increase === statName) natureMultiplier = 1.1;
    if (selectedNature.decrease === statName) natureMultiplier = 0.9;

    if (statName === 'hp') {
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    } else {
      return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureMultiplier);
    }
  }, [level, nature]);

  const finalStats = {
    hp: calculateStat('hp', baseStats.hp, ivs.hp, evs.hp),
    attack: calculateStat('attack', baseStats.attack, ivs.attack, evs.attack),
    defense: calculateStat('defense', baseStats.defense, ivs.defense, evs.defense),
    spAttack: calculateStat('spAttack', baseStats.spAttack, ivs.spAttack, evs.spAttack),
    spDefense: calculateStat('spDefense', baseStats.spDefense, ivs.spDefense, evs.spDefense),
    speed: calculateStat('speed', baseStats.speed, ivs.speed, evs.speed),
  };

  const totalEvs = Object.values(evs).reduce((sum, ev) => sum + ev, 0);
  const statTotal = Object.values(finalStats).reduce((sum, stat) => sum + stat, 0);

  const getStatColor = (statName: keyof StatCalculation) => {
    const selectedNature = natures[nature as keyof typeof natures];
    if (selectedNature.increase === statName) return "text-green-500";
    if (selectedNature.decrease === statName) return "text-red-500";
    return "text-foreground";
  };

  const setRandomIVs = () => {
    setIvs({
      hp: Math.floor(Math.random() * 32),
      attack: Math.floor(Math.random() * 32),
      defense: Math.floor(Math.random() * 32),
      spAttack: Math.floor(Math.random() * 32),
      spDefense: Math.floor(Math.random() * 32),
      speed: Math.floor(Math.random() * 32),
    });
  };

  const setPerfectIVs = () => {
    setIvs({
      hp: 31,
      attack: 31,
      defense: 31,
      spAttack: 31,
      spDefense: 31,
      speed: 31,
    });
  };

  const clearEvs = () => {
    setEvs({
      hp: 0,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    });
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
            <h1 className="text-4xl font-bold">Stats Calculator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Calculate Pokémon stats with IV/EV values and nature effects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Basic Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="level">Level (1-100)</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="100"
                    value={level}
                    onChange={(e) => setLevel(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  />
                </div>
                
                <div>
                  <Label>Nature</Label>
                  <Select value={nature} onValueChange={setNature}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {Object.entries(natures).map(([name, effect]) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{name}</span>
                            {effect.increase && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                +{effect.increase.replace('sp', 'Sp. ')} -{effect.decrease?.replace('sp', 'Sp. ')}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="base" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="base">Base Stats</TabsTrigger>
                <TabsTrigger value="ivs">IVs</TabsTrigger>
                <TabsTrigger value="evs">EVs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="base" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Base Stats</CardTitle>
                    <CardDescription>The base stat values for this Pokémon species</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(baseStats).map(([stat, value]) => (
                      <div key={stat}>
                        <Label htmlFor={`base-${stat}`}>
                          {stat === 'hp' ? 'HP' : 
                           stat === 'spAttack' ? 'Sp. Attack' :
                           stat === 'spDefense' ? 'Sp. Defense' :
                           stat.charAt(0).toUpperCase() + stat.slice(1)}
                        </Label>
                        <Input
                          id={`base-${stat}`}
                          type="number"
                          min="1"
                          max="255"
                          value={value}
                          onChange={(e) => setBaseStats(prev => ({
                            ...prev,
                            [stat]: Math.max(1, Math.min(255, parseInt(e.target.value) || 1))
                          }))}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ivs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Individual Values (IVs)</CardTitle>
                    <CardDescription>Random values that determine stat potential (0-31)</CardDescription>
                    <div className="flex gap-2">
                      <Button onClick={setPerfectIVs} size="sm" variant="outline">
                        Perfect IVs
                      </Button>
                      <Button onClick={setRandomIVs} size="sm" variant="outline">
                        Random IVs
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(ivs).map(([stat, value]) => (
                      <div key={stat}>
                        <Label htmlFor={`iv-${stat}`}>
                          {stat === 'hp' ? 'HP' : 
                           stat === 'spAttack' ? 'Sp. Attack' :
                           stat === 'spDefense' ? 'Sp. Defense' :
                           stat.charAt(0).toUpperCase() + stat.slice(1)}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`iv-${stat}`}
                            type="number"
                            min="0"
                            max="31"
                            value={value}
                            onChange={(e) => setIvs(prev => ({
                              ...prev,
                              [stat]: Math.max(0, Math.min(31, parseInt(e.target.value) || 0))
                            }))}
                            className="flex-1"
                          />
                          <Progress value={(value / 31) * 100} className="w-16" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="evs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Effort Values (EVs)</CardTitle>
                    <CardDescription>
                      Training values that boost stats (0-252 per stat, 510 total)
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <Badge variant={totalEvs > 510 ? "destructive" : "default"}>
                        Total EVs: {totalEvs}/510
                      </Badge>
                      <Button onClick={clearEvs} size="sm" variant="outline">
                        Clear EVs
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(evs).map(([stat, value]) => (
                      <div key={stat}>
                        <Label htmlFor={`ev-${stat}`}>
                          {stat === 'hp' ? 'HP' : 
                           stat === 'spAttack' ? 'Sp. Attack' :
                           stat === 'spDefense' ? 'Sp. Defense' :
                           stat.charAt(0).toUpperCase() + stat.slice(1)}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`ev-${stat}`}
                            type="number"
                            min="0"
                            max="252"
                            value={value}
                            onChange={(e) => setEvs(prev => ({
                              ...prev,
                              [stat]: Math.max(0, Math.min(252, parseInt(e.target.value) || 0))
                            }))}
                            className="flex-1"
                          />
                          <Progress value={(value / 252) * 100} className="w-16" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Final Stats
                </CardTitle>
                <CardDescription>
                  Calculated stats at level {level} with {nature} nature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(finalStats).map(([stat, value]) => (
                    <div key={stat} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {stat === 'hp' ? 'HP' : 
                           stat === 'spAttack' ? 'Sp. Attack' :
                           stat === 'spDefense' ? 'Sp. Defense' :
                           stat.charAt(0).toUpperCase() + stat.slice(1)}
                        </span>
                        {natures[nature as keyof typeof natures].increase === stat && (
                          <Badge variant="default" className="bg-green-500 text-xs">+10%</Badge>
                        )}
                        {natures[nature as keyof typeof natures].decrease === stat && (
                          <Badge variant="destructive" className="text-xs">-10%</Badge>
                        )}
                      </div>
                      <span className={`text-2xl font-bold ${getStatColor(stat as keyof StatCalculation)}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">Base Stat Total</span>
                      <span className="text-xl font-bold">
                        {Object.values(baseStats).reduce((sum, stat) => sum + stat, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-muted-foreground">Final Stat Total</span>
                      <span className="text-xl font-bold text-primary">{statTotal}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Stat Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(finalStats).map(([stat, finalValue]) => {
                    const base = baseStats[stat as keyof StatCalculation];
                    const iv = ivs[stat as keyof StatCalculation];
                    const ev = evs[stat as keyof StatCalculation];
                    const evBonus = Math.floor(ev / 4);
                    
                    return (
                      <div key={stat} className="text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {stat === 'hp' ? 'HP' : 
                             stat === 'spAttack' ? 'Sp. Attack' :
                             stat === 'spDefense' ? 'Sp. Defense' :
                             stat.charAt(0).toUpperCase() + stat.slice(1)}
                          </span>
                          <span className="font-bold">{finalValue}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Base: {base} | IV: {iv} | EV: {ev} (+{evBonus})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}