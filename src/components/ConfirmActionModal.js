"use client";

export default function ConfirmActionModal({ open, title, description, confirmLabel = "Confirm", danger = false, loading = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="confirm-action-title" className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={loading} className="admin-btn-secondary">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={loading} className={danger ? "admin-btn-danger" : "admin-btn"}>
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
