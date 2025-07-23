/**
 * Utility functions for managing feedback modal localStorage
 */

const FEEDBACK_MODAL_KEY = 'feedbackModalLastShown';
const SESSION_KEY = 'feedbackModalShownThisSession';

export const feedbackModalStorage = {
  /**
   * Save the current timestamp when modal is shown
   */
  saveModalShownTimestamp: (): void => {
    try {
      const now = new Date().toISOString();
      localStorage.setItem(FEEDBACK_MODAL_KEY, now);
    } catch (error) {
      console.error('Error saving feedback modal timestamp:', error);
    }
  },

  /**
   * Get the last shown timestamp
   */
  getLastShownTimestamp: (): Date | null => {
    try {
      const lastShownStr = localStorage.getItem(FEEDBACK_MODAL_KEY);
      return lastShownStr ? new Date(lastShownStr) : null;
    } catch (error) {
      console.error('Error getting last shown timestamp:', error);
      return null;
    }
  },

  /**
   * Check if enough time has passed since last modal display
   */
  canShowModal: (cooldownHours: number = 24): boolean => {
    try {
      const lastShown = feedbackModalStorage.getLastShownTimestamp();
      if (!lastShown) {
        return true; // Never shown before
      }

      const now = new Date();
      const timeDiff = now.getTime() - lastShown.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      return hoursDiff >= cooldownHours;
    } catch (error) {
      console.error('Error checking if modal can be shown:', error);
      return true; // Default to allowing modal if there's an error
    }
  },

  /**
   * Get time remaining until next modal can be shown
   */
  getTimeUntilNextShow: (cooldownHours: number = 24): { hours: number; minutes: number } | null => {
    try {
      const lastShown = feedbackModalStorage.getLastShownTimestamp();
      if (!lastShown) return null;

      const now = new Date();
      const timeDiff = now.getTime() - lastShown.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff >= cooldownHours) return null;
      
      const remainingMs = (cooldownHours * 60 * 60 * 1000) - timeDiff;
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return { hours: remainingHours, minutes: remainingMinutes };
    } catch (error) {
      console.error('Error calculating time until next modal:', error);
      return null;
    }
  },

  /**
   * Reset the cooldown period
   */
  resetCooldown: (): void => {
    try {
      localStorage.removeItem(FEEDBACK_MODAL_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Error resetting cooldown:', error);
    }
  },

  /**
   * Check if modal was shown in current session
   */
  isShownThisSession: (): boolean => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch (error) {
      console.error('Error checking session storage:', error);
      return false;
    }
  },

  /**
   * Mark modal as shown in current session
   */
  markShownThisSession: (): void => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (error) {
      console.error('Error marking shown this session:', error);
    }
  },

  /**
   * Clear session storage
   */
  clearSession: (): void => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  },

  /**
   * Get debug information
   */
  getDebugInfo: (cooldownHours: number = 24) => {
    const lastShown = feedbackModalStorage.getLastShownTimestamp();
    const canShow = feedbackModalStorage.canShowModal(cooldownHours);
    const timeRemaining = feedbackModalStorage.getTimeUntilNextShow(cooldownHours);
    const shownThisSession = feedbackModalStorage.isShownThisSession();

    return {
      lastShown,
      canShow,
      timeRemaining,
      shownThisSession,
      cooldownHours,
      now: new Date()
    };
  }
};
