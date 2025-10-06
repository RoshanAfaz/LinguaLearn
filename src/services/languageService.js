import translationService from './translationService';

class LanguageService {
  constructor() {
    this.supportedLanguages = new Map();
    this.languageCache = new Map();
    this.loadSupportedLanguages();
  }

  async loadSupportedLanguages() {
    try {
      const languages = await translationService.getSupportedLanguages();
      for (const [code, name] of Object.entries(languages)) {
        this.supportedLanguages.set(code, {
          code,
          name,
          nativeName: this.getNativeName(code),
          flag: this.getFlag(code),
          script: this.getScript(code),
          direction: this.getDirection(code),
          family: this.getLanguageFamily(code)
        });
      }
    } catch (error) {
      console.error('Error loading supported languages:', error);
    }
  }

  async detectAndAddLanguage(input) {
    try {
      // First try to detect if it's a language name
      const languageByName = this.findLanguageByName(input);
      if (languageByName) {
        return languageByName;
      }

      // Try to detect if it's a language code
      const languageByCode = this.supportedLanguages.get(input.toLowerCase());
      if (languageByCode) {
        return languageByCode;
      }

      // Try to detect language from sample text
      const detection = await translationService.detectLanguage(input);
      if (detection.success && detection.detected_language) {
        const detectedLang = this.supportedLanguages.get(detection.detected_language);
        if (detectedLang) {
          return detectedLang;
        }
      }

      // If not found, create a new language entry
      return this.createNewLanguageEntry(input);
    } catch (error) {
      console.error('Error detecting language:', error);
      return null;
    }
  }

  findLanguageByName(name) {
    const searchName = name.toLowerCase().trim();
    for (const [code, lang] of this.supportedLanguages) {
      if (
        lang.name.toLowerCase().includes(searchName) ||
        lang.nativeName.toLowerCase().includes(searchName) ||
        searchName.includes(lang.name.toLowerCase())
      ) {
        return lang;
      }
    }
    return null;
  }

  createNewLanguageEntry(input) {
    // Create a basic language entry for unknown languages
    const code = input.toLowerCase().substring(0, 2);
    return {
      code: code,
      name: input.charAt(0).toUpperCase() + input.slice(1),
      nativeName: input,
      flag: '🌐',
      script: 'Latin',
      direction: 'ltr',
      family: 'Unknown',
      isCustom: true
    };
  }

  async generateBasicVocabulary(languageCode, count = 20) {
    try {
      // Basic vocabulary words in English to translate
      const basicWords = [
        'hello', 'goodbye', 'please', 'thank you', 'yes', 'no',
        'water', 'food', 'house', 'family', 'friend', 'love',
        'good', 'bad', 'big', 'small', 'hot', 'cold',
        'one', 'two', 'three', 'four', 'five',
        'today', 'tomorrow', 'yesterday', 'time', 'day', 'night',
        'eat', 'drink', 'sleep', 'work', 'study', 'play',
        'happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty'
      ];

      const selectedWords = basicWords.slice(0, count);
      const vocabulary = [];

      for (let i = 0; i < selectedWords.length; i++) {
        const word = selectedWords[i];
        try {
          const translation = await translationService.translateText(word, 'en', languageCode);
          
          if (translation.success) {
            vocabulary.push({
              id: `generated_${Date.now()}_${i}`,
              word: translation.translated_text,
              translation: word,
              language: languageCode,
              difficulty: this.getDifficultyLevel(i, count),
              category: this.getWordCategory(word),
              pronunciation: '',
              example: '',
              imageUrl: this.getWordImage(word),
              isGenerated: true,
              createdAt: new Date().toISOString()
            });
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error translating ${word}:`, error);
        }
      }

      return vocabulary;
    } catch (error) {
      console.error('Error generating vocabulary:', error);
      return [];
    }
  }

  getDifficultyLevel(index, total) {
    if (index < total * 0.4) return 'easy';
    if (index < total * 0.7) return 'medium';
    return 'hard';
  }

  getWordCategory(word) {
    const categories = {
      'hello': 'greetings', 'goodbye': 'greetings', 'please': 'greetings', 'thank you': 'greetings',
      'water': 'food', 'food': 'food', 'eat': 'food', 'drink': 'food', 'hungry': 'food', 'thirsty': 'food',
      'house': 'home', 'family': 'family', 'friend': 'family',
      'good': 'adjectives', 'bad': 'adjectives', 'big': 'adjectives', 'small': 'adjectives', 'hot': 'adjectives', 'cold': 'adjectives',
      'happy': 'emotions', 'sad': 'emotions', 'angry': 'emotions', 'love': 'emotions',
      'work': 'verbs', 'study': 'verbs', 'play': 'verbs', 'sleep': 'verbs',
      'one': 'numbers', 'two': 'numbers', 'three': 'numbers', 'four': 'numbers', 'five': 'numbers',
      'today': 'time', 'tomorrow': 'time', 'yesterday': 'time', 'time': 'time', 'day': 'time', 'night': 'time'
    };
    return categories[word] || 'general';
  }

  getWordImage(word) {
    const images = {
      'hello': 'https://images.pexels.com/photos/6203456/pexels-photo-6203456.jpeg?auto=compress&cs=tinysrgb&w=300',
      'house': 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=300',
      'water': 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=300',
      'food': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
      'family': 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=300'
    };
    return images[word] || '';
  }

  getNativeName(code) {
    const nativeNames = {
      'en': 'English', 'es': 'Español', 'fr': 'Français', 'de': 'Deutsch', 'it': 'Italiano',
      'pt': 'Português', 'ru': 'Русский', 'ja': '日本語', 'ko': '한국어', 'zh': '中文',
      'ar': 'العربية', 'hi': 'हिन्दी', 'tr': 'Türkçe', 'pl': 'Polski', 'nl': 'Nederlands',
      'sv': 'Svenska', 'da': 'Dansk', 'no': 'Norsk', 'fi': 'Suomi', 'cs': 'Čeština',
      'hu': 'Magyar', 'ro': 'Română', 'bg': 'Български', 'hr': 'Hrvatski', 'sk': 'Slovenčina',
      'uk': 'Українська', 'th': 'ไทย', 'vi': 'Tiếng Việt', 'id': 'Bahasa Indonesia',
      'he': 'עברית', 'fa': 'فارسی', 'ur': 'اردو', 'bn': 'বাংলা', 'ta': 'தமிழ்'
    };
    return nativeNames[code] || code.toUpperCase();
  }

  getFlag(code) {
    const flags = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
      'pt': '🇵🇹', 'ru': '🇷🇺', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳',
      'ar': '🇸🇦', 'hi': '🇮🇳', 'tr': '🇹🇷', 'pl': '🇵🇱', 'nl': '🇳🇱',
      'sv': '🇸🇪', 'da': '🇩🇰', 'no': '🇳🇴', 'fi': '🇫🇮', 'cs': '🇨🇿',
      'hu': '🇭🇺', 'ro': '🇷🇴', 'bg': '🇧🇬', 'hr': '🇭🇷', 'sk': '🇸🇰',
      'uk': '🇺🇦', 'th': '🇹🇭', 'vi': '🇻🇳', 'id': '🇮🇩', 'he': '🇮🇱',
      'fa': '🇮🇷', 'ur': '🇵🇰', 'bn': '🇧🇩', 'ta': '🇮🇳'
    };
    return flags[code] || '🌐';
  }

  getScript(code) {
    const scripts = {
      'ar': 'Arabic', 'fa': 'Arabic', 'ur': 'Arabic',
      'ru': 'Cyrillic', 'bg': 'Cyrillic', 'uk': 'Cyrillic',
      'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean',
      'hi': 'Devanagari', 'bn': 'Bengali', 'ta': 'Tamil',
      'th': 'Thai', 'he': 'Hebrew'
    };
    return scripts[code] || 'Latin';
  }

  getDirection(code) {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(code) ? 'rtl' : 'ltr';
  }

  getLanguageFamily(code) {
    const families = {
      'en': 'Germanic', 'de': 'Germanic', 'nl': 'Germanic', 'sv': 'Germanic', 'da': 'Germanic', 'no': 'Germanic',
      'es': 'Romance', 'fr': 'Romance', 'it': 'Romance', 'pt': 'Romance', 'ro': 'Romance',
      'ru': 'Slavic', 'pl': 'Slavic', 'cs': 'Slavic', 'sk': 'Slavic', 'bg': 'Slavic', 'hr': 'Slavic', 'uk': 'Slavic',
      'ar': 'Semitic', 'he': 'Semitic',
      'hi': 'Indo-Iranian', 'fa': 'Indo-Iranian', 'ur': 'Indo-Iranian', 'bn': 'Indo-Iranian',
      'zh': 'Sino-Tibetan', 'ja': 'Japonic', 'ko': 'Koreanic',
      'th': 'Tai-Kadai', 'vi': 'Austroasiatic', 'id': 'Austronesian',
      'tr': 'Turkic', 'fi': 'Uralic', 'hu': 'Uralic'
    };
    return families[code] || 'Other';
  }

  getAllLanguages() {
    return Array.from(this.supportedLanguages.values());
  }

  getLanguageByCode(code) {
    return this.supportedLanguages.get(code);
  }

  async searchLanguages(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    for (const [code, lang] of this.supportedLanguages) {
      if (
        lang.name.toLowerCase().includes(searchTerm) ||
        lang.nativeName.toLowerCase().includes(searchTerm) ||
        code.includes(searchTerm)
      ) {
        results.push(lang);
      }
    }
    
    return results;
  }
}

const languageService = new LanguageService();
export default languageService;
