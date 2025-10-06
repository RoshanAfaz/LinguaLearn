import React, { useState, useEffect } from 'react';
import { 
  Volume2, RotateCcw, CheckCircle, XCircle, Star, 
  ArrowLeft, ArrowRight, Lightbulb, Eye, EyeOff 
} from 'lucide-react';

const SmartFlashcards = ({ language, onBack, onXPGain }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cards, setCards] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  // Sample flashcards - in real app, this would come from API
  const sampleCards = [
    {
      id: 1,
      word: 'hello',
      translation: 'hola',
      pronunciation: '/ˈoʊlə/',
      example: 'Hola, ¿cómo estás?',
      difficulty: 'easy',
      image: '👋'
    },
    {
      id: 2,
      word: 'beautiful',
      translation: 'hermoso',
      pronunciation: '/erˈmoso/',
      example: 'Qué día tan hermoso.',
      difficulty: 'medium',
      image: '🌸'
    },
    {
      id: 3,
      word: 'extraordinary',
      translation: 'extraordinario',
      pronunciation: '/ekstɾaorðiˈnarjo/',
      example: 'Es una persona extraordinaria.',
      difficulty: 'hard',
      image: '✨'
    }
  ];

  useEffect(() => {
    setCards(sampleCards);
  }, []);

  const currentCard = cards[currentCardIndex];

  const handleAnswer = (isCorrect) => {
    setSessionStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1,
      total: prev.total + 1
    }));

    if (isCorrect && onXPGain) {
      const xpGain = currentCard.difficulty === 'hard' ? 15 : currentCard.difficulty === 'medium' ? 10 : 5;
      onXPGain(xpGain);
    }

    // Move to next card after a short delay
    setTimeout(() => {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        // Session complete
        alert(`Session Complete! Score: ${sessionStats.correct + (isCorrect ? 1 : 0)}/${sessionStats.total + 1}`);
        onBack();
      }
    }, 1000);
  };

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'es' ? 'es-ES' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!currentCard) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Flashcards...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Card {currentCardIndex + 1} of {cards.length}</p>
          <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>{sessionStats.correct}</span>
          </div>
          <div className="flex items-center space-x-1 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>{sessionStats.incorrect}</span>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative">
        <div 
          className={`bg-white rounded-3xl shadow-2xl border-4 transition-all duration-500 transform ${
            showAnswer ? 'rotate-y-180' : ''
          }`}
          style={{ minHeight: '400px' }}
        >
          {!showAnswer ? (
            // Front of card
            <div className="p-8 text-center h-full flex flex-col justify-center">
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                  {currentCard.difficulty}
                </span>
              </div>
              
              <div className="text-8xl mb-6">{currentCard.image}</div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentCard.word}</h2>
              
              <button
                onClick={() => speakWord(currentCard.word)}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Volume2 className="h-5 w-5" />
                <span>Listen</span>
              </button>
              
              <div className="mt-8">
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 mx-auto"
                >
                  <Eye className="h-5 w-5" />
                  <span>Show Answer</span>
                </button>
              </div>
            </div>
          ) : (
            // Back of card
            <div className="p-8 text-center h-full flex flex-col justify-center">
              <div className="text-6xl mb-6">{currentCard.image}</div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentCard.translation}</h2>
              <p className="text-gray-600 mb-4">{currentCard.pronunciation}</p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-gray-700 italic">"{currentCard.example}"</p>
              </div>
              
              <button
                onClick={() => speakWord(currentCard.translation)}
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-8"
              >
                <Volume2 className="h-5 w-5" />
                <span>Listen</span>
              </button>
              
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => handleAnswer(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Hard</span>
                </button>
                
                <button
                  onClick={() => handleAnswer(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Easy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hint */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 text-gray-500 text-sm">
          <Lightbulb className="h-4 w-4" />
          <span>Click "Show Answer" to see the translation, then rate your confidence</span>
        </div>
      </div>
    </div>
  );
};

export default SmartFlashcards;
