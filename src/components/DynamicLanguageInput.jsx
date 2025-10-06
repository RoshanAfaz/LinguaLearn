import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Sparkles, Plus, Loader, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import languageService from '../services/languageService';

const DynamicLanguageInput = ({ onLanguageSelect, onGenerateContent }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (input.trim().length > 0) {
      handleLanguageSearch();
    } else {
      setSuggestions([]);
      setDetectedLanguage(null);
      setShowSuggestions(false);
    }
  }, [input]);

  const handleLanguageSearch = async () => {
    setIsLoading(true);
    try {
      // Search existing languages
      const searchResults = await languageService.searchLanguages(input);
      
      // Try to detect/add new language
      const detected = await languageService.detectAndAddLanguage(input);
      
      let allSuggestions = [...searchResults];
      
      // Add detected language if it's not already in results
      if (detected && !searchResults.find(lang => lang.code === detected.code)) {
        allSuggestions.unshift(detected);
      }
      
      setSuggestions(allSuggestions.slice(0, 8)); // Limit to 8 suggestions
      setDetectedLanguage(detected);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching languages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelect = async (language) => {
    setInput('');
    setShowSuggestions(false);
    setDetectedLanguage(language);
    
    if (onLanguageSelect) {
      onLanguageSelect(language);
    }
    
    // Ask if user wants to generate content
    if (language && !language.hasContent) {
      setIsGenerating(true);
      try {
        const vocabulary = await languageService.generateBasicVocabulary(language.code, 20);
        if (onGenerateContent) {
          onGenerateContent(language, vocabulary);
        }
      } catch (error) {
        console.error('Error generating content:', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleLanguageSelect(suggestions[0]);
    }
  };

  const getLanguageDisplay = (lang) => {
    if (lang.isCustom) {
      return (
        <div className="flex items-center space-x-3">
          <span className="text-xl">{lang.flag}</span>
          <div>
            <div className="font-medium">{lang.name}</div>
            <div className="text-xs text-gray-500">Custom Language</div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        <span className="text-xl">{lang.flag}</span>
        <div>
          <div className="font-medium">{lang.name}</div>
          <div className="text-xs text-gray-500">{lang.nativeName}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative max-w-xl mx-auto">
      {/* Main Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <Globe className="h-5 w-5 text-blue-500" />
          {isLoading && <Loader className="h-4 w-4 text-blue-500 animate-spin" />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type language name, code, or sample text..."
          className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
        />

        {input && (
          <button
            onClick={() => {
              setInput('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.map((lang, index) => (
            <button
              key={`${lang.code}-${index}`}
              onClick={() => handleLanguageSelect(lang)}
              className="w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center justify-between">
                {getLanguageDisplay(lang)}
                <div className="flex items-center space-x-2">
                  {lang.isCustom && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      New
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {lang.family && (
                <div className="text-xs text-gray-500 mt-1">
                  {lang.family} Family • {lang.script} Script
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected Language Display */}
      {detectedLanguage && !showSuggestions && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">{detectedLanguage.flag}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{detectedLanguage.name}</h3>
                <p className="text-sm text-gray-600">{detectedLanguage.nativeName}</p>
                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                  <span>{detectedLanguage.family} Family</span>
                  <span>•</span>
                  <span>{detectedLanguage.script} Script</span>
                </div>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating...</span>
              </div>
            ) : (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
          </div>

          {detectedLanguage.isCustom && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-700">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium text-sm">New Language Detected!</span>
              </div>
              <p className="text-blue-600 text-xs mt-1">
                This language has been added to your collection.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Language Suggestions */}
      {!input && !detectedLanguage && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Popular Languages</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { code: 'es', name: 'Spanish', flag: '🇪🇸' },
              { code: 'fr', name: 'French', flag: '🇫🇷' },
              { code: 'de', name: 'German', flag: '🇩🇪' },
              { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
              { code: 'ko', name: 'Korean', flag: '🇰🇷' },
              { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
              { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
              { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setInput(lang.name)}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium text-gray-900">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};

export default DynamicLanguageInput;
