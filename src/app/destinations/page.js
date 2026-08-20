"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DestinationsPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDestinations = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch("/api/destinations?all=true");
      const data = await res.json();
      if (data.destinations) setDestinations(data.destinations);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const togglePublish = async (item) => {
    try {
      await fetch("/api/destinations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: item.is_active ? 0 : 1 }),
      });
      setMessage(`Destination "${item.name}" ${item.is_active ? "unpublished" : "published"}!`);
      setTimeout(() => setMessage(""), 3000);
      fetchDestinations();
    } catch (error) {
      setMessage("Error updating destination");
      console.error(error);
    }
  };

  const toggleFlag = async (item, field) => {
    try {
      await fetch("/api/destinations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, [field]: item[field] ? 0 : 1 }),
      });
      setMessage(`Destination "${item.name}" updated!`);
      setTimeout(() => setMessage(""), 3000);
      fetchDestinations();
    } catch (error) {
      setMessage("Error updating destination");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    try {
      await fetch(`/api/destinations?id=${id}`, { method: "DELETE" });
      setMessage("Destination deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchDestinations();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Destinations Management</h1>

        {message && <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>}

        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">All Destinations</h2>
            <button
              onClick={() => router.push("/destinations/new")}
              className="admin-btn"
            >
              Add New Destination
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading destinations..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3 font-semibold">Destination</th>
                    <th className="px-3 py-3 font-semibold">Region</th>
                    <th className="px-3 py-3 font-semibold">Price</th>
                    <th className="px-3 py-3 font-semibold">Tags</th>
                    <th className="px-3 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {destinations.map((destination) => (
                    <tr key={destination.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          {destination.image_url && (
                            <img src={destination.image_url} alt={destination.name} className="h-12 w-16 rounded object-cover" />
                          )}
                          <span className="font-medium text-gray-900">{destination.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{destination.region}</td>
                      <td className="px-3 py-3 font-semibold text-teal-700">{destination.price}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {destination.is_trending ? <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Trending</span> : null}
                          {destination.is_spiritual ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Spiritual</span> : null}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => router.push(`/destinations/${destination.id}`)}
                            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => togglePublish(destination)}
                            className={`rounded border px-2 py-1 text-xs ${destination.is_active ? "bg-green-600 text-white border-green-600" : "bg-white text-green-600 border-green-300 hover:bg-green-50"}`}
                          >
                            {destination.is_active ? "✓ Published" : "Unpublished"}
                          </button>
                          <button
                            onClick={() => router.push(`/packages?destination_id=${destination.id}`)}
                            className="rounded border border-teal-300 px-2 py-1 text-xs text-teal-700 hover:bg-teal-50"
                          >
                            Packages
                          </button>
                          <button
                            onClick={() => toggleFlag(destination, "is_trending")}
                            className={`rounded border px-2 py-1 text-xs ${destination.is_trending ? "bg-purple-600 text-white border-purple-600" : "text-purple-600 border-purple-300 hover:bg-purple-50"}`}
                          >
                            {destination.is_trending ? "✓ Trend" : "Trend"}
                          </button>
                          <button
                            onClick={() => toggleFlag(destination, "is_spiritual")}
                            className={`rounded border px-2 py-1 text-xs ${destination.is_spiritual ? "bg-amber-500 text-white border-amber-500" : "text-amber-600 border-amber-300 hover:bg-amber-50"}`}
                          >
                            {destination.is_spiritual ? "✓ Spirit" : "Spirit"}
                          </button>
                          <button
                            onClick={() => handleDelete(destination.id)}
                            className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {destinations.length === 0 && (
                <p className="text-gray-400 text-sm py-8 text-center">No destinations added yet. Click "Add New Destination" to create your first destination.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}