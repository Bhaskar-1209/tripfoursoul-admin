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
            <div className="space-y-3">
              {destinations.map((destination) => (
                <div key={destination.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {destination.image_url && (
                    <img src={destination.image_url} alt={destination.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{destination.name}</h4>
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">{destination.region}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{destination.description}</p>
                    <p className="text-lg font-bold text-teal-600">{destination.price}</p>
                    {destination.is_trending ? <span className="mt-2 inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">Trending Now</span> : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/destinations/${destination.id}`)}
                      className="admin-btn-secondary text-xs px-3 py-1.5"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => router.push(`/packages?destination_id=${destination.id}`)}
                      className="admin-btn text-xs px-3 py-1.5"
                    >
                      Packages
                    </button>
                    <button
                      onClick={() => handleDelete(destination.id)}
                      className="admin-btn-danger text-xs px-3 py-1.5"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
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