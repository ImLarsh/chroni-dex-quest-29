import { useState } from "react";
import {
  Users, Calculator, BarChart3, Shuffle, Clock, Trophy,
  Music, Zap, MapPin, Heart, Target, ScrollText, Grid3X3,
  Gamepad2, Scale, BookOpen, Calendar, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tools = [
  {
    category: "Team Building",
    items: [
      { icon: Users, label: "Team Builder", path: "/team-builder", description: "Build your perfect team" },
      { icon: BarChart3, label: "Type Chart", path: "/type-chart", description: "Type effectiveness guide" },
      { icon: Calculator, label: "Stats Calculator", path: "/stats-calculator", description: "IV/EV calculator" },
    ]
  },
  {
    category: "Comparison Tools",
    items: [
      { icon: Scale, label: "Pokémon Compare", path: "/compare", description: "Compare two Pokémon" },
      { icon: Target, label: "Size Comparison", path: "/size-compare", description: "Visual size comparison" },
      { icon: Zap, label: "Weakness Calculator", path: "/weakness-calc", description: "Calculate damage multipliers" },
    ]
  },
  {
    category: "Database & Info",
    items: [
      { icon: ScrollText, label: "Move Database", path: "/moves", description: "Pokémon moves & abilities" },
      { icon: MapPin, label: "Location Guide", path: "/locations", description: "Where to find Pokémon" },
      { icon: Heart, label: "Breeding Guide", path: "/breeding", description: "Egg groups & breeding" },
    ]
  },
  {
    category: "Fun & Games",
    items: [
      { icon: Trophy, label: "Pokémon Quiz", path: "/quiz", description: "Test your knowledge" },
      { icon: Gamepad2, label: "Battle Simulator", path: "/battle", description: "Simple battle mechanics" },
      { icon: Music, label: "Pokémon Cries", path: "/cries", description: "Listen to Pokémon sounds" },
    ]
  },
  {
    category: "Special Features",
    items: [
      { icon: Calendar, label: "Generation Timeline", path: "/timeline", description: "Browse by generation" },
      { icon: Clock, label: "Pokémon of the Day", path: "/daily", description: "Daily featured Pokémon" },
      { icon: Shuffle, label: "Shiny Tracker", path: "/shiny-tracker", description: "Track shiny encounters" },
    ]
  }
];

interface NavigationMenuProps {
  className?: string;
}

export function NavigationMenu({ className }: NavigationMenuProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Quick Access - Home */}
      <Button
        variant={isActive("/") ? "default" : "outline"}
        size="sm"
        asChild
      >
        <Link to="/">
          <Grid3X3 className="h-4 w-4 mr-2" />
          Pokédex
        </Link>
      </Button>

      {/* Tools Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Tools
            <ChevronDown className="h-3 w-3 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-2" align="start">
          <div className="space-y-3">
            {tools.map((category, categoryIndex) => (
              <div key={category.category}>
                {categoryIndex > 0 && <DropdownMenuSeparator />}
                <div className="px-2 py-1">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category.category}
                  </h4>
                </div>
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <DropdownMenuItem key={item.path} asChild className="p-0">
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-start p-3 rounded-md transition-colors cursor-pointer w-full",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive(item.path) && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{item.label}</span>
                            {isActive(item.path) && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}