import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Toast from './Toast';
import FloatingWidgets from './FloatingWidgets';
import SEO from './SEO';
import { useStore } from '../context/StoreContext';

export default function Layout({ children }) {
  const location = useLocation();
  const { currentUser } = useStore();

  const isAuthScreen = location.pathname === '/account' && !currentUser;
  const validPaths = ['/', '/shop', '/product', '/cart', '/checkout', '/account', '/wishlist', '/collections', '/about', '/contact', '/faq', '/policy', '/admin'];
  const is404Route = !validPaths.includes(location.pathname.toLowerCase());
  const hideNavigation = isAuthScreen || is404Route;

  // Always scroll to top of page on route / page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
      <SEO />
      {!hideNavigation && <Header />}
      <main>{children}</main>
      {!hideNavigation && <Footer />}
      <Toast />
      {!hideNavigation && <FloatingWidgets />}
    </>
  );
}
