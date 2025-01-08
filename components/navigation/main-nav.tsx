// components/navigation/main-nav.tsx
"use client"; 
import React from "react";
import Link from "next/link";

export function MainNav() {
  return (
    <header className="w-full border-b border-primary/20 bg-secondary">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        {/* Brand Logo or Title */}
        <div className="flex items-center space-x-2 font-bold text-xl">
          <span className="text-accentGreen">Peak</span>
          <span className="text-primary">Metrix</span>
        </div>

        {/* Simple Nav Links */}
        <nav className="space-x-4">
          <Link href="/">Home</Link>
          <Link href="/community">Community</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}
