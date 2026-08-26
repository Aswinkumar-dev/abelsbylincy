import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';
import CollectionsPage from './pages/CollectionsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import PolicyPage from './pages/PolicyPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPage from './pages/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><HomePage /></Layout>,
  },
  {
    path: '/shop',
    element: <Layout><ShopPage /></Layout>,
  },
  {
    path: '/product',
    element: <Layout><ProductPage /></Layout>,
  },
  {
    path: '/cart',
    element: <Layout><CartPage /></Layout>,
  },
  {
    path: '/checkout',
    element: <Layout><CheckoutPage /></Layout>,
  },
  {
    path: '/account',
    element: <Layout><AccountPage /></Layout>,
  },
  {
    path: '/wishlist',
    element: <Layout><WishlistPage /></Layout>,
  },
  {
    path: '/collections',
    element: <Layout><CollectionsPage /></Layout>,
  },
  {
    path: '/about',
    element: <Layout><AboutPage /></Layout>,
  },
  {
    path: '/contact',
    element: <Layout><ContactPage /></Layout>,
  },
  {
    path: '/faq',
    element: <Layout><FaqPage /></Layout>,
  },
  {
    path: '/policy',
    element: <Layout><PolicyPage /></Layout>,
  },
  {
    path: '/admin',
    element: <AdminPage />, // Admin page renders its own sidebar and layout
  },
  {
    path: '*',
    element: <Layout><NotFoundPage /></Layout>,
  },
]);
