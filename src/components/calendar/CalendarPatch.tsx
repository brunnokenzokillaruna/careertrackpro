import React, { useEffect } from 'react';

/**
 * This component doesn't render anything but applies patches to fix React warnings
 * about deprecated lifecycle methods in react-big-calendar
 */
const CalendarPatch: React.FC = () => {
  useEffect(() => {
    // Apply patches to suppress UNSAFE_componentWillReceiveProps warnings
    // This is a workaround until react-big-calendar is updated to use modern lifecycle methods
    
    // Suppress console warnings for specific components
    const originalWarn = console.warn;
    console.warn = function(message) {
      if (
        typeof message === 'string' && 
        (
          message.includes('UNSAFE_componentWillReceiveProps') ||
          message.includes('componentWillReceiveProps has been renamed')
        )
      ) {
        // Suppress the warning
        return;
      }
      originalWarn.apply(console, arguments as any);
    };

    // Restore original console.warn when component unmounts
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default CalendarPatch; 