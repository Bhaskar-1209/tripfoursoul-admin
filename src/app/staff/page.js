"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

const PERMISSION_OPTIONS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "banner", label: "Banner" },
  { value: "trending", label: "Trending" },
  { value: "pricing", label: "Region Pricing" },
  { value: "destinations", label: "Popular Destinations" },
  { value: "packages", label: "Packages" },
  { value: "spiritual", label: "Spiritual Escape" },
  { value: "about", label: "About Us" },
  { value: "features", label: "Features" },
  { value: "testimonials", label: "Testimonials" },
  { value: "page-banners", label: "Page Banners" },
  { value: "gallery", label: "Gallery" },
  { value: "team-members", label: "Team Members" },
  { value: "deals", label: "Deals" },
  { value: "sections", label: "Homepage Sections" },
  { value: "trips", label: "Trips & Packages" },
  { value: "blog", label: "Blog" },
  { value: "staff", label: "Staff Management" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "staff", permissions: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Fetch user info from server (httpOnly cookie can't be read client-side)
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user && (data.user.role === "admin" || data.user.role === "super_admin")) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/auth/staff");
      const data = await res.json();
      if (data.staff) setStaff(data.staff);
    } catch (error) {
      console.error(error);
    }
  };

  const togglePermission = (perm) => {
    setForm((prev) => {
      const perms = prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: perms };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = "/api/auth/staff";
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem
        ? { ...form, id: editingItem.id, password: form.password || undefined }
        : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save staff member");

      setMessage(editingItem ? "Staff member updated successfully!" : "Staff member created successfully!");
      setTimeout(() => setMessage(""), 3000);
      setForm({ username: "", email: "", password: "", role: "staff", permissions: [] });
      setShowForm(false);
      setEditingItem(null);
      fetchStaff();
    } catch (error) {
      setMessage(error.message);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const res = await fetch(`/api/auth/staff?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete staff member");
      }
      setMessage("Staff member deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
      fetchStaff();
    } catch (error) {
      setMessage(error.message);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setForm({
      username: item.username,
      email: item.email || "",
      password: "",
      role: item.role || "staff",
      permissions: item.permissions || [],
    });
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff Management</h1>

        {message && <div className="p-4 rounded-lg mb-6 bg-green-50 text-green-600">{message}</div>}

        {!isAdmin && (
          <div className="p-4 rounded-lg mb-6 bg-amber-50 text-amber-700 border border-amber-200">
            You have read-only access to this page. Only administrators can create, edit, or delete staff accounts.
          </div>
        )}

        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">All Staff Members</h2>
            {isAdmin && (
              <button
                onClick={() => { setShowForm(true); setEditingItem(null); setForm({ username: "", email: "", password: "", role: "staff", permissions: [] }); }}
                className="admin-btn"
              >
                Add New Staff
              </button>
            )}
          </div>

          {/* Add/Edit Form */}
          {(showForm || editingItem) && isAdmin && (
            <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">{editingItem ? "Edit Staff Member" : "Add New Staff Member"}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Username *</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="admin-input"
                    placeholder="e.g., rajesh"
                    disabled={editingItem?.username === "admin"}
                  />
                </div>

                <div>
                  <label className="admin-label">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="admin-input"
                    placeholder="e.g., staff@tripforsoul.com"
                  />
                </div>

                <div>
                  <label className="admin-label">Password {editingItem && "(Leave blank to keep current)"} *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="admin-input"
                    placeholder={editingItem ? "Enter new password" : "Enter password"}
                  />
                </div>

                <div>
                  <label className="admin-label">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="admin-input"
                    disabled={editingItem?.username === "admin"}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">Permissions</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                    {PERMISSION_OPTIONS.map((perm) => (
                      <label
                        key={perm.value}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                          form.permissions.includes(perm.value)
                            ? "bg-teal-50 border-teal-300 text-teal-900"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(perm.value)}
                          onChange={() => togglePermission(perm.value)}
                          className="h-4 w-4 accent-teal-600"
                          disabled={form.role === "admin" || form.role === "super_admin" || editingItem?.username === "admin"}
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.role === "admin" || form.role === "super_admin"
                      ? "Admins have access to all sections automatically."
                      : "Select which sections this staff member can access."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || !form.username || (!editingItem && !form.password)} className="admin-btn">
                  {saving ? "Saving..." : editingItem ? "Update Staff Member" : "Create Staff Member"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setEditingItem(null); }}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Staff List */}
          <div className="space-y-3">
            {staff.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{item.username}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.role === "admin" || item.role === "super_admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-teal-100 text-teal-700"
                    }`}>
                      {item.role === "super_admin" ? "Super Admin" : item.role === "admin" ? "Admin" : "Staff"}
                    </span>
                    {item.username === "admin" && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">Primary</span>
                    )}
                  </div>
                  {item.email && <p className="text-sm text-gray-500 mb-1">{item.email}</p>}
                  {item.role === "staff" && item.permissions?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.permissions.map((perm) => (
                        <span key={perm} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                          {PERMISSION_OPTIONS.find((p) => p.value === perm)?.label || perm}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.role === "staff" && (!item.permissions || item.permissions.length === 0) && (
                    <p className="text-xs text-gray-400 mt-1">No specific permissions set</p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="admin-btn-secondary text-xs px-3 py-1.5"
                    >
                      Edit
                    </button>
                    {item.username !== "admin" && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="admin-btn-danger text-xs px-3 py-1.5"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {staff.length === 0 && (
              <p className="text-gray-400 text-sm py-8 text-center">No staff members found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}