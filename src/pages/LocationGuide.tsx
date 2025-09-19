import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Search, Filter, Mountain, Trees, Waves, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import axios from "axios";

interface Location {
  id: number;
  name: string;
  region: { name: string };
  areas: Array<{
    name: string;
    pokemon_encounters: Array<{
      pokemon: { name: string };
      version_details: Array<{
        encounter_details: Array<{
          method: { name: string };
          chance: number;
          min_level: number;
          max_level: number;
        }>;
        max_chance: number;
        version: { name: string };
      }>;
    }>;
  }>;
}

interface PokemonEncounter {
  pokemon: string;
  location: string;
  area: string;
  method: string;
  chance: number;
  minLevel: number;
  maxLevel: number;
  version: string;
}

const regions = [
  "kanto", "johto", "hoenn", "sinnoh", "unova", "kalos", "alola", "galar"
];

const encounterMethods = [
  "walk", "surf", "old-rod", "good-rod", "super-rod", "rock-smash", 
  "headbutt", "dark-grass", "grass-spots", "cave-spots", "bridge-spots",
  "super-rod-spots", "surf-spots", "gift", "trade"
];

export default function LocationGuide() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [encounters, setEncounters] = useState<PokemonEncounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      // Fetch sample locations from each region
      const locationPromises = [
        'viridian-forest', 'route-1', 'cerulean-cave', 'victory-road-kanto',
        'route-29', 'ilex-forest', 'lake-of-rage', 'mt-silver',
        'route-101', 'petalburg-woods', 'meteor-falls', 'sky-pillar',
        'route-201', 'eterna-forest', 'mt-coronet', 'distortion-world'
      ].map(async (locationName) => {
        try {
          const response = await axios.get(`https://pokeapi.co/api/v2/location/${locationName}`);
          return response.data;
        } catch (error) {
          console.error(`Error fetching location ${locationName}:`, error);
          return null;
        }
      });

      const locationData = await Promise.all(locationPromises);
      const validLocations = locationData.filter((loc): loc is Location => loc !== null);
      setLocations(validLocations);

      // Process encounters
      const allEncounters: PokemonEncounter[] = [];
      validLocations.forEach(location => {
        location.areas.forEach(area => {
          area.pokemon_encounters?.forEach(encounter => {
            encounter.version_details.forEach(versionDetail => {
              versionDetail.encounter_details.forEach(detail => {
                allEncounters.push({
                  pokemon: encounter.pokemon.name,
                  location: location.name,
                  area: area.name,
                  method: detail.method.name,
                  chance: detail.chance,
                  minLevel: detail.min_level,
                  maxLevel: detail.max_level,
                  version: versionDetail.version.name
                });
              });
            });
          });
        });
      });

      setEncounters(allEncounters);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || location.region.name === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const filteredEncounters = encounters.filter(encounter => {
    const matchesSearch = 
      encounter.pokemon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encounter.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = selectedMethod === 'all' || encounter.method === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const formatName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getLocationIcon = (name: string) => {
    if (name.includes('forest') || name.includes('woods')) return <Trees className="h-4 w-4" />;
    if (name.includes('cave') || name.includes('mt-') || name.includes('mountain')) return <Mountain className="h-4 w-4" />;
    if (name.includes('lake') || name.includes('sea') || name.includes('bay')) return <Waves className="h-4 w-4" />;
    if (name.includes('city') || name.includes('town')) return <Building2 className="h-4 w-4" />;
    return <MapPin className="h-4 w-4" />;
  };

  const getEncounterMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      'walk': 'bg-green-500',
      'surf': 'bg-blue-500',
      'old-rod': 'bg-brown-500',
      'good-rod': 'bg-yellow-600',
      'super-rod': 'bg-purple-500',
      'rock-smash': 'bg-gray-500',
      'headbutt': 'bg-orange-500',
      'gift': 'bg-pink-500',
      'trade': 'bg-indigo-500'
    };
    return colors[method] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading location data...</p>
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
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Location Guide</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover where to find Pokémon across different regions
          </p>
        </div>

        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="encounters">Pokémon Encounters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="locations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Region</label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regions.map(region => (
                          <SelectItem key={region} value={region}>
                            <span className="capitalize">{region}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Locations</CardTitle>
                  <CardDescription>
                    {filteredLocations.length} locations found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {filteredLocations.map((location) => (
                      <div
                        key={location.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                          selectedLocation?.id === location.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => setSelectedLocation(location)}
                      >
                        <div className="flex items-center gap-3">
                          {getLocationIcon(location.name)}
                          <div>
                            <div className="font-medium">{formatName(location.name)}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {location.region.name} Region
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedLocation && (
                <Card>
                  <CardHeader>
                    <CardTitle>{formatName(selectedLocation.name)}</CardTitle>
                    <CardDescription>
                      {formatName(selectedLocation.region.name)} Region
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Areas</h4>
                        <div className="space-y-2">
                          {selectedLocation.areas.map((area, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{formatName(area.name)}</div>
                              {area.pokemon_encounters && area.pokemon_encounters.length > 0 && (
                                <div className="text-muted-foreground">
                                  {area.pokemon_encounters.length} Pokémon species found
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Pokémon Found Here</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedLocation.areas
                            .flatMap(area => area.pokemon_encounters?.map(enc => enc.pokemon.name) || [])
                            .filter((pokemon, index, arr) => arr.indexOf(pokemon) === index)
                            .slice(0, 10)
                            .map(pokemon => (
                              <Badge key={pokemon} variant="outline" className="text-xs">
                                {formatName(pokemon)}
                              </Badge>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="encounters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search Encounters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search Pokémon or locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Encounter Method</label>
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {encounterMethods.map(method => (
                          <SelectItem key={method} value={method}>
                            <span className="capitalize">{formatName(method)}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Encounter Data</CardTitle>
                <CardDescription>
                  {filteredEncounters.length} encounters found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEncounters.slice(0, 50).map((encounter, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">{formatName(encounter.pokemon)}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatName(encounter.location)} • {formatName(encounter.area)}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={`${getEncounterMethodColor(encounter.method)} text-white text-xs mb-1`}
                          >
                            {formatName(encounter.method)}
                          </Badge>
                          <div className="text-sm">
                            <div>Lv. {encounter.minLevel}-{encounter.maxLevel}</div>
                            <div className="text-muted-foreground">{encounter.chance}% chance</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}