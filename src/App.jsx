import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import LanguageSelector from './components/LanguageSelector';
import FlashCard from './components/FlashCard';
import Quiz from './components/Quiz';
import ProgressDashboard from './components/ProgressDashboard';
import UserProfile from './components/UserProfile';
import SpacedRepetition from './components/SpacedRepetition';
import SimpleVocabulary from './components/SimpleVocabulary';
import TypingPractice from './components/TypingPractice';
import SmartTranslator from './components/SmartTranslator';
import InnovativeLearnPage from './components/InnovativeLearnPage';

import AIChatbot from './components/AIChatbot';
import LanguageGames from './components/LanguageGames';
import ProgressPage from './components/ProgressPage';
import AdminPanel from './components/admin/AdminPanel';
import AuthModal from './components/auth/AuthModal';
import BackgroundEffects from './components/BackgroundEffects';
import InteractiveStories from './components/InteractiveStories';
import AIConversation from './components/AIConversation';
import DailyChallenges from './components/DailyChallenges';
import { sampleWords, fetchLanguages, languages as supportedLanguages } from './data/languages';
import AlphabetBasics from './components/AlphabetBasics';
import { progressManager, sessionManager, storage } from './utils/localStorage';
import { Play, Brain, Shuffle, Repeat, BookOpen, Zap, Keyboard, MessageCircle, Target, Gamepad2, BarChart3, Languages } from 'lucide-react';
import apiService from './services/apiService';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [backgroundVariant, setBackgroundVariant] = useState('particles');

  const { user, isAuthenticated, isLoading, updateUser } = useAuth();

  // Redirect from admin tab if user is no longer admin
  useEffect(() => {
    if (!isLoading && activeTab === 'admin' && (!user || user.role !== 'admin')) {
      setActiveTab('learn');
    }
  }, [user, activeTab, isLoading]);

  // Update selected language when user changes or logs in
  useEffect(() => {
    if (user?.preferences?.preferredLanguage && user.preferences.preferredLanguage !== selectedLanguage) {
      setSelectedLanguage(user.preferences.preferredLanguage);
    }
  }, [user, selectedLanguage]);

  // Change background variant based on active tab
  useEffect(() => {
    const variants = {
      'home': 'particles',
      'learn': 'particles',
      'translator': 'geometric',
      'games': 'bubbles',
      'progress': 'waves',
      'profile': 'constellation',
      'admin': 'minimal'
    };
    setBackgroundVariant(variants[activeTab] || 'particles');
  }, [activeTab]);
  // Use authenticated user data or fallback to sample data for non-authenticated users
  const currentUser = user || {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    preferredLanguage: 'es',
    level: 'beginner',
    createdAt: new Date(),
    stats: {
      totalWordsLearned: 0,
      totalSessionsCompleted: 0,
      currentStreak: 0,
      totalStudyTime: 0
    }
  };
  const [learningMode, setLearningMode] = useState('flashcards'); // 'flashcards', 'quiz', 'spaced-repetition', 'typing', 'alphabet'
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsToStudy, setWordsToStudy] = useState([]);
  const [quizWords, setQuizWords] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [learningLevel, setLearningLevel] = useState(null); // 'beginner' | 'intermediate' | 'recall'
  const [showLevelModal, setShowLevelModal] = useState(false);
  // New: language selection flow for sessions
  const [showTargetLangModal, setShowTargetLangModal] = useState(false);
  const [showRefLangModal, setShowRefLangModal] = useState(false);
  const [pendingLevel, setPendingLevel] = useState(null);
  const [targetLanguageForSession, setTargetLanguageForSession] = useState(null);
  const [referenceLanguageForSession, setReferenceLanguageForSession] = useState(null);

  const [allWords, setAllWords] = useState(() => {
    const savedWords = storage.get('customWords', {});
    return { ...sampleWords, ...savedWords };
  });

  // Initialize words and session on language change
  useEffect(() => {
    const words = allWords[selectedLanguage] || [];
    setWordsToStudy(words);
    setCurrentWordIndex(0);

    // Apply preferred level if exists
    try {
      const levelPrefs = storage.get('preferredLevelByLang', {});
      const preferred = levelPrefs[selectedLanguage];
      if (preferred) {
        setLearningLevel(preferred);
      }
    } catch (e) { /* noop */ }

    // Prepare quiz words (random 5 words)
    const shuffledWords = [...words].sort(() => 0.5 - Math.random()).slice(0, Math.min(5, words.length));
    setQuizWords(shuffledWords);
  }, [selectedLanguage, allWords]);

  // Auto-save user data
  useEffect(() => {
    storage.set('currentUser', currentUser);
  }, [currentUser]);

  const startLearningSession = () => {
    // Ask user to choose level before starting the session
    setShowLevelModal(true);
  };

  const startSessionWithLevel = (level) => {
    // Store chosen level, then ask for target and reference languages
    setPendingLevel(level);
    setShowLevelModal(false);
    setShowTargetLangModal(true);
  };

  const endLearningSession = () => {
    const session = sessionManager.endSession();
    setSessionActive(false);
    if (session) {
      alert(`Session completed! You studied ${session.wordsStudied} words with ${session.correctAnswers} correct answers.`);
    }
  };

  const handleFlashcardAnswer = (isCorrect) => {
    const currentWord = wordsToStudy[currentWordIndex];
    if (!currentWord) return;

    // Update progress
    progressManager.updateProgress(currentWord.id, isCorrect);
    
    // Update session
    const currentSession = sessionManager.getCurrentSession();
    if (currentSession) {
      sessionManager.updateSession({
        wordsStudied: currentSession.wordsStudied + 1,
        correctAnswers: currentSession.correctAnswers + (isCorrect ? 1 : 0)
      });
    }

    // Move to next word
    if (currentWordIndex + 1 < wordsToStudy.length) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // Reset to beginning or end session
      setCurrentWordIndex(0);
      if (sessionActive) {
        endLearningSession();
      }
    }
  };

  const handleQuizComplete = (results) => {
    // Update progress for each word
    results.answers.forEach(answer => {
      progressManager.updateProgress(answer.word.id, answer.correct);
    });

    // Update session
    const currentSession = sessionManager.getCurrentSession();
    if (currentSession) {
      sessionManager.updateSession({
        wordsStudied: currentSession.wordsStudied + results.totalQuestions,
        correctAnswers: currentSession.correctAnswers + results.score
      });
    }

    alert(`Quiz completed! Score: ${results.score}/${results.totalQuestions} (${results.percentage}%)`);
  };

  const handleUserUpdate = async (userData) => {
    if (isAuthenticated) {
      // Update authenticated user via API
      await updateUser(userData);
    }
    // Update selected language if changed
    const newLanguage = userData.preferences?.preferredLanguage || userData.preferredLanguage;
    if (newLanguage && newLanguage !== selectedLanguage) {
      setSelectedLanguage(newLanguage);
    }
  };

  const shuffleWords = () => {
    const shuffled = [...wordsToStudy].sort(() => 0.5 - Math.random());
    setWordsToStudy(shuffled);
    setCurrentWordIndex(0);
  };

  const handleWordsUpdate = (languageCode, updatedWords) => {
    const newAllWords = { ...allWords, [languageCode || selectedLanguage]: updatedWords };
    setAllWords(newAllWords);
    storage.set('customWords', newAllWords);
  };

  // Core starter after we know level, target, and reference languages
  const startSessionCore = (level, targetLang, referenceLang) => {
    setLearningLevel(level);

    // Persist preferred level per language
    try {
      const levelPrefs = storage.get('preferredLevelByLang', {});
      storage.set('preferredLevelByLang', { ...levelPrefs, [targetLang]: level });
    } catch (e) { /* noop */ }

    // Ensure app uses the chosen target language
    if (selectedLanguage !== targetLang) setSelectedLanguage(targetLang);

    // Build word list based on level
    const all = allWords[targetLang] || [];
    let filtered = all;
    if (level === 'beginner') {
      filtered = all.filter(w => w.difficulty === 'easy');
    } else if (level === 'intermediate') {
      filtered = all.filter(w => w.difficulty === 'easy' || w.difficulty === 'medium');
    } else if (level === 'recall') {
      const progress = progressManager.getAllProgress();
      const now = new Date();
      filtered = all.filter(w => {
        const p = progress[w.id];
        return p ? new Date(p.nextReviewDate) <= now : false;
      });
      if (filtered.length === 0) filtered = all; // Fallback
    }

    setWordsToStudy(filtered);
    setCurrentWordIndex(0);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, Math.min(5, filtered.length));
    setQuizWords(shuffled);

    // Start and tag the session
    sessionManager.startSession(targetLang);
    sessionManager.updateSession({ level, referenceLanguage: referenceLang });
    setSessionActive(true);

    // Beginner path: start with alphabet first
    if (level === 'beginner') {
      setLearningMode('alphabet');
    }
  };

  const handleTargetLanguageSelect = (code) => {
    setTargetLanguageForSession(code);
    setShowTargetLangModal(false);
    setShowRefLangModal(true);
  };

  const handleReferenceLanguageSelect = (code) => {
    setReferenceLanguageForSession(code);
    setShowRefLangModal(false);
    if (pendingLevel && targetLanguageForSession) {
      startSessionCore(pendingLevel, targetLanguageForSession, code);
      setPendingLevel(null);
    }
  };

  const handleWordUpdate = (updatedWord) => {
    const currentWords = allWords[selectedLanguage] || [];
    const updatedWords = currentWords.map(word =>
      word.id === updatedWord.id ? updatedWord : word
    );
    handleWordsUpdate(updatedWords);
  };

  const renderHomeContent = () => {
    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Any Language with
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
                AI-Powered Learning
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the future of language learning with personalized AI tutors,
              interactive flashcards, and gamified challenges designed for rapid progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setActiveTab('learn')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Learning Now
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                View My Progress
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Flashcards</h3>
            <p className="text-gray-600">
              AI-powered spaced repetition ensures you learn efficiently and retain information longer.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Conversation</h3>
            <p className="text-gray-600">
              Practice real conversations with our advanced AI chatbot that adapts to your level.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
              <Gamepad2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Gamified Learning</h3>
            <p className="text-gray-600">
              Stay motivated with interactive games, challenges, and achievement systems.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Rich Content</h3>
            <p className="text-gray-600">
              Learn through stories, cultural context, and real-world examples with native speakers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Progress Tracking</h3>
            <p className="text-gray-600">
              Detailed analytics and personalized insights to track your learning journey.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
              <Languages className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Multiple Languages</h3>
            <p className="text-gray-600">
              Choose from dozens of languages with content tailored to your native language.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-8">Join Millions of Language Learners</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Languages Supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10M+</div>
              <div className="text-blue-100">Words Learned</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2M+</div>
              <div className="text-blue-100">Active Learners</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Language Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of learners who are mastering new languages every day.
          </p>
          <button
            onClick={() => setActiveTab('learn')}
            className="px-12 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl font-bold text-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started Free
          </button>
        </div>
      </div>
    );
  };

  const renderLearnContent = () => {
    if (wordsToStudy.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No words available yet</h3>
            <p className="text-gray-500 mb-6">We're adding more languages and content. Check back soon!</p>
            <button
              onClick={() => setSelectedLanguage('en')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Try English
            </button>
          </div>
        </div>
      );
    }

    const learningActivities = [
      {
        id: 'flashcards',
        title: 'Flashcards',
        description: 'Learn with interactive flashcards',
        icon: Brain,
        gradient: 'from-blue-500 to-purple-600',
        bgGradient: 'from-blue-50 to-purple-50',
        borderColor: 'border-blue-200'
      },
      {
        id: 'quiz',
        title: 'Quiz',
        description: 'Test your knowledge',
        icon: Play,
        gradient: 'from-green-500 to-teal-600',
        bgGradient: 'from-green-50 to-teal-50',
        borderColor: 'border-green-200'
      },
      {
        id: 'spaced-repetition',
        title: 'Smart Review',
        description: 'AI-powered spaced repetition',
        icon: Repeat,
        gradient: 'from-purple-500 to-pink-600',
        bgGradient: 'from-purple-50 to-pink-50',
        borderColor: 'border-purple-200'
      },
      {
        id: 'typing',
        title: 'Typing Practice',
        description: 'Improve your typing skills',
        icon: Keyboard,
        gradient: 'from-orange-500 to-red-600',
        bgGradient: 'from-orange-50 to-red-50',
        borderColor: 'border-orange-200'
      },
      {
        id: 'stories',
        title: 'Stories',
        description: 'Learn through engaging stories',
        icon: BookOpen,
        gradient: 'from-indigo-500 to-blue-600',
        bgGradient: 'from-indigo-50 to-blue-50',
        borderColor: 'border-indigo-200'
      },
      {
        id: 'conversation',
        title: 'AI Conversation',
        description: 'Practice with AI chatbot',
        icon: MessageCircle,
        gradient: 'from-teal-500 to-cyan-600',
        bgGradient: 'from-teal-50 to-cyan-50',
        borderColor: 'border-teal-200'
      }
    ];

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to LinguaLearn
          </h2>
          <p className="text-lg text-gray-600">
            Choose your language and start learning today
          </p>
        </div>

        {/* Language Selector */}
        <div className="max-w-4xl mx-auto">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        {/* Learning Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningActivities.map((activity) => {
            const Icon = activity.icon;
            const isSelected = learningMode === activity.id;

            return (
              <button
                key={activity.id}
                onClick={() => setLearningMode(activity.id)}
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 text-left ${
                  isSelected
                    ? `bg-gradient-to-br ${activity.bgGradient} ${activity.borderColor} shadow-lg`
                    : `bg-white border-gray-200 hover:border-gray-300 hover:shadow-md`
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${activity.gradient} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activity.title}
                </h3>
                <p className="text-gray-600">
                  {activity.description}
                </p>
                {isSelected && (
                  <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Session Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              {learningLevel && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Level:</span>
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                    {learningLevel}
                  </span>
                </div>
              )}
              {learningMode === 'flashcards' && (
                <button
                  onClick={shuffleWords}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Shuffle className="h-4 w-4" />
                  <span className="text-sm font-medium">Shuffle</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {!sessionActive ? (
                <button
                  onClick={startLearningSession}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
                >
                  Start Learning Session
                </button>
              ) : (
                <button
                  onClick={endLearningSession}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all"
                >
                  End Session
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        {learningMode === 'flashcards' && wordsToStudy.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentWordIndex + 1} of {wordsToStudy.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentWordIndex + 1) / wordsToStudy.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Learning Content */}
        <div>
          {/* Level selection modal */}
          {showLevelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-1">Choose your path</h3>
                <p className="text-sm text-gray-600 mb-4">Pick a level to tailor the session.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => startSessionWithLevel('beginner')}
                    className="w-full text-left p-4 rounded-xl border-2 border-green-200 hover:border-green-300 bg-green-50"
                  >
                    <div className="font-semibold text-green-900">Beginner</div>
                    <div className="text-sm text-green-700">Start with basic letters/sounds and simple words</div>
                  </button>
                  <button
                    onClick={() => startSessionWithLevel('intermediate')}
                    className="w-full text-left p-4 rounded-xl border-2 border-blue-200 hover:border-blue-300 bg-blue-50"
                  >
                    <div className="font-semibold text-blue-900">Intermediate</div>
                    <div className="text-sm text-blue-700">Practice common words and pronunciation</div>
                  </button>
                  <button
                    onClick={() => startSessionWithLevel('recall')}
                    className="w-full text-left p-4 rounded-xl border-2 border-purple-200 hover:border-purple-300 bg-purple-50"
                  >
                    <div className="font-semibold text-purple-900">Recall</div>
                    <div className="text-sm text-purple-700">Review items due for spaced repetition</div>
                  </button>
                </div>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setShowLevelModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {learningMode === 'flashcards' ? (
            wordsToStudy[currentWordIndex] ? (
              <FlashCard
                word={wordsToStudy[currentWordIndex]}
                onAnswer={handleFlashcardAnswer}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No more words to study!</p>
              </div>
            )
          ) : learningMode === 'quiz' ? (
            quizWords.length > 0 ? (
              <Quiz
                words={quizWords}
                onQuizComplete={handleQuizComplete}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Not enough words for a quiz. Need at least 4 words.</p>
              </div>
            )
          ) : learningMode === 'spaced-repetition' ? (
            <SpacedRepetition
              words={wordsToStudy}
              onWordUpdate={handleWordUpdate}
            />
          ) : learningMode === 'typing' ? (
            <TypingPractice
              words={wordsToStudy}
              onComplete={(results) => {
                console.log('Typing practice completed:', results);
                alert(`Great job! You completed ${results.correctWords}/${results.totalWords} words with ${results.accuracy}% accuracy!`);
              }}
            />
          ) : learningMode === 'stories' ? (
            <InteractiveStories
              language={selectedLanguage}
              onBack={() => setLearningMode('flashcards')}
              onXPGain={(xp) => {
                console.log('XP gained:', xp);
                // Handle XP gain if needed
              }}
            />
          ) : learningMode === 'conversation' ? (
            <AIConversation
              language={selectedLanguage}
              onBack={() => setLearningMode('flashcards')}
              onXPGain={(xp) => {
                console.log('XP gained:', xp);
                // Handle XP gain if needed
              }}
            />
          ) : learningMode === 'challenges' ? (
            <DailyChallenges
              language={selectedLanguage}
              onBack={() => setLearningMode('flashcards')}
              onXPGain={(xp) => {
                console.log('XP gained:', xp);
                // Handle XP gain if needed
              }}
            />
          ) : learningMode === 'alphabet' ? (
            <AlphabetBasics
              targetLanguage={targetLanguageForSession || selectedLanguage}
              referenceLanguage={referenceLanguageForSession}
              onBack={() => setLearningMode('flashcards')}
              onComplete={() => setLearningMode('flashcards')}
            />
          ) : null}
        </div>

        {/* Target Language Modal */}
        {showTargetLangModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold mb-1">Choose a language to learn</h3>
              <p className="text-sm text-gray-600 mb-4">Select your target language.</p>
              <div className="max-h-80 overflow-auto space-y-2">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleTargetLanguageSelect(lang.code)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 uppercase">{lang.code}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => { setShowTargetLangModal(false); setPendingLevel(null); }} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Reference Language Modal */}
        {showRefLangModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold mb-1">Choose your reference language</h3>
              <p className="text-sm text-gray-600 mb-4">We'll show meanings in this language.</p>
              <div className="max-h-80 overflow-auto space-y-2">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleReferenceLanguageSelect(lang.code)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-gray-200 hover:border-green-300"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 uppercase">{lang.code}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => { setShowRefLangModal(false); setPendingLevel(null); }} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Show loading spinner during authentication state changes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 relative">
      {/* Moving Background Effects */}
      <BackgroundEffects variant={backgroundVariant} />

      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onShowAuth={(mode) => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 content-layer">
        {activeTab === 'home' && (
          <div className="animate-fadeInUp">
            {renderHomeContent()}
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="animate-fadeInUp">
            {renderLearnContent()}
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="animate-fadeInUp">
            <AIChatbot />
          </div>
        )}

        {activeTab === 'games' && (
          <div className="animate-fadeInUp">
            <LanguageGames
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        )}

        {activeTab === 'translator' && (
          <div className="animate-fadeInUp">
            <SmartTranslator
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              onAddWord={(wordData) => {
                const currentWords = allWords[wordData.language] || [];
                const newWord = {
                  ...wordData,
                  id: Date.now().toString(),
                  createdAt: new Date().toISOString()
                };
                const updatedWords = [...currentWords, newWord];
                const newAllWords = { ...allWords, [wordData.language]: updatedWords };
                setAllWords(newAllWords);
                storage.set('customWords', newAllWords);
                alert(`Added "${wordData.word}" to your ${wordData.language} vocabulary!`);
              }}
            />
          </div>
        )}

        {activeTab === 'vocabulary' && (
          <div className="animate-fadeInUp">
            <SimpleVocabulary
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />
          </div>
        )}



        {activeTab === 'progress' && (
          <div className="animate-fadeInUp">
            <ProgressDashboard selectedLanguage={selectedLanguage} />
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="animate-fadeInUp">
            <ProgressPage
              selectedLanguage={selectedLanguage}
              currentUser={currentUser}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fadeInUp">
            <UserProfile
              user={currentUser}
              onUserUpdate={handleUserUpdate}
            />
          </div>
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="animate-fadeInUp">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />


    </div>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;