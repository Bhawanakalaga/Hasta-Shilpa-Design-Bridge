const fs = require('fs');
const content = fs.readFileSync('src/constants.ts', 'utf8');

const mockProductsStart = content.indexOf('export const MOCK_PRODUCTS');
const translationsStart = content.indexOf('export const TRANSLATIONS');

if (mockProductsStart !== -1 && translationsStart !== -1) {
    const productsEnd = content.lastIndexOf(']', translationsStart);
    const mockProductsArray = content.slice(mockProductsStart, productsEnd + 1);
    
    // We want to keep only the first 5 elements of the array.
    // However, since it's a string, we can look for the 5th closing brace.
    let count = 0;
    let index = content.indexOf('{', mockProductsStart);
    let lastIndex = index;
    
    while (count < 5 && index !== -1 && index < translationsStart) {
        // Find the matching closing brace for this object
        let braceCount = 1;
        let j = index + 1;
        while (braceCount > 0 && j < translationsStart) {
            if (content[j] === '{') braceCount++;
            if (content[j] === '}') braceCount--;
            j++;
        }
        lastIndex = j;
        count++;
        index = content.indexOf('{', lastIndex);
    }
    
    const newMockProducts = content.slice(mockProductsStart, lastIndex) + '\n];\n\n';
    const newContent = content.slice(0, mockProductsStart) + newMockProducts + content.slice(translationsStart);
    
    fs.writeFileSync('src/constants.ts', newContent);
    console.log('Successfully updated src/constants.ts');
} else {
    console.error('Could not find MOCK_PRODUCTS or TRANSLATIONS');
}
