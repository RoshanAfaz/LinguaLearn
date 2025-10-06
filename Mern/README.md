# LinguaLearn - AI Language Learning Platform

A comprehensive language learning platform with AI-powered features, user authentication, and admin panel.

## Features

### 🎓 Learning Features
- **Interactive Flashcards** - Smart spaced repetition system
- **AI Chatbot** - Practice conversations in any language
- **Language Games** - Word matching, memory cards, typing practice
- **Smart Translator** - Context-aware translations
- **Progress Tracking** - Detailed analytics and statistics
- **Vocabulary Manager** - Custom word lists and management

### 🔐 Authentication System
- **User Registration/Login** - Secure JWT-based authentication
- **User Profiles** - Personalized learning preferences
- **Admin Panel** - Comprehensive user and analytics management
- **Role-based Access** - User and admin roles

### 📊 Admin Features
- **User Management** - View, search, and manage users
- **Analytics Dashboard** - Learning statistics and trends
- **Language Popularity** - Track most studied languages
- **Session Monitoring** - Monitor user activity and engagement

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** and security middleware

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd lingualearn
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/lingualearn
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@lingualearn.com
ADMIN_PASSWORD=admin123
```

### 3. Frontend Setup
```bash
cd project
npm install
```

Create `.env` file in project directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

### 4. Database Setup

Start MongoDB service, then seed the admin user:
```bash
cd backend
npm run seed:admin
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd project
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Admin Credentials
- **Email:** admin@lingualearn.com
- **Password:** admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/stats` - Update user statistics
- `DELETE /api/users/account` - Deactivate account

### Admin Panel
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/users` - Get all users (paginated)
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/analytics` - Detailed analytics

### Progress Tracking
- `GET /api/progress/:language` - Get user progress
- `POST /api/progress/update` - Update word progress
- `POST /api/progress/session` - Create learning session
- `PUT /api/progress/session/:id` - Update session
- `GET /api/progress/sessions/history` - Get session history

## Project Structure

```
lingualearn/
├── backend/                 # Express.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── scripts/            # Database scripts
│   └── server.js           # Main server file
├── project/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── data/           # Static data
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
