"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import toast, { Toaster } from "react-hot-toast";

const SUPPORTED_CURRENCIES = ["USD", "INR", "EUR"];

const CURRENCY_SYMBOLS = { USD: "$", INR: "₹", EUR: "€" };

export default function PricingPage() {
  const [pricing, setPricing] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ region: "", price_usd: "", price_inr: "", price_eur: "" });
  const [message, setMessage] = useState("");

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/pricing");
      const data = await res.json();
      if (data.pricing) setPricing(data.pricing);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchPricing(); }, []);

  const handleSave = async () => {
    if (!form.region || (!form.price_usd && !form.price_inr && !form.price_eur)) {
      toast.error("Please fill region and at least one price");
      return;
    }

    try {
      // Save static prices for each supported currency — no conversions
      const promises = [];
      const currencies = [
        { code: "USD", price: form.price_usd },
        { code: "INR", price: form.price_inr },
        { code: "EUR", price: form.price_eur },
      ];

      for (const c of currencies) {
        if (!c.price) continue;
        const priceData = {
          region: form.region,
          currency: c.code,
          starting_price: `${CURRENCY_SYMBOLS[c.code]}${c.price}`,
          usd_price: "",
          is_active: 1,
        };

        if (editingItem) {
          promises.push(
            fetch("/api/pricing", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...priceData, id: editingItem.id }),
            })
          );
        } else {
          promises.push(
            fetch("/api/pricing", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(priceData),
            })
          );
        }
      }

      await Promise.all(promises);

      toast.success(editingItem ? "Pricing updated!" : "Pricing added!");
      setForm({ region: "", price_usd: "", price_inr: "", price_eur: "" });
      setShowForm(false);
      setEditingItem(null);
      fetchPricing();
    } catch (error) {
      toast.error("Error saving pricing");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this region pricing?")) return;
    try {
      await fetch(`/api/pricing?id=${id}`, { method: "DELETE" });
      toast.success("Region deleted!");
      fetchPricing();
    } catch (error) {
      toast.error("Error deleting");
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setForm({
      region: item.region,
      price_usd: item.currency === "USD" ? item.starting_price.replace(/[^0-9.]/g, "") : "",
      price_inr: item.currency === "INR" ? item.starting_price.replace(/[^0-9.]/g, "") : "",
      price_eur: item.currency === "EUR" ? item.starting_price.replace(/[^0-9.]/g, "") : "",
    });
    setShowForm(true);
  };

  // Group pricing by region
  const groupedPricing = pricing.reduce((acc, item) => {
    if (!acc[item.region]) {
      acc[item.region] = [];
    }
    acc[item.region].push(item);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-right" />
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Region-wise Pricing</h1>
        <p className="text-gray-500 mb-6">Enter static prices for USD, INR, and EUR. No automatic conversions — the selected currency shows its own fixed price.</p>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Pricing by Region</h2>
            <button 
              onClick={() => { 
                setShowForm(true); 
                setEditingItem(null); 
                setForm({ region: "", price_usd: "", price_inr: "", price_eur: "" }); 
              }} 
              className="admin-btn"
            >
              Add Region
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
              <div>
                <label className="admin-label">Region Name</label>
                <input 
                  type="text" 
                  value={form.region} 
                  onChange={(e) => setForm({ ...form, region: e.target.value })} 
                  className="admin-input" 
                  placeholder="e.g., Europe, Asia, Middle East"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="admin-label">Price (USD)</label>
                  <input 
                    type="number" 
                    value={form.price_usd} 
                    onChange={(e) => setForm({ ...form, price_usd: e.target.value })} 
                    className="admin-input" 
                    placeholder="799"
                  />
                </div>
                <div>
                  <label className="admin-label">Price (INR)</label>
                  <input 
                    type="number" 
                    value={form.price_inr} 
                    onChange={(e) => setForm({ ...form, price_inr: e.target.value })} 
                    className="admin-input" 
                    placeholder="64999"
                  />
                </div>
                <div>
                  <label className="admin-label">Price (EUR)</label>
                  <input 
                    type="number" 
                    value={form.price_eur} 
                    onChange={(e) => setForm({ ...form, price_eur: e.target.value })} 
                    className="admin-input" 
                    placeholder="699"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Enter each currency{"'"}s own static price. These are displayed exactly as entered — no auto-conversion.</p>

              <div className="flex gap-3">
                <button onClick={handleSave} className="admin-btn">
                  {editingItem ? "Update Pricing" : "Add Pricing"}
                </button>
                <button 
                  onClick={() => { 
                    setShowForm(false); 
                    setEditingItem(null); 
                    setForm({ region: "", price_usd: "", price_inr: "", price_eur: "" }); 
                  }} 
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Region</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Currency</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedPricing).map(([region, items]) => (
                  items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {idx === 0 && (
                        <td rowSpan={items.length} className="py-3 px-4 font-medium align-top">
                          {region}
                        </td>
                      )}
                      <td className="py-3 px-4">{item.currency}</td>
                      <td className="py-3 px-4 font-medium">{item.starting_price}</td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => startEdit(item)} 
                          className="text-teal-600 hover:text-teal-800 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
            {pricing.length === 0 && (
              <p className="text-gray-400 text-sm py-4 text-center">No pricing configured yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}