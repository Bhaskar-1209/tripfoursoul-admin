"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [isError, setIsError] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResetUrl("");
    setIsError(false);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to process request");
      setMessage(data.message);
      // Show reset URL directly on screen (when no email provider or dev mode)
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
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
          {message && (
            <p className={`rounded-lg p-3 text-sm ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {message}
            </p>
          )}
          {resetUrl && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">🔗 Your password reset link:</p>
              <a
                href={resetUrl}
                className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Click here to reset password
              </a>
              <p className="text-xs text-amber-600 mt-2">This link expires in 1 hour.</p>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full admin-btn py-3 disabled:opacity-50">{loading ? "Sending..." : "Send reset link"}</button>
        </form>
        <Link href="/login" className="mt-5 block text-center text-sm font-medium text-[#24564C] hover:underline">Back to sign in</Link>
      </div>
    </div>
  );
}