import { useState } from "react";
import { Search, CheckCircle, Printer, ArrowLeft, Plus, X, AlertTriangle, ClipboardCheck, Truck, Save, AlertOctagon, Package } from "lucide-react";
import { Pagination } from "../components/Pagination";

// --- INTERFACES (Khớp với Database orders) ---
interface ExportOrderItem {
  sku: string;
  name: string;
  orderedQty: number;
  exportedQty: number; // Nhân viên kho nhập tay
}

interface ExportOrder {
  order_id: string;
  customerName: string;
  address: string;
  total_price: number;
  order_type: "Sale" | "Manual";
  ship_tracking_number: string; // Trường quan trọng trong DB
  status: "Confirmed" | "Packing" | "Ready to Ship" | "Issue Reported";
  created_at: string;
  items: ExportOrderItem[];
}

type ViewMode = "LIST" | "PICKING_PROCESS" | "MANUAL_EXPORT";

export function ExportProduct() {
  // --- STATES ---
  const [viewMode, setViewMode] = useState<ViewMode>("LIST");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<ExportOrder | null>(null);

  // States cho ngoại lệ
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueReason, setIssueReason] = useState("");

  // States phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- MOCK DATA (Lấy từ bảng orders có status là Confirmed/Packing) ---
  const [exportOrders, setExportOrders] = useState<ExportOrder[]>([
    {
      order_id: "ORD-001", customerName: "Nguyen Van A", address: "123 Le Loi, Q1, HCMC",
      total_price: 370000, order_type: "Sale", ship_tracking_number: "",
      status: "Confirmed", created_at: "2026-03-15 09:00",
      items: [
        { sku: "SIG-250-W", name: "Signature Blend 250g (Hạt)", orderedQty: 2, exportedQty: 0 },
      ]
    },
    {
      order_id: "ORD-002", customerName: "Highland Coffee", address: "45 Nguyen Trai, Da Lat",
      total_price: 24000000, order_type: "Sale", ship_tracking_number: "",
      status: "Packing", created_at: "2026-03-15 10:30",
      items: [
        { sku: "SIG-500-GP", name: "Signature Blend 500g (Pha Phin)", orderedQty: 50, exportedQty: 50 },
        { sku: "ACD-500-W", name: "Arabica Cầu Đất 500g (Hạt)", orderedQty: 19, exportedQty: 10 }
      ]
    }
  ]);

  // Lọc & Phân trang
  const filteredOrders = exportOrders.filter(order => 
    (statusFilter === "" || order.status === statusFilter) &&
    (order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) || order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // --- HANDLERS ---
  const handleStartPicking = (order: ExportOrder) => {
    setSelectedOrder(order);
    setViewMode("PICKING_PROCESS");
  };

  const updateExportedQty = (sku: string, val: number) => {
    if (!selectedOrder) return;
    const updatedItems = selectedOrder.items.map(item => 
      item.sku === sku ? { ...item, exportedQty: val >= 0 ? val : 0 } : item
    );
    setSelectedOrder({ ...selectedOrder, items: updatedItems, status: "Packing" });
  };

  const updateTrackingNumber = (val: string) => {
    if (!selectedOrder) return;
    setSelectedOrder({ ...selectedOrder, ship_tracking_number: val });
  };

  const saveProgress = () => {
    if (!selectedOrder) return;
    setExportOrders(prev => prev.map(o => o.order_id === selectedOrder.order_id ? selectedOrder : o));
    setViewMode("LIST");
  };

  const handleConfirmExport = () => {
    if (!selectedOrder) return;
    
    const updatedOrder = { ...selectedOrder, status: "Ready to Ship" as const };
    setExportOrders(prev => prev.map(o => o.order_id === selectedOrder.order_id ? updatedOrder : o));
    
    alert(`SYSTEM: Inventory deducted. Order ${selectedOrder.order_id} is Ready to Ship.`);
    setViewMode("LIST");
  };

  const handleReportIssue = () => {
    if (!selectedOrder) return;
    // Ghi nhận lý do lỗi vào cancel_reason hoặc log tùy DB
    setExportOrders(prev => prev.map(o => 
      o.order_id === selectedOrder.order_id ? { ...o, status: "Issue Reported" } : o
    ));
    setShowIssueModal(false);
    setViewMode("LIST");
  };

  // Kiểm tra điều kiện để bật nút Confirm Export
  const isReadyToExport = selectedOrder ? 
    selectedOrder.items.every(i => i.exportedQty === i.orderedQty) && 
    (selectedOrder.order_type === "Manual" || selectedOrder.ship_tracking_number.trim() !== "") 
    : false;

  return (
    <div className="bg-white text-black min-h-screen pb-10">
      
      {/* ================= MÀN HÌNH 1: LIST ORDERS (PENDING EXPORT) ================= */}
      {viewMode === "LIST" && (
        <>
          <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Export Product</h1>
              <p className="text-sm mt-1 font-bold uppercase tracking-widest text-gray-600">Warehouse Outbound Operations</p>
            </div>
            <button 
              onClick={() => setViewMode("MANUAL_EXPORT")}
              className="px-6 py-2 bg-black text-white border border-black hover:invert font-bold uppercase text-sm tracking-wider flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Manual Export (A1)
            </button>
          </div>

          <div className="mb-6 p-4 border border-black bg-gray-50 flex gap-4 items-end">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase mb-2 tracking-wider">Search Order</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Order ID or Customer Name..." 
                  className="w-full pl-10 pr-4 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-1/4">
              <p className="text-xs font-bold uppercase mb-2 tracking-wider">Filter Status</p>
              <select 
                className="w-full p-2 border border-black text-sm uppercase outline-none focus:ring-1 focus:ring-black bg-white"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Pending</option>
                <option value="Confirmed">Confirmed (New)</option>
                <option value="Packing">Packing (In Progress)</option>
                <option value="Ready to Ship">Ready to Ship</option>
                <option value="Issue Reported">Issue Reported</option>
              </select>
            </div>
          </div>

          <div className="border border-black bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50">
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black w-12">#</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black w-32">Order ID</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black">Recipient</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black text-center">Order Type</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-center w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm italic text-gray-500">No pending export orders found.</td></tr>
                ) : (
                  paginatedOrders.map((order, index) => {
                    const rowNumber = startIndex + index + 1;
                    return (
                      <tr key={order.order_id} className="border-b border-gray-200 transition-colors hover:bg-gray-50">
                        <td className="px-4 py-4 border-r border-black text-center font-mono text-sm text-gray-500">{rowNumber}</td>
                        <td className="px-4 py-4 border-r border-black">
                          <div className="font-mono font-bold text-sm">{order.order_id}</div>
                          <div className="text-[10px] text-gray-500 mt-1 uppercase">{order.created_at.split(' ')[0]}</div>
                        </td>
                        <td className="px-4 py-4 border-r border-black">
                          <div className="font-bold text-sm">{order.customerName}</div>
                          <div className="text-[10px] text-gray-500 mt-1 truncate max-w-xs">{order.address}</div>
                        </td>
                        <td className="px-4 py-4 border-r border-black text-center">
                          <span className={`text-[10px] border border-black px-2 py-0.5 uppercase font-bold ${order.order_type === 'Manual' ? 'bg-gray-200' : 'bg-white'}`}>
                            {order.order_type}
                          </span>
                        </td>
                        <td className="px-4 py-4 border-r border-black text-center">
                          <span className={`inline-block px-3 py-1 border text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'Ready to Ship' ? 'border-black bg-black text-white' : 
                            order.status === 'Issue Reported' ? 'border-red-600 text-red-600 bg-red-50' :
                            'border-black bg-gray-100'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {order.status !== "Ready to Ship" && order.status !== "Issue Reported" ? (
                            <button 
                              onClick={() => handleStartPicking(order)}
                              className="px-4 py-2 border border-black bg-white hover:bg-gray-200 text-xs font-bold uppercase transition-colors"
                            >
                              Pick Items
                            </button>
                          ) : (
                            <div className="text-gray-400 flex justify-center"><CheckCircle size={20}/></div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            
            {filteredOrders.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredOrders.length}
              />
            )}
          </div>
        </>
      )}

      {/* ================= MÀN HÌNH 2: PICKING & PACKING PROCESS ================= */}
      {viewMode === "PICKING_PROCESS" && selectedOrder && (
        <div className="max-w-5xl mx-auto mt-4 bg-white border-2 border-black p-8 shadow-sm">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div>
              <button onClick={saveProgress} className="flex items-center gap-1 text-[10px] font-bold uppercase mb-2 hover:underline text-gray-500">
                <ArrowLeft size={12}/> Back & Save Progress
              </button>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Pack Order: {selectedOrder.order_id}</h2>
              <p className="text-sm font-bold text-gray-600 mt-1 uppercase">Recipient: {selectedOrder.customerName}</p>
            </div>
            <button 
              onClick={() => setShowIssueModal(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-600 text-red-600 text-xs font-bold uppercase hover:bg-red-50 transition-colors"
            >
              <AlertOctagon size={16}/> Report Discrepancy (E1)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 border border-black p-4 bg-gray-50">
              <h3 className="text-xs font-bold uppercase mb-3 text-gray-500 tracking-wider flex items-center gap-2"><Truck size={14}/> Shipping Information</h3>
              <p className="font-bold text-sm">{selectedOrder.customerName}</p>
              <p className="text-sm mt-1">{selectedOrder.address}</p>
            </div>
            <div className="col-span-1 border border-black p-4 bg-white">
              <h3 className="text-xs font-bold uppercase mb-3 text-gray-500 tracking-wider">Tracking Number *</h3>
              <input 
                type="text" 
                value={selectedOrder.ship_tracking_number}
                onChange={(e) => updateTrackingNumber(e.target.value)}
                placeholder="e.g. SPX123456789"
                className="w-full p-2 border border-black text-sm font-mono font-bold outline-none focus:ring-1 focus:ring-black uppercase"
              />
              <p className="text-[10px] text-gray-500 mt-2 uppercase">Required to confirm export.</p>
            </div>
          </div>

          <div className="flex justify-between items-end mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"><Package size={14}/> Picking List</h3>
            <span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-0.5 border border-black text-gray-600">Manual Entry Mode</span>
          </div>
          
          <div className="border border-black mb-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black bg-black text-white text-xs uppercase font-bold">
                  <th className="p-3 border-r border-white">SKU</th>
                  <th className="p-3 border-r border-white">Product Name</th>
                  <th className="p-3 border-r border-white text-center w-24">Ordered</th>
                  <th className="p-3 text-center w-32">Exported Qty</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => {
                  const isDone = item.exportedQty === item.orderedQty;
                  const isOver = item.exportedQty > item.orderedQty;

                  return (
                    <tr key={idx} className={`border-b border-gray-300 text-sm font-mono ${isDone ? 'bg-green-50' : 'bg-white'}`}>
                      <td className="p-3 border-r border-black font-bold">{item.sku}</td>
                      <td className="p-3 border-r border-black font-sans">{item.name}</td>
                      <td className="p-3 border-r border-black text-center font-bold text-lg">{item.orderedQty}</td>
                      <td className="p-2 text-center bg-gray-50 relative">
                        <input 
                          type="number" min="0" 
                          value={item.exportedQty} 
                          onChange={(e) => updateExportedQty(item.sku, parseInt(e.target.value) || 0)}
                          className={`w-20 p-2 border text-center outline-none focus:border-black font-bold text-lg ${
                            isDone ? 'border-green-600 text-green-700 bg-green-100' : 
                            isOver ? 'border-red-600 text-red-600 bg-red-50' : 'border-gray-400'
                          }`} 
                        />
                        {isOver && <AlertTriangle size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600" title="Over quantity!" />}
                        {isDone && <CheckCircle size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600" />}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-4 border-t-2 border-black">
            <div className="border border-black px-4 py-2 flex items-center gap-2 bg-gray-50">
              <ClipboardCheck size={18}/>
              <span className="text-xs font-black uppercase">
                Progress: {selectedOrder.items.reduce((sum, i) => sum + i.exportedQty, 0)} / {selectedOrder.items.reduce((sum, i) => sum + i.orderedQty, 0)} Items
              </span>
            </div>
            
            <div className="flex gap-3">
              <button onClick={saveProgress} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs transition-colors">
                Save Draft
              </button>
              <button 
                disabled={!isReadyToExport}
                onClick={handleConfirmExport}
                className="px-6 py-2 border border-black font-bold uppercase text-xs transition-all flex items-center gap-2 disabled:opacity-30 disabled:bg-gray-200 bg-black text-white hover:invert"
              >
                Confirm Export & Print <Printer size={14}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MÀN HÌNH 3: MANUAL EXPORT CREATE (A1) ================= */}
      {viewMode === "MANUAL_EXPORT" && (
        <div className="max-w-4xl mx-auto mt-4 bg-white border-2 border-black p-8 shadow-sm">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Manual Export Note</h2>
              <p className="text-sm mt-1 uppercase tracking-widest text-gray-600">Disposal, Liquidation or Gifting</p>
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black hover:bg-gray-100 font-bold uppercase text-xs">
              Back to List
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Export Reason / Order Type *</label>
                <select className="w-full p-2 border border-black text-sm uppercase outline-none focus:ring-1 focus:ring-black bg-white">
                  <option>Destruction (Expired/Damaged)</option>
                  <option>Marketing Gift / PR</option>
                  <option>Internal Usage</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Reference Note / Recipient</label>
                <input type="text" className="w-full p-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black" placeholder="e.g. Sent to Partner XYZ" />
              </div>
            </div>

            <div className="border-t border-black pt-4">
              <label className="block text-xs font-bold uppercase mb-2">Select Product to Deduct</label>
              <div className="flex gap-2">
                <select className="flex-1 p-2 border border-black text-sm font-bold uppercase outline-none focus:ring-1 focus:ring-black bg-white">
                  <option>-- Select Finished Product SKU --</option>
                  <option>SIG-250-W - Signature Blend 250g</option>
                  <option>ACD-500-GP - Arabica Cầu Đất 500g</option>
                </select>
                <input type="number" min="1" placeholder="QTY" className="w-24 p-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black text-center font-bold" />
                <button className="px-6 border border-black bg-black text-white hover:invert uppercase text-xs font-bold transition-colors">Add Item</button>
              </div>
            </div>

            <div className="border border-black min-h-[150px] p-8 bg-gray-50 flex items-center justify-center">
              <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">Items added for manual deduction will appear here.</p>
            </div>
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t-2 border-black">
            <button className="px-8 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:invert transition-all disabled:opacity-50">
              Confirm & Deduct Inventory
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: ISSUE REPORT (E1) ================= */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(255,0,0,1)]">
            <div className="flex items-center gap-2 text-red-600 mb-4 uppercase font-black tracking-tighter text-xl border-b-2 border-black pb-2">
              <AlertOctagon size={28}/> Stock Discrepancy
            </div>
            <p className="text-sm font-bold mb-4 uppercase leading-relaxed">You are reporting that physical stock is <span className="underline text-red-600">missing or damaged</span> despite system availability.</p>
            
            <label className="block text-xs font-bold uppercase mb-1">Reason / Details *</label>
            <textarea 
              placeholder="e.g. Only found 2 units on shelf, 3 units are missing..."
              className="w-full p-3 border border-black text-sm font-mono h-28 mb-6 outline-none focus:ring-1 focus:ring-black resize-none"
              value={issueReason}
              onChange={(e) => setIssueReason(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-black">
              <button onClick={() => setShowIssueModal(false)} className="px-6 py-2 border border-black font-bold uppercase text-xs hover:bg-gray-100">Cancel</button>
              <button 
                disabled={!issueReason.trim()}
                onClick={handleReportIssue}
                className="px-6 py-2 bg-red-600 text-white font-black uppercase text-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Flag Issue & Hold Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}