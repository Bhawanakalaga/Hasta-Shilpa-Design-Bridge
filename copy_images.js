import fs from 'fs';
import path from 'path';

const srcDir = './app/src/main/res/drawable';
const destDir = './public';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir);
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  if (file.endsWith('.jpg') || file.endsWith('.png')) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Copied ${file} to ${destDir}`);
  }
});
