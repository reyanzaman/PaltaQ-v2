'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

const useNavigation = () => {
  const pathname = usePathname();
  const [isHomeActive, setIsHomeActive] = useState(false);
  const [isDashboardActive, setIsDashboardActive] = useState(false);
  const [isQuestionsActive, setIsQuestionsActive] = useState(false);
  const [isInfoActive, setIsInfoActive] = useState(false);
  const [isAdminActive, setIsAdminActive] = useState(false);

  useEffect(() => {
    setIsHomeActive(false);
    setIsDashboardActive(false);
    setIsQuestionsActive(false);
    setIsInfoActive(false);
    setIsAdminActive(false);

    switch (pathname) {
      case '/':
        setIsHomeActive(true);
        break;
      case '/pages/dashboard':
        setIsDashboardActive(true);
        break;
      case '/pages/questions':
        setIsQuestionsActive(true);
        break;
      case '/pages/info':
        setIsInfoActive(true);
        break;
      case '/pages/admin':
        setIsAdminActive(true);
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
    isAdminActive,
  };
};

export default useNavigation;