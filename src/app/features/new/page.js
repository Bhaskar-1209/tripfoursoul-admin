"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import useStatusToast from "@/hooks/useStatusToast";

export default function NewFeaturePage() {
  const router = useRouter();
  const [form, setForm] = useState({ icon: "", title: "", description: "", sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useStatusToast();
  useEffect(() => {
    fetch("/api/sort-order?table=features").then((response) => response.json()).then((result) => {
      if (result.nextSortOrder) setForm((previous) => ({ ...previous, sort_order: result.nextSortOrder }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setMessage("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, is_active: 1 }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not create feature");
      router.replace("/homepage?tab=features");
    } catch (error) {
      setMessage(error.message || "Could not create feature");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Feature</h1>
            <p className="mt-1 text-sm text-gray-500">Create a feature for the homepage.</p>
          </div>
          <button type="button" onClick={() => router.push("/homepage?tab=features")} className="admin-btn-secondary">Back to Features</button>
        </div>

        {message && <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">{message}</div>}

        <div className="admin-card space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="admin-label">Icon Name</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="admin-input" placeholder="e.g., best-price" />
            </div>
            <div>
              <label className="admin-label">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })} className="admin-input" />
            </div>
          </div>
          <div>
            <label className="admin-label">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="admin-input" />
          </div>
          <div>
            <label className="admin-label">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="admin-input" rows={5} />
          </div>
          <button type="button" onClick={handleSave} disabled={saving} className="admin-btn">
            {saving ? "Saving..." : "Add Feature"}
          </button>
        </div>
      </main>
    </div>
  );
}
