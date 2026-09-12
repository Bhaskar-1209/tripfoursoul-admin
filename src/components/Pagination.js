"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function usePagination(items = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = items ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // If current page is beyond total pages (e.g. after deletion or filter), normalize
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    if (!items || !items.length) return [];
    const startIndex = (validPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, validPage, itemsPerPage]);

  return {
    currentPage: validPage,
    setCurrentPage,
    currentItems: paginatedItems,
    paginatedItems,
    totalPages,
    totalItems,
    itemsPerPage,
  };
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  className = "",
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // If all items fit within 1 page (no scroll), hide pagination
  if (totalItems <= itemsPerPage) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-100 ${className}`}>
      <p className="text-xs text-gray-500 font-medium">
        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{" "}
        <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
        <span className="font-semibold text-gray-900">{totalItems}</span> entries
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-xs text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={`page-${p}`}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 text-xs font-medium rounded-lg transition-colors ${
                currentPage === p
                  ? "bg-[#24564C] text-white font-semibold shadow-sm"
                  : "border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
