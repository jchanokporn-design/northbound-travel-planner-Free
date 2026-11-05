import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Northbound — Northern Thailand Road Trip', description: 'Trip planner for an 11-day Northern Thailand road trip, 19–29 December 2026.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body>{children}</body></html>; }
