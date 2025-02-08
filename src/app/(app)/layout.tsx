'use client';

import React from 'react';
import Navbar from '@/components/common/Navbar';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  CalendarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Applications', href: '/applications', icon: BriefcaseIcon },
  { name: 'Monthly Summary', href: '/monthly-summary', icon: ChartBarIcon },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
          <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white">
            {/* Logo */}
            <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-teal-600">CareerTrack Pro</h1>
            </div>

            {/* Navigation */}
            <div className="flex flex-grow flex-col">
              <nav className="flex-1 space-y-1 px-2 py-4">
                {/* Primary Navigation */}
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                      >
                        <item.icon 
                          className={`nav-icon ${isActive ? 'nav-icon-active' : ''}`} 
                          aria-hidden="true" 
                        />
                        {item.name}
                      </a>
                    );
                  })}
                </div>

                {/* Secondary Navigation */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  {secondaryNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                      >
                        <item.icon 
                          className={`nav-icon ${isActive ? 'nav-icon-active' : ''}`} 
                          aria-hidden="true" 
                        />
                        {item.name}
                      </a>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 