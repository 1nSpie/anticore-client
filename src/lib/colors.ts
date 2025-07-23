// Brand color scheme for the Anticore project
// This file defines all the colors used in the main page and should be applied across the entire project

export const brandColors = {
  // Primary brand colors (from main page)
  primary: {
    orange: '#ff7f19',          // Main brand orange (orangeDefault)
    orangeHover: '#e56a0f',     // Hover state for orange buttons
    orangeLight: '#ff9142',     // Light orange for backgrounds
    orangeDark: '#cc5200',      // Dark orange for accents
  },
  
  // Secondary brand colors  
  secondary: {
    green: '#177474',           // Green accent color
    greenHover: '#146565',      // Green hover state
  },
  
  // Background colors (matching main page)
  background: {
    light: '#fbfbfb',           // Light theme background
    light1: '#f7f7f7',          // Light theme secondary background
    dark: '#0d172b',            // Dark theme background
    dark1: '#0c192b',           // Dark theme secondary background
  },
  
  // Utility classes for consistent styling
  classes: {
    // Button classes
    primaryButton: 'bg-orangeDefault hover:bg-orange-600 text-white font-semibold transition-colors',
    secondaryButton: 'bg-greenDefault hover:bg-greenDefaultHover text-white font-semibold transition-colors',
    outlineButton: 'border border-orangeDefault text-orangeDefault hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors',
    
    // Background classes
    pageBackground: 'bg-background1 dark:bg-backgroundDark',
    cardBackground: 'bg-white dark:bg-gray-800',
    accentBackground: 'bg-orange-50 dark:bg-orange-900/20',
    
    // Text classes
    primaryText: 'text-gray-800 dark:text-white',
    secondaryText: 'text-gray-600 dark:text-gray-300',
    accentText: 'text-orangeDefault dark:text-orangeDefault',
    
    // Focus states
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-orangeDefault',
  }
};


export default brandColors;
