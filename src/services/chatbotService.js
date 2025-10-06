import translationService from './translationService';

class ChatbotService {
  constructor() {
    this.conversationHistory = [];
    this.currentLanguage = 'en';
    this.userLevel = 'beginner'; // beginner, intermediate, advanced
    this.scenarios = this.initializeScenarios();
  }

  initializeScenarios() {
    return {
      casual: {
        name: 'Casual Conversation',
        description: 'Everyday chat about hobbies, weather, and daily life',
        prompts: [
          'Hello! How are you today?',
          'What did you do this weekend?',
          'What\'s your favorite hobby?',
          'How\'s the weather where you are?',
          'What do you like to do for fun?'
        ]
      },
      restaurant: {
        name: 'At a Restaurant',
        description: 'Ordering food and restaurant conversations',
        prompts: [
          'Welcome to our restaurant! What would you like to order?',
          'Would you like to see the menu?',
          'What\'s your favorite type of food?',
          'Would you like something to drink?',
          'How was your meal?'
        ]
      },
      travel: {
        name: 'Travel & Tourism',
        description: 'Asking for directions and travel conversations',
        prompts: [
          'Excuse me, how do I get to the train station?',
          'What time does the museum open?',
          'Can you recommend a good hotel?',
          'Where is the nearest pharmacy?',
          'How much does a taxi cost to the airport?'
        ]
      },
      shopping: {
        name: 'Shopping',
        description: 'Buying things and shopping conversations',
        prompts: [
          'Can I help you find something?',
          'How much does this cost?',
          'Do you have this in a different size?',
          'Where can I pay for this?',
          'Do you accept credit cards?'
        ]
      },
      work: {
        name: 'Work & Business',
        description: 'Professional and workplace conversations',
        prompts: [
          'What do you do for work?',
          'How long have you been working here?',
          'What time is the meeting?',
          'Can you help me with this project?',
          'When is the deadline?'
        ]
      }
    };
  }

  async startConversation(language, scenario = 'casual', level = 'beginner') {
    this.currentLanguage = language;
    this.userLevel = level;
    this.conversationHistory = [];

    const scenarioData = this.scenarios[scenario];
    const prompt = scenarioData.prompts[Math.floor(Math.random() * scenarioData.prompts.length)];

    // Translate the prompt to the target language
    let translatedPrompt = prompt;
    if (language !== 'en') {
      try {
        const translation = await translationService.translateText(prompt, 'en', language);
        if (translation.success) {
          translatedPrompt = translation.translated_text;
        }
      } catch (error) {
        console.error('Error translating prompt:', error);
      }
    }

    const botMessage = {
      id: Date.now(),
      sender: 'bot',
      message: translatedPrompt,
      originalMessage: prompt,
      timestamp: new Date().toISOString(),
      scenario: scenario
    };

    this.conversationHistory.push(botMessage);
    return botMessage;
  }

  async sendMessage(userMessage) {
    // Add user message to history
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      message: userMessage,
      timestamp: new Date().toISOString()
    };
    this.conversationHistory.push(userMsg);

    // Generate bot response
    const botResponse = await this.generateResponse(userMessage);
    
    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      message: botResponse.message,
      originalMessage: botResponse.originalMessage,
      timestamp: new Date().toISOString(),
      corrections: botResponse.corrections,
      suggestions: botResponse.suggestions
    };

    this.conversationHistory.push(botMsg);
    return botMsg;
  }

  async generateResponse(userMessage) {
    try {
      // Translate user message to English for processing
      let englishMessage = userMessage;
      if (this.currentLanguage !== 'en') {
        const translation = await translationService.translateText(userMessage, this.currentLanguage, 'en');
        if (translation.success) {
          englishMessage = translation.translated_text;
        }
      }

      // Generate contextual response based on conversation history and user level
      const response = this.generateContextualResponse(englishMessage);
      
      // Translate response back to target language
      let translatedResponse = response;
      if (this.currentLanguage !== 'en') {
        const translation = await translationService.translateText(response, 'en', this.currentLanguage);
        if (translation.success) {
          translatedResponse = translation.translated_text;
        }
      }

      // Generate corrections and suggestions
      const corrections = await this.analyzeUserMessage(userMessage);
      const suggestions = this.generateSuggestions(englishMessage);

      return {
        message: translatedResponse,
        originalMessage: response,
        corrections: corrections,
        suggestions: suggestions
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        message: 'I\'m sorry, I didn\'t understand that. Could you try again?',
        originalMessage: 'I\'m sorry, I didn\'t understand that. Could you try again?',
        corrections: [],
        suggestions: []
      };
    }
  }

  generateContextualResponse(message) {
    const responses = {
      greeting: [
        'Hello! Nice to meet you!',
        'Hi there! How can I help you today?',
        'Good day! What would you like to talk about?'
      ],
      weather: [
        'The weather is quite nice today, isn\'t it?',
        'I hope you\'re enjoying the weather!',
        'Weather can really affect our mood, don\'t you think?'
      ],
      food: [
        'That sounds delicious! Do you cook often?',
        'I love trying new foods. What\'s your favorite cuisine?',
        'Food is such a great way to experience different cultures!'
      ],
      work: [
        'That sounds like interesting work!',
        'How do you like your job?',
        'Work can be challenging but rewarding.'
      ],
      travel: [
        'That sounds like a wonderful place to visit!',
        'I love hearing about travel experiences.',
        'Traveling is such a great way to learn!'
      ],
      default: [
        'That\'s interesting! Tell me more.',
        'I see. What do you think about that?',
        'That\'s a good point. Can you explain more?',
        'Interesting perspective! What else?'
      ]
    };

    // Simple keyword matching for response generation
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    } else if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('sunny')) {
      return responses.weather[Math.floor(Math.random() * responses.weather.length)];
    } else if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('restaurant')) {
      return responses.food[Math.floor(Math.random() * responses.food.length)];
    } else if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('office')) {
      return responses.work[Math.floor(Math.random() * responses.work.length)];
    } else if (lowerMessage.includes('travel') || lowerMessage.includes('trip') || lowerMessage.includes('vacation')) {
      return responses.travel[Math.floor(Math.random() * responses.travel.length)];
    } else {
      return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
  }

  async analyzeUserMessage(message) {
    // Simple grammar and spelling analysis
    const corrections = [];
    
    // Basic corrections (this would be enhanced with a proper grammar checker)
    if (message.toLowerCase().includes('i are')) {
      corrections.push({
        error: 'i are',
        correction: 'I am',
        explanation: 'Use "I am" instead of "I are"'
      });
    }
    
    if (message.toLowerCase().includes('he are') || message.toLowerCase().includes('she are')) {
      corrections.push({
        error: 'he/she are',
        correction: 'he/she is',
        explanation: 'Use "is" with he/she, not "are"'
      });
    }

    return corrections;
  }

  generateSuggestions(message) {
    const suggestions = [
      'Try using more descriptive words',
      'Consider asking a follow-up question',
      'You could expand on that idea',
      'Great! Try to use the past tense next time'
    ];

    return [suggestions[Math.floor(Math.random() * suggestions.length)]];
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getScenarios() {
    return this.scenarios;
  }

  setUserLevel(level) {
    this.userLevel = level;
  }
}

const chatbotService = new ChatbotService();
export default chatbotService;
