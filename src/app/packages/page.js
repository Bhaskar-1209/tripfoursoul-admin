"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const emptyForm = (destinationId = "") => ({
  destination_id: destinationId, title: "", days: "", meals: "", short_description: "",
  long_description: "", sub_heading: "", itinerary: "", additional_info: "", image_url: "",
  inclusives: "", exclusives: "", price: "", sort_order: 0,
});

export default function PackagesPage() {
  return <Suspense fallback={<div className="p-8 text-sm text-gray-500">Loading packages…</div>}><PackagesPageContent /></Suspense>;
}

function PackagesPageContent() {
  const searchParams = useSearchParams();
  const selectedDestinationId = searchParams.get("destination_id") || "";
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState(emptyForm(selectedDestinationId));
  const [editingPackage, setEditingPackage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadData = async () => {
    const [packagesResponse, destinationsResponse] = await Promise.all([
      fetch(`/api/packages${selectedDestinationId ? `?destination_id=${selectedDestinationId}` : ""}`),
      fetch("/api/destinations"),
    ]);
    const [packagesData, destinationsData] = await Promise.all([packagesResponse.json(), destinationsResponse.json()]);
    setPackages(packagesData.packages || []);
    setDestinations(destinationsData.destinations || []);
  };

  useEffect(() => { loadData().catch(console.error); }, [selectedDestinationId]);

  const notify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const openNew = () => {
    setEditingPackage(null);
    setForm(emptyForm(selectedDestinationId));
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingPackage(item);
    setForm({ ...emptyForm(), ...item, destination_id: String(item.destination_id || "") });
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/packages", {
        method: editingPackage ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...(editingPackage ? { id: editingPackage.id } : {}) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save package");
      notify(editingPackage ? "Package updated successfully." : "Package added successfully.");
      setShowForm(false);
      setEditingPackage(null);
      setForm(emptyForm(selectedDestinationId));
      await loadData();
    } catch (error) { notify(error.message); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this package?")) return;
    const response = await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
    if (response.ok) { notify("Package deleted successfully."); await loadData(); }
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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Packages Management</h1>
            <p className="mt-1 text-sm text-gray-500">Each package is directly assigned to one destination, as in the website frontend.</p>
          </div>
          <button onClick={openNew} className="admin-btn">Add New Package</button>
        </div>
        {message && <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">{message}</div>}

        {showForm && (
          <section className="admin-card mb-6 bg-gray-50 p-6">
            <h2 className="mb-4 text-lg font-semibold">{editingPackage ? "Edit Package" : "Add New Package"}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Destination *"><select value={form.destination_id} onChange={(e) => setForm({ ...form, destination_id: e.target.value })} className="admin-input"><option value="">Select destination</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
              <Field label="Package Title *"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" placeholder="e.g., Europe Highlights Getaway" /></Field>
              <Field label="Price"><input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="admin-input" placeholder="e.g., ₹89,999" /></Field>
              <Field label="Days"><input value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} className="admin-input" placeholder="e.g., 12 Days / 11 Nights" /></Field>
              <Field label="Meals"><input value={form.meals} onChange={(e) => setForm({ ...form, meals: e.target.value })} className="admin-input" placeholder="e.g., Breakfast & Dinner" /></Field>
              <Field label="Sort Order"><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} className="admin-input" /></Field>
              <Field label="Sub-heading" className="md:col-span-2"><input value={form.sub_heading} onChange={(e) => setForm({ ...form, sub_heading: e.target.value })} className="admin-input" placeholder="Short highlight below the title" /></Field>
              <Field label="Short Description" className="md:col-span-2"><textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className="admin-input" rows={3} /></Field>
              <Field label="Package Overview" className="md:col-span-2"><textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} className="admin-input" rows={4} /></Field>
              <Field label="Day-wise Itinerary" className="md:col-span-2"><textarea value={form.itinerary} onChange={(e) => setForm({ ...form, itinerary: e.target.value })} className="admin-input" rows={4} placeholder="Enter itinerary details here, one day per line." /></Field>
              <Field label="Additional Info" className="md:col-span-2"><textarea value={form.additional_info} onChange={(e) => setForm({ ...form, additional_info: e.target.value })} className="admin-input" rows={3} placeholder="Extra package notes, customization details, or special instructions." /></Field>
              <Field label="Inclusions (one per line)"><textarea value={form.inclusives} onChange={(e) => setForm({ ...form, inclusives: e.target.value })} className="admin-input" rows={3} /></Field>
              <Field label="Exclusions (one per line)"><textarea value={form.exclusives} onChange={(e) => setForm({ ...form, exclusives: e.target.value })} className="admin-input" rows={3} /></Field>
              <div className="md:col-span-2"><label className="admin-label">Package Image</label><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={upload} className="admin-input" disabled={uploading} />{uploading && <p className="mt-1 text-sm text-gray-500">Uploading…</p>}{form.image_url && <img src={form.image_url} alt="Package preview" className="mt-3 h-32 w-48 rounded-lg object-cover" />}</div>
            </div>
            <div className="mt-5 flex gap-3"><button onClick={save} disabled={saving} className="admin-btn">{saving ? "Saving…" : "Save Package"}</button><button onClick={() => setShowForm(false)} className="admin-btn-secondary">Cancel</button></div>
          </section>
        )}

        <section className="admin-card">
          <h2 className="mb-4 text-lg font-semibold">{selectedDestinationId ? "Destination Packages" : "All Packages"} ({packages.length})</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((item) => <article key={item.id} className="overflow-hidden rounded-lg border border-gray-200">{item.image_url && <img src={item.image_url} alt={item.title} className="h-44 w-full object-cover" />}<div className="p-4"><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-700">{item.destination_name}</p><h3 className="font-semibold text-gray-900">{item.title}</h3><p className="mt-1 text-sm text-gray-500">{item.days && `${item.days} Days`}{item.meals && ` · ${item.meals}`}</p><p className="mt-2 text-sm text-gray-600">{item.short_description}</p><p className="mt-3 font-bold text-teal-700">{item.price}</p><div className="mt-4 flex gap-2"><button onClick={() => openEdit(item)} className="admin-btn-secondary flex-1 text-xs">Edit</button><button onClick={() => remove(item.id)} className="admin-btn-danger flex-1 text-xs">Delete</button></div></div></article>)}
          </div>
          {!packages.length && <p className="py-8 text-center text-sm text-gray-400">No packages found. Add a package and assign its destination.</p>}
        </section>
      </main>
    </div>
  );
}

function Field({ label, className = "", children }) { return <label className={`block ${className}`}><span className="admin-label">{label}</span>{children}</label>; }
