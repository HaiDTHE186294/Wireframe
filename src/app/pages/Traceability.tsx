import { useState } from "react";
import { ChevronRight, Search, AlertTriangle, Lock, FileDown } from "lucide-react";

// --- INTERFACES ---
interface TreeNode {
  id: string;
  level: number;
  label: string;
  type: "MAT" | "BAT" | "LOT" | "ORDER";
  status?: "Active" | "Locked" | "Pending" | "Completed"; // Trạng thái của Lô/Đơn hàng
  children?: TreeNode[];
}

export function Traceability() {
  const [searchInput, setSearchInput] = useState("");
  const [searchedId, setSearchedId] = useState(""); // Lưu ID đang được truy vết
  const [showTree, setShowTree] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  
  // States cho Emergency Lock
  const [showLockModal, setShowLockModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Mô phỏng trạng thái đã khóa

  // --- MOCK DATA CÂY TRUY VẾT ---
  // Lưu ý: Thêm trạng thái (status) để hiển thị trực quan lô nào đang bị ảnh hưởng
  const traceabilityTree: TreeNode = {
    id: "root_mat",
    level: 1,
    label: "MAT-20260228-001 (Arabica Green Beans)",
    type: "MAT",
    status: "Active",
    children: [
      {
        id: "bat_1",
        level: 2,
        label: "BAT-20260228-001 (Medium Roast - 100kg)",
        type: "BAT",
        status: isLocked ? "Locked" : "Active",
        children: [
          {
            id: "lot_1",
            level: 3,
            label: "LOT-20260228-001 (SIG-500-W - Signature Blend 500g)",
            type: "LOT",
            status: isLocked ? "Locked" : "Active",
            children: [
              { id: "ord_1", level: 4, label: "ORD-20260228-101 (Customer: Nguyen Van A)", type: "ORDER", status: "Pending" },
              { id: "ord_2", level: 4, label: "ORD-20260228-102 (Customer: The Coffee House)", type: "ORDER", status: "Completed" },
            ],
          },
          {
            id: "lot_2",
            level: 3,
            label: "LOT-20260228-002 (SIG-250-GP - Signature Blend 250g)",
            type: "LOT",
            status: isLocked ? "Locked" : "Active",
            children: [
              { id: "ord_3", level: 4, label: "ORD-20260228-103 (Customer: Tran Thi B)", type: "ORDER", status: "Pending" },
            ],
          },
        ],
      },
    ],
  };

  // Lấy tất cả ID của cây để mở rộng mặc định
  const getAllNodeIds = (node: TreeNode): string[] => {
    let ids = [node.id];
    if (node.children) {
      node.children.forEach(child => { ids = [...ids, ...getAllNodeIds(child)]; });
    }
    return ids;
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSearchedId(searchInput.toUpperCase());
      setShowTree(true);
      setIsLocked(false); // Reset trạng thái khóa khi search mới
      setExpandedNodes(getAllNodeIds(traceabilityTree));
    }
  };

  const toggleNode = (nodeId: string) => {
    if (expandedNodes.includes(nodeId)) {
      setExpandedNodes(expandedNodes.filter((id) => id !== nodeId));
    } else {
      setExpandedNodes([...expandedNodes, nodeId]);
    }
  };

  const handleExecuteLock = () => {
    // Logic thực tế sẽ gọi API xuống Backend để update status của các Lô thành "Locked"
    // và update status Đơn hàng Pending thành "Cancelled" hoặc "Awaiting Review".
    setIsLocked(true);
    setShowLockModal(false);
  };

  // --- RENDER HÀM ĐỆ QUY CHO CÂY ---
  const renderTreeNode = (node: TreeNode) => {
    const isExpanded = expandedNodes.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const indent = (node.level - 1) * 24;

    // Phân loại màu sắc/style dựa trên Type và Status để dễ nhìn
    const getBadgeStyle = (type: string, status?: string) => {
      let baseStyle = "font-mono font-bold px-1.5 py-0.5 text-xs mr-2 border ";
      if (status === "Locked") return baseStyle + "bg-black text-white border-black";
      if (type === "ORDER") return baseStyle + "bg-gray-100 border-gray-400 text-gray-600";
      return baseStyle + "border-black bg-white text-black";
    };

    return (
      <div key={node.id}>
        <div
          className="flex items-center py-2.5 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${indent + 16}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleNode(node.id)} className="p-1 hover:bg-gray-200 mr-2 border border-transparent hover:border-gray-300">
              <ChevronRight size={16} className={`transform transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </button>
          ) : (
            <div className="w-8" /> // Space bù cho nút mũi tên
          )}
          
          <div className="flex-1 flex items-center">
            <span className={getBadgeStyle(node.type, node.status)}>{node.type}</span>
            <span className={`text-sm ${node.level === 1 ? "font-bold" : ""} ${node.status === "Locked" ? "line-through text-gray-500" : ""}`}>
              {node.label}
            </span>
            
            {/* Hiển thị trạng thái phụ */}
            {node.status && node.type === "ORDER" && (
              <span className={`ml-3 text-[10px] font-bold uppercase tracking-wider ${node.status === "Pending" ? "text-black border border-black px-1" : "text-gray-400"}`}>
                {node.status}
              </span>
            )}
            {node.status === "Locked" && node.type !== "ORDER" && (
              <span className="ml-3 text-[10px] font-bold uppercase bg-black text-white px-1.5 py-0.5 flex items-center gap-1">
                <Lock size={10} /> Locked
              </span>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>{node.children!.map((child) => renderTreeNode(child))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white text-black min-h-screen pb-10">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-black">
        <h1 className="text-xl font-bold">Traceability & Quality Control</h1>
        <p className="text-sm text-gray-600 mt-1">Track material origins, view lot distributions, and execute emergency locks.</p>
      </div>

      {/* Search Section */}
      <div className="mb-6 p-4 border border-black bg-gray-50">
        <label className="block text-sm font-bold mb-2">Search Reference ID</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter MAT Batch, BAT Batch, or Finished LOT Code..."
              className="w-full pl-10 pr-4 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black font-mono uppercase"
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-2 border border-black bg-black text-white hover:bg-gray-800 text-sm font-bold">
            Trace Path
          </button>
        </div>
      </div>

      {/* Kết quả truy vết */}
      {showTree ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột trái: Cây truy vết */}
          <div className="lg:col-span-2 border border-black bg-white">
            <div className="p-3 border-b border-black bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-sm">Genealogy Tree</h2>
                <p className="text-xs text-gray-500 font-mono mt-0.5">Tracing down from: {searchedId}</p>
              </div>
              <button className="p-1.5 border border-black hover:bg-gray-200" title="Export PDF">
                <FileDown size={16} />
              </button>
            </div>
            <div className="py-2">
              {renderTreeNode(traceabilityTree)}
            </div>
          </div>

          {/* Cột phải: Báo cáo tác động & Hành động QC */}
          <div className="space-y-6">
            {/* Impact Summary */}
            <div className="border border-black p-4 bg-white">
              <h2 className="font-bold text-sm mb-4 border-b border-gray-200 pb-2">Impact Analysis</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Affected Batches</p>
                  <p className="text-2xl font-mono font-bold">3</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pending Orders</p>
                  <p className="text-2xl font-mono font-bold">2</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 border border-gray-200">
                Found <strong>2 Pending Orders</strong> containing products derived from this trace path. These orders have not been shipped yet.
              </p>
            </div>

            {/* Quality Control Action */}
            <div className="border border-black p-4 bg-gray-50">
              <h2 className="font-bold text-sm mb-2 flex items-center gap-2 text-red-600">
                <AlertTriangle size={16} /> QC Action Required
              </h2>
              <p className="text-xs mb-4">
                If a quality defect is confirmed, you must lock all downstream batches to prevent further packing and shipping.
              </p>
              
              {!isLocked ? (
                <button 
                  onClick={() => setShowLockModal(true)}
                  className="w-full py-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Lock size={16} /> Lock Downstream Lots
                </button>
              ) : (
                <div className="w-full py-2 border-2 border-black bg-white text-black font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                  ✓ Lots Safely Locked
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="py-20 border border-black bg-gray-50 text-center">
          <Search size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-bold">No Trace Data</p>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Enter a Batch ID (e.g., MAT-..., BAT-...) or a Product Lot code to generate the full forward and backward traceability path.
          </p>
        </div>
      )}

      {/* --- MODAL: EMERGENCY LOCK CONFIRMATION --- */}
      {showLockModal && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowLockModal(false)}>
          <div className="bg-white border-2 border-black p-6 max-w-md w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 pb-4 border-b border-black flex items-start gap-3">
              <AlertTriangle size={24} className="mt-0.5" />
              <div>
                <h2 className="text-lg font-bold uppercase">Confirm Emergency Lock</h2>
                <p className="text-xs font-mono mt-1">Target: Downstream of {searchedId}</p>
              </div>
            </div>

            <div className="mb-6 space-y-3 text-sm">
              <p>You are about to lock <strong>3 Product Lots</strong>.</p>
              <div className="p-3 border border-black bg-gray-50">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-4 h-4 border-black accent-black" defaultChecked />
                  <span className="text-xs font-bold">Also flag 2 Pending Orders for manual review. (Prevents Warehouse from picking these orders).</span>
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Reason for Audit Log *</label>
                <input type="text" placeholder="e.g. Failed sensory test, Mold..." className="w-full p-2 border border-black outline-none focus:ring-1 focus:ring-black text-sm" autoFocus />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-black">
              <button onClick={() => setShowLockModal(false)} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 text-sm font-bold uppercase">Cancel</button>
              <button onClick={handleExecuteLock} className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 text-sm font-bold uppercase flex items-center gap-2">
                <Lock size={14} /> Confirm Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}