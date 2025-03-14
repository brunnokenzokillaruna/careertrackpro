import React, { useEffect } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import '../lib/supabase/patchSupabaseClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareerTrack Pro',
  description: 'Job Application Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
} 