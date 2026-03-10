import { useState, useMemo } from "react";
import { Eye, CheckSquare, XSquare, X, Star, ArrowUpDown, Image as ImageIcon } from "lucide-react";
import { Pagination } from "../components/Pagination";

// --- INTERFACES ---
interface Review {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  content: string;
  images: string[]; // Bổ sung mảng ảnh
  createdAt: string;
  status: "Pending" | "Approved" | "Rejected";
  moderatedBy?: string;
  moderatedAt?: string;
}

export function Reviews() {
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // Sort theo ngày
  
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showModerateModal, setShowModerateModal] = useState(false);
  const [moderateAction, setModerateAction] = useState<"Approved" | "Rejected">("Approved");
  const [moderateReason, setModerateReason] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [reviews, setReviews] = useState<Review[]>([
    { 
      id: "REV-001", productName: "Signature Blend 500g (Hạt)", customerName: "Nguyễn Văn A", rating: 5, 
      content: "Cà phê rất ngon, hương vị đậm đà! Đóng gói cẩn thận.", 
      images: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200"],
      createdAt: "2026-03-01", status: "Approved", moderatedBy: "admin_hai", moderatedAt: "2026-03-01" 
    },
    { 
      id: "REV-002", productName: "Premium Arabica 250g", customerName: "Trần Thị B", rating: 4, 
      content: "Chất lượng tốt, giá hợp lý. Tuy nhiên giao hàng hơi lâu.", 
      images: [],
      createdAt: "2026-03-02", status: "Approved", moderatedBy: "admin_hai", moderatedAt: "2026-03-02" 
    },
    { 
      id: "REV-003", productName: "Medium Roast 1kg", customerName: "Lê Văn C", rating: 3, 
      content: "Sản phẩm bình thường, không quá đặc sắc.", 
      images: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200"],
      createdAt: "2026-03-03", status: "Pending" 
    },
    { 
      id: "REV-004", productName: "Dark Roast Premium 500g", customerName: "Phạm Thị D", rating: 1, 
      content: "Không phải gu của tôi, hạt rang quá cháy và đắng nghét.", 
      images: [],
      createdAt: "2026-03-03", status: "Rejected", moderatedBy: "admin_hai", moderatedAt: "2026-03-03" 
    },
    { 
      id: "REV-005", productName: "Espresso Blend 500g", customerName: "Hoàng Văn E", rating: 5, 
      content: "Xuất sắc! Lớp crema rất dày. Sẽ mua lại chắc chắn.", 
      images: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200"],
      createdAt: "2026-03-04", status: "Pending" 
    },
  ]);

  const handleModerate = (review: Review, action: "Approved" | "Rejected") => {
    setSelectedReview(review);
    setModerateAction(action);
    setModerateReason("");
    setShowModerateModal(true);
  };

  const confirmModerate = () => {
    if (selectedReview) {
      setReviews(reviews.map(r =>
        r.id === selectedReview.id
          ? { ...r, status: moderateAction, moderatedBy: "admin_hai", moderatedAt: new Date().toISOString().split("T")[0] }
          : r
      ));
    }
    setShowModerateModal(false);
  };

  // --- FILTER & SORT LOGIC ---
  const processedReviews = useMemo(() => {
    let result = reviews;

    // Filter
    if (statusFilter !== "All") {
      result = result.filter(r => r.status === statusFilter);
    }

    // Sort by Date
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [reviews, statusFilter, sortOrder]);

  const totalPages = Math.ceil(processedReviews.length / itemsPerPage) || 1;
  const paginatedReviews = processedReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white text-black min-h-screen pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Reviews Management</h1>
          <p className="text-sm mt-1 font-bold text-gray-600 uppercase tracking-widest">Moderate customer feedback</p>
        </div>
      </div>

      {/* Tabs Filter & Sort */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-black pb-4">
        {/* Tabs */}
        <div className="flex gap-2">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status as any); setCurrentPage(1); }}
              className={`px-5 py-2 border border-black font-bold uppercase text-xs tracking-wider transition-colors ${
                statusFilter === status ? "bg-black text-white" : "bg-white hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sort */}
        <button
          onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
          className="px-4 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-colors"
        >
          Date: {sortOrder === "desc" ? "Newest First" : "Oldest First"} <ArrowUpDown size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="border border-black mb-6 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black bg-gray-50">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black w-12 text-center">#</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black">Review Info</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black w-1/3">Content Snapshot</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black text-center">Images</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black text-center">Status</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-sm italic text-gray-500">No reviews found in this category.</td></tr>
            ) : (
              paginatedReviews.map((review, idx) => (
                <tr key={review.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-center text-gray-500 border-r border-black font-mono">
                    {(currentPage - 1) * itemsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-4 border-r border-black">
                    <p className="font-bold text-sm mb-1">{review.productName}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-600">By: <span className="font-bold text-black">{review.customerName}</span></span>
                      <span className="text-gray-300">|</span>
                      <span className="text-xs font-mono text-gray-500">{review.createdAt}</span>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-black text-black" : "text-gray-300"} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-r border-black">
                    <p className="text-sm line-clamp-2 text-gray-700 italic">"{review.content}"</p>
                  </td>
                  <td className="px-4 py-4 border-r border-black text-center">
                    {review.images.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 border border-black bg-gray-100 text-xs font-bold font-mono">
                        <ImageIcon size={12} /> {review.images.length}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 border-r border-black text-center">
                    <span
                      className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider ${
                        review.status === "Approved" ? "border-green-600 text-green-600"
                        : review.status === "Rejected" ? "border-red-600 text-red-600 bg-red-50"
                        : "border-black bg-black text-white"
                      }`}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => { setSelectedReview(review); setShowDetailModal(true); }}
                        className="p-2 border border-black bg-white hover:bg-gray-200 transition-colors"
                        title="View Full Detail"
                      >
                        <Eye size={16} />
                      </button>
                      {review.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleModerate(review, "Approved")}
                            className="p-2 border border-black bg-black text-white hover:invert transition-colors"
                            title="Approve"
                          >
                            <CheckSquare size={16} />
                          </button>
                          <button
                            onClick={() => handleModerate(review, "Rejected")}
                            className="p-2 border border-black bg-white hover:bg-red-50 text-red-600 transition-colors"
                            title="Reject"
                          >
                            <XSquare size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={processedReviews.length}
        />
      )}

      {/* ================= MODAL: DETAIL ================= */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white border-2 border-black p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-black">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Review Detail</h2>
                <p className="font-mono text-sm mt-1">{selectedReview.id}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-1 border border-black hover:bg-gray-100"><X size={16} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Customer</span>
                  <span className="font-bold">{selectedReview.customerName}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Product</span>
                  <span className="font-bold">{selectedReview.productName}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Date Posted</span>
                  <span className="font-mono">{selectedReview.createdAt}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Rating</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} className={i < selectedReview.rating ? "fill-black text-black" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Status</span>
                  <span className={`inline-block px-2 py-1 border text-[10px] font-bold uppercase tracking-wider ${
                    selectedReview.status === "Approved" ? "border-green-600 text-green-600"
                    : selectedReview.status === "Rejected" ? "border-red-600 text-red-600 bg-red-50"
                    : "border-black bg-black text-white"
                  }`}>
                    {selectedReview.status}
                  </span>
                </div>
                {selectedReview.moderatedBy && (
                  <div>
                    <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Moderation Info</span>
                    <span className="text-sm font-mono block">By: {selectedReview.moderatedBy}</span>
                    <span className="text-sm font-mono block">At: {selectedReview.moderatedAt}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <span className="block text-xs font-bold uppercase text-gray-500 mb-2">Review Content</span>
              <div className="p-4 border border-black bg-gray-50 text-sm leading-relaxed italic">
                "{selectedReview.content}"
              </div>
            </div>

            {/* Hiển thị mảng hình ảnh đính kèm */}
            <div>
              <span className="block text-xs font-bold uppercase text-gray-500 mb-2">Attached Images ({selectedReview.images.length})</span>
              {selectedReview.images.length === 0 ? (
                <div className="p-4 border border-dashed border-gray-300 text-center text-xs text-gray-500 italic">No images provided.</div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {selectedReview.images.map((url, idx) => (
                    <div key={idx} className="w-32 h-32 border border-black shrink-0 bg-gray-100">
                      <img src={url} alt={`review-attachment-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions in Detail View if Pending */}
            {selectedReview.status === "Pending" && (
              <div className="flex gap-3 justify-end pt-6 mt-6 border-t-2 border-black">
                <button onClick={() => { setShowDetailModal(false); handleModerate(selectedReview, "Rejected"); }} className="px-6 py-2 border border-black bg-white hover:bg-red-50 text-red-600 font-bold uppercase text-sm transition-colors">
                  Reject
                </button>
                <button onClick={() => { setShowDetailModal(false); handleModerate(selectedReview, "Approved"); }} className="px-6 py-2 border border-black bg-black text-white hover:invert font-bold uppercase text-sm transition-colors">
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: MODERATE (APPROVE/REJECT) ================= */}
      {showModerateModal && selectedReview && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black p-8 max-w-sm w-full shadow-2xl">
            <h3 className={`font-black text-xl uppercase tracking-tighter mb-2 ${moderateAction === 'Rejected' ? 'text-red-600' : ''}`}>
              {moderateAction} Review
            </h3>
            <p className="text-sm mb-6 text-gray-600">
              Are you sure you want to <strong>{moderateAction.toLowerCase()}</strong> review <span className="font-mono">{selectedReview.id}</span>?
            </p>
            
            <label className="block text-xs font-bold uppercase mb-2">Note / Reason (Optional)</label>
            <textarea
              value={moderateReason}
              onChange={(e) => setModerateReason(e.target.value)}
              placeholder="Internal moderation note..."
              className="w-full p-3 border border-black text-sm h-24 mb-6 outline-none focus:ring-2 focus:ring-black"
            />
            
            <div className="flex gap-2 justify-end pt-4 border-t border-black">
              <button
                onClick={() => setShowModerateModal(false)}
                className="px-4 py-2 border border-black bg-white hover:bg-gray-100 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModerate}
                className={`px-4 py-2 border border-black text-xs font-bold uppercase tracking-wider transition-colors ${moderateAction === 'Rejected' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-black text-white hover:invert'}`}
              >
                Confirm {moderateAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}