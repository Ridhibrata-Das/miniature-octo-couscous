"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "About", href: "/about" },
];

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}