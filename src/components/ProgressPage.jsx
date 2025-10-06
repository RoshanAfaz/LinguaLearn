import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Award, Clock, BookOpen, Zap } from 'lucide-react';
import { progressManager, sessionManager } from '../utils/localStorage';

const ProgressPage = ({ selectedLanguage, currentUser }) => {
  const [progressData, setProgressData] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [stats, setStats] = useState({
    totalWords: 0,
    masteredWords: 0,
    currentStreak: 0,
    totalSessions: 0,
    averageAccuracy: 0,
    totalStudyTime: 0
  });

  useEffect(() => {
    loadProgressData();
  }, [selectedLanguage]);

  // Add some sample data if no progress exists (for testing)
  useEffect(() => {
    const existingProgress = progressManager.getAllProgress();
    const existingSessions = sessionManager.getSessionHistory();

    if (Object.keys(existingProgress).length === 0) {
      // Add some sample progress data
      progressManager.updateProgress('hola', true);
      progressManager.updateProgress('hola', true);
      progressManager.updateProgress('hola', false);
      progressManager.updateProgress('casa', true);
      progressManager.updateProgress('agua', true);
      progressManager.updateProgress('agua', true);

      // Add some sample session data
      if (existingSessions.length === 0) {
        const sampleSessions = [
          {
            id: '1',
            date: new Date(Date.now() - 86400000), // Yesterday
            wordsStudied: 5,
            correctAnswers: 4,
            timeSpent: 15,
            language: selectedLanguage
          },
          {
            id: '2',
            date: new Date(Date.now() - 172800000), // 2 days ago
            wordsStudied: 8,
            correctAnswers: 6,
            timeSpent: 20,
            language: selectedLanguage
          }
        ];

        // Manually add to session history
        const currentHistory = sessionManager.getSessionHistory();
        currentHistory.push(...sampleSessions);
        localStorage.setItem('sessionHistory', JSON.stringify(currentHistory));
      }

      loadProgressData();
    }
  }, [selectedLanguage]);

  const loadProgressData = () => {
    // Get progress data for all words
    const progress = progressManager.getAllProgress();
    const sessions = sessionManager.getSessionHistory();

    // Filter sessions for current language
    const languageSessions = sessions.filter(s => s.language === selectedLanguage);

    setProgressData(progress);
    setSessionHistory(languageSessions.slice(-10)); // Last 10 sessions

    // Calculate stats
    const totalWords = Object.keys(progress).length;
    const masteredWords = Object.values(progress).filter(p => p.masteryLevel >= 80).length;
    const totalSessions = languageSessions.length;
    const totalCorrect = languageSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalAnswers = languageSessions.reduce((sum, s) => sum + s.wordsStudied, 0);
    const averageAccuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;
    const totalStudyTime = languageSessions.reduce((sum, s) => sum + (s.timeSpent || 0), 0);

    setStats({
      totalWords,
      masteredWords,
      currentStreak: calculateStreak(languageSessions),
      totalSessions,
      averageAccuracy: Math.round(averageAccuracy),
      totalStudyTime: totalStudyTime // Already in minutes
    });
  };

  const calculateStreak = (sessions) => {
    if (sessions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = sessions.length - 1; i >= 0; i--) {
      const sessionDate = new Date(sessions[i].date);
      const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getMasteryLevel = (level) => {
    if (level >= 80) return { label: 'Mastered', color: 'text-green-600', bg: 'bg-green-100' };
    if (level >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (level >= 40) return { label: 'Learning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'New', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
        <p className="text-gray-600 mt-2">Track your {selectedLanguage === 'es' ? 'Spanish' : 'language'} learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          title="Total Words"
          value={stats.totalWords}
          subtitle="in vocabulary"
          color="blue"
        />
        <StatCard
          icon={Award}
          title="Mastered"
          value={stats.masteredWords}
          subtitle="words learned"
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Accuracy"
          value={`${stats.averageAccuracy}%`}
          subtitle="average score"
          color="purple"
        />
        <StatCard
          icon={Clock}
          title="Study Time"
          value={`${stats.totalStudyTime}m`}
          subtitle="total minutes"
          color="orange"
        />
      </div>

      {/* Current Streak */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
              <p className="text-gray-600">Keep up the great work!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{stats.currentStreak}</div>
            <div className="text-sm text-gray-500">days</div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
        </div>
        <div className="p-6">
          {sessionHistory.length > 0 ? (
            <div className="space-y-4">
              {sessionHistory.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.wordsStudied} words studied
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {session.correctAnswers}/{session.totalAnswers}
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round((session.correctAnswers / session.totalAnswers) * 100)}% accuracy
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
              <p className="text-gray-500">Start learning to see your progress here!</p>
            </div>
          )}
        </div>
      </div>

      {/* Word Progress */}
      {progressData && Object.keys(progressData).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Word Progress</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(progressData).slice(0, 12).map(([wordId, progress]) => {
                const mastery = getMasteryLevel(progress.masteryLevel);
                return (
                  <div key={wordId} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{wordId}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${mastery.bg} ${mastery.color}`}>
                        {mastery.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.masteryLevel}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {progress.totalAttempts} attempts • {progress.masteryLevel}% mastery
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
