import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, ArrowLeft, Bot, User, Volume2, 
  Lightbulb, Star, Zap, RefreshCw 
} from 'lucide-react';

const AIConversation = ({ language, onBack, onXPGain }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationTopic, setConversationTopic] = useState('greeting');
  const [score, setScore] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const messagesEndRef = useRef(null);

  const conversationTopics = [
    {
      id: 'greeting',
      title: 'Greetings & Introductions',
      icon: '👋',
      description: 'Learn how to greet people and introduce yourself',
      difficulty: 'Beginner'
    },
    {
      id: 'restaurant',
      title: 'At the Restaurant',
      icon: '🍽️',
      description: 'Order food and drinks in Spanish',
      difficulty: 'Intermediate'
    },
    {
      id: 'shopping',
      title: 'Shopping',
      icon: '🛍️',
      description: 'Buy things and ask for prices',
      difficulty: 'Intermediate'
    },
    {
      id: 'travel',
      title: 'Travel & Directions',
      icon: '✈️',
      description: 'Ask for directions and travel information',
      difficulty: 'Advanced'
    }
  ];

  const getSmartAIResponse = (userMessage, topic, messageCount) => {
    const responses = {
      greeting: [
        "¡Hola! ¿Cómo te llamas?",
        "¡Muy bien! ¿De dónde eres?",
        "¡Qué interesante! ¿Cuántos años tienes?",
        "¡Perfecto! ¿Qué te gusta hacer en tu tiempo libre?",
        "¡Excelente! ¿Estudias o trabajas?",
        "¡Qué bueno! ¿Te gusta aprender español?"
      ],
      restaurant: [
        "¡Bienvenido! ¿Qué le gustaría beber?",
        "Excelente elección. ¿Y para comer?",
        "¿Le gusta la comida picante?",
        "¿Necesita algo más? ¿La cuenta tal vez?",
        "¿Cómo está todo? ¿Le gusta la comida?",
        "¡Perfecto! ¿Quiere postre?"
      ],
      shopping: [
        "¡Buenos días! ¿En qué puedo ayudarle?",
        "Tenemos muchas opciones. ¿Qué talla necesita?",
        "Este cuesta 25 euros. ¿Le gusta?",
        "¿Cómo va a pagar? ¿Efectivo o tarjeta?",
        "¿Necesita una bolsa?",
        "¡Gracias por su compra!"
      ],
      travel: [
        "¡Hola! ¿Adónde quiere ir?",
        "Está a 10 minutos caminando. ¿Conoce la ciudad?",
        "¿Necesita un mapa o prefiere usar el GPS?",
        "¡Que tenga un buen viaje!",
        "¿Es su primera vez aquí?",
        "¿Necesita más información?"
      ]
    };

    // Smart response selection based on user input and context
    const topicResponses = responses[topic] || responses.greeting;

    // If user says hello/hola, respond with greeting
    if (userMessage.toLowerCase().includes('hola') || userMessage.toLowerCase().includes('hello')) {
      return topicResponses[0];
    }

    // If user mentions name, ask about origin
    if (userMessage.toLowerCase().includes('me llamo') || userMessage.toLowerCase().includes('soy')) {
      return topicResponses[1];
    }

    // Progressive conversation based on message count
    const responseIndex = Math.min(messageCount, topicResponses.length - 1);
    return topicResponses[responseIndex];
  };

  const startConversation = (topicId) => {
    setConversationTopic(topicId);
    const topic = conversationTopics.find(t => t.id === topicId);
    const initialResponse = getSmartAIResponse('', topicId, 0);
    const initialMessage = {
      id: Date.now(),
      text: `¡Hola! Vamos a practicar "${topic.title}". ${initialResponse}`,
      sender: 'ai',
      timestamp: new Date(),
      translation: `Hello! Let's practice "${topic.title}". ${getTranslation(initialResponse)}`
    };
    setMessages([initialMessage]);
    setScore(0);
  };

  const getTranslation = (spanishText) => {
    // Simple translation mapping - in real app, use translation API
    const translations = {
      "¡Hola! ¿Cómo te llamas?": "Hello! What's your name?",
      "¡Muy bien! ¿De dónde eres?": "Very good! Where are you from?",
      "¡Qué interesante! ¿Cuántos años tienes?": "How interesting! How old are you?",
      "¡Perfecto! ¿Qué te gusta hacer en tu tiempo libre?": "Perfect! What do you like to do in your free time?",
      "¡Bienvenido! ¿Qué le gustaría beber?": "Welcome! What would you like to drink?",
      "Excelente elección. ¿Y para comer?": "Excellent choice. And to eat?",
      "¿Le gusta la comida picante?": "Do you like spicy food?",
      "¿Necesita algo más? ¿La cuenta tal vez?": "Do you need anything else? The bill perhaps?",
      "¡Buenos días! ¿En qué puedo ayudarle?": "Good morning! How can I help you?",
      "Tenemos muchas opciones. ¿Qué talla necesita?": "We have many options. What size do you need?",
      "Este cuesta 25 euros. ¿Le gusta?": "This costs 25 euros. Do you like it?",
      "¿Cómo va a pagar? ¿Efectivo o tarjeta?": "How will you pay? Cash or card?",
      "¡Hola! ¿Adónde quiere ir?": "Hello! Where do you want to go?",
      "Está a 10 minutos caminando. ¿Conoce la ciudad?": "It's 10 minutes walking. Do you know the city?",
      "¿Necesita un mapa o prefiere usar el GPS?": "Do you need a map or prefer to use GPS?",
      "¡Que tenga un buen viaje!": "Have a good trip!"
    };
    return translations[spanishText] || "Translation not available";
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    // Rate limiting: prevent spam messages
    const now = Date.now();
    if (now - lastMessageTime < 1000) { // 1 second minimum between messages
      return;
    }
    setLastMessageTime(now);

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Award XP for sending a message
    if (onXPGain) onXPGain(5);
    setScore(prev => prev + 5);

    // Simulate AI response with more realistic timing
    setTimeout(() => {
      // Get smart AI response based on user input and conversation context
      const aiText = getSmartAIResponse(inputMessage, conversationTopic, messages.length);

      const aiMessage = {
        id: Date.now() + 1,
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
        translation: getTranslation(aiText)
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Award bonus XP for meaningful conversation milestones
      if (messages.length >= 4 && messages.length % 4 === 0) {
        if (onXPGain) onXPGain(15);
        setScore(prev => prev + 15);
      }

      // End conversation after 10 exchanges (20 total messages)
      if (messages.length >= 18) {
        setTimeout(() => {
          const endMessage = {
            id: Date.now() + 2,
            text: "¡Excelente conversación! Has practicado muy bien. 🎉",
            sender: 'ai',
            timestamp: new Date(),
            translation: "Excellent conversation! You practiced very well. 🎉"
          };
          setMessages(prev => [...prev, endMessage]);

          // Bonus XP for completing conversation
          if (onXPGain) onXPGain(50);
          setScore(prev => prev + 50);
        }, 2000);
      }
    }, Math.random() * 1000 + 1500); // Random delay between 1.5-2.5 seconds
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      speechSynthesis.speak(utterance);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setInputMessage('');
    setIsTyping(false);
    setScore(0);
    // Restart the current conversation topic
    if (conversationTopic) {
      setTimeout(() => startConversation(conversationTopic), 500);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Start with greeting conversation by default
    startConversation('greeting');
  }, []);

  if (messages.length === 0) {
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
            <h2 className="text-2xl font-bold text-gray-900">AI Conversation 🤖</h2>
            <p className="text-gray-600">Practice real conversations in Spanish</p>
          </div>

          <div className="flex items-center space-x-1">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">{score}</span>
          </div>
        </div>

        {/* Topic Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {conversationTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => startConversation(topic.id)}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl">
                <div className="text-center">
                  <div className="text-4xl mb-4">{topic.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{topic.title}</h3>
                  <p className="text-gray-600 mb-4">{topic.description}</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {topic.difficulty}
                  </span>
                </div>
                <div className="mt-6 text-center">
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all">
                    Start Conversation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
          <h2 className="text-xl font-bold text-gray-900">
            {conversationTopics.find(t => t.id === conversationTopic)?.title}
          </h2>
          <p className="text-gray-600">AI Conversation Practice</p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={resetConversation}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <div className="flex items-center space-x-1">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">{score}</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.sender === 'ai' && <Bot className="h-5 w-5 mt-0.5 text-blue-600" />}
                  {message.sender === 'user' && <User className="h-5 w-5 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm">{message.text}</p>
                    {message.sender === 'ai' && message.translation && (
                      <p className="text-xs opacity-75 mt-1 italic">"{message.translation}"</p>
                    )}
                  </div>
                  {message.sender === 'ai' && (
                    <button
                      onClick={() => speakMessage(message.text)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message in Spanish..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Conversation Tips</h4>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• Try to respond naturally to the AI's questions</li>
              <li>• Use the audio button to hear correct pronunciation</li>
              <li>• Don't worry about perfect grammar - focus on communication!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConversation;
