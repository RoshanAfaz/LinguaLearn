# Repository Overview

- **Name**: LinguaLearn
- **Description**: AI-powered language learning platform with MERN stack architecture, supporting flashcards, quizzes, gamified learning, and translation features.
- **Monorepo Structure**:
  - `Mern/backend`: Node.js + Express backend with MongoDB via Mongoose
  - `Mern/project`: React 18 frontend built with Vite and Tailwind CSS

## Key Technologies
- **Frontend**: React 18, Vite, Tailwind CSS, Context API, Lucide React icons
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs, CORS, Google Translate integrations
- **Database**: MongoDB

## Environment Configuration
- Backend `.env` (located at `Mern/backend/.env`):
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `JWT_EXPIRE`
  - `PORT`
  - `NODE_ENV`
  - `FRONTEND_URL`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- Frontend `.env` (located at `Mern/project/.env`):
  - `VITE_API_URL`
  - `VITE_NODE_ENV`

## Setup Summary
1. Install dependencies in `Mern/backend` and `Mern/project`
2. Configure `.env` files as noted above
3. Start backend (`npm run dev`) and frontend (`npm run dev`) servers
4. Access frontend at `http://localhost:5173` and backend API at `http://localhost:5000`

## Notable Scripts
- Backend admin seeding: `npm run seed:admin`
- Frontend startup (Windows): `start-mern.bat`

## Additional Notes
- Default admin credentials: `admin@lingualearn.com` / `admin123`
- Project includes extensive AI-driven learning modules and gamification features