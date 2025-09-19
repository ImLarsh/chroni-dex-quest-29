import React, { useState } from "react";
import { PokedexHeader } from "@/components/PokedexHeader";
import { PokemonCard } from "@/components/PokemonCard";
import { PokemonDetail } from "@/components/PokemonDetail";
import { usePokemon } from "@/hooks/usePokemon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const {
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedGeneration,
    setSelectedGeneration,
    selectedGame,
    setSelectedGame,
    filteredPokemon,
    getRandomPokemon,
    favorites,
    toggleFavorite,
    showFavorites,
    setShowFavorites,
  } = usePokemon();

  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);

  const handleRandomPokemon = () => {
    const randomPokemon = getRandomPokemon();
    if (randomPokemon) {
      setSelectedPokemonId(randomPokemon.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Loading Pokédex</h2>
              <p className="text-muted-foreground mt-1">Initializing database...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PokedexHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedGeneration={selectedGeneration}
        onGenerationChange={setSelectedGeneration}
        selectedGame={selectedGame}
        onGameChange={setSelectedGame}
        onRandomPokemon={handleRandomPokemon}
        showFavorites={showFavorites}
        onToggleFavorites={() => setShowFavorites(!showFavorites)}
        favoritesCount={favorites.length}
      />

      <main className="container mx-auto px-4 py-8">
         {/* Results Summary */}
         <div className="mb-8">
           <div className="flex items-center justify-between flex-wrap gap-4">
             <div className="flex items-center space-x-3">
               <h2 className="text-2xl font-bold">
                 {filteredPokemon.length === 0
                   ? 'No Results Found'
                   : showFavorites 
                     ? `Your ${filteredPokemon.length} Favorite${filteredPokemon.length === 1 ? '' : 's'}`
                     : `${filteredPokemon.length} Pokémon Found`
                 }
               </h2>
             </div>
           </div>
         </div>

        {/* Pokemon Grid */}
        {filteredPokemon.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredPokemon.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                onSelect={(pokemon) => setSelectedPokemonId(pokemon.id)}
                isFavorite={favorites.includes(pokemon.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center mx-auto">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold">
                  No Pokémon Found
                </h3>
                <p className="text-muted-foreground text-lg">
                  No results match your current search criteria.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
              </div>
              
              {(searchTerm || selectedType !== 'all' || selectedGeneration !== 'all' || selectedGame !== 'all' || showFavorites) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedGeneration('all');
                    setSelectedGame('all');
                    setShowFavorites(false);
                  }}
                  className="mt-6"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Pokemon Detail Modal */}
      {selectedPokemonId && (
        <PokemonDetail
          pokemonId={selectedPokemonId}
          onClose={() => setSelectedPokemonId(null)}
          isFavorite={favorites.includes(selectedPokemonId)}
          onToggleFavorite={toggleFavorite}
          onSwitchPokemon={setSelectedPokemonId}
        />
      )}
    </div>
  );
};

export default Index;