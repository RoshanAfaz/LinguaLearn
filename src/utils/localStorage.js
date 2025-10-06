// Utility functions for localStorage operations
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// User progress management
export const progressManager = {
  getUserProgress: (wordId) => {
    const allProgress = storage.get('userProgress', {});
    return allProgress[wordId] || {
      wordId,
      correctAnswers: 0,
      totalAttempts: 0,
      lastReviewed: new Date(),
      masteryLevel: 0,
      nextReviewDate: new Date()
    };
  },

  updateProgress: (wordId, isCorrect) => {
    const allProgress = storage.get('userProgress', {});
    const current = allProgress[wordId] || {
      wordId,
      correctAnswers: 0,
      totalAttempts: 0,
      lastReviewed: new Date(),
      masteryLevel: 0,
      nextReviewDate: new Date()
    };

    current.totalAttempts += 1;
    if (isCorrect) {
      current.correctAnswers += 1;
    }
    
    current.masteryLevel = Math.round((current.correctAnswers / current.totalAttempts) * 100);
    current.lastReviewed = new Date();
    
    // Calculate next review date based on mastery level
    const daysToAdd = Math.floor(current.masteryLevel / 20) + 1;
    current.nextReviewDate = new Date();
    current.nextReviewDate.setDate(current.nextReviewDate.getDate() + daysToAdd);

    allProgress[wordId] = current;
    storage.set('userProgress', allProgress);
    
    return current;
  },

  getAllProgress: () => {
    return storage.get('userProgress', {});
  }
};

// Learning session management
export const sessionManager = {
  getCurrentSession: () => {
    return storage.get('currentSession', null);
  },

  startSession: (language) => {
    const session = {
      id: Date.now().toString(),
      date: new Date(),
      wordsStudied: 0,
      correctAnswers: 0,
      timeSpent: 0,
      language,
      startTime: Date.now()
    };
    storage.set('currentSession', session);
    return session;
  },

  updateSession: (updates) => {
    const current = sessionManager.getCurrentSession();
    if (current) {
      const updated = { ...current, ...updates };
      storage.set('currentSession', updated);
      return updated;
    }
    return null;
  },

  endSession: () => {
    const current = sessionManager.getCurrentSession();
    if (current) {
      current.timeSpent = Math.round((Date.now() - current.startTime) / 60000); // in minutes
      
      // Save to session history
      const history = storage.get('sessionHistory', []);
      history.push(current);
      storage.set('sessionHistory', history);
      
      // Clear current session
      storage.remove('currentSession');
      
      return current;
    }
    return null;
  },

  getSessionHistory: () => {
    return storage.get('sessionHistory', []);
  }
};