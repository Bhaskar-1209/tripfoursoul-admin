"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DealsPage() {
  const [data, setData] = useState({
    tagline: "Travel offers",
    heading: "Make more of every journey.",
    description: "Discover current seasonal offers and speak with our team to find the journey that suits your plans.",
    button_text: "Ask about offers",
    button_link: "/contact?subject=Offer%20enquiry",
    card_tagline: "Planning made personal",
    card_heading: "Get a tailored recommendation, clear inclusions, and expert support before you book.",
    card_description: "Offer availability and final pricing are confirmed by the travel team.",
    is_active: 1,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/deals");
      if (res.ok) {
        const result = await res.json();
        setData((prev) => ({ ...prev, ...result }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/deals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setMessage("Deals section updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating Deals section");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Deals Section Management</h1>

        {message && (
          <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>
        )}

        <div className="admin-card">
          {/* Publish Toggle */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold">Section Visibility</h2>
              <p className="text-sm text-gray-500 mt-1">Toggle this section on/off on the homepage</p>
            </div>
            <button
              onClick={() => setData({ ...data, is_active: data.is_active ? 0 : 1 })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                data.is_active
                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {data.is_active ? "Published" : "Unpublished"}
            </button>
          </div>

          {/* Left Side Content */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Left Side Content</h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Tagline (small text above heading)</label>
                <input
                  type="text"
                  value={data.tagline}
                  onChange={(e) => setData({ ...data, tagline: e.target.value })}
                  className="admin-input"
                  placeholder="e.g., Travel offers"
                />
              </div>
              <div>
                <label className="admin-label">Heading</label>
                <input
                  type="text"
                  value={data.heading}
                  onChange={(e) => setData({ ...data, heading: e.target.value })}
                  className="admin-input"
                  placeholder="e.g., Make more of every journey."
                />
              </div>
              <div>
                <label className="admin-label">Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  className="admin-input"
                  rows={3}
                  placeholder="Description text..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Button Text</label>
                  <input
                    type="text"
                    value={data.button_text}
                    onChange={(e) => setData({ ...data, button_text: e.target.value })}
                    className="admin-input"
                    placeholder="e.g., Ask about offers"
                  />
                </div>
                <div>
                  <label className="admin-label">Button Link</label>
                  <input
                    type="text"
                    value={data.button_link}
                    onChange={(e) => setData({ ...data, button_link: e.target.value })}
                    className="admin-input"
                    placeholder="e.g., /contact?subject=Offer%20enquiry"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Card Content */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Right Side Card Content</h3>
            <div className="space-y-4">
              <div>
                <label className="admin-label">Card Tagline (small text)</label>
                <input
                  type="text"
                  value={data.card_tagline}
                  onChange={(e) => setData({ ...data, card_tagline: e.target.value })}
                  className="admin-input"
                  placeholder="e.g., Planning made personal"
                />
              </div>
              <div>
                <label className="admin-label">Card Heading (main text)</label>
                <textarea
                  value={data.card_heading}
                  onChange={(e) => setData({ ...data, card_heading: e.target.value })}
                  className="admin-input"
                  rows={3}
                  placeholder="Card main text..."
                />
              </div>
              <div>
                <label className="admin-label">Card Description (subtext)</label>
                <textarea
                  value={data.card_description}
                  onChange={(e) => setData({ ...data, card_description: e.target.value })}
                  className="admin-input"
                  rows={2}
                  placeholder="Card subtext..."
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="admin-btn">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}