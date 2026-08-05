"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Image,
  TrendingUp,
  DollarSign,
  MapPin,
  Layers,
  Info,
  Star,
  Tag,
  Users,
  LogOut,
} from "lucide-react";

const allMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { href: "/banner", label: "Banner", icon: Image, permission: "banner" },
  { href: "/trending", label: "Trending", icon: TrendingUp, permission: "trending" },
  { href: "/pricing", label: "Region Pricing", icon: DollarSign, permission: "pricing" },
  { href: "/destinations", label: "Popular Destinations", icon: MapPin, permission: "destinations" },
  { href: "/packages", label: "Packages", icon: Layers, permission: "packages" },
  { href: "/spiritual", label: "Spiritual Escape", icon: MapPin, permission: "spiritual" },
  { href: "/about", label: "About Us", icon: Info, permission: "about" },
  { href: "/features", label: "Features", icon: Star, permission: "features" },
  { href: "/testimonials", label: "Testimonials", icon: Star, permission: "testimonials" },
  { href: "/page-banners", label: "Page Banners", icon: Image, permission: "page-banners" },
  { href: "/gallery", label: "Gallery", icon: Image, permission: "gallery" },
  { href: "/team-members", label: "Team Members", icon: Star, permission: "team-members" },
  { href: "/deals", label: "Deals", icon: Tag, permission: "deals" },
  { href: "/sections", label: "Homepage Sections", icon: Layers, permission: "sections" },
  { href: "/trips", label: "Trips & Packages", icon: Layers, permission: "trips" },
  { href: "/blog", label: "Blog", icon: Layers, permission: "blog" },
  { href: "/staff", label: "Staff", icon: Users, permission: "staff" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState(allMenuItems);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          setMenuItems(allMenuItems);
          return;
        }
        const role = data.user.role || "admin";
        if (role === "admin" || role === "super_admin") {
          setMenuItems(allMenuItems);
          return;
        }
        const perms = data.user.permissions || [];
        setMenuItems(allMenuItems.filter((item) => perms.includes(item.permission)));
      })
      .catch(() => {
        setMenuItems(allMenuItems);
      });
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-teal-700">TripForSoul</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-50 text-teal-700 border-r-4 border-teal-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}