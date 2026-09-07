"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResetUrl("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to process request");
      setMessage(data.message);
      if (data.developmentOnly) setResetUrl(data.resetUrl);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DCE8DF] to-[#FCF8F1] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-[#24564C]">Forgot password?</h1>
        <p className="mt-2 text-sm text-[#5D756C]">Enter your admin email and we will send a reset link.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="admin-label">Email</label>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="admin-input" placeholder="admin@example.com" />
          </div>
          {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          {resetUrl && <p className="break-all rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Local development reset link: <a href={resetUrl} className="underline">Open reset link</a></p>}
          <button type="submit" disabled={loading} className="w-full admin-btn py-3 disabled:opacity-50">{loading ? "Sending..." : "Send reset link"}</button>
        </form>
        <Link href="/login" className="mt-5 block text-center text-sm font-medium text-[#24564C] hover:underline">Back to sign in</Link>
      </div>
    </div>
  );
}