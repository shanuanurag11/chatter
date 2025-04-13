# Design System and Style Guide

This directory contains the app's design system components that should be used throughout development to maintain a consistent user experience and visual identity.

## Color Scheme

The app uses a purple-based color scheme with white elements on dark backgrounds. The specific colors are defined in `colors.js`.

### Primary Colors

- `primary`: '#6B46C1' - Main purple color
- `primaryDark`: '#4A1D96' - Darker purple for headers, status bars
- `primaryLight`: '#8B5CF6' - Lighter purple for accents

### Gradient Background

The app uses a purple gradient for its primary screens:

```javascript
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';

<LinearGradient
  colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
  style={styles.gradient}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
/>
```

## Typography

Font sizes and styles are defined in `theme.js`. Use these consistently throughout the app:

- Title (on light background): `theme.title`
- Title (on dark/gradient background): `theme.titleLight`
- Subtitle (on light background): `theme.subtitle`
- Subtitle (on dark/gradient background): `theme.subtitleLight`

## UI Components

### Buttons

Primary buttons (white with purple text):
```javascript
<TouchableOpacity style={theme.primaryButton}>
  <Text style={theme.primaryButtonText}>Button Text</Text>
</TouchableOpacity>
```

Secondary buttons (transparent with white border):
```javascript
<TouchableOpacity style={theme.secondaryButton}>
  <Text style={theme.secondaryButtonText}>Button Text</Text>
</TouchableOpacity>
```

### Inputs

Input fields on dark backgrounds:
```javascript
<TextInput
  style={theme.input}
  placeholder="Placeholder"
  placeholderTextColor={Colors.placeholderText}
/>
```

### Status Bar

Always use the custom status bar component to maintain consistent appearance:
```javascript
import CustomStatusBar from '../components/CustomStatusBar';

<CustomStatusBar backgroundColor={Colors.primaryDark} />
```

## Usage Guidelines

1. Always import colors from the constants file rather than hard-coding values
2. Use the theme's spacing, font sizes, and border radii for consistency
3. Maintain the same visual style across all screens
4. For new components, try to use existing style patterns
5. If new colors are needed, add them to the colors.js file

Remember that the signup/login screens showcase the app's core visual identity, so refer to these when developing new screens. 