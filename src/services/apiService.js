// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Language endpoints
  async getLanguages() {
    return this.request('/languages');
  }

  // Translation endpoints
  async detectLanguage(text) {
    return this.request('/translation/detect', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async translateText(text, from, to) {
    return this.request('/translation/translate', {
      method: 'POST',
      body: JSON.stringify({ text, from, to }),
    });
  }

  async getWordInfo(word, language) {
    return this.request('/translation/word-info', {
      method: 'POST',
      body: JSON.stringify({ word, language }),
    });
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch('http://localhost:5000/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // User endpoints (if authenticated)
  async updateUser(userData, token) {
    return this.request('/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  }

  // Progress endpoints
  async saveProgress(progressData, token) {
    return this.request('/progress', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(progressData),
    });
  }

  async getProgress(token) {
    return this.request('/progress', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
