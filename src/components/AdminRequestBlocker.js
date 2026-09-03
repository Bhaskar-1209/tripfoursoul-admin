"use client";

import { useEffect, useState } from "react";

const isMutation = (input, init) => {
  const method = String(init?.method || (typeof input === "object" && input?.method) || "GET").toUpperCase();
  return !["GET", "HEAD", "OPTIONS"].includes(method);
};

const requestMessage = (input, init) => {
  const method = String(init?.method || (typeof input === "object" && input?.method) || "GET").toUpperCase();
  const url = typeof input === "string" ? input : input?.url || "";
  const path = url.split("?")[0].toLowerCase();

  if (path.includes("/api/auth/login")) return "Signing you in… please wait";
  if (path.includes("/api/upload")) return "Uploading file… please wait";
  if (method === "DELETE") return "Deleting item… please wait";
  if (method === "PUT" || method === "PATCH") return "Updating changes… please wait";
  if (method === "POST") return "Creating item… please wait";
  return "Saving changes… please wait";
};

// All admin CRUD calls use fetch. Tracking mutation requests in one place keeps
// every page safe from repeated clicks while a create, update, delete, or upload
// is still being processed.
export default function AdminRequestBlocker() {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [message, setMessage] = useState("Saving changes… please wait");

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = (...args) => {
      const blocksInteraction = isMutation(args[0], args[1]);
      if (blocksInteraction) {
        setMessage(requestMessage(args[0], args[1]));
        setPendingRequests((count) => count + 1);
      }

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
        {message}
      </div>
    </div>
  );
}
