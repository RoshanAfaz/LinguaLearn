const express = require('express');
const router = express.Router();
const ISO6391 = require('iso-639-1');

// Supported languages with their codes and names
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish', 
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese (Simplified)',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'uk': 'Ukrainian',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'sw': 'Swahili',
  'he': 'Hebrew',
  'fa': 'Persian',
  'ur': 'Urdu',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'ml': 'Malayalam',
  'kn': 'Kannada',
  'gu': 'Gujarati',
  'pa': 'Punjabi',
  'mr': 'Marathi',
  'ne': 'Nepali',
  'si': 'Sinhala',
  'my': 'Myanmar',
  'km': 'Khmer',
  'lo': 'Lao',
  'ka': 'Georgian',
  'am': 'Amharic',
  'is': 'Icelandic',
  'mt': 'Maltese',
  'cy': 'Welsh',
  'ga': 'Irish',
  'eu': 'Basque',
  'ca': 'Catalan',
  'gl': 'Galician',
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'az': 'Azerbaijani',
  'be': 'Belarusian',
  'bs': 'Bosnian',
  'mk': 'Macedonian',
  'sr': 'Serbian',
  'mn': 'Mongolian',
  'kk': 'Kazakh',
  'ky': 'Kyrgyz',
  'tg': 'Tajik',
  'tk': 'Turkmen',
  'uz': 'Uzbek'
};

// Get all supported languages
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      languages: SUPPORTED_LANGUAGES,
      count: Object.keys(SUPPORTED_LANGUAGES).length
    });
  } catch (error) {
    console.error('Error getting languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get languages',
      message: error.message
    });
  }
});

// Get language info by code
router.get('/:code', (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Language code is required'
      });
    }

    const languageName = SUPPORTED_LANGUAGES[code.toLowerCase()];
    
    if (!languageName) {
      return res.status(404).json({
        success: false,
        error: 'Language not supported',
        code: code
      });
    }

    // Get additional info from ISO6391 if available
    const isoName = ISO6391.getName(code);
    const nativeName = ISO6391.getNativeName(code);

    res.json({
      success: true,
      code: code.toLowerCase(),
      name: languageName,
      iso_name: isoName || languageName,
      native_name: nativeName || languageName,
      supported: true
    });
  } catch (error) {
    console.error('Error getting language info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get language info',
      message: error.message
    });
  }
});

// Get popular languages (most commonly learned)
router.get('/popular/list', (req, res) => {
  try {
    const popularLanguages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese (Simplified)',
      'ar': 'Arabic',
      'hi': 'Hindi'
    };

    res.json({
      success: true,
      languages: popularLanguages,
      count: Object.keys(popularLanguages).length,
      description: 'Most popular languages for learning'
    });
  } catch (error) {
    console.error('Error getting popular languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular languages',
      message: error.message
    });
  }
});

// Search languages by name
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchTerm = query.toLowerCase().trim();
    const results = {};

    // Search in language names
    for (const [code, name] of Object.entries(SUPPORTED_LANGUAGES)) {
      if (name.toLowerCase().includes(searchTerm) || code.toLowerCase().includes(searchTerm)) {
        results[code] = name;
      }
    }

    res.json({
      success: true,
      query: query,
      results: results,
      count: Object.keys(results).length
    });
  } catch (error) {
    console.error('Error searching languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search languages',
      message: error.message
    });
  }
});

// Get language families/groups
router.get('/families/list', (req, res) => {
  try {
    const languageFamilies = {
      'Indo-European': {
        'Germanic': ['en', 'de', 'nl', 'sv', 'da', 'no', 'is'],
        'Romance': ['es', 'fr', 'it', 'pt', 'ro', 'ca', 'gl'],
        'Slavic': ['ru', 'pl', 'cs', 'sk', 'bg', 'hr', 'sr', 'sl', 'uk', 'be', 'bs', 'mk'],
        'Celtic': ['ga', 'cy'],
        'Indo-Iranian': ['hi', 'ur', 'fa', 'bn', 'ta', 'te', 'ml', 'kn', 'gu', 'pa', 'mr', 'ne']
      },
      'Sino-Tibetan': {
        'Chinese': ['zh'],
        'Tibeto-Burman': ['my']
      },
      'Japonic': {
        'Japanese': ['ja']
      },
      'Koreanic': {
        'Korean': ['ko']
      },
      'Afroasiatic': {
        'Semitic': ['ar', 'he', 'am'],
        'Berber': []
      },
      'Niger-Congo': {
        'Bantu': ['sw']
      },
      'Austronesian': {
        'Malayo-Polynesian': ['id', 'ms', 'tl']
      },
      'Turkic': {
        'Turkic': ['tr', 'az', 'kk', 'ky', 'tk', 'uz']
      },
      'Uralic': {
        'Finno-Ugric': ['fi', 'hu', 'et']
      },
      'Tai-Kadai': {
        'Tai': ['th', 'lo']
      },
      'Austroasiatic': {
        'Mon-Khmer': ['vi', 'km']
      },
      'Kartvelian': {
        'Georgian': ['ka']
      },
      'Language Isolates': {
        'Basque': ['eu'],
        'Maltese': ['mt']
      }
    };

    res.json({
      success: true,
      families: languageFamilies,
      description: 'Languages grouped by linguistic families'
    });
  } catch (error) {
    console.error('Error getting language families:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get language families',
      message: error.message
    });
  }
});

module.exports = router;
