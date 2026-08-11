"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await fetch("/api/offers?all=true");
    const result = await res.json();
    if (res.ok) setOffers(result.offers || []);
    else setMessage(result.error || "Could not load offers.");
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/offers?all=true");
        const result = await res.json();
        if (active) {
          if (res.ok) setOffers(result.offers || []);
          else setMessage(result.error || "Could not load offers.");
        }
      } catch (error) { if (active) setMessage("Could not load offers."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const notify = (text) => { setMessage(text); window.setTimeout(() => setMessage(""), 3000); };

  const remove = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    const res = await fetch(`/api/offers?id=${id}`, { method: "DELETE" });
    if (res.ok) { notify("Offer deleted."); load(); } else notify("Could not delete offer.");
  };

  const toggle = async (offer) => {
    const res = await fetch("/api/offers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...offer, is_active: !Boolean(offer.is_active) }),
    });
    if (res.ok) { notify(`Offer ${offer.is_active ? "unpublished" : "published"}.`); load(); } else notify("Could not update offer.");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sticky Offers</h1>
            <p className="mt-1 text-gray-500">Published offers appear in the persistent Offers button on the customer website.</p>
          </div>
          <button onClick={() => router.push("/offers/new")} className="admin-btn">Add Offer</button>
        </div>

        {message && <div className="mb-5 rounded-lg bg-teal-50 p-3 text-sm text-teal-700">{message}</div>}

        {loading ? (
          <LoadingSpinner text="Loading offers..." />
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <article key={offer.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <div className="h-20 w-28 overflow-hidden rounded-lg bg-gray-100">
                  {offer.image_url && <img src={offer.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-48 flex-1">
                  <div className="flex gap-2">
                    <h2 className="font-semibold text-gray-900">{offer.title}</h2>
                    {offer.badge && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">{offer.badge}</span>}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{offer.description || "No description"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${offer.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {offer.is_active ? "Published" : "Draft"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => toggle(offer)} className="admin-btn-secondary text-xs">{offer.is_active ? "Unpublish" : "Publish"}</button>
                  <button onClick={() => router.push(`/offers/${offer.id}`)} className="admin-btn-secondary text-xs">Edit</button>
                  <button onClick={() => remove(offer.id)} className="admin-btn-danger text-xs">Delete</button>
                </div>
              </article>
            ))}
            {offers.length === 0 && (
              <div className="admin-card text-center text-sm text-gray-500">No offers yet. Add an offer to show the sticky frontend button.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}