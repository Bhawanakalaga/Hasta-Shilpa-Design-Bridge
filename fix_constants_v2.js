const fs = require('fs');
const lines = fs.readFileSync('src/constants.ts', 'utf8').split('\n');

const startIndex = 137; // line 138 is lines[137]
const endIndex = 138;

const newLines = [
  '  },',
  '  {',
  "    id: 'bamboo-mobile-stand-1',",
  "    category: 'Work & Tech',",
  "    title: { en: 'Bamboo Mobile Stand', hi: 'बांस मोबाइल स्टैंड', kn: 'ಬಿದಿರಿನ ಮೊಬೈಲ್ ಸ್ಟ್ಯಾಂಡ್', bn: 'বাঁশের মোবাইল স্ট্যান্ড' },",
  "    description: { en: 'Handcrafted bamboo mobile stand for office and home.', hi: 'कार्यालय और घर के लिए हस्तनिर्मित बांस मोबाइल स्टैंड।', kn: 'ಕಚೇರಿ ಮತ್ತು ಮನೆಗಾಗಿ ತಯಾರಿಸಿದ ಬಿದಿರಿನ ಮೊಬೈಲ್ ಸ್ಟ್ಯಾಂಡ್.', bn: 'অফিস ও ঘরের জন্য হাতে তৈরি বাঁশের মোবাইল স্ট্যান্ড।' },"
];

lines.splice(startIndex, 1, ...newLines);

fs.writeFileSync('src/constants.ts', lines.join('\n'));
console.log('Fixed line 138');
