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

  const toggleFlag = async (item, field) => {
    const response = await fetch("/api/packages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, destination_id: item.destination_id, title: item.title, [field]: item[field] ? 0 : 1 }),
    });
    if (response.ok) { notify("Package updated successfully."); await loadData(); }
  };

  const togglePublish = async (item) => {
    const response = await fetch("/api/packages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, destination_id: item.destination_id, title: item.title, is_active: item.is_active ? 0 : 1 }),
    });
    if (response.ok) { notify(item.is_active ? "Package unpublished." : "Package published."); await loadData(); }
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3 font-semibold">Package</th>
                    <th className="px-3 py-3 font-semibold">Destination</th>
                    <th className="px-3 py-3 font-semibold">Price</th>
                    <th className="px-3 py-3 font-semibold">Days</th>
                    <th className="px-3 py-3 font-semibold">Tags</th>
                    <th className="px-3 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {item.image_url && <img src={item.image_url} alt={item.title} className="h-12 w-16 rounded object-cover" />}
                          <span className="font-medium text-gray-900">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{item.destination_name}</td>
                      <td className="px-3 py-3 font-semibold text-teal-700">{item.price}</td>
                      <td className="px-3 py-3 text-gray-600">{item.days}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.is_trending ? <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Trending</span> : null}
                          {item.is_spiritual ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Spiritual</span> : null}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          <button onClick={() => router.push(`/packages/${item.id}`)} className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100">Edit</button>
                          <button
                            onClick={() => togglePublish(item)}
                            className={`rounded border px-2 py-1 text-xs ${item.is_active ? "bg-green-600 text-white border-green-600" : "bg-white text-green-600 border-green-300 hover:bg-green-50"}`}
                          >
                            {item.is_active ? "✓ Published" : "Unpublished"}
                          </button>
                          <button
                            onClick={() => toggleFlag(item, "is_trending")}
                            className={`rounded border px-2 py-1 text-xs ${item.is_trending ? "bg-purple-600 text-white border-purple-600" : "text-purple-600 border-purple-300 hover:bg-purple-50"}`}
                          >
                            {item.is_trending ? "✓ Trend" : "Trend"}
                          </button>
                          <button
                            onClick={() => toggleFlag(item, "is_spiritual")}
                            className={`rounded border px-2 py-1 text-xs ${item.is_spiritual ? "bg-amber-500 text-white border-amber-500" : "text-amber-600 border-amber-300 hover:bg-amber-50"}`}
                          >
                            {item.is_spiritual ? "✓ Spirit" : "Spirit"}
                          </button>
                          <button onClick={() => remove(item.id)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!packages.length && <p className="py-8 text-center text-sm text-gray-400">No packages found. Add a package and assign its destination.</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}