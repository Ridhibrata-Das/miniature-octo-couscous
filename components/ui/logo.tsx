"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image 
        src="/Logo.jpeg" 
        alt="Positron Logo" 
        width={32} 
        height={32}
        className="rounded-md"
      />
      <span className="font-semibold text-xl text-primary">Positron</span>
    </div>
  );
}