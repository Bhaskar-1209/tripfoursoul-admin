"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function DestinationsPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: "", image_url: "", region: "", price: "", description: "", sort_order: 0, is_trending: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { 
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await fetch("/api/destinations?all=true");
      const data = await res.json();
      if (data.destinations) setDestinations(data.destinations);
    } catch (error) { console.error(error); }
  };

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

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingItem) {
        await fetch("/api/destinations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id: editingItem.id, is_active: 1 }),
        });
        setMessage("Destination updated successfully!");
      } else {
        await fetch("/api/destinations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, is_active: 1 }),
        });
        setMessage("Destination added successfully!");
      }
      setTimeout(() => setMessage(""), 3000);
      setForm({ name: "", image_url: "", region: "", price: "", description: "", sort_order: 0, is_trending: 0 });
      setShowForm(false);
      setEditingItem(null);
      fetchDestinations();
    } catch (error) { 
      setMessage("Error saving destination");
      console.error(error); 
    }
    finally { setSaving(false); }
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

  const startEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      image_url: item.image_url,
      region: item.region,
      price: item.price,
      description: item.description || "",
      sort_order: item.sort_order || 0,
      is_trending: item.is_trending ? 1 : 0,
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Destinations Management</h1>

        {message && <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>}

        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">All Destinations</h2>
            <button 
              onClick={() => { setShowForm(true); setEditingItem(null); setForm({ name: "", image_url: "", region: "", price: "", description: "", sort_order: 0, is_trending: 0 }); }}
              className="admin-btn"
            >
              Add New Destination
            </button>
          </div>

          {/* Add/Edit Form */}
          {(showForm || editingItem) && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">{editingItem ? "Edit Destination" : "Add New Destination"}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Destination Name *</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    className="admin-input" 
                    placeholder="e.g., Europe, Bali, Switzerland"
                  />
                </div>
                
                <div>
                  <label className="admin-label">Region *</label>
                  <input 
                    type="text" 
                    value={form.region} 
                    onChange={(e) => setForm({ ...form, region: e.target.value })} 
                    className="admin-input" 
                    placeholder="e.g., Europe, Asia, Africa"
                  />
                </div>

                <div>
                  <label className="admin-label">Starting Price *</label>
                  <input 
                    type="text" 
                    value={form.price} 
                    onChange={(e) => setForm({ ...form, price: e.target.value })} 
                    className="admin-input" 
                    placeholder="e.g., $1,299"
                  />
                </div>

                <div>
                  <label className="admin-label">Sort Order</label>
                  <input 
                    type="number" 
                    value={form.sort_order} 
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} 
                    className="admin-input" 
                  />
                </div>

                <label className="md:col-span-2 flex items-center gap-3 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
                  <input
                    type="checkbox"
                    checked={Boolean(form.is_trending)}
                    onChange={(e) => setForm({ ...form, is_trending: e.target.checked ? 1 : 0 })}
                    className="h-4 w-4 accent-teal-600"
                  />
                  Show this destination in the Trending Now section
                </label>

                <div className="md:col-span-2">
                  <label className="admin-label">Destination Image</label>
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
                      <img src={form.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                      <p className="text-xs text-gray-500 mt-1">Image uploaded</p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">Description</label>
                  <textarea 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    className="admin-input" 
                    rows={3}
                    placeholder="Brief description of the destination..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="admin-btn">
                  {saving ? "Saving..." : editingItem ? "Update Destination" : "Add Destination"}
                </button>
                <button 
                  onClick={() => { setShowForm(false); setEditingItem(null); }} 
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Destinations List */}
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
                    onClick={() => startEdit(destination)} 
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
        </div>
      </main>
      
    </div>
  );
}
