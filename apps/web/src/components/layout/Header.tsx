import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Globe, Heart } from 'lucide-react';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'شراء', path: '/buy' },
    { name: 'إيجار', path: '/rent' },
    { name: 'المشروعات', path: '/projects' },
    { name: 'الوكلاء', path: '/agents' },
    { name: 'المقالات', path: '/blog' },
    { name: 'تواصل معنا', path: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-white py-4'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Right Side (RTL Start) - Logo */}
        <Link to="/" className="flex items-center">
          <img src="/buhoor-logo.jpg" alt="Buhoor Realty بحور العقارية" className="h-16 object-contain" />
        </Link>

        {/* Center - Navigation */}
        <nav className="hidden lg:flex items-center gap-8 font-medium text-gray-700 text-sm">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`relative py-2 transition-colors hover:text-accent ${isActive ? 'text-accent font-bold' : ''}`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-md" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Left Side (RTL End) - Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <button className="flex items-center gap-1.5 text-primary font-bold text-sm hover:text-accent transition-colors">
            <Globe size={18} />
            <span className="font-en mt-1">AR</span>
          </button>
          
          <button className="text-gray-600 hover:text-red-500 transition-colors">
            <Heart size={20} />
          </button>
          
          <Link 
            to="/admin" 
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-all shadow-sm"
          >
            تسجيل الدخول
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-2xl py-4 flex flex-col lg:hidden">
          {navLinks.map((link) => (
             <Link key={link.name} to={link.path} className="px-6 py-3 hover:bg-gray-50 text-primary font-medium border-b border-gray-50">
               {link.name}
             </Link>
          ))}
          <div className="px-6 py-4 flex items-center justify-between">
            <button className="flex items-center gap-2 text-primary font-bold">
              <Globe size={20} /> AR
            </button>
            <Link to="/admin" className="bg-primary text-white px-8 py-2.5 rounded-lg font-bold shadow-sm">تسجيل الدخول</Link>
          </div>
        </div>
      )}
    </header>
  );
};
