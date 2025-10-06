const express = require('express');
const router = express.Router();
const translate = require('translate-google');

// Simple rate limiting to prevent too many requests
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per minute (increased)
const RATE_WINDOW = 60 * 1000; // 1 minute

const rateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }

  const clientData = requestCounts.get(clientIP);

  if (now > clientData.resetTime) {
    // Reset the count
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }

  if (clientData.count >= RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a moment before trying again.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }

  clientData.count++;
  next();
};

// Advanced translation function for words not in dictionary
const tryAdvancedTranslation = async (text, from, to) => {
  try {
    // Simple pattern-based translations for common word types
    const patterns = {
      // Plurals
      's$': (word, targetLang) => {
        const singular = word.slice(0, -1);
        const singularTranslation = translationDictionary[singular]?.[targetLang];
        if (singularTranslation) {
          // Add simple plural rules
          const pluralRules = {
            'es': singularTranslation + 's',
            'fr': singularTranslation + 's',
            'de': singularTranslation + 'e',
            'it': singularTranslation + 'i',
            'pt': singularTranslation + 's'
          };
          return pluralRules[targetLang] || singularTranslation + 's';
        }
        return null;
      },

      // Past tense (-ed)
      'ed$': (word, targetLang) => {
        const base = word.slice(0, -2);
        const baseTranslation = translationDictionary[base]?.[targetLang];
        if (baseTranslation) {
          // Simple past tense rules
          const pastRules = {
            'es': baseTranslation + 'ó',
            'fr': baseTranslation + 'é',
            'de': baseTranslation + 'te',
            'it': baseTranslation + 'ò',
            'pt': baseTranslation + 'ou'
          };
          return pastRules[targetLang] || baseTranslation + 'ed';
        }
        return null;
      }
    };

    const lowerText = text.toLowerCase();

    // Try pattern matching
    for (const [pattern, handler] of Object.entries(patterns)) {
      const regex = new RegExp(pattern);
      if (regex.test(lowerText)) {
        const result = handler(lowerText, to);
        if (result) return result;
      }
    }

    return null;
  } catch (error) {
    console.error('Advanced translation error:', error);
    return null;
  }
};

// Simple translation dictionary for common words
const translationDictionary = {
  // English to other languages
  'hello': {
    'es': 'hola', 'fr': 'bonjour', 'de': 'hallo', 'it': 'ciao', 'pt': 'olá',
    'ru': 'привет', 'ja': 'こんにちは', 'ko': '안녕하세요', 'zh': '你好', 'ar': 'مرحبا',
    'hi': 'नमस्ते', 'bn': 'হ্যালো', 'te': 'హలో', 'ta': 'வணக்கம்', 'gu': 'હેલો',
    'kn': 'ಹಲೋ', 'ml': 'ഹലോ', 'pa': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'ur': 'ہیلو'
  },
  'goodbye': {
    'es': 'adiós', 'fr': 'au revoir', 'de': 'auf wiedersehen', 'it': 'ciao', 'pt': 'tchau',
    'ru': 'до свидания', 'ja': 'さようなら', 'ko': '안녕히 가세요', 'zh': '再见', 'ar': 'وداعا',
    'hi': 'अलविदा', 'bn': 'বিদায়', 'te': 'వీడ్కోలు', 'ta': 'பிரியாவிடை', 'gu': 'વિદાય'
  },
  'thank you': {
    'es': 'gracias', 'fr': 'merci', 'de': 'danke', 'it': 'grazie', 'pt': 'obrigado',
    'ru': 'спасибо', 'ja': 'ありがとう', 'ko': '감사합니다', 'zh': '谢谢', 'ar': 'شكرا',
    'hi': 'धन्यवाद', 'bn': 'ধন্যবাদ', 'te': 'ధన్యవాదాలు', 'ta': 'நன்றி', 'gu': 'આભાર'
  },
  'yes': {
    'es': 'sí', 'fr': 'oui', 'de': 'ja', 'it': 'sì', 'pt': 'sim',
    'ru': 'да', 'ja': 'はい', 'ko': '네', 'zh': '是', 'ar': 'نعم',
    'hi': 'हाँ', 'bn': 'হ্যাঁ', 'te': 'అవును', 'ta': 'ஆம்', 'gu': 'હા'
  },
  'no': {
    'es': 'no', 'fr': 'non', 'de': 'nein', 'it': 'no', 'pt': 'não',
    'ru': 'нет', 'ja': 'いいえ', 'ko': '아니요', 'zh': '不', 'ar': 'لا',
    'hi': 'नहीं', 'bn': 'না', 'te': 'లేదు', 'ta': 'இல்லை', 'gu': 'ના'
  },
  'please': {
    'es': 'por favor', 'fr': 's\'il vous plaît', 'de': 'bitte', 'it': 'per favore', 'pt': 'por favor',
    'ru': 'пожалуйста', 'ja': 'お願いします', 'ko': '제발', 'zh': '请', 'ar': 'من فضلك',
    'hi': 'कृपया', 'bn': 'দয়া করে', 'te': 'దయచేసి', 'ta': 'தயவுசெய்து', 'gu': 'કૃપા કરીને'
  },
  'water': {
    'es': 'agua', 'fr': 'eau', 'de': 'wasser', 'it': 'acqua', 'pt': 'água',
    'ru': 'вода', 'ja': '水', 'ko': '물', 'zh': '水', 'ar': 'ماء',
    'hi': 'पानी', 'bn': 'পানি', 'te': 'నీరు', 'ta': 'தண்ணீர்', 'gu': 'પાણી'
  },
  'food': {
    'es': 'comida', 'fr': 'nourriture', 'de': 'essen', 'it': 'cibo', 'pt': 'comida',
    'ru': 'еда', 'ja': '食べ物', 'ko': '음식', 'zh': '食物', 'ar': 'طعام',
    'hi': 'भोजन', 'bn': 'খাবার', 'te': 'ఆహారం', 'ta': 'உணவு', 'gu': 'ખોરાક'
  },
  'love': {
    'es': 'amor', 'fr': 'amour', 'de': 'liebe', 'it': 'amore', 'pt': 'amor',
    'ru': 'любовь', 'ja': '愛', 'ko': '사랑', 'zh': '爱', 'ar': 'حب',
    'hi': 'प्रेम', 'bn': 'ভালোবাসা', 'te': 'ప్రేమ', 'ta': 'காதல்', 'gu': 'પ્રેમ'
  },
  'friend': {
    'es': 'amigo', 'fr': 'ami', 'de': 'freund', 'it': 'amico', 'pt': 'amigo',
    'ru': 'друг', 'ja': '友達', 'ko': '친구', 'zh': '朋友', 'ar': 'صديق',
    'hi': 'मित्र', 'bn': 'বন্ধু', 'te': 'స్నేహితుడు', 'ta': 'நண்பன்', 'gu': 'મિત્ર'
  },
  'family': {
    'es': 'familia', 'fr': 'famille', 'de': 'familie', 'it': 'famiglia', 'pt': 'família',
    'ru': 'семья', 'ja': '家族', 'ko': '가족', 'zh': '家庭', 'ar': 'عائلة',
    'hi': 'परिवार', 'bn': 'পরিবার', 'te': 'కుటుంబం', 'ta': 'குடும்பம்', 'gu': 'કુટુંબ'
  },
  'house': {
    'es': 'casa', 'fr': 'maison', 'de': 'haus', 'it': 'casa', 'pt': 'casa',
    'ru': 'дом', 'ja': '家', 'ko': '집', 'zh': '房子', 'ar': 'منزل',
    'hi': 'घर', 'bn': 'ঘর', 'te': 'ఇల్లు', 'ta': 'வீடு', 'gu': 'ઘર'
  },
  'school': {
    'es': 'escuela', 'fr': 'école', 'de': 'schule', 'it': 'scuola', 'pt': 'escola',
    'ru': 'школа', 'ja': '学校', 'ko': '학교', 'zh': '学校', 'ar': 'مدرسة',
    'hi': 'स्कूल', 'bn': 'স্কুল', 'te': 'పాఠశాల', 'ta': 'பள்ளி', 'gu': 'શાળા'
  },
  'book': {
    'es': 'libro', 'fr': 'livre', 'de': 'buch', 'it': 'libro', 'pt': 'livro',
    'ru': 'книга', 'ja': '本', 'ko': '책', 'zh': '书', 'ar': 'كتاب',
    'hi': 'किताब', 'bn': 'বই', 'te': 'పుస్తకం', 'ta': 'புத்தகம்', 'gu': 'પુસ્તક'
  },
  'time': {
    'es': 'tiempo', 'fr': 'temps', 'de': 'zeit', 'it': 'tempo', 'pt': 'tempo',
    'ru': 'время', 'ja': '時間', 'ko': '시간', 'zh': '时间', 'ar': 'وقت',
    'hi': 'समय', 'bn': 'সময়', 'te': 'సమయం', 'ta': 'நேரம்', 'gu': 'સમય'
  },
  'money': {
    'es': 'dinero', 'fr': 'argent', 'de': 'geld', 'it': 'soldi', 'pt': 'dinheiro',
    'ru': 'деньги', 'ja': 'お金', 'ko': '돈', 'zh': '钱', 'ar': 'مال',
    'hi': 'पैसा', 'bn': 'টাকা', 'te': 'డబ్బు', 'ta': 'பணம்', 'gu': 'પૈસા'
  },
  // UNIVERSE OF WORDS EXPANSION! 🌌
  'word': {
    'es': 'palabra', 'fr': 'mot', 'de': 'wort', 'it': 'parola', 'pt': 'palavra',
    'ru': 'слово', 'ja': '言葉', 'ko': '단어', 'zh': '词', 'ar': 'كلمة',
    'hi': 'शब्द', 'bn': 'শব্দ', 'te': 'పదం', 'ta': 'வார்த்தை', 'gu': 'શબ્દ'
  },
  'language': {
    'es': 'idioma', 'fr': 'langue', 'de': 'sprache', 'it': 'lingua', 'pt': 'idioma',
    'ru': 'язык', 'ja': '言語', 'ko': '언어', 'zh': '语言', 'ar': 'لغة',
    'hi': 'भाषा', 'bn': 'ভাষা', 'te': 'భాష', 'ta': 'மொழி', 'gu': 'ભાષા'
  },
  'translate': {
    'es': 'traducir', 'fr': 'traduire', 'de': 'übersetzen', 'it': 'tradurre', 'pt': 'traduzir',
    'ru': 'переводить', 'ja': '翻訳する', 'ko': '번역하다', 'zh': '翻译', 'ar': 'ترجم',
    'hi': 'अनुवाद करना', 'bn': 'অনুবাদ করা', 'te': 'అనువదించు', 'ta': 'மொழிபெயர்', 'gu': 'અનુવાદ કરો'
  },
  'learn': {
    'es': 'aprender', 'fr': 'apprendre', 'de': 'lernen', 'it': 'imparare', 'pt': 'aprender',
    'ru': 'учиться', 'ja': '学ぶ', 'ko': '배우다', 'zh': '学习', 'ar': 'تعلم',
    'hi': 'सीखना', 'bn': 'শেখা', 'te': 'నేర్చుకో', 'ta': 'கற்று', 'gu': 'શીખો'
  },
  'study': {
    'es': 'estudiar', 'fr': 'étudier', 'de': 'studieren', 'it': 'studiare', 'pt': 'estudar',
    'ru': 'изучать', 'ja': '勉強する', 'ko': '공부하다', 'zh': '学习', 'ar': 'دراسة',
    'hi': 'अध्ययन', 'bn': 'অধ্যয়ন', 'te': 'అధ్యయనం', 'ta': 'படிப்பு', 'gu': 'અભ્યાસ'
  },
  'teacher': {
    'es': 'maestro', 'fr': 'professeur', 'de': 'lehrer', 'it': 'insegnante', 'pt': 'professor',
    'ru': 'учитель', 'ja': '先生', 'ko': '선생님', 'zh': '老师', 'ar': 'معلم',
    'hi': 'शिक्षक', 'bn': 'শিক্ষক', 'te': 'ఉపాధ్యాయుడు', 'ta': 'ஆசிரியர்', 'gu': 'શિક્ષક'
  },
  'student': {
    'es': 'estudiante', 'fr': 'étudiant', 'de': 'student', 'it': 'studente', 'pt': 'estudante',
    'ru': 'студент', 'ja': '学生', 'ko': '학생', 'zh': '学生', 'ar': 'طالب',
    'hi': 'छात्र', 'bn': 'ছাত্র', 'te': 'విద్యార్థి', 'ta': 'மாணவர்', 'gu': 'વિદ્યાર્થી'
  },
  'computer': {
    'es': 'computadora', 'fr': 'ordinateur', 'de': 'computer', 'it': 'computer', 'pt': 'computador',
    'ru': 'компьютер', 'ja': 'コンピューター', 'ko': '컴퓨터', 'zh': '电脑', 'ar': 'حاسوب',
    'hi': 'कंप्यूटर', 'bn': 'কম্পিউটার', 'te': 'కంప్యూటర్', 'ta': 'கணினி', 'gu': 'કમ્પ્યુટર'
  },
  'internet': {
    'es': 'internet', 'fr': 'internet', 'de': 'internet', 'it': 'internet', 'pt': 'internet',
    'ru': 'интернет', 'ja': 'インターネット', 'ko': '인터넷', 'zh': '互联网', 'ar': 'إنترنت',
    'hi': 'इंटरनेट', 'bn': 'ইন্টারনেট', 'te': 'ఇంటర్నెట్', 'ta': 'இணையம்', 'gu': 'ઇન્ટરનેટ'
  },
  'phone': {
    'es': 'teléfono', 'fr': 'téléphone', 'de': 'telefon', 'it': 'telefono', 'pt': 'telefone',
    'ru': 'телефон', 'ja': '電話', 'ko': '전화', 'zh': '电话', 'ar': 'هاتف',
    'hi': 'फोन', 'bn': 'ফোন', 'te': 'ఫోన్', 'ta': 'தொலைபேசி', 'gu': 'ફોન'
  },
  'car': {
    'es': 'coche', 'fr': 'voiture', 'de': 'auto', 'it': 'macchina', 'pt': 'carro',
    'ru': 'машина', 'ja': '車', 'ko': '차', 'zh': '汽车', 'ar': 'سيارة',
    'hi': 'कार', 'bn': 'গাড়ি', 'te': 'కారు', 'ta': 'கார்', 'gu': 'કાર'
  },
  'train': {
    'es': 'tren', 'fr': 'train', 'de': 'zug', 'it': 'treno', 'pt': 'trem',
    'ru': 'поезд', 'ja': '電車', 'ko': '기차', 'zh': '火车', 'ar': 'قطار',
    'hi': 'ट्रेन', 'bn': 'ট্রেন', 'te': 'రైలు', 'ta': 'ரயில்', 'gu': 'ટ્રેન'
  },
  'airplane': {
    'es': 'avión', 'fr': 'avion', 'de': 'flugzeug', 'it': 'aereo', 'pt': 'avião',
    'ru': 'самолет', 'ja': '飛行機', 'ko': '비행기', 'zh': '飞机', 'ar': 'طائرة',
    'hi': 'हवाई जहाज', 'bn': 'বিমান', 'te': 'విమానం', 'ta': 'விமானம்', 'gu': 'વિમાન'
  },
  'city': {
    'es': 'ciudad', 'fr': 'ville', 'de': 'stadt', 'it': 'città', 'pt': 'cidade',
    'ru': 'город', 'ja': '都市', 'ko': '도시', 'zh': '城市', 'ar': 'مدينة',
    'hi': 'शहर', 'bn': 'শহর', 'te': 'నగరం', 'ta': 'நகரம்', 'gu': 'શહેર'
  },
  'country': {
    'es': 'país', 'fr': 'pays', 'de': 'land', 'it': 'paese', 'pt': 'país',
    'ru': 'страна', 'ja': '国', 'ko': '나라', 'zh': '国家', 'ar': 'بلد',
    'hi': 'देश', 'bn': 'দেশ', 'te': 'దేశం', 'ta': 'நாடு', 'gu': 'દેશ'
  },
  'world': {
    'es': 'mundo', 'fr': 'monde', 'de': 'welt', 'it': 'mondo', 'pt': 'mundo',
    'ru': 'мир', 'ja': '世界', 'ko': '세계', 'zh': '世界', 'ar': 'عالم',
    'hi': 'दुनिया', 'bn': 'বিশ্ব', 'te': 'ప్రపంచం', 'ta': 'உலகம்', 'gu': 'વિશ્વ'
  },
  'universe': {
    'es': 'universo', 'fr': 'univers', 'de': 'universum', 'it': 'universo', 'pt': 'universo',
    'ru': 'вселенная', 'ja': '宇宙', 'ko': '우주', 'zh': '宇宙', 'ar': 'كون',
    'hi': 'ब्रह्मांड', 'bn': 'মহাবিশ্ব', 'te': 'విశ్వం', 'ta': 'பிரபஞ்சம்', 'gu': 'બ્રહ્માંડ'
  },
  // COLORS 🌈
  'red': {
    'es': 'rojo', 'fr': 'rouge', 'de': 'rot', 'it': 'rosso', 'pt': 'vermelho',
    'ru': 'красный', 'ja': '赤', 'ko': '빨간색', 'zh': '红色', 'ar': 'أحمر',
    'hi': 'लाल', 'bn': 'লাল', 'te': 'ఎరుపు', 'ta': 'சிவப்பு', 'gu': 'લાલ'
  },
  'blue': {
    'es': 'azul', 'fr': 'bleu', 'de': 'blau', 'it': 'blu', 'pt': 'azul',
    'ru': 'синий', 'ja': '青', 'ko': '파란색', 'zh': '蓝色', 'ar': 'أزرق',
    'hi': 'नीला', 'bn': 'নীল', 'te': 'నీలం', 'ta': 'நீலம்', 'gu': 'વાદળી'
  },
  'green': {
    'es': 'verde', 'fr': 'vert', 'de': 'grün', 'it': 'verde', 'pt': 'verde',
    'ru': 'зеленый', 'ja': '緑', 'ko': '초록색', 'zh': '绿色', 'ar': 'أخضر',
    'hi': 'हरा', 'bn': 'সবুজ', 'te': 'ఆకుపచ్చ', 'ta': 'பச்சை', 'gu': 'લીલો'
  },
  'yellow': {
    'es': 'amarillo', 'fr': 'jaune', 'de': 'gelb', 'it': 'giallo', 'pt': 'amarelo',
    'ru': 'желтый', 'ja': '黄色', 'ko': '노란색', 'zh': '黄色', 'ar': 'أصفر',
    'hi': 'पीला', 'bn': 'হলুদ', 'te': 'పసుపు', 'ta': 'மஞ்சள்', 'gu': 'પીળો'
  },
  'black': {
    'es': 'negro', 'fr': 'noir', 'de': 'schwarz', 'it': 'nero', 'pt': 'preto',
    'ru': 'черный', 'ja': '黒', 'ko': '검은색', 'zh': '黑色', 'ar': 'أسود',
    'hi': 'काला', 'bn': 'কালো', 'te': 'నలుపు', 'ta': 'கருப்பு', 'gu': 'કાળો'
  },
  'white': {
    'es': 'blanco', 'fr': 'blanc', 'de': 'weiß', 'it': 'bianco', 'pt': 'branco',
    'ru': 'белый', 'ja': '白', 'ko': '흰색', 'zh': '白色', 'ar': 'أبيض',
    'hi': 'सफेद', 'bn': 'সাদা', 'te': 'తెలుపు', 'ta': 'வெள்ளை', 'gu': 'સફેદ'
  },
  // NUMBERS 🔢
  'one': {
    'es': 'uno', 'fr': 'un', 'de': 'eins', 'it': 'uno', 'pt': 'um',
    'ru': 'один', 'ja': '一', 'ko': '하나', 'zh': '一', 'ar': 'واحد',
    'hi': 'एक', 'bn': 'এক', 'te': 'ఒకటి', 'ta': 'ஒன்று', 'gu': 'એક'
  },
  'two': {
    'es': 'dos', 'fr': 'deux', 'de': 'zwei', 'it': 'due', 'pt': 'dois',
    'ru': 'два', 'ja': '二', 'ko': '둘', 'zh': '二', 'ar': 'اثنان',
    'hi': 'दो', 'bn': 'দুই', 'te': 'రెండు', 'ta': 'இரண்டு', 'gu': 'બે'
  },
  'three': {
    'es': 'tres', 'fr': 'trois', 'de': 'drei', 'it': 'tre', 'pt': 'três',
    'ru': 'три', 'ja': '三', 'ko': '셋', 'zh': '三', 'ar': 'ثلاثة',
    'hi': 'तीन', 'bn': 'তিন', 'te': 'మూడు', 'ta': 'மூன்று', 'gu': 'ત્રણ'
  },
  // BODY PARTS 👤
  'head': {
    'es': 'cabeza', 'fr': 'tête', 'de': 'kopf', 'it': 'testa', 'pt': 'cabeça',
    'ru': 'голова', 'ja': '頭', 'ko': '머리', 'zh': '头', 'ar': 'رأس',
    'hi': 'सिर', 'bn': 'মাথা', 'te': 'తల', 'ta': 'தலை', 'gu': 'માથું'
  },
  'eye': {
    'es': 'ojo', 'fr': 'œil', 'de': 'auge', 'it': 'occhio', 'pt': 'olho',
    'ru': 'глаз', 'ja': '目', 'ko': '눈', 'zh': '眼睛', 'ar': 'عين',
    'hi': 'आंख', 'bn': 'চোখ', 'te': 'కన్ను', 'ta': 'கண்', 'gu': 'આંખ'
  },
  'hand': {
    'es': 'mano', 'fr': 'main', 'de': 'hand', 'it': 'mano', 'pt': 'mão',
    'ru': 'рука', 'ja': '手', 'ko': '손', 'zh': '手', 'ar': 'يد',
    'hi': 'हाथ', 'bn': 'হাত', 'te': 'చేయి', 'ta': 'கை', 'gu': 'હાથ'
  },
  // EMOTIONS 😊
  'happy': {
    'es': 'feliz', 'fr': 'heureux', 'de': 'glücklich', 'it': 'felice', 'pt': 'feliz',
    'ru': 'счастливый', 'ja': '幸せ', 'ko': '행복한', 'zh': '快乐', 'ar': 'سعيد',
    'hi': 'खुश', 'bn': 'খুশি', 'te': 'సంతోషం', 'ta': 'மகிழ்ச்சி', 'gu': 'ખુશ'
  },
  'sad': {
    'es': 'triste', 'fr': 'triste', 'de': 'traurig', 'it': 'triste', 'pt': 'triste',
    'ru': 'грустный', 'ja': '悲しい', 'ko': '슬픈', 'zh': '悲伤', 'ar': 'حزين',
    'hi': 'उदास', 'bn': 'দুঃখিত', 'te': 'దుఃఖం', 'ta': 'சோகம்', 'gu': 'દુઃખી'
  },
  'angry': {
    'es': 'enojado', 'fr': 'en colère', 'de': 'wütend', 'it': 'arrabbiato', 'pt': 'zangado',
    'ru': 'злой', 'ja': '怒っている', 'ko': '화난', 'zh': '生气', 'ar': 'غاضب',
    'hi': 'गुस्सा', 'bn': 'রাগান্বিত', 'te': 'కోపం', 'ta': 'கோபம்', 'gu': 'ગુસ્સે'
  },
  // ANIMALS 🐾
  'cat': {
    'es': 'gato', 'fr': 'chat', 'de': 'katze', 'it': 'gatto', 'pt': 'gato',
    'ru': 'кот', 'ja': '猫', 'ko': '고양이', 'zh': '猫', 'ar': 'قطة',
    'hi': 'बिल्ली', 'bn': 'বিড়াল', 'te': 'పిల్లి', 'ta': 'பூனை', 'gu': 'બિલાડી'
  },
  'dog': {
    'es': 'perro', 'fr': 'chien', 'de': 'hund', 'it': 'cane', 'pt': 'cachorro',
    'ru': 'собака', 'ja': '犬', 'ko': '개', 'zh': '狗', 'ar': 'كلب',
    'hi': 'कुत्ता', 'bn': 'কুকুর', 'te': 'కుక్క', 'ta': 'நாய்', 'gu': 'કૂતરો'
  },
  'bird': {
    'es': 'pájaro', 'fr': 'oiseau', 'de': 'vogel', 'it': 'uccello', 'pt': 'pássaro',
    'ru': 'птица', 'ja': '鳥', 'ko': '새', 'zh': '鸟', 'ar': 'طائر',
    'hi': 'पक्षी', 'bn': 'পাখি', 'te': 'పక్షి', 'ta': 'பறவை', 'gu': 'પક્ષી'
  },
  'fish': {
    'es': 'pez', 'fr': 'poisson', 'de': 'fisch', 'it': 'pesce', 'pt': 'peixe',
    'ru': 'рыба', 'ja': '魚', 'ko': '물고기', 'zh': '鱼', 'ar': 'سمك',
    'hi': 'मछली', 'bn': 'মাছ', 'te': 'చేప', 'ta': 'மீன்', 'gu': 'માછલી'
  },
  'horse': {
    'es': 'caballo', 'fr': 'cheval', 'de': 'pferd', 'it': 'cavallo', 'pt': 'cavalo',
    'ru': 'лошадь', 'ja': '馬', 'ko': '말', 'zh': '马', 'ar': 'حصان',
    'hi': 'घोड़ा', 'bn': 'ঘোড়া', 'te': 'గుర్రం', 'ta': 'குதிரை', 'gu': 'ઘોડો'
  },
  'elephant': {
    'es': 'elefante', 'fr': 'éléphant', 'de': 'elefant', 'it': 'elefante', 'pt': 'elefante',
    'ru': 'слон', 'ja': '象', 'ko': '코끼리', 'zh': '大象', 'ar': 'فيل',
    'hi': 'हाथी', 'bn': 'হাতি', 'te': 'ఏనుగు', 'ta': 'யானை', 'gu': 'હાથી'
  },
  'lion': {
    'es': 'león', 'fr': 'lion', 'de': 'löwe', 'it': 'leone', 'pt': 'leão',
    'ru': 'лев', 'ja': 'ライオン', 'ko': '사자', 'zh': '狮子', 'ar': 'أسد',
    'hi': 'शेर', 'bn': 'সিংহ', 'te': 'సింహం', 'ta': 'சிங்கம்', 'gu': 'સિંહ'
  },
  // FOOD & DRINKS 🍕
  'bread': {
    'es': 'pan', 'fr': 'pain', 'de': 'brot', 'it': 'pane', 'pt': 'pão',
    'ru': 'хлеб', 'ja': 'パン', 'ko': '빵', 'zh': '面包', 'ar': 'خبز',
    'hi': 'रोटी', 'bn': 'রুটি', 'te': 'రొట్టె', 'ta': 'ரொட்டி', 'gu': 'રોટલી'
  },
  'rice': {
    'es': 'arroz', 'fr': 'riz', 'de': 'reis', 'it': 'riso', 'pt': 'arroz',
    'ru': 'рис', 'ja': '米', 'ko': '쌀', 'zh': '米饭', 'ar': 'أرز',
    'hi': 'चावल', 'bn': 'ভাত', 'te': 'అన్నం', 'ta': 'அரிசி', 'gu': 'ચોખા'
  },
  'milk': {
    'es': 'leche', 'fr': 'lait', 'de': 'milch', 'it': 'latte', 'pt': 'leite',
    'ru': 'молоко', 'ja': '牛乳', 'ko': '우유', 'zh': '牛奶', 'ar': 'حليب',
    'hi': 'दूध', 'bn': 'দুধ', 'te': 'పాలు', 'ta': 'பால்', 'gu': 'દૂધ'
  },
  'coffee': {
    'es': 'café', 'fr': 'café', 'de': 'kaffee', 'it': 'caffè', 'pt': 'café',
    'ru': 'кофе', 'ja': 'コーヒー', 'ko': '커피', 'zh': '咖啡', 'ar': 'قهوة',
    'hi': 'कॉफी', 'bn': 'কফি', 'te': 'కాఫీ', 'ta': 'காபி', 'gu': 'કોફી'
  },
  'tea': {
    'es': 'té', 'fr': 'thé', 'de': 'tee', 'it': 'tè', 'pt': 'chá',
    'ru': 'чай', 'ja': '茶', 'ko': '차', 'zh': '茶', 'ar': 'شاي',
    'hi': 'चाय', 'bn': 'চা', 'te': 'టీ', 'ta': 'தேநீர்', 'gu': 'ચા'
  },
  'fruit': {
    'es': 'fruta', 'fr': 'fruit', 'de': 'frucht', 'it': 'frutta', 'pt': 'fruta',
    'ru': 'фрукт', 'ja': '果物', 'ko': '과일', 'zh': '水果', 'ar': 'فاكهة',
    'hi': 'फल', 'bn': 'ফল', 'te': 'పండు', 'ta': 'பழம்', 'gu': 'ફળ'
  },
  'apple': {
    'es': 'manzana', 'fr': 'pomme', 'de': 'apfel', 'it': 'mela', 'pt': 'maçã',
    'ru': 'яблоко', 'ja': 'りんご', 'ko': '사과', 'zh': '苹果', 'ar': 'تفاحة',
    'hi': 'सेब', 'bn': 'আপেল', 'te': 'ఆపిల్', 'ta': 'ஆப்பிள்', 'gu': 'સફરજન'
  },
  'banana': {
    'es': 'plátano', 'fr': 'banane', 'de': 'banane', 'it': 'banana', 'pt': 'banana',
    'ru': 'банан', 'ja': 'バナナ', 'ko': '바나나', 'zh': '香蕉', 'ar': 'موز',
    'hi': 'केला', 'bn': 'কলা', 'te': 'అరటిపండు', 'ta': 'வாழைப்பழம்', 'gu': 'કેળું'
  },
  // WEATHER & NATURE 🌤️
  'sun': {
    'es': 'sol', 'fr': 'soleil', 'de': 'sonne', 'it': 'sole', 'pt': 'sol',
    'ru': 'солнце', 'ja': '太陽', 'ko': '태양', 'zh': '太阳', 'ar': 'شمس',
    'hi': 'सूरज', 'bn': 'সূর্য', 'te': 'సూర్యుడు', 'ta': 'சூரியன்', 'gu': 'સૂર્ય'
  },
  'moon': {
    'es': 'luna', 'fr': 'lune', 'de': 'mond', 'it': 'luna', 'pt': 'lua',
    'ru': 'луна', 'ja': '月', 'ko': '달', 'zh': '月亮', 'ar': 'قمر',
    'hi': 'चांद', 'bn': 'চাঁদ', 'te': 'చంద్రుడు', 'ta': 'சந்திரன்', 'gu': 'ચંદ્ર'
  },
  'star': {
    'es': 'estrella', 'fr': 'étoile', 'de': 'stern', 'it': 'stella', 'pt': 'estrela',
    'ru': 'звезда', 'ja': '星', 'ko': '별', 'zh': '星星', 'ar': 'نجمة',
    'hi': 'तारा', 'bn': 'তারা', 'te': 'నక్షత్రం', 'ta': 'நட்சத்திரம்', 'gu': 'તારો'
  },
  'rain': {
    'es': 'lluvia', 'fr': 'pluie', 'de': 'regen', 'it': 'pioggia', 'pt': 'chuva',
    'ru': 'дождь', 'ja': '雨', 'ko': '비', 'zh': '雨', 'ar': 'مطر',
    'hi': 'बारिश', 'bn': 'বৃষ্টি', 'te': 'వర్షం', 'ta': 'மழை', 'gu': 'વરસાદ'
  },
  'snow': {
    'es': 'nieve', 'fr': 'neige', 'de': 'schnee', 'it': 'neve', 'pt': 'neve',
    'ru': 'снег', 'ja': '雪', 'ko': '눈', 'zh': '雪', 'ar': 'ثلج',
    'hi': 'बर्फ', 'bn': 'বরফ', 'te': 'మంచు', 'ta': 'பனி', 'gu': 'બરફ'
  },
  'wind': {
    'es': 'viento', 'fr': 'vent', 'de': 'wind', 'it': 'vento', 'pt': 'vento',
    'ru': 'ветер', 'ja': '風', 'ko': '바람', 'zh': '风', 'ar': 'رياح',
    'hi': 'हवा', 'bn': 'বাতাস', 'te': 'గాలి', 'ta': 'காற்று', 'gu': 'પવન'
  },
  'fire': {
    'es': 'fuego', 'fr': 'feu', 'de': 'feuer', 'it': 'fuoco', 'pt': 'fogo',
    'ru': 'огонь', 'ja': '火', 'ko': '불', 'zh': '火', 'ar': 'نار',
    'hi': 'आग', 'bn': 'আগুন', 'te': 'అగ్ని', 'ta': 'நெருப்பு', 'gu': 'આગ'
  },
  'earth': {
    'es': 'tierra', 'fr': 'terre', 'de': 'erde', 'it': 'terra', 'pt': 'terra',
    'ru': 'земля', 'ja': '地球', 'ko': '지구', 'zh': '地球', 'ar': 'أرض',
    'hi': 'पृथ्वी', 'bn': 'পৃথিবী', 'te': 'భూమి', 'ta': 'பூமி', 'gu': 'પૃથ્વી'
  },
  'tree': {
    'es': 'árbol', 'fr': 'arbre', 'de': 'baum', 'it': 'albero', 'pt': 'árvore',
    'ru': 'дерево', 'ja': '木', 'ko': '나무', 'zh': '树', 'ar': 'شجرة',
    'hi': 'पेड़', 'bn': 'গাছ', 'te': 'చెట్టు', 'ta': 'மரம்', 'gu': 'વૃક્ષ'
  },
  'flower': {
    'es': 'flor', 'fr': 'fleur', 'de': 'blume', 'it': 'fiore', 'pt': 'flor',
    'ru': 'цветок', 'ja': '花', 'ko': '꽃', 'zh': '花', 'ar': 'زهرة',
    'hi': 'फूल', 'bn': 'ফুল', 'te': 'పువ్వు', 'ta': 'பூ', 'gu': 'ફૂલ'
  },
  // CLOTHING 👕
  'shirt': {
    'es': 'camisa', 'fr': 'chemise', 'de': 'hemd', 'it': 'camicia', 'pt': 'camisa',
    'ru': 'рубашка', 'ja': 'シャツ', 'ko': '셔츠', 'zh': '衬衫', 'ar': 'قميص',
    'hi': 'कमीज़', 'bn': 'শার্ট', 'te': 'చొక్కా', 'ta': 'சட்டை', 'gu': 'શર્ટ'
  },
  'pants': {
    'es': 'pantalones', 'fr': 'pantalon', 'de': 'hose', 'it': 'pantaloni', 'pt': 'calças',
    'ru': 'брюки', 'ja': 'ズボン', 'ko': '바지', 'zh': '裤子', 'ar': 'بنطلون',
    'hi': 'पैंट', 'bn': 'প্যান্ট', 'te': 'ప్యాంట్', 'ta': 'பேன்ட்', 'gu': 'પેન્ટ'
  },
  'shoes': {
    'es': 'zapatos', 'fr': 'chaussures', 'de': 'schuhe', 'it': 'scarpe', 'pt': 'sapatos',
    'ru': 'обувь', 'ja': '靴', 'ko': '신발', 'zh': '鞋子', 'ar': 'أحذية',
    'hi': 'जूते', 'bn': 'জুতা', 'te': 'చెప్పులు', 'ta': 'காலணி', 'gu': 'જૂતા'
  },
  'hat': {
    'es': 'sombrero', 'fr': 'chapeau', 'de': 'hut', 'it': 'cappello', 'pt': 'chapéu',
    'ru': 'шляпа', 'ja': '帽子', 'ko': '모자', 'zh': '帽子', 'ar': 'قبعة',
    'hi': 'टोपी', 'bn': 'টুপি', 'te': 'టోపీ', 'ta': 'தொப்பி', 'gu': 'ટોપી'
  },
  // ACTIONS & VERBS 🏃
  'run': {
    'es': 'correr', 'fr': 'courir', 'de': 'laufen', 'it': 'correre', 'pt': 'correr',
    'ru': 'бегать', 'ja': '走る', 'ko': '달리다', 'zh': '跑', 'ar': 'يجري',
    'hi': 'दौड़ना', 'bn': 'দৌড়ানো', 'te': 'పరుగెత్తు', 'ta': 'ஓடு', 'gu': 'દોડવું'
  },
  'walk': {
    'es': 'caminar', 'fr': 'marcher', 'de': 'gehen', 'it': 'camminare', 'pt': 'andar',
    'ru': 'идти', 'ja': '歩く', 'ko': '걷다', 'zh': '走', 'ar': 'يمشي',
    'hi': 'चलना', 'bn': 'হাঁটা', 'te': 'నడవు', 'ta': 'நடக்க', 'gu': 'ચાલવું'
  },
  'eat': {
    'es': 'comer', 'fr': 'manger', 'de': 'essen', 'it': 'mangiare', 'pt': 'comer',
    'ru': 'есть', 'ja': '食べる', 'ko': '먹다', 'zh': '吃', 'ar': 'يأكل',
    'hi': 'खाना', 'bn': 'খাওয়া', 'te': 'తినడం', 'ta': 'சாப்பிட', 'gu': 'ખાવું'
  },
  'drink': {
    'es': 'beber', 'fr': 'boire', 'de': 'trinken', 'it': 'bere', 'pt': 'beber',
    'ru': 'пить', 'ja': '飲む', 'ko': '마시다', 'zh': '喝', 'ar': 'يشرب',
    'hi': 'पीना', 'bn': 'পান করা', 'te': 'త్రాగు', 'ta': 'குடி', 'gu': 'પીવું'
  },
  'sleep': {
    'es': 'dormir', 'fr': 'dormir', 'de': 'schlafen', 'it': 'dormire', 'pt': 'dormir',
    'ru': 'спать', 'ja': '眠る', 'ko': '자다', 'zh': '睡觉', 'ar': 'ينام',
    'hi': 'सोना', 'bn': 'ঘুমানো', 'te': 'నిద్రపోవు', 'ta': 'தூங்கு', 'gu': 'સૂવું'
  },
  'work': {
    'es': 'trabajar', 'fr': 'travailler', 'de': 'arbeiten', 'it': 'lavorare', 'pt': 'trabalhar',
    'ru': 'работать', 'ja': '働く', 'ko': '일하다', 'zh': '工作', 'ar': 'يعمل',
    'hi': 'काम करना', 'bn': 'কাজ করা', 'te': 'పని చేయు', 'ta': 'வேலை செய்', 'gu': 'કામ કરવું'
  },
  'play': {
    'es': 'jugar', 'fr': 'jouer', 'de': 'spielen', 'it': 'giocare', 'pt': 'jogar',
    'ru': 'играть', 'ja': '遊ぶ', 'ko': '놀다', 'zh': '玩', 'ar': 'يلعب',
    'hi': 'खेलना', 'bn': 'খেলা', 'te': 'ఆట', 'ta': 'விளையாடு', 'gu': 'રમવું'
  },
  'read': {
    'es': 'leer', 'fr': 'lire', 'de': 'lesen', 'it': 'leggere', 'pt': 'ler',
    'ru': 'читать', 'ja': '読む', 'ko': '읽다', 'zh': '读', 'ar': 'يقرأ',
    'hi': 'पढ़ना', 'bn': 'পড়া', 'te': 'చదవు', 'ta': 'படி', 'gu': 'વાંચવું'
  },
  'write': {
    'es': 'escribir', 'fr': 'écrire', 'de': 'schreiben', 'it': 'scrivere', 'pt': 'escrever',
    'ru': 'писать', 'ja': '書く', 'ko': '쓰다', 'zh': '写', 'ar': 'يكتب',
    'hi': 'लिखना', 'bn': 'লেখা', 'te': 'వ్రాయు', 'ta': 'எழுது', 'gu': 'લખવું'
  },
  'speak': {
    'es': 'hablar', 'fr': 'parler', 'de': 'sprechen', 'it': 'parlare', 'pt': 'falar',
    'ru': 'говорить', 'ja': '話す', 'ko': '말하다', 'zh': '说话', 'ar': 'يتكلم',
    'hi': 'बोलना', 'bn': 'কথা বলা', 'te': 'మాట్లాడు', 'ta': 'பேசு', 'gu': 'બોલવું'
  },
  'listen': {
    'es': 'escuchar', 'fr': 'écouter', 'de': 'hören', 'it': 'ascoltare', 'pt': 'ouvir',
    'ru': 'слушать', 'ja': '聞く', 'ko': '듣다', 'zh': '听', 'ar': 'يستمع',
    'hi': 'सुनना', 'bn': 'শোনা', 'te': 'వినడం', 'ta': 'கேள்', 'gu': 'સાંભળવું'
  },
  'see': {
    'es': 'ver', 'fr': 'voir', 'de': 'sehen', 'it': 'vedere', 'pt': 'ver',
    'ru': 'видеть', 'ja': '見る', 'ko': '보다', 'zh': '看', 'ar': 'يرى',
    'hi': 'देखना', 'bn': 'দেখা', 'te': 'చూడు', 'ta': 'பார்', 'gu': 'જોવું'
  },
  'come': {
    'es': 'venir', 'fr': 'venir', 'de': 'kommen', 'it': 'venire', 'pt': 'vir',
    'ru': 'приходить', 'ja': '来る', 'ko': '오다', 'zh': '来', 'ar': 'يأتي',
    'hi': 'आना', 'bn': 'আসা', 'te': 'రా', 'ta': 'வா', 'gu': 'આવવું'
  },
  'go': {
    'es': 'ir', 'fr': 'aller', 'de': 'gehen', 'it': 'andare', 'pt': 'ir',
    'ru': 'идти', 'ja': '行く', 'ko': '가다', 'zh': '去', 'ar': 'يذهب',
    'hi': 'जाना', 'bn': 'যাওয়া', 'te': 'వెళ్ళు', 'ta': 'போ', 'gu': 'જવું'
  },
  // DIRECTIONS & POSITIONS 🧭
  'left': {
    'es': 'izquierda', 'fr': 'gauche', 'de': 'links', 'it': 'sinistra', 'pt': 'esquerda',
    'ru': 'левый', 'ja': '左', 'ko': '왼쪽', 'zh': '左', 'ar': 'يسار',
    'hi': 'बाएं', 'bn': 'বাম', 'te': 'ఎడమ', 'ta': 'இடது', 'gu': 'ડાબે'
  },
  'right': {
    'es': 'derecha', 'fr': 'droite', 'de': 'rechts', 'it': 'destra', 'pt': 'direita',
    'ru': 'правый', 'ja': '右', 'ko': '오른쪽', 'zh': '右', 'ar': 'يمين',
    'hi': 'दाएं', 'bn': 'ডান', 'te': 'కుడి', 'ta': 'வலது', 'gu': 'જમણે'
  },
  'up': {
    'es': 'arriba', 'fr': 'haut', 'de': 'oben', 'it': 'su', 'pt': 'cima',
    'ru': 'вверх', 'ja': '上', 'ko': '위', 'zh': '上', 'ar': 'فوق',
    'hi': 'ऊपर', 'bn': 'উপরে', 'te': 'పైన', 'ta': 'மேலே', 'gu': 'ઉપર'
  },
  'down': {
    'es': 'abajo', 'fr': 'bas', 'de': 'unten', 'it': 'giù', 'pt': 'baixo',
    'ru': 'вниз', 'ja': '下', 'ko': '아래', 'zh': '下', 'ar': 'تحت',
    'hi': 'नीचे', 'bn': 'নিচে', 'te': 'క్రింద', 'ta': 'கீழே', 'gu': 'નીચે'
  },
  'here': {
    'es': 'aquí', 'fr': 'ici', 'de': 'hier', 'it': 'qui', 'pt': 'aqui',
    'ru': 'здесь', 'ja': 'ここ', 'ko': '여기', 'zh': '这里', 'ar': 'هنا',
    'hi': 'यहाँ', 'bn': 'এখানে', 'te': 'ఇక్కడ', 'ta': 'இங்கே', 'gu': 'અહીં'
  },
  'there': {
    'es': 'allí', 'fr': 'là', 'de': 'dort', 'it': 'lì', 'pt': 'lá',
    'ru': 'там', 'ja': 'そこ', 'ko': '거기', 'zh': '那里', 'ar': 'هناك',
    'hi': 'वहाँ', 'bn': 'সেখানে', 'te': 'అక్కడ', 'ta': 'அங்கே', 'gu': 'ત્યાં'
  },
  // TIME ⏰
  'today': {
    'es': 'hoy', 'fr': 'aujourd\'hui', 'de': 'heute', 'it': 'oggi', 'pt': 'hoje',
    'ru': 'сегодня', 'ja': '今日', 'ko': '오늘', 'zh': '今天', 'ar': 'اليوم',
    'hi': 'आज', 'bn': 'আজ', 'te': 'ఈరోజు', 'ta': 'இன்று', 'gu': 'આજે'
  },
  'tomorrow': {
    'es': 'mañana', 'fr': 'demain', 'de': 'morgen', 'it': 'domani', 'pt': 'amanhã',
    'ru': 'завтра', 'ja': '明日', 'ko': '내일', 'zh': '明天', 'ar': 'غدا',
    'hi': 'कल', 'bn': 'কাল', 'te': 'రేపు', 'ta': 'நாளை', 'gu': 'કાલે'
  },
  'yesterday': {
    'es': 'ayer', 'fr': 'hier', 'de': 'gestern', 'it': 'ieri', 'pt': 'ontem',
    'ru': 'вчера', 'ja': '昨日', 'ko': '어제', 'zh': '昨天', 'ar': 'أمس',
    'hi': 'कल', 'bn': 'গতকাল', 'te': 'నిన్న', 'ta': 'நேற்று', 'gu': 'ગઈકાલે'
  },
  'morning': {
    'es': 'mañana', 'fr': 'matin', 'de': 'morgen', 'it': 'mattina', 'pt': 'manhã',
    'ru': 'утро', 'ja': '朝', 'ko': '아침', 'zh': '早上', 'ar': 'صباح',
    'hi': 'सुबह', 'bn': 'সকাল', 'te': 'ఉదయం', 'ta': 'காலை', 'gu': 'સવાર'
  },
  'night': {
    'es': 'noche', 'fr': 'nuit', 'de': 'nacht', 'it': 'notte', 'pt': 'noite',
    'ru': 'ночь', 'ja': '夜', 'ko': '밤', 'zh': '夜晚', 'ar': 'ليل',
    'hi': 'रात', 'bn': 'রাত', 'te': 'రాత్రి', 'ta': 'இரவு', 'gu': 'રાત'
  },
  // ADJECTIVES 📏
  'big': {
    'es': 'grande', 'fr': 'grand', 'de': 'groß', 'it': 'grande', 'pt': 'grande',
    'ru': 'большой', 'ja': '大きい', 'ko': '큰', 'zh': '大', 'ar': 'كبير',
    'hi': 'बड़ा', 'bn': 'বড়', 'te': 'పెద్ద', 'ta': 'பெரிய', 'gu': 'મોટું'
  },
  'small': {
    'es': 'pequeño', 'fr': 'petit', 'de': 'klein', 'it': 'piccolo', 'pt': 'pequeno',
    'ru': 'маленький', 'ja': '小さい', 'ko': '작은', 'zh': '小', 'ar': 'صغير',
    'hi': 'छोटा', 'bn': 'ছোট', 'te': 'చిన్న', 'ta': 'சிறிய', 'gu': 'નાનું'
  },
  'hot': {
    'es': 'caliente', 'fr': 'chaud', 'de': 'heiß', 'it': 'caldo', 'pt': 'quente',
    'ru': 'горячий', 'ja': '熱い', 'ko': '뜨거운', 'zh': '热', 'ar': 'ساخن',
    'hi': 'गर्म', 'bn': 'গরম', 'te': 'వేడిమి', 'ta': 'சூடான', 'gu': 'ગરમ'
  },
  'cold': {
    'es': 'frío', 'fr': 'froid', 'de': 'kalt', 'it': 'freddo', 'pt': 'frio',
    'ru': 'холодный', 'ja': '冷たい', 'ko': '차가운', 'zh': '冷', 'ar': 'بارد',
    'hi': 'ठंडा', 'bn': 'ঠান্ডা', 'te': 'చల్లని', 'ta': 'குளிர்ந்த', 'gu': 'ઠંડું'
  },
  'good': {
    'es': 'bueno', 'fr': 'bon', 'de': 'gut', 'it': 'buono', 'pt': 'bom',
    'ru': 'хороший', 'ja': '良い', 'ko': '좋은', 'zh': '好', 'ar': 'جيد',
    'hi': 'अच्छा', 'bn': 'ভাল', 'te': 'మంచి', 'ta': 'நல்ல', 'gu': 'સારું'
  },
  'bad': {
    'es': 'malo', 'fr': 'mauvais', 'de': 'schlecht', 'it': 'cattivo', 'pt': 'mau',
    'ru': 'плохой', 'ja': '悪い', 'ko': '나쁜', 'zh': '坏', 'ar': 'سيء',
    'hi': 'बुरा', 'bn': 'খারাপ', 'te': 'చెడు', 'ta': 'கெட்ட', 'gu': 'ખરાબ'
  },
  'new': {
    'es': 'nuevo', 'fr': 'nouveau', 'de': 'neu', 'it': 'nuovo', 'pt': 'novo',
    'ru': 'новый', 'ja': '新しい', 'ko': '새로운', 'zh': '新', 'ar': 'جديد',
    'hi': 'नया', 'bn': 'নতুন', 'te': 'కొత్త', 'ta': 'புதிய', 'gu': 'નવું'
  },
  'old': {
    'es': 'viejo', 'fr': 'vieux', 'de': 'alt', 'it': 'vecchio', 'pt': 'velho',
    'ru': 'старый', 'ja': '古い', 'ko': '오래된', 'zh': '旧', 'ar': 'قديم',
    'hi': 'पुराना', 'bn': 'পুরানো', 'te': 'పాత', 'ta': 'பழைய', 'gu': 'જૂનું'
  },
  'fast': {
    'es': 'rápido', 'fr': 'rapide', 'de': 'schnell', 'it': 'veloce', 'pt': 'rápido',
    'ru': 'быстрый', 'ja': '速い', 'ko': '빠른', 'zh': '快', 'ar': 'سريع',
    'hi': 'तेज़', 'bn': 'দ্রুত', 'te': 'వేగం', 'ta': 'வேகமான', 'gu': 'ઝડપી'
  },
  'slow': {
    'es': 'lento', 'fr': 'lent', 'de': 'langsam', 'it': 'lento', 'pt': 'lento',
    'ru': 'медленный', 'ja': '遅い', 'ko': '느린', 'zh': '慢', 'ar': 'بطيء',
    'hi': 'धीमा', 'bn': 'ধীর', 'te': 'నెమ్మది', 'ta': 'மெதுவான', 'gu': 'ધીમું'
  }
};

// @route   POST /api/translation/detect
// @desc    Detect language of input text
// @access  Public
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for language detection'
      });
    }

    // Simple language detection logic (you can integrate with Google Translate API later)
    let detectedLanguage = 'en'; // Default to English

    // Basic detection patterns
    const patterns = {
      'es': /[ñáéíóúü]/i,
      'fr': /[àâäéèêëïîôöùûüÿç]/i,
      'de': /[äöüß]/i,
      'it': /[àèéìíîòóù]/i,
      'pt': /[ãâáàçéêíóôõú]/i,
      'ru': /[а-яё]/i,
      'ar': /[\u0600-\u06FF]/,
      'hi': /[\u0900-\u097F]/,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        detectedLanguage = lang;
        break;
      }
    }

    // For now, keep the pattern-based detection as Google Translate library
    // doesn't provide language detection in this version

    res.json({
      success: true,
      data: {
        detectedLanguage,
        confidence: detectedLanguage === 'en' ? 0.6 : 0.9,
        text
      }
    });

  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting language'
    });
  }
});

// @route   POST /api/translation/translate
// @desc    Translate text between languages
// @access  Public
router.post('/translate', rateLimit, async (req, res) => {
  try {
    console.log('🔄 Translation request received:', req.body);
    const { text, from, to } = req.body;

    if (!text || !from || !to) {
      console.log('❌ Missing required fields:', { text: !!text, from: !!from, to: !!to });
      return res.status(400).json({
        success: false,
        message: 'Text, source language (from), and target language (to) are required'
      });
    }

    // Use comprehensive translation dictionary
    const lowerText = text.toLowerCase().trim();
    let translation = translationDictionary[lowerText]?.[to];

    // If no direct translation found, try to find partial matches
    if (!translation) {
      for (const [key, translations] of Object.entries(translationDictionary)) {
        if (lowerText.includes(key) || key.includes(lowerText)) {
          translation = translations[to];
          break;
        }
      }
    }

    // If still no translation, try Google Translate API
    if (!translation) {
      console.log(`🌐 Using Google Translate for: ${text} (${from} → ${to})`);
      try {
        translation = await translate(text, { from, to });
        console.log(`✅ Google Translate result: ${translation}`);
      } catch (error) {
        console.error('❌ Google Translate error:', error.message);
        // Try advanced pattern matching as final fallback
        translation = await tryAdvancedTranslation(text, from, to) || `[${text} in ${to.toUpperCase()}]`;
      }
    }

    console.log('✅ Translation result:', { text, translation, from, to });

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translation,
        sourceLanguage: from,
        targetLanguage: to,
        confidence: translation.startsWith('[') ? 0.3 : 0.9
      }
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error translating text'
    });
  }
});

// @route   POST /api/translation/word-info
// @desc    Get detailed information about a word
// @access  Public
router.post('/word-info', async (req, res) => {
  try {
    const { word, language } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Word is required'
      });
    }

    // Mock word information (you can integrate with dictionary APIs later)
    const mockWordInfo = {
      word,
      language: language || 'en',
      phonetic: `/ˈwɜːrd/`,
      definitions: [
        {
          partOfSpeech: 'noun',
          definition: 'A single distinct meaningful element of speech or writing',
          example: `"${word}" is a common word.`
        }
      ],
      synonyms: ['term', 'expression', 'phrase'],
      translations: {
        es: 'palabra',
        fr: 'mot',
        de: 'wort',
        it: 'parola'
      },
      difficulty: 'beginner',
      frequency: 'high'
    };

    res.json({
      success: true,
      data: mockWordInfo
    });

  } catch (error) {
    console.error('Word info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching word information'
    });
  }
});

// @route   GET /api/translation/languages
// @desc    Get list of supported languages
// @access  Public
router.get('/languages', (req, res) => {
  try {
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
      { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
      { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
      { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
    ];

    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching supported languages'
    });
  }
});

// @route   POST /api/translation/batch
// @desc    Translate one word to multiple languages at once
// @access  Public
router.post('/batch', rateLimit, async (req, res) => {
  try {
    console.log('🔄 Batch translation request received:', req.body);
    const { text, from, targetLanguages } = req.body;

    if (!text || !from || !targetLanguages || !Array.isArray(targetLanguages)) {
      return res.status(400).json({
        success: false,
        message: 'Text, source language (from), and targetLanguages array are required'
      });
    }

    const lowerText = text.toLowerCase().trim();
    const results = {};

    for (const targetLang of targetLanguages) {
      let translation = translationDictionary[lowerText]?.[targetLang];
      let confidence = 0.9;

      if (!translation) {
        // Try partial matching in dictionary
        for (const [key, translations] of Object.entries(translationDictionary)) {
          if (lowerText.includes(key) || key.includes(lowerText)) {
            translation = translations[targetLang];
            break;
          }
        }
      }

      if (!translation) {
        // Use Google Translate API for unknown words
        console.log(`🌐 Google Translate: ${text} → ${targetLang}`);
        try {
          translation = await translate(text, { from, to: targetLang });
          confidence = 0.95; // High confidence for Google Translate
          console.log(`✅ ${targetLang}: ${translation}`);
        } catch (error) {
          console.error(`❌ Google Translate error for ${targetLang}:`, error.message);
          // Final fallback
          translation = await tryAdvancedTranslation(text, from, targetLang) || `[${text} in ${targetLang.toUpperCase()}]`;
          confidence = translation.startsWith('[') ? 0.1 : 0.5;
        }
      }

      results[targetLang] = {
        text: translation,
        confidence: confidence,
        language: targetLang
      };
    }

    console.log('✅ Batch translation results:', results);

    res.json({
      success: true,
      data: {
        originalText: text,
        sourceLanguage: from,
        translations: results
      }
    });

  } catch (error) {
    console.error('❌ Batch translation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error translating text to multiple languages'
    });
  }
});

module.exports = router;
