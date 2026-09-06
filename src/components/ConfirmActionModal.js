"use client";

export default function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
  showSortOrder = false,
  sortOrder = "",
  onSortOrderChange,
}) {
  if (!open) return null;

  const sortMissing = showSortOrder && (!sortOrder || Number(sortOrder) <= 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="confirm-action-title" className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        {showSortOrder && (
          <div className="mt-4">
            <label className="admin-label mb-1.5 block text-sm font-medium text-gray-700">Sort Number</label>
            <input
              type="number"
              min="1"
              step="1"
              value={sortOrder}
              onChange={(e) => onSortOrderChange?.(e.target.value)}
              className="admin-input"
              placeholder="Enter a unique sort number"
              autoFocus
            />
            {sortMissing && <p className="mt-1 text-xs text-red-600">Sort number is required to publish.</p>}
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={loading} className="admin-btn-secondary">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={loading || sortMissing} className={danger ? "admin-btn-danger" : "admin-btn"}>
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
