const express = require('express');
const router = express.Router();
const franc = require('franc');
const ISO6391 = require('iso-639-1');
const translate = require('google-translate-api-x');

// Language detection endpoint
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No text provided'
      });
    }

    // Check cache first
    const cacheKey = `detect_${text}`;
    const cached = req.cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Use franc for language detection
    const detected = franc(text);
    let detectedLang = 'en'; // default
    let confidence = 0.5;

    if (detected && detected !== 'und') {
      // Convert franc code to ISO 639-1
      const iso639Code = ISO6391.getCode(ISO6391.getName(detected));
      if (iso639Code) {
        detectedLang = iso639Code;
        confidence = 0.85;
      }
    }

    // Fallback detection based on character patterns
    if (confidence < 0.7) {
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
        'th': /[\u0e00-\u0e7f]/,
        'he': /[\u0590-\u05ff]/,
      };

      for (const [lang, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
          detectedLang = lang;
          confidence = 0.8;
          break;
        }
      }
    }

    const result = {
      success: true,
      detected_language: detectedLang,
      language_name: ISO6391.getName(detectedLang) || 'Unknown',
      confidence: confidence
    };

    // Cache the result
    req.cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Language detection failed',
      message: error.message
    });
  }
});

// Translation endpoint
router.post('/translate', async (req, res) => {
  try {
    const { text, source = 'auto', target = 'en' } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No text provided'
      });
    }

    // Check cache first
    const cacheKey = `translate_${text}_${source}_${target}`;
    const cached = req.cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Use Google Translate API
    const translationResult = await translate(text, { 
      from: source === 'auto' ? 'auto' : source, 
      to: target 
    });

    const result = {
      success: true,
      original_text: text,
      translated_text: translationResult.text,
      source_language: translationResult.from.language.iso || source,
      target_language: target,
      source_language_name: ISO6391.getName(translationResult.from.language.iso) || 'Unknown',
      target_language_name: ISO6391.getName(target) || 'Unknown'
    };

    // Cache the result
    req.cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation failed',
      message: error.message,
      fallback: {
        original_text: req.body.text,
        translated_text: req.body.text, // Return original as fallback
        source_language: req.body.source || 'auto',
        target_language: req.body.target || 'en'
      }
    });
  }
});

// Batch translation endpoint
router.post('/batch', async (req, res) => {
  try {
    const { texts, source = 'auto', target = 'en' } = req.body;
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No texts provided'
      });
    }

    const results = [];
    
    for (const text of texts) {
      if (!text || text.trim().length === 0) {
        results.push({
          original: text,
          translated: text,
          source_language: 'unknown',
          error: 'Empty text'
        });
        continue;
      }

      try {
        // Check cache first
        const cacheKey = `translate_${text}_${source}_${target}`;
        let cached = req.cache.get(cacheKey);
        
        if (cached) {
          results.push({
            original: text,
            translated: cached.translated_text,
            source_language: cached.source_language
          });
        } else {
          const translationResult = await translate(text, { 
            from: source === 'auto' ? 'auto' : source, 
            to: target 
          });

          const result = {
            original: text,
            translated: translationResult.text,
            source_language: translationResult.from.language.iso || source
          };

          results.push(result);

          // Cache individual translation
          req.cache.set(cacheKey, {
            translated_text: translationResult.text,
            source_language: translationResult.from.language.iso || source
          });
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error translating "${text}":`, error);
        results.push({
          original: text,
          translated: text, // Fallback to original
          source_language: 'unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results: results,
      target_language: target,
      target_language_name: ISO6391.getName(target) || 'Unknown'
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch translation failed',
      message: error.message
    });
  }
});

// Word info endpoint (translations to multiple languages)
router.post('/word-info', async (req, res) => {
  try {
    const { word, source = 'auto', targets = ['en', 'es', 'fr', 'de', 'it'] } = req.body;
    
    if (!word || word.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No word provided'
      });
    }

    // Detect source language if auto
    let detectedLang = source;
    if (source === 'auto') {
      const detectResult = await fetch(`${req.protocol}://${req.get('host')}/api/translation/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: word })
      });
      const detectData = await detectResult.json();
      detectedLang = detectData.detected_language || 'en';
    }

    const translations = {};
    
    for (const targetLang of targets) {
      if (targetLang === detectedLang) continue;

      try {
        const cacheKey = `translate_${word}_${detectedLang}_${targetLang}`;
        let cached = req.cache.get(cacheKey);
        
        if (cached) {
          translations[targetLang] = {
            text: cached.translated_text,
            language_name: ISO6391.getName(targetLang) || 'Unknown'
          };
        } else {
          const translationResult = await translate(word, { 
            from: detectedLang, 
            to: targetLang 
          });

          translations[targetLang] = {
            text: translationResult.text,
            language_name: ISO6391.getName(targetLang) || 'Unknown'
          };

          // Cache the result
          req.cache.set(cacheKey, {
            translated_text: translationResult.text
          });
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error translating to ${targetLang}:`, error);
        translations[targetLang] = {
          text: word, // Fallback to original
          language_name: ISO6391.getName(targetLang) || 'Unknown',
          error: error.message
        };
      }
    }

    res.json({
      success: true,
      word: word,
      source_language: detectedLang,
      source_language_name: ISO6391.getName(detectedLang) || 'Unknown',
      translations: translations
    });
  } catch (error) {
    console.error('Word info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get word info',
      message: error.message
    });
  }
});

module.exports = router;
