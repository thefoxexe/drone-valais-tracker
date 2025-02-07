import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // 1. Vérification via User Agent
      const userAgent = navigator.userAgent.toLowerCase();
      const vendor = navigator.vendor.toLowerCase();
      const mobileKeywords = [
        'mobile',
        'android',
        'iphone',
        'ipad',
        'ipod',
        'blackberry',
        'windows phone',
        'webos',
        'opera mini',
        'iemobile',
        'silk'
      ];

      // 2. Vérification via la largeur d'écran
      const isMobileWidth = window.innerWidth <= 768;

      // 3. Vérification via matchMedia pour la préférence tactile
      const hasTouchScreen = (
        ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) ||
        ('msMaxTouchPoints' in navigator && (navigator as any).msMaxTouchPoints > 0) ||
        (window.matchMedia && window.matchMedia('(pointer:coarse)').matches)
      );

      // 4. Vérification via platform
      const platform = navigator.platform.toLowerCase();
      const mobileDevicePlatforms = ['android', 'iphone', 'ipad', 'ipod'];

      const isMobileDevice = 
        mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
        mobileKeywords.some(keyword => vendor.includes(keyword)) ||
        mobileDevicePlatforms.some(p => platform.includes(p)) ||
        isMobileWidth ||
        hasTouchScreen;

      setIsMobile(isMobileDevice);
    };

    // Vérification initiale
    checkMobile();

    // Ajout des event listeners
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    // Nettoyage
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
};