import React, { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Target, Calendar, Zap, Award, Medal, Crown, Gem } from 'lucide-react';

const AchievementSystem = ({ userStats, onAchievementUnlocked }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    return JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
  });
  const [recentlyUnlocked, setRecentlyUnlocked] = useState([]);

  const achievements = [
    {
      id: 'first_word',
      title: 'First Steps',
      description: 'Learn your first word',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      requirement: (stats) => stats.wordsLearned >= 1,
      points: 10
    },
    {
      id: 'word_collector_10',
      title: 'Word Collector',
      description: 'Learn 10 words',
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      requirement: (stats) => stats.wordsLearned >= 10,
      points: 25
    },
    {
      id: 'word_master_50',
      title: 'Word Master',
      description: 'Learn 50 words',
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      requirement: (stats) => stats.wordsLearned >= 50,
      points: 100
    },
    {
      id: 'vocabulary_expert_100',
      title: 'Vocabulary Expert',
      description: 'Learn 100 words',
      icon: Crown,
      color: 'text-gold-500',
      bgColor: 'bg-yellow-100',
      requirement: (stats) => stats.wordsLearned >= 100,
      points: 250
    },
    {
      id: 'streak_3',
      title: 'Getting Started',
      description: 'Maintain a 3-day learning streak',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      requirement: (stats) => stats.currentStreak >= 3,
      points: 30
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      requirement: (stats) => stats.currentStreak >= 7,
      points: 75
    },
    {
      id: 'streak_30',
      title: 'Dedication Master',
      description: 'Maintain a 30-day learning streak',
      icon: Flame,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      requirement: (stats) => stats.currentStreak >= 30,
      points: 300
    },
    {
      id: 'perfect_quiz',
      title: 'Perfect Score',
      description: 'Get 100% on a quiz',
      icon: Trophy,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      requirement: (stats) => stats.perfectQuizzes >= 1,
      points: 50
    },
    {
      id: 'quiz_master',
      title: 'Quiz Master',
      description: 'Complete 10 quizzes',
      icon: Medal,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
      requirement: (stats) => stats.quizzesCompleted >= 10,
      points: 100
    },
    {
      id: 'speed_learner',
      title: 'Speed Learner',
      description: 'Learn 20 words in one day',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      requirement: (stats) => stats.wordsLearnedToday >= 20,
      points: 75
    },
    {
      id: 'consistent_learner',
      title: 'Consistent Learner',
      description: 'Study for 7 consecutive days',
      icon: Calendar,
      color: 'text-teal-500',
      bgColor: 'bg-teal-100',
      requirement: (stats) => stats.consecutiveDays >= 7,
      points: 100
    },
    {
      id: 'accuracy_expert',
      title: 'Accuracy Expert',
      description: 'Maintain 90% accuracy over 50 words',
      icon: Gem,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100',
      requirement: (stats) => stats.overallAccuracy >= 90 && stats.wordsLearned >= 50,
      points: 150
    }
  ];

  useEffect(() => {
    checkForNewAchievements();
  }, [userStats]);

  const checkForNewAchievements = () => {
    const newlyUnlocked = [];
    
    achievements.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.requirement(userStats)) {
        newlyUnlocked.push(achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      const updatedUnlocked = [...unlockedAchievements, ...newlyUnlocked.map(a => a.id)];
      setUnlockedAchievements(updatedUnlocked);
      setRecentlyUnlocked(newlyUnlocked);
      localStorage.setItem('unlockedAchievements', JSON.stringify(updatedUnlocked));
      
      // Trigger achievement notification
      newlyUnlocked.forEach(achievement => {
        if (onAchievementUnlocked) {
          onAchievementUnlocked(achievement);
        }
      });

      // Clear recently unlocked after showing them
      setTimeout(() => {
        setRecentlyUnlocked([]);
      }, 5000);
    }
  };

  const getProgressPercentage = (achievement) => {
    if (unlockedAchievements.includes(achievement.id)) return 100;
    
    // Calculate progress based on achievement type
    if (achievement.id.includes('word_collector') || achievement.id.includes('word_master') || achievement.id.includes('vocabulary_expert')) {
      const target = parseInt(achievement.description.match(/\d+/)[0]);
      return Math.min((userStats.wordsLearned / target) * 100, 100);
    }
    
    if (achievement.id.includes('streak')) {
      const target = parseInt(achievement.description.match(/\d+/)[0]);
      return Math.min((userStats.currentStreak / target) * 100, 100);
    }
    
    if (achievement.id.includes('quiz')) {
      if (achievement.id === 'perfect_quiz') {
        return userStats.perfectQuizzes >= 1 ? 100 : 0;
      }
      const target = parseInt(achievement.description.match(/\d+/)[0]);
      return Math.min((userStats.quizzesCompleted / target) * 100, 100);
    }
    
    return 0;
  };

  const totalPoints = unlockedAchievements.reduce((total, achievementId) => {
    const achievement = achievements.find(a => a.id === achievementId);
    return total + (achievement ? achievement.points : 0);
  }, 0);

  const getLevel = (points) => {
    if (points >= 1000) return { level: 'Master', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (points >= 500) return { level: 'Expert', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (points >= 200) return { level: 'Advanced', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (points >= 50) return { level: 'Intermediate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Beginner', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const currentLevel = getLevel(totalPoints);

  return (
    <div className="space-y-8">
      {/* Recently Unlocked Achievements */}
      {recentlyUnlocked.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {recentlyUnlocked.map(achievement => {
            const IconComponent = achievement.icon;
            return (
              <div
                key={achievement.id}
                className="bg-white border-l-4 border-yellow-400 rounded-lg shadow-lg p-4 animate-slideInRight"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${achievement.bgColor} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`h-5 w-5 ${achievement.color}`} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Achievement Unlocked!</div>
                    <div className="text-sm text-gray-600">{achievement.title}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Level and Points Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Achievements</h2>
              <p className="text-purple-100">Track your learning milestones</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${currentLevel.bgColor} ${currentLevel.color} font-bold text-lg`}>
              {currentLevel.level}
            </div>
            <div className="text-2xl font-bold mt-2">{totalPoints} Points</div>
          </div>
        </div>
      </div>

      {/* Achievement Progress */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Your Progress</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map(achievement => {
            const IconComponent = achievement.icon;
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            const progress = getProgressPercentage(achievement);
            
            return (
              <div
                key={achievement.id}
                className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                  isUnlocked 
                    ? 'border-green-200 bg-green-50 shadow-lg' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                {isUnlocked && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${achievement.bgColor} rounded-xl flex items-center justify-center ${
                    isUnlocked ? 'shadow-md' : 'opacity-60'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${achievement.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-bold ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                    
                    {!isUnlocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-xs font-medium ${
                        isUnlocked ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {achievement.points} points
                      </span>
                      {isUnlocked && (
                        <span className="text-xs text-green-600 font-medium">
                          Unlocked!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Achievement Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{unlockedAchievements.length}</div>
            <div className="text-sm text-gray-600">Achievements Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{currentLevel.level}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;
