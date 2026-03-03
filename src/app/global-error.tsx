"use client";

import { useEffect } from "react";

// Catches errors that bubble past all nested error.tsx boundaries (incl. root layout)
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0a0e1a", color: "#e8eaf0" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <p style={{ fontSize: "5rem", fontWeight: 900, color: "rgba(0,212,170,0.15)", margin: 0 }}>500</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Something went wrong</h1>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              An unexpected error occurred. Please try again.
              {error.digest && (
                <span style={{ display: "block", marginTop: "0.25rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#4b5563" }}>
                  Ref: {error.digest}
                </span>
              )}
            </p>
            <button
              onClick={reset}
              style={{ background: "#00d4aa", color: "#0a0e1a", border: "none", padding: "0.5rem 1.5rem", borderRadius: "0.5rem", fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
