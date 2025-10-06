import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Star, Clock, Target, Zap, Brain, Shuffle, ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { sampleWords } from '../data/languages';

const LanguageGames = ({ selectedLanguage, onLanguageChange }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, completed, failed

  const games = [
    {
      id: 'word-match',
      title: 'Word Match',
      description: 'Match words with their translations',
      icon: Target,
      difficulty: 'Easy',
      color: 'from-blue-500 to-blue-600',
      estimatedTime: '5-10 min'
    },
    {
      id: 'memory-cards',
      title: 'Memory Cards',
      description: 'Find matching pairs of words and translations',
      icon: Brain,
      difficulty: 'Medium',
      color: 'from-purple-500 to-purple-600',
      estimatedTime: '10-15 min'
    },
    {
      id: 'speed-typing',
      title: 'Speed Typing',
      description: 'Type the translation as fast as you can',
      icon: Zap,
      difficulty: 'Hard',
      color: 'from-orange-500 to-orange-600',
      estimatedTime: '5-8 min'
    },
    {
      id: 'word-scramble',
      title: 'Word Scramble',
      description: 'Unscramble the letters to form words',
      icon: Shuffle,
      difficulty: 'Medium',
      color: 'from-green-500 to-green-600',
      estimatedTime: '8-12 min'
    }
  ];

  const initializeGame = (gameId) => {
    const words = sampleWords[selectedLanguage] || sampleWords.es;
    const gameWords = words.slice(0, 8);
    
    switch (gameId) {
      case 'word-match':
        setGameData({
          words: gameWords,
          currentIndex: 0,
          options: generateOptions(gameWords[0], gameWords),
          correctAnswers: 0,
          totalQuestions: gameWords.length
        });
        break;
      case 'memory-cards':
        const cards = [];
        gameWords.slice(0, 6).forEach(word => {
          cards.push({ id: `word-${word.id}`, text: word.word, type: 'word', matched: false, wordId: word.id });
          cards.push({ id: `trans-${word.id}`, text: word.translation, type: 'translation', matched: false, wordId: word.id });
        });
        setGameData({
          cards: shuffleArray(cards),
          flippedCards: [],
          matchedPairs: 0,
          totalPairs: 6,
          attempts: 0
        });
        break;
      case 'speed-typing':
        setGameData({
          words: gameWords,
          currentIndex: 0,
          userInput: '',
          correctWords: 0,
          totalWords: gameWords.length
        });
        break;
      case 'word-scramble':
        setGameData({
          words: gameWords,
          currentIndex: 0,
          scrambledWord: scrambleWord(gameWords[0].word),
          userInput: '',
          correctAnswers: 0,
          totalQuestions: gameWords.length
        });
        break;
    }
    setScore(0);
    setGameState('playing');
  };

  const generateOptions = (correctWord, allWords) => {
    const options = [correctWord.translation];
    const otherWords = allWords.filter(w => w.id !== correctWord.id);
    
    while (options.length < 4 && otherWords.length > 0) {
      const randomWord = otherWords[Math.floor(Math.random() * otherWords.length)];
      if (!options.includes(randomWord.translation)) {
        options.push(randomWord.translation);
      }
      otherWords.splice(otherWords.indexOf(randomWord), 1);
    }
    
    return shuffleArray(options);
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const scrambleWord = (word) => {
    return shuffleArray(word.split('')).join('');
  };

  // Word Match Game Logic
  const handleWordMatchAnswer = (selectedAnswer) => {
    const currentWord = gameData.words[gameData.currentIndex];
    const isCorrect = selectedAnswer === currentWord.translation;
    
    if (isCorrect) {
      setScore(score + 10);
      setGameData(prev => ({ ...prev, correctAnswers: prev.correctAnswers + 1 }));
    }
    
    const nextIndex = gameData.currentIndex + 1;
    if (nextIndex >= gameData.totalQuestions) {
      setGameState('completed');
    } else {
      setGameData(prev => ({
        ...prev,
        currentIndex: nextIndex,
        options: generateOptions(gameData.words[nextIndex], gameData.words)
      }));
    }
  };

  // Memory Cards Game Logic
  const handleCardClick = (cardIndex) => {
    if (gameData.flippedCards.length === 2 || gameData.cards[cardIndex].matched) return;
    
    const newFlippedCards = [...gameData.flippedCards, cardIndex];
    setGameData(prev => ({ ...prev, flippedCards: newFlippedCards }));
    
    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards;
      const firstCard = gameData.cards[firstIndex];
      const secondCard = gameData.cards[secondIndex];
      
      setTimeout(() => {
        if (firstCard.wordId === secondCard.wordId) {
          const newCards = [...gameData.cards];
          newCards[firstIndex].matched = true;
          newCards[secondIndex].matched = true;
          
          const newMatchedPairs = gameData.matchedPairs + 1;
          setGameData(prev => ({
            ...prev,
            cards: newCards,
            flippedCards: [],
            matchedPairs: newMatchedPairs,
            attempts: prev.attempts + 1
          }));
          setScore(score + 20);
          
          if (newMatchedPairs === gameData.totalPairs) {
            setGameState('completed');
          }
        } else {
          setGameData(prev => ({
            ...prev,
            flippedCards: [],
            attempts: prev.attempts + 1
          }));
        }
      }, 1000);
    }
  };

  // Speed Typing Game Logic
  const handleSpeedTypingSubmit = (e) => {
    e.preventDefault();
    const currentWord = gameData.words[gameData.currentIndex];
    const isCorrect = gameData.userInput.toLowerCase().trim() === currentWord.translation.toLowerCase();
    
    if (isCorrect) {
      setScore(score + 15);
      setGameData(prev => ({ ...prev, correctWords: prev.correctWords + 1 }));
    }
    
    const nextIndex = gameData.currentIndex + 1;
    if (nextIndex >= gameData.totalWords) {
      setGameState('completed');
    } else {
      setGameData(prev => ({
        ...prev,
        currentIndex: nextIndex,
        userInput: ''
      }));
    }
  };

  // Word Scramble Game Logic
  const handleScrambleSubmit = (e) => {
    e.preventDefault();
    const currentWord = gameData.words[gameData.currentIndex];
    const isCorrect = gameData.userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    
    if (isCorrect) {
      setScore(score + 12);
      setGameData(prev => ({ ...prev, correctAnswers: prev.correctAnswers + 1 }));
    }
    
    const nextIndex = gameData.currentIndex + 1;
    if (nextIndex >= gameData.totalQuestions) {
      setGameState('completed');
    } else {
      setGameData(prev => ({
        ...prev,
        currentIndex: nextIndex,
        scrambledWord: scrambleWord(gameData.words[nextIndex].word),
        userInput: ''
      }));
    }
  };

  const resetGame = () => {
    if (selectedGame) {
      initializeGame(selectedGame);
    }
  };

  const renderGameCard = (game) => {
    const IconComponent = game.icon;

    return (
      <div
        key={game.id}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
        onClick={() => {
          setSelectedGame(game.id);
          initializeGame(game.id);
        }}
      >
        <div className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center mb-4`}>
          <IconComponent className="h-8 w-8 text-white" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
        <p className="text-gray-600 mb-4">{game.description}</p>

        <div className="flex items-center justify-between text-sm">
          <span className={`px-3 py-1 rounded-full text-white ${
            game.difficulty === 'Easy' ? 'bg-green-500' :
            game.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
            {game.difficulty}
          </span>
          <div className="flex items-center text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>{game.estimatedTime}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderWordMatchGame = () => {
    if (!gameData) return null;

    const currentWord = gameData.words[gameData.currentIndex];

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-2xl font-bold text-blue-600">{score}</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">
              Question {gameData.currentIndex + 1} of {gameData.totalQuestions}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentWord.word}</h2>
            <p className="text-gray-600">Choose the correct translation:</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {gameData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleWordMatchAnswer(option)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMemoryCardsGame = () => {
    if (!gameData) return null;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-500">Score: {score} | Attempts: {gameData.attempts}</div>
              <div className="text-lg font-bold text-purple-600">
                {gameData.matchedPairs} / {gameData.totalPairs} pairs found
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {gameData.cards.map((card, index) => (
              <div
                key={card.id}
                className={`aspect-square rounded-lg border-2 cursor-pointer transition-all duration-300 flex items-center justify-center text-center p-2 ${
                  card.matched
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : gameData.flippedCards.includes(index)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-gray-100 border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleCardClick(index)}
              >
                {card.matched || gameData.flippedCards.includes(index) ? (
                  <span className="font-medium text-sm">{card.text}</span>
                ) : (
                  <span className="text-2xl">?</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSpeedTypingGame = () => {
    if (!gameData) return null;

    const currentWord = gameData.words[gameData.currentIndex];

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-2xl font-bold text-orange-600">{score}</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">
              Word {gameData.currentIndex + 1} of {gameData.totalWords}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentWord.word}</h2>
            <p className="text-gray-600">Type the translation:</p>
          </div>

          <form onSubmit={handleSpeedTypingSubmit} className="space-y-4">
            <input
              type="text"
              value={gameData.userInput}
              onChange={(e) => setGameData(prev => ({ ...prev, userInput: e.target.value }))}
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-center text-xl focus:border-orange-500 focus:outline-none"
              placeholder="Enter translation..."
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderWordScrambleGame = () => {
    if (!gameData) return null;

    const currentWord = gameData.words[gameData.currentIndex];

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedGame(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="text-right">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-2xl font-bold text-green-600">{score}</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">
              Word {gameData.currentIndex + 1} of {gameData.totalQuestions}
            </div>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Translation: {currentWord.translation}</p>
              <h2 className="text-3xl font-bold text-gray-900 tracking-widest">{gameData.scrambledWord}</h2>
            </div>
            <p className="text-gray-600">Unscramble the letters:</p>
          </div>

          <form onSubmit={handleScrambleSubmit} className="space-y-4">
            <input
              type="text"
              value={gameData.userInput}
              onChange={(e) => setGameData(prev => ({ ...prev, userInput: e.target.value }))}
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-center text-xl focus:border-green-500 focus:outline-none"
              placeholder="Enter the word..."
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderGameCompleted = () => {
    const currentGame = games.find(g => g.id === selectedGame);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Game Completed!</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-yellow-600">{score}</span> points in {currentGame?.title}!
          </p>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={resetGame}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Play Again</span>
            </button>
            <button
              onClick={() => setSelectedGame(null)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  if (gameState === 'completed') {
    return renderGameCompleted();
  }

  if (selectedGame && gameData) {
    switch (selectedGame) {
      case 'word-match':
        return renderWordMatchGame();
      case 'memory-cards':
        return renderMemoryCardsGame();
      case 'speed-typing':
        return renderSpeedTypingGame();
      case 'word-scramble':
        return renderWordScrambleGame();
      default:
        return null;
    }
  }

  // Game selection screen
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <Gamepad2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Language Learning Games</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Learn through play! Choose a game to practice your vocabulary in a fun and engaging way.
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {games.map(renderGameCard)}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-500">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-500">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500">Best Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-500">Current Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageGames;
