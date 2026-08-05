import { Suspense } from "react";

export default function TripsLayout({ children }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      {children}
    </Suspense>
  );
}