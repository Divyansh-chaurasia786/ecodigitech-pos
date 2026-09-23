export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-lg text-emerald-500">EcoDigiTech</span>
          <span className="text-xs bg-red-950 text-red-400 font-mono px-2.5 py-0.5 rounded border border-red-800">
            SUPER_ADMIN TERMINAL
          </span>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
      <footer className="border-t border-slate-900 py-3 text-center text-xs text-slate-500">
        EcoDigiTech Super Admin Isolation Console
      </footer>
    </div>
  );
}
