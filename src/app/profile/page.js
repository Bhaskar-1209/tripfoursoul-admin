"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

const roleLabel = (role) => role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : "Staff";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-7">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#C8755A]">Account</p>
          <h1 className="text-3xl font-bold text-[#25463F]">My Profile</h1>
          <p className="mt-2 text-sm text-[#5D756C]">View your admin account details and section access.</p>
        </div>
        {loading ? <LoadingSpinner text="Loading profile..." /> : user ? (
          <div className="grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.25fr]">
            <section className="admin-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DCE8DF] text-2xl font-bold text-[#24564C]">{(user.username || "A").slice(0, 1).toUpperCase()}</div>
              <h2 className="mt-5 text-xl font-bold text-[#25463F]">{user.username}</h2>
              <p className="mt-1 text-sm text-[#5D756C]">{user.email || "No email added"}</p>
              <span className="mt-4 inline-flex rounded-full bg-[#F8E5DE] px-3 py-1 text-xs font-semibold text-[#A8543E]">{roleLabel(user.role)}</span>
              {user.created_at && <p className="mt-6 text-xs text-[#789B89]">Account created: {new Date(user.created_at).toLocaleDateString()}</p>}
            </section>
            <section className="admin-card">
              <h2 className="text-lg font-semibold text-[#25463F]">Your access</h2>
              <p className="mt-1 text-sm text-[#5D756C]">These sections are available to your account.</p>
              {user.role === "admin" || user.role === "super_admin" ? (
                <div className="mt-5 rounded-lg bg-[#F1F7F2] p-4 text-sm font-medium text-[#24564C]">Full admin access to all management sections.</div>
              ) : user.permissions?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">{user.permissions.map((permission) => <span key={permission} className="rounded-full bg-[#EEF4EF] px-3 py-1.5 text-xs font-medium text-[#24564C]">{permission}</span>)}</div>
              ) : <p className="mt-5 text-sm text-[#789B89]">No sections assigned yet.</p>}
            </section>
          </div>
        ) : <div className="admin-card text-sm text-red-600">Could not load your profile.</div>}
      </main>
    </div>
  );
}