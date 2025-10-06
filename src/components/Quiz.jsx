import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Award } from 'lucide-react';

const Quiz = ({ words, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);

  const currentWord = words[currentQuestionIndex];
  const totalQuestions = words.length;

  // Generate quiz options for each question
  const generateOptions = (correctAnswer, allWords) => {
    const options = [correctAnswer];
    const otherWords = allWords.filter(w => w.translation !== correctAnswer && w.translation);

    // Add fallback options if not enough words
    const fallbackOptions = ['Option A', 'Option B', 'Option C'];

    while (options.length < 4) {
      if (otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        const option = otherWords[randomIndex].translation;
        if (!options.includes(option)) {
          options.push(option);
        }
        otherWords.splice(randomIndex, 1);
      } else {
        // Use fallback options
        const fallback = fallbackOptions[options.length - 1];
        if (fallback && !options.includes(fallback)) {
          options.push(fallback);
        } else {
          break;
        }
      }
    }

    return options.sort(() => Math.random() - 0.5);
  };

  const [allOptions, setAllOptions] = useState(() => {
    return words.map(word => generateOptions(word.translation, words));
  });

  const options = allOptions[currentQuestionIndex] || [];

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResult && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, showResult, quizCompleted]);

  const handleTimeUp = () => {
    setShowResult(true);
    setAnswers(prev => [...prev, {
      word: currentWord,
      selectedAnswer: '',
      correct: false,
      timeUp: true
    }]);
  };

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentWord.translation;
    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers(prev => [...prev, {
      word: currentWord,
      selectedAnswer,
      correct: isCorrect,
      timeUp: false
    }]);

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowResult(false);
      setTimeLeft(30);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      onQuizComplete({
        score,
        totalQuestions,
        answers,
        percentage: Math.round((score / totalQuestions) * 100)
      });
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (quizCompleted) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <Award className={`h-16 w-16 mx-auto mb-4 ${getScoreColor(percentage)}`} />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
          <div className={`text-5xl font-bold mb-2 ${getScoreColor(percentage)}`}>
            {percentage}%
          </div>
          <p className="text-gray-600">
            You scored {score} out of {totalQuestions} questions
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Answers</h3>
          <div className="space-y-3">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center space-x-3">
                  {answer.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{answer.word.word}</div>
                    <div className="text-sm text-gray-600">
                      Correct: {answer.word.translation}
                      {!answer.correct && answer.selectedAnswer && (
                        <span className="text-red-600"> | Your answer: {answer.selectedAnswer}</span>
                      )}
                      {answer.timeUp && <span className="text-red-600"> | Time's up!</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Take Another Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Progress and Timer */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className={`flex items-center space-x-2 ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono font-medium">{timeLeft}s</span>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <div className="text-lg text-gray-600 mb-4">What does this word mean?</div>
          <div className="text-4xl font-bold text-gray-900 mb-2">{currentWord.word}</div>
          {currentWord.pronunciation && (
            <div className="text-sm text-gray-500 italic">/{currentWord.pronunciation}/</div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showResult}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                showResult
                  ? option === currentWord.translation
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : option === selectedAnswer
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-gray-50 text-gray-500'
                  : selectedAnswer === option
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{option}</div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {currentQuestionIndex + 1 < totalQuestions ? 'Next Question' : 'View Results'}
            </button>
          )}
        </div>

        {/* Result Feedback */}
        {showResult && (
          <div className="mt-6 p-4 rounded-lg text-center">
            {selectedAnswer === currentWord.translation ? (
              <div className="text-green-600">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <div className="font-medium">Correct! Well done!</div>
              </div>
            ) : (
              <div className="text-red-600">
                <XCircle className="h-8 w-8 mx-auto mb-2" />
                <div className="font-medium">
                  {timeLeft === 0 ? "Time's up!" : "Incorrect!"}
                </div>
                <div className="text-sm mt-1">
                  The correct answer is: <span className="font-medium">{currentWord.translation}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;