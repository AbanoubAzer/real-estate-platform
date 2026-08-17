import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="font-en font-bold text-2xl tracking-tight text-background">Buhoor</span>
            <span className="font-en font-semibold text-2xl text-accent">Realty</span>
          </div>
          <p className="font-ar text-sm opacity-80 max-w-sm mb-4 leading-relaxed">
            بحور العقارية هي منصتك الأولى للبحث عن العقارات المتميزة في جميع أنحاء الجمهورية.
          </p>
          <p className="font-en text-sm opacity-80 max-w-sm leading-relaxed">
            Buhoor Realty is your premier destination for finding exceptional properties across the country.
          </p>
        </div>
        
        <div>
          <h4 className="font-en font-semibold text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 font-en text-sm opacity-80">
            <li><a href="#" className="hover:text-accent transition-colors">Properties</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Agents</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-en font-semibold text-lg mb-4">Contact</h4>
          <ul className="space-y-2 font-en text-sm opacity-80">
            <li>Email: info@buhoorrealty.com</li>
            <li>Phone: +20 123 456 7890</li>
            <li>Address: New Cairo, Egypt</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-sm opacity-60 font-en">
        &copy; {new Date().getFullYear()} Buhoor Realty. All rights reserved.
      </div>
    </footer>
  );
};
