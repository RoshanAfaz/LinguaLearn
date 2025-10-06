// Basic alphabet datasets per language. Expand progressively.
export const alphabets = {
  en: {
    scriptName: 'Latin',
    direction: 'ltr',
    vowels: ['A', 'E', 'I', 'O', 'U'],
    consonants: [
      'B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z'
    ],
    notes: 'English uses the Latin script. Vowels can be short or long.'
  },
  es: {
    scriptName: 'Latin',
    direction: 'ltr',
    vowels: ['A','E','I','O','U'],
    consonants: [
      'B','C','D','F','G','H','J','K','L','LL','M','N','Ñ','P','Q','R','RR','S','T','V','W','X','Y','Z'
    ],
    notes: 'Spanish vowels have consistent sounds. Special letters: Ñ, LL (historical), RR (rolled).'
  },
  fr: {
    scriptName: 'Latin',
    direction: 'ltr',
    vowels: ['A','E','I','O','U','Y'],
    consonants: [
      'B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Z'
    ],
    notes: 'French uses many diacritics (é, è, ê, ç). Y can function as a vowel.'
  },
  de: {
    scriptName: 'Latin',
    direction: 'ltr',
    vowels: ['A','E','I','O','U','Ä','Ö','Ü'],
    consonants: [
      'B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z','ß'
    ],
    notes: 'Umlauts (Ä, Ö, Ü) modify vowel sounds. ß pronounced as /s/.'
  },
  pt: {
    scriptName: 'Latin',
    direction: 'ltr',
    vowels: ['A','E','I','O','U'],
    consonants: ['B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z'],
    notes: 'Portuguese uses diacritics like ã, õ, á, à, â.'
  },
  it: {
    scriptName: 'Latin',
    direction: 'ltr',
    vowels: ['A','E','I','O','U'],
    consonants: ['B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Y','Z'],
    notes: 'Italian has very phonetic spelling; stress marks appear on some words.'
  },
  ru: {
    scriptName: 'Cyrillic',
    direction: 'ltr',
    vowels: ['А','Е','Ё','И','О','У','Ы','Э','Ю','Я'],
    consonants: ['Б','В','Г','Д','Ж','З','Й','К','Л','М','Н','П','Р','С','Т','Ф','Х','Ц','Ч','Ш','Щ','Ъ','Ь'],
    notes: 'Ъ and Ь are signs (hard/soft). Ё is often written as Е but pronounced differently.'
  },
  ja: {
    scriptName: 'Kana + Kanji',
    direction: 'ltr',
    vowels: ['あ','い','う','え','お'],
    consonants: ['か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と','な','に','ぬ','ね','の'],
    notes: 'Japanese uses Hiragana, Katakana, and Kanji. Start with Hiragana (shown here).'
  },
  ko: {
    scriptName: 'Hangul',
    direction: 'ltr',
    vowels: ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ'],
    consonants: ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'],
    notes: 'Hangul letters combine into syllable blocks (e.g., 한, 글).'
  },
  hi: {
    scriptName: 'Devanagari',
    direction: 'ltr',
    vowels: ['अ','आ','इ','ई','उ','ऊ','ए','ऐ','ओ','औ','अं','अः'],
    consonants: ['क','ख','ग','घ','ङ','च','छ','ज','झ','ञ','ट','ठ','ड','ढ','ण','त','थ','द','ध','न','प','फ','ब','भ','म','य','र','ल','व','श','ष','स','ह'],
    notes: 'Devanagari uses inherent vowel “a” and matras for vowel marks.'
  },
  te: {
    scriptName: 'Telugu',
    direction: 'ltr',
    vowels: ['అ','ఆ','ఇ','ఈ','ఉ','ఊ','ఋ','ౠ','ఎ','ఏ','ఐ','ఒ','ఓ','ఔ','అం','అః'],
    consonants: ['క','ఖ','గ','ఘ','ఙ','చ','ఛ','జ','ఝ','ఞ','ట','ఠ','డ','ఢ','ణ','త','థ','ద','ధ','న','ప','ఫ','బ','భ','మ','య','ర','ల','వ','శ','ష','స','హ','ళ','క్ష','ఱ'],
    notes: 'Telugu is an abugida. Consonants carry an inherent vowel unless modified.'
  },
  ta: {
    scriptName: 'Tamil',
    direction: 'ltr',
    vowels: ['அ','ஆ','இ','ஈ','உ','ஊ','எ','ஏ','ஐ','ஒ','ஓ','ஔ','ஃ'],
    consonants: ['க','ங','ச','ஞ','ட','ண','த','ந','ப','ம','ய','ர','ல','வ','ழ','ள','ற','ன','ஷ','ஸ','ஹ','க்ஷ'],
    notes: 'Tamil uses independent vowels and consonants with vowel signs.'
  },
  ar: {
    scriptName: 'Arabic',
    direction: 'rtl',
    vowels: ['ا','و','ي'],
    consonants: ['ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه'],
    notes: 'Arabic is cursive and right-to-left. Short vowels usually not written (diacritics).'
  },
};