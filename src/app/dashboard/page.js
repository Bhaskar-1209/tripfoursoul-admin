"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { LayoutDashboard, Image, TrendingUp, DollarSign, MapPin, Layers } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    bannerImages: 0,
    trendingItems: 0,
    pricingRegions: 0,
    destinations: 0,
    sections: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [bannerRes, trendingRes, pricingRes, destRes, sectionsRes] = await Promise.all([
        fetch("/api/banner"),
        fetch("/api/trending"),
        fetch("/api/pricing"),
        fetch("/api/destinations"),
        fetch("/api/sections"),
      ]);

      const banner = await bannerRes.json();
      const trending = await trendingRes.json();
      const pricing = await pricingRes.json();
      const dest = await destRes.json();
      const sections = await sectionsRes.json();

      setStats({
        bannerImages: banner.images?.length || 0,
        trendingItems: trending.items?.length || 0,
        pricingRegions: pricing.pricing?.length || 0,
        destinations: dest.destinations?.length || 0,
        sections: sections.sections?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const cards = [
    { label: "Banner Images", value: stats.bannerImages, icon: Image, color: "bg-blue-500" },
    { label: "Trending Items", value: stats.trendingItems, icon: TrendingUp, color: "bg-purple-500" },
    { label: "Region Pricing", value: stats.pricingRegions, icon: DollarSign, color: "bg-green-500" },
    { label: "Destinations", value: stats.destinations, icon: MapPin, color: "bg-orange-500" },
    { label: "Homepage Sections", value: stats.sections, icon: Layers, color: "bg-teal-500" },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to TripForSoul Admin Panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="admin-card">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 admin-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="/banner" className="p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
              <p className="font-medium text-teal-700">Edit Banner</p>
              <p className="text-sm text-teal-600 mt-1">Update banner text & images</p>
            </a>
            <a href="/trending" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <p className="font-medium text-purple-700">Manage Trending</p>
              <p className="text-sm text-purple-600 mt-1">Toggle ON/OFF & add items</p>
            </a>
            <a href="/pricing" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <p className="font-medium text-green-700">Region Pricing</p>
              <p className="text-sm text-green-600 mt-1">Update pricing per region</p>
            </a>
            <a href="/destinations" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <p className="font-medium text-orange-700">Destinations</p>
              <p className="text-sm text-orange-600 mt-1">Manage popular destinations</p>
            </a>
            <a href="/sections" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <p className="font-medium text-blue-700">Sections</p>
              <p className="text-sm text-blue-600 mt-1">Reorder & show/hide sections</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}