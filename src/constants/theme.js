import { StyleSheet } from 'react-native';
import Colors from './colors';

// Common spacing values
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Font sizes
const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

// Shadow styles
const shadows = {
  small: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Common styles used throughout the app
const commonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Gradient background container
  gradientContainer: {
    flex: 1,
  },
  
  // Input fields
  input: {
    height: 48,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: Colors.inputBackground,
    color: Colors.white,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  
  // Buttons
  primaryButton: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.white,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.white,
    fontSize: fontSize.md,
    fontWeight: 'bold',
  },
  
  // Text styles
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: spacing.sm,
  },
  titleLight: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: Colors.textMedium,
    marginBottom: spacing.lg,
  },
  subtitleLight: {
    fontSize: fontSize.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.lg,
  },
  
  // Card styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
});

export default {
  colors: Colors,
  spacing,
  fontSize,
  borderRadius,
  shadows,
  ...commonStyles,
}; 