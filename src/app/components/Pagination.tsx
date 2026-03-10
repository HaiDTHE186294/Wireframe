import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-black bg-gray-50 px-4 py-3">
      <div className="text-xs text-gray-600">
        Showing <span className="font-bold font-mono">{startItem}</span> to{" "}
        <span className="font-bold font-mono">{endItem}</span> of{" "}
        <span className="font-bold font-mono">{totalItems}</span> entries
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 border border-black bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1.5 border border-black text-xs font-bold transition-colors ${
                currentPage === page
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 border border-black bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
