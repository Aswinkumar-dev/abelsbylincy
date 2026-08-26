import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Toast from './Toast';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Toast />
    </>
  );
}
