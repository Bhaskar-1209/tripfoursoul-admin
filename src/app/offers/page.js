"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import ConfirmActionModal from "@/components/ConfirmActionModal";
import toast from "react-hot-toast";

const formatDate = (value) => {
  const match = String(value || "").match(/^\d{4}-\d{2}-\d{2}/);
  if (!match) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${match[0]}T00:00:00Z`));
};

const travelDatesLabel = (offer) => {
  const start = formatDate(offer.travel_start_date);
  const end = formatDate(offer.travel_end_date);
  if (start && end) return `Travel: ${start} – ${end}`;
  if (start) return `Travel from: ${start}`;
  if (end) return `Travel until: ${end}`;
  return "";
};

const publishStatusLabel = (offer) => {
  if (!offer.is_active) return "Unpublished";
  if (!offer.published_until) return "Published";
  const until = new Date(offer.published_until);
  if (until.getTime() <= Date.now()) return "Expired";
  return `Expires ${new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(until)}`;
};

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "published", label: "Published" },
    { id: "unpublished", label: "Unpublished" },
  ];

  const load = async () => {
    const res = await fetch("/api/offers?all=true");
    const result = await res.json();
    if (res.ok) setOffers(result.offers || []);
    else throw new Error(result.error || "Could not load offers.");
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/offers?all=true");
        const result = await res.json();
        if (active) {
          if (res.ok) setOffers(result.offers || []);
          else toast.error(result.error || "Could not load offers.");
        }
      } catch (error) { if (active) toast.error(error.message || "Could not load offers."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const remove = async (offer) => {
    try {
      const res = await fetch(`/api/offers?id=${offer.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not delete offer.");
      toast.success(`Offer "${offer.title}" deleted.`);
      await load();
    } catch (error) {
      toast.error(error.message || "Could not delete offer.");
    }
  };

  const toggle = async (offer) => {
    try {
      const res = await fetch("/api/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...offer, is_active: !Boolean(offer.is_active) }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not update offer.");
      toast.success(`Offer "${offer.title}" ${offer.is_active ? "unpublished" : "published"}.`);
      await load();
    } catch (error) {
      toast.error(error.message || "Could not update offer.");
    }
  };

  const confirmSelectedAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    if (confirmAction.type === "publish") await toggle(confirmAction.item);
    if (confirmAction.type === "delete") await remove(confirmAction.item);
    setActionLoading(false);
    setConfirmAction(null);
  };

  const filteredOffers = offers.filter((offer) => {
    if (activeFilter === "published") return Boolean(offer.is_active);
    if (activeFilter === "unpublished") return !offer.is_active;
    return true;
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
            <p className="mt-1 text-gray-500">Published offers appear in the persistent Offers button on the customer website.</p>
          </div>
          <button onClick={() => router.push("/offers/new")} className="admin-btn">Add Offer</button>
        </div>

        <section className="admin-card">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">All Offers ({filteredOffers.length})</h2>
            <div className="flex flex-wrap gap-2" aria-label="Filter offers">
              {filters.map((filter) => (
                <button key={filter.id} type="button" onClick={() => setActiveFilter(filter.id)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${activeFilter === filter.id ? "border-teal-600 bg-teal-600 text-white" : "border-gray-300 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-700"}`}>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? <LoadingSpinner text="Loading offers..." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500"><th className="px-3 py-3 font-semibold">Offer</th><th className="px-3 py-3 font-semibold">Travel dates</th><th className="px-3 py-3 font-semibold">Coupon</th><th className="px-3 py-3 font-semibold">Duration</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Actions</th></tr></thead>
                <tbody>
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3"><div className="flex items-center gap-3">{offer.image_url && <img src={offer.image_url} alt={offer.title} className="h-12 w-16 rounded object-cover" />}<div><p className="font-medium text-gray-900">{offer.title}</p>{offer.badge && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">{offer.badge}</span>}</div></div></td>
                      <td className="px-3 py-3 text-gray-600">{travelDatesLabel(offer) || "—"}</td>
                      <td className="px-3 py-3 text-gray-600">{offer.coupon_code || "—"}</td>
                      <td className="px-3 py-3 text-gray-600">{offer.duration || (offer.duration_days ? `${offer.duration_days} days` : "—")}</td>
                      <td className={`px-3 py-3 text-xs font-medium ${publishStatusLabel(offer) === "Expired" ? "text-amber-700" : "text-gray-600"}`}>{publishStatusLabel(offer)}</td>
                      <td className="px-3 py-3"><div className="flex flex-wrap gap-1"><button onClick={() => router.push(`/offers/${offer.id}`)} className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100">Edit</button><button onClick={() => setConfirmAction({ type: "publish", item: offer })} className={`rounded border px-2 py-1 text-xs ${offer.is_active ? "border-green-600 bg-green-600 text-white" : "border-green-300 bg-white text-green-600 hover:bg-green-50"}`}>{offer.is_active ? "✓ Published" : "Unpublished"}</button><button onClick={() => setConfirmAction({ type: "delete", item: offer })} className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredOffers.length && <p className="py-8 text-center text-sm text-gray-400">No {activeFilter === "all" ? "offers" : activeFilter} offers found.</p>}
            </div>
          )}
        </section>
      </main>
      <ConfirmActionModal
        open={Boolean(confirmAction)}
        title={confirmAction?.type === "delete" ? "Delete offer?" : `${confirmAction?.item?.is_active ? "Unpublish" : "Publish"} offer?`}
        description={confirmAction?.type === "delete" ? `"${confirmAction?.item?.title}" will be permanently deleted. This cannot be undone.` : confirmAction?.item?.is_active ? `"${confirmAction?.item?.title}" will be hidden from the public website but kept in admin.` : `"${confirmAction?.item?.title}" will become visible on the public website.`}
        confirmLabel={confirmAction?.type === "delete" ? "Delete permanently" : confirmAction?.item?.is_active ? "Unpublish" : "Publish"}
        danger={confirmAction?.type === "delete"}
        loading={actionLoading}
        onConfirm={confirmSelectedAction}
        onCancel={() => !actionLoading && setConfirmAction(null)}
      />
    </div>
  );
}
