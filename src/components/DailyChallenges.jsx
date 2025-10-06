import React, { useState } from 'react';
import { Target, Calendar, Star, Trophy, CheckCircle, ArrowLeft } from 'lucide-react';

const DailyChallenges = ({ language, onBack, onXPGain }) => {
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [currentChallenge, setCurrentChallenge] = useState(null);

  const dailyChallenges = [
    {
      id: 'daily-vocab',
      title: 'Daily Vocabulary',
      description: 'Learn 5 new words today',
      icon: '📚',
      xpReward: 50,
      difficulty: 'Easy',
      tasks: [
        { word: 'felicidad', translation: 'happiness' },
        { word: 'aventura', translation: 'adventure' },
        { word: 'sabiduría', translation: 'wisdom' },
        { word: 'esperanza', translation: 'hope' },
        { word: 'libertad', translation: 'freedom' }
      ]
    },
    {
      id: 'speed-challenge',
      title: 'Speed Translation',
      description: 'Translate 10 words in under 2 minutes',
      icon: '⚡',
      xpReward: 75,
      difficulty: 'Medium'
    },
    {
      id: 'pronunciation-streak',
      title: 'Pronunciation Streak',
      description: 'Get 3 perfect pronunciations in a row',
      icon: '🎤',
      xpReward: 60,
      difficulty: 'Medium'
    }
  ];

  const VocabularyChallenge = ({ challenge }) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [completedWords, setCompletedWords] = useState(0);

    const currentWord = challenge.tasks[currentWordIndex];

    const checkAnswer = () => {
      const isCorrect = userAnswer.toLowerCase().trim() === currentWord.translation.toLowerCase();

      if (isCorrect) {
        setCompletedWords(prev => prev + 1);
        if (onXPGain) onXPGain(10);
      }

      setShowAnswer(true);
      setTimeout(() => {
        if (currentWordIndex < challenge.tasks.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setUserAnswer('');
          setShowAnswer(false);
        } else {
          // Challenge completed
          setCompletedChallenges(prev => new Set([...prev, challenge.id]));
          if (onXPGain) onXPGain(challenge.xpReward);
          alert(`🎉 Challenge completed! +${challenge.xpReward} XP`);
          setCurrentChallenge(null);
        }
      }, 2000);
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Daily Vocabulary Challenge</h3>
          <p className="text-gray-600">Translate these words to English</p>
          <div className="mt-4">
            <span className="text-lg font-semibold text-blue-600">
              {completedWords}/{challenge.tasks.length} words completed
            </span>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-200">
            <h4 className="text-4xl font-bold text-blue-900 mb-4">{currentWord.word}</h4>

            {!showAnswer ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                  placeholder="Type the English translation..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                />
                <button
                  onClick={checkAnswer}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  userAnswer.toLowerCase().trim() === currentWord.translation.toLowerCase()
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  <p className="font-semibold">
                    {userAnswer.toLowerCase().trim() === currentWord.translation.toLowerCase()
                      ? '✅ Correct!'
                      : '❌ Incorrect'
                    }
                  </p>
                  <p>The answer is: <strong>{currentWord.translation}</strong></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (currentChallenge) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setCurrentChallenge(null)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Challenges</span>
        </button>

        {currentChallenge.id === 'daily-vocab' ? (
          <VocabularyChallenge challenge={currentChallenge} />
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{currentChallenge.icon}</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentChallenge.title}</h2>
            <p className="text-gray-600 mb-8">This challenge type is coming soon!</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Daily Challenges 🎯</h2>
          <p className="text-gray-600">Complete challenges to earn bonus XP</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Today</span>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dailyChallenges.map((challenge) => {
          const isCompleted = completedChallenges.has(challenge.id);

          return (
            <div
              key={challenge.id}
              className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 overflow-hidden ${
                isCompleted
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-100 hover:border-gray-300 hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{challenge.icon}</div>
                  <div className="flex items-center space-x-2">
                    {isCompleted && <CheckCircle className="h-6 w-6 text-green-600" />}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                <p className="text-gray-600 mb-4">{challenge.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-semibold">+{challenge.xpReward} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => !isCompleted && setCurrentChallenge(challenge)}
                  disabled={isCompleted}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    isCompleted
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {isCompleted ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Completed!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Start Challenge</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyChallenges;
