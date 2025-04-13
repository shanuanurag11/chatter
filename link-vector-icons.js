#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if the font files exist in the android/app/src/main/assets/fonts directory
const androidFontsDir = path.join('android', 'app', 'src', 'main', 'assets', 'fonts');

// Create the fonts directory if it doesn't exist
if (!fs.existsSync(androidFontsDir)) {
  console.log(`Creating directory: ${androidFontsDir}`);
  fs.mkdirSync(androidFontsDir, { recursive: true });
}

// Copy the fonts from node_modules to the android assets directory
const vectorIconsDir = path.join('node_modules', 'react-native-vector-icons', 'Fonts');
if (fs.existsSync(vectorIconsDir)) {
  fs.readdirSync(vectorIconsDir)
    .filter(file => file.endsWith('.ttf'))
    .forEach(font => {
      const source = path.join(vectorIconsDir, font);
      const destination = path.join(androidFontsDir, font);
      
      if (!fs.existsSync(destination)) {
        console.log(`Copying ${font} to ${androidFontsDir}`);
        fs.copyFileSync(source, destination);
      } else {
        console.log(`${font} already exists in ${androidFontsDir}`);
      }
    });
  
  console.log('All vector icon fonts copied successfully!');
} else {
  console.error('Could not find React Native Vector Icons in node_modules!');
}

console.log('\nDone! You may need to rebuild your app for changes to take effect.'); 