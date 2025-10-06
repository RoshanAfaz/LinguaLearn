import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Play, Pause, Volume2, ArrowLeft, ArrowRight, 
  Star, CheckCircle, Eye, EyeOff, Lightbulb 
} from 'lucide-react';

const InteractiveStories = ({ language, onBack, onXPGain }) => {
  const [currentStory, setCurrentStory] = useState(0);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSentences, setCompletedSentences] = useState(new Set());

  const stories = [
    {
      id: 1,
      title: "A Day at the Café",
      level: "Beginner",
      description: "Learn basic conversation at a café",
      image: "☕",
      sentences: [
        {
          text: "María entra en el café.",
          translation: "María enters the café.",
          audio: "maria-enters-cafe"
        },
        {
          text: "El camarero sonríe y dice 'Buenos días'.",
          translation: "The waiter smiles and says 'Good morning'.",
          audio: "waiter-good-morning"
        },
        {
          text: "María pide un café con leche.",
          translation: "María orders a coffee with milk.",
          audio: "maria-orders-coffee"
        },
        {
          text: "El café está muy caliente y delicioso.",
          translation: "The coffee is very hot and delicious.",
          audio: "coffee-hot-delicious"
        },
        {
          text: "María paga y dice 'Gracias'.",
          translation: "María pays and says 'Thank you'.",
          audio: "maria-pays-thanks"
        }
      ]
    },
    {
      id: 2,
      title: "Shopping Adventure",
      level: "Intermediate",
      description: "Navigate a shopping trip in Spanish",
      image: "🛍️",
      sentences: [
        {
          text: "Ana va al mercado para comprar frutas.",
          translation: "Ana goes to the market to buy fruits.",
          audio: "ana-market-fruits"
        },
        {
          text: "Ve manzanas rojas muy frescas.",
          translation: "She sees very fresh red apples.",
          audio: "red-fresh-apples"
        },
        {
          text: "El vendedor pregunta: '¿Cuántas quiere?'",
          translation: "The seller asks: 'How many do you want?'",
          audio: "seller-how-many"
        },
        {
          text: "Ana responde: 'Cinco manzanas, por favor'.",
          translation: "Ana responds: 'Five apples, please'.",
          audio: "ana-five-apples"
        },
        {
          text: "Paga diez euros y se va contenta.",
          translation: "She pays ten euros and leaves happy.",
          audio: "pays-ten-euros"
        }
      ]
    }
  ];

  const currentStoryData = stories[currentStory];
  const currentSentenceData = currentStoryData.sentences[currentSentence];

  const speakSentence = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleNextSentence = () => {
    // Mark current sentence as completed
    setCompletedSentences(prev => new Set([...prev, currentSentence]));
    
    if (onXPGain) {
      onXPGain(5);
    }

    if (currentSentence < currentStoryData.sentences.length - 1) {
      setCurrentSentence(prev => prev + 1);
      setShowTranslation(false);
    } else {
      // Story completed
      if (onXPGain) {
        onXPGain(20); // Bonus for completing story
      }
      alert('¡Felicidades! Story completed! 🎉');
    }
  };

  const handlePrevSentence = () => {
    if (currentSentence > 0) {
      setCurrentSentence(prev => prev - 1);
      setShowTranslation(false);
    }
  };

  const progressPercentage = ((currentSentence + 1) / currentStoryData.sentences.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{currentStoryData.title}</h2>
          <p className="text-gray-600">{currentStoryData.description}</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-6xl">{currentStoryData.image}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Story Progress</span>
          <span>{currentSentence + 1} of {currentStoryData.sentences.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Story Panel */}
        <div className="p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {currentStoryData.level}
            </span>
          </div>

          {/* Main Sentence */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-relaxed">
              {currentSentenceData.text}
            </h3>
            
            <button
              onClick={() => speakSentence(currentSentenceData.text)}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Volume2 className="h-6 w-6" />
              <span className="font-medium">Listen</span>
            </button>
          </div>

          {/* Translation Toggle */}
          <div className="mb-8">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                showTranslation 
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {showTranslation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              <span>{showTranslation ? 'Hide Translation' : 'Show Translation'}</span>
            </button>
          </div>

          {/* Translation */}
          {showTranslation && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
              <p className="text-xl text-gray-700 italic">
                "{currentSentenceData.translation}"
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handlePrevSentence}
              disabled={currentSentence === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNextSentence}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold transition-all hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
            >
              <span>
                {currentSentence === currentStoryData.sentences.length - 1 ? 'Complete Story' : 'Next'}
              </span>
              {currentSentence === currentStoryData.sentences.length - 1 ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Story Selection */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose a Story</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map((story, index) => (
              <button
                key={story.id}
                onClick={() => {
                  setCurrentStory(index);
                  setCurrentSentence(0);
                  setShowTranslation(false);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  currentStory === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{story.image}</span>
                  <div>
                    <h5 className="font-semibold text-gray-900">{story.title}</h5>
                    <p className="text-sm text-gray-600">{story.description}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {story.level}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900">Learning Tips</h4>
            <ul className="text-sm text-yellow-800 mt-1 space-y-1">
              <li>• Listen to each sentence before reading the translation</li>
              <li>• Try to understand the context from the story flow</li>
              <li>• Repeat the sentences out loud to practice pronunciation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveStories;
