import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TeamBuilder from "./pages/TeamBuilder";
import TypeChart from "./pages/TypeChart";
import PokemonCompare from "./pages/PokemonCompare";
import PokemonQuiz from "./pages/PokemonQuiz";
import PokemonDaily from "./pages/PokemonDaily";
import StatsCalculator from "./pages/StatsCalculator";
import SizeComparison from "./pages/SizeComparison";
import WeaknessCalculator from "./pages/WeaknessCalculator";
import MovesDatabase from "./pages/MovesDatabase";
import LocationGuide from "./pages/LocationGuide";
import BreedingGuide from "./pages/BreedingGuide";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="pokedex-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/team-builder" element={<TeamBuilder />} />
            <Route path="/type-chart" element={<TypeChart />} />
            <Route path="/compare" element={<PokemonCompare />} />
            <Route path="/quiz" element={<PokemonQuiz />} />
            <Route path="/daily" element={<PokemonDaily />} />
            <Route path="/stats-calculator" element={<StatsCalculator />} />
            <Route path="/size-compare" element={<SizeComparison />} />
            <Route path="/weakness-calc" element={<WeaknessCalculator />} />
            <Route path="/moves" element={<MovesDatabase />} />
            <Route path="/locations" element={<LocationGuide />} />
            <Route path="/breeding" element={<BreedingGuide />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
