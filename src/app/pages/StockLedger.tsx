import { useState } from "react";
import { ExternalLink, Search, Filter, X, FileText, Settings2, Plus, Minus, ArrowRight, Save } from "lucide-react";

// --- TYPES & INTERFACES ---
type ActionType = "PO Receipt" | "Prod. Consume" | "Prod. Yield" | "Sales Dispatch" | "Manual Adj";
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

type ViewMode = "LIST" | "MANUAL_ADJUSTMENT";

export function StockLedger() {
  // --- STATES FOR FILTERS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // --- STATE FOR UI ---
  const [viewMode, setViewMode] = useState<ViewMode>("LIST");
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);

  // --- STATE FOR MANUAL ADJUSTMENT FORM ---
  const [adjForm, setAdjForm] = useState({
    category: "Raw Material" as ItemCategory,
    itemName: "",
    batchId: "",
    adjType: "Decrease", // "Increase" or "Decrease"
    qty: "",
    uom: "Kg",
    reason: ""
  });

  // --- MOCK DATA ---
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([
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
  ]);

  // Mock data cho dropdown lúc Adjust
  const mockRawMaterials = [
    { id: "MAT-001", name: "Arabica Green Beans", currentBatches: ["MAT-20260305-01", "MAT-20260210-03"] },
    { id: "MAT-002", name: "Robusta Green Beans", currentBatches: ["MAT-20260301-02"] }
  ];
  
  const mockFinishedProducts = [
    { id: "PROD-001", name: "Arabica Medium Roast (Hạt)", currentBatches: ["BAT-20260305-01", "BAT-20260228-01"] },
    { id: "PROD-002", name: "Signature Blend 500g", currentBatches: ["BAT-20260310-05"] }
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

  // --- HANDLERS ---
  const handleOpenAdjustment = () => {
    setAdjForm({
      category: "Raw Material",
      itemName: "",
      batchId: "",
      adjType: "Decrease",
      qty: "",
      uom: "Kg",
      reason: ""
    });
    setViewMode("MANUAL_ADJUSTMENT");
  };

  const submitAdjustment = () => {
    if (!adjForm.itemName || !adjForm.batchId || !adjForm.qty || !adjForm.reason) {
      alert("Please fill in all required fields.");
      return;
    }

    const qtyNum = parseFloat(adjForm.qty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    const finalQtyChange = adjForm.adjType === "Decrease" ? -qtyNum : qtyNum;
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    
    // Tìm tên item đầy đủ dựa trên ID đã chọn (để log cho đẹp)
    let fullItemName = adjForm.itemName;
    if (adjForm.category === "Raw Material") {
      fullItemName = mockRawMaterials.find(m => m.id === adjForm.itemName)?.name || adjForm.itemName;
    } else {
      fullItemName = mockFinishedProducts.find(p => p.id === adjForm.itemName)?.name || adjForm.itemName;
    }

    const newLogEntry: LedgerEntry = {
      id: `TXN-${String(ledgerData.length + 1001)}`,
      timestamp: timestamp,
      itemName: fullItemName,
      batchId: adjForm.batchId,
      category: adjForm.category,
      action: "Manual Adj",
      qtyChange: finalQtyChange,
      uom: adjForm.uom,
      performedBy: "ADMIN-01",
      referenceId: `ADJ-${timestamp.replace(/[- :]/g, "").slice(0,14)}`,
    };

    // 1. Cập nhật Log
    setLedgerData([newLogEntry, ...ledgerData]);
    
    // 2. Alert mô phỏng gọi API update bảng Quantity tương ứng
    alert(`SYSTEM: Successfully executed ${adjForm.adjType} of ${qtyNum} ${adjForm.uom} for ${fullItemName} (Batch: ${adjForm.batchId}).\nInventory database updated.\nReason: ${adjForm.reason}`);
    
    setViewMode("LIST");
  };


  return (
    <div className="bg-white text-black min-h-screen pb-10">
      
      {/* ================= MÀN HÌNH 1: LIST / AUDIT TRAIL ================= */}
      {viewMode === "LIST" && (
        <>
          <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Stock Ledger & Audit Trail</h1>
              <p className="text-sm text-gray-600 mt-1 uppercase font-bold tracking-widest">Immutable record of all inventory movements</p>
            </div>
            <button 
              onClick={handleOpenAdjustment}
              className="px-6 py-2 border-2 border-black bg-white hover:bg-black hover:text-white font-bold uppercase text-xs transition-colors flex items-center gap-2"
            >
              <Settings2 size={16} /> Quick Adjustment
            </button>
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
                    className="w-full pl-9 pr-3 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black font-mono bg-white"
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
                  className="w-full px-3 py-2 border border-black text-sm font-mono outline-none bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">To Date</label>
                <input 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-black text-sm font-mono outline-none bg-white" 
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
                  className="w-full px-4 py-2 border border-black bg-white hover:bg-gray-200 text-xs font-bold uppercase transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Audit Table */}
          <div className="border border-black bg-white overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50">
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-40">Timestamp</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-32 text-center">Category</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-black">Item & Batch</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-36">Action</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-black text-right w-28">Qty Change</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-32">Performed By</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center w-32">Reference</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 italic font-bold uppercase">
                      NO_TRANSACTION_RECORDS_FOUND
                    </td>
                  </tr>
                ) : (
                  filteredData.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-600 border-r border-black">
                        {entry.timestamp.split(" ")[0]} <br/>
                        <span className="font-bold text-black">{entry.timestamp.split(" ")[1]}</span>
                      </td>
                      <td className="px-4 py-3 border-r border-black text-center">
                        <span className={`px-2 py-0.5 border border-black text-[9px] font-bold uppercase ${entry.category === 'Raw Material' ? 'bg-gray-200' : 'bg-white'}`}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-black">
                        <p className="text-sm font-bold truncate max-w-[250px]">{entry.itemName}</p>
                        <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase">Batch: {entry.batchId}</p>
                      </td>
                      <td className="px-4 py-3 border-r border-black">
                        <span className={`px-2 py-1 border text-[9px] font-bold uppercase ${
                          entry.action === 'Manual Adj' ? 'border-red-600 text-red-600 bg-red-50' : 'border-black bg-white'
                        }`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono border-r border-black">
                        <span className={`font-bold ${entry.qtyChange > 0 ? "text-green-600" : "text-red-600"}`}>
                          {entry.qtyChange > 0 ? "+" : ""}{entry.qtyChange}
                        </span>
                        <span className="text-[10px] ml-1 text-gray-500">{entry.uom}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono border-r border-black">
                        {entry.performedBy}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="inline-flex items-center gap-1 text-[10px] font-mono font-bold border border-transparent hover:border-black px-2 py-1 transition-colors"
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
            <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEntry(null)}>
              <div className="bg-white border-2 border-black p-8 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-4">
                  <div>
                    <h2 className="font-black text-xl uppercase tracking-tighter">Transaction Log</h2>
                    <p className="text-xs font-mono text-gray-500 mt-1 uppercase">TXN_ID: {selectedEntry.id}</p>
                  </div>
                  <button onClick={() => setSelectedEntry(null)} className="p-1 border border-transparent hover:border-black transition-colors"><X size={20} /></button>
                </div>
                
                <div className="space-y-4 text-sm mb-8">
                  <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold uppercase text-xs">Timestamp</span>
                    <span className="font-mono text-right">{selectedEntry.timestamp}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold uppercase text-xs">Executed By</span>
                    <span className="font-mono font-bold text-right">{selectedEntry.performedBy}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold uppercase text-xs">System Action</span>
                    <span className="uppercase text-xs font-bold text-right">{selectedEntry.action}</span>
                  </div>
                </div>

                <div className="p-4 border border-black bg-gray-50 text-center">
                  <FileText size={24} className="mx-auto mb-3 text-black" />
                  <p className="text-[10px] uppercase font-bold text-gray-500 mb-4 tracking-widest">Inspect Source Document</p>
                  <button className="w-full py-3 border border-black bg-black text-white font-mono font-bold text-xs uppercase tracking-wider hover:invert flex items-center justify-center gap-2 transition-colors">
                    Open {selectedEntry.referenceId} <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= MÀN HÌNH 2: MANUAL ADJUSTMENT FORM ================= */}
      {viewMode === "MANUAL_ADJUSTMENT" && (
        <div className="max-w-3xl mx-auto mt-4 bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Inventory Adjustment</h2>
              <p className="text-xs mt-1 uppercase font-bold tracking-widest text-gray-500">Manual override tool. Actions are logged.</p>
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs">
              Cancel & Return
            </button>
          </div>

          <div className="space-y-6">
            {/* Step 1: Select Category */}
            <div className="border border-black p-5 bg-gray-50">
              <h3 className="text-xs font-black uppercase mb-4 border-b border-black pb-2">1. Target Scope</h3>
              <div className="flex gap-6">
                <label className={`flex flex-1 items-center justify-center gap-2 p-3 border-2 cursor-pointer transition-colors ${adjForm.category === "Raw Material" ? 'border-black bg-white font-bold' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                  <input 
                    type="radio" name="adjCategory" value="Raw Material" 
                    checked={adjForm.category === "Raw Material"}
                    onChange={(e) => setAdjForm({...adjForm, category: e.target.value as ItemCategory, itemName: "", batchId: ""})}
                    className="hidden"
                  />
                  RAW MATERIAL (GREEN BEANS)
                </label>
                <label className={`flex flex-1 items-center justify-center gap-2 p-3 border-2 cursor-pointer transition-colors ${adjForm.category === "Finished Product" ? 'border-black bg-white font-bold' : 'border-transparent text-gray-500 hover:border-gray-300'}`}>
                  <input 
                    type="radio" name="adjCategory" value="Finished Product" 
                    checked={adjForm.category === "Finished Product"}
                    onChange={(e) => setAdjForm({...adjForm, category: e.target.value as ItemCategory, itemName: "", batchId: ""})}
                    className="hidden"
                  />
                  FINISHED PRODUCT (ROASTED)
                </label>
              </div>
            </div>

            {/* Step 2: Item & Batch */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Select Item *</label>
                <select 
                  value={adjForm.itemName}
                  onChange={(e) => setAdjForm({...adjForm, itemName: e.target.value, batchId: ""})}
                  className="w-full p-3 border border-black text-sm font-bold outline-none bg-white"
                >
                  <option value="">-- Choose Item --</option>
                  {(adjForm.category === "Raw Material" ? mockRawMaterials : mockFinishedProducts).map(item => (
                    <option key={item.id} value={item.id}>{item.id} - {item.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Target Batch *</label>
                <select 
                  value={adjForm.batchId}
                  onChange={(e) => setAdjForm({...adjForm, batchId: e.target.value})}
                  disabled={!adjForm.itemName}
                  className="w-full p-3 border border-black text-sm font-mono outline-none bg-white disabled:bg-gray-100 disabled:opacity-50"
                >
                  <option value="">-- Choose Batch --</option>
                  {adjForm.itemName && (adjForm.category === "Raw Material" ? mockRawMaterials : mockFinishedProducts)
                    .find(i => i.id === adjForm.itemName)?.currentBatches.map(bId => (
                      <option key={bId} value={bId}>{bId}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            {/* Step 3: Action & Qty */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 border border-black flex flex-col">
                <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer border-b border-black transition-colors ${adjForm.adjType === 'Increase' ? 'bg-black text-white font-bold' : 'bg-white hover:bg-gray-100'}`}>
                  <input type="radio" name="adjType" value="Increase" checked={adjForm.adjType === "Increase"} onChange={() => setAdjForm({...adjForm, adjType: "Increase"})} className="hidden" />
                  <Plus size={16} /> ADD STOCK
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer transition-colors ${adjForm.adjType === 'Decrease' ? 'bg-red-600 text-white font-bold' : 'bg-white hover:bg-red-50'}`}>
                  <input type="radio" name="adjType" value="Decrease" checked={adjForm.adjType === "Decrease"} onChange={() => setAdjForm({...adjForm, adjType: "Decrease"})} className="hidden" />
                  <Minus size={16} /> DEDUCT STOCK
                </label>
              </div>
              
              <div className="col-span-2 flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase mb-1">Adjustment Quantity *</label>
                  <input 
                    type="number" min="0" step="0.1"
                    value={adjForm.qty}
                    onChange={(e) => setAdjForm({...adjForm, qty: e.target.value})}
                    placeholder="Enter amount"
                    className="w-full p-3 border-2 border-black text-lg font-mono font-bold text-center outline-none focus:border-dashed"
                  />
                </div>
                <div className="w-24">
                   <label className="block text-xs font-bold uppercase mb-1">UoM</label>
                   <input type="text" value={adjForm.uom} readOnly className="w-full p-3 border border-black text-sm text-center bg-gray-100 cursor-not-allowed font-bold" />
                </div>
              </div>
            </div>

            {/* Step 4: Reason */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Reason / Justification *</label>
              <textarea 
                value={adjForm.reason}
                onChange={(e) => setAdjForm({...adjForm, reason: e.target.value})}
                placeholder="E.g., Discovered expired beans during inventory check..."
                className="w-full p-4 border border-black h-24 text-sm resize-none outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-8 mt-8 border-t-2 border-black">
            <button 
              onClick={submitAdjustment} 
              disabled={!adjForm.itemName || !adjForm.batchId || !adjForm.qty || !adjForm.reason}
              className="px-8 py-3 bg-black text-white text-sm font-black uppercase tracking-widest hover:invert transition-all disabled:opacity-30 disabled:hover:invert-0 flex items-center gap-2"
            >
              Confirm & Execute <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}