import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface NavItem {
  id: string;
  label: string;
}

export function StickyProductNav() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isSticky, setIsSticky] = useState(false);

  const navItems: NavItem[] = [
    { id: 'overview', label: t('productDetail.nav.overview', { defaultValue: 'Overview' }) },
    { id: 'gallery', label: t('productDetail.nav.gallery', { defaultValue: 'Gallery' }) },
    { id: 'downloads', label: t('productDetail.nav.downloads', { defaultValue: 'Downloads' }) },
    { id: 'colors', label: t('productDetail.nav.colors', { defaultValue: 'Colors' }) },
    { id: 'specs', label: t('productDetail.nav.specs', { defaultValue: 'Specs' }) },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Make sticky after scrolling past the hero section (roughly 600px)
      setIsSticky(window.scrollY > 600);

      // Determine active section
      let current = '';
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the top of the section is near the top of the viewport
          if (rect.top <= 100) {
            current = item.id;
          }
        }
      }
      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      // Offset for sticky header and nav
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className={`w-full z-40 transition-all duration-300 border-b border-gray-200 bg-white ${
        isSticky ? 'fixed top-[80px] left-0 shadow-md' : 'relative'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex items-center space-x-8 overflow-x-auto hide-scrollbar py-4">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              className={`whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-colors ${
                activeSection === item.id 
                  ? 'text-mammut-gold border-b-2 border-mammut-gold pb-1' 
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
