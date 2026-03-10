import { useState } from "react";
import { ExternalLink, Search, Filter, X, FileText } from "lucide-react";

// --- TYPES & INTERFACES ---
type ActionType = "PO Receipt" | "Prod. Consume" | "Prod. Yield" | "Sales Dispatch" | "Manual Adj";
// Đã loại bỏ "Packaging" khỏi ItemCategory
type ItemCategory = "Raw Material" | "Finished Product";

interface LedgerEntry {
  id: string;
  timestamp: string;
  itemName: string;
  batchId: string;
  category: ItemCategory;
  action: ActionType;
  qtyChange: number;
  uom: string;
  performedBy: string;
  referenceId: string;
}

export function StockLedger() {
  // --- STATES FOR FILTERS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // --- STATE FOR MODAL ---
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

  // --- MOCK DATA (Đã loại bỏ dữ liệu thuộc Packaging) ---
  const ledgerData: LedgerEntry[] = [
    {
      id: "TXN-1001",
      timestamp: "2026-03-05 08:15:00",
      itemName: "Arabica Green Beans",
      batchId: "MAT-20260305-01",
      category: "Raw Material",
      action: "PO Receipt",
      qtyChange: 500,
      uom: "Kg",
      performedBy: "INV-01",
      referenceId: "PO-2026-089",
    },
    {
      id: "TXN-1002",
      timestamp: "2026-03-05 09:30:00",
      itemName: "Arabica Green Beans",
      batchId: "MAT-20260305-01",
      category: "Raw Material",
      action: "Prod. Consume",
      qtyChange: -50,
      uom: "Kg",
      performedBy: "ROAST-02",
      referenceId: "PRD-2026-102",
    },
    {
      id: "TXN-1003",
      timestamp: "2026-03-05 10:45:00",
      itemName: "Arabica Medium Roast (Hạt)",
      batchId: "BAT-20260305-01",
      category: "Finished Product",
      action: "Prod. Yield",
      qtyChange: 42.5,
      uom: "Kg",
      performedBy: "ROAST-02",
      referenceId: "PRD-2026-102",
    },
    {
      id: "TXN-1004",
      timestamp: "2026-03-05 13:00:00",
      itemName: "Arabica Medium Roast (Hạt)",
      batchId: "BAT-20260305-01",
      category: "Finished Product",
      action: "Sales Dispatch",
      qtyChange: -10,
      uom: "Kg",
      performedBy: "SALE-01",
      referenceId: "ORD-20260305-015",
    },
  ];

  // --- FILTERING LOGIC ---
  const filteredData = ledgerData.filter((entry) => {
    const matchSearch = 
      entry.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "" || entry.category === categoryFilter;
    const matchType = typeFilter === "" || entry.action === typeFilter;
    
    const entryDate = entry.timestamp.split(" ")[0];
    const matchDateFrom = dateFrom === "" || entryDate >= dateFrom;
    const matchDateTo = dateTo === "" || entryDate <= dateTo;

    return matchSearch && matchCategory && matchType && matchDateFrom && matchDateTo;
  });

  return (
    <div className="bg-white text-black pb-10">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-black">
        <h1 className="text-xl font-bold">Stock Ledger & Audit Trail</h1>
        <p className="text-sm text-gray-600 mt-1">Immutable record of all inventory transactions and movements</p>
      </div>

      {/* Filters Section */}
      <div className="mb-6 border border-black p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} />
          <h2 className="font-bold text-sm uppercase">Filter Records</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Row 1: Search & Category */}
          <div className="md:col-span-2 relative">
            <label className="block text-xs font-bold uppercase mb-1">Search Item / Batch / Ref</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black font-mono"
                placeholder="e.g., Arabica, BAT-001..."
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-black bg-white text-sm outline-none"
            >
              <option value="">All Categories</option>
              <option value="Raw Material">Raw Material (Green Beans)</option>
              <option value="Finished Product">Finished Product (Roasted)</option>
            </select>
          </div>

          {/* Row 2: Dates & Action Type */}
          <div>
            <label className="block text-xs font-bold uppercase mb-1">From Date</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-black text-sm font-mono outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">To Date</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-black text-sm font-mono outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Action Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-black bg-white text-sm outline-none"
            >
              <option value="">All Actions</option>
              <option value="PO Receipt">PO Receipt (Nhập mua)</option>
              <option value="Prod. Consume">Prod. Consume (Xuất sản xuất)</option>
              <option value="Prod. Yield">Prod. Yield (Nhập thành phẩm)</option>
              <option value="Sales Dispatch">Sales Dispatch (Xuất bán)</option>
              <option value="Manual Adj">Manual Adj (Điều chỉnh kho)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setSearchTerm(""); setCategoryFilter(""); setTypeFilter(""); setDateFrom(""); setDateTo(""); }}
              className="w-full px-4 py-2 border border-black bg-white hover:bg-gray-100 text-sm font-bold uppercase transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="border border-black bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black bg-gray-50">
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black w-40">Timestamp</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black">Item & Batch</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black w-36">Action</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black text-right w-28">Qty Change</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black w-32">Performed By</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center w-32">Reference</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 italic">
                  No transaction records found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredData.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 border-r border-black">
                    {entry.timestamp.split(" ")[0]} <br/>
                    <span className="font-bold text-black">{entry.timestamp.split(" ")[1]}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-black">
                    <p className="text-sm font-bold">{entry.itemName}</p>
                    <p className="text-xs font-mono text-gray-500 mt-0.5">{entry.batchId}</p>
                  </td>
                  <td className="px-4 py-3 border-r border-black">
                    <span className="px-2 py-1 border border-black text-[10px] font-bold uppercase bg-white">
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono border-r border-black">
                    <span className={`font-bold ${entry.qtyChange > 0 ? "text-black" : "text-gray-500"}`}>
                      {entry.qtyChange > 0 ? "+" : ""}{entry.qtyChange}
                    </span>
                    <span className="text-xs ml-1">{entry.uom}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono border-r border-black">
                    {entry.performedBy}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold hover:underline"
                      title="View Document Routing"
                    >
                      {entry.referenceId}
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL: REFERENCE ROUTING --- */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEntry(null)}>
          <div className="bg-white border-2 border-black p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-black">
              <div>
                <h2 className="font-bold text-lg uppercase">Transaction Log</h2>
                <p className="text-xs font-mono text-gray-500 mt-1">TXN: {selectedEntry.id}</p>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="p-1 hover:bg-gray-100"><X size={20} /></button>
            </div>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-bold uppercase text-xs">Timestamp</span>
                <span className="font-mono">{selectedEntry.timestamp}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-bold uppercase text-xs">Executed By</span>
                <span className="font-mono">{selectedEntry.performedBy}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-bold uppercase text-xs">System Action</span>
                <span className="uppercase text-xs font-bold">{selectedEntry.action}</span>
              </div>
            </div>

            <div className="p-4 border border-black bg-gray-50 text-center">
              <FileText size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-xs text-gray-600 mb-3">To view reasons or notes, please inspect the source document:</p>
              <button className="w-full py-2 border border-black bg-black text-white font-mono font-bold text-sm hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors">
                Open {selectedEntry.referenceId} <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}