"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function BlogCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", image_url: "", sort_order: 0, is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/blog-categories?all=true");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/blog-categories?all=true");
        const data = await res.json();
        if (active && data.categories) setCategories(data.categories);
      } catch (error) { console.error(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

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
        setForm((prev) => ({ ...prev, image_url: data.imageUrl }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Category name is required");
      return;
    }
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const payload = editing ? { ...form, id: editing.id } : form;
      const res = await fetch("/api/blog-categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editing ? "Category updated successfully!" : "Category created successfully!");
        setShowForm(false);
        setEditing(null);
        setForm({ name: "", slug: "", description: "", image_url: "", sort_order: 0, is_active: true });
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error saving category");
      }
    } catch (error) {
      toast.error("Error saving category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      image_url: cat.image_url || "",
      sort_order: cat.sort_order || 0,
      is_active: cat.is_active !== 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/blog-categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Category deleted successfully!");
        fetchCategories();
      } else {
        toast.error(data.error || "Error deleting category");
      }
    } catch (error) {
      toast.error("Error deleting category");
    }
  };

  const toggleActive = async (cat) => {
    try {
      await fetch("/api/blog-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, is_active: cat.is_active ? 0 : 1 }),
      });
      toast.success(`Category "${cat.name}" ${cat.is_active ? "deactivated" : "activated"}!`);
      fetchCategories();
    } catch (error) {
      toast.error("Error updating category");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Blog Categories</h1>
          <div className="flex gap-3">
            <button onClick={() => router.push("/blog")} className="admin-btn-secondary">← Back to Blog</button>
            <button onClick={() => { setEditing(null); setForm({ name: "", slug: "", description: "", image_url: "", sort_order: 0, is_active: true }); setShowForm(!showForm); }} className="admin-btn">
              {showForm ? "Cancel" : "Add Category"}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="admin-card space-y-4 mb-6">
            <h2 className="text-lg font-semibold">{editing ? "Edit Category" : "Add New Category"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="e.g., Adventure" />
              </div>
              <div>
                <label className="admin-label">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="admin-input" placeholder="Auto-generated from name if blank" />
              </div>
              <div className="md:col-span-2">
                <label className="admin-label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="admin-input" rows={2} placeholder="Short description of this category..." />
              </div>
              <div className="md:col-span-2">
                <label className="admin-label">Category Image</label>
                <div className="flex gap-2">
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleImageUpload} className="admin-input flex-1" disabled={uploading} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="admin-btn-secondary text-xs whitespace-nowrap" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>
                </div>
                {form.image_url && (
                  <div className="mt-3">
                    <img src={form.image_url} alt="Category preview" className="w-32 h-24 object-cover rounded border" />
                    <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="mt-1 text-xs text-red-600 hover:text-red-700">Remove image</button>
                  </div>
                )}
              </div>
              <div>
                <label className="admin-label">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="admin-input" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                <label className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="admin-btn">{saving ? "Saving..." : editing ? "Update Category" : "Create Category"}</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="admin-btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        <div className="admin-card">
          <h2 className="text-lg font-semibold mb-6">All Categories</h2>
          {loading ? (
            <LoadingSpinner text="Loading categories..." />
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {cat.image_url && (
                    <img src={cat.image_url} alt={cat.name} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${cat.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {cat.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {cat.post_count || 0} posts
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">/{cat.slug} · Sort: {cat.sort_order}</p>
                    {cat.description && <p className="text-sm text-gray-600 line-clamp-1">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cat.is_active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {cat.is_active ? "Active" : "Inactive"}
                    </button>
                    <button onClick={() => handleEdit(cat)} className="admin-btn-secondary text-xs px-3 py-1.5">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="admin-btn-danger text-xs px-3 py-1.5">Delete</button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-gray-400 text-sm py-8 text-center">{`No categories yet. Click "Add Category" to create your first blog category.`}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}