"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 group-hover:glow-cyan transition-all">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white">Neom</span>
            <span className="text-xs text-cyan-400 ml-1.5 font-mono">NEMP</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Features</Link>
          <Link href="#process" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Process</Link>
          <Link href="#universities" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Universities</Link>
          <Link href="/student" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Student Portal</Link>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Admin</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="secondary" size="sm">Sign In</Button>
          </Link>
          <Link href="/student/apply">
            <Button size="sm">Start Application</Button>
          </Link>
        </div>

        <button className="md:hidden p-2 text-slate-400" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5 px-6 py-4 space-y-3"
          >
            <Link href="#features" className="block text-sm text-slate-400 py-2" onClick={() => setOpen(false)}>Features</Link>
            <Link href="#process" className="block text-sm text-slate-400 py-2" onClick={() => setOpen(false)}>Process</Link>
            <Link href="/student" className="block text-sm text-slate-400 py-2" onClick={() => setOpen(false)}>Student Portal</Link>
            <Link href="/admin" className="block text-sm text-slate-400 py-2" onClick={() => setOpen(false)}>Admin</Link>
            <Link href="/student/apply" onClick={() => setOpen(false)}>
              <Button className="w-full" size="sm">Start Application</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
