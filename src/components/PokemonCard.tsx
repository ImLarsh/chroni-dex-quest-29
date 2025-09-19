import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
}

interface PokemonCardProps {
  pokemon: Pokemon;
  onSelect: (pokemon: Pokemon) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

const typeColors: Record<string, string> = {
  normal: "bg-gradient-to-br from-stone-400 to-stone-600",
  fire: "bg-gradient-to-br from-red-400 via-orange-500 to-red-600",
  water: "bg-gradient-to-br from-blue-400 via-cyan-500 to-blue-600",
  electric: "bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-500",
  grass: "bg-gradient-to-br from-green-400 via-emerald-500 to-green-600",
  ice: "bg-gradient-to-br from-cyan-200 via-sky-400 to-blue-400",
  fighting: "bg-gradient-to-br from-red-500 via-rose-600 to-red-700",
  poison: "bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600",
  ground: "bg-gradient-to-br from-amber-500 via-yellow-600 to-orange-600",
  flying: "bg-gradient-to-br from-indigo-300 via-sky-400 to-purple-400",
  psychic: "bg-gradient-to-br from-pink-400 via-rose-500 to-purple-500",
  bug: "bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600",
  rock: "bg-gradient-to-br from-amber-600 via-stone-600 to-yellow-700",
  ghost: "bg-gradient-to-br from-purple-500 via-indigo-600 to-violet-700",
  dragon: "bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700",
  dark: "bg-gradient-to-br from-gray-600 via-slate-700 to-gray-800",
  steel: "bg-gradient-to-br from-slate-400 via-zinc-500 to-slate-600",
  fairy: "bg-gradient-to-br from-pink-300 via-rose-400 to-pink-500",
};

export function PokemonCard({ pokemon, onSelect, isFavorite, onToggleFavorite }: PokemonCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const cardBg = typeColors[primaryType] || typeColors.normal;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(pokemon.id);
  };

  const imageUrl = pokemon.sprites.other?.['official-artwork']?.front_default || 
                   pokemon.sprites.front_default || 
                   `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-300 border border-border/50",
        "hover:border-primary/50 hover:shadow-lg",
        "bg-card"
      )}
      onClick={() => onSelect(pokemon)}
    >
      {/* Background Pattern */}
      <div className={cn("absolute inset-0 opacity-10", cardBg)} />
      
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-background/90 hover:bg-background border border-border/50"
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors duration-300",
              isFavorite 
                ? "fill-red-500 text-red-500" 
                : "text-muted-foreground hover:text-red-400"
            )} 
          />
        </button>
      )}

      <div className="relative p-5 space-y-4">
        {/* Pokemon Image */}
        <div className="relative mb-6 flex items-center justify-center h-32">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          
          <img
            src={imageUrl}
            alt={pokemon.name}
            className={cn(
              "max-w-full max-h-full object-contain transition-opacity duration-300",
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          
          {imageError && (
            <div className="flex items-center justify-center h-24 w-24 bg-muted border border-border/50 rounded-lg">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Pokemon Info with character */}
        <div className="space-y-4">
          {/* ID and Name */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-muted/40 rounded-md">
              <span className="text-xs text-muted-foreground font-mono">No.</span>
              <span className="font-bold text-sm text-primary">
                {pokemon.id.toString().padStart(3, '0')}
              </span>
            </div>
            <h3 className="text-xl font-bold capitalize leading-tight">
              {pokemon.name}
            </h3>
          </div>

          {/* Types */}
          <div className="flex flex-wrap gap-2 justify-center">
            {pokemon.types.map((type) => (
              <Badge
                key={type.type.name}
                variant="secondary"
                className={cn(
                  "text-xs px-3 py-1.5 text-white border-0 capitalize font-medium",
                  typeColors[type.type.name]
                )}
              >
                {type.type.name}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center p-2 bg-muted/30 rounded-md">
              <div className="text-muted-foreground">Height</div>
              <div className="font-bold text-sm">
                {(pokemon.height / 10).toFixed(1)}m
              </div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded-md">
              <div className="text-muted-foreground">Weight</div>
              <div className="font-bold text-sm">
                {(pokemon.weight / 10).toFixed(1)}kg
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}