import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-fuchsia-500 selection:text-white font-sans antialiased">
      {/* Top Light Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl px-6 py-3 select-none shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src="/brand/logo.png"
              alt="EcoDigiTech Official Logo"
              width={220}
              height={70}
              className="h-12 sm:h-14 w-auto object-contain group-hover:scale-105 transition-transform"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-fuchsia-700 transition-colors">Features</a>
            <a href="#modules" className="hover:text-fuchsia-700 transition-colors">Modules</a>
            <a href="#pricing" className="hover:text-fuchsia-700 transition-colors">Pricing</a>
            <a href="#security" className="hover:text-fuchsia-700 transition-colors">Security</a>
          </nav>

          <div className="flex items-center space-x-3">
            <a
              href="https://pos.ecodigitech.com/pos/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl transition-colors hidden sm:block"
            >
              Sign In
            </a>
            <a
              href="https://pos.ecodigitech.com"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-fuchsia-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Merchant Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Light Footer with Bigger Left Logo */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <Image
              src="/brand/logo.png"
              alt="EcoDigiTech Official Logo"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
            />
            <div className="border-l border-slate-200 pl-4 py-0.5 space-y-0.5">
              <p className="font-bold text-slate-800 text-xs">EcoDigiTech Retail & Repair</p>
              <p className="text-[11px] text-slate-500 font-medium">
                Powered by EcoDigiTech | <a href="https://pos.ecodigitech.com" className="text-fuchsia-800 font-extrabold hover:underline">pos.ecodigitech.com</a>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-slate-600 text-xs">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-fuchsia-700" />
              <span>Section 15(5) Margin Tax Compliant</span>
            </span>
            <span>•</span>
            <span className="font-mono text-fuchsia-800 font-bold">Sub-50ms Hardware Scanning</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
