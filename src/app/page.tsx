'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import AuthModal from '@/components/auth/AuthModal';
import {
  ChartBarIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Track Applications',
    description: 'Keep all your job applications organized in one place. Never lose track of where you applied.',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Interview Management',
    description: 'Schedule and manage interviews with an integrated calendar system. Get timely notifications.',
    icon: CalendarIcon,
  },
  {
    name: 'Analytics Dashboard',
    description: 'Get insights into your application success rate and track your progress over time.',
    icon: ChartBarIcon,
  },
  {
    name: 'Smart Notifications',
    description: 'Stay on top of upcoming interviews and application deadlines with timely reminders.',
    icon: BellAlertIcon,
  },
];

const stats = [
  { id: 1, name: 'Active Users', value: '1,000+' },
  { id: 2, name: 'Applications Tracked', value: '50,000+' },
  { id: 3, name: 'Success Rate', value: '85%' },
  { id: 4, name: 'Time Saved', value: '10hrs/week' },
];

export default function LandingPage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Manage Your Job Search Journey Like a Pro
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              CareerTrack Pro helps you stay organized and focused during your job search. Track applications,
              manage interviews, and get insights to make better decisions.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <button
                onClick={() => {
                  setAuthModalTab('register');
                  setShowAuthModal(true);
                }}
                className="rounded-md bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              >
                Get started for free
              </button>
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setShowAuthModal(true);
                }}
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Sign in <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <img
                src="dashboard-preview.png"
                alt="App screenshot"
                width={2432}
                height={1442}
                className="w-[76rem] rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-teal-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Streamline Your Job Search
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            All the tools you need to manage your job applications effectively in one place.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by job seekers worldwide
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join thousands of professionals who use CareerTrack Pro to land their dream jobs.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col gap-y-3 border-l border-gray-900/10 pl-6">
              <dt className="text-sm leading-6 text-gray-600">{stat.name}</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* CTA Section */}
      <div className="mx-auto mt-32 max-w-7xl sm:mt-56">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start managing your job search today
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
            Join thousands of job seekers who have streamlined their job search process with CareerTrack Pro.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                setAuthModalTab('register');
                setShowAuthModal(true);
              }}
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started for free
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto mt-32 max-w-7xl px-6 pb-8 lg:px-8">
        <div className="border-t border-gray-900/10 pt-8">
          <p className="text-sm leading-5 text-gray-500">&copy; 2024 CareerTrack Pro. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
} 