import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-700" />
          <span className="font-bold text-slate-900">Neom</span>
          <span className="text-xs text-slate-500">University Applications</span>
        </div>
        <div className="flex gap-6 text-sm text-slate-600">
          <Link href="/signup" className="hover:text-blue-700 transition-colors">Get Started</Link>
          <Link href="/login" className="hover:text-blue-700 transition-colors">Sign In</Link>
          <a href="mailto:support@neom.edu" className="hover:text-blue-700 transition-colors">Contact</a>
        </div>
        <p className="text-xs text-slate-400">&copy; 2026 Neom. All rights reserved.</p>
      </div>
    </footer>
  );
}
