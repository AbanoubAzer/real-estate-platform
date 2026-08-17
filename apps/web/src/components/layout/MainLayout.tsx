import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-en bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* React Router will render child routes here */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
