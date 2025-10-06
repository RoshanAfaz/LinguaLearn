import React, { useState, useEffect } from 'react';
import {
  Brain, Gamepad2, Zap, Target, Trophy, Star, Play,
  Eye, Shuffle, Clock, CheckCircle, XCircle,
  ArrowRight, ArrowLeft, RotateCcw, Lightbulb, Heart, Flame,
  BookOpen, MessageCircle
} from 'lucide-react';
import SmartFlashcards from './SmartFlashcards';
import LanguageGamesHub from './LanguageGamesHub';
import InteractiveStories from './InteractiveStories';

import AIConversation from './AIConversation';
import DailyChallenges from './DailyChallenges';

const InnovativeLearnPage = ({ selectedLanguage, onLanguageChange }) => {
  const [currentMethod, setCurrentMethod] = useState('dashboard');
  const [userLevel, setUserLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(5);
  const [hearts, setHearts] = useState(5);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState(0);

  const handleXPGain = (amount) => {
    setXp(prev => prev + amount);
    // Level up logic
    const newXP = xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    if (newLevel > userLevel) {
      setUserLevel(newLevel);
      // Show level up animation/notification
    }
  };

  // Sample learning content - in real app, this would come from API
  const learningMethods = [
    {
      id: 'flashcards',
      title: 'Smart Flashcards',
      description: 'Learn with AI-powered spaced repetition',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      difficulty: 'Beginner',
      time: '5-10 min',
      xpReward: 10
    },
    {
      id: 'stories',
      title: 'Interactive Stories',
      description: 'Learn through engaging narratives',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      difficulty: 'Intermediate',
      time: '10-15 min',
      xpReward: 20
    },
    {
      id: 'games',
      title: 'Language Games',
      description: 'Fun mini-games to boost vocabulary',
      icon: Gamepad2,
      color: 'from-green-500 to-emerald-500',
      difficulty: 'All Levels',
      time: '3-5 min',
      xpReward: 15
    },

    {
      id: 'conversation',
      title: 'AI Conversation',
      description: 'Chat with AI in your target language',
      icon: MessageCircle,
      color: 'from-indigo-500 to-purple-500',
      difficulty: 'Advanced',
      time: '10-20 min',
      xpReward: 25
    },
    {
      id: 'challenges',
      title: 'Daily Challenges',
      description: 'Complete daily tasks for bonus XP',
      icon: Target,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'All Levels',
      time: '2-5 min',
      xpReward: 30
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* User Stats Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
            <p className="text-blue-100 mt-2">Ready to continue your language journey?</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Flame className="h-5 w-5 text-orange-300" />
                  <span className="text-2xl font-bold">{streak}</span>
                </div>
                <p className="text-xs text-blue-200">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-300" />
                  <span className="text-2xl font-bold">{xp}</span>
                </div>
                <p className="text-xs text-blue-200">Total XP</p>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Heart className="h-5 w-5 text-red-300" />
                  <span className="text-2xl font-bold">{hearts}</span>
                </div>
                <p className="text-xs text-blue-200">Hearts</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Level {userLevel}</span>
            <span>{xp % 100}/100 XP to next level</span>
          </div>
          <div className="w-full bg-blue-400 rounded-full h-3">
            <div 
              className="bg-yellow-300 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(xp % 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Learning Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningMethods.map((method) => {
          const IconComponent = method.icon;
          return (
            <div
              key={method.id}
              onClick={() => setCurrentMethod(method.id)}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <div className={`bg-gradient-to-br ${method.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="h-8 w-8" />
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm">+{method.xpReward} XP</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                <p className="text-sm opacity-90 mb-4">{method.description}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full">
                    {method.difficulty}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{method.time}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-center">
                  <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all">
                    <Play className="h-4 w-4" />
                    <span>Start Learning</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-300 transition-all">
            <Target className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-green-900">Daily Goal</p>
              <p className="text-sm text-green-600">3/5 lessons completed</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-all">
            <Trophy className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold text-blue-900">Achievements</p>
              <p className="text-sm text-blue-600">12 badges earned</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:border-purple-300 transition-all">
            <Brain className="h-6 w-6 text-purple-600" />
            <div className="text-left">
              <p className="font-semibold text-purple-900">Review</p>
              <p className="text-sm text-purple-600">15 words to review</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderBackButton = () => (
    <button
      onClick={() => setCurrentMethod('dashboard')}
      className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <ArrowLeft className="h-5 w-5" />
      <span>Back to Dashboard</span>
    </button>
  );

  const renderLearningMethod = () => {
    switch (currentMethod) {
      case 'flashcards':
        return (
          <SmartFlashcards
            language={selectedLanguage}
            onBack={() => setCurrentMethod('dashboard')}
            onXPGain={handleXPGain}
          />
        );
      case 'games':
        return (
          <LanguageGamesHub
            language={selectedLanguage}
            onBack={() => setCurrentMethod('dashboard')}
            onXPGain={handleXPGain}
          />
        );
      case 'stories':
        return (
          <InteractiveStories
            language={selectedLanguage}
            onBack={() => setCurrentMethod('dashboard')}
            onXPGain={handleXPGain}
          />
        );

      case 'conversation':
        return (
          <AIConversation
            language={selectedLanguage}
            onBack={() => setCurrentMethod('dashboard')}
            onXPGain={handleXPGain}
          />
        );
      case 'challenges':
        return (
          <DailyChallenges
            language={selectedLanguage}
            onBack={() => setCurrentMethod('dashboard')}
            onXPGain={handleXPGain}
          />
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {renderLearningMethod()}
    </div>
  );
};

export default InnovativeLearnPage;
