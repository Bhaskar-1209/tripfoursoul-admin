"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import useStatusToast from "@/hooks/useStatusToast";

const emptyOffer = { title: "", description: "", image_url: "", button_text: "View offer", button_link: "/contact", badge: "", sort_order: 0, is_active: true };

export default function NewOfferPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyOffer);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useStatusToast();
  const inputRef = useRef(null);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const notify = (text) => { setMessage(text); window.setTimeout(() => setMessage(""), 3000); };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData(); data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok || !result.imageUrl) throw new Error(result.error || "Image upload failed");
      update("image_url", result.imageUrl); notify("Offer image uploaded.");
    } catch (error) { notify(error.message || "Image upload failed."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not save offer");
      router.push("/offers");
    } catch (error) { notify(error.message || "Could not save offer."); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Add New Offer</h1>
          <button onClick={() => router.push("/offers")} className="admin-btn-secondary">← Back to List</button>
        </div>

        {message && <div className="mb-5 rounded-lg bg-teal-50 p-3 text-sm text-teal-700">{message}</div>}

        <form onSubmit={save} className="admin-card space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="admin-label">Offer title *</span>
              <input required value={form.title} onChange={(e) => update("title", e.target.value)} className="admin-input" placeholder="e.g. Europe summer special" />
            </label>
            <label>
              <span className="admin-label">Badge</span>
              <input value={form.badge} onChange={(e) => update("badge", e.target.value)} className="admin-input" placeholder="e.g. Limited time" />
            </label>
            <label className="md:col-span-2">
              <span className="admin-label">Description</span>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="admin-input" rows={3} placeholder="Short offer description" />
            </label>
            <label>
              <span className="admin-label">Button text</span>
              <input value={form.button_text} onChange={(e) => update("button_text", e.target.value)} className="admin-input" />
            </label>
            <label>
              <span className="admin-label">Button link</span>
              <input value={form.button_link} onChange={(e) => update("button_link", e.target.value)} className="admin-input" placeholder="/contact or https://..." />
            </label>
            <label>
              <span className="admin-label">Sort order</span>
              <input type="number" value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))} className="admin-input" />
            </label>
            <label className="flex items-center gap-3 pt-7">
              <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} className="h-4 w-4 accent-teal-600" />
              <span className="text-sm font-medium">Publish on frontend</span>
            </label>
          </div>
          <div>
            <span className="admin-label">Offer image</span>
            <div className="flex flex-wrap gap-3">
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} className="admin-input max-w-md" disabled={uploading} />
              <input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} className="admin-input max-w-md" placeholder="Or paste image URL" />
            </div>
            {form.image_url && <img src={form.image_url} alt="Offer preview" className="mt-3 h-28 w-44 rounded-lg object-cover" />}
          </div>
          <div className="flex gap-3 pt-2">
            <button disabled={saving || uploading} className="admin-btn">{saving ? "Saving..." : "Create Offer"}</button>
            <button type="button" onClick={() => router.push("/offers")} className="admin-btn-secondary">Cancel</button>
          </div>
        </form>
      </main>
    </div>
  );
}
