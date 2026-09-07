"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ResetPasswordForm /></Suspense>;
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) return setMessage("Passwords do not match");
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to reset password");
      setMessage(data.message);
      setTimeout(() => router.push("/login"), 1200);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DCE8DF] to-[#FCF8F1] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-[#24564C]">Set a new password</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="admin-label">New password</label><input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="admin-input" /></div>
          <div><label className="admin-label">Confirm password</label><input type="password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="admin-input" /></div>
          {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          <button type="submit" disabled={loading || !token} className="w-full admin-btn py-3 disabled:opacity-50">{loading ? "Updating..." : "Update password"}</button>
        </form>
      </div>
    </div>
  );
}