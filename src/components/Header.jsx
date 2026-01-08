import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';

const Header = ({ onNavigate, isTransparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#', action: () => onNavigate('home') },
    { name: 'Experiences', href: '#experiences', action: () => onNavigate('experiences') },
    { name: 'About', href: '#about', action: () => onNavigate('home') },
    { name: 'Contact', href: '#contact', action: () => onNavigate('home') },
  ];

  const handleNavClick = (e, link) => {
    e.preventDefault();
    if (link.action) {
      link.action();
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6',
        isScrolled || isMenuOpen
          ? 'bg-white/70 backdrop-blur-md shadow-sm border-b border-gray-200/50 py-4'
          : 'bg-transparent shadow-none border-b-0 py-6'
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <a 
          href="#" 
          className={clsx(
            "font-serif text-2xl font-bold transition-colors duration-300",
            isTransparent && !isScrolled && !isMenuOpen ? "text-white" : "text-[#064E3B]"
          )}
        >
          Queen of the Hills
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              className={clsx(
                "font-medium transition-colors duration-300 relative group hover:text-[#D97706]",
                isTransparent && !isScrolled ? "text-white" : "text-[#064E3B]"
              )}
            >
              {link.name}
              <span className={clsx(
                "absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                isTransparent && !isScrolled ? "bg-white" : "bg-[#D97706]"
              )} />
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={clsx(
            "md:hidden p-2 focus:outline-none min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors duration-300",
            isTransparent && !isScrolled && !isMenuOpen ? "text-white" : "text-[#064E3B]"
          )}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={clsx(
          'md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg transition-all duration-300 overflow-hidden',
          isMenuOpen ? 'max-h-screen py-4' : 'max-h-0'
        )}
      >
        <nav className="flex flex-col space-y-4 px-6 pb-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[#064E3B] text-lg font-medium py-2 border-b border-gray-100 hover:text-[#D97706] transition-colors min-h-[48px] flex items-center"
              onClick={(e) => handleNavClick(e, link)}
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
