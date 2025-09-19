import { Search, Filter, Shuffle, Heart, Grid3X3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { NavigationMenu } from "./NavigationMenu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface PokedexHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedGeneration: string;
  onGenerationChange: (value: string) => void;
  selectedGame: string;
  onGameChange: (value: string) => void;
  onRandomPokemon: () => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
}

const pokemonTypes = [
  "all", "normal", "fire", "water", "electric", "grass", "ice", "fighting",
  "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon",
  "dark", "steel", "fairy"
];

const generations = [
  { value: "all", label: "All Generations" },
  { value: "1", label: "Gen I" },
  { value: "2", label: "Gen II" },
  { value: "3", label: "Gen III" },
  { value: "4", label: "Gen IV" },
  { value: "5", label: "Gen V" },
  { value: "6", label: "Gen VI" },
  { value: "7", label: "Gen VII" },
  { value: "8", label: "Gen VIII" },
  { value: "9", label: "Gen IX" },
];

const games = [
  { value: "all", label: "All Games" },
  { value: "red-blue", label: "Red & Blue" },
  { value: "yellow", label: "Yellow" },
  { value: "gold-silver", label: "Gold & Silver" },
  { value: "crystal", label: "Crystal" },
  { value: "ruby-sapphire", label: "Ruby & Sapphire" },
  { value: "emerald", label: "Emerald" },
  { value: "diamond-pearl", label: "Diamond & Pearl" },
  { value: "platinum", label: "Platinum" },
  { value: "black-white", label: "Black & White" },
  { value: "black2-white2", label: "Black 2 & White 2" },
  { value: "x-y", label: "X & Y" },
  { value: "sun-moon", label: "Sun & Moon" },
  { value: "sword-shield", label: "Sword & Shield" },
  { value: "scarlet-violet", label: "Scarlet & Violet" },
];

export function PokedexHeader({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedGeneration,
  onGenerationChange,
  selectedGame,
  onGameChange,
  onRandomPokemon,
  showFavorites,
  onToggleFavorites,
  favoritesCount
}: PokedexHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 creative-shadow">
      <div className="container mx-auto px-4 py-6">
        {/* Top Bar - Logo and Actions with personality */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow organic-border flex items-center justify-center transform group-hover:rotate-3 organic-hover creative-shadow">
                <Grid3X3 className="h-7 w-7 text-primary-foreground" />
              </div>
              {/* Decorative dots */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight creative-title handwritten-feel">
                Pokédex
              </h1>
              <p className="text-sm text-muted-foreground italic transform -rotate-1">
                Gotta catch 'em all! ✨
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-muted/50 organic-border">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground font-mono">Online</span>
            </div>
            <NavigationMenu />
            <ThemeToggle />
          </div>
        </div>

        {/* Creative Search Bar */}
        <div className="relative mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary organic-hover" />
            <Input
              placeholder="Search for your favorite Pokémon... 🔍"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-6 h-14 text-base organic-border bg-card/50 backdrop-blur-sm border-2 border-dashed border-border/60 hover:border-primary/30 focus:border-primary organic-hover playful-shadow"
            />
            {/* Decorative corner elements */}
            <div className="absolute top-2 right-2 w-1 h-1 bg-primary rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-accent rounded-full"></div>
          </div>
        </div>

        {/* Fun Actions & Filters */}
        <div className="space-y-6">
          {/* Primary Actions with character */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant={showFavorites ? "default" : "outline"}
              onClick={onToggleFavorites}
              className="h-11 px-6 organic-border organic-hover group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center">
                <Heart className={cn("h-4 w-4 mr-2 transform group-hover:scale-110 organic-hover", 
                  showFavorites && "fill-current animate-pulse")} />
                My Favorites
                {favoritesCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-6 px-2 text-xs organic-border bg-accent animate-bounce">
                    {favoritesCount}
                  </Badge>
                )}
              </div>
              {showFavorites && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 animate-pulse"></div>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onRandomPokemon}
              className="h-11 px-6 organic-border organic-hover group bg-gradient-to-r from-accent/10 to-secondary/10"
            >
              <Shuffle className="h-4 w-4 mr-2 transform group-hover:rotate-180 organic-hover" />
              Surprise Me!
            </Button>

            {/* Fun stats */}
            <div className="hidden md:flex items-center space-x-4 ml-auto">
              <div className="px-3 py-1 bg-muted/40 organic-border">
                <span className="text-xs text-muted-foreground">Generation</span>
                <div className="font-bold text-sm">{selectedGeneration === 'all' ? 'All' : `Gen ${selectedGeneration}`}</div>
              </div>
              <div className="px-3 py-1 bg-primary/5 organic-border">
                <span className="text-xs text-muted-foreground">Type</span>
                <div className="font-bold text-sm capitalize">{selectedType}</div>
              </div>
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Creative Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="group">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Type Filter</label>
              <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="h-12 organic-border organic-hover group-hover:shadow-md">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="organic-border creative-shadow">
                  {pokemonTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize organic-hover">
                      {type === "all" ? "🌟 All Types" : `${type} ${type === 'fire' ? '🔥' : type === 'water' ? '💧' : type === 'grass' ? '🌿' : type === 'electric' ? '⚡' : ''}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="group">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Generation</label>
              <Select value={selectedGeneration} onValueChange={onGenerationChange}>
                <SelectTrigger className="h-12 organic-border organic-hover group-hover:shadow-md">
                  <SelectValue placeholder="All Generations" />
                </SelectTrigger>
                <SelectContent className="organic-border creative-shadow">
                  {generations.map((gen) => (
                    <SelectItem key={gen.value} value={gen.value} className="organic-hover">
                      {gen.value === 'all' ? '🎮 All Generations' : `🏆 ${gen.label}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="group">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Game Version</label>
              <Select value={selectedGame} onValueChange={onGameChange}>
                <SelectTrigger className="h-12 organic-border organic-hover group-hover:shadow-md">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent className="organic-border creative-shadow">
                  {games.map((game) => (
                    <SelectItem key={game.value} value={game.value} className="organic-hover">
                      {game.value === 'all' ? '🎯 All Games' : `🎲 ${game.label}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}