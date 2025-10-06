import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MessageCircle, Settings, RotateCcw, Volume2, BookOpen, Lightbulb, Globe } from 'lucide-react';
import chatbotService from '../services/chatbotService';
import { languages } from '../data/languages';

const AIChatbot = ({ selectedLanguage: defaultLanguage = 'en' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('casual');
  const [userLevel, setUserLevel] = useState('beginner');
  const [showSettings, setShowSettings] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scenarios = chatbotService.getScenarios();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const botMessage = await chatbotService.startConversation(selectedLanguage, selectedScenario, userLevel);
      setMessages([botMessage]);
      setIsStarted(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponse = await chatbotService.sendMessage(userMessage);
      setMessages(chatbotService.getConversationHistory());
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetConversation = () => {
    chatbotService.clearHistory();
    setMessages([]);
    setIsStarted(false);
  };

  // Reset conversation when language changes
  useEffect(() => {
    if (isStarted) {
      resetConversation();
    }
  }, [selectedLanguage]);

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);

      // Map language codes to speech synthesis language codes
      const langMap = {
        'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT',
        'pt': 'pt-PT', 'ru': 'ru-RU', 'ja': 'ja-JP', 'ko': 'ko-KR', 'zh': 'zh-CN',
        'ar': 'ar-SA', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'mr': 'mr-IN',
        'ta': 'ta-IN', 'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 'pa': 'pa-IN',
        'ur': 'ur-PK', 'ne': 'ne-NP', 'si': 'si-LK'
      };

      utterance.lang = langMap[selectedLanguage] || 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const renderMessage = (message) => {
    const isBot = message.sender === 'bot';
    
    return (
      <div key={message.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className={`flex max-w-xs lg:max-w-md ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 ${isBot ? 'mr-3' : 'ml-3'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isBot ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gradient-to-r from-green-500 to-teal-600'
            }`}>
              {isBot ? <Bot className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-white" />}
            </div>
          </div>
          
          {/* Message Content */}
          <div className={`px-4 py-3 rounded-2xl ${
            isBot 
              ? 'bg-white border border-gray-200 shadow-sm' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
          }`}>
            <p className={`text-sm ${isBot ? 'text-gray-900' : 'text-white'}`}>
              {message.message}
            </p>
            
            {/* Bot message features */}
            {isBot && (
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={() => speakMessage(message.message)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                
                {message.originalMessage && message.originalMessage !== message.message && (
                  <button
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title={`Original: ${message.originalMessage}`}
                  >
                    <BookOpen className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            
            {/* Corrections and suggestions */}
            {message.corrections && message.corrections.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-1 mb-1">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs font-semibold text-yellow-700">Grammar Tips:</span>
                </div>
                {message.corrections.map((correction, index) => (
                  <div key={index} className="text-xs text-yellow-700">
                    <span className="line-through">{correction.error}</span> → 
                    <span className="font-semibold ml-1">{correction.correction}</span>
                    <p className="text-yellow-600 mt-1">{correction.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">AI Conversation Partner</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Practice real conversations with our AI chatbot in your chosen language
          </p>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Choose Practice Language</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {languages.slice(0, 16).map((language) => (
              <button
                key={language.code}
                onClick={() => setSelectedLanguage(language.code)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedLanguage === language.code
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-lg mb-1">{language.flag}</div>
                <div className="text-sm font-medium">{language.name}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Selected:</strong> {languages.find(l => l.code === selectedLanguage)?.name || 'English'}
              <span className="ml-2">{languages.find(l => l.code === selectedLanguage)?.flag || '🇺🇸'}</span>
            </p>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Choose a Conversation Scenario</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <button
                key={key}
                onClick={() => setSelectedScenario(key)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedScenario === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-2">{scenario.name}</h4>
                <p className="text-sm text-gray-600">{scenario.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Level Selection */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Select Your Level</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'beginner', name: 'Beginner', desc: 'Simple words and phrases' },
              { key: 'intermediate', name: 'Intermediate', desc: 'Everyday conversations' },
              { key: 'advanced', name: 'Advanced', desc: 'Complex discussions' }
            ].map((level) => (
              <button
                key={level.key}
                onClick={() => setUserLevel(level.key)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  userLevel === level.key
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-1">{level.name}</h4>
                <p className="text-sm text-gray-600">{level.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={startConversation}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Starting Conversation...' : 'Start Conversation'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[600px] bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Language Partner</h3>
            <p className="text-sm text-gray-500">{scenarios[selectedScenario].name} • {userLevel}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={resetConversation}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-sm text-gray-500">AI is typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type your message in ${selectedLanguage === 'en' ? 'English' : 'your target language'}...`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
