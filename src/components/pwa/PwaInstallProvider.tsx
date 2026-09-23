"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Laptop, Sparkles, X, RefreshCw, Zap, ShieldCheck } from "lucide-react";

interface PwaInstallContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  isUpdateAvailable: boolean;
  newVersion: string;
  applyUpdate: () => void;
  checkForUpdates: () => Promise<void>;
}

const PwaInstallContext = createContext<PwaInstallContextType>({
  isInstallable: false,
  isInstalled: false,
  promptInstall: async () => {},
  isUpdateAvailable: false,
  newVersion: "v2.1.0",
  applyUpdate: () => {},
  checkForUpdates: async () => {},
});

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(true);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [newVersion, setNewVersion] = useState<string>("v2.1.0");
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // 1. Check if running in Standalone Desktop App Mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: window-controls-overlay)").matches ||
        (navigator as any).standalone === true;

      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }

    // Check if prompt was captured by head inline script
    if (typeof window !== "undefined" && (window as any).deferredPwaPrompt) {
      setDeferredPrompt((window as any).deferredPwaPrompt);
      setIsInstallable(true);
    }

    // 2. Register Service Worker and Monitor for Updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setSwRegistration(reg);

          // Check if a new service worker is waiting to activate
          if (reg.waiting) {
            setIsUpdateAvailable(true);
          }

          reg.addEventListener("updatefound", () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.addEventListener("statechange", () => {
                if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("EcoDigiTech PWA ServiceWorker registration failed:", err);
        });

      // Reload controller change listener ONLY when explicitly requested by user
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing && (window as any).__USER_REQUESTED_PWA_UPDATE__) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // 3. Listen for browser beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPwaPrompt = e;
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      (window as any).deferredPwaPrompt = null;
      console.log("EcoDigiTech POS Application successfully installed on system!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      }
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      if (swRegistration) {
        await swRegistration.update();
        if (swRegistration.waiting) {
          setIsUpdateAvailable(true);
          return;
        }
      }
      const res = await fetch("/api/app/version");
      if (res.ok) {
        const data = await res.json();
        // Only mark update available if remote version differs from current client version
        if (data.version && data.version !== "2.1.0") {
          setNewVersion(`v${data.version}`);
          setIsUpdateAvailable(true);
        }
      }
    } catch (err) {
      console.warn("Check for updates failed:", err);
    }
  };

  const applyUpdate = () => {
    if (typeof window !== "undefined") {
      (window as any).__USER_REQUESTED_PWA_UPDATE__ = true;
    }
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      // Reload safely preserving PostgreSQL database records and local storage
      window.location.reload();
    }
  };

  const promptInstall = async () => {
    const targetPrompt = deferredPrompt || (typeof window !== "undefined" ? (window as any).deferredPwaPrompt : null);

    if (targetPrompt) {
      try {
        targetPrompt.prompt();
        const choice = await targetPrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          if (typeof window !== "undefined") {
            (window as any).deferredPwaPrompt = null;
          }
        }
      } catch (err) {
        console.error("Error triggering native PWA install prompt:", err);
      }
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);
    }
  };

  return (
    <PwaInstallContext.Provider
      value={{
        isInstallable,
        isInstalled,
        promptInstall,
        isUpdateAvailable,
        newVersion,
        applyUpdate,
        checkForUpdates,
      }}
    >
      {children}

      {/* Professional Desktop Installer Floating Toast Banner */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-slate-900/95 border border-fuchsia-500/40 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 fade-in duration-200 print:hidden flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white shrink-0 shadow-md">
            <Laptop className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-white tracking-tight flex items-center gap-1.5">
                <span>EcoDigiTech Native App Installer</span>
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              </h4>
              <button
                onClick={() => setShowToast(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11.5px] text-slate-300 font-medium leading-relaxed">
              To launch as a desktop app on your computer, click the <strong className="text-fuchsia-300 font-bold">Install App (💻 / ⊕)</strong> icon on the right end of your browser address bar.
            </p>
          </div>
        </div>
      )}
    </PwaInstallContext.Provider>
  );
}

export const usePwaInstall = () => useContext(PwaInstallContext);
