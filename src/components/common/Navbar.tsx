'use client';

import React, { Fragment, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Menu, Transition, Popover } from '@headlessui/react';
import { BellIcon, UserCircleIcon, MagnifyingGlassIcon, UserIcon, ArrowRightOnRectangleIcon, KeyIcon } from '@heroicons/react/24/outline';
import { JobApplication } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JobApplication[]>([]);
  const [notifications, setNotifications] = useState<{ id: number; title: string; message: string; date: string }[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userFullName, setUserFullName] = useState('');

  useEffect(() => {
    // Load notifications
    loadNotifications();
    // Load user profile data
    loadUserProfile();
    
    // Add event listener to refresh user profile when storage event is triggered
    const handleStorageEvent = () => {
      loadUserProfile();
    };
    
    window.addEventListener('storage', handleStorageEvent);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, try to get the name from the users table (primary source)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();

      if (userData && userData.name) {
        setUserFullName(userData.name);
        return;
      }

      // If no name in users table or there was an error, try the user_profiles table as fallback
      if (userError) {
        console.log('Error fetching from users table, trying user_profiles:', userError);
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profileData && profileData.full_name) {
        setUserFullName(profileData.full_name);
        
        // Optionally sync the name to users table for consistency
        try {
          await supabase
            .from('users')
            .update({ name: profileData.full_name })
            .eq('id', user.id);
        } catch (syncError) {
          console.error('Error syncing name to users table:', syncError);
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get upcoming interviews (next 7 days)
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const { data: interviews } = await supabase
        .from('interviews')
        .select(`
          *,
          job_applications!inner (
            company,
            position
          )
        `)
        .eq('user_id', user.id)
        .gte('interview_date', now.toISOString())
        .lte('interview_date', nextWeek.toISOString())
        .order('interview_date', { ascending: true });

      if (interviews && interviews.length > 0) {
        const notifs = interviews
          .filter(interview => interview.job_applications) // Filter out interviews with deleted applications
          .map(interview => {
            const interviewDate = new Date(interview.interview_date);
            const daysUntil = Math.ceil((interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            let timeMessage = '';
            if (daysUntil === 0) {
              timeMessage = 'Today';
            } else if (daysUntil === 1) {
              timeMessage = 'Tomorrow';
            } else {
              timeMessage = `In ${daysUntil} days`;
            }

            return {
              id: interview.id,
              title: `Interview ${timeMessage}`,
              message: `Interview at ${interview.job_applications.company} for ${interview.job_applications.position} position`,
              date: interviewDate.toLocaleString('en-US', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })
            };
          });
        setNotifications(notifs);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .or(`company.ilike.%${query}%,position.ilike.%${query}%`)
        .order('applied_date', { ascending: false });

      if (error) throw error;
      setSearchResults(data || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching applications:', error);
      toast.error('Failed to search applications');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any stored credentials
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      
      toast.success('Signed out successfully');
      router.refresh();
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
      console.error('Error:', error);
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <div className="flex flex-1 items-center gap-x-4 lg:gap-x-6">
          <div className="relative flex flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
              className="block h-10 w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-500 sm:text-sm sm:leading-6"
            />

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute mt-12 w-full rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                {searchResults.map((result) => (
                  <a
                    key={result.id}
                    href={`/applications?id=${result.id}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowSearchResults(false)}
                  >
                    <div className="font-medium">{result.company}</div>
                    <div className="text-sm text-gray-500">{result.position}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <Popover className="relative">
            <Popover.Button className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {notifications.length > 0 && (
                  <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </div>
                )}
              </div>
            </Popover.Button>
            <Transition
              as="div"
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-0 z-10 mt-2.5 w-80">
                <div className="rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-900/5">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="px-4 py-2 hover:bg-gray-50"
                      >
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-sm text-gray-500">{notification.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{notification.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative group">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              Click for account options
              <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
            </div>
            <Menu.Button className="-m-1.5 flex items-center p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <span className="sr-only">Open user menu</span>
              <div className="relative">
                <UserCircleIcon className="h-8 w-8 text-teal-600 animate-pulse-subtle" aria-hidden="true" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-teal-600" aria-hidden="true">
                  {userFullName || 'My Account'}
                </span>
                <svg className="ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </Menu.Button>
            <Transition
              as="div"
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-40 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none sm:w-48 max-sm:fixed max-sm:right-2 max-sm:top-14">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/profile"
                      className={`${
                        active ? 'bg-teal-50 text-teal-600' : 'text-gray-900'
                      } block w-full px-3 py-2 sm:py-1 text-left text-sm leading-6 flex items-center`}
                    >
                      <UserIcon className={`h-5 w-5 mr-2 ${active ? 'text-teal-600' : 'text-gray-500'}`} />
                      Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/api-keys"
                      className={`${
                        active ? 'bg-teal-50 text-teal-600' : 'text-gray-900'
                      } block w-full px-3 py-2 sm:py-1 text-left text-sm leading-6 flex items-center`}
                    >
                      <KeyIcon className={`h-5 w-5 mr-2 ${active ? 'text-teal-600' : 'text-gray-500'}`} />
                      API Keys
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleSignOut}
                      className={`${
                        active ? 'bg-teal-50 text-teal-600' : 'text-gray-900'
                      } block w-full px-3 py-2 sm:py-1 text-left text-sm leading-6 flex items-center`}
                    >
                      <ArrowRightOnRectangleIcon className={`h-5 w-5 mr-2 ${active ? 'text-teal-600' : 'text-gray-500'}`} />
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
} 