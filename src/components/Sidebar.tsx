'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const { admin, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If not authenticated or on login page, don't show the sidebar wrapper
  if (!isAuthenticated || pathname === '/login') {
    return <>{children}</>;
  }

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Doctors', path: '/doctors', icon: Stethoscope },
    { label: 'Patients', path: '/patients', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-card text-card-foreground border-r border-border">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none tracking-tight">Doctor Tracker</h1>
          <span className="text-xs text-muted-foreground font-medium">Internal Admin Portal</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Actions */}
      <div className="p-4 border-t border-border space-y-4">
        {/* Admin Card */}
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm">
            {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{admin?.name || 'Administrator'}</p>
            <p className="text-xs text-muted-foreground truncate">{admin?.email || 'admin@doctortracker.com'}</p>
          </div>
        </div>

        {/* Theme and Logout Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-2 border border-border rounded-lg text-xs font-medium hover:bg-secondary transition-all cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            )}
          </button>
          
          <button
            onClick={logout}
            className="flex items-center justify-center p-2 rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar (Left side) */}
      <aside className="hidden md:block w-64 h-full shrink-0">
        {navContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-border bg-card text-card-foreground">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-lg leading-none">Doctor Tracker</h1>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 border border-border rounded-lg hover:bg-secondary transition-all cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Overlay Menu */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="relative w-64 max-w-xs h-full z-50">
              {navContent}
            </div>
          </div>
        )}

        {/* Page Inner Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
export default Sidebar;
