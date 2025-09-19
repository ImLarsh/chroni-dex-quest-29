import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Play, Pause, Volume2, VolumeX, Search, 
  SkipBack, SkipForward, Shuffle, RotateCcw 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Pokeball } from "@/components/PokemonIcons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface PokemonCry {
  id: number;
  name: string;
  sprite: string;
  cryUrl: string;
  types: string[];
}

export default function PokemonCries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentPokemon, setCurrentPokemon] = useState<PokemonCry | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchPokemon();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (isShuffleMode) {
        playRandomPokemon();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isShuffleMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const searchPokemon = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
      const filtered = response.data.results
        .filter((p: any) => p.name.includes(searchTerm.toLowerCase()))
        .slice(0, 12);
      setSearchResults(filtered);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search Pokémon",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPokemonCry = async (pokemon: any) => {
    try {
      const response = await axios.get(pokemon.url);
      const data = response.data;
      
      const pokemonCry: PokemonCry = {
        id: data.id,
        name: data.name,
        sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
        cryUrl: data.cries?.latest || `https://pokemoncries.com/cries/${data.id}.mp3`,
        types: data.types.map((t: any) => t.type.name),
      };
      
      setCurrentPokemon(pokemonCry);
      setProgress(0);
      
      toast({
        title: "Pokémon Loaded",
        description: `Ready to play ${pokemonCry.name}'s cry!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Pokémon cry",
        variant: "destructive",
      });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentPokemon) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        toast({
          title: "Playback Error",
          description: "Unable to play this Pokémon's cry",
          variant: "destructive",
        });
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(false);
  };

  const playRandomPokemon = async () => {
    try {
      const randomId = Math.floor(Math.random() * 1010) + 1;
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      await loadPokemonCry({ url: response.config.url });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load random Pokémon",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = () => {
    if (!currentPokemon) return;
    
    setFavorites(prev => 
      prev.includes(currentPokemon.id)
        ? prev.filter(id => id !== currentPokemon.id)
        : [...prev, currentPokemon.id]
    );
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Music className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pokémon Cries</h1>
              <p className="text-muted-foreground">Listen to authentic Pokémon sounds</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search & Library */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Find Pokémon</h3>
              
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
                
                <Button onClick={playRandomPokemon} variant="outline" className="w-full">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Random Pokémon
                </Button>
                
                {isLoading && (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                )}
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((pokemon) => (
                    <Card
                      key={pokemon.name}
                      className={cn(
                        "p-3 cursor-pointer transition-colors",
                        currentPokemon?.name === pokemon.name 
                          ? "bg-primary/10 border-primary/20" 
                          : "hover:bg-accent"
                      )}
                      onClick={() => loadPokemonCry(pokemon)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{pokemon.name}</span>
                        <Play className="h-4 w-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* Favorites */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsShuffleMode(!isShuffleMode)}
                >
                  <Shuffle className={cn("h-4 w-4 mr-2", isShuffleMode && "text-primary")} />
                  Shuffle Mode {isShuffleMode ? "On" : "Off"}
                </Button>
                
                {currentPokemon && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={toggleFavorite}
                  >
                    <Music className={cn(
                      "h-4 w-4 mr-2", 
                      favorites.includes(currentPokemon.id) && "text-red-500"
                    )} />
                    {favorites.includes(currentPokemon.id) ? "Favorited" : "Add to Favorites"}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Now Playing */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h3 className="font-semibold mb-6">Now Playing</h3>
              
              {currentPokemon ? (
                <div className="space-y-6">
                  {/* Pokemon Display */}
                  <div className="text-center">
                    <div className="w-48 h-48 mx-auto mb-4 relative">
                      <img
                        src={currentPokemon.sprite}
                        alt={currentPokemon.name}
                        className={cn(
                          "w-full h-full object-contain transition-transform duration-300",
                          isPlaying && "animate-pulse scale-105"
                        )}
                      />
                      {isPlaying && (
                        <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" />
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-bold capitalize mb-2">{currentPokemon.name}</h2>
                    <div className="flex justify-center gap-2 mb-4">
                      {currentPokemon.types.map(type => (
                        <Badge key={type} variant="secondary">{type}</Badge>
                      ))}
                    </div>
                    
                    <p className="text-muted-foreground">#{currentPokemon.id.toString().padStart(3, '0')}</p>
                  </div>

                  {/* Audio Controls */}
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatTime((progress / 100) * duration)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Play Controls */}
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => audioRef.current && (audioRef.current.currentTime -= 10)}
                        disabled={!currentPokemon}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="lg"
                        onClick={togglePlay}
                        disabled={!currentPokemon}
                        className="w-16 h-16 rounded-full"
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6 ml-1" />
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => audioRef.current && (audioRef.current.currentTime += 10)}
                        disabled={!currentPokemon}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3 max-w-xs mx-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Audio Element */}
                  <audio
                    ref={audioRef}
                    src={currentPokemon.cryUrl}
                    onError={() => {
                      toast({
                        title: "Audio Error",
                        description: "This Pokémon's cry is not available",
                        variant: "destructive",
                      });
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-16">
                  <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Pokémon Selected</h3>
                  <p className="text-muted-foreground mb-6">
                    Search for a Pokémon or select a random one to start listening to cries!
                  </p>
                  <Button onClick={playRandomPokemon}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Play Random Cry
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