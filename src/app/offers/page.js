"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";

const emptyOffer = { title: "", description: "", image_url: "", button_text: "View offer", button_link: "/contact", badge: "", sort_order: 0, is_active: true };

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(emptyOffer);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const load = async () => {
    const res = await fetch("/api/offers?all=true");
    const result = await res.json();
    if (res.ok) setOffers(result.offers || []);
    else setMessage(result.error || "Could not load offers.");
  };
  useEffect(() => {
    let mounted = true;
    fetch("/api/offers?all=true")
      .then(async (res) => ({ res, result: await res.json() }))
      .then(({ res, result }) => {
        if (!mounted) return;
        if (res.ok) setOffers(result.offers || []);
        else setMessage(result.error || "Could not load offers.");
      })
      .catch(() => { if (mounted) setMessage("Could not load offers."); });
    return () => { mounted = false; };
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setForm(emptyOffer); setEditingId(null); setOpen(false); };
  const notify = (text) => { setMessage(text); window.setTimeout(() => setMessage(""), 3000); };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData(); data.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const result = await res.json();
      if (!res.ok || !result.imageUrl) throw new Error(result.error || "Image upload failed");
      update("image_url", result.imageUrl); notify("Offer image uploaded.");
    } catch (error) { notify(error.message || "Image upload failed."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const res = await fetch("/api/offers", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingId ? { ...form, id: editingId } : form) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not save offer");
      notify(editingId ? "Offer updated." : "Offer created and ready for the frontend."); reset(); load();
    } catch (error) { notify(error.message || "Could not save offer."); }
    finally { setSaving(false); }
  };

  const edit = (offer) => { setForm({ ...emptyOffer, ...offer, is_active: Boolean(offer.is_active) }); setEditingId(offer.id); setOpen(true); };
  const remove = async (id) => { if (!window.confirm("Delete this offer?")) return; const res = await fetch(`/api/offers?id=${id}`, { method: "DELETE" }); if (res.ok) { notify("Offer deleted."); load(); } else notify("Could not delete offer."); };
  const toggle = async (offer) => { const res = await fetch("/api/offers", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...offer, is_active: !Boolean(offer.is_active) }) }); if (res.ok) { notify(`Offer ${offer.is_active ? "unpublished" : "published"}.`); load(); } else notify("Could not update offer."); };

  return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 overflow-y-auto p-8"><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">Sticky Offers</h1><p className="mt-1 text-gray-500">Published offers appear in the persistent Offers button on the customer website.</p></div><button onClick={() => { setForm(emptyOffer); setEditingId(null); setOpen(true); }} className="admin-btn">Add Offer</button></div>
    {message && <div className="mb-5 rounded-lg bg-teal-50 p-3 text-sm text-teal-700">{message}</div>}
    {open && <form onSubmit={save} className="admin-card mb-7 space-y-4"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{editingId ? "Edit offer" : "New offer"}</h2><button type="button" onClick={reset} className="text-sm text-gray-500">Cancel</button></div><div className="grid gap-4 md:grid-cols-2"><label><span className="admin-label">Offer title *</span><input required value={form.title} onChange={(e) => update("title", e.target.value)} className="admin-input" placeholder="e.g. Europe summer special" /></label><label><span className="admin-label">Badge</span><input value={form.badge} onChange={(e) => update("badge", e.target.value)} className="admin-input" placeholder="e.g. Limited time" /></label><label className="md:col-span-2"><span className="admin-label">Description</span><textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="admin-input" rows={3} placeholder="Short offer description" /></label><label><span className="admin-label">Button text</span><input value={form.button_text} onChange={(e) => update("button_text", e.target.value)} className="admin-input" /></label><label><span className="admin-label">Button link</span><input value={form.button_link} onChange={(e) => update("button_link", e.target.value)} className="admin-input" placeholder="/contact or https://..." /></label><label><span className="admin-label">Sort order</span><input type="number" value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))} className="admin-input" /></label><label className="flex items-center gap-3 pt-7"><input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} className="h-4 w-4 accent-teal-600" /><span className="text-sm font-medium">Publish on frontend</span></label></div><div><span className="admin-label">Offer image</span><div className="flex flex-wrap gap-3"><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} className="admin-input max-w-md" disabled={uploading} /><input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} className="admin-input max-w-md" placeholder="Or paste image URL" /></div>{form.image_url && <img src={form.image_url} alt="Offer preview" className="mt-3 h-28 w-44 rounded-lg object-cover" />}</div><button disabled={saving || uploading} className="admin-btn">{saving ? "Saving..." : editingId ? "Update Offer" : "Create Offer"}</button></form>}
    <div className="space-y-3">{offers.map((offer) => <article key={offer.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"><div className="h-20 w-28 overflow-hidden rounded-lg bg-gray-100">{offer.image_url && <img src={offer.image_url} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-48 flex-1"><div className="flex gap-2"><h2 className="font-semibold text-gray-900">{offer.title}</h2>{offer.badge && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">{offer.badge}</span>}</div><p className="mt-1 text-sm text-gray-500">{offer.description || "No description"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-medium ${offer.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{offer.is_active ? "Published" : "Draft"}</span><div className="flex gap-2"><button onClick={() => toggle(offer)} className="admin-btn-secondary text-xs">{offer.is_active ? "Unpublish" : "Publish"}</button><button onClick={() => edit(offer)} className="admin-btn-secondary text-xs">Edit</button><button onClick={() => remove(offer.id)} className="admin-btn-danger text-xs">Delete</button></div></article>)}{offers.length === 0 && <div className="admin-card text-center text-sm text-gray-500">No offers yet. Add an offer to show the sticky frontend button.</div>}</div>
  </main></div>;
}
