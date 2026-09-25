"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-700">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">Neom</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-slate-600 hover:text-blue-700 transition-colors">Features</Link>
          <Link href="#process" className="text-sm text-slate-600 hover:text-blue-700 transition-colors">Process</Link>
          <Link href="#universities" className="text-sm text-slate-600 hover:text-blue-700 transition-colors">Universities</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="secondary" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        <button className="md:hidden p-2 text-slate-600" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3">
          <Link href="#features" className="block text-sm text-slate-600 py-2" onClick={() => setOpen(false)}>Features</Link>
          <Link href="#process" className="block text-sm text-slate-600 py-2" onClick={() => setOpen(false)}>Process</Link>
          <Link href="#universities" className="block text-sm text-slate-600 py-2" onClick={() => setOpen(false)}>Universities</Link>
          <Link href="/login" className="block text-sm text-slate-600 py-2" onClick={() => setOpen(false)}>Sign In</Link>
          <Link href="/signup" onClick={() => setOpen(false)}>
            <Button className="w-full" size="sm">Get Started</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
