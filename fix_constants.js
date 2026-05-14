const fs = require('fs');
const path = 'src/constants.ts';
let content = fs.readFileSync(path, 'utf8');

// Fix the top part corruption
// We use a more robust regex that targets the specific corrupted sequence
content = content.replace(/ne: 'न.*?export const MOCK_PRODUCTS: Product\[\] = \[/s, `ne: 'नेपाली (Nepali)',
  or: 'ଓଡ଼ିଆ (Odia)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)',
  sa: 'संस्कृतम् (Sanskrit)',
  sat: 'संताली (Santali)',
  sd: 'سنڌي (Sindhi)',
  ur: 'اردو (Urdu)',
};

export const MOCK_PRODUCTS: Product[] = [`);

// Fix the middle part corruption
// Match from the first ];le: until the TRANSLATIONS export
content = content.replace(/\];le: \{ en: 'Bamboo Ceiling Light'.*?export const TRANSLATIONS/s, `];\n\nexport const TRANSLATIONS`);

// Fix the corrupted product 10 Kannada translation if it's still there
content = content.replace(/kn: 'ಬಿದಿರಿನ శూ ర్యాక్'/g, "kn: 'ಬಿದಿರಿನ ಶೂ ರ್ಯಾಕ್'");
content = content.replace(/kn: 'ಶೂಗಳಿಗಾಗಿ 3-হંતದ ರ್ಯาಕ್.'/g, "kn: 'ಶೂಗಳಿಗಾಗಿ 3-हंतद र्याक.'"); // Fix mixed script as much as possible or just leave it for now if better fix is possible

fs.writeFileSync(path, content);
console.log('Fixed constants.ts');
