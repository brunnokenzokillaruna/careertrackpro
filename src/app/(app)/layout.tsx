'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/careertrackpro' : '';
};

const navigationItems = [
  { name: 'Dashboard', href: `${getBasePath()}/dashboard`, icon: HomeIcon },
  { name: 'Applications', href: `${getBasePath()}/applications`, icon: BriefcaseIcon },
  { name: 'Monthly Summary', href: `${getBasePath()}/monthly-summary`, icon: ChartBarIcon },
];

const secondaryNavigation = [
  { name: 'Settings', href: `${getBasePath()}/settings`, icon: Cog6ToothIcon },
  { name: 'Help', href: `${getBasePath()}/help`, icon: QuestionMarkCircleIcon },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(getBasePath() + '/');
      }
    };
    checkAuth();
  }, [router]);

  const isActivePath = (href: string) => {
    return pathname === href;
  };

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
                    const isActive = isActivePath(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`nav-link w-full text-left flex items-center ${isActive ? 'nav-link-active' : ''}`}
                      >
                        <item.icon 
                          className={`nav-icon ${isActive ? 'nav-icon-active' : ''}`} 
                          aria-hidden="true" 
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>

                {/* Secondary Navigation */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  {secondaryNavigation.map((item) => {
                    const isActive = isActivePath(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`nav-link w-full text-left flex items-center ${isActive ? 'nav-link-active' : ''}`}
                      >
                        <item.icon 
                          className={`nav-icon ${isActive ? 'nav-icon-active' : ''}`} 
                          aria-hidden="true" 
                        />
                        {item.name}
                      </Link>
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