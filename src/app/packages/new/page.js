"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RichTextEditor from "@/components/RichTextEditor";

export default function NewPackagePage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><NewPackageContent /></Suspense>;
}

function NewPackageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destParam = searchParams.get("destination_id") || "";
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState({
    destination_id: destParam, title: "", days: "", meals: "", short_description: "",
    long_description: "", sub_heading: "", itinerary: "", additional_info: "", image_url: "",
    inclusives: "", exclusives: "", price: "", sort_order: 0, is_trending: false, is_spiritual: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/destinations");
        const data = await res.json();
        if (active) setDestinations(data.destinations || []);
      } catch (error) { console.error(error); }
    })();
    return () => { active = false; };
  }, []);

  const notify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Add New Package</h1>
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
              <RichTextEditor value={form.short_description} onChange={(html) => setForm({ ...form, short_description: html })} rows={3} placeholder="Short description..." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Package Overview</label>
              <RichTextEditor value={form.long_description} onChange={(html) => setForm({ ...form, long_description: html })} rows={4} placeholder="Package overview..." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Day-wise Itinerary</label>
              <RichTextEditor value={form.itinerary} onChange={(html) => setForm({ ...form, itinerary: html })} rows={4} placeholder="Enter itinerary details here, one day per line." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Additional Info</label>
              <RichTextEditor value={form.additional_info} onChange={(html) => setForm({ ...form, additional_info: html })} rows={3} placeholder="Extra package notes, customization details, or special instructions." />
            </div>
            <div>
              <label className="admin-label">Inclusions</label>
              <RichTextEditor value={form.inclusives} onChange={(html) => setForm({ ...form, inclusives: html })} rows={3} placeholder="One per line" />
            </div>
            <div>
              <label className="admin-label">Exclusions</label>
              <RichTextEditor value={form.exclusives} onChange={(html) => setForm({ ...form, exclusives: html })} rows={3} placeholder="One per line" />
            </div>
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={!!form.is_trending}
                  onChange={(e) => setForm({ ...form, is_trending: e.target.checked })}
                  className="h-4 w-4"
                />
                Trending Now
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={!!form.is_spiritual}
                  onChange={(e) => setForm({ ...form, is_spiritual: e.target.checked })}
                  className="h-4 w-4"
                />
                Spiritual Escape
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Package Image</label>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={upload} className="admin-input" disabled={uploading} />
              {uploading && <p className="mt-1 text-sm text-gray-500">Uploading...</p>}
              {form.image_url && <img src={form.image_url} alt="Package preview" className="mt-3 h-32 w-48 rounded-lg object-cover" />}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="admin-btn">{saving ? "Saving..." : "Save Package"}</button>
            <button onClick={() => router.push("/packages")} className="admin-btn-secondary">Cancel</button>
          </div>
        </div>
      </main>
    </div>
  );
}