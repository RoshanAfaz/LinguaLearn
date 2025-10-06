import React from 'react';
import { languages } from '../data/languages';

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Language</h3>
        <p className="text-gray-600">Select the language you want to learn</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {languages.map(language => (
          <button
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              selectedLanguage === language.code
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300 bg-white'
            }`}
          >
            <div className="text-center">
              <div className={`text-5xl mb-3 transition-transform group-hover:scale-110 ${selectedLanguage === language.code ? 'animate-bounce' : ''}`}>
                {language.flag}
              </div>
              <div className={`font-semibold text-gray-900 mb-1 transition-colors ${
                selectedLanguage === language.code ? 'text-blue-700' : ''
              }`}>
                {language.name}
              </div>
              <div className="text-sm text-gray-500">
                {language.totalWords} words
              </div>
            </div>
            {selectedLanguage === language.code && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;