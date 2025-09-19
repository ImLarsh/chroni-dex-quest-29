import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shuffle, CheckCircle, X, Clock, Target, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Pokeball } from "@/components/PokemonIcons";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  type: 'identify' | 'stats' | 'type' | 'evolution';
  question: string;
  options: string[];
  correct: number;
  pokemon?: any;
  explanation?: string;
}

const difficultyLevels = {
  easy: { name: "Easy", description: "Gen 1-2 Pokémon", color: "bg-green-500" },
  medium: { name: "Medium", description: "Gen 1-5 Pokémon", color: "bg-yellow-500" },
  hard: { name: "Hard", description: "All Generations", color: "bg-red-500" }
};

export default function PokemonQuiz() {
  const [difficulty, setDifficulty] = useState<keyof typeof difficultyLevels>('easy');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [pokemonPool, setPokemonPool] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameOver && !showResult && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1); // Wrong answer when time runs out
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, gameOver, showResult]);

  const loadPokemonPool = async () => {
    setIsLoading(true);
    try {
      const limit = difficulty === 'easy' ? 151 : 
                   difficulty === 'medium' ? 493 : 1010;
      
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
      const pokemonList = response.data.results;
      
      // Load detailed data for a subset
      const detailedPokemon = await Promise.all(
        pokemonList.slice(0, 50).map(async (p: any, index: number) => {
          try {
            const details = await axios.get(p.url);
            return details.data;
          } catch {
            return null;
          }
        })
      );
      
      setPokemonPool(detailedPokemon.filter(p => p !== null));
    } catch (error) {
      toast({
        title: "Loading Error",
        description: "Failed to load Pokémon data for quiz",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestion = (): Question => {
    if (pokemonPool.length === 0) return generateDummyQuestion();

    const questionTypes = ['identify', 'stats', 'type', 'evolution'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)] as Question['type'];
    
    const pokemon = pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
    
    switch (questionType) {
      case 'identify':
        return generateIdentifyQuestion(pokemon);
      case 'stats':
        return generateStatsQuestion(pokemon);
      case 'type':
        return generateTypeQuestion(pokemon);
      default:
        return generateIdentifyQuestion(pokemon);
    }
  };

  const generateIdentifyQuestion = (pokemon: any): Question => {
    const wrongAnswers = pokemonPool
      .filter(p => p.id !== pokemon.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(p => p.name);
    
    const options = [...wrongAnswers, pokemon.name].sort(() => 0.5 - Math.random());
    const correct = options.indexOf(pokemon.name);
    
    return {
      id: `identify-${pokemon.id}`,
      type: 'identify',
      question: "Who's that Pokémon?",
      options,
      correct,
      pokemon,
      explanation: `This is ${pokemon.name}, a ${pokemon.types.map((t: any) => t.type.name).join('/')} type Pokémon.`
    };
  };

  const generateStatsQuestion = (pokemon: any): Question => {
    const statIndex = Math.floor(Math.random() * pokemon.stats.length);
    const stat = pokemon.stats[statIndex];
    const statName = stat.stat.name.replace('-', ' ');
    
    const wrongValues = [
      stat.base_stat + Math.floor(Math.random() * 40) - 20,
      stat.base_stat + Math.floor(Math.random() * 60) - 30,
      stat.base_stat + Math.floor(Math.random() * 80) - 40,
    ].filter(v => v > 0 && v !== stat.base_stat).slice(0, 3);
    
    const options = [...wrongValues, stat.base_stat]
      .sort(() => 0.5 - Math.random())
      .map(v => v.toString());
    
    const correct = options.indexOf(stat.base_stat.toString());
    
    return {
      id: `stats-${pokemon.id}-${statIndex}`,
      type: 'stats',
      question: `What is ${pokemon.name}'s base ${statName}?`,
      options,
      correct,
      pokemon,
      explanation: `${pokemon.name}'s base ${statName} is ${stat.base_stat}.`
    };
  };

  const generateTypeQuestion = (pokemon: any): Question => {
    const types = pokemon.types.map((t: any) => t.type.name);
    const allTypes = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    
    const wrongTypes = allTypes
      .filter(t => !types.includes(t))
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const correctType = types[0];
    const options = [...wrongTypes, correctType].sort(() => 0.5 - Math.random());
    const correct = options.indexOf(correctType);
    
    return {
      id: `type-${pokemon.id}`,
      type: 'type',
      question: `What type is ${pokemon.name}?`,
      options,
      correct,
      pokemon,
      explanation: `${pokemon.name} is a ${types.join('/')} type Pokémon.`
    };
  };

  const generateDummyQuestion = (): Question => {
    return {
      id: 'dummy',
      type: 'identify',
      question: "Loading question...",
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correct: 0,
      explanation: "This is a placeholder question."
    };
  };

  const startGame = async () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    
    if (pokemonPool.length === 0) {
      await loadPokemonPool();
    }
    
    setCurrentQuestion(generateQuestion());
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult || gameOver) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === currentQuestion?.correct) {
      setScore(score + (timeLeft > 20 ? 100 : timeLeft > 10 ? 75 : 50));
      toast({
        title: "Correct!",
        description: `+${timeLeft > 20 ? 100 : timeLeft > 10 ? 75 : 50} points`,
      });
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) {
        setGameOver(true);
        toast({
          title: "Game Over!",
          description: `Final score: ${score}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setQuestionIndex(questionIndex + 1);
    setTimeLeft(30);
    setCurrentQuestion(generateQuestion());
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setCurrentQuestion(null);
    setScore(0);
    setLives(3);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Button variant="outline" asChild className="mb-4">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Pokédex
                </Link>
              </Button>
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Pokeball className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Pokémon Quiz</h1>
                  <p className="text-muted-foreground">Test your Pokémon knowledge</p>
                </div>
              </div>
            </div>

            {/* Difficulty Selection */}
            <Card className="p-8">
              <h2 className="text-xl font-semibold mb-6 text-center">Choose Difficulty</h2>
              <div className="grid gap-4 mb-8">
                {Object.entries(difficultyLevels).map(([key, level]) => (
                  <Card
                    key={key}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:shadow-md",
                      difficulty === key ? "ring-2 ring-primary" : ""
                    )}
                    onClick={() => setDifficulty(key as keyof typeof difficultyLevels)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-4 h-4 rounded-full", level.color)} />
                        <div>
                          <h3 className="font-semibold">{level.name}</h3>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                      </div>
                      {difficulty === key && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>• Answer questions correctly to earn points</p>
                  <p>• You have 3 lives and 30 seconds per question</p>
                  <p>• Faster answers earn more points</p>
                </div>
                <Button
                  onClick={startGame}
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading Pokémon..." : "Start Quiz"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Game Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge className="px-3 py-1">
                  Question {questionIndex + 1}
                </Badge>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="font-semibold">{score}</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-3 rounded-full",
                        i < lives ? "bg-red-500" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={resetGame}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Quit
              </Button>
            </div>
            
            {/* Timer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Left
                </span>
                <span className={cn("font-bold", timeLeft < 10 && "text-red-500")}>
                  {timeLeft}s
                </span>
              </div>
              <Progress value={(timeLeft / 30) * 100} className="h-2" />
            </div>
          </div>

          {/* Question */}
          {currentQuestion && (
            <Card className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
                
                {/* Pokemon Image for identify questions */}
                {currentQuestion.type === 'identify' && currentQuestion.pokemon && (
                  <div className="mb-6">
                    <div className="w-48 h-48 mx-auto mb-4 relative">
                      <img
                        src={currentQuestion.pokemon.sprites.other?.['official-artwork']?.front_default}
                        alt="Mystery Pokémon"
                        className={cn(
                          "w-full h-full object-contain",
                          !showResult && "brightness-0"
                        )}
                      />
                    </div>
                  </div>
                )}
                
                {/* Pokemon info for other question types */}
                {currentQuestion.type !== 'identify' && currentQuestion.pokemon && (
                  <div className="mb-6">
                    <img
                      src={currentQuestion.pokemon.sprites.other?.['official-artwork']?.front_default}
                      alt={currentQuestion.pokemon.name}
                      className="w-32 h-32 mx-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "h-12 text-left justify-start capitalize",
                      showResult && index === currentQuestion.correct && "bg-green-500 text-white border-green-500",
                      showResult && selectedAnswer === index && index !== currentQuestion.correct && "bg-red-500 text-white border-red-500"
                    )}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              {/* Result Explanation */}
              {showResult && currentQuestion.explanation && (
                <div className={cn(
                  "p-4 rounded-lg text-center",
                  selectedAnswer === currentQuestion.correct 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                )}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {selectedAnswer === currentQuestion.correct ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                    <span className="font-semibold">
                      {selectedAnswer === currentQuestion.correct ? "Correct!" : "Wrong!"}
                    </span>
                  </div>
                  <p className="text-sm">{currentQuestion.explanation}</p>
                </div>
              )}
            </Card>
          )}

          {/* Game Over */}
          {gameOver && (
            <Card className="p-8 text-center">
              <Pokeball className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-lg mb-4">Final Score: <span className="font-bold text-primary">{score}</span></p>
              <p className="text-muted-foreground mb-6">
                You answered {questionIndex} questions on {difficultyLevels[difficulty].name} difficulty
              </p>
              <Button onClick={resetGame} size="lg">
                Play Again
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}