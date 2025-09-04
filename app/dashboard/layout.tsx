'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Bell, 
  Lightbulb,
  Menu,
  X,
  LogOut,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    path: '/dashboard/sensors',
    label: 'Sensors',
    icon: Activity
  },
  {
    path: '/dashboard/alerts',
    label: 'Alerts',
    icon: Bell
  },
  {
    path: '/dashboard/recommendations',
    label: 'Recommendations',
    icon: Lightbulb
  },
  {
    path: '/dashboard/balaram-ai',
    label: 'Balaram AI',
    icon: Bot
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Smart Agri</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hidden lg:flex"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="mt-6 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mb-1"
          >
            <item.icon className="h-5 w-5" />
            <span className="mx-4">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-start text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-2">Logout</span>
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 relative hidden lg:block`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold">Smart Agri</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="p-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-16 lg:pt-0">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  );
} 