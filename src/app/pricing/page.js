"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import toast, { Toaster } from "react-hot-toast";

// Exchange rates (you can update these or fetch from an API)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  AED: 3.67,
  SGD: 1.35,
  AUD: 1.52,
  CAD: 1.36
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  AED: 'د.إ',
  SGD: 'S$',
  AUD: 'A$',
  CAD: 'C$'
};

export default function PricingPage() {
  const [pricing, setPricing] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ region: "", usd_price: "", currency: "USD" });
  const [message, setMessage] = useState("");

  useEffect(() => { fetchPricing(); }, []);

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/pricing");
      const data = await res.json();
      if (data.pricing) setPricing(data.pricing);
    } catch (error) { console.error(error); }
  };

  const convertCurrency = (usdPrice, targetCurrency) => {
    const rate = EXCHANGE_RATES[targetCurrency] || 1;
    const converted = (parseFloat(usdPrice) * rate).toFixed(0);
    const symbol = CURRENCY_SYMBOLS[targetCurrency] || '$';
    return `${symbol}${converted}`;
  };

  const handleSave = async () => {
    if (!form.region || !form.usd_price) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const usdPrice = parseFloat(form.usd_price);
      
      // Save for all currencies automatically
      const promises = Object.keys(EXCHANGE_RATES).map(currency => {
        const priceData = {
          region: form.region,
          currency: currency,
          starting_price: convertCurrency(usdPrice, currency),
          usd_price: usdPrice,
          is_active: 1
        };

        if (editingItem) {
          return fetch("/api/pricing", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...priceData, id: editingItem.id }),
          });
        } else {
          return fetch("/api/pricing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(priceData),
          });
        }
      });

      await Promise.all(promises);
      
      toast.success(editingItem ? "Pricing updated for all currencies!" : "Pricing added for all currencies!");
      setForm({ region: "", usd_price: "", currency: "USD" });
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
      usd_price: item.usd_price || (item.starting_price ? item.starting_price.replace(/[^0-9]/g, '') : ''),
      currency: "USD" 
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
        <p className="text-gray-500 mb-6">Enter price in USD. System will automatically convert to all currencies.</p>

        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Pricing by Region</h2>
            <button 
              onClick={() => { 
                setShowForm(true); 
                setEditingItem(null); 
                setForm({ region: "", usd_price: "", currency: "USD" }); 
              }} 
              className="admin-btn"
            >
              Add Region
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <div>
                  <label className="admin-label">Price (USD)</label>
                  <input 
                    type="number" 
                    value={form.usd_price} 
                    onChange={(e) => setForm({ ...form, usd_price: e.target.value })} 
                    className="admin-input" 
                    placeholder="799"
                  />
                </div>
              </div>
              
              {form.usd_price && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Auto-conversion preview:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {Object.keys(EXCHANGE_RATES).map(currency => (
                      <div key={currency} className="flex justify-between">
                        <span className="text-gray-600">{currency}:</span>
                        <span className="font-medium">{convertCurrency(form.usd_price, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleSave} className="admin-btn">
                  {editingItem ? "Update All Currencies" : "Add to All Currencies"}
                </button>
                <button 
                  onClick={() => { 
                    setShowForm(false); 
                    setEditingItem(null); 
                    setForm({ region: "", usd_price: "", currency: "USD" }); 
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500">USD Base</th>
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
                      <td className="py-3 px-4 text-gray-500">
                        {item.usd_price ? `$${item.usd_price}` : '-'}
                      </td>
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