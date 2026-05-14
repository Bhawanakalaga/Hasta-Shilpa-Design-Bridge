
import fs from 'fs';

const filePath = 'src/constants.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix first corruption
const broken1 = /title: \{ en: 'Bamboo Garden Gazebo'.*?\},\s*materials: \['Bamboo slats', 'Aluminum frame', 'Sound insulation'\],/s;
const fixed1 = `title: { en: 'Bamboo Garden Gazebo', hi: 'बांस गार्डन गज़ेबो', kn: 'ಬಿದಿರಿನ ಗಾರ್ಡನ್ ಗೆಜೆಬೊ', bn: 'বাঁশের গার্ডেন ಗೆಜೆবো' },
    description: { en: 'Durable and beautiful outdoor shelter for gardens or resorts.', hi: 'बगीचों या रिसॉर्ट्स के लिए टिकाऊ और सुंदर बाहरी आश्रय।', kn: 'ತೋಟಗಳಿಗಾಗಿ ಗಟ್ಟಿಮುಟ್ಟಾದ ಬಿದಿರಿನ ನಿवारा.', bn: 'বাগানের জন্য বাঁশের গেজেবো।' },
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=800',
    price: 55000,
    costPrice: 20000,
    blueprints: ['https://placehold.co/600x400/png?text=Gazebo+Blueprint'],
    measurements: '3m x 3m x 2.5m',
    materials: ['Thick structural bamboo', 'Palm leaf thatch', 'Bolts'],
    tools: ['Power drill', 'Levels', 'Safety harnesses'],
    steps: ['Erect main support posts in concrete', 'Assemble the roof trusses on ground', 'Hoist and bolt the roof frame', 'Install the thatching layers', 'Add side panels if required'],
    timeRequired: '5 Days'
  },
  {
    id: '18',
    category: 'Architecture',
    title: { en: 'Modular Office Partition', hi: 'मॉड्यूलर ऑफिस पार्टीशन', kn: 'ಬಿದಿರಿನ ಆಫೀಸ್ ಪಾರ್ಟಿಷನ್', bn: 'বাঁশের অফিস পার্টিশন' },
    description: { en: 'Acoustic and aesthetic bamboo dividers for modern workplaces.', hi: 'आधुनिक कार्यस्थलों के लिए ध्वनिक और सुंदर बांस डिवाइडर।', kn: 'ಕಚೇರಿಗಾಗಿ ಬಿದಿರಿನ ವಿಭಾಜಕ.', bn: 'অফিসের জন্য বাঁশের দেয়াল বা পার্টিশন।' },
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    price: 12000,
    costPrice: 5000,
    blueprints: ['https://placehold.co/600x400/png?text=Partition+Blueprint'],
    measurements: '2m x 1m x 5cm',
    materials: ['Bamboo slats', 'Aluminum frame', 'Sound insulation'],`;

// Fix second corruption
const broken2 = /materials: \['Bamboo slats', 'Aluminum frame', 'Sound ins\s+\{/s;
const fixed2 = `materials: ['Bamboo slats', 'Aluminum frame', 'Sound insulation'],
    tools: ['Screwdriver', 'Tape measure', 'Metal cutter'],
    steps: ['Construct the aluminum perimeter frame', 'Infill with bamboo slats in pattern', 'Apply sound dampening material behind slats', 'Join modules for desired length', 'Install floor mountings'],
    timeRequired: '2 Days'
  },
  {`;

// Also fix the },7', garbage if it's still there
content = content.replace(/\},7',/g, '},');

// Apply regex fixes
content = content.replace(broken1, fixed1);
content = content.replace(broken2, fixed2);

fs.writeFileSync(filePath, content);
console.log('Fixed constants.ts');
