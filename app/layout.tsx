"use client";

import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import { Toaster } from 'sonner';
import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

function AppContent({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <AppContent>
          <nav className="fixed top-0 w-full bg-white border-b z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center space-x-3">
                  <Image 
                    src="/Logo.jpeg" 
                    alt="Positron Logo" 
                    width={40} 
                    height={40}
                    className="rounded-md"
                  />
                  <span className="text-xl font-bold text-gray-900">Positron</span>
                </Link>
                <div className="flex space-x-4">
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    About
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="pt-16">
            {children}
            <Toaster position="top-right" />
            <Script src="https://elevenlabs.io/convai-widget/index.js" strategy="lazyOnload" />
          </main>
        </AppContent>
      </body>
    </html>
  );
}
