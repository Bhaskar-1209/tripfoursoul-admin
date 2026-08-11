"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PackagesPage() {
  return <Suspense fallback={<LoadingSpinner text="Loading packages..." />}><PackagesPageContent /></Suspense>;
}

function PackagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDestinationId = searchParams.get("destination_id") || "";
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [packagesResponse, destinationsResponse] = await Promise.all([
          fetch(`/api/packages${selectedDestinationId ? `?destination_id=${selectedDestinationId}` : ""}`),
          fetch("/api/destinations"),
        ]);
        const [packagesData, destinationsData] = await Promise.all([packagesResponse.json(), destinationsResponse.json()]);
        if (active) {
          setPackages(packagesData.packages || []);
        }
      } catch (error) { console.error(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [selectedDestinationId]);

  const loadData = async () => {
    const response = await fetch(`/api/packages${selectedDestinationId ? `?destination_id=${selectedDestinationId}` : ""}`);
    const data = await response.json();
    setPackages(data.packages || []);
  };

  const notify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const remove = async (id) => {
    if (!confirm("Delete this package?")) return;
    const response = await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
    if (response.ok) { notify("Package deleted successfully."); await loadData(); }
  };

  const newUrl = selectedDestinationId ? `/packages/new?destination_id=${selectedDestinationId}` : "/packages/new";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Packages Management</h1>
            <p className="mt-1 text-sm text-gray-500">Each package is directly assigned to one destination, as in the website frontend.</p>
          </div>
          <button onClick={() => router.push(newUrl)} className="admin-btn">Add New Package</button>
        </div>
        {message && <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">{message}</div>}

        <section className="admin-card">
          <h2 className="mb-4 text-lg font-semibold">{selectedDestinationId ? "Destination Packages" : "All Packages"} ({packages.length})</h2>
          {loading ? (
            <LoadingSpinner text="Loading packages..." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {packages.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-lg border border-gray-200">
                    {item.image_url && <img src={item.image_url} alt={item.title} className="h-44 w-full object-cover" />}
                    <div className="p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-700">{item.destination_name}</p>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.days && `${item.days} Days`}{item.meals && ` · ${item.meals}`}</p>
                      <p className="mt-2 text-sm text-gray-600">{item.short_description}</p>
                      <p className="mt-3 font-bold text-teal-700">{item.price}</p>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => router.push(`/packages/${item.id}`)} className="admin-btn-secondary flex-1 text-xs">Edit</button>
                        <button onClick={() => remove(item.id)} className="admin-btn-danger flex-1 text-xs">Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {!packages.length && <p className="py-8 text-center text-sm text-gray-400">No packages found. Add a package and assign its destination.</p>}
            </>
          )}
        </section>
      </main>
    </div>
  );
}