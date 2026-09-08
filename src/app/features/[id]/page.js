"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import useStatusToast from "@/hooks/useStatusToast";

export default function EditFeaturePage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ icon: "", title: "", description: "", sort_order: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useStatusToast();

  useEffect(() => {
    fetch("/api/features?all=true").then((response) => response.json()).then((result) => {
      const feature = result.features?.find((item) => String(item.id) === String(id));
      if (feature) setForm({ icon: feature.icon || "", title: feature.title || "", description: feature.description || "", sort_order: feature.sort_order || 0 });
      else setMessage("Feature not found");
    }).catch(() => setMessage("Could not load feature")).finally(() => setLoading(false));
  }, [id, setMessage]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) return setMessage("Title and description are required");
    setSaving(true);
    try {
      const response = await fetch("/api/features", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id, is_active: 1 }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not update feature");
      router.replace("/features");
    } catch (error) { setMessage(error.message || "Could not update feature"); }
    finally { setSaving(false); }
  };

  return <div className="flex min-h-screen"><Sidebar /><main className="flex-1 overflow-y-auto p-8">
    <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900">Edit Feature</h1><p className="mt-1 text-sm text-gray-500">Update this homepage feature.</p></div><button type="button" onClick={() => router.push("/features")} className="admin-btn-secondary">Back to Features</button></div>
    {message && <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{message}</div>}
    {loading ? <p>Loading...</p> : <div className="admin-card max-w-3xl space-y-4"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><label className="admin-label">Icon Name</label><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="admin-input" /></div><div><label className="admin-label">Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })} className="admin-input" /></div></div><div><label className="admin-label">Title *</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" /></div><div><label className="admin-label">Description *</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="admin-input" rows={5} /></div><button type="button" onClick={handleSave} disabled={saving} className="admin-btn">{saving ? "Saving..." : "Update Feature"}</button></div>}
  </main></div>;
}
