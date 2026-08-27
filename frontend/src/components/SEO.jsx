import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function SEO() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(location.search.toLowerCase());
    const category = searchParams.get('category');

    let title = "Abel’s by Lincy | Anti-Tarnish Gold-Plated Jewellery Australia";
    let description = "Shop stylish anti-tarnish gold-plated jewellery from Abel’s by Lincy, a Sydney-based Australian jewellery brand offering elegant and affordable pieces for every occasion.";

    if (pathname === '/about') {
      title = "About Abel’s by Lincy | Sydney Jewellery Brand";
      description = "Discover the story behind Abel’s by Lincy, a Sydney-based jewellery brand created to make stylish, affordable and quality jewellery accessible to women in Australia.";
    } else if (pathname === '/contact') {
      title = "Contact Abel’s by Lincy | Jewellery Australia";
      description = "Have a question about our jewellery or your order? Get in touch with Abel’s by Lincy, a Sydney-based Australian jewellery brand.";
    } else if (pathname === '/shop') {
      if (category === 'earrings') {
        title = "Gold-Plated Earrings Australia | Abel’s by Lincy";
        description = "Shop stylish anti-tarnish gold-plated earrings from Abel’s by Lincy. Discover elegant designs for everyday wear and special occasions.";
      } else if (category === 'necklaces') {
        title = "Gold-Plated Necklaces Australia | Abel’s by Lincy";
        description = "Discover elegant anti-tarnish gold-plated necklaces from Abel’s by Lincy, designed to complement everyday and occasion wear.";
      } else if (category === 'rings') {
        title = "Gold-Plated Rings Australia | Abel’s by Lincy";
        description = "Explore stylish anti-tarnish gold-plated rings from Abel’s by Lincy, with elegant designs made for everyday and occasion wear.";
      } else if (category === 'bracelets') {
        title = "Gold-Plated Bracelets Australia | Abel’s by Lincy";
        description = "Shop elegant anti-tarnish gold-plated bracelets from Abel’s by Lincy, designed for effortless everyday style.";
      } else if (category === 'bangles') {
        title = "Gold-Plated Bangles Australia | Abel’s by Lincy";
        description = "Discover stylish gold-plated bangles from Abel’s by Lincy, perfect for adding an elegant touch to everyday and traditional looks.";
      } else if (category === 'charms') {
        title = "Gold-Plated Charms Australia | Abel’s by Lincy";
        description = "Explore elegant gold-plated charms from Abel’s by Lincy and find pieces to add a personal touch to your jewellery collection.";
      } else {
        title = "Shop Gold-Plated Jewellery | Abel’s by Lincy";
        description = "Explore anti-tarnish gold-plated jewellery from Abel’s by Lincy, with stylish pieces designed for everyday wear and special occasions.";
      }
    } else if (pathname === '/faq') {
      title = "FAQ | Abel’s by Lincy Australia";
      description = "Find answers to frequently asked questions about shipping, delivery, returns, and care instructions for Abel’s by Lincy gold-plated jewellery.";
    } else if (pathname === '/collections') {
      title = "Jewellery Collections | Abel’s by Lincy Australia";
      description = "Browse curated anti-tarnish gold-plated jewellery collections from Abel’s by Lincy Australia.";
    } else if (pathname === '/policy') {
      title = "Customer Policies | Abel’s by Lincy";
      description = "Read our shipping, returns, privacy, and terms & conditions policies for Abel’s by Lincy.";
    }

    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

  }, [location]);

  return null;
}
