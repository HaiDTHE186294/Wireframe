import { useState } from "react";
import { Search, Plus, Eye, Edit, Ban, ArrowLeft, CheckCircle, Clock, AlertCircle } from "lucide-react";

// --- INTERFACES ---
type DiscountType = "Percentage" | "Fixed Amount";
type PromoStatus = "Active" | "Upcoming" | "Expired" | "Disabled";

interface Promotion {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  status: PromoStatus;
  description: string;
}

export function PromotionManagement() {
  // --- STATES ---
  const [currentView, setCurrentView] = useState<"list" | "detail" | "form">("list");
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // List States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // --- MOCK DATA ---
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: "PRM-001", code: "WELCOME2026", name: "New Year Welcome Discount",
      type: "Percentage", value: 10, startDate: "2026-01-01", endDate: "2026-12-31",
      minOrderValue: 500000, maxDiscountAmount: 100000, usageLimit: 1000, usedCount: 145,
      status: "Active", description: "10% off for all orders above 500k in 2026."
    },
    {
      id: "PRM-002", code: "B2BSUMMER", name: "Wholesale Summer Special",
      type: "Fixed Amount", value: 500000, startDate: "2026-05-01", endDate: "2026-08-31",
      minOrderValue: 10000000, usageLimit: 50, usedCount: 0,
      status: "Upcoming", description: "Flat 500k discount for B2B orders over 10M."
    },
    {
      id: "PRM-003", code: "FLASHCOFFEE", name: "Weekend Flash Sale",
      type: "Percentage", value: 20, startDate: "2026-02-01", endDate: "2026-02-02",
      minOrderValue: 200000, maxDiscountAmount: 50000, usedCount: 300,
      status: "Expired", description: "Quick weekend flash sale to clear old roast batches."
    },
    {
      id: "PRM-004", code: "VIPONLY", name: "VIP Customer Rebate",
      type: "Percentage", value: 15, startDate: "2026-01-01", endDate: "2026-06-30",
      minOrderValue: 0, maxDiscountAmount: 200000, usedCount: 10,
      status: "Disabled", description: "Disabled due to pricing policy change."
    }
  ]);

  // --- FORM STATE ---
  const initialFormState: Partial<Promotion> = {
    code: "", name: "", type: "Percentage", value: 0, startDate: "", endDate: "", 
    minOrderValue: 0, maxDiscountAmount: 0, usageLimit: 0, description: ""
  };
  const [formData, setFormData] = useState<Partial<Promotion>>(initialFormState);

  // --- HANDLERS ---
  const handleOpenList = () => {
    setCurrentView("list");
    setSelectedPromo(null);
  };

  const handleOpenDetail = (promo: Promotion) => {
    setSelectedPromo(promo);
    setCurrentView("detail");
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setCurrentView("form");
  };

  const handleOpenEdit = (promo: Promotion) => {
    setIsEditing(true);
    setFormData(promo);
    setCurrentView("form");
  };

  const handleToggleDisable = (id: string) => {
    setPromotions(promotions.map(p => {
      if (p.id === id) {
        // Simple toggle logic. Real app would recalculate based on dates if enabled.
        return { ...p, status: p.status === "Disabled" ? "Active" : "Disabled" };
      }
      return p;
    }));
  };

  const handleSavePromo = () => {
    if (!formData.code || !formData.name || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields.");
      return;
    }

    if (isEditing) {
      setPromotions(promotions.map(p => p.id === formData.id ? { ...p, ...formData } as Promotion : p));
    } else {
      const newPromo: Promotion = {
        ...formData as Promotion,
        id: `PRM-${String(promotions.length + 1).padStart(3, "0")}`,
        usedCount: 0,
        status: "Active" // Simplified for mock
      };
      setPromotions([newPromo, ...promotions]);
    }
    handleOpenList();
  };

  // --- RENDER HELPERS ---
  const getStatusBadge = (status: PromoStatus) => {
    switch (status) {
      case "Active": return <span className="px-2 py-0.5 border border-black bg-black text-white text-xs flex items-center gap-1 w-fit"><CheckCircle size={10} /> Active</span>;
      case "Upcoming": return <span className="px-2 py-0.5 border border-black bg-white text-black text-xs flex items-center gap-1 w-fit"><Clock size={10} /> Upcoming</span>;
      case "Expired": return <span className="px-2 py-0.5 border border-gray-400 bg-gray-100 text-gray-500 text-xs w-fit">Expired</span>;
      case "Disabled": return <span className="px-2 py-0.5 border border-red-500 bg-white text-red-600 text-xs flex items-center gap-1 w-fit"><AlertCircle size={10} /> Disabled</span>;
    }
  };

  // ==========================================
  // VIEW: LIST
  // ==========================================
  if (currentView === "list") {
    const filteredList = promotions.filter(p => 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "" || p.status === statusFilter)
    );

    return (
      <div className="bg-white text-black pb-10">
        <div className="flex justify-between items-end mb-6 pb-4 border-b border-black">
          <div>
            <h1 className="text-xl font-bold">Promotion Campaigns</h1>
            <p className="text-sm text-gray-600 mt-1">Manage discount codes and marketing rules</p>
          </div>
          <button onClick={handleOpenCreate} className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 text-sm flex items-center gap-2 transition-colors">
            <Plus size={16} /> New Promotion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" placeholder="Search by Campaign Name or Code..." 
              className="w-full pl-9 pr-4 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border border-black px-3 py-2 text-sm outline-none bg-white"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Expired">Expired</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>

        <div className="border border-black bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black bg-gray-50">
                <th className="p-3 text-sm font-bold border-r border-black w-32">Promo Code</th>
                <th className="p-3 text-sm font-bold border-r border-black">Campaign Name</th>
                <th className="p-3 text-sm font-bold border-r border-black">Discount</th>
                <th className="p-3 text-sm font-bold border-r border-black">Validity Period</th>
                <th className="p-3 text-sm font-bold border-r border-black text-center">Usage</th>
                <th className="p-3 text-sm font-bold border-r border-black">Status</th>
                <th className="p-3 text-sm font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-gray-500">No promotions found.</td></tr>
              ) : (
                filteredList.map((promo) => (
                  <tr key={promo.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-r border-black font-mono font-bold text-sm">{promo.code}</td>
                    <td className="p-3 border-r border-black text-sm">
                      {promo.name}
                      <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate">{promo.description}</p>
                    </td>
                    <td className="p-3 border-r border-black text-sm font-mono">
                      {promo.type === "Percentage" ? `${promo.value}%` : `${promo.value.toLocaleString()} ₫`}
                    </td>
                    <td className="p-3 border-r border-black text-xs font-mono">
                      <div>{promo.startDate}</div>
                      <div className="text-gray-400">to {promo.endDate}</div>
                    </td>
                    <td className="p-3 border-r border-black text-sm text-center font-mono">
                      {promo.usedCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : '(∞)'}
                    </td>
                    <td className="p-3 border-r border-black">
                      {getStatusBadge(promo.status)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenDetail(promo)} className="p-1.5 border border-black bg-white hover:bg-gray-100" title="View Details">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleOpenEdit(promo)} className="p-1.5 border border-black bg-white hover:bg-gray-100" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleToggleDisable(promo.id)} className="p-1.5 border border-black bg-white hover:bg-gray-100" title={promo.status === 'Disabled' ? "Enable" : "Disable"}>
                          <Ban size={14} className={promo.status === 'Disabled' ? "text-gray-300" : "text-red-600"} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: DETAIL
  // ==========================================
  if (currentView === "detail" && selectedPromo) {
    return (
      <div className="bg-white text-black pb-10">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-black">
          <button onClick={handleOpenList} className="p-2 border border-black hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-3">
              Campaign Details {getStatusBadge(selectedPromo.status)}
            </h1>
            <p className="text-sm text-gray-600 mt-1">ID: {selectedPromo.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="border border-black p-6 bg-gray-50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Campaign Name</p>
                  <h2 className="text-2xl font-bold">{selectedPromo.name}</h2>
                  <p className="text-sm mt-2">{selectedPromo.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Promo Code</p>
                  <span className="inline-block border-2 border-black border-dashed px-4 py-2 font-mono font-bold text-xl bg-white tracking-widest">
                    {selectedPromo.code}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-black pt-6">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Discount Value</p>
                  <p className="text-lg font-mono font-bold">
                    {selectedPromo.type === "Percentage" ? `${selectedPromo.value}% OFF` : `${selectedPromo.value.toLocaleString()} ₫ OFF`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Validity Period</p>
                  <p className="text-sm font-mono">{selectedPromo.startDate} to {selectedPromo.endDate}</p>
                </div>
              </div>
            </div>

            <div className="border border-black p-6 bg-white">
              <h3 className="text-sm font-bold uppercase border-b border-black pb-2 mb-4">Application Rules</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="flex justify-between pr-4 border-r border-gray-200">
                  <span className="text-gray-500">Minimum Order Value:</span>
                  <span className="font-mono font-bold">{selectedPromo.minOrderValue.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between pl-4">
                  <span className="text-gray-500">Max Discount Amount:</span>
                  <span className="font-mono font-bold">
                    {selectedPromo.type === "Percentage" && selectedPromo.maxDiscountAmount 
                      ? `${selectedPromo.maxDiscountAmount.toLocaleString()} ₫` 
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between pr-4 border-r border-gray-200">
                  <span className="text-gray-500">Total Usage Limit:</span>
                  <span className="font-mono">{selectedPromo.usageLimit ? selectedPromo.usageLimit : 'Unlimited'}</span>
                </div>
                <div className="flex justify-between pl-4">
                  <span className="text-gray-500">Customer Limit:</span>
                  <span className="font-mono">1 per customer (Default)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="col-span-1">
            <div className="border border-black p-6 bg-black text-white h-full">
              <h3 className="text-sm font-bold uppercase border-b border-gray-700 pb-2 mb-6">Performance Stats</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Times Used</p>
                  <p className="text-4xl font-mono font-bold">{selectedPromo.usedCount}</p>
                </div>
                {selectedPromo.usageLimit && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Remaining Quota</p>
                    <p className="text-2xl font-mono">{selectedPromo.usageLimit - selectedPromo.usedCount}</p>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-800 h-2 mt-2 border border-gray-600">
                      <div 
                        className="bg-white h-full" 
                        style={{ width: `${(selectedPromo.usedCount / selectedPromo.usageLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="pt-6 border-t border-gray-700">
                  <button onClick={() => handleOpenEdit(selectedPromo)} className="w-full py-2 bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors">
                    Edit Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: FORM (ADD / UPDATE)
  // ==========================================
  if (currentView === "form") {
    return (
      <div className="bg-white text-black pb-10">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-black">
          <button onClick={handleOpenList} className="p-2 border border-black hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">
              {isEditing ? "Update Promotion Rules" : "Create New Promotion"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">Define discount mechanics and constraints</p>
          </div>
        </div>

        <div className="border border-black bg-white p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Left Column: Basic Info */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold uppercase border-b border-black pb-2">01. General Information</h3>
              
              <div>
                <label className="block text-sm font-bold mb-1">Campaign Name *</label>
                <input 
                  type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g., Summer Flash Sale"
                  className="w-full p-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Promo Code *</label>
                <input 
                  type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="e.g., SUMMER20"
                  className="w-full p-2 border border-black text-sm font-mono uppercase outline-none focus:ring-1 focus:ring-black" 
                />
                <p className="text-xs text-gray-500 mt-1">Code customers will enter at checkout. Must be unique.</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea 
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Internal notes or public description..."
                  className="w-full p-2 border border-black text-sm h-24 outline-none focus:ring-1 focus:ring-black" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Start Date *</label>
                  <input 
                    type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                    className="w-full p-2 border border-black text-sm font-mono outline-none focus:ring-1 focus:ring-black" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">End Date *</label>
                  <input 
                    type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                    className="w-full p-2 border border-black text-sm font-mono outline-none focus:ring-1 focus:ring-black" 
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Rules */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold uppercase border-b border-black pb-2">02. Discount Logic & Limits</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Discount Type *</label>
                  <select 
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as DiscountType})} 
                    className="w-full p-2 border border-black text-sm bg-white outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (₫)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Discount Value *</label>
                  <input 
                    type="number" value={formData.value || ""} onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} 
                    placeholder={formData.type === "Percentage" ? "e.g., 15" : "e.g., 50000"}
                    className="w-full p-2 border border-black text-sm font-mono outline-none focus:ring-1 focus:ring-black" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Minimum Order Value (₫)</label>
                <input 
                  type="number" value={formData.minOrderValue || ""} onChange={(e) => setFormData({...formData, minOrderValue: Number(e.target.value)})} 
                  placeholder="0 for no minimum"
                  className="w-full p-2 border border-black text-sm font-mono outline-none focus:ring-1 focus:ring-black" 
                />
              </div>

              {formData.type === "Percentage" && (
                <div>
                  <label className="block text-sm font-bold mb-1">Maximum Discount Amount (₫)</label>
                  <input 
                    type="number" value={formData.maxDiscountAmount || ""} onChange={(e) => setFormData({...formData, maxDiscountAmount: Number(e.target.value)})} 
                    placeholder="Leave empty for unlimited"
                    className="w-full p-2 border border-black text-sm font-mono outline-none focus:ring-1 focus:ring-black" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Cap the discount amount for percentage-based promos.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1">Total Usage Limit</label>
                <input 
                  type="number" value={formData.usageLimit || ""} onChange={(e) => setFormData({...formData, usageLimit: Number(e.target.value)})} 
                  placeholder="Leave empty for unlimited"
                  className="w-full p-2 border border-black text-sm font-mono outline-none focus:ring-1 focus:ring-black" 
                />
                <p className="text-xs text-gray-500 mt-1">How many times this code can be used across all customers.</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-black">
            <button onClick={handleOpenList} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 text-sm font-bold transition-colors">
              Cancel
            </button>
            <button onClick={handleSavePromo} className="px-8 py-2 border border-black bg-black text-white hover:bg-gray-800 text-sm font-bold transition-colors">
              {isEditing ? "Save Changes" : "Create Promotion"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}