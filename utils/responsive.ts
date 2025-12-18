import { Dimensions, Platform } from 'react-native';

// Get current window dimensions
export const getWindowDimensions = () => {
  return Dimensions.get('window');
};

// Check if device is a tablet
export const isTablet = () => {
  const { width, height } = getWindowDimensions();
  const aspectRatio = height / width;
  return Math.min(width, height) >= 600 && aspectRatio < 1.6;
};

// Check if running on web
export const isWeb = () => Platform.OS === 'web';

// Check if running on mobile
export const isMobile = () => Platform.OS === 'ios' || Platform.OS === 'android';

// Responsive font size based on screen width
export const responsiveFontSize = (size: number) => {
  const { width } = getWindowDimensions();
  const baseWidth = 375; // iPhone SE width as base
  const scale = width / baseWidth;
  const newSize = size * scale;
  
  // Limit scaling
  if (isWeb()) {
    return Math.min(Math.max(newSize, size * 0.8), size * 1.5);
  }
  return Math.round(newSize);
};

// Responsive spacing
export const responsiveSpacing = (size: number) => {
  const { width } = getWindowDimensions();
  const baseWidth = 375;
  const scale = width / baseWidth;
  return Math.round(size * scale);
};

// Get responsive card height
export const getCardHeight = () => {
  const { height, width } = getWindowDimensions();
  
  if (isWeb()) {
    // On web, limit card height for better UX
    return Math.min(height * 0.7, 600);
  }
  
  if (isTablet()) {
    return height * 0.5;
  }
  
  return height * 0.6;
};

// Get responsive padding
export const getResponsivePadding = () => {
  const { width } = getWindowDimensions();
  
  if (isWeb() && width > 768) {
    return 32; // More padding on larger screens
  }
  
  if (isTablet()) {
    return 24;
  }
  
  return 16;
};

// Get max content width for web
export const getMaxContentWidth = () => {
  if (!isWeb()) return '100%';
  return 600; // Max width for web to prevent stretching
};
