"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import RichTextEditor from "@/components/RichTextEditor";

export default function EditPackagePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState({
    destination_id: "", title: "", days: "", meals: "", short_description: "",
    long_description: "", sub_heading: "", itinerary: "", additional_info: "", image_url: "",
    inclusives: "", exclusives: "", price: "", sort_order: 0, is_trending: false, is_spiritual: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Destination modal state
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [destinationForm, setDestinationForm] = useState({
    name: "", image_url: "", region: "", price: "", description: "", is_trending: 0, is_spiritual: 0,
  });
  const [destinationSaving, setDestinationSaving] = useState(false);
  const [destinationUploading, setDestinationUploading] = useState(false);
  const destinationFileInputRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [pkgRes, destRes] = await Promise.all([
          fetch(`/api/packages`),
          fetch("/api/destinations?all=true"),
        ]);
        const pkgData = await pkgRes.json();
        const destData = await destRes.json();
        const pkg = (pkgData.packages || []).find((p) => p.id === Number(id));
        if (active) {
          if (destData.destinations) setDestinations(destData.destinations);
          if (pkg) {
            setForm({
              destination_id: String(pkg.destination_id || ""),
              title: pkg.title || "",
              days: pkg.days || "",
              meals: pkg.meals || "",
              short_description: pkg.short_description || "",
              long_description: pkg.long_description || "",
              sub_heading: pkg.sub_heading || "",
              itinerary: pkg.itinerary || "",
              additional_info: pkg.additional_info || "",
              image_url: pkg.image_url || "",
              inclusives: pkg.inclusives || "",
              exclusives: pkg.exclusives || "",
              price: pkg.price || "",
              sort_order: pkg.sort_order || 0,
              is_trending: !!pkg.is_trending,
              is_spiritual: !!pkg.is_spiritual,
            });
          }
        }
      } catch (error) { console.error(error); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [id]);

  const notify = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: Number(id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save package");
      router.push("/packages");
    } catch (error) { notify(error.message); }
    finally { setSaving(false); }
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed");
      setForm((current) => ({ ...current, image_url: data.imageUrl }));
    } catch (error) { notify(error.message); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  // ---- Destination modal handlers ----
  const openAddDestination = () => {
    setEditingDestination(null);
    setDestinationForm({ name: "", image_url: "", region: "", price: "", description: "", is_trending: 0, is_spiritual: 0 });
    setShowDestinationModal(true);
  };

  const openEditDestination = (dest) => {
    setEditingDestination(dest);
    setDestinationForm({
      name: dest.name || "",
      image_url: dest.image_url || "",
      region: dest.region || "",
      price: dest.price || "",
      description: dest.description || "",
      is_trending: dest.is_trending ? 1 : 0,
      is_spiritual: dest.is_spiritual ? 1 : 0,
    });
    setShowDestinationModal(true);
  };

  const saveDestination = async () => {
    if (!destinationForm.name || !destinationForm.region || !destinationForm.price) {
      notify("Please fill destination name, region and price");
      return;
    }
    setDestinationSaving(true);
    try {
      const method = editingDestination ? "PUT" : "POST";
      const body = editingDestination
        ? { ...destinationForm, id: editingDestination.id, is_active: 1 }
        : { ...destinationForm, is_active: 1 };
      const res = await fetch("/api/destinations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save destination");

      // Refresh destinations list
      const destRes = await fetch("/api/destinations?all=true");
      const destData = await destRes.json();
      setDestinations(destData.destinations || []);

      // Auto-select the saved/edited destination
      if (editingDestination) {
        setForm((current) => ({ ...current, destination_id: String(editingDestination.id) }));
      } else if (data.id) {
        setForm((current) => ({ ...current, destination_id: String(data.id) }));
      }

      setShowDestinationModal(false);
      notify(editingDestination ? "Destination updated successfully!" : "Destination added successfully!", "success");
    } catch (error) { notify(error.message); }
    finally { setDestinationSaving(false); }
  };

  const uploadDestinationImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDestinationUploading(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Image upload failed");
      setDestinationForm((current) => ({ ...current, image_url: data.imageUrl }));
    } catch (error) { notify(error.message); }
    finally {
      setDestinationUploading(false);
      if (destinationFileInputRef.current) destinationFileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <LoadingSpinner text="Loading package..." />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Package</h1>
          <button onClick={() => router.push("/packages")} className="admin-btn-secondary">← Back to List</button>
        </div>
        {message && (
          <div className={`mb-6 rounded-lg p-4 ${messageType === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        {/* ===== Destination Management Section ===== */}
        <div className="admin-card mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Destination Management</h2>
            <div className="flex gap-2">
              <button onClick={openAddDestination} className="admin-btn text-xs">+ Add New Destination</button>
              {form.destination_id && (
                <button
                  onClick={() => {
                    const dest = destinations.find((d) => d.id === Number(form.destination_id));
                    if (dest) openEditDestination(dest);
                  }}
                  className="admin-btn-secondary text-xs"
                >
                  Edit Selected
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="admin-label">Destination *</label>
              <select
                value={form.destination_id}
                onChange={(e) => setForm({ ...form, destination_id: e.target.value })}
                className="admin-input"
              >
                <option value="">Select destination</option>
                {destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <p className="mt-1 text-xs text-gray-500">Select a destination or add/edit one using the buttons above.</p>
            </div>
            {form.destination_id && (() => {
              const dest = destinations.find((d) => d.id === Number(form.destination_id));
              if (!dest) return null;
              return (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                  {dest.image_url && (
                    <img src={dest.image_url} alt={dest.name} className="h-16 w-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{dest.name}</p>
                    <p className="text-xs text-gray-500">{dest.region}{dest.price ? ` · ${dest.price}` : ""}</p>
                    {dest.is_trending && (
                      <span className="mt-1 inline-block rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">Trending</span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ===== Package Details Section ===== */}
        <div className="admin-card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Package Details</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="admin-label">Package Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" placeholder="e.g., Europe Highlights Getaway" />
            </div>
            <div>
              <label className="admin-label">Price</label>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="admin-input" placeholder="e.g., ₹89,999" />
            </div>
            <div>
              <label className="admin-label">Days</label>
              <input value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} className="admin-input" placeholder="e.g., 12 Days / 11 Nights" />
            </div>
            <div>
              <label className="admin-label">Meals</label>
              <input value={form.meals} onChange={(e) => setForm({ ...form, meals: e.target.value })} className="admin-input" placeholder="e.g., Breakfast & Dinner" />
            </div>
            <div>
              <label className="admin-label">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} className="admin-input" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Sub-heading</label>
              <input value={form.sub_heading} onChange={(e) => setForm({ ...form, sub_heading: e.target.value })} className="admin-input" placeholder="Short highlight below the title" />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Short Description</label>
              <RichTextEditor value={form.short_description} onChange={(html) => setForm({ ...form, short_description: html })} rows={3} placeholder="Short description..." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Package Overview</label>
              <RichTextEditor value={form.long_description} onChange={(html) => setForm({ ...form, long_description: html })} rows={4} placeholder="Package overview..." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Day-wise Itinerary</label>
              <RichTextEditor value={form.itinerary} onChange={(html) => setForm({ ...form, itinerary: html })} rows={4} placeholder="Enter itinerary details here, one day per line." />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Additional Info</label>
              <RichTextEditor value={form.additional_info} onChange={(html) => setForm({ ...form, additional_info: html })} rows={3} placeholder="Extra package notes, customization details, or special instructions." />
            </div>
            <div>
              <label className="admin-label">Inclusions</label>
              <RichTextEditor value={form.inclusives} onChange={(html) => setForm({ ...form, inclusives: html })} rows={3} placeholder="One per line" />
            </div>
            <div>
              <label className="admin-label">Exclusions</label>
              <RichTextEditor value={form.exclusives} onChange={(html) => setForm({ ...form, exclusives: html })} rows={3} placeholder="One per line" />
            </div>
            <div className="md:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={!!form.is_trending}
                  onChange={(e) => setForm({ ...form, is_trending: e.target.checked })}
                  className="h-4 w-4"
                />
                Trending Now
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={!!form.is_spiritual}
                  onChange={(e) => setForm({ ...form, is_spiritual: e.target.checked })}
                  className="h-4 w-4"
                />
                Spiritual Escape
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Package Image</label>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={upload} className="admin-input" disabled={uploading} />
              {uploading && <p className="mt-1 text-sm text-gray-500">Uploading...</p>}
              {form.image_url && <img src={form.image_url} alt="Package preview" className="mt-3 h-32 w-48 rounded-lg object-cover" />}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="admin-btn">{saving ? "Saving..." : "Update Package"}</button>
            <button onClick={() => router.push("/packages")} className="admin-btn-secondary">Cancel</button>
          </div>
        </div>
      </main>

      {/* ===== Destination Modal ===== */}
      {showDestinationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingDestination ? "Edit Destination" : "Add New Destination"}
              </h3>
              <button onClick={() => setShowDestinationModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="admin-label">Destination Name *</label>
                <input
                  type="text"
                  value={destinationForm.name}
                  onChange={(e) => setDestinationForm({ ...destinationForm, name: e.target.value })}
                  className="admin-input"
                  placeholder="e.g., Europe, Bali, Switzerland"
                />
              </div>
              <div>
                <label className="admin-label">Region *</label>
                <input
                  type="text"
                  value={destinationForm.region}
                  onChange={(e) => setDestinationForm({ ...destinationForm, region: e.target.value })}
                  className="admin-input"
                  placeholder="e.g., Europe, Asia, Africa"
                />
              </div>
              <div>
                <label className="admin-label">Starting Price *</label>
                <input
                  type="text"
                  value={destinationForm.price}
                  onChange={(e) => setDestinationForm({ ...destinationForm, price: e.target.value })}
                  className="admin-input"
                  placeholder="e.g., $1,299"
                />
              </div>
              <label className="flex items-center gap-3 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
                <input
                  type="checkbox"
                  checked={Boolean(destinationForm.is_trending)}
                  onChange={(e) => setDestinationForm({ ...destinationForm, is_trending: e.target.checked ? 1 : 0 })}
                  className="h-4 w-4 accent-teal-600"
                />
                Show in Trending Now section
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                <input
                  type="checkbox"
                  checked={Boolean(destinationForm.is_spiritual)}
                  onChange={(e) => setDestinationForm({ ...destinationForm, is_spiritual: e.target.checked ? 1 : 0 })}
                  className="h-4 w-4 accent-amber-500"
                />
                Show in Spiritual Escape section
              </label>
              <div className="md:col-span-2">
                <label className="admin-label">Destination Image</label>
                <div className="flex gap-2">
                  <input
                    ref={destinationFileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={uploadDestinationImage}
                    className="admin-input flex-1"
                    disabled={destinationUploading}
                  />
                  <button
                    type="button"
                    onClick={() => destinationFileInputRef.current?.click()}
                    className="admin-btn-secondary text-xs whitespace-nowrap"
                    disabled={destinationUploading}
                  >
                    {destinationUploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
                {destinationForm.image_url && (
                  <div className="mt-2">
                    <img src={destinationForm.image_url} alt="Preview" className="h-32 w-48 rounded-lg border border-gray-200 object-cover" />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="admin-label">Description</label>
                <RichTextEditor
                  value={destinationForm.description}
                  onChange={(html) => setDestinationForm({ ...destinationForm, description: html })}
                  rows={3}
                  placeholder="Brief description of the destination..."
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={saveDestination} disabled={destinationSaving} className="admin-btn">
                {destinationSaving ? "Saving..." : editingDestination ? "Update Destination" : "Add Destination"}
              </button>
              <button onClick={() => setShowDestinationModal(false)} className="admin-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}