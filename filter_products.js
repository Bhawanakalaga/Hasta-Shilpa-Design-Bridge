const fs = require('fs');
const path = 'src/constants.ts';
let content = fs.readFileSync(path, 'utf8');

// The 5 IDs to keep for 'Modern Furniture'
const keepIds = ['1', '2', '3', '4', '5'];

// I need to find the MOCK_PRODUCTS array and filter it.
// This is tricky with regex if it's huge.
// I'll use a simple approach: find all occurrences of { category: 'Modern Furniture' ... } and if ID not in keepIds, remove.

// Actually, I'll just find the entire MOCK_PRODUCTS block and replace it with a filtered version.
// But it's 3908 lines.

// Let's use a simpler strategy for now:
// 1. Identify all products with category 'Modern Furniture'
// 2. Check their IDs.
// 3. Remove those that are not '1', '2', '3', '4', or '5'.

// I'll do this by finding the blocks.
const productRegex = /\{\s+id:\s+'([^']+)',\s+category:\s+'Modern Furniture',[\s\S]*?\n\s+\}(,?)/g;

content = content.replace(productRegex, (match, id, comma) => {
    if (keepIds.includes(id)) {
        return match;
    }
    return ''; // Remove it
});

// Clean up double commas or empty spaces if any
content = content.replace(/,\s*,/g, ',');

// Update CATEGORY_IMAGES
content = content.replace(/'Modern Furniture': 'https[^']+'/, `'Modern Furniture': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200'`);

fs.writeFileSync(path, content);
console.log('Filtered Modern Furniture products.');
