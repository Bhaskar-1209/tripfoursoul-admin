"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Pagination, { usePagination } from "@/components/Pagination";
import toast, { Toaster } from "react-hot-toast";
import { ArrowUpDown, CheckCircle2, Edit3, Eye, EyeOff, Filter, Image as ImageIcon, Plus, Search, Trash2, Video } from "lucide-react";

export default function GalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order");
  const [search, setSearch] = useState("");

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
      const response = await fetch("/api/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: img.id, is_active: img.is_active ? 0 : 1 }),
      });
      if (!response.ok) throw new Error("Could not update media status");
      toast.success(`Image ${img.is_active ? 'unpublished' : 'published'}!`);
      await loadImages();
    } catch (error) {
      toast.error(error.message || "Error updating");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this image?")) return;
    try {
      const response = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete media");
      toast.success("Image deleted!");
      await loadImages();
    } catch (error) {
      toast.error(error.message || "Error deleting");
    }
  };

  const loadImages = async () => {
    const response = await fetch("/api/gallery");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load gallery");
    setImages(data.images || []);
  };

  const visibleImages = useMemo(() => images
    .filter((img) => {
      const mediaType = img.media_type || (img.video_url ? "video" : "image");
      const query = search.trim().toLowerCase();
      const matchesType = filter === "all" || filter === "published" || filter === "unpublished" || mediaType === filter;
      const matchesStatus = filter === "published" ? Boolean(img.is_active) : filter === "unpublished" ? !img.is_active : true;
      const matchesSearch = !query || `${img.title || ""} ${img.category || ""}`.toLowerCase().includes(query);
      return matchesType && matchesStatus && matchesSearch;
    })
    .sort((a, b) => sortBy === "title"
      ? (a.title || "").localeCompare(b.title || "")
      : sortBy === "newest"
        ? Number(b.id) - Number(a.id)
        : Number(a.sort_order || 0) - Number(b.sort_order || 0)), [filter, images, search, sortBy]);

  const publishedCount = images.filter((image) => Boolean(image.is_active)).length;
  const imageCount = images.filter((image) => (image.media_type || "image") === "image").length;
  const videoCount = images.filter((image) => (image.media_type || "image") === "video" || image.video_url).length;

  const {
    currentItems: paginatedImages,
    currentPage,
    setCurrentPage,
    totalItems,
    itemsPerPage,
  } = usePagination(visibleImages, 12);

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-right" />
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#C8755A]">Content library</p>
            <h1 className="text-3xl font-bold text-[#25463F]">Gallery</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#5D756C]">Manage the media shown on your public website. Publish only the images and videos you want visitors to see.</p>
          </div>
          <button onClick={() => router.push("/gallery/new")} className="admin-btn inline-flex items-center justify-center gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4" /> Upload media
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total media", value: images.length, icon: ImageIcon, tone: "text-[#24564C] bg-[#DCE8DF]" },
            { label: "Published", value: publishedCount, icon: CheckCircle2, tone: "text-emerald-700 bg-emerald-50" },
            { label: "Images", value: imageCount, icon: ImageIcon, tone: "text-sky-700 bg-sky-50" },
            { label: "Videos", value: videoCount, icon: Video, tone: "text-[#A8543E] bg-[#F8E5DE]" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="rounded-xl border border-[#DCE8DF] bg-white p-4 shadow-sm">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></div>
              <p className="text-2xl font-bold text-[#25463F]">{value}</p>
              <p className="mt-1 text-xs font-medium text-[#5D756C]">{label}</p>
            </div>
          ))}
        </div>

        <section className="admin-card">
          <div className="mb-5 flex flex-col gap-4 border-b border-[#EEF4EF] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#25463F]">All media <span className="text-sm font-normal text-[#789B89]">({visibleImages.length} shown)</span></h2>
              <p className="mt-1 text-xs text-[#5D756C]">Use publish status to control public visibility.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative min-w-0 sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789B89]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="admin-input pl-9" placeholder="Search title or category" aria-label="Search gallery" />
              </label>
              <label className="relative min-w-0 sm:w-40">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789B89]" />
                <select value={filter} onChange={(event) => setFilter(event.target.value)} className="admin-input pl-9" aria-label="Filter gallery">
                  <option value="all">All media</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                </select>
              </label>
              <label className="relative min-w-0 sm:w-40">
                <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#789B89]" />
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="admin-input pl-9" aria-label="Sort gallery">
                  <option value="order">Custom order</option>
                  <option value="title">Title A–Z</option>
                  <option value="newest">Newest first</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading gallery..." />
          ) : (
            <>
              {!images.length && (
                <div className="rounded-xl border border-dashed border-[#BFD4C5] bg-[#F8FBF8] py-16 text-center">
                  <ImageIcon className="mx-auto mb-3 h-10 w-10 text-[#789B89]" />
                  <h3 className="font-semibold text-[#25463F]">Your gallery is empty</h3>
                  <p className="mt-1 text-sm text-[#5D756C]">Upload your first image or video to get started.</p>
                </div>
              )}
              {images.length > 0 && !visibleImages.length && <p className="py-16 text-center text-sm text-[#5D756C]">No media matches these filters.</p>}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {paginatedImages.map((img) => {
                  const isVideo = img.media_type === "video" || img.video_url;
                  return (
                    <article key={img.id} className="overflow-hidden rounded-xl border border-[#DCE8DF] bg-white shadow-sm transition-shadow hover:shadow-md">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#173F38]">
                        {img.image_url ? <img src={img.image_url} alt={img.title || "Gallery media"} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-white"><Video className="h-8 w-8" /><span className="text-xs">Video thumbnail</span></div>}
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#173F38]/85 px-2.5 py-1 text-[11px] font-semibold text-white">{isVideo ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}{isVideo ? "Video" : "Image"}</span>
                        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${img.is_active ? "bg-emerald-500 text-white" : "bg-white/90 text-[#5D756C]"}`}>{img.is_active ? "Published" : "Unpublished"}</span>
                      </div>
                      <div className="p-4">
                        <div className="min-h-14">
                          <h3 className="truncate font-semibold text-[#25463F]" title={img.title || "Untitled media"}>{img.title || "Untitled media"}</h3>
                          <p className="mt-1 truncate text-xs text-[#5D756C]">{img.category || "General"} <span className="mx-1 text-[#BFD4C5]">•</span> Order {img.sort_order || 0}</p>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <button onClick={() => router.push(`/gallery/${img.id}`)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#BFD4C5] px-2 py-2 text-xs font-semibold text-[#24564C] hover:bg-[#F1F7F2]" title="Edit media"><Edit3 className="h-3.5 w-3.5" /> Edit</button>
                          <button onClick={() => togglePublish(img)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#BFD4C5] px-2 py-2 text-xs font-semibold text-[#24564C] hover:bg-[#F1F7F2]" title={img.is_active ? "Unpublish media" : "Publish media"}>{img.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{img.is_active ? "Hide" : "Show"}</button>
                          <button onClick={() => handleDelete(img.id)} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50" title="Delete media"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}