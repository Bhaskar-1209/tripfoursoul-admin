"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function NewBlogPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", cover_image: "", gallery_images: [],
    author: "", tags: "", meta_title: "", meta_description: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSave = async () => {
    if (!form.title) {
      setMessage("Blog title is required");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, is_active: 1 }),
      });
      if (res.ok) {
        router.push("/blog");
      } else {
        const data = await res.json();
        setMessage(data.error || "Error creating blog post");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Error creating blog post");
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
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setForm((prev) => ({ ...prev, gallery_images: [...prev.gallery_images, data.imageUrl], cover_image: prev.cover_image || data.imageUrl }));
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Blog Post</h1>
          <button onClick={() => router.push("/blog")} className="admin-btn-secondary">← Back to List</button>
        </div>

        {message && <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>}

        <div className="admin-card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" placeholder="e.g., Top 10 Travel Destinations for 2026" />
            </div>
            <div>
              <label className="admin-label">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="admin-input" placeholder="Auto-generated from title if blank" />
            </div>
            <div>
              <label className="admin-label">Author</label>
              <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="admin-input" placeholder="e.g., TripForSoul Team" />
            </div>
            <div>
              <label className="admin-label">Tags (comma separated)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="admin-input" placeholder="e.g., Travel Tips, Europe, Adventure" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Blog Images</label>
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleImageUpload} className="admin-input flex-1" disabled={uploading} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="admin-btn-secondary text-xs whitespace-nowrap" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Upload at least 3 images if the article needs a photo gallery. The first image becomes the cover.</p>
              {form.gallery_images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {form.gallery_images.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative">
                      <img src={url} alt="Blog upload" className="w-full h-24 object-cover rounded border" />
                      {index === 0 && <span className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">Cover</span>}
                      <button type="button" onClick={() => setForm((prev) => { const gallery_images = prev.gallery_images.filter((_, i) => i !== index); return { ...prev, gallery_images, cover_image: gallery_images[0] || '' }; })} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Excerpt</label>
              <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="admin-input" rows={2} placeholder="Short summary shown on blog listing page..." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Content</label>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="admin-input" rows={10} placeholder="Write your blog content here..." />
            </div>
            <div>
              <label className="admin-label">Meta Title (SEO)</label>
              <input type="text" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} className="admin-input" placeholder="Defaults to post title" />
            </div>
            <div>
              <label className="admin-label">Meta Description (SEO)</label>
              <input type="text" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="admin-input" placeholder="Defaults to excerpt" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving} className="admin-btn">{saving ? "Saving..." : "Create Post"}</button>
            <button onClick={() => router.push("/blog")} className="admin-btn-secondary">Cancel</button>
          </div>
        </div>
      </main>
    </div>
  );
}