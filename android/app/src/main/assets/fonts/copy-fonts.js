const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../../../../../node_modules/react-native-vector-icons/Fonts');
const targetDir = path.join(__dirname);

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Copy fonts
const fonts = ['MaterialIcons.ttf', 'Ionicons.ttf', 'MaterialCommunityIcons.ttf'];
fonts.forEach(font => {
    const sourcePath = path.join(sourceDir, font);
    const targetPath = path.join(targetDir, font);
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${font} to ${targetPath}`);
    } else {
        console.error(`Font file not found: ${sourcePath}`);
    }
}); 