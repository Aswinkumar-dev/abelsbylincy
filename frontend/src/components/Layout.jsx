import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Toast from './Toast';

export default function Layout({ children }) {
  const location = useLocation();

  // Automatic Pageview Tracking across React SPA navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-C80KWBEZEL', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Toast />
    </>
  );
}
