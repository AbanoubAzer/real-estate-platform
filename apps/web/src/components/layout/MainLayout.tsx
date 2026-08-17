import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ComparisonTray } from '../../features/comparison/components/ComparisonTray';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-en bg-background text-foreground relative pb-16 md:pb-0">
      <Header />
      <main className="flex-grow">
        {/* React Router will render child routes here */}
        <Outlet />
      </main>
      <ComparisonTray />
      <Footer />
    </div>
  );
};

