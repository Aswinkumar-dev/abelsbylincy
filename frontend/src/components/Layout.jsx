import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Toast from './Toast';
import { useStore } from '../context/StoreContext';

export default function Layout({ children }) {
  const location = useLocation();
  const { currentUser } = useStore();

  const isAuthScreen = location.pathname === '/account' && !currentUser;

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
      {!isAuthScreen && <Header />}
      <main>{children}</main>
      {!isAuthScreen && <Footer />}
      <Toast />
    </>
  );
}
