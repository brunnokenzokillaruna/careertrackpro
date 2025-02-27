import React from 'react';
import Navbar from './Navbar';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// Define base navigation items without any path manipulation
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Applications', href: '/applications', icon: BriefcaseIcon },
  { name: 'Monthly Summary', href: '/monthly-summary', icon: ChartBarIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Simplified active path check
  const isActivePath = (href: string) => {
    return router.pathname === href;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

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
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-teal-50 text-teal-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-6 w-6 flex-shrink-0 ${
                            isActive
                              ? 'text-teal-600'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }`}
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
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-teal-50 text-teal-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-6 w-6 flex-shrink-0 ${
                            isActive
                              ? 'text-teal-600'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }`}
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
};

export default Layout; 