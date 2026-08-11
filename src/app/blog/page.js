"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/blog?all=true");
        const data = await res.json();
        if (active && data.posts) setPosts(data.posts);
      } catch (error) { console.error(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
      setMessage("Blog post deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchPosts();
    } catch (error) { console.error(error); }
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
            <button onClick={() => router.push("/blog/new")} className="admin-btn">
              Add New Post
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading blog posts..." />
          ) : (
            <div className="space-y-3">
              {posts.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  {item.cover_image && (
                    <img src={item.cover_image} alt={item.title} className="w-24 h-20 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {item.is_active ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">/{item.slug} · {formatDate(item.created_at)}</p>
                    {item.excerpt && <p className="text-sm text-gray-600 line-clamp-1 mb-2">{item.excerpt}</p>}
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(item.tags) ? item.tags : (() => { try { return JSON.parse(item.tags || '[]'); } catch { return []; } })()).map((tag) => (
                        <span key={tag} className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePublish(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${item.is_active ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      {item.is_active ? "Published" : "Unpublished"}
                    </button>
                    <button onClick={() => router.push(`/blog/${item.id}`)} className="admin-btn-secondary text-xs px-3 py-1.5">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="admin-btn-danger text-xs px-3 py-1.5">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-gray-400 text-sm py-8 text-center">{`No blog posts yet. Click "Add New Post" to create your first blog article.`}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}