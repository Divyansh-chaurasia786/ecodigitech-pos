import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { Header } from "@/components/pos/Header";
import { PosFooter } from "@/components/pos/PosFooter";

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="h-screen w-screen max-h-screen overflow-hidden flex flex-col bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-fuchsia-500 selection:text-white">
        {/* Fixed Top Navigation Header */}
        <Header />

        {/* Main Workstation View - Smooth vertical scrolling when cards exceed screen height */}
        <main className="flex-1 min-h-0 p-2 sm:p-2.5 md:p-3 max-w-[1600px] w-full mx-auto flex flex-col overflow-y-auto">
          {children}
        </main>

        {/* Fixed Bottom Footer */}
        <PosFooter />
      </div>
    </ThemeProvider>
  );
}
