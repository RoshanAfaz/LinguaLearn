// Translation service for communicating with the Node.js backend
const API_BASE_URL = 'http://localhost:5000/api';

class TranslationService {
  constructor() {
    this.cache = new Map();
    this.isBackendAvailable = false;
    this.checkBackendHealth();
  }

  async checkBackendHealth() {
    try {
      const response = await fetch('http://localhost:5000/health');
      this.isBackendAvailable = response.ok;
      return this.isBackendAvailable;
    } catch (error) {
      console.warn('Translation backend not available:', error.message);
      this.isBackendAvailable = false;
      return false;
    }
  }

  async getSupportedLanguages() {
    try {
      // Try to get languages from backend first
      const response = await fetch(`${API_BASE_URL}/languages`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Convert array to object for backward compatibility
          const languageMap = {};
          data.data.forEach(lang => {
            languageMap[lang.code] = lang.name;
          });
          return languageMap;
        }
      }
    } catch (error) {
      console.warn('Could not fetch languages from backend:', error);
    }

    // Fallback to comprehensive languages if backend is not available
    return {
      'en': 'English',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'te': 'Telugu',
      'mr': 'Marathi',
      'ta': 'Tamil',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'pa': 'Punjabi',
      'or': 'Odia',
      'as': 'Assamese',
      'ur': 'Urdu',
      'sa': 'Sanskrit',
      'ne': 'Nepali',
      'si': 'Sinhala',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'th': 'Thai',
      'he': 'Hebrew',
      'tr': 'Turkish',
      'pl': 'Polish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish',
      'cs': 'Czech',
      'sk': 'Slovak',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'bg': 'Bulgarian',
      'hr': 'Croatian',
      'sr': 'Serbian',
      'sl': 'Slovenian',
      'et': 'Estonian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'uk': 'Ukrainian',
      'be': 'Belarusian',
      'ka': 'Georgian',
      'hy': 'Armenian',
      'az': 'Azerbaijani',
      'kk': 'Kazakh',
      'ky': 'Kyrgyz',
      'uz': 'Uzbek',
      'tg': 'Tajik',
      'mn': 'Mongolian',
      'my': 'Myanmar',
      'km': 'Khmer',
      'lo': 'Lao',
      'vi': 'Vietnamese',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tl': 'Filipino',
      'sw': 'Swahili',
      'am': 'Amharic',
      'yo': 'Yoruba',
      'zu': 'Zulu',
      'af': 'Afrikaans'
    };
  }

  getLanguageName(code) {
    const languageNames = {
      'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'te': 'Telugu', 'mr': 'Marathi',
      'ta': 'Tamil', 'gu': 'Gujarati', 'kn': 'Kannada', 'ml': 'Malayalam', 'pa': 'Punjabi',
      'or': 'Odia', 'as': 'Assamese', 'ur': 'Urdu', 'sa': 'Sanskrit', 'ne': 'Nepali',
      'si': 'Sinhala', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
      'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese',
      'ar': 'Arabic'
    };
    return languageNames[code] || code.toUpperCase();
  }

  async detectLanguage(text) {
    if (!text || text.trim().length === 0) {
      return { detected_language: 'en', language_name: 'English', confidence: 0 };
    }

    // Try backend API first
    try {
      const response = await fetch(`${API_BASE_URL}/translation/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            detected_language: data.data.detectedLanguage,
            language_name: this.getLanguageName(data.data.detectedLanguage),
            confidence: data.data.confidence
          };
        }
      }
    } catch (error) {
      console.warn('Backend language detection failed, using fallback:', error);
    }

    // Fallback language detection
    return this.fallbackLanguageDetection(text);
  }

  fallbackLanguageDetection(text) {
    // Simple pattern-based language detection
    const patterns = {
      'es': /[ñáéíóúü]/i,
      'fr': /[àâäéèêëïîôöùûüÿç]/i,
      'de': /[äöüß]/i,
      'it': /[àèéìíîòóù]/i,
      'pt': /[ãõáàâéêíóôúç]/i,
      'ru': /[а-яё]/i,
      'ar': /[\u0600-\u06FF]/,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/,
      'hi': /[\u0900-\u097f]/,
      'bn': /[\u0980-\u09ff]/,
      'te': /[\u0c00-\u0c7f]/,
      'ta': /[\u0b80-\u0bff]/,
      'gu': /[\u0a80-\u0aff]/,
      'kn': /[\u0c80-\u0cff]/,
      'ml': /[\u0d00-\u0d7f]/,
      'pa': /[\u0a00-\u0a7f]/,
      'ur': /[\u0600-\u06ff]/,
      'ne': /[\u0900-\u097f]/,
      'si': /[\u0d80-\u0dff]/
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return {
          detected_language: lang,
          language_name: this.getLanguageName(lang),
          confidence: 0.8,
          fallback: true
        };
      }
    }

    // Default to English
    return {
      detected_language: 'en',
      language_name: 'English',
      confidence: 0.5,
      fallback: true
    };
  }

  async translateText(text, sourceLanguage = 'auto', targetLanguage = 'en') {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'No text provided'
      };
    }

    // Check cache first
    const cacheKey = `translate_${text}_${sourceLanguage}_${targetLanguage}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Try backend API first
    try {
      const response = await fetch(`${API_BASE_URL}/translation/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          from: sourceLanguage === 'auto' ? 'en' : sourceLanguage, 
          to: targetLanguage 
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const result = {
            success: true,
            original_text: text,
            translated_text: data.data.translatedText,
            source_language: data.data.sourceLanguage,
            target_language: data.data.targetLanguage,
            confidence: data.data.confidence
          };
          this.cache.set(cacheKey, result);
          return result;
        }
      }
    } catch (error) {
      console.warn('Backend translation failed, using fallback:', error);
    }

    // Fallback: return original text
    const fallback = {
      success: true,
      original_text: text,
      translated_text: text,
      source_language: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
      target_language: targetLanguage,
      fallback: true
    };
    this.cache.set(cacheKey, fallback);
    return fallback;
  }

  async getWordInfo(word, language = 'en') {
    const cacheKey = `wordinfo_${word}_${language}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/translation/word-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, language })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.cache.set(cacheKey, data.data);
          return data.data;
        }
      }
    } catch (error) {
      console.warn('Backend word info failed, using fallback:', error);
    }

    // Fallback word info
    const fallback = {
      word,
      language,
      phonetic: '/wɜːrd/',
      definitions: [
        {
          partOfSpeech: 'noun',
          definition: 'A unit of language',
          example: `Example: "${word}"`
        }
      ],
      synonyms: [],
      translations: {},
      fallback: true
    };
    this.cache.set(cacheKey, fallback);
    return fallback;
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }
}

// Create and export a singleton instance
const translationService = new TranslationService();
export default translationService;
