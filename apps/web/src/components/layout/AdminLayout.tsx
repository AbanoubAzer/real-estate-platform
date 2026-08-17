import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Home, Users, Settings, LogOut } from 'lucide-react';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen flex font-en bg-gray-50 text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-background flex flex-col shadow-xl flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Buhoor Realty Logo" className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-background">Buhoor</span>
            <span className="font-semibold text-xl text-accent">Admin</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-accent font-medium">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/admin/properties" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-white/80 hover:text-white">
            <Home size={20} />
            Properties
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-white/80 hover:text-white">
            <Users size={20} />
            Users & Agents
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-white/80 hover:text-white">
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg hover:bg-red-500/20 text-red-400 transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-background flex items-center justify-between px-8 border-b border-gray-200 shadow-sm flex-shrink-0">
          <h1 className="text-xl font-bold text-primary">Dashboard Overview</h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
