import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { Process } from "@/components/landing/Process";
import { Universities } from "@/components/landing/Universities";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <Hero />
      <Features />
      <Process />
      <Universities />
      <Footer />
    </main>
  );
}
