from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator, single_detection
import json
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supported languages with their codes and names
SUPPORTED_LANGUAGES = {
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
}

@app.route('/api/languages', methods=['GET'])
def get_languages():
    """Get all supported languages"""
    try:
        return jsonify({
            'success': True,
            'languages': SUPPORTED_LANGUAGES
        })
    except Exception as e:
        logger.error(f"Error getting languages: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/detect', methods=['POST'])
def detect_language():
    """Detect the language of input text"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        # Detect language
        detected_lang = single_detection(text, api_key=None)
        
        # Get language name
        lang_name = SUPPORTED_LANGUAGES.get(detected_lang, 'Unknown')
        
        return jsonify({
            'success': True,
            'detected_language': detected_lang,
            'language_name': lang_name,
            'confidence': 0.95  # GoogleTranslator doesn't provide confidence, so we use a default
        })
        
    except Exception as e:
        logger.error(f"Error detecting language: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """Translate text from source language to target language"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        source_lang = data.get('source', 'auto')
        target_lang = data.get('target', 'en')
        
        if not text:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        if target_lang not in SUPPORTED_LANGUAGES:
            return jsonify({
                'success': False,
                'error': f'Target language {target_lang} not supported'
            }), 400
        
        # Create translator
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        
        # Translate text
        translated = translator.translate(text)
        
        # If source was auto, detect the actual source language
        if source_lang == 'auto':
            detected_lang = single_detection(text, api_key=None)
        else:
            detected_lang = source_lang
        
        return jsonify({
            'success': True,
            'original_text': text,
            'translated_text': translated,
            'source_language': detected_lang,
            'target_language': target_lang,
            'source_language_name': SUPPORTED_LANGUAGES.get(detected_lang, 'Unknown'),
            'target_language_name': SUPPORTED_LANGUAGES.get(target_lang, 'Unknown')
        })
        
    except Exception as e:
        logger.error(f"Error translating text: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/translate-batch', methods=['POST'])
def translate_batch():
    """Translate multiple texts at once"""
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        source_lang = data.get('source', 'auto')
        target_lang = data.get('target', 'en')
        
        if not texts:
            return jsonify({
                'success': False,
                'error': 'No texts provided'
            }), 400
        
        if target_lang not in SUPPORTED_LANGUAGES:
            return jsonify({
                'success': False,
                'error': f'Target language {target_lang} not supported'
            }), 400
        
        # Create translator
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        
        results = []
        for text in texts:
            if text.strip():
                try:
                    translated = translator.translate(text.strip())
                    if source_lang == 'auto':
                        detected_lang = single_detection(text.strip(), api_key=None)
                    else:
                        detected_lang = source_lang
                    
                    results.append({
                        'original': text.strip(),
                        'translated': translated,
                        'source_language': detected_lang
                    })
                except Exception as e:
                    logger.error(f"Error translating '{text}': {str(e)}")
                    results.append({
                        'original': text.strip(),
                        'translated': text.strip(),  # Fallback to original
                        'source_language': 'unknown',
                        'error': str(e)
                    })
        
        return jsonify({
            'success': True,
            'results': results,
            'target_language': target_lang,
            'target_language_name': SUPPORTED_LANGUAGES.get(target_lang, 'Unknown')
        })
        
    except Exception as e:
        logger.error(f"Error in batch translation: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/word-info', methods=['POST'])
def get_word_info():
    """Get comprehensive information about a word including translations to multiple languages"""
    try:
        data = request.get_json()
        word = data.get('word', '').strip()
        source_lang = data.get('source', 'auto')
        target_languages = data.get('targets', ['en', 'es', 'fr', 'de', 'it'])
        
        if not word:
            return jsonify({
                'success': False,
                'error': 'No word provided'
            }), 400
        
        # Detect source language if auto
        if source_lang == 'auto':
            detected_lang = single_detection(word, api_key=None)
        else:
            detected_lang = source_lang
        
        translations = {}
        for target_lang in target_languages:
            if target_lang != detected_lang and target_lang in SUPPORTED_LANGUAGES:
                try:
                    translator = GoogleTranslator(source=detected_lang, target=target_lang)
                    translation = translator.translate(word)
                    translations[target_lang] = {
                        'text': translation,
                        'language_name': SUPPORTED_LANGUAGES[target_lang]
                    }
                except Exception as e:
                    logger.error(f"Error translating to {target_lang}: {str(e)}")
                    translations[target_lang] = {
                        'text': word,  # Fallback
                        'language_name': SUPPORTED_LANGUAGES[target_lang],
                        'error': str(e)
                    }
        
        return jsonify({
            'success': True,
            'word': word,
            'source_language': detected_lang,
            'source_language_name': SUPPORTED_LANGUAGES.get(detected_lang, 'Unknown'),
            'translations': translations
        })
        
    except Exception as e:
        logger.error(f"Error getting word info: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Language Translation API',
        'supported_languages': len(SUPPORTED_LANGUAGES)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
