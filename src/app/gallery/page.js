"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast, { Toaster } from "react-hot-toast";

export default function GalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        if (active && data.images) setImages(data.images);
      } catch (error) { console.error(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const togglePublish = async (img) => {
    try {
      await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: img.id, is_active: img.is_active ? 0 : 1 }),
      });
      toast.success(`Image ${img.is_active ? 'unpublished' : 'published'}!`);
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.images) setImages(data.images);
    } catch (error) {
      toast.error("Error updating");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this image?")) return;
    try {
      await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      toast.success("Image deleted!");
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.images) setImages(data.images);
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

        <div className="admin-card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-semibold">Gallery Media ({images.length})</h2>
            <div className="flex gap-2">
              <button onClick={() => router.push("/gallery/new")} className="admin-btn">Upload New Image</button>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-input w-auto">
                <option value="all">All media</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="admin-input w-auto">
                <option value="order">Custom order</option>
                <option value="title">Title A–Z</option>
                <option value="newest">Newest first</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading gallery..." />
          ) : (
            <>
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
                          onClick={() => router.push(`/gallery/${img.id}`)}
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}