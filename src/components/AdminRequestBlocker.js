"use client";

import { useEffect, useState } from "react";

const isMutation = (input, init) => {
  const method = String(init?.method || (typeof input === "object" && input?.method) || "GET").toUpperCase();
  return !["GET", "HEAD", "OPTIONS"].includes(method);
};

// All admin CRUD calls use fetch. Tracking mutation requests in one place keeps
// every page safe from repeated clicks while a create, update, delete, or upload
// is still being processed.
export default function AdminRequestBlocker() {
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = (...args) => {
      const blocksInteraction = isMutation(args[0], args[1]);
      if (blocksInteraction) setPendingRequests((count) => count + 1);

      return Promise.resolve(originalFetch(...args)).finally(() => {
        if (blocksInteraction) setPendingRequests((count) => Math.max(0, count - 1));
      });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!pendingRequests) return null;

  return (
    <div className="fixed inset-0 z-[100] flex cursor-wait items-center justify-center bg-slate-950/35 p-4" role="status" aria-live="assertive" aria-label="Saving changes">
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 text-sm font-semibold text-gray-800 shadow-2xl">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" aria-hidden="true" />
        Saving changes… please wait
      </div>
    </div>
  );
}
