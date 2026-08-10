"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import toast, { Toaster } from "react-hot-toast";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", image_url: "", video_url: "", media_type: "image", category: "General", sort_order: 0 });
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order");
  const fileInputRef = useRef(null);

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.images) setImages(data.images);
    } catch (error) { console.error(error); }
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
        setForm((current) => ({ ...current, title: file.name.replace(/\.[^/.]+$/, ""), image_url: data.imageUrl, media_type: "image" }));
        setEditing("new");
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
    try {
      if (editing === "new") {
        await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, is_active: 1 }),
        });
        toast.success("Image added to gallery!");
      } else if (editing) {
        await fetch("/api/gallery", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing, ...form }),
        });
        toast.success("Image updated!");
      }
      setEditing(null);
      setForm({ title: "", image_url: "", video_url: "", media_type: "image", category: "General", sort_order: 0 });
      fetchImages();
    } catch (error) {
      toast.error("Error saving");
    }
  };

  const startEdit = (img) => {
    setEditing(img.id);
    setForm({ title: img.title || "", image_url: img.image_url || "", video_url: img.video_url || "", media_type: img.media_type || "image", category: img.category || "General", sort_order: img.sort_order || 0 });
  };

  const togglePublish = async (img) => {
    try {
      await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: img.id, is_active: img.is_active ? 0 : 1 }),
      });
      toast.success(`Image ${img.is_active ? 'unpublished' : 'published'}!`);
      fetchImages();
    } catch (error) {
      toast.error("Error updating");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this image?")) return;
    try {
      await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      toast.success("Image deleted!");
      fetchImages();
    } catch (error) {
      toast.error("Error deleting");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-right" />
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gallery Management</h1>
        <p className="text-gray-500 mb-6">Upload and manage gallery images. Changes reflect on the website automatically.</p>

        {/* Upload Section */}
        <div className="admin-card mb-8">
            <h2 className="text-lg font-semibold mb-4">Upload New Image</h2>
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

        {/* Edit Modal */}
        {editing && (
          <div className="admin-card mb-8 border-2 border-teal-500">
            <h2 className="text-lg font-semibold mb-4">
              {editing === "new" ? "Add New Image" : "Edit Image"}
            </h2>
            <div className="space-y-4">
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
                <div><label className="admin-label">Media type</label><select value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value, video_url: e.target.value === 'image' ? '' : form.video_url })} className="admin-input"><option value="image">Image</option><option value="video">Video</option></select></div>
                <div><label className="admin-label">Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="admin-input" placeholder="e.g. Europe" /></div>
                <div><label className="admin-label">Sort order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="admin-input" /></div>
              </div>
              {form.media_type === "video" && <div><label className="admin-label">Video URL</label><input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className="admin-input" placeholder="YouTube, Vimeo, or direct MP4 URL" /><p className="text-xs text-gray-500 mt-1">Add a thumbnail image above for the gallery card.</p></div>}
              {form.image_url && (
                <div>
                  <label className="admin-label">Preview</label>
                  <img src={form.image_url} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="admin-btn">
                  Save Image
                </button>
                <button onClick={() => { setEditing(null); setForm({ title: "", image_url: "", video_url: "", media_type: "image", category: "General", sort_order: 0 }); }} className="admin-btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        <div className="admin-card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6"><h2 className="text-lg font-semibold">Gallery Media ({images.length})</h2><div className="flex gap-2"><select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-input w-auto"><option value="all">All media</option><option value="image">Images</option><option value="video">Videos</option></select><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="admin-input w-auto"><option value="order">Custom order</option><option value="title">Title A–Z</option><option value="newest">Newest first</option></select></div></div>
          
          {images.length === 0 && (
            <p className="text-gray-400 text-center py-12">No images yet. Upload your first image above.</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.filter((img) => filter === 'all' || (img.media_type || 'image') === filter).sort((a, b) => sortBy === 'title' ? (a.title || '').localeCompare(b.title || '') : sortBy === 'newest' ? Number(b.id) - Number(a.id) : Number(a.sort_order || 0) - Number(b.sort_order || 0)).map((img) => (
              <div key={img.id} className="group relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {img.image_url ? <img src={img.image_url} alt={img.title || "Gallery media"} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-slate-800 flex items-center justify-center text-white">Video</div>}
                {(img.media_type === 'video' || img.video_url) && <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">▶ Video</span>}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    img.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {img.is_active ? 'Published' : 'Unpublished'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(img)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => togglePublish(img)}
                      className="px-3 py-1 bg-white text-gray-800 rounded text-xs font-medium hover:bg-gray-100"
                    >
                      {img.is_active ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
