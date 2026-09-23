"use client";

import { useEffect, useRef } from "react";

interface BarcodeScannerOptions {
  onScan: (scannedString: string) => void;
  timeOutMs?: number; // Maximum time between keystrokes (default 50ms)
  minChars?: number;  // Minimum length of scanned barcode (default 3)
}

/**
 * Global Hardware Barcode Scanner Listener Hook
 * Captures HID hardware scanner keydown bursts (< 50ms interval).
 * On 'Enter', dispatches the scanned barcode string directly to the cart handler.
 */
export function useBarcodeScanner({
  onScan,
  timeOutMs = 50,
  minChars = 3,
}: BarcodeScannerOptions) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event || typeof event.key !== "string") {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Handle Enter key terminating sequence
      if (event.key === "Enter") {
        if (bufferRef.current.length >= minChars) {
          event.preventDefault();
          onScan(bufferRef.current.trim());
        }
        bufferRef.current = "";
        return;
      }

      // Ignore modifier keys, Tab, Escape, etc.
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.key.length > 1
      ) {
        return;
      }

      // If time interval > 50ms and NOT in a fast burst, reset buffer (unless not focused)
      if (timeDiff > timeOutMs) {
        // If user is focused on an input and typing slowly (> 50ms), let standard input handle it
        if (isInputFocused) {
          bufferRef.current = event.key;
          return;
        }
        bufferRef.current = "";
      }

      bufferRef.current += event.key;
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onScan, timeOutMs, minChars]);
}
