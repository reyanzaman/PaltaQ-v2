"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import SideNav from '@/app/components/sidebar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Example breakpoint for mobile
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionProvider>
          <SideNav 
            isMobile={isMobile}
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
          {children}
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}