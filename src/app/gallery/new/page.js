"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import toast, { Toaster } from "react-hot-toast";

export default function NewGalleryPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", image_url: "", video_url: "", media_type: "image", category: "General", sort_order: 0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

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
        setForm((current) => ({ ...current, title: file.name.replace(/\.[^/.]+$/, ""), image_url: data.imageUrl, media_type: "image" }));
        toast.success("Image uploaded! Add title and save.");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Error uploading");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.title || (form.media_type === "image" ? !form.image_url : !form.video_url)) {
      toast.error("Please add a title and the required media URL");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, is_active: 1 }),
      });
      if (res.ok) {
        toast.success("Image added to gallery!");
        router.push("/gallery");
      } else {
        toast.error("Error saving");
      }
    } catch (error) {
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-right" />
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Gallery Media</h1>
          <button onClick={() => router.push("/gallery")} className="admin-btn-secondary">← Back to List</button>
        </div>

        <div className="admin-card space-y-4">
          <div>
            <label className="admin-label">Upload Image</label>
            <div className="flex items-center gap-4">
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
                className="admin-btn"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Choose File"}
              </button>
            </div>
          </div>

          <div>
            <label className="admin-label">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="admin-input"
              placeholder="Enter image title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="admin-label">Media type</label>
              <select value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value, video_url: e.target.value === 'image' ? '' : form.video_url })} className="admin-input">
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="admin-input" placeholder="e.g. Europe" />
            </div>
            <div>
              <label className="admin-label">Sort order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="admin-input" />
            </div>
          </div>

          {form.media_type === "video" && (
            <div>
              <label className="admin-label">Video URL</label>
              <input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className="admin-input" placeholder="YouTube, Vimeo, or direct MP4 URL" />
              <p className="text-xs text-gray-500 mt-1">Add a thumbnail image above for the gallery card.</p>
            </div>
          )}

          {form.image_url && (
            <div>
              <label className="admin-label">Preview</label>
              <img src={form.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || uploading} className="admin-btn">
              {saving ? "Saving..." : "Save Image"}
            </button>
            <button onClick={() => router.push("/gallery")} className="admin-btn-secondary">Cancel</button>
          </div>
        </div>
      </main>
    </div>
  );
}