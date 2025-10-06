import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, Target, Zap, Clock, Star, Trophy, 
  ArrowLeft, Shuffle, CheckCircle, XCircle, Volume2 
} from 'lucide-react';

const LanguageGamesHub = ({ language, onBack, onXPGain }) => {
  const [currentGame, setCurrentGame] = useState(null);
  const [gameStats, setGameStats] = useState({
    score: 0,
    timeLeft: 60,
    streak: 0
  });

  const games = [
    {
      id: 'word-match',
      title: 'Word Match',
      description: 'Match words with their translations',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      difficulty: 'Easy',
      xpReward: 15
    },
    {
      id: 'speed-translate',
      title: 'Speed Translate',
      description: 'Translate as many words as possible in 60 seconds',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Medium',
      xpReward: 20
    },
    {
      id: 'word-builder',
      title: 'Word Builder',
      description: 'Build words from scrambled letters',
      icon: Shuffle,
      color: 'from-green-500 to-emerald-500',
      difficulty: 'Hard',
      xpReward: 25
    }
  ];

  const WordMatchGame = () => {
    const [words] = useState([
      { id: 1, english: 'hello', spanish: 'hola' },
      { id: 2, english: 'goodbye', spanish: 'adiós' },
      { id: 3, english: 'thank you', spanish: 'gracias' },
      { id: 4, english: 'beautiful', spanish: 'hermoso' }
    ]);
    const [selectedEnglish, setSelectedEnglish] = useState(null);
    const [selectedSpanish, setSelectedSpanish] = useState(null);
    const [matches, setMatches] = useState([]);
    const [score, setScore] = useState(0);

    const handleEnglishClick = (word) => {
      setSelectedEnglish(word);
      if (selectedSpanish) {
        checkMatch(word, selectedSpanish);
      }
    };

    const handleSpanishClick = (word) => {
      setSelectedSpanish(word);
      if (selectedEnglish) {
        checkMatch(selectedEnglish, word);
      }
    };

    const checkMatch = (englishWord, spanishWord) => {
      if (englishWord.id === spanishWord.id) {
        setMatches([...matches, englishWord.id]);
        setScore(score + 10);
        if (onXPGain) onXPGain(10);
      }
      setSelectedEnglish(null);
      setSelectedSpanish(null);
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Word Match</h3>
          <p className="text-gray-600">Match English words with their Spanish translations</p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Score: {score}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* English Words */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-center text-gray-700">English</h4>
            {words.map(word => (
              <button
                key={`en-${word.id}`}
                onClick={() => handleEnglishClick(word)}
                disabled={matches.includes(word.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  matches.includes(word.id)
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : selectedEnglish?.id === word.id
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {word.english}
              </button>
            ))}
          </div>

          {/* Spanish Words */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-center text-gray-700">Español</h4>
            {words.map(word => (
              <button
                key={`es-${word.id}`}
                onClick={() => handleSpanishClick(word)}
                disabled={matches.includes(word.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  matches.includes(word.id)
                    ? 'bg-green-100 border-green-300 text-green-700'
                    : selectedSpanish?.id === word.id
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {word.spanish}
              </button>
            ))}
          </div>
        </div>

        {matches.length === words.length && (
          <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">Congratulations! 🎉</h3>
            <p className="text-green-700">You matched all words correctly!</p>
            <button
              onClick={() => setCurrentGame(null)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    );
  };

  const SpeedTranslateGame = () => {
    const [currentWord, setCurrentWord] = useState({ english: 'hello', spanish: 'hola' });
    const [userAnswer, setUserAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameActive, setGameActive] = useState(true);

    const words = [
      { english: 'hello', spanish: 'hola' },
      { english: 'goodbye', spanish: 'adiós' },
      { english: 'thank you', spanish: 'gracias' },
      { english: 'beautiful', spanish: 'hermoso' },
      { english: 'water', spanish: 'agua' },
      { english: 'food', spanish: 'comida' }
    ];

    useEffect(() => {
      if (timeLeft > 0 && gameActive) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else if (timeLeft === 0) {
        setGameActive(false);
      }
    }, [timeLeft, gameActive]);

    const checkAnswer = () => {
      if (userAnswer.toLowerCase().trim() === currentWord.spanish.toLowerCase()) {
        setScore(score + 10);
        if (onXPGain) onXPGain(5);
      }
      
      // Get next random word
      const nextWord = words[Math.floor(Math.random() * words.length)];
      setCurrentWord(nextWord);
      setUserAnswer('');
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        checkAnswer();
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Speed Translate</h3>
          <p className="text-gray-600">Translate as many words as possible!</p>
          
          <div className="mt-4 flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-1">
              <Clock className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-red-600">{timeLeft}s</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Score: {score}</span>
            </div>
          </div>
        </div>

        {gameActive ? (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center p-8 bg-blue-50 rounded-2xl border border-blue-200">
              <h4 className="text-3xl font-bold text-blue-900 mb-4">{currentWord.english}</h4>
              <p className="text-blue-600">Translate to Spanish</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer..."
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              
              <button
                onClick={checkAnswer}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Submit Answer
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
            <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-blue-900 mb-2">Time's Up! ⏰</h3>
            <p className="text-blue-700 mb-4">Final Score: {score} points</p>
            <button
              onClick={() => {
                setScore(0);
                setTimeLeft(60);
                setGameActive(true);
                setUserAnswer('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    );
  };

  if (currentGame === 'word-match') {
    return (
      <div>
        <button
          onClick={() => setCurrentGame(null)}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Games</span>
        </button>
        <WordMatchGame />
      </div>
    );
  }

  if (currentGame === 'speed-translate') {
    return (
      <div>
        <button
          onClick={() => setCurrentGame(null)}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Games</span>
        </button>
        <SpeedTranslateGame />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Language Games 🎮</h2>
        <p className="text-gray-600">Learn through fun and interactive games</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const IconComponent = game.icon;
          return (
            <div
              key={game.id}
              onClick={() => setCurrentGame(game.id)}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <div className={`bg-gradient-to-br ${game.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="h-8 w-8" />
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm">+{game.xpReward} XP</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                <p className="text-sm opacity-90 mb-4">{game.description}</p>
                
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    {game.difficulty}
                  </span>
                </div>
                
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 rounded-lg transition-all">
                  Play Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageGamesHub;
