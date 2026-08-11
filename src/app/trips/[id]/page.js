"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image_url: "",
    price: "",
    duration: "",
    days: "",
    location: "",
    category: "trending",
    badge: "",
    destination_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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
        const trip = (tripsData.trips || []).find((t) => t.id === Number(id));
        if (active) {
          if (destData.destinations) setDestinations(destData.destinations);
          if (trip) {
            setForm({
              name: trip.name,
              description: trip.description || "",
              image_url: trip.image_url,
              price: trip.price,
              duration: trip.duration || "",
              days: trip.days || "",
              location: trip.location || "",
              category: trip.category || "trending",
              badge: trip.badge || "",
              destination_id: trip.destination_id ? String(trip.destination_id) : "",
            });
          }
        }
      } catch (error) { console.error(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [id]);

  const handleSave = async () => {
    if (!form.name || !form.price) {
      setMessage("Please fill in all required fields");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: Number(id), is_active: 1, sort_order: 0 }),
      });
      if (res.ok) {
        router.push("/trips");
      } else {
        const data = await res.json();
        setMessage(data.error || "Error saving trip");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Error saving trip");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
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
      setMessage("Error uploading image");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const categories = [
    { value: "trending", label: "Trending Now" },
    { value: "popular_destinations", label: "Popular Destinations" },
    { value: "spiritual_escape", label: "Spiritual Escape" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <LoadingSpinner text="Loading trip..." />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Trip</h1>
          <button onClick={() => router.push("/trips")} className="admin-btn-secondary">← Back to List</button>
        </div>

        {message && <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>}

        <div className="admin-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Trip Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="e.g., Bali Spiritual Journey" />
            </div>
            <div>
              <label className="admin-label">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="admin-input">
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-label">Destination</label>
              <select value={form.destination_id} onChange={(e) => setForm({ ...form, destination_id: e.target.value })} className="admin-input">
                <option value="">Select destination (optional)</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.id}>{dest.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Link this trip to a destination</p>
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
              <label className="admin-label">Days</label>
              <input type="text" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} className="admin-input" placeholder="e.g., 10 Days" />
            </div>
            <div>
              <label className="admin-label">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="admin-input" placeholder="e.g., Bali, Indonesia" />
            </div>
            <div>
              <label className="admin-label">Badge</label>
              <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="admin-input" placeholder="e.g., Best Seller, New" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="admin-input" rows={3} placeholder="Trip description..." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Trip Image *</label>
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleImageUpload} className="admin-input flex-1" disabled={uploading} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="admin-btn-secondary text-xs whitespace-nowrap" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Image"}
                </button>
              </div>
              {form.image_url && (
                <div className="mt-2">
                  <img src={form.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                  <p className="text-xs text-gray-500 mt-1">Image selected</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="admin-btn">{saving ? "Saving..." : "Update Trip"}</button>
            <button onClick={() => router.push("/trips")} className="admin-btn-secondary">Cancel</button>
          </div>
        </div>
      </main>
    </div>
  );
}