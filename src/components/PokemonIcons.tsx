import React from 'react';

// Pokemon-themed icon components
export const PokemonHeart = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/heart.png" alt="HP" className={className} />
);

export const PokemonFight = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/fight.png" alt="Attack" className={className} />
);

export const PokemonDefense = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/defense.png" alt="Defense" className={className} />
);

export const PokemonSpecial = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/special.png" alt="Special" className={className} />
);

export const PokemonSpeed = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/speed.png" alt="Speed" className={className} />
);

export const PokemonStats = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/stats.png" alt="Stats" className={className} />
);

export const Pokeball = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/pokeball.png" alt="Pokeball" className={className} />
);

export const Pikachu = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/pikachu.png" alt="Pikachu" className={className} />
);

export const PokemonCalendar = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/calendar.png" alt="Calendar" className={className} />
);

export const PokemonMusic = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/music-note.png" alt="Music" className={className} />
);

export const PokemonShuffle = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/shuffle.png" alt="Shuffle" className={className} />
);

export const PokemonBattle = ({ className }: { className?: string }) => (
  <img src="/src/assets/pokemon-icons/battle.png" alt="Battle" className={className} />
);

// Icon mapping for stats
export const getPokemonStatIcon = (statName: string) => {
  switch (statName) {
    case 'hp':
      return PokemonHeart;
    case 'attack':
      return PokemonFight;
    case 'defense':
      return PokemonDefense;
    case 'special-attack':
      return PokemonSpecial;
    case 'special-defense':
      return PokemonDefense;
    case 'speed':
      return PokemonSpeed;
    default:
      return PokemonStats;
  }
};