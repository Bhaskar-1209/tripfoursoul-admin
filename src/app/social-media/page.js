"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

const emptySocial = { facebook: "", instagram: "", linkedin: "", tiktok: "", youtube: "", whatsapp: "" };

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="admin-input" placeholder={placeholder} />
    </label>
  );
}

export default function SocialMediaPage() {
  const [social, setSocial] = useState(emptySocial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings && d.settings.social) {
          setSocial((old) => ({ ...old, ...d.settings.social }));
        }
      })
      .catch(() => setError("Could not load saved social media links."))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const r = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "social", value: social }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setMessage("Social media links saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setError(e.message || "Could not save social media links.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Social Media Links</h1>
          <p className="text-gray-500 mt-1">Add your company website and social media handle links here. These are used across the entire website (footer, contact page, etc.).</p>
        </div>

        {loading && <p className="text-gray-400 text-sm">Loading...</p>}
        {message && <div className="mb-6 rounded-lg bg-teal-50 p-3 text-sm text-teal-700">{message}</div>}
        {error && <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="admin-card">
          <h2 className="text-lg font-semibold mb-1">Company socials</h2>
          <p className="text-sm text-gray-500 mb-4">Enter full URLs, e.g. https://instagram.com/yourpage</p>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Facebook" value={social.facebook} onChange={(v) => setSocial((old) => ({ ...old, facebook: v }))} placeholder="https://facebook.com/..." />
            <Field label="Instagram" value={social.instagram} onChange={(v) => setSocial((old) => ({ ...old, instagram: v }))} placeholder="https://instagram.com/..." />
            <Field label="LinkedIn" value={social.linkedin} onChange={(v) => setSocial((old) => ({ ...old, linkedin: v }))} placeholder="https://linkedin.com/..." />
            <Field label="TikTok" value={social.tiktok} onChange={(v) => setSocial((old) => ({ ...old, tiktok: v }))} placeholder="https://tiktok.com/..." />
            <Field label="YouTube" value={social.youtube} onChange={(v) => setSocial((old) => ({ ...old, youtube: v }))} placeholder="https://youtube.com/..." />
            <Field label="WhatsApp" value={social.whatsapp} onChange={(v) => setSocial((old) => ({ ...old, whatsapp: v }))} placeholder="https://wa.me/1234567890" />
          </div>

          <button onClick={save} disabled={saving} className="admin-btn mt-4">
            {saving ? "Saving..." : "Save Social Media Links"}
          </button>
        </div>
      </main>
    </div>
  );
}