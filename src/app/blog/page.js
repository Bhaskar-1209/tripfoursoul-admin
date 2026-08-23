"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [postsRes, catsRes] = await Promise.all([
          fetch("/api/blog?all=true"),
          fetch("/api/blog-categories?all=true"),
        ]);
        const postsData = await postsRes.json();
        const catsData = await catsRes.json();
        if (active && postsData.posts) setPosts(postsData.posts);
        if (active && catsData.categories) setCategories(catsData.categories);
      } catch (error) { console.error(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const fetchPosts = async () => {
    try {
      const [postsRes, catsRes] = await Promise.all([
        fetch("/api/blog?all=true"),
        fetch("/api/blog-categories?all=true"),
      ]);
      const postsData = await postsRes.json();
      const catsData = await catsRes.json();
      if (postsData.posts) setPosts(postsData.posts);
      if (catsData.categories) setCategories(catsData.categories);
    } catch (error) { console.error(error); }
  };

  const togglePublish = async (item) => {
    try {
      await fetch("/api/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: item.is_active ? 0 : 1 }),
      });
      toast.success(`Blog post "${item.title}" ${item.is_active ? "unpublished" : "published"}!`);
      fetchPosts();
    } catch (error) {
      toast.error("Error updating blog post");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
      toast.success("Blog post deleted successfully!");
      fetchPosts();
    } catch (error) {
      toast.error("Error deleting blog post");
      console.error(error);
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

  // Get posts for the selected category
  const categoryPosts = selectedCategory
    ? posts.filter((p) => String(p.category_id) === String(selectedCategory.id))
    : [];

  // Get posts with no category
  const uncategorizedPosts = posts.filter((p) => !p.category_id);

  // Count posts per category
  const getPostCount = (catId) => posts.filter((p) => String(p.category_id) === String(catId)).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <div className="flex gap-3">
            <button onClick={() => router.push("/blog-categories")} className="admin-btn-secondary">
              Manage Categories
            </button>
            <button onClick={() => router.push("/blog/new")} className="admin-btn">
              Add New Post
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading blog posts..." />
        ) : selectedCategory ? (
          /* ===== Category Detail View ===== */
          <div className="admin-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedCategory(null)} className="admin-btn-secondary text-xs px-3 py-1.5">
                  ← All Categories
                </button>
                <h2 className="text-lg font-semibold">{selectedCategory.name}</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {categoryPosts.length} posts
                </span>
              </div>
            </div>

            {selectedCategory.description && (
              <p className="text-sm text-gray-600 mb-4">{selectedCategory.description}</p>
            )}

            <div className="space-y-3">
              {categoryPosts.map((item) => (
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
              {categoryPosts.length === 0 && (
                <p className="text-gray-400 text-sm py-8 text-center">No blog posts in this category yet.</p>
              )}
            </div>
          </div>
        ) : (
          /* ====== Categories Overview View ===== */
          <>
            {/* Categories Grid */}
            <div className="admin-card mb-6">
              <h2 className="text-lg font-semibold mb-6">Blog Categories</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className="group text-left p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-teal-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-16 h-14 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-14 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-xl flex-shrink-0">
                          {cat.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">{cat.name}</h3>
                        <p className="text-xs text-gray-500">/{cat.slug}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                        {getPostCount(cat.id)} posts
                      </span>
                      <span className="text-xs text-teal-600 font-medium group-hover:underline">View Posts →</span>
                    </div>
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="text-gray-400 text-sm py-8 text-center">{`No categories yet. Click "Manage Categories" to create your first blog category.`}</p>
                )}
              </div>
            </div>

            {/* Uncategorized Posts */}
            {uncategorizedPosts.length > 0 && (
              <div className="admin-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Uncategorized Posts</h2>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {uncategorizedPosts.length} posts
                  </span>
                </div>
                <div className="space-y-3">
                  {uncategorizedPosts.map((item) => (
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
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => router.push(`/blog/${item.id}`)} className="admin-btn-secondary text-xs px-3 py-1.5">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="admin-btn-danger text-xs px-3 py-1.5">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}