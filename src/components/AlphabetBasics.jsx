import React from 'react';
import { Volume2, ArrowLeft, BookOpen } from 'lucide-react';
import { alphabets } from '../data/alphabets';

// Simple TTS helper that maps language code to a locale
const getLocale = (lang) => (lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : `${lang}-${lang.toUpperCase()}`);

const speak = (text, lang, rate = 0.9) => {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = getLocale(lang);
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

const Pill = ({ children }) => (
  <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-800 text-sm font-medium">
    {children}
  </span>
);

const AlphabetBasics = ({ targetLanguage, referenceLanguage, onBack, onComplete }) => {
  const data = alphabets[targetLanguage];

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
        <p className="text-gray-700">Alphabet content is not yet available for this language.</p>
      </div>
    );
  }

  const { scriptName, direction, vowels, consonants, notes } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span>Letters & Sounds</span>
          </h2>
          <p className="text-gray-600 text-sm">Learning in {targetLanguage.toUpperCase()} • Reference: {referenceLanguage?.toUpperCase() || '—'}</p>
        </div>
        <div />
      </div>

      {/* Script Info */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <Pill>Script: {scriptName}</Pill>
          <Pill>Direction: {direction.toUpperCase()}</Pill>
        </div>
        {notes && <p className="mt-3 text-sm text-gray-700">{notes}</p>}
      </div>

      {/* Vowels */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Vowels</h3>
        <div className="flex flex-wrap gap-2">
          {vowels.map((v, i) => (
            <button
              key={`v-${i}`}
              onClick={() => speak(v, targetLanguage, 0.8)}
              className="px-3 py-2 rounded-lg border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-300 text-emerald-900 flex items-center space-x-2"
              dir={direction === 'rtl' ? 'rtl' : 'ltr'}
            >
              <span className="font-bold text-lg">{v}</span>
              <Volume2 className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Consonants */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Consonants</h3>
        <div className="flex flex-wrap gap-2">
          {consonants.map((c, i) => (
            <button
              key={`c-${i}`}
              onClick={() => speak(c, targetLanguage, 0.95)}
              className="px-3 py-2 rounded-lg border-2 border-blue-200 bg-blue-50 hover:border-blue-300 text-blue-900 flex items-center space-x-2"
              dir={direction === 'rtl' ? 'rtl' : 'ltr'}
            >
              <span className="font-bold text-lg">{c}</span>
              <Volume2 className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={onComplete}
          className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default AlphabetBasics;