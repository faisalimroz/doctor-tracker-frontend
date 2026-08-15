import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Doctor Tracker Admin Portal',
  description: 'Production-ready dashboard for tracking doctors, hospital affiliations, patient admissions, and healthcare analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <Sidebar>{children}</Sidebar>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
