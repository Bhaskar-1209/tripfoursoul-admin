"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";

export default function SpiritualPage() {
  const [trips, setTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    image_url: "", 
    price: "", 
    duration: "", 
    location: "", 
    badge: "",
    destination_id: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchTrips(); fetchDestinations(); }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/trips?category=spiritual_escape");
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

  const getDestinationName = (id) => {
    if (!id) return "";
    const dest = destinations.find((d) => d.id === Number(id));
    return dest ? dest.name : "";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingTrip) {
        await fetch("/api/trips", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editingTrip.id, category: "spiritual_escape", is_active: 1 }),
        });
        setMessage("Spiritual trip updated successfully!");
      } else {
        await fetch("/api/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, category: "spiritual_escape", is_active: 1, sort_order: 0 }),
        });
        setMessage("Spiritual trip added successfully!");
      }
      setTimeout(() => setMessage(""), 3000);
      setForm({ name: "", description: "", image_url: "", price: "", duration: "", location: "", badge: "", destination_id: "" });
      setShowForm(false);
      setEditingTrip(null);
      fetchTrips();
    } catch (error) { 
      setMessage("Error saving trip");
      console.error(error); 
    }
    finally { setSaving(false); }
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

  const startEdit = (trip) => {
    setEditingTrip(trip);
    setForm({ 
      name: trip.name, 
      description: trip.description || "", 
      image_url: trip.image_url, 
      price: trip.price, 
      duration: trip.duration || "", 
      location: trip.location || "", 
      badge: trip.badge || "",
      destination_id: trip.destination_id ? String(trip.destination_id) : ""
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.imageUrl) {
        setForm({ ...form, image_url: data.imageUrl });
        setMessage("Image uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Failed to upload image");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error uploading image");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Spiritual Escape Management</h1>

        {message && <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>}

        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Spiritual Trips & Journeys</h2>
            <button 
              onClick={() => { setShowForm(true); setEditingTrip(null); setForm({ name: "", description: "", image_url: "", price: "", duration: "", location: "", badge: "", destination_id: "" }); }}
              className="admin-btn"
            >
              Add New Spiritual Trip
            </button>
          </div>

          {/* Add/Edit Form */}
          {(showForm || editingTrip) && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">{editingTrip ? "Edit Spiritual Trip" : "Add New Spiritual Trip"}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Trip Name *</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    className="admin-input" 
                    placeholder="e.g., Varanasi Spiritual Journey"
                  />
                </div>

                <div>
                  <label className="admin-label">Destination</label>
                  <select
                    value={form.destination_id}
                    onChange={(e) => setForm({ ...form, destination_id: e.target.value })}
                    className="admin-input"
                  >
                    <option value="">Select destination (optional)</option>
                    {destinations.map((dest) => (
                      <option key={dest.id} value={dest.id}>{dest.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Link this trip to a destination like in Popular Destinations</p>
                </div>

                <div>
                  <label className="admin-label">Price *</label>
                  <input 
                    type="text" 
                    value={form.price} 
                    onChange={(e) => setForm({ ...form, price: e.target.value })} 
                    className="admin-input" 
                    placeholder="e.g., $499"
                  />
                </div>

                <div>
                  <label className="admin-label">Duration</label>
                  <input 
                    type="text" 
                    value={form.duration} 
                    onChange={(e) => setForm({ ...form, duration: e.target.value })} 
                    className="admin-input" 
                    placeholder="e.g., 5 Days / 4 Nights"
                  />
                </div>

                <div>
                  <label className="admin-label">Location</label>
                  <input 
                    type="text" 
                    value={form.location} 
                    onChange={(e) => setForm({ ...form, location: e.target.value })} 
                    className="admin-input" 
                    placeholder="e.g., Varanasi, India"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">Badge</label>
                  <input 
                    type="text" 
                    value={form.badge} 
                    onChange={(e) => setForm({ ...form, badge: e.target.value })} 
                    className="admin-input" 
                    placeholder="e.g., Sacred, Popular"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">Description</label>
                  <textarea 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    className="admin-input" 
                    rows={3}
                    placeholder="Describe the spiritual journey..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">Trip Image *</label>
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="admin-input flex-1"
                      disabled={uploading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="admin-btn-secondary text-xs whitespace-nowrap"
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                  </div>
                  {form.image_url && (
                    <div className="mt-2">
                      <img src={form.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                      <p className="text-xs text-gray-500 mt-1">Image selected: {form.image_url}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="admin-btn">
                  {saving ? "Saving..." : editingTrip ? "Update Trip" : "Add Trip"}
                </button>
                <button 
                  onClick={() => { setShowForm(false); setEditingTrip(null); }} 
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Trips List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
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
                  <p className="text-sm text-gray-500 mb-1">{trip.location}</p>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{trip.description}</p>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="font-bold text-teal-600">{trip.price}</span>
                    {trip.duration && <span className="text-gray-500">{trip.duration}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEdit(trip)} 
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
            {trips.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400 text-sm">No spiritual trips yet. Click "Add New Spiritual Trip" to create your first trip.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}