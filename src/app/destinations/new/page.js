"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import RichTextEditor from "@/components/RichTextEditor";
import { CURRENCIES, buildPricePayload } from "@/lib/price";
import useStatusToast from "@/hooks/useStatusToast";

export default function NewDestinationPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", image_url: "", region: "", price_currency: "USD", price_value: "", description: "", sort_order: 0, is_trending: 0, is_spiritual: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useStatusToast();
  const [messageType, setMessageType] = useState("error");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const notify = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.region.trim()) {
      notify("Destination name and region are required");
      return;
    }
    if (!form.image_url) {
      notify("Destination image is required");
      return;
    }
    setSaving(true);
    try {
      const priceFields = buildPricePayload(form.price_currency, form.price_value);
      const res = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...priceFields, is_active: 1 }),
      });
      if (res.ok) {
        router.push("/destinations");
      } else {
        const data = await res.json();
        notify(data.error || "Error saving destination");
      }
    } catch (error) {
      notify("Error saving destination");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // A new file selection is the point at which an earlier upload error can
    // safely be cleared; errors otherwise remain visible for the admin.
    setMessage("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setForm({ ...form, image_url: data.imageUrl });
        notify("Image uploaded successfully!", "success");
      } else {
        notify(data.error || "Failed to upload image");
      }
    } catch (error) {
      notify("Error uploading image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Destination</h1>
          <button onClick={() => router.push("/destinations")} className="admin-btn-secondary">← Back to List</button>
        </div>

        {message && <div role="alert" className={`p-4 rounded-lg mb-6 ${messageType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message}</div>}

        <div className="admin-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Destination Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="e.g., Europe, Bali, Switzerland" />
            </div>
            <div>
              <label className="admin-label">Region *</label>
              <input type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="admin-input" placeholder="e.g., Europe, Asia, Africa" />
            </div>
            <div>
              <label className="admin-label">Starting Price</label>
              <div className="flex gap-2">
                <select value={form.price_currency} onChange={(e) => setForm({ ...form, price_currency: e.target.value })} className="admin-input admin-price-currency">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" inputMode="numeric" value={form.price_value} onChange={(e) => setForm({ ...form, price_value: e.target.value })} className="admin-input admin-price-amount" placeholder="e.g., 1299" />
              </div>
              <p className="mt-1 text-xs text-gray-500">Select currency (USD/INR/EUR) and enter the price number. The website shows the same currency.</p>
            </div>
            <div>
              <label className="admin-label">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="admin-input" />
            </div>
            <label className="md:col-span-2 flex items-center gap-3 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
              <input type="checkbox" checked={Boolean(form.is_trending)} onChange={(e) => setForm({ ...form, is_trending: e.target.checked ? 1 : 0 })} className="h-4 w-4 accent-teal-600" />
              Show this destination in the Trending Now section
            </label>
            <label className="md:col-span-2 flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              <input type="checkbox" checked={Boolean(form.is_spiritual)} onChange={(e) => setForm({ ...form, is_spiritual: e.target.checked ? 1 : 0 })} className="h-4 w-4 accent-amber-500" />
              Show this destination in the Spiritual Escape section
            </label>
            <div className="md:col-span-2">
              <label className="admin-label">Destination Image *</label>
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept="image/webp" onChange={handleImageUpload} className="admin-input flex-1" disabled={uploading} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="admin-btn-secondary text-xs whitespace-nowrap" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">WebP only, up to 1 MB.</p>
              {form.image_url && (
                <div className="mt-2">
                  <img src={form.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                  <p className="text-xs text-gray-500 mt-1">Image uploaded</p>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Description</label>
              <RichTextEditor value={form.description} onChange={(html) => setForm({ ...form, description: html })} rows={3} placeholder="Brief description of the destination..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="admin-btn">{saving ? "Saving..." : "Add Destination"}</button>
            <button onClick={() => router.push("/destinations")} className="admin-btn-secondary">Cancel</button>
          </div>
        </div>
      </main>
    </div>
  );
}
