import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, BookOpen, Target, Zap, Globe, ArrowRight, Play, Shuffle } from 'lucide-react';
import DynamicLanguageInput from './DynamicLanguageInput';
import FlashCard from './FlashCard';
import Quiz from './Quiz';
import SpacedRepetition from './SpacedRepetition';
import TypingPractice from './TypingPractice';
import languageService from '../services/languageService';

const EnhancedLearnPage = ({ 
  selectedLanguage, 
  onLanguageChange, 
  allWords, 
  onWordsUpdate,
  learningMode,
  setLearningMode 
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [isContentReady, setIsContentReady] = useState(false);
  const [showLanguageInput, setShowLanguageInput] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    if (selectedLanguage) {
      loadLanguageData(selectedLanguage);
    }
  }, [selectedLanguage]);

  const loadLanguageData = async (langCode) => {
    try {
      const language = await languageService.getLanguageByCode(langCode);
      if (language) {
        setCurrentLanguage(language);
        setShowLanguageInput(false);
        setIsContentReady(true);
      }
    } catch (error) {
      console.error('Error loading language data:', error);
    }
  };

  const handleLanguageSelect = async (language) => {
    setCurrentLanguage(language);
    setShowLanguageInput(false);
    
    if (onLanguageChange) {
      onLanguageChange(language.code);
    }
  };

  const handleGenerateContent = async (language, vocabulary) => {
    setGeneratedContent(vocabulary);

    // Add to allWords if onWordsUpdate is provided
    if (onWordsUpdate && vocabulary.length > 0) {
      const currentWords = allWords[language.code] || [];
      const updatedWords = [...currentWords, ...vocabulary];
      onWordsUpdate(language.code, updatedWords);
    }

    setIsContentReady(true);
    setCurrentWordIndex(0); // Reset to first word
  };

  const getCurrentWords = () => {
    if (!currentLanguage) return [];

    const existingWords = allWords[currentLanguage.code] || [];
    const combined = [...existingWords, ...generatedContent];

    // Remove duplicates based on word text and ensure proper structure
    const unique = combined.filter((word, index, self) =>
      word && word.word && index === self.findIndex(w => w && w.word === word.word)
    );

    // Ensure all words have required properties
    return unique.map(word => ({
      id: word.id || `word_${Date.now()}_${Math.random()}`,
      word: word.word || '',
      translation: word.translation || '',
      language: word.language || currentLanguage.code,
      difficulty: word.difficulty || 'medium',
      category: word.category || 'general',
      pronunciation: word.pronunciation || '',
      example: word.example || '',
      imageUrl: word.imageUrl || '',
      ...word
    }));
  };

  const handleStartLearning = () => {
    setSessionActive(true);
    setCurrentWordIndex(0);
  };

  const handleFlashcardAnswer = (confidence) => {
    const words = getCurrentWords();

    // Update word statistics based on confidence
    const currentWord = words[currentWordIndex];
    if (currentWord && onWordsUpdate) {
      const updatedWord = {
        ...currentWord,
        lastReviewed: new Date().toISOString(),
        reviewCount: (currentWord.reviewCount || 0) + 1,
        confidence: confidence,
        correctAnswers: (currentWord.correctAnswers || 0) + (confidence === 'easy' || confidence === 'good' ? 1 : 0)
      };

      // Update the word in the collection
      const updatedWords = words.map(w => w.id === currentWord.id ? updatedWord : w);
      onWordsUpdate(currentLanguage.code, updatedWords);
    }

    // Move to next word
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setSessionActive(false);
      setCurrentWordIndex(0);
      alert(`Great job! You've completed all ${words.length} words. Starting over...`);
    }
  };

  const shuffleWords = () => {
    const words = getCurrentWords();
    const shuffled = [...words].sort(() => 0.5 - Math.random());

    // Update the words in the main collection
    if (onWordsUpdate && currentLanguage) {
      onWordsUpdate(currentLanguage.code, shuffled);
    }

    setCurrentWordIndex(0);
  };

  const renderLanguageInput = () => (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
          <Globe className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Learn Any Language</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Type any language name, code, or sample text. Our AI will detect it and generate learning materials.
        </p>
      </div>

      <DynamicLanguageInput
        onLanguageSelect={handleLanguageSelect}
        onGenerateContent={handleGenerateContent}
      />
    </div>
  );

  const renderLanguageHeader = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">{currentLanguage.flag}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentLanguage.name}</h2>
            <p className="text-gray-600">{currentLanguage.nativeName}</p>
            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
              <span>{currentLanguage.family} Family</span>
              <span>•</span>
              <span>{currentLanguage.script} Script</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{getCurrentWords().length}</div>
          <div className="text-sm text-gray-500">words available</div>
          <button
            onClick={() => setShowLanguageInput(true)}
            className="mt-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
          >
            Change Language
          </button>
        </div>
      </div>
    </div>
  );

  const renderLearningModes = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Learning Mode</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setLearningMode('flashcards')}
          className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
            learningMode === 'flashcards'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Brain className="h-6 w-6" />
          <span className="font-medium text-sm">Flashcards</span>
        </button>

        <button
          onClick={() => setLearningMode('quiz')}
          className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
            learningMode === 'quiz'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Target className="h-6 w-6" />
          <span className="font-medium text-sm">Quiz</span>
        </button>

        <button
          onClick={() => setLearningMode('spaced-repetition')}
          className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
            learningMode === 'spaced-repetition'
              ? 'bg-purple-500 text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sparkles className="h-6 w-6" />
          <span className="font-medium text-sm">Smart Review</span>
        </button>

        <button
          onClick={() => setLearningMode('typing')}
          className={`flex flex-col items-center space-y-2 p-4 rounded-lg transition-all ${
            learningMode === 'typing'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Zap className="h-6 w-6" />
          <span className="font-medium text-sm">Typing</span>
        </button>
      </div>
    </div>
  );

  const renderLearningContent = () => {
    const words = getCurrentWords();
    
    if (words.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No vocabulary available</h3>
          <p className="text-gray-600 mb-6">Generate some vocabulary to start learning!</p>
          <button
            onClick={() => setShowLanguageInput(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Add Vocabulary
          </button>
        </div>
      );
    }

    if (learningMode === 'flashcards') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Flashcard {currentWordIndex + 1} of {words.length}
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={shuffleWords}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Shuffle className="h-4 w-4" />
                <span>Shuffle</span>
              </button>
              <button
                onClick={handleStartLearning}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Start Session</span>
              </button>
            </div>
          </div>
          
          {words[currentWordIndex] && (
            <FlashCard 
              word={words[currentWordIndex]}
              onAnswer={handleFlashcardAnswer}
            />
          )}
        </div>
      );
    }

    if (learningMode === 'quiz') {
      const quizWords = words.slice(0, Math.min(5, words.length));
      if (quizWords.length < 4) {
        return (
          <div className="text-center py-12 bg-yellow-50 rounded-2xl border border-yellow-200">
            <Target className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Need More Words for Quiz</h3>
            <p className="text-gray-600 mb-6">Quiz mode requires at least 4 words. You have {words.length} words.</p>
            <button
              onClick={() => setShowLanguageInput(true)}
              className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
            >
              Add More Words
            </button>
          </div>
        );
      }

      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Mode</h3>
            <p className="text-gray-600">Test your knowledge with {quizWords.length} questions</p>
          </div>
          <Quiz
            words={quizWords}
            onQuizComplete={(results) => {
              console.log('Quiz completed:', results);
              alert(`Quiz completed! Score: ${results.score}/${results.total} (${Math.round((results.score/results.total)*100)}%)`);
              setCurrentWordIndex(0);
            }}
          />
        </div>
      );
    }

    if (learningMode === 'spaced-repetition') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Review</h3>
            <p className="text-gray-600">AI-powered spaced repetition for optimal learning</p>
          </div>
          <SpacedRepetition
            words={words}
            onWordUpdate={(updatedWord) => {
              // Update the word in the collection
              const updatedWords = words.map(w => w.id === updatedWord.id ? updatedWord : w);
              if (onWordsUpdate && currentLanguage) {
                onWordsUpdate(currentLanguage.code, updatedWords);
              }
              console.log('Word updated:', updatedWord);
            }}
          />
        </div>
      );
    }

    if (learningMode === 'typing') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Typing Practice</h3>
            <p className="text-gray-600">Improve your typing speed and accuracy</p>
          </div>
          <TypingPractice
            words={words}
            onComplete={(results) => {
              console.log('Typing practice completed:', results);

              // Update word statistics
              if (results.completedWords && onWordsUpdate && currentLanguage) {
                const updatedWords = words.map(word => {
                  const completedWord = results.completedWords.find(cw => cw.word === word.word);
                  if (completedWord) {
                    return {
                      ...word,
                      typingAccuracy: completedWord.correct ? 100 : 0,
                      lastTyped: new Date().toISOString(),
                      typingCount: (word.typingCount || 0) + 1
                    };
                  }
                  return word;
                });
                onWordsUpdate(currentLanguage.code, updatedWords);
              }

              alert(`Great job! Accuracy: ${results.accuracy}%, WPM: ${results.wpm}, Words: ${results.correctWords}/${results.totalWords}`);
            }}
          />
        </div>
      );
    }

    return null;
  };

  if (showLanguageInput || !currentLanguage) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {renderLanguageInput()}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeInUp">
      {renderLanguageHeader()}
      {renderLearningModes()}
      {renderLearningContent()}
    </div>
  );
};

export default EnhancedLearnPage;
