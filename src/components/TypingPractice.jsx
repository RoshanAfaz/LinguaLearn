import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Clock, Target, CheckCircle, XCircle, RotateCcw, Volume2 } from 'lucide-react';

const TypingPractice = ({ words, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [completedWords, setCompletedWords] = useState([]);
  const [showTranslation, setShowTranslation] = useState(true);
  const [mistakes, setMistakes] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef(null);

  const currentWord = words[currentWordIndex];
  const totalWords = words.length;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex]);

  useEffect(() => {
    if (startTime && userInput.length > 0) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
      const wordsTyped = userInput.length / 5; // average word length
      setWpm(Math.round(wordsTyped / timeElapsed));
    }
  }, [userInput, startTime]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!startTime) {
      setStartTime(Date.now());
    }

    setUserInput(value);

    // Check if the input matches the current word
    if (value === currentWord.word) {
      setIsCorrect(true);
      setTimeout(() => {
        handleNextWord(true);
      }, 500);
    } else if (currentWord.word.startsWith(value)) {
      setIsCorrect(null); // Still typing
    } else {
      setIsCorrect(false);
      if (value.length > userInput.length) {
        setMistakes(prev => prev + 1);
      }
    }

    // Update accuracy
    const totalCharacters = completedWords.reduce((sum, word) => sum + word.word.length, 0) + value.length;
    const correctCharacters = totalCharacters - mistakes;
    setAccuracy(Math.round((correctCharacters / Math.max(totalCharacters, 1)) * 100));
  };

  const handleNextWord = (correct) => {
    const wordResult = {
      ...currentWord,
      userInput,
      correct,
      timeSpent: startTime ? Date.now() - startTime : 0
    };

    setCompletedWords(prev => [...prev, wordResult]);

    if (currentWordIndex + 1 < totalWords) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserInput('');
      setIsCorrect(null);
      setStartTime(Date.now());
    } else {
      // Practice completed
      const results = {
        completedWords: [...completedWords, wordResult],
        totalWords,
        correctWords: [...completedWords, wordResult].filter(w => w.correct).length,
        mistakes,
        wpm,
        accuracy,
        totalTime: Date.now() - (startTime || Date.now())
      };
      onComplete(results);
    }
  };

  const handleSkip = () => {
    handleNextWord(false);
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setUserInput('');
    setIsCorrect(null);
    setStartTime(null);
    setCompletedWords([]);
    setMistakes(0);
    setWpm(0);
    setAccuracy(100);
  };

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = currentWord.language === 'es' ? 'es-ES' : 
                      currentWord.language === 'fr' ? 'fr-FR' : 
                      currentWord.language === 'de' ? 'de-DE' : 
                      currentWord.language === 'it' ? 'it-IT' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const getInputClassName = () => {
    if (isCorrect === true) return 'border-green-500 bg-green-50 text-green-700';
    if (isCorrect === false) return 'border-red-500 bg-red-50 text-red-700';
    return 'border-blue-500 bg-blue-50';
  };

  const renderCharacters = () => {
    const word = currentWord.word;
    const input = userInput;
    
    return word.split('').map((char, index) => {
      let className = 'text-2xl font-mono ';
      
      if (index < input.length) {
        if (input[index] === char) {
          className += 'text-green-600 bg-green-100';
        } else {
          className += 'text-red-600 bg-red-100';
        }
      } else if (index === input.length) {
        className += 'text-gray-900 bg-blue-200 animate-pulse';
      } else {
        className += 'text-gray-400';
      }
      
      return (
        <span key={index} className={`${className} px-1 py-1 rounded`}>
          {char}
        </span>
      );
    });
  };

  if (!currentWord) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No words available for typing practice.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Keyboard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Typing Practice</h2>
              <p className="text-indigo-100">Improve your typing speed and accuracy</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{currentWordIndex + 1}/{totalWords}</div>
            <div className="text-indigo-100">words</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{wpm}</div>
            <div className="text-indigo-100 text-sm">WPM</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-indigo-100 text-sm">Accuracy</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{mistakes}</div>
            <div className="text-indigo-100 text-sm">Mistakes</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{completedWords.filter(w => w.correct).length}</div>
            <div className="text-indigo-100 text-sm">Correct</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{currentWordIndex + 1} of {totalWords}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentWordIndex + 1) / totalWords) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Typing Area */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
        <div className="text-center space-y-8">
          {/* Word Display */}
          <div className="space-y-4">
            {showTranslation && (
              <div className="text-xl text-gray-600 mb-4">
                Type: <span className="font-semibold text-blue-600">{currentWord.translation}</span>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-2xl p-8 min-h-[120px] flex items-center justify-center">
              <div className="space-x-1">
                {renderCharacters()}
              </div>
            </div>

            {currentWord.pronunciation && (
              <div className="text-gray-500 italic">
                /{currentWord.pronunciation}/
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className={`w-full text-2xl text-center py-4 px-6 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 ${getInputClassName()}`}
              placeholder="Start typing..."
              autoComplete="off"
              spellCheck="false"
            />
            
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={speakWord}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Volume2 className="h-4 w-4" />
                <span>Listen</span>
              </button>
              
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Target className="h-4 w-4" />
                <span>{showTranslation ? 'Hide' : 'Show'} Translation</span>
              </button>
              
              <button
                onClick={handleSkip}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Skip</span>
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          {isCorrect !== null && (
            <div className={`flex items-center justify-center space-x-2 text-lg font-semibold ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-6 w-6" />
                  <span>Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6" />
                  <span>Try again</span>
                </>
              )}
            </div>
          )}

          {/* Word Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2 font-medium">{currentWord.category}</span>
              </div>
              <div>
                <span className="text-gray-600">Difficulty:</span>
                <span className={`ml-2 font-medium ${
                  currentWord.difficulty === 'easy' ? 'text-green-600' :
                  currentWord.difficulty === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {currentWord.difficulty}
                </span>
              </div>
            </div>
            {currentWord.example && (
              <div className="mt-3 text-gray-700 italic">
                Example: "{currentWord.example}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restart Button */}
      <div className="text-center">
        <button
          onClick={handleRestart}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors mx-auto"
        >
          <RotateCcw className="h-5 w-5" />
          <span>Restart Practice</span>
        </button>
      </div>
    </div>
  );
};

export default TypingPractice;
