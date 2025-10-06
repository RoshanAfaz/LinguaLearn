import React, { useState, useEffect, useRef } from 'react';
import { Search, Languages, ArrowRight, Volume2, Copy, Plus, Loader, Globe, Zap } from 'lucide-react';
import translationService from '../services/translationService';
import { fetchLanguages } from '../data/languages';

const SmartTranslator = ({ onAddWord, selectedLanguage, onLanguageChange }) => {
  const [inputText, setInputText] = useState('');
  const [translations, setTranslations] = useState({});
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [targetLanguages, setTargetLanguages] = useState(['en', 'hi', 'ta', 'te', 'bn', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar']);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    loadSupportedLanguages();
    checkBackendStatus();
  }, []);

  // Remove automatic translation on input change to prevent rate limiting
  // useEffect(() => {
  //   if (inputText.trim().length > 0) {
  //     // Debounce the translation request
  //     if (debounceRef.current) {
  //       clearTimeout(debounceRef.current);
  //     }
  //
  //     debounceRef.current = setTimeout(() => {
  //       handleTranslation();
  //     }, 2000); // Increased debounce time
  //   } else {
  //     setTranslations({});
  //     setDetectedLanguage(null);
  //   }

  //   return () => {
  //     if (debounceRef.current) {
  //       clearTimeout(debounceRef.current);
  //     }
  //   };
  // }, [inputText, targetLanguages]);

  const checkBackendStatus = async () => {
    const available = await translationService.checkBackendHealth();
    setIsBackendAvailable(available);
  };

  const loadSupportedLanguages = async () => {
    try {
      // Try to fetch from backend first
      const languages = await fetchLanguages();
      setSupportedLanguages(languages);

      // Also try translation service
      const translationLanguages = await translationService.getSupportedLanguages();
      if (translationLanguages && Object.keys(translationLanguages).length > 0) {
        // Merge with backend languages if available
        setSupportedLanguages(prev => prev.length > 0 ? prev : Object.entries(translationLanguages).map(([code, name]) => ({ code, name })));
      }
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const handleTranslation = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      console.log('🔄 Starting translation for:', inputText);

      // First detect the language
      const detection = await translationService.detectLanguage(inputText);
      setDetectedLanguage(detection);
      console.log('🔍 Detected language:', detection);

      // Get translations to all target languages in one batch request
      console.log('🌐 Getting batch translations for all languages...');

      try {
        const response = await fetch('/api/translation/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: inputText.trim(),
            from: detection.detected_language || 'en',
            targetLanguages: targetLanguages
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📡 Batch API response:', result);

          if (result.success) {
            const translationResults = result.data.translations;
            console.log('✅ All translations received:', translationResults);
            setTranslations(translationResults);
          } else {
            console.error('❌ Batch API error:', result.message);
            throw new Error(result.message || 'Batch translation failed');
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Batch HTTP error:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.error('❌ Batch translation error:', error.message);
        console.error('❌ Full error details:', error);

        // Fallback: show error for all languages
        const errorResults = {};
        targetLanguages.forEach(lang => {
          errorResults[lang] = {
            text: `[Error: ${error.message}]`,
            confidence: 0,
            language: lang
          };
        });
        setTranslations(errorResults);
      }



      // Auto-change the selected language if different
      if (detection.detected_language !== selectedLanguage && onLanguageChange) {
        onLanguageChange(detection.detected_language);
      }
    } catch (error) {
      console.error('❌ Translation process error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text, language) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard:', text);
    });
  };

  const addWordToVocabulary = (originalWord, translatedWord, targetLang) => {
    if (onAddWord) {
      const wordData = {
        word: originalWord,
        translation: translatedWord,
        language: detectedLanguage?.detected_language || 'en',
        targetLanguage: targetLang,
        difficulty: 'medium',
        category: 'general',
        pronunciation: '',
        example: '',
        imageUrl: ''
      };
      onAddWord(wordData);
    }
  };

  const toggleTargetLanguage = (langCode) => {
    setTargetLanguages(prev => {
      if (prev.includes(langCode)) {
        return prev.filter(code => code !== langCode);
      } else {
        return [...prev, langCode];
      }
    });
  };

  const getLanguageFlag = (langCode) => {
    const flags = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
      'pt': '🇵🇹', 'ru': '🇷🇺', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳',
      'ar': '🇸🇦', 'tr': '🇹🇷', 'pl': '🇵🇱', 'nl': '🇳🇱',
      'sv': '🇸🇪', 'da': '🇩🇰', 'no': '🇳🇴', 'fi': '🇫🇮', 'cs': '🇨🇿',
      'hu': '🇭🇺', 'ro': '🇷🇴', 'bg': '🇧🇬', 'hr': '🇭🇷', 'sk': '🇸🇰',
      'uk': '🇺🇦', 'th': '🇹🇭', 'vi': '🇻🇳', 'id': '🇮🇩', 'ms': '🇲🇾',
      'he': '🇮🇱', 'fa': '🇮🇷',
      // Indian Regional Languages with proper language codes
      'hi': 'हि', 'bn': 'বা', 'te': 'తె', 'mr': 'म', 'ta': 'த',
      'gu': 'ગુ', 'kn': 'ಕ', 'ml': 'മ', 'pa': 'ਪ', 'or': 'ଓ',
      'as': 'অ', 'ur': 'اُ', 'sa': 'स', 'ne': '🇳🇵', 'si': '🇱🇰'
    };
    return flags[langCode] || '🌐';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Languages className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Smart Translator</h2>
              <p className="text-green-100">Type any word and see translations in multiple languages</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm px-3 py-1 rounded-full ${
              isBackendAvailable ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
              {isBackendAvailable ? '🟢 AI Powered' : '⚡ Basic Mode'}
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type any word in any language..."
              className="w-full pl-12 pr-12 py-4 text-xl border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {isLoading && (
              <Loader className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-500 animate-spin" />
            )}
          </div>

          {/* Translate Button */}
          <div className="flex justify-center">
            <button
              onClick={handleTranslation}
              disabled={!inputText.trim() || isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              <Languages className="h-5 w-5" />
              <span>{isLoading ? 'Translating...' : 'Translate'}</span>
            </button>
          </div>

          {/* Detected Language */}
          {detectedLanguage && (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
              <Globe className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800">
                Detected: <strong>{detectedLanguage.language_name}</strong>
                {detectedLanguage.fallback && (
                  <span className="text-sm text-blue-600 ml-2">(Basic Detection)</span>
                )}
              </span>
              {detectedLanguage.confidence && (
                <span className="text-sm text-blue-600">
                  ({Math.round(detectedLanguage.confidence * 100)}% confidence)
                </span>
              )}
            </div>
          )}

          {/* Target Language Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Translate to:</h3>

            {/* Indian Languages Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <span className="text-lg mr-2">🇮🇳</span>
                Indian Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {supportedLanguages
                  .filter(lang => ['hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'sa', 'ne', 'si'].includes(lang.code))
                  .map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => toggleTargetLanguage(lang.code)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        targetLanguages.includes(lang.code)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span className="text-lg">{getLanguageFlag(lang.code)}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Other Languages Section */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <span className="text-lg mr-2">🌍</span>
                Other Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {supportedLanguages
                  .filter(lang => !['hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as', 'ur', 'sa', 'ne', 'si'].includes(lang.code))
                  .map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => toggleTargetLanguage(lang.code)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        targetLanguages.includes(lang.code)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span className="text-lg">{getLanguageFlag(lang.code)}</span>
                      <span className="text-sm font-medium">{lang.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Translations */}
      {Object.keys(translations).length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Translations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(translations).map(([langCode, translation]) => (
              <div
                key={langCode}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getLanguageFlag(langCode)}</span>
                    <span className="font-semibold text-gray-900">
                      {translation.language_name}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => speakText(translation.text, langCode)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-white"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(translation.text)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-white"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => addWordToVocabulary(inputText, translation.text, langCode)}
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors rounded-lg hover:bg-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {translation.text}
                  </div>
                  
                  {translation.error && (
                    <div className="text-sm text-red-600">
                      Error: {translation.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!inputText && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">How to Use Smart Translator</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <h4 className="font-semibold text-gray-900">Type Any Word</h4>
              <p className="text-gray-600">Enter a word in any language. The system will automatically detect the language.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <h4 className="font-semibold text-gray-900">Select Languages</h4>
              <p className="text-gray-600">Choose which languages you want to see translations in. You can select multiple languages.</p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <h4 className="font-semibold text-gray-900">Add to Vocabulary</h4>
              <p className="text-gray-600">Click the + button to add any translation to your personal vocabulary for learning.</p>
            </div>
          </div>
        </div>
      )}

      {/* Backend Status */}
      {!isBackendAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800">Running in Basic Mode</h4>
              <p className="text-yellow-700 text-sm">
                For full AI-powered translation with 70+ languages, start the Python backend server.
                <br />
                Run: <code className="bg-yellow-200 px-2 py-1 rounded">cd backend && python app.py</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTranslator;
