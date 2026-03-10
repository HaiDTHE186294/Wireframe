import { useState } from "react";
import { Search, Plus, Lock, Unlock, X, Eye, ExternalLink, ArrowUpDown, MapPin } from "lucide-react";
import { Pagination } from "../components/Pagination";

// --- INTERFACES ---
interface OrderHistoryItem {
  productName: string;
  qty: number;
  unitPrice: number;
}

interface OrderHistory {
  id: string;
  date: string;
  total: number;
  status: string;
  items: OrderHistoryItem[]; // Thêm mảng items để chứa thông tin chi tiết mua gì
}

interface CustomerNote {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  addresses: string[]; // Đã đổi thành mảng địa chỉ
  totalSpend: number;
  sensoryPreferences: {
    bitter: number;
    sweet: number;
    sour: number;
    body: number;
    flavor: string;
  };
  status: "Active" | "Locked";
  notes: CustomerNote[];
  orders: OrderHistory[];
}

type ViewMode = "LIST" | "DETAIL";

export function CustomerCRM() {
  // --- STATES ĐIỀU HƯỚNG UI ---
  const [viewMode, setViewMode] = useState<ViewMode>("LIST");
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "interactions">("overview");
  
  // --- STATES DỮ LIỆU ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToChangeStatus, setCustomerToChangeStatus] = useState<Customer | null>(null);
  const [newNote, setNewNote] = useState("");
  
  // --- FILTER & SORT STATES ---
  const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Locked">("");
  const [sortBy, setSortBy] = useState<"name" | "totalSpend">("totalSpend");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // --- STATES MODALS ---
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [viewingOrder, setViewingOrder] = useState<OrderHistory | null>(null);

  // --- MOCK DATA (Chuyển thành State để các thao tác update có hiệu lực) ---
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "CUS-001",
      name: "Nguyen Van A",
      phone: "0901234567",
      email: "nva@gmail.com",
      addresses: ["123 Le Loi, District 1, HCMC", "Apt 4B, 45 Nguyen Hue, District 1, HCMC"], // Cập nhật mảng địa chỉ
      totalSpend: 45000000,
      sensoryPreferences: { bitter: 7, sweet: 4, sour: 3, body: 6, flavor: "Chocolate, Nutty, Caramel" },
      status: "Active",
      orders: [
        { 
          id: "ORD-20260220-01", date: "2026-02-20", total: 1500000, status: "Completed",
          items: [
            { productName: "Signature Blend 250g", qty: 2, unitPrice: 250000 },
            { productName: "Premium Arabica 500g", qty: 2, unitPrice: 500000 }
          ]
        },
        { 
          id: "ORD-20260115-05", date: "2026-01-15", total: 3200000, status: "Completed",
          items: [
            { productName: "Medium Roast 1kg", qty: 4, unitPrice: 800000 }
          ]
        }
      ],
      notes: [
        {
          id: "1",
          content: "Customer prefers medium roast. Ordered 500g bags.",
          author: "SALE-01",
          timestamp: "2026-02-27 14:30",
        },
      ],
    },
    {
      id: "CUS-002",
      name: "Coffee Shop Highland",
      phone: "0902345678",
      email: "purchasing@highland.vn",
      addresses: ["45 Nguyen Trai, Da Lat"], // Cập nhật mảng địa chỉ
      totalSpend: 125000000,
      sensoryPreferences: { bitter: 8, sweet: 3, sour: 2, body: 9, flavor: "Dark Chocolate, Woody, Earthy" },
      status: "Active",
      orders: [
        { 
          id: "ORD-20260225-10", date: "2026-02-25", total: 25000000, status: "Shipping",
          items: [
            { productName: "Espresso Blend 1kg (B2B)", qty: 50, unitPrice: 500000 }
          ]
        },
      ],
      notes: [
        {
          id: "3",
          content: "Wholesale customer. Monthly orders around 50kg.",
          author: "SALE-01",
          timestamp: "2026-02-20 09:00",
        },
      ],
    },
    {
      id: "CUS-003",
      name: "Tran Thi B",
      phone: "0903456789",
      email: "tranthib@hotmail.com",
      addresses: ["88 Le Hoan, Hanoi", "Kho 2, KCN Từ Liêm, Hanoi"], // Cập nhật mảng địa chỉ
      totalSpend: 12000000,
      sensoryPreferences: { bitter: 4, sweet: 8, sour: 6, body: 5, flavor: "Fruity, Citrus, Floral" },
      status: "Locked",
      orders: [
        { 
          id: "ORD-20251210-02", date: "2025-12-10", total: 12000000, status: "Completed",
          items: [
            { productName: "Light Roast Arabica 500g", qty: 20, unitPrice: 600000 }
          ]
        }
      ],
      notes: [
        {
          id: "4",
          content: "Account locked due to payment issues.",
          author: "ADMIN-01",
          timestamp: "2026-02-15 16:00",
        },
      ],
    },
  ]);

  // --- FILTERING & SORTING ---
  let filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );
  
  // Apply status filter
  if (statusFilter) {
    filteredCustomers = filteredCustomers.filter(c => c.status === statusFilter);
  }
  
  // Apply sorting
  filteredCustomers = filteredCustomers.sort((a, b) => {
    if (sortBy === "totalSpend") {
      return sortOrder === "desc" ? b.totalSpend - a.totalSpend : a.totalSpend - b.totalSpend;
    } else {
      return sortOrder === "desc" 
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name);
    }
  });
  
  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  // --- HANDLERS ---
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveTab("overview");
    setViewMode("DETAIL");
  };

  const handleToggleStatus = (customer: Customer) => {
    if (customer.status === "Active") {
      setCustomerToChangeStatus(customer);
      setShowLockModal(true);
    } else {
      // Mở khóa trực tiếp
      setCustomers(customers.map(c => c.id === customer.id ? { ...c, status: "Active" } : c));
    }
  };

  const confirmLock = () => {
    if (customerToChangeStatus) {
      setCustomers(customers.map(c => c.id === customerToChangeStatus.id ? { ...c, status: "Locked" } : c));
    }
    setShowLockModal(false);
    setLockReason("");
    setCustomerToChangeStatus(null);
  };

  const addNote = () => {
    if (newNote.trim() && selectedCustomer) {
      const newNoteObj: CustomerNote = {
        id: Date.now().toString(),
        content: newNote,
        author: "CURRENT_USER",
        timestamp: new Date().toISOString().slice(0, 16).replace("T", " ")
      };
      
      const updatedCustomer = { ...selectedCustomer, notes: [...selectedCustomer.notes, newNoteObj] };
      
      // Update global state and local selected state
      setCustomers(customers.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
      setSelectedCustomer(updatedCustomer);
      setNewNote("");
    }
  };

  return (
    <div className="bg-white text-black min-h-screen pb-10">
      
      {/* ================= MÀN HÌNH 1: LIST ================= */}
      {viewMode === "LIST" && (
        <>
          <div className="mb-6 pb-4 border-b-2 border-black flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Customer Management</h1>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-1">Directory & Status Control</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 p-4 border border-black bg-gray-50">
            <div className="flex gap-4 items-center mb-4">
              <div className="flex items-center gap-2 border border-black px-3 py-2 bg-white flex-1 max-w-md">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  placeholder="Search name, ID, phone..."
                  className="outline-none bg-transparent text-sm flex-1 focus:ring-0"
                />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                {filteredCustomers.length} Customers Found
              </p>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <span className="text-xs font-bold uppercase text-gray-600">Status:</span>
                <button 
                  onClick={() => { setStatusFilter(""); setCurrentPage(1); }}
                  className={`px-3 py-1 border border-black text-xs font-bold uppercase transition-colors ${statusFilter === "" ? "bg-black text-white" : "bg-white hover:bg-gray-200"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => { setStatusFilter("Active"); setCurrentPage(1); }}
                  className={`px-3 py-1 border border-black text-xs font-bold uppercase transition-colors ${statusFilter === "Active" ? "bg-black text-white" : "bg-white hover:bg-gray-200"}`}
                >
                  Active
                </button>
                <button 
                  onClick={() => { setStatusFilter("Locked"); setCurrentPage(1); }}
                  className={`px-3 py-1 border border-black text-xs font-bold uppercase transition-colors ${statusFilter === "Locked" ? "bg-black text-white" : "bg-white hover:bg-gray-200"}`}
                >
                  Locked
                </button>
              </div>
              
              <div className="flex gap-2 ml-auto">
                <span className="text-xs font-bold uppercase text-gray-600">Sort By:</span>
                <button 
                  onClick={() => { setSortBy("totalSpend"); setSortOrder(sortOrder === "desc" ? "asc" : "desc"); }}
                  className={`px-3 py-1 border border-black text-xs font-bold uppercase transition-colors flex items-center gap-1 ${sortBy === "totalSpend" ? "bg-black text-white" : "bg-white hover:bg-gray-200"}`}
                >
                  Total Spend {sortBy === "totalSpend" && <ArrowUpDown size={12} />}
                </button>
                <button 
                  onClick={() => { setSortBy("name"); setSortOrder(sortOrder === "desc" ? "asc" : "desc"); }}
                  className={`px-3 py-1 border border-black text-xs font-bold uppercase transition-colors flex items-center gap-1 ${sortBy === "name" ? "bg-black text-white" : "bg-white hover:bg-gray-200"}`}
                >
                  Name {sortBy === "name" && <ArrowUpDown size={12} />}
                </button>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="border border-black bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black bg-gray-50">
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black w-12">#</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black">Customer</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black">Contact Info</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black text-right">Lifetime Spend</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-sm italic text-gray-500">No customers found.</td></tr>
                ) : (
                  paginatedCustomers.map((customer, index) => {
                    const rowNumber = startIndex + index + 1;
                    return (
                    <tr key={customer.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${customer.status === 'Locked' ? 'bg-gray-100 opacity-80' : ''}`}>
                      <td className="px-4 py-3 border-r border-black text-center font-mono text-sm text-gray-500">{rowNumber}</td>
                      <td className="px-4 py-3 border-r border-black">
                        <p className="font-bold text-sm">{customer.name}</p>
                        <p className="font-mono text-xs text-gray-600 mt-1">{customer.id}</p>
                      </td>
                      <td className="px-4 py-3 border-r border-black">
                        <p className="text-sm font-mono">{customer.phone}</p>
                        <p className="text-xs text-gray-600 mt-1">{customer.email}</p>
                      </td>
                      <td className="px-4 py-3 border-r border-black text-right font-mono font-bold">
                        {customer.totalSpend.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="px-4 py-3 border-r border-black text-center">
                        <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${customer.status === 'Locked' ? 'border-red-600 text-red-600 bg-red-50' : 'border-green-600 text-green-600'}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(customer)}
                            className={`p-2 border border-black transition-colors ${customer.status === 'Locked' ? 'bg-black text-white hover:invert' : 'bg-white hover:bg-gray-200'}`}
                            title={customer.status === "Active" ? "Lock Account" : "Unlock Account"}
                          >
                            {customer.status === "Active" ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                          <button
                            onClick={() => handleSelectCustomer(customer)}
                            className="px-3 py-1 border border-black bg-white hover:bg-gray-200 text-xs font-bold uppercase flex items-center gap-2 transition-colors"
                          >
                            <Eye size={14} /> 360 View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
            
            {filteredCustomers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredCustomers.length}
              />
            )}
          </div>
        </>
      )}

      {/* ================= MÀN HÌNH 2: DETAIL (360 VIEW) ================= */}
      {viewMode === "DETAIL" && selectedCustomer && (
        <div className="max-w-6xl mx-auto">
          {/* Detail Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">{selectedCustomer.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-mono bg-gray-100 border border-black px-2 py-0.5">{selectedCustomer.id}</span>
                <span className={`text-[10px] px-2 py-1 border font-bold uppercase tracking-wider ${selectedCustomer.status === 'Locked' ? 'border-red-600 text-red-600 bg-red-50' : 'border-green-600 text-green-600'}`}>
                  {selectedCustomer.status}
                </span>
              </div>
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs transition-colors">
              Back to Directory
            </button>
          </div>

          <div className="border-2 border-black bg-white">
            {/* Tabs Navigation */}
            <div className="flex border-b-2 border-black bg-gray-50">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-4 text-sm font-bold border-r border-black uppercase tracking-wider transition-colors ${activeTab === "overview" ? "bg-black text-white" : "hover:bg-gray-200"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-1 py-4 text-sm font-bold border-r border-black uppercase tracking-wider transition-colors ${activeTab === "orders" ? "bg-black text-white" : "hover:bg-gray-200"}`}
              >
                Purchase History
              </button>
              <button
                onClick={() => setActiveTab("interactions")}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === "interactions" ? "bg-black text-white" : "hover:bg-gray-200"}`}
              >
                Notes & Interactions
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    {/* Contact Info Block */}
                    <div>
                      <h3 className="text-sm font-black uppercase mb-4 border-b border-black pb-2 tracking-widest text-gray-500">Contact Information</h3>
                      <div className="space-y-4 text-sm font-bold">
                        <div className="flex justify-between">
                          <span className="text-gray-500 uppercase tracking-wider text-xs">Phone Number</span>
                          <span className="font-mono">{selectedCustomer.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 uppercase tracking-wider text-xs">Email Address</span>
                          <span>{selectedCustomer.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase tracking-wider text-xs mb-2">Delivery Addresses ({selectedCustomer.addresses.length})</span>
                          <div className="space-y-2">
                            {selectedCustomer.addresses.length === 0 ? (
                              <p className="text-xs italic text-gray-500 p-2 border border-dashed border-gray-300">No addresses saved.</p>
                            ) : (
                              selectedCustomer.addresses.map((address, idx) => (
                                <div key={idx} className="p-3 border border-black bg-gray-50 font-normal flex items-start gap-2">
                                  <MapPin size={14} className="mt-0.5 text-gray-500 shrink-0" />
                                  <span>{address}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Block */}
                    <div>
                      <h3 className="text-sm font-black uppercase mb-4 border-b border-black pb-2 tracking-widest text-gray-500">Account Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-black p-4 bg-gray-50">
                          <span className="text-gray-500 block text-xs font-bold uppercase mb-1">Total Spend</span>
                          <span className="text-xl font-black font-mono">{selectedCustomer.totalSpend.toLocaleString("vi-VN")} ₫</span>
                        </div>
                        <div className="border border-black p-4 bg-gray-50">
                          <span className="text-gray-500 block text-xs font-bold uppercase mb-1">Total Orders</span>
                          <span className="text-xl font-black font-mono">{selectedCustomer.orders.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences Block */}
                  <div>
                    <h3 className="text-sm font-black uppercase mb-4 border-b border-black pb-2 tracking-widest text-gray-500">Derived Sensory Preferences</h3>
                    <p className="text-xs text-gray-500 mb-6 font-bold uppercase">Estimated profile based on historical purchases.</p>
                    
                    <div className="space-y-5 mb-6">
                      {(['bitter', 'sweet', 'sour', 'body'] as const).map((key) => {
                        const value = selectedCustomer.sensoryPreferences[key];
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-xs font-bold uppercase mb-1">
                              <span>{key}</span>
                              <span className="font-mono bg-white border border-black px-1">{value}/10</span>
                            </div>
                            <div className="border border-black h-4 bg-gray-100">
                              <div className="h-full bg-black transition-all" style={{ width: `${value * 10}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 border-2 border-dashed border-black bg-gray-50">
                      <span className="block text-xs font-bold uppercase mb-2 text-gray-500">Dominant Tasting Notes</span>
                      <span className="text-sm font-bold uppercase">{selectedCustomer.sensoryPreferences.flavor}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PURCHASE HISTORY */}
              {activeTab === "orders" && (
                <div>
                  <table className="w-full text-left border-collapse border border-black">
                    <thead>
                      <tr className="border-b border-black bg-gray-50">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider border-r border-black">Order ID</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider border-r border-black">Date</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider border-r border-black text-right">Total (₫)</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider border-r border-black text-center">Status</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.orders.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-sm italic text-gray-500">No orders found.</td></tr>
                      ) : (
                        selectedCustomer.orders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-sm font-bold font-mono border-r border-black">{order.id}</td>
                            <td className="p-4 text-sm border-r border-black">{order.date}</td>
                            <td className="p-4 text-sm border-r border-black text-right font-mono font-bold">{order.total.toLocaleString()}</td>
                            <td className="p-4 text-center border-r border-black">
                              <span className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider ${order.status === 'Completed' ? 'border-black bg-white' : 'border-gray-400 bg-gray-100 text-gray-600'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => setViewingOrder(order)}
                                className="px-3 py-1 border border-black bg-black text-white hover:invert text-xs font-bold uppercase flex items-center gap-2 mx-auto transition-all" 
                              >
                                <Eye size={12} /> Brief
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: INTERACTIONS & NOTES */}
              {activeTab === "interactions" && (
                <div className="flex flex-col min-h-[400px]">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
                    {selectedCustomer.notes.length === 0 ? (
                      <div className="text-center text-sm text-gray-500 italic mt-10 border border-dashed border-gray-300 p-8">No notes recorded yet.</div>
                    ) : (
                      selectedCustomer.notes.map((note) => (
                        <div key={note.id} className="p-4 border border-black bg-gray-50 relative">
                          <p className="text-sm mb-4 font-bold">{note.content}</p>
                          <div className="flex justify-between text-xs text-gray-500 font-mono uppercase border-t border-gray-300 pt-2 mt-2">
                            <span>Author: {note.author}</span>
                            <span>{note.timestamp}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="pt-6 border-t-2 border-black mt-auto">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2">Add New Interaction Note</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Type details here..."
                        className="flex-1 px-4 py-3 border border-black text-sm outline-none focus:ring-2 focus:ring-black bg-white"
                        onKeyDown={(e) => e.key === 'Enter' && addNote()}
                      />
                      <button
                        onClick={addNote}
                        disabled={!newNote.trim()}
                        className="px-6 py-3 border border-black bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-wider text-sm disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BRIEF ORDER INFO ================= */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setViewingOrder(null)}>
          <div className="bg-white border-2 border-black p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-black">
              <div>
                <h2 className="font-black text-lg uppercase tracking-tighter">Order Snapshot</h2>
                <p className="text-sm font-mono mt-1 font-bold">{viewingOrder.id}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="p-1 border border-black hover:bg-gray-100"><X size={16}/></button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-2">
                <span className="text-xs font-bold uppercase text-gray-500">Date</span>
                <span className="font-mono text-sm">{viewingOrder.date}</span>
              </div>
              <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-2">
                <span className="text-xs font-bold uppercase text-gray-500">Total Value</span>
                <span className="font-mono text-lg font-black">{viewingOrder.total.toLocaleString()} ₫</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-xs font-bold uppercase text-gray-500">Status</span>
                <span className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider border-black ${viewingOrder.status === 'Completed' ? 'bg-black text-white' : 'bg-gray-100'}`}>
                  {viewingOrder.status}
                </span>
              </div>
            </div>

            {/* HIỂN THỊ DANH SÁCH MẶT HÀNG ĐÃ MUA */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 border-b border-black pb-1">Purchased Items</h3>
              <div className="space-y-3">
                {viewingOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2">
                    <div className="flex-1 pr-4">
                      <span className="font-bold block">{item.productName}</span>
                      <span className="text-xs text-gray-500 font-mono mt-0.5 block">
                        Qty: {item.qty} &times; {item.unitPrice.toLocaleString()} ₫
                      </span>
                    </div>
                    <span className="font-mono font-bold">
                      {(item.qty * item.unitPrice).toLocaleString()} ₫
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button className="w-full py-3 border border-black bg-black text-white hover:invert font-bold uppercase text-xs flex justify-center items-center gap-2 transition-colors">
                Go to Order Detail <ExternalLink size={14}/>
              </button>
              <button onClick={() => setViewingOrder(null)} className="w-full py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs transition-colors">
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOCK CUSTOMER REASON ================= */}
      {showLockModal && customerToChangeStatus && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowLockModal(false)}>
          <div className="bg-white border-2 border-black p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-black">
              <div>
                <h2 className="font-black text-xl uppercase tracking-tighter text-red-600">Lock Account</h2>
                <p className="text-sm font-bold mt-1">{customerToChangeStatus.name}</p>
              </div>
              <button onClick={() => setShowLockModal(false)} className="p-1 border border-black hover:bg-gray-100"><X size={16}/></button>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase mb-2">Reason for Locking *</label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="E.g., Bad debt, policy violation..."
                className="w-full p-3 border border-black h-28 text-sm outline-none focus:ring-2 focus:ring-red-600"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-black">
              <button onClick={() => setShowLockModal(false)} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmLock}
                disabled={!lockReason.trim()}
                className="px-6 py-2 border border-black bg-red-600 text-white hover:bg-red-700 font-bold uppercase text-xs disabled:opacity-50 disabled:bg-gray-400 transition-colors"
              >
                Confirm Lock
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}