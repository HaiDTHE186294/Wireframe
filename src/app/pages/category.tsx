import { useState } from "react";
import { Search, Plus, Eye, Edit, ArrowLeft, Ban, CheckCircle, AlertTriangle, Filter } from "lucide-react";
import { Pagination } from "../components/Pagination";

// --- INTERFACES ---
type CategoryStatus = "Active" | "Disabled";

interface Category {
  id: string;
  parentId: string | null; // VẪN GIỮ NGUYÊN DB SCHEMA
  name: string;
  description: string;
  status: CategoryStatus;
  itemCount: number;
  created_at: string;
}

// 4 Danh mục gốc cố định (Đóng vai trò như Type Label)
const ROOT_CATEGORIES = [
  { id: "ROOT-BEANS", name: "BEANS (HẠT)" },
  { id: "ROOT-POWDER", name: "POWDER (BỘT)" },
  { id: "ROOT-BLEND", name: "BLENDS (PHỐI TRỘN)" },
  { id: "ROOT-OTHER", name: "OTHERS (KHÁC)" },
];

export function CategoryManagement() {
  // --- STATES ---
  const [currentView, setCurrentView] = useState<"list" | "add" | "detail">("list");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- MODAL STATES ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [catToToggle, setCatToToggle] = useState<Category | null>(null);

  // --- MOCK DATA ---
  const [categories, setCategories] = useState<Category[]>([
    // Database Seeds (Roots) - Sẽ bị ẩn trên UI
    { id: "ROOT-BEANS", parentId: null, name: "BEANS", description: "", status: "Active", itemCount: 0, created_at: "2025-01-01" },
    { id: "ROOT-POWDER", parentId: null, name: "POWDER", description: "", status: "Active", itemCount: 0, created_at: "2025-01-01" },
    { id: "ROOT-BLEND", parentId: null, name: "BLENDS", description: "", status: "Active", itemCount: 0, created_at: "2025-01-01" },
    { id: "ROOT-OTHER", parentId: null, name: "OTHERS", description: "", status: "Active", itemCount: 0, created_at: "2025-01-01" },

    // Actual Categories (Childs) - Các danh mục thực tế
    {
      id: "CAT-001", parentId: "ROOT-BEANS", name: "Premium Arabica Beans", description: "High-quality Arabica roasted beans.",
      status: "Active", itemCount: 24, created_at: "2025-11-01",
    },
    {
      id: "CAT-002", parentId: "ROOT-BLEND", name: "Espresso Master Blends", description: "Special blends designed for espresso machines.",
      status: "Active", itemCount: 10, created_at: "2025-11-02",
    },
    {
      id: "CAT-003", parentId: "ROOT-POWDER", name: "Fine Ground Coffee", description: "Finely ground coffee for Phin and filter brewing.",
      status: "Active", itemCount: 14, created_at: "2025-11-03",
    },
    {
      id: "CAT-004", parentId: "ROOT-BEANS", name: "Green Coffee Beans (Raw)", description: "Raw materials for roasting.",
      status: "Active", itemCount: 8, created_at: "2025-11-02",
    },
    {
      id: "CAT-005", parentId: "ROOT-OTHER", name: "Brewing Equipment", description: "Phin filters, V60, scales, and grinders.",
      status: "Disabled", itemCount: 0, created_at: "2025-12-10",
    },
  ]);

  // --- FORM STATE ---
  const initialFormState: Partial<Category> = {
    name: "", description: "", parentId: "ROOT-BEANS", status: "Disabled"
  };
  const [formData, setFormData] = useState<Partial<Category>>(initialFormState);

  // --- HANDLERS ---
  const handleOpenList = () => {
    setCurrentView("list");
    setSelectedCategory(null);
    setIsEditable(false);
  };

  const handleOpenDetail = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ ...category });
    setIsEditable(false);
    setCurrentView("detail");
  };

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsEditable(true);
    setCurrentView("add");
  };

  const handleCancelForm = () => {
    if (currentView === "detail" && isEditable && selectedCategory) {
      setFormData({ ...selectedCategory });
      setIsEditable(false);
    } else {
      handleOpenList();
    }
  };

  const requestToggleStatus = (category: Category) => {
    setCatToToggle(category);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = () => {
    if (catToToggle) {
      setCategories(categories.map(cat => {
        if (cat.id === catToToggle.id) {
          return { ...cat, status: cat.status === "Active" ? "Disabled" : "Active" };
        }
        return cat;
      }));
    }
    setShowConfirmModal(false);
    setCatToToggle(null);
  };

  // Tạo ID mới cho Child category
  const generateNewId = () => {
    const childCats = categories.filter(c => c.parentId !== null);
    if (childCats.length === 0) return "CAT-001";
    const maxSuffix = childCats.reduce((max, c) => {
      const parts = c.id.split('-');
      const lastPart = parseInt(parts[parts.length - 1], 10);
      return !isNaN(lastPart) && lastPart > max ? lastPart : max;
    }, 0);
    return `CAT-${String(maxSuffix + 1).padStart(3, "0")}`;
  };

  const handleSaveCategory = () => {
    if (!formData.name?.trim()) {
      alert("Category name is required.");
      return;
    }

    if (currentView === "detail") {
      setCategories(categories.map(cat => 
        cat.id === formData.id ? { ...cat, ...formData } as Category : cat
      ));
    } else {
      const newCategory: Category = {
        ...formData as Category,
        id: generateNewId(),
        itemCount: 0,
        status: "Disabled",
        created_at: new Date().toISOString().split("T")[0]
      };
      setCategories([...categories, newCategory]); // Add to end (UI will handle sorting if needed)
    }
    handleOpenList();
  };

  // --- UI HELPERS FOR PARENT (LABEL) ---
  const getRootBadgeStyle = (parentId: string | null) => {
    switch (parentId) {
      case "ROOT-BEANS": return "border-black bg-black text-white";
      case "ROOT-POWDER": return "border-black border-dashed bg-white text-black";
      case "ROOT-BLEND": return "border-black border-2 bg-gray-100 text-black font-black";
      default: return "border-gray-400 bg-white text-gray-500";
    }
  };

  const getRootName = (parentId: string | null) => {
    const root = ROOT_CATEGORIES.find(r => r.id === parentId);
    return root ? root.name.split(" ")[0] : "UNKNOWN"; 
  };

  // ==========================================
  // VIEW: LIST
  // ==========================================
  if (currentView === "list") {
    // Flatten List Logic: Chỉ lấy các danh mục con (parentId !== null)
    const displayCategories = categories.filter(c => c.parentId !== null);

    const filteredCategories = displayCategories.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === "ALL" || c.parentId === typeFilter;
      return matchSearch && matchType;
    });

    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
    const paginatedData = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
      <div className="bg-white text-black pb-10 relative">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Category Management</h1>
            <p className="text-sm text-gray-600 mt-1 uppercase tracking-widest font-bold">Product Labeling & Classification</p>
          </div>
          <button 
            onClick={handleOpenCreate} 
            className="px-4 py-2 border border-black bg-black text-white hover:invert text-sm font-bold uppercase flex items-center gap-2 transition-all"
          >
            <Plus size={16} /> New Category
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex gap-4 p-4 border border-black bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH CATEGORY NAME OR ID..." 
              className="w-full pl-9 pr-4 py-2 border border-black text-sm font-bold uppercase placeholder:font-normal outline-none focus:ring-1 focus:ring-black bg-white"
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select 
              className="border border-black px-3 py-2 text-sm font-bold uppercase outline-none bg-white cursor-pointer"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="ALL">ALL LABELS</option>
              {ROOT_CATEGORIES.map(root => (
                <option key={root.id} value={root.id}>{root.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-black bg-white mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black bg-gray-100">
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black w-32">Category ID</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black">Name</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black w-32 text-center">Type Label</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black">Description</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black text-center w-24">Items</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black text-center w-32">Status</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-sm font-bold uppercase tracking-widest text-gray-500">NO_DATA_FOUND</td></tr>
              ) : (
                paginatedData.map(cat => (
                  <tr key={cat.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-r border-black font-mono text-sm font-bold">{cat.id}</td>
                    <td className="p-3 border-r border-black text-sm font-bold">{cat.name}</td>
                    <td className="p-3 border-r border-black text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${getRootBadgeStyle(cat.parentId)}`}>
                        {getRootName(cat.parentId)}
                      </span>
                    </td>
                    <td className="p-3 border-r border-black text-sm text-gray-600 max-w-xs truncate">{cat.description || "-"}</td>
                    <td className="p-3 border-r border-black text-sm font-mono text-center">{cat.itemCount}</td>
                    <td className="p-3 border-r border-black">
                      <span className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-fit mx-auto ${cat.status === 'Active' ? 'border-black bg-black text-white' : 'border-gray-400 bg-gray-100 text-gray-500'}`}>
                        {cat.status === 'Active' ? <CheckCircle size={10}/> : <Ban size={10}/>}
                        {cat.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenDetail(cat)} className="p-1.5 border border-black bg-white hover:bg-gray-100" title="View/Edit Details">
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => requestToggleStatus(cat)} 
                          className={`p-1.5 border border-black bg-white hover:bg-gray-100 ${cat.status === 'Active' ? 'text-black' : 'text-gray-400'}`} 
                          title={cat.status === 'Active' ? "Disable Category" : "Activate Category"}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 border-t border-black pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredCategories.length}
          />
        </div>

        {/* --- MODAL: CONFIRM TOGGLE STATUS --- */}
        {showConfirmModal && catToToggle && (
          <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
            <div className="bg-white border-2 border-black p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-4">
                <AlertTriangle size={24} className="text-black" />
                <h2 className="font-black text-xl uppercase tracking-tighter">Confirm Action</h2>
              </div>
              
              <div className="mb-8">
                <p className="text-sm font-bold mb-3">
                  Are you sure you want to <span className="uppercase underline">{catToToggle.status === 'Active' ? 'Disable' : 'Activate'}</span> this category?
                </p>
                <div className="p-4 border border-black bg-gray-50 font-mono text-sm font-bold flex items-center justify-between">
                  <span>{catToToggle.id} - {catToToggle.name}</span>
                  <span className={`px-2 py-0.5 text-[10px] uppercase border ${getRootBadgeStyle(catToToggle.parentId)}`}>
                    {getRootName(catToToggle.parentId)}
                  </span>
                </div>
                {catToToggle.status === 'Active' && (
                  <p className="text-xs text-gray-500 mt-4">
                    Disabling this will hide it from product menus. Existing products will not be deleted but may lose category filtering.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black">
                <button onClick={() => setShowConfirmModal(false)} className="px-6 py-2 border border-black font-bold uppercase text-xs hover:bg-gray-100 transition-colors">Cancel</button>
                <button onClick={confirmToggleStatus} className="px-6 py-2 bg-black text-white border border-black font-bold uppercase text-xs hover:invert transition-all">
                  Yes, {catToToggle.status === 'Active' ? 'Disable' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: FORM (ADD / DETAIL COMBINED)
  // ==========================================
  if (currentView === "add" || currentView === "detail") {
    return (
      <div className="bg-white text-black pb-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              {currentView === "add" ? "Create New Category" : "Category Details"}
            </h1>
            {currentView === "detail" && !isEditable && (
              <button onClick={() => setIsEditable(true)} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors">
                <Edit size={14} /> Unlock Edit
              </button>
            )}
          </div>
          <button onClick={handleOpenList} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs transition-colors flex items-center gap-2">
            <ArrowLeft size={14}/> Back to List
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`border-2 border-black p-8 bg-white space-y-6 ${currentView === "add" ? "md:col-span-3 max-w-3xl" : "md:col-span-2"}`}>
            
            <div className="flex items-center justify-between border-b border-black pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Classification Data</h3>
              {currentView === "detail" && (
                <span className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-fit ${formData.status === 'Active' ? 'border-black bg-black text-white' : 'border-gray-400 bg-gray-100 text-gray-500'}`}>
                  {formData.status}
                </span>
              )}
            </div>

            {currentView === "detail" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category ID (Auto)</label>
                  <input 
                    type="text" value={formData.id} disabled 
                    className="w-full p-2 border border-black text-sm bg-gray-100 font-mono cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Created Date</label>
                  <input 
                    type="text" value={formData.created_at} disabled 
                    className="w-full p-2 border border-black text-sm bg-gray-100 font-mono cursor-not-allowed" 
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase mb-1">Category Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g., Premium Arabica Beans"
                  disabled={!isEditable}
                  className={`w-full p-2 border border-black text-sm font-bold outline-none focus:ring-1 focus:ring-black ${!isEditable ? 'bg-gray-100 opacity-80 cursor-not-allowed' : 'bg-white'}`} 
                  autoFocus={isEditable}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold uppercase mb-1">Type Label *</label>
                <select 
                  value={formData.parentId || ""}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                  disabled={!isEditable}
                  className={`w-full p-2 border border-black text-sm font-bold uppercase outline-none focus:ring-1 focus:ring-black ${!isEditable ? 'bg-gray-100 opacity-80 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
                >
                  {ROOT_CATEGORIES.map(root => (
                    <option key={root.id} value={root.id}>{root.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual Indicator of chosen type */}
            <div className="p-3 border border-black bg-gray-50 flex items-center gap-3">
              <span className="text-xs font-bold uppercase text-gray-500 tracking-widest">Preview Badge:</span>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border ${getRootBadgeStyle(formData.parentId || null)}`}>
                {getRootName(formData.parentId || null)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Description</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Briefly describe the physical form or characteristics of items in this category..."
                disabled={!isEditable}
                className={`w-full p-3 border border-black text-sm h-32 outline-none focus:ring-1 focus:ring-black resize-none ${!isEditable ? 'bg-gray-100 opacity-80 cursor-not-allowed' : 'bg-white'}`} 
              />
            </div>

            {currentView === "add" && (
              <div className="p-3 border border-black bg-gray-50 flex items-start gap-2 mt-4">
                 <AlertTriangle size={16} className="mt-0.5" />
                 <p className="text-xs font-bold">New categories are created with a <span className="uppercase underline">Disabled</span> status by default. You must explicitly activate them from the Category List after creation to make them visible.</p>
              </div>
            )}

            {/* Action Buttons */}
            {isEditable && (
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-black">
                <button 
                  onClick={handleCancelForm} 
                  className="px-6 py-2 border border-black bg-white hover:bg-gray-100 text-sm font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCategory} 
                  disabled={!formData.name}
                  className="px-8 py-2 border border-black bg-black text-white hover:invert text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {currentView === "add" ? "Create Label" : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {currentView === "detail" && selectedCategory && (
             <div className="col-span-1 border-2 border-black p-8 bg-gray-50 flex flex-col items-center h-fit">
                <h3 className="w-full text-sm font-black uppercase tracking-widest text-gray-500 mb-6 border-b border-black pb-2 text-center">Usage Stats</h3>
                <div className="w-24 h-24 border-4 border-black rounded-full flex items-center justify-center bg-white mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-3xl font-mono font-black">{selectedCategory.itemCount}</span>
                </div>
                <h3 className="font-black uppercase tracking-tighter text-base text-center">Linked Master Products</h3>
                <p className="text-xs font-bold text-gray-500 mt-2 text-center">
                  Total parent products currently utilizing this classification label.
                </p>
             </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}