import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Upload, BookOpen, Edit3, Trash2, Star, Tag, Languages, Zap } from 'lucide-react';
import translationService from '../services/translationService';

const VocabularyManager = ({ words, onWordsUpdate, selectedLanguage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [customLists, setCustomLists] = useState([]);
  const [selectedList, setSelectedList] = useState('all');
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);

  const [newWord, setNewWord] = useState({
    word: '',
    translation: '',
    language: selectedLanguage,
    difficulty: 'easy',
    category: 'general',
    pronunciation: '',
    example: '',
    imageUrl: ''
  });

  const categories = [
    'general', 'greetings', 'home', 'emotions', 'adjectives', 'verbs', 
    'food', 'travel', 'family', 'work', 'nature', 'technology', 'sports'
  ];

  const difficulties = ['easy', 'medium', 'hard'];

  useEffect(() => {
    // Load custom lists from localStorage
    const savedLists = localStorage.getItem('customVocabularyLists');
    if (savedLists) {
      setCustomLists(JSON.parse(savedLists));
    }
  }, []);

  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.translation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || word.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || word.difficulty === filterDifficulty;
    const matchesList = selectedList === 'all' || word.customList === selectedList;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesList;
  });

  const handleWordChange = async (field, value) => {
    setNewWord(prev => ({ ...prev, [field]: value }));

    // Auto-translate if enabled and word field is being changed
    if (autoTranslate && field === 'word' && value.trim().length > 0) {
      setIsTranslating(true);
      try {
        const result = await translationService.translateText(value, 'auto', 'en');
        if (result.success && result.translated_text !== value) {
          setNewWord(prev => ({
            ...prev,
            translation: result.translated_text,
            language: result.source_language || selectedLanguage
          }));
        }
      } catch (error) {
        console.error('Auto-translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleAddWord = () => {
    if (!newWord.word || !newWord.translation) return;

    const wordToAdd = {
      ...newWord,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      customList: selectedList !== 'all' ? selectedList : undefined
    };

    onWordsUpdate([...words, wordToAdd]);
    setNewWord({
      word: '',
      translation: '',
      language: selectedLanguage,
      difficulty: 'easy',
      category: 'general',
      pronunciation: '',
      example: '',
      imageUrl: ''
    });
    setShowAddForm(false);
  };

  const handleEditWord = (word) => {
    setEditingWord(word);
    setNewWord(word);
    setShowAddForm(true);
  };

  const handleUpdateWord = () => {
    if (!newWord.word || !newWord.translation) return;

    const updatedWords = words.map(word => 
      word.id === editingWord.id ? { ...newWord, updatedAt: new Date().toISOString() } : word
    );

    onWordsUpdate(updatedWords);
    setEditingWord(null);
    setNewWord({
      word: '',
      translation: '',
      language: selectedLanguage,
      difficulty: 'easy',
      category: 'general',
      pronunciation: '',
      example: '',
      imageUrl: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteWord = (wordId) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      const updatedWords = words.filter(word => word.id !== wordId);
      onWordsUpdate(updatedWords);
    }
  };

  const exportWords = () => {
    const dataStr = JSON.stringify(filteredWords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vocabulary-${selectedLanguage}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importWords = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedWords = JSON.parse(e.target.result);
        const wordsWithIds = importedWords.map(word => ({
          ...word,
          id: word.id || Date.now().toString() + Math.random(),
          importedAt: new Date().toISOString()
        }));
        onWordsUpdate([...words, ...wordsWithIds]);
        alert(`Successfully imported ${wordsWithIds.length} words!`);
      } catch (error) {
        alert('Error importing file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const createCustomList = () => {
    const listName = prompt('Enter a name for your custom list:');
    if (listName && !customLists.includes(listName)) {
      const updatedLists = [...customLists, listName];
      setCustomLists(updatedLists);
      localStorage.setItem('customVocabularyLists', JSON.stringify(updatedLists));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Vocabulary Manager</h2>
              <p className="text-purple-100">Organize and manage your word collection</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{words.length}</div>
            <div className="text-purple-100">total words</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Difficulties</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>

          {/* Custom Lists */}
          <select
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Lists</option>
            {customLists.map(list => (
              <option key={list} value={list}>{list}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Word</span>
          </button>
          
          <button
            onClick={createCustomList}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Tag className="h-4 w-4" />
            <span>New List</span>
          </button>

          <button
            onClick={exportWords}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>

          <label className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={importWords}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setAutoTranslate(!autoTranslate)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              autoTranslate
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Languages className="h-4 w-4" />
            <span>Auto-Translate</span>
            {autoTranslate && <Zap className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Add/Edit Word Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {editingWord ? 'Edit Word' : 'Add New Word'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word
                {autoTranslate && (
                  <span className="ml-2 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    Auto-translate enabled
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newWord.word}
                  onChange={(e) => handleWordChange('word', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the word"
                />
                {isTranslating && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Translation</label>
              <input
                type="text"
                value={newWord.translation}
                onChange={(e) => handleWordChange('translation', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter the translation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newWord.category}
                onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={newWord.difficulty}
                onChange={(e) => setNewWord({ ...newWord, difficulty: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pronunciation (optional)</label>
              <input
                type="text"
                value={newWord.pronunciation}
                onChange={(e) => setNewWord({ ...newWord, pronunciation: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., OH-lah"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
              <input
                type="url"
                value={newWord.imageUrl}
                onChange={(e) => setNewWord({ ...newWord, imageUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Example (optional)</label>
              <textarea
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Example sentence using this word"
                rows="3"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingWord(null);
                setNewWord({
                  word: '',
                  translation: '',
                  language: selectedLanguage,
                  difficulty: 'easy',
                  category: 'general',
                  pronunciation: '',
                  example: '',
                  imageUrl: ''
                });
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingWord ? handleUpdateWord : handleAddWord}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              {editingWord ? 'Update Word' : 'Add Word'}
            </button>
          </div>
        </div>
      )}

      {/* Words List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Words ({filteredWords.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map(word => (
            <div key={word.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-bold text-lg text-gray-900">{word.word}</div>
                  <div className="text-blue-600 font-medium">{word.translation}</div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditWord(word)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWord(word.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  word.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {word.difficulty}
                </span>
                <span className="text-gray-500">{word.category}</span>
              </div>
              
              {word.example && (
                <div className="mt-2 text-sm text-gray-600 italic">
                  "{word.example}"
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No words found</p>
            <p className="text-gray-400">Try adjusting your filters or add some new words</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyManager;
