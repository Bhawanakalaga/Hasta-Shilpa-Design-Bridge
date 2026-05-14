const fs = require('fs');
const path = 'src/constants.ts';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
// Based on view_file:
// 123:   },
// 124: <corrupted>
// ...
// 150:   },
// 151:   {
// 152:     id: 'mobile-stand-1',

// Splice index is line_number - 1.
// To delete 124 to 150:
// Start index: 123
// Count: 27
lines.splice(123, 27);
fs.writeFileSync(path, lines.join('\n'));
console.log('Deleted 27 lines starting from line 124');
