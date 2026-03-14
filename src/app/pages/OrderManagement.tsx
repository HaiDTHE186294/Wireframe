import { useState } from "react";
import { Eye, AlertCircle, CheckSquare, XSquare, Plus, Printer, Trash2, X, Edit, Save } from "lucide-react";
import { Pagination } from "../components/Pagination";

// --- INTERFACES ---
interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
}

interface Order {
  id: string;
  customerName: string;
  phone?: string;
  address?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  isWholesale?: boolean;
  items: OrderItem[];
}

type ViewMode = "LIST" | "VIEW_DETAIL" | "CREATE";

export function OrderManagement() {
  // --- STATES LỌC & DANH SÁCH ---
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // --- STATES ĐIỀU HƯỚNG MÀN HÌNH ---
  const [viewMode, setViewMode] = useState<ViewMode>("LIST");
  
  // --- STATES MODALS (Chỉ giữ lại Approval Modal) ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  
  // --- STATES APPROVAL ---
  const [approvalReason, setApprovalReason] = useState("");
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  // --- STATES CREATE MANUAL ORDER ---
  const [newOrder, setNewOrder] = useState({
    customerName: "", phone: "", address: "", paymentMethod: "COD", isWholesale: false, discount: 0, shippingFee: 0
  });
  const [newOrderItems, setNewOrderItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState({ sku: "", name: "", qty: 1, unitPrice: 0 });

  // --- STATES EDIT EXISTING ORDER ---
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editOrderItems, setEditOrderItems] = useState<OrderItem[]>([]);
  const [editOrderDiscount, setEditOrderDiscount] = useState(0);
  const [editOrderShippingFee, setEditOrderShippingFee] = useState(0);

  // Dữ liệu SKU mẫu để tạo đơn tay
  const availableProducts = [
    { sku: "SIG-250-W", name: "Signature Blend 250g (Hạt)", price: 180000 },
    { sku: "SIG-500-GP", name: "Signature Blend 500g (Pha Phin)", price: 340000 },
    { sku: "ACD-500-W", name: "Arabica Cầu Đất 500g (Hạt)", price: 420000 },
  ];

  // --- MOCK DATA ---
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001", customerName: "Nguyen Van A", phone: "0901234567", address: "123 Le Loi, Q1, HCMC",
      subtotal: 360000, discount: 20000, shippingFee: 30000, totalPrice: 370000, 
      paymentMethod: "Bank Transfer", status: "New",
      lastModifiedBy: "SYSTEM", lastModifiedDate: "2026-03-04 09:00", isWholesale: false,
      items: [
        { sku: "SIG-250-W", name: "Signature Blend 250g (Hạt)", qty: 2, unitPrice: 180000 }
      ]
    },
    {
      id: "ORD-002", customerName: "Coffee Shop Highland", phone: "0987654321", address: "45 Nguyen Trai, Da Lat",
      subtotal: 25000000, discount: 1000000, shippingFee: 0, totalPrice: 24000000, 
      paymentMethod: "Debt (Net 30)", status: "Waiting for Approval",
      lastModifiedBy: "SALE-02", lastModifiedDate: "2026-03-04 10:30", isWholesale: true,
      items: [
        { sku: "SIG-500-GP", name: "Signature Blend 500g (Pha Phin)", qty: 50, unitPrice: 340000 },
        { sku: "ACD-500-W", name: "Arabica Cầu Đất 500g (Hạt)", qty: 19, unitPrice: 421052 } 
      ]
    },
    {
      id: "ORD-004", customerName: "The Coffee House", phone: "0911223344", address: "Kho TCH, Q9, HCMC",
      subtotal: 42000000, discount: 0, shippingFee: 500000, totalPrice: 42500000, 
      paymentMethod: "Bank Transfer", status: "Awaiting Stock",
      lastModifiedBy: "SYSTEM", lastModifiedDate: "2026-03-04 11:00", isWholesale: true,
      items: [
        { sku: "ACD-500-W", name: "Arabica Cầu Đất 500g (Hạt)", qty: 100, unitPrice: 420000 }
      ]
    },
  ]);

  const filteredOrders = statusFilter
    ? orders.filter((order) => order.status.toLowerCase() === statusFilter.toLowerCase())
    : orders;

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // --- HANDLERS ---
  const handleApproval = (order: Order, action: "approve" | "reject") => {
    setSelectedOrder(order);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const submitApproval = () => {
    console.log(`${approvalAction} order ${selectedOrder?.id} with reason: ${approvalReason}`);
    setShowApprovalModal(false); setApprovalReason(""); setSelectedOrder(null);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsEditingOrder(false);
    setViewMode("VIEW_DETAIL");
  };

  const closeViewMode = () => {
    setViewMode("LIST");
    setIsEditingOrder(false);
    setSelectedOrder(null);
  };

  const startEditOrder = () => {
    if (selectedOrder) {
      setEditOrderItems([...selectedOrder.items]);
      setEditOrderDiscount(selectedOrder.discount);
      setEditOrderShippingFee(selectedOrder.shippingFee);
      setIsEditingOrder(true);
    }
  };

  const saveOrderEdits = () => {
    if (!selectedOrder) return;
    const newSubtotal = editOrderItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const newTotalPrice = newSubtotal - editOrderDiscount + editOrderShippingFee;
    
    let newStatus = selectedOrder.status;
    if (selectedOrder.isWholesale && newTotalPrice > 20000000 && newStatus === "New") {
      newStatus = "Waiting for Approval";
    }

    const updatedOrder: Order = {
      ...selectedOrder,
      items: editOrderItems,
      subtotal: newSubtotal,
      discount: editOrderDiscount,
      shippingFee: editOrderShippingFee,
      totalPrice: newTotalPrice,
      status: newStatus,
      lastModifiedBy: "CURRENT_USER",
      lastModifiedDate: new Date().toISOString().slice(0, 16).replace("T", " ")
    };

    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
    setIsEditingOrder(false);
  };

  const handleAddItemToManualOrder = () => {
    if (currentItem.sku && currentItem.qty > 0 && currentItem.unitPrice >= 0) {
      setNewOrderItems([...newOrderItems, currentItem]);
      setCurrentItem({ sku: "", name: "", qty: 1, unitPrice: 0 }); // reset
    }
  };

  const handleRemoveItemFromManualOrder = (indexToRemove: number) => {
    setNewOrderItems(newOrderItems.filter((_, idx) => idx !== indexToRemove));
  };

  const submitManualOrder = () => {
    const subtotal = newOrderItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const totalPrice = subtotal - newOrder.discount + newOrder.shippingFee;

    const newOrderObj: Order = {
      id: `ORD-M${String(orders.length + 1).padStart(3, "0")}`,
      customerName: newOrder.customerName,
      phone: newOrder.phone,
      address: newOrder.address,
      paymentMethod: newOrder.paymentMethod,
      subtotal: subtotal,
      discount: newOrder.discount,
      shippingFee: newOrder.shippingFee,
      totalPrice: totalPrice,
      status: "Confirmed", 
      isWholesale: newOrder.isWholesale || totalPrice > 20000000,
      lastModifiedBy: "CURRENT_USER",
      lastModifiedDate: new Date().toISOString().slice(0, 16).replace("T", " "),
      items: newOrderItems
    };

    if (newOrderObj.isWholesale) newOrderObj.status = "Waiting for Approval";

    setOrders([newOrderObj, ...orders]);
    setViewMode("LIST");
    setNewOrder({ customerName: "", phone: "", address: "", paymentMethod: "COD", isWholesale: false, discount: 0, shippingFee: 0 });
    setNewOrderItems([]);
  };

  return (
    <div className="bg-white text-black min-h-screen pb-10">
      
      {/* ================= MÀN HÌNH 1: LIST ORDERS ================= */}
      {viewMode === "LIST" && (
        <>
          <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Order Management</h1>
              <p className="text-sm mt-1 font-bold uppercase tracking-widest text-gray-600">Track, Approve & Fulfill</p>
            </div>
            <button 
              onClick={() => setViewMode("CREATE")}
              className="px-6 py-2 bg-black text-white border border-black hover:invert font-bold uppercase text-sm tracking-wider flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Create Manual Order
            </button>
          </div>

          <div className="mb-6 p-4 border border-black bg-gray-50">
            <p className="text-xs font-bold uppercase mb-3 tracking-wider">Filter by Status</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => handleFilterChange("")} className={`px-4 py-2 border border-black text-xs font-bold uppercase tracking-wider transition-colors ${statusFilter === "" ? "bg-black text-white" : "bg-white hover:bg-gray-200"}`}>All Orders</button>
              {["New", "Waiting for Approval", "Awaiting Stock", "Packing", "Shipping", "Completed", "Cancelled"].map(
                (status) => (
                  <button key={status} onClick={() => handleFilterChange(status)} className={`px-4 py-2 border border-black text-xs font-bold uppercase tracking-wider transition-colors ${statusFilter === status ? status === "Awaiting Stock" ? "bg-black text-white border-dashed border-2" : "bg-black text-white" : status === "Awaiting Stock" ? "bg-white border-dashed border-2 hover:bg-gray-100" : "bg-white hover:bg-gray-100"}`}>
                    {status === "Awaiting Stock" && <AlertCircle size={12} className="inline mr-1 mb-0.5" />}
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="border border-black bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-gray-50">
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black w-12">#</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black">Order ID</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black">Customer</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black text-right">Total Price</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black">Payment</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider border-r border-black text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm italic text-gray-500">No orders found for this status.</td></tr>
                ) : (
                  paginatedOrders.map((order, index) => {
                    const needsApproval = order.status === "Waiting for Approval";
                    const isAwaitingStock = order.status === "Awaiting Stock";
                    const rowNumber = startIndex + index + 1;

                    return (
                      <tr key={order.id} className={`border-b border-gray-200 transition-colors hover:bg-gray-50 ${needsApproval ? "bg-gray-100" : ""}`}>
                        <td className="px-4 py-4 border-r border-black text-center font-mono text-sm text-gray-500">{rowNumber}</td>
                        <td className="px-4 py-4 border-r border-black">
                          <div className="font-mono font-bold text-sm">{order.id}</div>
                          <div className="text-[10px] text-gray-500 mt-1 uppercase">{order.lastModifiedDate}</div>
                        </td>
                        <td className="px-4 py-4 border-r border-black">
                          <div className="font-bold text-sm flex items-center gap-2">
                            {order.customerName}
                            {order.isWholesale && <span className="text-[10px] border border-black px-1 uppercase tracking-widest font-black bg-black text-white">B2B</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 border-r border-black text-right font-mono font-bold text-lg">
                          {order.totalPrice.toLocaleString("vi-VN")} ₫
                        </td>
                        <td className="px-4 py-4 border-r border-black text-sm uppercase">{order.paymentMethod}</td>
                        <td className="px-4 py-4 border-r border-black text-center">
                          <span className={`inline-block px-3 py-1 border text-xs font-bold uppercase tracking-wider ${needsApproval ? "border-black bg-black text-white" : isAwaitingStock ? "border-black border-dashed border-2 bg-white" : "border-black bg-gray-100"}`}>
                            {isAwaitingStock && <AlertCircle size={10} className="inline mr-1 mb-0.5" />}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleViewOrder(order)} className="p-2 border border-black bg-white hover:bg-gray-200 transition-colors" title="View Details">
                              <Eye size={16} />
                            </button>
                            {needsApproval && (
                              <>
                                <button onClick={() => handleApproval(order, "approve")} className="p-2 border border-black bg-black text-white hover:invert transition-colors" title="Approve Order">
                                  <CheckSquare size={16} />
                                </button>
                                <button onClick={() => handleApproval(order, "reject")} className="p-2 border border-black bg-white hover:bg-gray-200 transition-colors" title="Reject Order">
                                  <XSquare size={16} />
                                </button>
                              </>
                            )}
                          </div>
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


      {/* ================= MÀN HÌNH 2: VIEW DETAIL / EDIT ORDER ================= */}
      {viewMode === "VIEW_DETAIL" && selectedOrder && (
        <div className="max-w-5xl mx-auto mt-4 bg-white border-2 border-black p-8 shadow-sm">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Order Details</h2>
              <div className="flex gap-3 mt-2 items-center">
                <span className="font-mono text-lg border border-black px-2 bg-gray-50">{selectedOrder.id}</span>
                <span className={`px-2 py-1 border text-xs font-bold uppercase tracking-wider border-black ${selectedOrder.status === 'Waiting for Approval' ? 'bg-black text-white' : 'bg-gray-100'}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {(selectedOrder.status === "New" || selectedOrder.status === "Waiting for Approval") && !isEditingOrder && (
                <button onClick={startEditOrder} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 flex items-center gap-2 font-bold uppercase text-xs">
                  <Edit size={16} /> Override
                </button>
              )}
              {!isEditingOrder && (
                <button className="p-2 border border-black bg-white hover:bg-gray-100" title="Print Invoice"><Printer size={16} /></button>
              )}
              <button onClick={closeViewMode} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs">
                Back to List
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border border-black p-4 bg-gray-50">
              <h3 className="text-xs font-bold uppercase mb-3 text-gray-500 tracking-wider">Customer Information</h3>
              <p className="font-bold text-lg">{selectedOrder.customerName}</p>
              <p className="font-mono mt-1">{selectedOrder.phone || "No phone provided"}</p>
              <p className="text-sm mt-1">{selectedOrder.address || "No address provided"}</p>
            </div>
            <div className="border border-black p-4 bg-gray-50">
              <h3 className="text-xs font-bold uppercase mb-3 text-gray-500 tracking-wider">Payment Details</h3>
              <p className="font-bold text-sm uppercase">Method: {selectedOrder.paymentMethod}</p>
              <p className="text-sm uppercase mt-1">Type: {selectedOrder.isWholesale ? "B2B / Wholesale" : "B2C / Retail"}</p>
              <p className="text-xs font-mono mt-3 text-gray-500">Last Modified: {selectedOrder.lastModifiedDate}</p>
            </div>
          </div>

          <div className="flex justify-between items-end mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider">Order Items</h3>
            {isEditingOrder && <span className="text-[10px] font-bold uppercase bg-yellow-300 px-2 py-0.5 border border-black">Edit Mode Active</span>}
          </div>
          
          <div className="border border-black mb-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black bg-gray-100 text-xs uppercase font-bold">
                  <th className="p-3 border-r border-black">SKU</th>
                  <th className="p-3 border-r border-black">Product Name</th>
                  <th className="p-3 border-r border-black text-center w-24">Qty</th>
                  <th className="p-3 border-r border-black text-right w-32">Unit Price (₫)</th>
                  <th className="p-3 text-right w-36">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(isEditingOrder ? editOrderItems : selectedOrder.items).map((item, idx) => {
                  const originalPrice = availableProducts.find(p => p.sku === item.sku)?.price || item.unitPrice;
                  const isCustomPrice = item.unitPrice !== originalPrice;

                  return (
                    <tr key={idx} className="border-b border-gray-200 text-sm font-mono">
                      <td className="p-3 border-r border-black font-bold">{item.sku}</td>
                      <td className="p-3 border-r border-black font-sans">{item.name}</td>
                      <td className="p-2 border-r border-black text-center">
                        {isEditingOrder ? (
                          <input type="number" min="1" value={item.qty} 
                            onChange={(e) => {
                              const newItems = [...editOrderItems];
                              newItems[idx].qty = parseInt(e.target.value) || 1;
                              setEditOrderItems(newItems);
                            }}
                            className="w-full p-1 border border-gray-400 text-center outline-none focus:border-black" 
                          />
                        ) : (
                          item.qty
                        )}
                      </td>
                      <td className="p-2 border-r border-black text-right">
                        {isEditingOrder ? (
                          <div className="flex items-center justify-end gap-1">
                            {isCustomPrice && <AlertCircle size={14} className="text-black" title="Price overridden" />}
                            <input type="number" min="0" value={item.unitPrice} 
                              onChange={(e) => {
                                const newItems = [...editOrderItems];
                                newItems[idx].unitPrice = parseInt(e.target.value) || 0;
                                setEditOrderItems(newItems);
                              }}
                              className="w-full p-1 border border-gray-400 text-right outline-none focus:border-black" 
                            />
                          </div>
                        ) : (
                          item.unitPrice.toLocaleString()
                        )}
                      </td>
                      <td className="p-3 text-right font-bold bg-gray-50">{(item.qty * item.unitPrice).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-start">
            <div className="w-1/2">
              {isEditingOrder && (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditingOrder(false)} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 text-xs font-bold uppercase transition-colors">Cancel Edits</button>
                  <button onClick={saveOrderEdits} className="px-4 py-2 border border-black bg-black text-white hover:invert text-xs font-bold uppercase transition-colors flex items-center gap-2">
                    <Save size={14}/> Save Changes
                  </button>
                </div>
              )}
            </div>
            <div className="w-1/2 border-t-2 border-black pt-4">
              <div className="flex justify-between items-center mb-2 text-sm uppercase font-bold text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono text-black">
                  {(isEditingOrder ? editOrderItems : selectedOrder.items).reduce((sum, i) => sum + (i.qty * i.unitPrice), 0).toLocaleString()} ₫
                </span>
              </div>
              <div className="flex justify-between items-center mb-2 text-sm uppercase font-bold text-red-600">
                <span>Discount</span>
                {isEditingOrder ? (
                  <div className="flex items-center gap-1">
                    <span>-</span>
                    <input type="number" min="0" value={editOrderDiscount} onChange={(e) => setEditOrderDiscount(parseInt(e.target.value) || 0)} className="w-24 p-1 border border-red-400 text-right outline-none focus:border-red-600 font-mono text-black bg-white" />
                    <span className="text-black">₫</span>
                  </div>
                ) : (
                  <span className="font-mono">- {selectedOrder.discount.toLocaleString()} ₫</span>
                )}
              </div>
              <div className="flex justify-between items-center mb-2 text-sm uppercase font-bold text-gray-600">
                <span>Shipping Fee</span>
                {isEditingOrder ? (
                  <div className="flex items-center gap-1">
                    <span>+</span>
                    <input type="number" min="0" value={editOrderShippingFee} onChange={(e) => setEditOrderShippingFee(parseInt(e.target.value) || 0)} className="w-24 p-1 border border-gray-400 text-right outline-none focus:border-black font-mono text-black bg-white" />
                    <span className="text-black">₫</span>
                  </div>
                ) : (
                  <span className="font-mono">+ {selectedOrder.shippingFee.toLocaleString()} ₫</span>
                )}
              </div>
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-black text-xl font-black uppercase tracking-widest">
                <span>Total Price</span>
                <span className="font-mono text-black">
                  {isEditingOrder 
                    ? (editOrderItems.reduce((sum, i) => sum + (i.qty * i.unitPrice), 0) - editOrderDiscount + editOrderShippingFee).toLocaleString() 
                    : selectedOrder.totalPrice.toLocaleString()} ₫
                </span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ================= MÀN HÌNH 3: CREATE MANUAL ORDER ================= */}
      {viewMode === "CREATE" && (
        <div className="max-w-6xl mx-auto mt-4 bg-white border-2 border-black p-8 shadow-sm">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Create Manual Order</h2>
              <p className="text-sm mt-1 uppercase tracking-widest text-gray-600">For Walk-in or B2B direct sales</p>
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black hover:bg-gray-100 font-bold uppercase text-xs">
              Back to List
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Customer Info */}
            <div className="lg:col-span-4 space-y-4">
              <div className="border border-black p-4 bg-gray-50 space-y-4">
                <h3 className="text-xs font-bold uppercase border-b border-black pb-2">Customer Info</h3>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Full Name *</label>
                  <input type="text" value={newOrder.customerName} onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})} className="w-full p-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Phone Number</label>
                  <input type="text" value={newOrder.phone} onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})} className="w-full p-2 border border-black text-sm font-mono outline-none focus:ring-1 focus:ring-black bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Shipping Address</label>
                  <textarea value={newOrder.address} onChange={(e) => setNewOrder({...newOrder, address: e.target.value})} className="w-full p-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black h-20 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Payment Term</label>
                  <select value={newOrder.paymentMethod} onChange={(e) => setNewOrder({...newOrder, paymentMethod: e.target.value})} className="w-full p-2 border border-black text-sm uppercase outline-none focus:ring-1 focus:ring-black bg-white">
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Debt (Net 30)">Debt (B2B Only)</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input type="checkbox" checked={newOrder.isWholesale} onChange={(e) => setNewOrder({...newOrder, isWholesale: e.target.checked})} className="w-4 h-4 border-2 border-black accent-black" />
                  <span className="text-xs font-bold uppercase">Mark as B2B Wholesale</span>
                </label>
              </div>
            </div>

            {/* Right Col: Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Form Add Item */}
              <div className="border border-black p-4 bg-white flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase mb-1">Select Product</label>
                  <select 
                    value={currentItem.sku} 
                    onChange={(e) => {
                      const prod = availableProducts.find(p => p.sku === e.target.value);
                      if(prod) setCurrentItem({...currentItem, sku: prod.sku, name: prod.name, unitPrice: prod.price});
                    }} 
                    className="w-full p-2 border border-black text-sm font-bold uppercase outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="">-- Choose Product --</option>
                    {availableProducts.map(p => <option key={p.sku} value={p.sku}>{p.sku} - {p.name}</option>)}
                  </select>
                </div>
                <div className="w-20">
                  <label className="block text-xs font-bold uppercase mb-1">Qty</label>
                  <input type="number" min="1" value={currentItem.qty} onChange={(e) => setCurrentItem({...currentItem, qty: parseInt(e.target.value) || 1})} className="w-full p-2 border border-black text-sm font-mono text-center outline-none focus:ring-1 focus:ring-black" />
                </div>
                <button onClick={handleAddItemToManualOrder} disabled={!currentItem.sku} className="p-2 h-[38px] border border-black bg-black text-white hover:invert disabled:opacity-30 disabled:hover:invert-0 transition-all">
                  <Plus size={20} />
                </button>
              </div>

              {/* Items List (Editable Table) */}
              <div className="border border-black min-h-[200px] bg-gray-50">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-black bg-gray-200 text-xs uppercase font-bold">
                      <th className="p-2 border-r border-black">Product</th>
                      <th className="p-2 border-r border-black text-center w-20">Qty</th>
                      <th className="p-2 border-r border-black text-right w-36">Price (₫)</th>
                      <th className="p-2 border-r border-black text-right w-32">Subtotal</th>
                      <th className="p-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newOrderItems.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-sm italic text-gray-500">No items added yet.</td></tr>
                    ) : (
                      newOrderItems.map((item, idx) => {
                        const originalPrice = availableProducts.find(p => p.sku === item.sku)?.price || item.unitPrice;
                        const isCustomPrice = item.unitPrice !== originalPrice;

                        return (
                          <tr key={idx} className="border-b border-gray-300 bg-white font-mono text-sm">
                            <td className="p-2 border-r border-black font-sans font-bold">
                              {item.name} <br/>
                              <span className="font-mono text-xs font-normal text-gray-500">{item.sku}</span>
                            </td>
                            <td className="p-2 border-r border-black text-center">
                              <input type="number" min="1" value={item.qty} 
                                onChange={(e) => {
                                  const newItems = [...newOrderItems];
                                  newItems[idx].qty = parseInt(e.target.value) || 1;
                                  setNewOrderItems(newItems);
                                }}
                                className="w-full p-1 border border-gray-400 text-center outline-none focus:border-black" 
                              />
                            </td>
                            <td className="p-2 border-r border-black text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isCustomPrice && (
                                  <AlertCircle size={14} className="text-black" title="Price overridden from standard" />
                                )}
                                <input type="number" min="0" value={item.unitPrice} 
                                  onChange={(e) => {
                                    const newItems = [...newOrderItems];
                                    newItems[idx].unitPrice = parseInt(e.target.value) || 0;
                                    setNewOrderItems(newItems);
                                  }}
                                  className={`w-full p-1 border text-right outline-none focus:border-black ${isCustomPrice ? 'border-black bg-gray-100 font-bold' : 'border-gray-400'}`} 
                                />
                              </div>
                            </td>
                            <td className="p-2 border-r border-black text-right font-bold bg-gray-50">{(item.qty * item.unitPrice).toLocaleString()}</td>
                            <td className="p-2 text-center bg-gray-50">
                              <button onClick={() => handleRemoveItemFromManualOrder(idx)} className="text-red-600 hover:text-black"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Area */}
              <div className="flex justify-end pt-4">
                <div className="w-2/3 lg:w-1/2">
                  <div className="flex justify-between items-center mb-2 text-sm uppercase font-bold text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-mono text-black">
                      {newOrderItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0).toLocaleString()} ₫
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm uppercase font-bold text-red-600">
                    <span>Discount</span>
                    <div className="flex items-center gap-1">
                      <span>-</span>
                      <input type="number" min="0" value={newOrder.discount} onChange={(e) => setNewOrder({...newOrder, discount: parseInt(e.target.value) || 0})} className="w-24 p-1 border border-red-400 text-right outline-none focus:border-red-600 font-mono text-black bg-white" />
                      <span className="text-black">₫</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm uppercase font-bold text-gray-600">
                    <span>Shipping Fee</span>
                    <div className="flex items-center gap-1">
                      <span>+</span>
                      <input type="number" min="0" value={newOrder.shippingFee} onChange={(e) => setNewOrder({...newOrder, shippingFee: parseInt(e.target.value) || 0})} className="w-24 p-1 border border-gray-400 text-right outline-none focus:border-black font-mono text-black bg-white" />
                      <span className="text-black">₫</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-black text-xl font-black uppercase tracking-widest">
                    <span>Est. Total</span>
                    <span className="font-mono text-black">
                      {(newOrderItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0) - newOrder.discount + newOrder.shippingFee).toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 mt-6 border-t-2 border-black">
            <button onClick={() => setViewMode("LIST")} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase tracking-wider text-sm transition-colors">Cancel</button>
            <button 
              onClick={submitManualOrder}
              disabled={!newOrder.customerName || newOrderItems.length === 0} 
              className="px-8 py-2 border border-black bg-black text-white hover:invert font-bold uppercase tracking-wider text-sm disabled:opacity-30 disabled:hover:invert-0 transition-all"
            >
              Submit Order
            </button>
          </div>
        </div>
      )}


      {/* ================= MODAL: APPROVAL (Giữ nguyên) ================= */}
      {showApprovalModal && selectedOrder && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowApprovalModal(false)}>
          <div className="bg-white border-2 border-black p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 pb-4 border-b-2 border-black">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {approvalAction === "approve" ? "Confirm Approval" : "Reject Order"}
              </h2>
              <p className="font-mono text-sm mt-2 p-2 bg-gray-100 border border-black">
                ID: <strong>{selectedOrder.id}</strong> | Value: <strong>{selectedOrder.totalPrice.toLocaleString()} ₫</strong>
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase mb-2">Reason / Note *</label>
              <textarea value={approvalReason} onChange={(e) => setApprovalReason(e.target.value)} placeholder="Enter justification for this decision..." className="w-full p-3 border border-black h-28 text-sm focus:outline-none focus:ring-2 focus:ring-black" autoFocus />
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-black">
              <button onClick={() => setShowApprovalModal(false)} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-sm transition-colors">Cancel</button>
              <button onClick={submitApproval} disabled={!approvalReason.trim()} className={`px-6 py-2 border border-black font-bold uppercase text-sm transition-all ${approvalReason.trim() ? "bg-black text-white hover:invert" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}>
                Execute {approvalAction}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}