"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState({
    destination_id: "", title: "", days: "", meals: "", short_description: "",
    long_description: "", sub_heading: "", itinerary: "", additional_info: "", image_url: "",
    inclusives: "", exclusives: "", price: "", sort_order: 0,
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
        const [pkgRes, destRes] = await Promise.all([
          fetch(`/api/packages`),
          fetch("/api/destinations"),
        ]);
        const pkgData = await pkgRes.json();
        const destData = await destRes.json();
        const pkg = (pkgData.packages || []).find((p) => p.id === Number(id));
        if (active) {
          if (destData.destinations) setDestinations(destData.destinations);
          if (pkg) {
            setForm({
              destination_id: String(pkg.destination_id || ""),
              title: pkg.title || "",
              days: pkg.days || "",
              meals: pkg.meals || "",
              short_description: pkg.short_description || "",
              long_description: pkg.long_description || "",
              sub_heading: pkg.sub_heading || "",
              itinerary: pkg.itinerary || "",
              additional_info: pkg.additional_info || "",
              image_url: pkg.image_url || "",
              inclusives: pkg.inclusives || "",
              exclusives: pkg.exclusives || "",
              price: pkg.price || "",
              sort_order: pkg.sort_order || 0,
            });
          }
        }
      } catch (error) { console.error(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [id]);

  const notify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: Number(id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save package");
      router.push("/packages");
    } catch (error) { notify(error.message); }
    finally { setSaving(false); }
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed");
      setForm((current) => ({ ...current, image_url: data.imageUrl }));
    } catch (error) { notify(error.message); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <LoadingSpinner text="Loading package..." />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Package</h1>
          <button onClick={() => router.push("/packages")} className="admin-btn-secondary">← Back to List</button>
        </div>
        {message && <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">{message}</div>}

        <div className="admin-card space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="admin-label">Destination *</label>
              <select value={form.destination_id} onChange={(e) => setForm({ ...form, destination_id: e.target.value })} className="admin-input">
                <option value="">Select destination</option>
                {destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Package Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" placeholder="e.g., Europe Highlights Getaway" />
            </div>
            <div>
              <label className="admin-label">Price</label>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="admin-input" placeholder="e.g., ₹89,999" />
            </div>
            <div>
              <label className="admin-label">Days</label>
              <input value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} className="admin-input" placeholder="e.g., 12 Days / 11 Nights" />
            </div>
            <div>
              <label className="admin-label">Meals</label>
              <input value={form.meals} onChange={(e) => setForm({ ...form, meals: e.target.value })} className="admin-input" placeholder="e.g., Breakfast & Dinner" />
            </div>
            <div>
              <label className="admin-label">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} className="admin-input" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Sub-heading</label>
              <input value={form.sub_heading} onChange={(e) => setForm({ ...form, sub_heading: e.target.value })} className="admin-input" placeholder="Short highlight below the title" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Short Description</label>
              <textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="admin-input" rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Package Overview</label>
              <textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} className="admin-input" rows={4} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Day-wise Itinerary</label>
              <textarea value={form.itinerary} onChange={(e) => setForm({ ...form, itinerary: e.target.value })} className="admin-input" rows={4} placeholder="Enter itinerary details here, one day per line." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Additional Info</label>
              <textarea value={form.additional_info} onChange={(e) => setForm({ ...form, additional_info: e.target.value })} className="admin-input" rows={3} placeholder="Extra package notes, customization details, or special instructions." />
            </div>
            <div>
              <label className="admin-label">Inclusions (one per line)</label>
              <textarea value={form.inclusives} onChange={(e) => setForm({ ...form, inclusives: e.target.value })} className="admin-input" rows={3} />
            </div>
            <div>
              <label className="admin-label">Exclusions (one per line)</label>
              <textarea value={form.exclusives} onChange={(e) => setForm({ ...form, exclusives: e.target.value })} className="admin-input" rows={3} />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Package Image</label>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={upload} className="admin-input" disabled={uploading} />
              {uploading && <p className="mt-1 text-sm text-gray-500">Uploading...</p>}
              {form.image_url && <img src={form.image_url} alt="Package preview" className="mt-3 h-32 w-48 rounded-lg object-cover" />}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="admin-btn">{saving ? "Saving..." : "Update Package"}</button>
            <button onClick={() => router.push("/packages")} className="admin-btn-secondary">Cancel</button>
          </div>
        </div>
      </main>
    </div>
  );
}