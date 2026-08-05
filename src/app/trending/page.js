"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";

export default function TrendingPage() {
  const [settings, setSettings] = useState({ heading: "", subtitle: "", is_enabled: 1 });
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    image_url: "", 
    price: "", 
    duration: "", 
    location: "", 
    badge: "" 
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, tripsRes] = await Promise.all([
        fetch("/api/trending"),
        fetch("/api/trips?category=trending")
      ]);
      
      const settingsData = await settingsRes.json();
      const tripsData = await tripsRes.json();
      
      if (settingsData.settings) setSettings(settingsData.settings);
      if (tripsData.trips) setTrips(tripsData.trips);
    } catch (error) { console.error(error); }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/trending", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setMessage("Settings saved!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { setMessage("Error saving"); }
    finally { setSaving(false); }
  };

  const handleToggle = async () => {
    const newState = !settings.is_enabled;
    try {
      await fetch("/api/trending/toggle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled: newState }),
      });
      setSettings({ ...settings, is_enabled: newState });
    } catch (error) { console.error(error); }
  };

  const handleAddTrip = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, category: "trending", is_active: 1, sort_order: 0 }),
      });
      if (res.ok) {
        setForm({ name: "", description: "", image_url: "", price: "", duration: "", location: "", badge: "" });
        setShowForm(false);
        setMessage("Trip added successfully!");
        setTimeout(() => setMessage(""), 3000);
        fetchData();
      }
    } catch (error) { 
      setMessage("Error adding trip");
      console.error(error); 
    }
    finally { setSaving(false); }
  };

  const handleUpdateTrip = async () => {
    setSaving(true);
    try {
      await fetch("/api/trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingTrip.id, category: "trending", is_active: 1 }),
      });
      setEditingTrip(null);
      setForm({ name: "", description: "", image_url: "", price: "", duration: "", location: "", badge: "" });
      setMessage("Trip updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchData();
    } catch (error) { 
      setMessage("Error updating trip");
      console.error(error); 
    }
    finally { setSaving(false); }
  };

  const handleDeleteTrip = async (id) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      await fetch(`/api/trips?id=${id}`, { method: "DELETE" });
      setMessage("Trip deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchData();
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
      badge: trip.badge || "" 
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Trending Management</h1>

        {message && (
          <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>
        )}

        {/* ON/OFF Toggle */}
        <div className="admin-card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Trending Section Status</h2>
              <p className="text-sm text-gray-500">Show or hide Trending Now section on homepage</p>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-16 h-8 rounded-full transition-colors ${settings.is_enabled ? "bg-teal-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.is_enabled ? "translate-x-9" : "translate-x-0"}`} />
            </button>
          </div>
          <p className="text-sm mt-2">
            Status: <span className={`font-semibold ${settings.is_enabled ? "text-teal-600" : "text-red-500"}`}>
              {settings.is_enabled ? "ACTIVE" : "HIDDEN"}
            </span>
          </p>
        </div>

        {/* Section Settings */}
        <div className="admin-card mb-8">
          <h2 className="text-lg font-semibold mb-4">Section Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="admin-label">Heading</label>
              <input type="text" value={settings.heading} onChange={(e) => setSettings({ ...settings, heading: e.target.value })} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Subtitle</label>
              <input type="text" value={settings.subtitle} onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })} className="admin-input" />
            </div>
          </div>
          <button onClick={handleSaveSettings} disabled={saving} className="admin-btn">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Trending Items */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Trending Items</h2>
            <button onClick={() => { setShowForm(true); setEditingItem(null); setForm({ name: "", image_url: "", region: "", price: "", badge: "" }); }} className="admin-btn">
              Add New Item
            </button>
          </div>

          {/* Add/Edit Form */}
          {(showForm || editingTrip) && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Trip Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="e.g., Bali Spiritual Journey" />
                </div>
                <div>
                  <label className="admin-label">Price *</label>
                  <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="admin-input" placeholder="e.g., $1,299" />
                </div>
                <div>
                  <label className="admin-label">Duration</label>
                  <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="admin-input" placeholder="e.g., 7 Days / 6 Nights" />
                </div>
                <div>
                  <label className="admin-label">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="admin-input" placeholder="e.g., Bali, Indonesia" />
                </div>
                <div className="md:col-span-2">
                  <label className="admin-label">Badge</label>
                  <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="admin-input" placeholder="e.g., Best Seller, Hot Deal" />
                </div>
                <div className="md:col-span-2">
                  <label className="admin-label">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="admin-input" rows={2} placeholder="Trip description..." />
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
                      {uploading ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                  {form.image_url && (
                    <div className="mt-2">
                      <img src={form.image_url} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                      <p className="text-xs text-gray-500 mt-1">Image: {form.image_url}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={editingTrip ? handleUpdateTrip : handleAddTrip} disabled={saving} className="admin-btn">
                  {saving ? "Saving..." : editingTrip ? "Update Trip" : "Add Trip"}
                </button>
                <button onClick={() => { setShowForm(false); setEditingTrip(null); }} className="admin-btn-secondary">
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
                  <p className="text-sm text-gray-500 mb-1">{trip.location}</p>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{trip.description}</p>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="font-bold text-teal-600">{trip.price}</span>
                    {trip.duration && <span className="text-gray-500">{trip.duration}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(trip)} className="flex-1 admin-btn-secondary text-xs py-1.5">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteTrip(trip.id)} className="flex-1 admin-btn-danger text-xs py-1.5">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {trips.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-400 text-sm">No trending trips yet. Click "Add New Trip" to create your first trip.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}