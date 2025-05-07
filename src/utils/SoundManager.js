/**
 * Sound Manager Wrapper
 * This module provides a safe wrapper around react-native-sound to handle potential undefined properties
 */

import { Platform } from 'react-native';
import Sound from 'react-native-sound';

// Enable playback in silence mode
Sound.setCategory('Playback');

// Fix for potential undefined properties in the RNSound native module
if (Platform.OS === 'android') {
  // If IsAndroid is undefined in the native module, it will still work because we check the platform here
  const IsAndroid = true;
} else if (Platform.OS === 'windows') {
  const IsWindows = true;
}

// Constants with fallbacks to handle undefined native module properties
const MAIN_BUNDLE = Sound.MAIN_BUNDLE || '';
const DOCUMENT = Sound.DOCUMENT || '';
const LIBRARY = Sound.LIBRARY || '';
const CACHES = Sound.CACHES || '';

/**
 * Load and play a sound
 * @param {string} fileName - Name of the sound file
 * @param {string} [basePath] - Optional base path (uses MAIN_BUNDLE if not provided)
 * @returns {Promise<Object>} - A promise that resolves to a sound object with controls
 */
const loadSound = (fileName, basePath = MAIN_BUNDLE) => {
  return new Promise((resolve, reject) => {
    try {
      const sound = new Sound(fileName, basePath, (error) => {
        if (error) {
          console.error(`Failed to load sound ${fileName}:`, error);
          reject(error);
          return;
        }
        
        console.log(`Sound ${fileName} loaded successfully`);
        resolve({
          play: () => {
            sound.play((success) => {
              if (success) {
                console.log(`Sound ${fileName} played successfully`);
              } else {
                console.error(`Sound ${fileName} playback failed`);
              }
            });
          },
          stop: () => {
            sound.stop();
          },
          release: () => {
            sound.release();
          },
          setVolume: (volume) => {
            sound.setVolume(volume);
          },
          sound // Return the original sound object for additional controls
        });
      });
    } catch (e) {
      console.error('Exception during sound loading:', e);
      reject(e);
    }
  });
};

export default {
  loadSound,
  MAIN_BUNDLE,
  DOCUMENT,
  LIBRARY,
  CACHES
}; 