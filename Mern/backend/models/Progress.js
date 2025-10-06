const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  wordId: {
    type: String,
    required: true
  },
  word: {
    type: String,
    required: true
  },
  translation: {
    type: String,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  masteryLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastReviewed: {
    type: Date,
    default: Date.now
  },
  nextReviewDate: {
    type: Date,
    default: Date.now
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
progressSchema.index({ userId: 1, language: 1, wordId: 1 }, { unique: true });
progressSchema.index({ userId: 1, language: 1 });
progressSchema.index({ nextReviewDate: 1 });

// Update the updatedAt field before saving
progressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate next review date based on mastery level
progressSchema.methods.calculateNextReview = function() {
  const baseInterval = 1; // 1 day
  const masteryMultiplier = Math.floor(this.masteryLevel / 20) + 1;
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + (baseInterval * masteryMultiplier));
  this.nextReviewDate = nextReview;
  return nextReview;
};

// Update progress after an attempt
progressSchema.methods.updateProgress = function(isCorrect) {
  this.totalAttempts += 1;
  if (isCorrect) {
    this.correctAnswers += 1;
  }
  
  // Calculate mastery level (0-100)
  this.masteryLevel = Math.round((this.correctAnswers / this.totalAttempts) * 100);
  
  // Update review dates
  this.lastReviewed = Date.now();
  this.calculateNextReview();
  
  return this.save();
};

module.exports = mongoose.model('Progress', progressSchema);
