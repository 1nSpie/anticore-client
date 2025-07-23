import { useState, useEffect, useCallback } from 'react';

interface NavigationSection {
  id: string;
  label: string;
}

export const useScrollNavigation = (sections: NavigationSection[]) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for any fixed headers
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      
      // Calculate scroll progress
      const progress = Math.min((scrollY / documentHeight) * 100, 100);
      setScrollProgress(progress);
      
      // Show navigation after scrolling down a bit
     
        // setOp
        setIsVisible(scrollY > 300);
     

      // Find the current active section
      let currentSection = '';
      let minDistance = Infinity;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top;
          const elementBottom = rect.bottom;
          const elementHeight = rect.height;

          // Check if section is currently visible
          if (elementTop <= windowHeight * 0.5 && elementBottom >= windowHeight * 0.1) {
            // Calculate how centered the section is in viewport
            const elementCenter = elementTop + elementHeight / 2;
            const viewportCenter = windowHeight / 2;
            const distance = Math.abs(elementCenter - viewportCenter);

            if (distance < minDistance) {
              minDistance = distance;
              currentSection = section.id;
            }
          }
        }
      }

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    // Throttle scroll event for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [sections, activeSection]);

  return {
    activeSection,
    isVisible,
    scrollProgress,
    scrollToSection,
  };
};
