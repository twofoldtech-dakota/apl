import { type ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
