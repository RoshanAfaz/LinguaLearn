import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, Eye, EyeOff, Heart, Star, BookOpen, Zap, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';

const FlashCard = ({ word, onAnswer, showAnswer }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [confidence, setConfidence] = useState(null);

  useEffect(() => {
    setIsFlipped(false);
    setConfidence(null);
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [word]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = word.language === 'es' ? 'es-ES' :
                      word.language === 'fr' ? 'fr-FR' :
                      word.language === 'de' ? 'de-DE' :
                      word.language === 'it' ? 'it-IT' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200';
      case 'medium': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200';
    }
  };

  const handleConfidenceAnswer = (level) => {
    setConfidence(level);
    setTimeout(() => {
      if (onAnswer) {
        onAnswer(level); // Pass the confidence level directly
      }
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className={`relative ${isAnimating ? 'animate-fadeInUp' : ''}`}>
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner">
            {/* Front of card */}
            <div className="flip-card-front">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 min-h-[350px] relative">
                <div className="text-center space-y-4">
                  <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
                      {word.difficulty}
                    </span>
                    <button
                      onClick={handleFlip}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4 mt-8">
                    <div className="text-3xl font-bold text-gray-900">
                      {word.word}
                    </div>

                    {word.pronunciation && (
                      <div className="text-sm text-gray-600 italic bg-gray-50 px-3 py-1.5 rounded-lg">
                        /{word.pronunciation}/
                      </div>
                    )}

                    <button
                      onClick={speakWord}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm">Listen</span>
                    </button>

                    <div className="flex justify-center">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                        {word.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back of card */}
            <div className="flip-card-back">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 min-h-[350px] relative">
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-gray-900">
                      {word.translation}
                    </div>

                    {word.example && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Example:</div>
                        <div className="text-sm text-gray-800 italic">
                          "{word.example}"
                        </div>
                      </div>
                    )}

                    <div className="pt-4 space-y-3">
                      <div className="text-sm text-gray-700 font-medium">How confident are you?</div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleConfidenceAnswer('hard')}
                          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
                            confidence === 'hard'
                              ? 'bg-red-500 text-white'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span className="text-sm">Still Learning</span>
                        </button>
                        <button
                          onClick={() => handleConfidenceAnswer('medium')}
                          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
                            confidence === 'medium'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                          }`}
                        >
                          <Meh className="h-4 w-4" />
                          <span className="text-sm">Getting There</span>
                        </button>
                        <button
                          onClick={() => handleConfidenceAnswer('easy')}
                          className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${
                            confidence === 'easy'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-sm">Mastered!</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Click the flip button to reveal the answer
        </p>
      </div>
    </div>
  );
};

export default FlashCard;