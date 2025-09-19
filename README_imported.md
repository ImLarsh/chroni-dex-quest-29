# Pokédex Desktop

A complete desktop Pokédex application built with React, TypeScript, and Tauri. Features all Pokémon generations with offline support, beautiful UI, and native desktop performance.

## Features

- **Complete Pokédex Database** - All 1010+ Pokémon from Gen 1-9
- **Offline Support** - Works fully offline after first data sync
- **Desktop Native** - Built with Tauri for lightweight, fast performance
- **Search & Filter** - By name, number, type, and generation
- **Favorites System** - Save your favorite Pokémon locally
- **Dark/Light Mode** - Toggle between themes
- **System Tray** - Minimize to system tray
- **Beautiful UI** - Modern, Pokédex-themed interface

## Screenshots

Coming soon...

## Download

Go to [Releases](https://github.com/user/pokedex-desktop/releases) to download the latest `.exe` file for Windows.

### Supported Platforms

- ✅ Windows (.exe)
- ✅ macOS (.dmg) 
- ✅ Linux (.AppImage)

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (latest stable)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/user/pokedex-desktop.git
   cd pokedex-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri:dev
   ```

4. **Build for production**
   ```bash
   npm run tauri:build
   ```

### Project Structure

```
src/
├── components/          # React components
│   ├── PokemonCard.tsx     # Individual Pokémon cards
│   ├── PokemonDetail.tsx   # Detailed Pokémon view
│   ├── PokedexHeader.tsx   # Header with search/filters
│   └── ThemeToggle.tsx     # Light/dark mode toggle
├── contexts/            # React contexts
│   └── ThemeContext.tsx    # Theme management
├── hooks/               # Custom React hooks
│   └── usePokemon.ts       # Pokémon data management
├── lib/                 # Utilities
│   ├── tauri.ts            # Tauri API functions
│   └── utils.ts            # General utilities
└── pages/               # Main pages
    └── Index.tsx           # Main application page

src-tauri/
├── src/
│   └── main.rs             # Rust backend
├── Cargo.toml              # Rust dependencies
└── tauri.conf.json         # Tauri configuration
```

## Building Releases

The project uses GitHub Actions to automatically build releases:

1. **Push to main branch** - Triggers development builds
2. **Create a tag** (e.g., `v1.0.0`) - Triggers production release
3. **Download from Releases** - Get the built executables

### Manual Build

```bash
# Build for current platform
npm run tauri:build

# Built files will be in src-tauri/target/release/bundle/
```

## Technologies Used

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Desktop Framework**: Tauri (Rust + WebView)
- **Animations**: Framer Motion
- **API**: PokéAPI
- **State Management**: React Hooks + Context
- **Build System**: Vite
- **CI/CD**: GitHub Actions

## API

This app uses the [PokéAPI](https://pokeapi.co/) for Pokémon data. All data is cached locally for offline use.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [PokéAPI](https://pokeapi.co/) for the comprehensive Pokémon database
- [Tauri](https://tauri.app/) for the amazing desktop framework
- The Pokémon Company for creating the amazing world of Pokémon
- The open-source community for the incredible tools and libraries

---

Built with ❤️ using Tauri + React + TypeScript