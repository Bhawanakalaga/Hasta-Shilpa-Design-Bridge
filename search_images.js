import fs from 'fs';
import path from 'path';

function findImages(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git')) return;
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      findImages(fullPath);
    } else {
      if (stats.size > 1000 && (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg'))) {
        console.log(`${fullPath} (${stats.size} bytes)`);
      }
    }
  });
}

findImages('.');
