import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'mobile',
        'android',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone'
      ];
      
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
                           window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice);
    };

    // Check initially
    checkMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};