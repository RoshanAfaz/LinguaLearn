const translate = require('translate-google');

const testGoogleTranslate = async () => {
  console.log('🌍 Testing Google Translate API...');
  
  const testWords = [
    { text: 'universe', from: 'en', to: 'es' },
    { text: 'artificial intelligence', from: 'en', to: 'fr' },
    { text: 'programming', from: 'en', to: 'hi' },
    { text: 'beautiful', from: 'en', to: 'ja' },
    { text: 'extraordinary', from: 'en', to: 'de' }
  ];

  for (const test of testWords) {
    try {
      console.log(`\n🔄 Translating: "${test.text}" (${test.from} → ${test.to})`);
      
      const result = await translate(test.text, { from: test.from, to: test.to });

      console.log(`✅ Result: "${result}"`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  // Test simple translation
  console.log('\n🔍 Testing Simple Translation...');
  try {
    const simpleTest = await translate('Bonjour le monde', { from: 'fr', to: 'en' });
    console.log(`✅ Translation: "Bonjour le monde" → "${simpleTest}"`);
  } catch (error) {
    console.log(`❌ Simple translation error: ${error.message}`);
  }

  console.log('\n🎉 Google Translate test completed!');
};

testGoogleTranslate();
