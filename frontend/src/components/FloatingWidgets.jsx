import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function FloatingWidgets() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const whatsappUrl = `https://wa.me/61435927824?text=${encodeURIComponent('Hi Lincy I wanted to know more about your products')}`;

  return (
    <>
      {/* Scroll-To-Top Arrow Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`back-to-top-widget ${isVisible ? 'is-visible' : ''}`}
        aria-label="Back to top"
        title="Scroll to top"
      >
        <ChevronUp style={{ width: 22, height: 22 }} />
      </button>

      {/* Floating Glowing WhatsApp Button with Hover Label */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-widget"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <img
          src="/assets/whatsapp.png"
          alt="WhatsApp Logo"
          className="wa-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg';
          }}
        />
        <span className="wa-label">Chat on WhatsApp</span>
      </a>
    </>
  );
}
