"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/trips?all=true");
      const data = await res.json();
      if (data.trips) setTrips(data.trips);
    } catch (error) { console.error(error); }
  };

  const fetchDestinations = async () => {
    try {
      const res = await fetch("/api/destinations?all=true");
      const data = await res.json();
      if (data.destinations) setDestinations(data.destinations);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [tripsRes, destRes] = await Promise.all([
          fetch("/api/trips?all=true"),
          fetch("/api/destinations?all=true"),
        ]);
        const tripsData = await tripsRes.json();
        const destData = await destRes.json();
        if (active) {
          if (tripsData.trips) setTrips(tripsData.trips);
          if (destData.destinations) setDestinations(destData.destinations);
        }
      } catch (error) { console.error(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const getDestinationName = (id) => {
    if (!id) return "";
    const dest = destinations.find((d) => d.id === Number(id));
    return dest ? dest.name : "";
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await fetch(`/api/trips?id=${id}`, { method: "DELETE" });
      setMessage("Trip deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchTrips();
    } catch (error) { console.error(error); }
  };

  const categories = [
    { value: "trending", label: "Trending Now" },
    { value: "popular_destinations", label: "Popular Destinations" },
    { value: "spiritual_escape", label: "Spiritual Escape" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Trips & Packages Management</h1>

        {message && <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>}

        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">All Trips</h2>
            <button onClick={() => router.push("/trips/new")} className="admin-btn">
              Add New Trip
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading trips..." />
          ) : (
            <>
              {categories.map((category) => {
                const categoryTrips = trips.filter((t) => t.category === category.value);
                if (categoryTrips.length === 0) return null;

                return (
                  <div key={category.value} className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">
                      {category.label} ({categoryTrips.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryTrips.map((trip) => (
                        <div key={trip.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          {trip.image_url && (
                            <img src={trip.image_url} alt={trip.name} className="w-full h-48 object-cover" />
                          )}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 flex-1">{trip.name}</h4>
                              {trip.badge && (
                                <span className="ml-2 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                                  {trip.badge}
                                </span>
                              )}
                            </div>
                            {trip.destination_id && (
                              <p className="text-xs font-semibold text-teal-700 mb-1">📍 {getDestinationName(trip.destination_id)}</p>
                            )}
                            <p className="text-sm text-gray-500 mb-2">{trip.location}</p>
                            <p className="text-xs text-gray-400 mb-3 line-clamp-2">{trip.description}</p>
                            <div className="flex items-center justify-between text-sm mb-3">
                              <span className="font-bold text-teal-600">{trip.price}</span>
                              {trip.duration && <span className="text-gray-500">{trip.duration}</span>}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => router.push(`/trips/${trip.id}`)}
                                className="flex-1 admin-btn-secondary text-xs py-1.5"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(trip.id)}
                                className="flex-1 admin-btn-danger text-xs py-1.5"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {trips.length === 0 && (
                <p className="text-gray-400 text-sm py-8 text-center">{`No trips added yet. Click "Add New Trip" to create your first trip package.`}</p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}