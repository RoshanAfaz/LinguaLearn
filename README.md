# 🌍 MERN Stack Language Learning App with AI Translation

A comprehensive language learning application built with the **MERN Stack** (MongoDB, Express.js, React, Node.js) featuring AI-powered translation, spaced repetition, gamification, and support for 70+ languages.

## 🏗️ **MERN Stack Architecture**

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + Translation APIs
- **Database**: Ready for MongoDB integration
- **Translation**: Google Translate API + Language Detection

## ✨ Features

### 🎯 Learning Modes
- **Flashcards**: Interactive cards with confidence rating
- **Smart Quiz**: Timed multiple-choice questions
- **Spaced Repetition**: AI-powered review scheduling
- **Typing Practice**: Speed and accuracy training
- **Smart Translator**: Real-time translation in 70+ languages

### 🧠 AI-Powered Translation (Node.js Backend)
- **Automatic Language Detection**: Detects language as you type
- **70+ Languages Supported**: Using Google Translate API
- **Real-time Translation**: Instant translations to multiple languages
- **Vocabulary Integration**: Add translations directly to your vocabulary

### 🎮 Gamification
- **Achievement System**: 12 different achievements with points
- **Daily Challenges**: 6 challenge types that refresh daily
- **Progress Tracking**: Detailed analytics and statistics
- **Level System**: Beginner → Intermediate → Advanced → Expert → Master

### 📚 Vocabulary Management
- **Custom Word Lists**: Create and organize your vocabulary
- **Import/Export**: Share vocabulary with JSON files
- **Advanced Filtering**: By category, difficulty, and custom lists
- **Search Functionality**: Find words quickly

## 🚀 Quick Start (MERN Stack)

### Option 1: One-Click Startup (Recommended)
```bash
# Run the startup script (Windows)
start-mern.bat
```

This will automatically:
- Install all dependencies (frontend + backend)
- Start the Node.js backend server
- Start the React frontend server
- Open both in separate windows

### Option 2: Manual Setup

#### Backend (Node.js + Express)
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Start the backend server
npm start
# or for development with auto-reload:
npm run dev
```

#### Frontend (React + Vite)
```bash
# Install dependencies (in project root)
npm install

# Start the development server
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5175/ (or next available port)
- **Backend API**: http://localhost:5000/
- **Health Check**: http://localhost:5000/health

## 🌐 Translation Features

### Smart Translator
1. **Type any word** in any language
2. **Automatic detection** of the source language
3. **Select target languages** for translation
4. **Add to vocabulary** with one click
5. **Listen to pronunciations** with text-to-speech
6. **Copy translations** to clipboard

### Supported Languages (70+)
- **European**: English, Spanish, French, German, Italian, Portuguese, Russian, Polish, Dutch, Swedish, Danish, Norwegian, Finnish, Czech, Hungarian, Romanian, Bulgarian, Croatian, Slovak, Slovenian, Estonian, Latvian, Lithuanian, Ukrainian
- **Asian**: Japanese, Korean, Chinese, Hindi, Thai, Vietnamese, Indonesian, Malay, Filipino, Bengali, Tamil, Telugu, Malayalam, Kannada, Gujarati, Punjabi, Marathi, Nepali, Sinhala, Myanmar, Khmer, Lao
- **Middle Eastern**: Arabic, Hebrew, Persian, Urdu, Turkish
- **African**: Swahili, Amharic, Afrikaans
- **Other**: Icelandic, Maltese, Welsh, Irish, Basque, Catalan, Galician, Albanian, Azerbaijani, Belarusian, Bosnian, Macedonian, Serbian, Mongolian, Kazakh, Kyrgyz, Tajik, Turkmen, Uzbek, Georgian

## 📱 How to Use

### 1. Learning Modes
- **Learn Tab**: Choose from 4 different learning modes
- **Flashcards**: Click flip button, rate your confidence
- **Quiz**: Answer multiple-choice questions with timer
- **Smart Review**: AI-powered spaced repetition
- **Typing**: Practice typing words with accuracy tracking

### 2. Smart Translator
- **Translator Tab**: Access the AI translation feature
- Type any word in any language
- Select target languages for translation
- Add translations to your vocabulary
- Listen to pronunciations

### 3. Vocabulary Management
- **Vocabulary Tab**: Manage your word collection
- Add custom words with details
- Import/export vocabulary lists
- Filter and search words
- Create custom themed lists

### 4. Progress Tracking
- **Progress Tab**: View your learning analytics
- **Overview**: Statistics and recent sessions
- **Achievements**: Unlock achievements and earn points
- **Daily Challenges**: Complete daily goals

### 5. User Profile
- **Profile Tab**: Manage your account
- Update personal information
- Set preferred language and level
- View account statistics

## 🛠️ Technical Details

### Frontend Stack
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **Local Storage**: Persistent data storage

### Backend Stack (Node.js)
- **Express.js**: Fast, unopinionated web framework
- **Google Translate API**: AI translation service
- **Franc**: Language detection library
- **ISO-639-1**: Language code standardization
- **Node Cache**: In-memory caching
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing

### Key Components
- `SmartTranslator.jsx`: Real-time translation interface
- `SpacedRepetition.jsx`: AI-powered review system
- `VocabularyManager.jsx`: Word management system
- `AchievementSystem.jsx`: Gamification features
- `DailyChallenges.jsx`: Daily motivation system
- `TypingPractice.jsx`: Typing speed training

## 🔧 Configuration

### Translation Service
The app works in two modes:

1. **Basic Mode** (Frontend only):
   - Simple pattern-based language detection
   - Limited translation features
   - Works without backend

2. **AI Mode** (With Python backend):
   - Advanced language detection
   - 70+ languages support
   - Real-time translation
   - High accuracy

### Environment Variables
No environment variables required for basic functionality. The app automatically detects if the backend is available.

## 🎯 Learning Methodology

### Spaced Repetition Algorithm
- **Interval 0**: 1 day (first review)
- **Interval 1**: 3 days (second review)
- **Interval 2**: 7 days (third review)
- **Interval 3**: 14 days (fourth review)
- **Interval 4**: 30 days (fifth review)
- **Interval 5**: 90 days (mastered)

### Difficulty Levels
- **Easy**: Basic vocabulary, common words
- **Medium**: Intermediate vocabulary, phrases
- **Hard**: Advanced vocabulary, complex concepts

### Achievement System
- **Learning Milestones**: First word, 10 words, 50 words, 100 words
- **Consistency Rewards**: 3-day, 7-day, 30-day streaks
- **Performance Goals**: Perfect quizzes, accuracy targets
- **Activity Challenges**: Daily study time, typing speed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Backend Not Starting
- Ensure Python 3.7+ is installed
- Check if all requirements are installed: `pip install -r requirements.txt`
- Verify port 5000 is not in use

### Translation Not Working
- Check if backend is running at `http://localhost:5000`
- Verify internet connection for Google Translate API
- Check browser console for error messages

### Performance Issues
- Clear browser cache and local storage
- Restart both frontend and backend servers
- Check available memory and CPU usage

## 🌟 Future Enhancements

- **Voice Recognition**: Speech-to-text input
- **Conversation Practice**: AI-powered dialogues
- **Grammar Lessons**: Structured grammar learning
- **Social Features**: Share progress with friends
- **Mobile App**: React Native version
- **Offline Mode**: Download content for offline use

---

**Happy Learning! 🎓**
