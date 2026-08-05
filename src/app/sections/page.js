"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function SectionsPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/sections");
      const data = await res.json();
      if (data.sections) setSections(data.sections);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const toggleVisibility = async (section) => {
    try {
      await fetch("/api/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: section.id, 
          is_visible: section.is_visible ? 0 : 1 
        }),
      });
      setMessage(`Section "${section.section_name}" ${section.is_visible ? 'hidden' : 'shown'} successfully!`);
      setTimeout(() => setMessage(""), 3000);
      fetchSections();
    } catch (error) {
      setMessage("Error updating section");
      console.error(error);
    }
  };

  const updateSortOrder = async (section, newOrder) => {
    try {
      await fetch("/api/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: section.id, 
          sort_order: parseInt(newOrder) 
        }),
      });
      setMessage("Sort order updated!");
      setTimeout(() => setMessage(""), 3000);
      fetchSections();
    } catch (error) {
      setMessage("Error updating sort order");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sections...</p>
          </div>
      </main>
    </div>
  );
}

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Homepage Sections Management</h1>

        {message && (
          <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">
            {message}
          </div>
        )}

        <div className="admin-card">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">All Sections</h2>
            <p className="text-sm text-gray-600">
              Manage which sections appear on the homepage and their order. 
              Toggle visibility and set sort order (lower numbers appear first).
            </p>
          </div>

          <div className="space-y-3">
            {sections.map((section) => (
              <div 
                key={section.id} 
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  section.is_visible 
                    ? 'bg-white border-gray-200' 
                    : 'bg-gray-50 border-gray-300 opacity-75'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">
                      {section.section_name}
                    </h4>
                    <span className="text-xs text-gray-500 font-mono">
                      ({section.section_key})
                    </span>
                    {section.is_visible ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Visible
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Order:</label>
                    <input 
                      type="number" 
                      value={section.sort_order} 
                      onChange={(e) => updateSortOrder(section, e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                    />
                  </div>

                  <button
                    onClick={() => toggleVisibility(section)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      section.is_visible
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {section.is_visible ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {sections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No sections found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}