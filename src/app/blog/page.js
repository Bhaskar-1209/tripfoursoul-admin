"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    gallery_images: [],
    author: "",
    tags: "",
    meta_title: "",
    meta_description: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog?all=true");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (error) { console.error(error); }
  };

  const togglePublish = async (item) => {
    try {
      await fetch("/api/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: item.is_active ? 0 : 1 }),
      });
      setMessage(`Blog post "${item.title}" ${item.is_active ? "unpublished" : "published"}!`);
      setTimeout(() => setMessage(""), 3000);
      fetchPosts();
    } catch (error) {
      setMessage("Error updating blog post");
      console.error(error);
    }
  };

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
      if (editingItem) {
        await fetch("/api/blog", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, id: editingItem.id, is_active: 1 }),
        });
        setMessage("Blog post updated successfully!");
      } else {
        await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, is_active: 1 }),
        });
        setMessage("Blog post created successfully!");
      }
      setTimeout(() => setMessage(""), 3000);
      setForm({
        title: "", slug: "", excerpt: "", content: "", cover_image: "", gallery_images: [],
        author: "", tags: "", meta_title: "", meta_description: "",
      });
      setShowForm(false);
      setEditingItem(null);
      fetchPosts();
    } catch (error) {
      setMessage("Error saving blog post");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
      setMessage("Blog post deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchPosts();
    } catch (error) { console.error(error); }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      slug: item.slug || "",
      excerpt: item.excerpt || "",
      content: item.content || "",
      cover_image: item.cover_image || "",
      gallery_images: Array.isArray(item.gallery_images) ? item.gallery_images : (() => { try { return JSON.parse(item.gallery_images || '[]'); } catch { return []; } })(),
      author: item.author || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      meta_title: item.meta_title || "",
      meta_description: item.meta_description || "",
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

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
      console.error("Error:", error);
      setMessage("Error uploading image");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Blog Management</h1>

        {message && <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>}

        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">All Blog Posts</h2>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingItem(null);
                setForm({
                  title: "", slug: "", excerpt: "", content: "", cover_image: "", gallery_images: [],
                  author: "", tags: "", meta_title: "", meta_description: "",
                });
              }}
              className="admin-btn"
            >
              Add New Post
            </button>
          </div>

          {/* Add/Edit Form */}
          {(showForm || editingItem) && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">{editingItem ? "Edit Blog Post" : "Add New Blog Post"}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="admin-input"
                    placeholder="e.g., Top 10 Travel Destinations for 2026"
                  />
                </div>

                <div>
                  <label className="admin-label">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="admin-input"
                    placeholder="Auto-generated from title if blank"
                  />
                </div>

                <div>
                  <label className="admin-label">Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="admin-input"
                    placeholder="e.g., TripForSoul Team"
                  />
                </div>

                <div>
                  <label className="admin-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="admin-input"
                    placeholder="e.g., Travel Tips, Europe, Adventure"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">Blog Images</label>
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
                  <p className="text-xs text-gray-500 mt-1">Upload at least 3 images if the article needs a photo gallery. The first image becomes the cover.</p>
                  {form.gallery_images.length > 0 && <div className="mt-3 grid grid-cols-3 gap-3">{form.gallery_images.map((url, index) => <div key={`${url}-${index}`} className="relative"><img src={url} alt="Blog upload" className="w-full h-24 object-cover rounded border" />{index === 0 && <span className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">Cover</span>}<button type="button" onClick={() => setForm((prev) => { const gallery_images = prev.gallery_images.filter((_, i) => i !== index); return { ...prev, gallery_images, cover_image: gallery_images[0] || '' }; })} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button></div>)}</div>}
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">Excerpt</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    className="admin-input"
                    rows={2}
                    placeholder="Short summary shown on blog listing page..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="admin-input"
                    rows={10}
                    placeholder="Write your blog content here..."
                  />
                </div>

                <div>
                  <label className="admin-label">Meta Title (SEO)</label>
                  <input
                    type="text"
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    className="admin-input"
                    placeholder="Defaults to post title"
                  />
                </div>

                <div>
                  <label className="admin-label">Meta Description (SEO)</label>
                  <input
                    type="text"
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    className="admin-input"
                    placeholder="Defaults to excerpt"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="admin-btn">
                  {saving ? "Saving..." : editingItem ? "Update Post" : "Create Post"}
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

          {/* Blog Posts List */}
          <div className="space-y-3">
            {posts.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {item.cover_image && (
                  <img src={item.cover_image} alt={item.title} className="w-24 h-20 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.is_active ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">/{item.slug} · {formatDate(item.created_at)}</p>
                  {item.excerpt && <p className="text-sm text-gray-600 line-clamp-1 mb-2">{item.excerpt}</p>}
                  {(Array.isArray(item.gallery_images) ? item.gallery_images.length : (() => { try { return JSON.parse(item.gallery_images || '[]').length; } catch { return 0; } })()) > 0 && <p className="text-xs text-teal-600">Photo gallery attached</p>}
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(item.tags) ? item.tags : []).map((tag) => (
                        <span key={tag} className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      item.is_active
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {item.is_active ? "Published" : "Unpublished"}
                  </button>
                  <button onClick={() => startEdit(item)} className="admin-btn-secondary text-xs px-3 py-1.5">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="admin-btn-danger text-xs px-3 py-1.5">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-gray-400 text-sm py-8 text-center">No blog posts yet. Click "Add New Post" to create your first blog article.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
