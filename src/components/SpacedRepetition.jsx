import React, { useState, useEffect } from 'react';
import { Brain, Clock, Target, TrendingUp, Calendar, Zap } from 'lucide-react';

const SpacedRepetition = ({ words, onWordUpdate }) => {
  const [currentWord, setCurrentWord] = useState(null);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [stats, setStats] = useState({
    reviewed: 0,
    correct: 0,
    streak: 0
  });

  // Spaced repetition intervals (in days)
  const intervals = {
    0: 1,    // First review: 1 day
    1: 3,    // Second review: 3 days
    2: 7,    // Third review: 1 week
    3: 14,   // Fourth review: 2 weeks
    4: 30,   // Fifth review: 1 month
    5: 90    // Sixth review: 3 months
  };

  useEffect(() => {
    initializeReviewQueue();
  }, [words]);

  const initializeReviewQueue = () => {
    const now = new Date();
    const wordsToReview = words.filter(word => {
      const lastReview = word.lastReview ? new Date(word.lastReview) : new Date(0);
      const interval = intervals[word.reviewLevel || 0] || 90;
      const nextReview = new Date(lastReview.getTime() + interval * 24 * 60 * 60 * 1000);
      return now >= nextReview;
    });

    // Sort by priority (overdue words first, then by difficulty)
    wordsToReview.sort((a, b) => {
      const aOverdue = getDaysOverdue(a);
      const bOverdue = getDaysOverdue(b);
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      
      const difficultyOrder = { 'hard': 3, 'medium': 2, 'easy': 1 };
      return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
    });

    setReviewQueue(wordsToReview);
    setCurrentWord(wordsToReview[0] || null);
  };

  const getDaysOverdue = (word) => {
    const now = new Date();
    const lastReview = word.lastReview ? new Date(word.lastReview) : new Date(0);
    const interval = intervals[word.reviewLevel || 0] || 90;
    const nextReview = new Date(lastReview.getTime() + interval * 24 * 60 * 60 * 1000);
    return Math.max(0, Math.floor((now - nextReview) / (24 * 60 * 60 * 1000)));
  };

  const handleAnswer = (confidence) => {
    if (!currentWord) return;

    const isCorrect = confidence === 'easy' || confidence === 'good';
    const newReviewLevel = isCorrect 
      ? Math.min((currentWord.reviewLevel || 0) + 1, 5)
      : Math.max((currentWord.reviewLevel || 0) - 1, 0);

    const updatedWord = {
      ...currentWord,
      lastReview: new Date().toISOString(),
      reviewLevel: newReviewLevel,
      totalReviews: (currentWord.totalReviews || 0) + 1,
      correctReviews: (currentWord.correctReviews || 0) + (isCorrect ? 1 : 0)
    };

    onWordUpdate(updatedWord);

    setStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0
    }));

    // Move to next word
    const remainingWords = reviewQueue.slice(1);
    setReviewQueue(remainingWords);
    setCurrentWord(remainingWords[0] || null);
  };

  const getNextReviewDate = (word) => {
    const interval = intervals[word.reviewLevel || 0] || 90;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate.toLocaleDateString();
  };

  if (!currentWord) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-12 shadow-xl">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">All Caught Up!</h2>
          <p className="text-gray-600 text-lg mb-6">
            No words are due for review right now. Great job staying on top of your learning!
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.reviewed}</div>
              <div className="text-sm text-gray-600">Reviewed Today</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.correct}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.streak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Spaced Repetition</h2>
              <p className="text-blue-100">Optimized learning schedule</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{reviewQueue.length}</div>
            <div className="text-blue-100">words remaining</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.reviewed}</div>
            <div className="text-blue-100 text-sm">Reviewed</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{Math.round((stats.correct / Math.max(stats.reviewed, 1)) * 100)}%</div>
            <div className="text-blue-100 text-sm">Accuracy</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{stats.streak}</div>
            <div className="text-blue-100 text-sm">Streak</div>
          </div>
        </div>
      </div>

      {/* Current Word Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
        <div className="text-center space-y-6">
          {/* Word Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                currentWord.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentWord.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentWord.difficulty}
              </span>
              {getDaysOverdue(currentWord) > 0 && (
                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                  <Clock className="inline h-4 w-4 mr-1" />
                  {getDaysOverdue(currentWord)} days overdue
                </span>
              )}
            </div>
            
            <div className="text-6xl font-bold gradient-text">
              {currentWord.word}
            </div>
            
            {currentWord.pronunciation && (
              <div className="text-xl text-gray-600 italic">
                /{currentWord.pronunciation}/
              </div>
            )}
          </div>

          {/* Translation and Example */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
            <div className="text-3xl font-bold text-blue-600">
              {currentWord.translation}
            </div>
            
            {currentWord.example && (
              <div className="text-gray-700 italic">
                "{currentWord.example}"
              </div>
            )}
          </div>

          {/* Confidence Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">How well do you know this word?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleAnswer('hard')}
                className="flex flex-col items-center space-y-2 p-6 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="text-red-700 font-semibold">Again</div>
                <div className="text-red-600 text-sm">Review in 1 day</div>
              </button>
              
              <button
                onClick={() => handleAnswer('medium')}
                className="flex flex-col items-center space-y-2 p-6 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div className="text-yellow-700 font-semibold">Good</div>
                <div className="text-yellow-600 text-sm">Review in {intervals[currentWord.reviewLevel || 0]} days</div>
              </button>
              
              <button
                onClick={() => handleAnswer('easy')}
                className="flex flex-col items-center space-y-2 p-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="text-green-700 font-semibold">Easy</div>
                <div className="text-green-600 text-sm">Review in {intervals[Math.min((currentWord.reviewLevel || 0) + 1, 5)]} days</div>
              </button>
            </div>
          </div>

          {/* Word Stats */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{currentWord.totalReviews || 0}</div>
                <div className="text-blue-600 text-sm">Total Reviews</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {Math.round(((currentWord.correctReviews || 0) / Math.max(currentWord.totalReviews || 1, 1)) * 100)}%
                </div>
                <div className="text-green-600 text-sm">Success Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{getNextReviewDate(currentWord)}</div>
                <div className="text-purple-600 text-sm">Next Review</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacedRepetition;
