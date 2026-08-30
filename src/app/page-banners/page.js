"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import useStatusToast from "@/hooks/useStatusToast";

const PAGE_KEYS = [
  { key: "about", label: "About Us", defaultHeading: "About Us", defaultSubheading: "Discover our story and passion for travel" },
  { key: "contact", label: "Contact Us", defaultHeading: "Contact Us", defaultSubheading: "Get in touch with us for your dream vacation" },
  { key: "destinations", label: "Destinations", defaultHeading: "Popular Destinations", defaultSubheading: "Explore our handpicked destinations around the world" },
  { key: "packages", label: "Packages", defaultHeading: "Our Packages", defaultSubheading: "Discover amazing journeys curated for you" },
  { key: "other-services", label: "Other Services", defaultHeading: "Other Services", defaultSubheading: "Beyond travel, we offer a range of services to make your journey seamless" },
  { key: "gallery", label: "Gallery", defaultHeading: "Our Gallery", defaultSubheading: "Explore our collection of beautiful travel moments and destinations" },
];

export default function PageBannersPage() {
  const [banners, setBanners] = useState({});
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ page_key: "", heading: "", subheading: "", background_image: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useStatusToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/page-banners");
      const data = await res.json();
      const bannerMap = {};
      if (data.banners) {
        data.banners.forEach(b => { bannerMap[b.page_key] = b; });
      }
      setBanners(bannerMap);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/page-banners");
        const data = await res.json();
        const bannerMap = {};
        if (data.banners) {
          data.banners.forEach(b => { bannerMap[b.page_key] = b; });
        }
        if (!cancelled) setBanners(bannerMap);
      } catch (error) {
        console.error("Error:", error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const startEdit = (pageKey) => {
    const existing = banners[pageKey];
    setEditing(pageKey);
    setForm({
      page_key: pageKey,
      heading: existing?.heading || "",
      subheading: existing?.subheading || "",
      background_image: existing?.background_image || existing?.image_url || "",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/page-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, is_active: 1 }),
      });
      if (res.ok) {
        setMessage("Banner saved successfully!");
        setTimeout(() => setMessage(""), 3000);
        setEditing(null);
        fetchBanners();
      }
    } catch (error) {
      setMessage("Error saving banner");
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
      formData.append('file', file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.imageUrl) {
        setForm(prev => ({ ...prev, background_image: data.imageUrl }));
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Page Banners Management</h1>
        <p className="text-gray-500 mb-6">Upload and manage banner images, headings, and subheadings for each page.</p>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            {message}
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <div className="admin-card mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Edit Banner: {PAGE_KEYS.find(p => p.key === editing)?.label}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Heading</label>
                <input
                  type="text"
                  value={form.heading}
                  onChange={(e) => setForm({ ...form, heading: e.target.value })}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Subheading</label>
                <textarea
                  value={form.subheading}
                  onChange={(e) => setForm({ ...form, subheading: e.target.value })}
                  className="admin-input"
                  rows={2}
                />
              </div>
              <div>
                <label className="admin-label">Banner Image</label>
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
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={form.background_image}
                    onChange={(e) => setForm({ ...form, background_image: e.target.value })}
                    placeholder="Or enter image URL directly"
                    className="admin-input flex-1"
                  />
                </div>
                {form.background_image && (
                  <div className="mt-2">
                    <img src={form.background_image} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="admin-btn">
                  {saving ? "Saving..." : "Save Banner"}
                </button>
                <button onClick={() => setEditing(null)} className="admin-btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Banners List */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold mb-6">All Page Banners</h2>
          <div className="space-y-6">
            {PAGE_KEYS.map((page) => {
              const banner = banners[page.key];
              const hasBanner = !!banner;

              return (
                <div key={page.key} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{page.label}</h3>
                      <p className="text-xs text-gray-500">Page Key: {page.key}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(page.key)} className="admin-btn-secondary text-xs px-3 py-1.5">
                        {hasBanner ? "Edit Banner" : "Add Banner"}
                      </button>
                    </div>
                  </div>
                  {hasBanner ? (
                    <div className="p-4">
                      {(banner.background_image || banner.image_url) && (
                        <img src={banner.background_image || banner.image_url} alt="" className="w-full h-40 object-cover rounded-lg mb-3" />
                      )}
                      <h4 className="font-bold text-gray-900">{banner.heading || page.defaultHeading}</h4>
                      <p className="text-sm text-gray-600 mt-1">{banner.subheading || page.defaultSubheading}</p>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      <p>No banner set. Using default: <strong>{page.defaultHeading}</strong></p>
                      <p className="text-xs mt-1">Click "Add Banner" to customize</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
