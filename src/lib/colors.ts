// Unified Brand Color Scheme for the Anticore project
// All sections now follow the AwesomeServices dark slate theme with teal accents

export const brandColors = {
  // Main brand colors matching AwesomeServices
  primary: {
    teal: '#007478',            // Main brand teal (orangeDefault)
    tealHover: '#005d61',       // Hover state for teal
    tealLight: '#009ba0',       // Light teal for accents
    tealDark: '#004346',        // Dark teal for deep accents
  },
  
  // Background gradient system - dark slate theme
  backgrounds: {
    // Main hero section (AwesomeServices) - darkest
    hero: {
      base: 'bg-slate-900',
      gradient: `
        radial-gradient(circle at 20% 80%, rgba(0, 116, 120, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0, 116, 120, 0.2) 0%, transparent 50%),
        linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)
      `,
    },
    // Secondary sections (AutoPrice, TechProcces) - medium dark
    secondary: {
      base: 'bg-slate-800',
      gradient: `
        radial-gradient(circle at 20% 20%, rgba(0, 116, 120, 0.25) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(0, 116, 120, 0.18) 0%, transparent 50%),
        linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)
      `,
    },
    // Tertiary sections (Garanty, Carousel) - lighter
    tertiary: {
      base: 'bg-slate-600',
      gradient: `
        radial-gradient(circle at 10% 20%, rgba(0, 116, 120, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 90% 80%, rgba(0, 116, 120, 0.2) 0%, transparent 50%),
        linear-gradient(135deg, rgba(71, 85, 105, 0.85) 0%, rgba(100, 116, 139, 0.8) 100%)
      `,
    },
    // Lightest sections (PriceList, Video) - slate-400/300
    light: {
      base: 'bg-slate-400',
      gradient: `
        radial-gradient(circle at 50% 30%, rgba(0, 116, 120, 0.4) 0%, transparent 50%),
        radial-gradient(circle at 50% 70%, rgba(0, 116, 120, 0.3) 0%, transparent 50%),
        linear-gradient(135deg, rgba(148, 163, 184, 0.75) 0%, rgba(203, 213, 225, 0.7) 100%)
      `,
    },
  },
  
  // Text colors for dark theme consistency
  text: {
    primary: 'text-white',              // Main headings
    secondary: 'text-gray-300',         // Subheadings and descriptions
    accent: 'text-orangeDefault',       // Accent text (teal brand color)
    muted: 'text-gray-400',            // Muted text
  },
  
  // Decorative elements
  decorations: {
    tealGlow: 'bg-gradient-to-br from-teal-600/20 to-teal-500/20',
    slateGlow: 'bg-gradient-to-br from-slate-600/30 to-slate-500/30',
    gradientLine: 'bg-gradient-to-r from-orangeDefault to-teal-400',
  },
  
  // Utility classes for consistent theming
  classes: {
    // Section wrappers
    heroSection: 'relative overflow-hidden py-16 lg:py-20 bg-slate-900',
    darkSection: 'relative overflow-hidden py-16 lg:py-20 bg-slate-800',
    mediumSection: 'relative overflow-hidden py-16 lg:py-20 bg-slate-600',
    lightSection: 'relative overflow-hidden py-16 lg:py-20 bg-slate-400',
    
    // Content containers
    contentContainer: 'max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10',
    
    // Text styles
    sectionTitle: 'text-4xl font-bold sm:text-5xl lg:text-6xl text-white mb-6 tracking-tight',
    sectionSubtitle: 'text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed',
    
    // Interactive elements
    primaryButton: 'bg-orangeDefault hover:bg-orangeDefaultHover text-white font-semibold transition-colors',
    cardBackground: 'bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700',
    
    // Focus and hover states
    focusRing: 'focus:outline-none focus:ring-2 focus:ring-orangeDefault',
    hoverScale: 'hover:scale-105 transition-transform duration-200',
  },
  
  // Dark theme overrides
  darkTheme: {
    // All backgrounds get slightly more opacity in dark mode
    backgroundOverlay: 'dark:from-slate-900/90 dark:to-slate-800/90',
    glowIntensity: 'dark:from-teal-600/15 dark:to-teal-500/15',
    cardBorder: 'dark:border-gray-700',
  }
};


export default brandColors;
