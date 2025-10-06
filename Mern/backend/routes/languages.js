const express = require('express');
const router = express.Router();

// Sample languages data (you can move this to a separate file later)
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', nativeName: 'اردو' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵', nativeName: 'नेपाली' },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰', nativeName: 'සිංහල' }
];

// @route   GET /api/languages
// @desc    Get all supported languages
// @access  Public
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching languages'
    });
  }
});

// @route   GET /api/languages/:code
// @desc    Get specific language by code
// @access  Public
router.get('/:code', (req, res) => {
  try {
    const language = languages.find(lang => lang.code === req.params.code);
    
    if (!language) {
      return res.status(404).json({
        success: false,
        message: 'Language not found'
      });
    }

    res.json({
      success: true,
      data: language
    });
  } catch (error) {
    console.error('Get language error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching language'
    });
  }
});

module.exports = router;
