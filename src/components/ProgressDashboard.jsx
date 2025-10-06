import React, { useState } from 'react';
import { TrendingUp, Award, Clock, Target, BookOpen, Calendar, Trophy, Gift } from 'lucide-react';
import { progressManager, sessionManager } from '../utils/localStorage';
import AchievementSystem from './AchievementSystem';
import DailyChallenges from './DailyChallenges';

const ProgressDashboard = ({ selectedLanguage }) => {
  const [activeView, setActiveView] = useState('overview');
  const allProgress = progressManager.getAllProgress();
  const sessionHistory = sessionManager.getSessionHistory();
  const currentSession = sessionManager.getCurrentSession();

  // Calculate overall stats
  const totalWords = Object.keys(allProgress).length;
  const masteredWords = Object.values(allProgress).filter(p => p.masteryLevel >= 80).length;
  const averageMastery = totalWords > 0 
    ? Math.round(Object.values(allProgress).reduce((sum, p) => sum + p.masteryLevel, 0) / totalWords)
    : 0;

  // Get recent sessions (last 7 days)
  const recentSessions = sessionHistory
    .filter(session => {
      const sessionDate = new Date(session.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalStudyTime = recentSessions.reduce((sum, session) => sum + session.timeSpent, 0);
  const averageAccuracy = recentSessions.length > 0
    ? Math.round(recentSessions.reduce((sum, session) =>
        sum + (session.correctAnswers / Math.max(session.wordsStudied, 1)), 0) / recentSessions.length * 100)
    : 0;

  // Calculate user stats for achievements
  const userStats = {
    wordsLearned: totalWords,
    currentStreak: 5, // This would be calculated from actual data
    perfectQuizzes: recentSessions.filter(s => s.correctAnswers === s.wordsStudied && s.wordsStudied > 0).length,
    quizzesCompleted: recentSessions.length,
    wordsLearnedToday: recentSessions.filter(s => {
      const today = new Date().toDateString();
      return new Date(s.date).toDateString() === today;
    }).reduce((sum, s) => sum + s.wordsStudied, 0),
    consecutiveDays: 7, // This would be calculated from actual data
    overallAccuracy: averageAccuracy
  };

  const handleAchievementUnlocked = (achievement) => {
    // Show notification or handle achievement unlock
    console.log('Achievement unlocked:', achievement.title);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* View Switcher */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Progress Dashboard</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeView === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('achievements')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'achievements'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Achievements</span>
            </button>
            <button
              onClick={() => setActiveView('challenges')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'challenges'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Daily Challenges</span>
            </button>
          </div>
        </div>
      </div>

      {activeView === 'achievements' ? (
        <AchievementSystem
          userStats={userStats}
          onAchievementUnlocked={handleAchievementUnlocked}
        />
      ) : (
        <>
          {/* Current Session */}
      {currentSession && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Current Session</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentSession.wordsStudied}</div>
              <div className="text-sm text-blue-600">Words Studied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{currentSession.correctAnswers}</div>
              <div className="text-sm text-blue-600">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((Date.now() - currentSession.startTime) / 60000)}m
              </div>
              <div className="text-sm text-blue-600">Time Spent</div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Words Learned" 
          value={totalWords} 
          icon={BookOpen}
          color="text-blue-600"
          subtitle="Total vocabulary"
        />
        <StatCard 
          title="Mastered" 
          value={masteredWords} 
          icon={Award}
          color="text-green-600"
          subtitle="80%+ accuracy"
        />
        <StatCard 
          title="Study Time" 
          value={`${totalStudyTime}m`} 
          icon={Clock}
          color="text-purple-600"
          subtitle="This week"
        />
        <StatCard 
          title="Accuracy" 
          value={`${averageAccuracy}%`} 
          icon={Target}
          color="text-orange-600"
          subtitle="Average score"
        />
      </div>

      {/* Progress Bars */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Learning Progress</span>
        </h3>
        <div className="space-y-6">
          <ProgressBar 
            label="Overall Mastery"
            value={averageMastery}
            max={100}
            color="bg-blue-600"
          />
          <ProgressBar 
            label="Words Mastered"
            value={masteredWords}
            max={Math.max(totalWords, 50)}
            color="bg-green-600"
          />
          <ProgressBar 
            label="Weekly Goal"
            value={Math.min(recentSessions.length, 7)}
            max={7}
            color="bg-purple-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Recent Sessions</span>
        </h3>
        {recentSessions.length > 0 ? (
          <div className="space-y-4">
            {recentSessions.slice(0, 5).map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.language.toUpperCase()} • {session.timeSpent} minutes
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {session.correctAnswers}/{session.wordsStudied}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.round((session.correctAnswers / Math.max(session.wordsStudied, 1)) * 100)}% accuracy
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No recent sessions found</p>
            <p className="text-sm">Start learning to see your progress here</p>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Award className="h-5 w-5" />
          <span>Achievements</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${totalWords >= 10 ? 'border-gold-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="text-center">
              <div className={`text-2xl mb-2 ${totalWords >= 10 ? '' : 'opacity-30'}`}>🏆</div>
              <div className="font-medium text-gray-900">First Steps</div>
              <div className="text-sm text-gray-600">Learn 10 words</div>
              <div className="text-xs text-gray-500 mt-1">{totalWords}/10</div>
            </div>
          </div>
          <div className={`p-4 rounded-lg border-2 ${masteredWords >= 5 ? 'border-gold-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="text-center">
              <div className={`text-2xl mb-2 ${masteredWords >= 5 ? '' : 'opacity-30'}`}>⭐</div>
              <div className="font-medium text-gray-900">Master</div>
              <div className="text-sm text-gray-600">Master 5 words</div>
              <div className="text-xs text-gray-500 mt-1">{masteredWords}/5</div>
            </div>
          </div>
          <div className={`p-4 rounded-lg border-2 ${recentSessions.length >= 7 ? 'border-gold-400 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="text-center">
              <div className={`text-2xl mb-2 ${recentSessions.length >= 7 ? '' : 'opacity-30'}`}>🔥</div>
              <div className="font-medium text-gray-900">Streak</div>
              <div className="text-sm text-gray-600">7 day streak</div>
              <div className="text-xs text-gray-500 mt-1">{recentSessions.length}/7</div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default ProgressDashboard;