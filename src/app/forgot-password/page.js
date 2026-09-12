"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: email, Step 2: otp + new password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState(""); // shown when no email configured
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1 — Request OTP
  const requestOTP = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);
    setDevOtp("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send OTP");
      if (data.noEmail && data.otp) {
        setDevOtp(data.otp);
        // Don't show message — OTP box already shows everything
      } else {
        setMessage(data.message);
      }
      setStep(2);
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP + Reset Password
  const resetPassword = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsError(true);
      return;
    }
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to reset password");
      setMessage(data.message);
      setIsError(false);
      setTimeout(() => router.push("/login"), 1500);
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? "bg-[#24564C] text-white" : "bg-green-500 text-white"}`}>
            {step > 1 ? "✓" : "1"}
          </div>
          <div className={`flex-1 h-1 rounded ${step > 1 ? "bg-green-500" : "bg-gray-200"}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? "bg-[#24564C] text-white" : "bg-gray-200 text-gray-400"}`}>
            2
          </div>
        </div>

        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-[#24564C]">Forgot password?</h1>
            <p className="mt-2 text-sm text-[#5D756C]">Enter your admin email. We&apos;ll send a 6-digit OTP.</p>
            <form onSubmit={requestOTP} className="mt-6 space-y-4">
              <div>
                <label className="admin-label">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input"
                  placeholder="admin@tripforsoul.com"
                />
              </div>
              {message && (
                <p className={`rounded-lg p-3 text-sm ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {message}
                </p>
              )}
              <button type="submit" disabled={loading} className="w-full admin-btn py-3 disabled:opacity-50">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#24564C]">Enter OTP</h1>
            <p className="mt-2 text-sm text-[#5D756C]">
              OTP sent to <strong>{email}</strong>. Valid for 10 minutes.
            </p>

            {/* Show OTP on screen if no email configured */}
            {devOtp && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
                <p className="text-xs text-amber-700 font-medium mb-1">Email not configured — your OTP:</p>
                <p className="text-3xl font-bold tracking-widest text-amber-800">{devOtp}</p>
              </div>
            )}

            <form onSubmit={resetPassword} className="mt-6 space-y-4">
              <div>
                <label className="admin-label">6-digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="admin-input text-center text-2xl tracking-widest font-bold"
                  placeholder="000000"
                />
              </div>
              <div>
                <label className="admin-label">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="admin-label">Confirm Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="admin-input"
                  placeholder="Repeat new password"
                />
              </div>
              {message && (
                <p className={`rounded-lg p-3 text-sm ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {message}
                </p>
              )}
              <button type="submit" disabled={loading} className="w-full admin-btn py-3 disabled:opacity-50">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => { setStep(1); setMessage(""); setOtp(""); setDevOtp(""); }}
                className="w-full text-sm text-center text-[#24564C] hover:underline"
              >
                ← Back / Resend OTP
              </button>
            </form>
          </>
        )}

        <Link href="/login" className="mt-5 block text-center text-sm font-medium text-[#24564C] hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}