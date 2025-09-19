// Mock Tauri functions for web compatibility
export const invoke = async (command: string, args?: any) => {
  console.log(`Mock Tauri invoke: ${command}`, args);
  return null;
};

export const listen = (event: string, handler: (event: any) => void) => {
  console.log(`Mock Tauri listen: ${event}`);
  return () => {};
};

// Mock Tauri file operations for web
export const savePokemonDataToFile = async (data: any) => {
  localStorage.setItem('pokemon-data', JSON.stringify(data));
};

export const loadPokemonDataFromFile = async () => {
  const data = localStorage.getItem('pokemon-data');
  return data ? JSON.parse(data) : null;
};

export const saveFavoritesToFile = async (favorites: any) => {
  localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
};

export const loadFavoritesFromFile = async () => {
  const data = localStorage.getItem('pokemon-favorites');
  return data ? JSON.parse(data) : [];
};

export const isTauri = false;