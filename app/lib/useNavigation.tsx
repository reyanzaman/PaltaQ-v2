'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

const useNavigation = () => {
  const pathname = usePathname();
  const [isHomeActive, setIsHomeActive] = useState(false);
  const [isDashboardActive, setIsDashboardActive] = useState(false);
  const [isQuestionsActive, setIsQuestionsActive] = useState(false);
  const [isInfoActive, setIsInfoActive] = useState(false);

  useEffect(() => {
    setIsHomeActive(false);
    setIsDashboardActive(false);
    setIsQuestionsActive(false);
    setIsInfoActive(false);

    switch (pathname) {
      case '/':
        setIsHomeActive(true);
        break;
      case '/dashboard':
        setIsDashboardActive(true);
        break;
      case '/questions':
        setIsQuestionsActive(true);
        break;
      case '/info':
        setIsInfoActive(true);
        break;
      default:
        // Handle any other cases here
        break;
    }
  }, [pathname]);

  return {
    isHomeActive,
    isDashboardActive,
    isQuestionsActive,
    isInfoActive,
  };
};

export default useNavigation;