import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Volume2, Star, BookOpen, Edit3, Trash2, 
  Filter, Eye, EyeOff, Shuffle, Play, CheckCircle, Heart
} from 'lucide-react';

const SimpleVocabulary = ({ selectedLanguage, onLanguageChange }) => {
  const [words, setWords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentView, setCurrentView] = useState('grid'); // grid, list, study
  const [studyMode, setStudyMode] = useState(false);
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const [newWord, setNewWord] = useState({
    word: '',
    translation: '',
    category: 'general',
    difficulty: 'easy'
  });

  // Sample vocabulary data
  const sampleWords = [
    { id: 1, word: 'hola', translation: 'hello', category: 'greetings', difficulty: 'easy', learned: true },
    { id: 2, word: 'gracias', translation: 'thank you', category: 'greetings', difficulty: 'easy', learned: true },
    { id: 3, word: 'hermoso', translation: 'beautiful', category: 'adjectives', difficulty: 'medium', learned: false },
    { id: 4, word: 'extraordinario', translation: 'extraordinary', category: 'adjectives', difficulty: 'hard', learned: false },
    { id: 5, word: 'comida', translation: 'food', category: 'food', difficulty: 'easy', learned: true },
    { id: 6, word: 'familia', translation: 'family', category: 'family', difficulty: 'easy', learned: true },
    { id: 7, word: 'aventura', translation: 'adventure', category: 'general', difficulty: 'medium', learned: false },
    { id: 8, word: 'felicidad', translation: 'happiness', category: 'emotions', difficulty: 'medium', learned: false }
  ];

  useEffect(() => {
    setWords(sampleWords);
  }, []);

  const categories = ['all', 'greetings', 'adjectives', 'food', 'family', 'emotions', 'general'];
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addWord = () => {
    if (newWord.word && newWord.translation) {
      const word = {
        id: Date.now(),
        ...newWord,
        learned: false
      };
      setWords(prev => [...prev, word]);
      setNewWord({ word: '', translation: '', category: 'general', difficulty: 'easy' });
      setShowAddForm(false);
    }
  };

  const toggleFavorite = (wordId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(wordId)) {
        newFavorites.delete(wordId);
      } else {
        newFavorites.add(wordId);
      }
      return newFavorites;
    });
  };

  const markAsLearned = (wordId) => {
    setWords(prev => prev.map(word => 
      word.id === wordId ? { ...word, learned: !word.learned } : word
    ));
  };

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'es' ? 'es-ES' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const startStudyMode = () => {
    setStudyMode(true);
    setCurrentStudyIndex(0);
    setShowTranslation(false);
  };

  const nextStudyCard = () => {
    if (currentStudyIndex < filteredWords.length - 1) {
      setCurrentStudyIndex(prev => prev + 1);
      setShowTranslation(false);
    } else {
      setStudyMode(false);
      alert('🎉 Study session completed!');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      greetings: '👋',
      adjectives: '✨',
      food: '🍽️',
      family: '👨‍👩‍👧‍👦',
      emotions: '😊',
      general: '📝'
    };
    return icons[category] || '📝';
  };

  if (studyMode) {
    const currentWord = filteredWords[currentStudyIndex];
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Study Mode Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStudyMode(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Vocabulary
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Study Mode</h2>
            <p className="text-gray-600">{currentStudyIndex + 1} of {filteredWords.length}</p>
          </div>
          <div className="w-20"></div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentStudyIndex + 1) / filteredWords.length) * 100}%` }}
          ></div>
        </div>

        {/* Study Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 text-center" style={{ minHeight: '400px' }}>
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentWord.difficulty)}`}>
                {currentWord.difficulty}
              </span>
            </div>

            <div className="text-6xl mb-6">{getCategoryIcon(currentWord.category)}</div>
            
            <h3 className="text-4xl font-bold text-gray-900 mb-4">{currentWord.word}</h3>
            
            <button
              onClick={() => speakWord(currentWord.word)}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-8"
            >
              <Volume2 className="h-6 w-6" />
              <span>Listen</span>
            </button>

            {showTranslation ? (
              <div className="space-y-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <p className="text-2xl font-semibold text-green-900">{currentWord.translation}</p>
                </div>
                
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => {
                      markAsLearned(currentWord.id);
                      nextStudyCard();
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Got it!</span>
                  </button>
                  
                  <button
                    onClick={nextStudyCard}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Next Word
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowTranslation(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2 mx-auto"
              >
                <Eye className="h-5 w-5" />
                <span>Show Translation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Vocabulary 📚</h1>
          <p className="text-gray-600">Manage and study your words</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{words.length}</div>
            <div className="text-sm text-gray-600">Total Words</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{words.filter(w => w.learned).length}</div>
            <div className="text-sm text-gray-600">Learned</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={startStudyMode}
              disabled={filteredWords.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              <span>Study</span>
            </button>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Word</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Word Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Word</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Word (e.g., hola)"
              value={newWord.word}
              onChange={(e) => setNewWord(prev => ({ ...prev, word: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Translation (e.g., hello)"
              value={newWord.translation}
              onChange={(e) => setNewWord(prev => ({ ...prev, translation: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <select
              value={newWord.category}
              onChange={(e) => setNewWord(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {categories.slice(1).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={newWord.difficulty}
              onChange={(e) => setNewWord(prev => ({ ...prev, difficulty: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={addWord}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Add Word
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Words Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWords.map((word) => (
          <div
            key={word.id}
            className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
              word.learned ? 'border-green-300 bg-green-50' : 'border-gray-100'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{getCategoryIcon(word.category)}</div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorite(word.id)}
                    className={`transition-colors ${
                      favorites.has(word.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${favorites.has(word.id) ? 'fill-current' : ''}`} />
                  </button>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(word.difficulty)}`}>
                    {word.difficulty}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{word.word}</h3>
              <p className="text-gray-600 mb-4">{word.translation}</p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => speakWord(word.word)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
                
                <button
                  onClick={() => markAsLearned(word.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg font-medium transition-colors ${
                    word.learned
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>{word.learned ? 'Learned' : 'Mark as Learned'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-20">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No words found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start building your vocabulary by adding some words!'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Add Your First Word
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleVocabulary;
