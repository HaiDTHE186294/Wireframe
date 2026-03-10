import { useState, Fragment } from "react";
import { Search, Plus, Eye, Edit, ArrowLeft, Ban, CheckCircle, ChevronRight, X, AlertTriangle } from "lucide-react";

// --- INTERFACES ---
type CategoryStatus = "Active" | "Disabled";

interface Category {
  id: string;
  parentId: string | null; // Cập nhật hỗ trợ Category Cha-Con
  name: string;
  description: string;
  status: CategoryStatus;
  itemCount: number;
  created_at: string;
}

export function CategoryManagement() {
  // --- STATES ---
  const [currentView, setCurrentView] = useState<"list" | "detail" | "form">("list");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- MODAL STATES ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [catToToggle, setCatToToggle] = useState<Category | null>(null);

  // --- MOCK DATA ---
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "CAT-001", parentId: null, name: "Roasted Coffee Beans", description: "All variants of roasted coffee ready for sale.",
      status: "Active", itemCount: 24, created_at: "2025-11-01",
    },
    {
      id: "CAT-001-A", parentId: "CAT-001", name: "Single Origin", description: "Single origin roasted beans.",
      status: "Active", itemCount: 10, created_at: "2025-11-02",
    },
    {
      id: "CAT-001-B", parentId: "CAT-001", name: "Espresso Blends", description: "Blends specifically for espresso.",
      status: "Active", itemCount: 14, created_at: "2025-11-03",
    },
    {
      id: "CAT-002", parentId: null, name: "Green Coffee Beans", description: "Raw materials for production.",
      status: "Active", itemCount: 8, created_at: "2025-11-02",
    },
    {
      id: "CAT-003", parentId: null, name: "Brewing Equipment", description: "Phin filters, V60, scales, and grinders.",
      status: "Disabled", itemCount: 0, created_at: "2025-12-10",
    },
  ]);

  // --- FORM STATE ---
  const initialFormState: Partial<Category> = {
    name: "", description: "", parentId: "", status: "Disabled" // Mặc định là Disabled khi tạo mới
  };
  const [formData, setFormData] = useState<Partial<Category>>(initialFormState);

  // --- HANDLERS ---
  const handleOpenList = () => {
    setCurrentView("list");
    setSelectedCategory(null);
  };

  const handleOpenDetail = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView("detail");
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData(initialFormState);
    setCurrentView("form");
  };

  const handleOpenEdit = (category: Category) => {
    setIsEditing(true);
    setFormData({ ...category, parentId: category.parentId || "" });
    setCurrentView("form");
  };

  // Logic Popup Toggle
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

  const handleSaveCategory = () => {
    if (!formData.name?.trim()) {
      alert("Category name is required.");
      return;
    }

    const parentToSave = formData.parentId === "" ? null : formData.parentId;

    if (isEditing) {
      setCategories(categories.map(cat => 
        cat.id === formData.id ? { ...cat, ...formData, parentId: parentToSave } as Category : cat
      ));
    } else {
      const newCategory: Category = {
        ...formData as Category,
        parentId: parentToSave,
        id: `CAT-${String(categories.length + 1).padStart(3, "0")}`,
        itemCount: 0,
        status: "Disabled", // Bắt buộc Disabled khi mới tạo
        created_at: new Date().toISOString().split("T")[0]
      };
      setCategories([...categories, newCategory]); // Để category mới lên đầu hoặc dưới cùng tùy logic
    }
    handleOpenList();
  };

  // Helper để lấy tên Category Cha
  const getParentName = (parentId: string | null) => {
    if (!parentId) return "None (Root)";
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  // --- TREE RENDER LOGIC ---
  const renderCategoryRow = (cat: Category, level: number = 0) => {
    const isMatchedSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            cat.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Nếu đang search và không match, thì ẩn đi (trừ khi con của nó match - logic này đơn giản hóa để hiển thị phẳng khi search)
    if (searchTerm && !isMatchedSearch) return null;

    const indentStyle = { paddingLeft: `${(level * 24) + 12}px` };

    return (
      <tr key={cat.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <td className="py-3 border-r border-black font-mono text-sm font-bold" style={indentStyle}>
          <div className="flex items-center gap-2">
            {level > 0 && <ChevronRight size={14} className="text-gray-400" />}
            {cat.id}
          </div>
        </td>
        <td className="p-3 border-r border-black text-sm font-bold">{cat.name}</td>
        <td className="p-3 border-r border-black text-sm text-gray-600 max-w-xs truncate">{cat.description || "-"}</td>
        <td className="p-3 border-r border-black text-sm font-mono text-center">{cat.itemCount}</td>
        <td className="p-3 border-r border-black">
          <span className={`px-2 py-1 border text-xs flex items-center gap-1 w-fit ${cat.status === 'Active' ? 'border-black bg-white text-black' : 'border-gray-400 bg-gray-100 text-gray-500'}`}>
            {cat.status === 'Active' ? <CheckCircle size={10}/> : <Ban size={10}/>}
            {cat.status}
          </span>
        </td>
        <td className="p-3 text-center">
          <div className="flex justify-center gap-2">
            <button onClick={() => handleOpenDetail(cat)} className="p-1.5 border border-black bg-white hover:bg-gray-100" title="View Details">
              <Eye size={14} />
            </button>
            <button onClick={() => handleOpenEdit(cat)} className="p-1.5 border border-black bg-white hover:bg-gray-100" title="Edit Category">
              <Edit size={14} />
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
    );
  };

  // Hàm đệ quy xây dựng cây hiển thị
  const renderCategoryTree = (parentId: string | null = null, level: number = 0) => {
    return categories
      .filter(c => c.parentId === parentId)
      .map(c => (
        <Fragment key={c.id}>
          {renderCategoryRow(c, level)}
          {!searchTerm && renderCategoryTree(c.id, level + 1)}
        </Fragment>
      ));
  };


  // ==========================================
  // VIEW: LIST
  // ==========================================
  if (currentView === "list") {
    return (
      <div className="bg-white text-black pb-10 relative">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-black">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter">Category Management</h1>
            <p className="text-sm text-gray-600 mt-1 uppercase tracking-widest font-bold">Catalog Hierarchy & Structure</p>
          </div>
          <button 
            onClick={handleOpenCreate} 
            className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 text-sm font-bold uppercase flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> New Category
          </button>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search category name or ID (flattens tree)..." 
              className="w-full pl-9 pr-4 py-2 border border-black text-sm font-bold uppercase placeholder:font-normal outline-none focus:ring-1 focus:ring-black"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="border border-black bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black bg-gray-50">
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black w-48">Category ID</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black">Name</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black">Description</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black text-center w-24">Items</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider border-r border-black w-32">Status</th>
                <th className="p-3 text-xs font-bold uppercase tracking-wider text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-gray-500">No categories found.</td></tr>
              ) : (
                searchTerm 
                  // Khi có từ khóa tìm kiếm, hiển thị danh sách phẳng (không theo cây)
                  ? categories.map(c => renderCategoryRow(c, 0)) 
                  // Khi không có từ khóa, đệ quy vẽ cây
                  : renderCategoryTree(null, 0)
              )}
            </tbody>
          </table>
        </div>

        {/* --- MODAL: CONFIRM TOGGLE STATUS --- */}
        {showConfirmModal && catToToggle && (
          <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmModal(false)}>
            <div className="bg-white border-2 border-black p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4 border-b border-black pb-4">
                <AlertTriangle size={24} className={catToToggle.status === 'Active' ? "text-black" : "text-black"} />
                <h2 className="font-black text-lg uppercase tracking-tighter">Confirm Action</h2>
              </div>
              
              <div className="mb-6">
                <p className="text-sm font-bold mb-2">
                  Are you sure you want to <span className="uppercase underline">{catToToggle.status === 'Active' ? 'Disable' : 'Activate'}</span> this category?
                </p>
                <div className="p-3 border border-black bg-gray-50 font-mono text-sm">
                  {catToToggle.id} - {catToToggle.name}
                </div>
                {catToToggle.status === 'Active' && (
                  <p className="text-xs text-gray-500 mt-3">
                    Disabling this will hide it from product creation menus. Existing products will not be deleted but may lose category filtering.
                  </p>
                )}
                {catToToggle.status === 'Disabled' && (
                  <p className="text-xs text-gray-500 mt-3">
                    Activating this will make it available for assigning to new products or materials.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black">
                <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border border-black font-bold uppercase text-xs hover:bg-gray-100 transition-colors">Cancel</button>
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
  // VIEW: DETAIL
  // ==========================================
  if (currentView === "detail" && selectedCategory) {
    return (
      <div className="bg-white text-black pb-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-black">
          <div className="flex items-center gap-4">
            <button onClick={handleOpenList} className="p-2 border border-black hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tighter">Category Details</h1>
              <p className="text-sm font-mono text-gray-600 mt-1 uppercase">ID: {selectedCategory.id}</p>
            </div>
          </div>
          <button onClick={() => handleOpenEdit(selectedCategory)} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 text-sm flex items-center gap-2 font-bold uppercase">
            <Edit size={14} /> Edit Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border border-black p-6 bg-white space-y-6">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 mb-1">Name</p>
                <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
              </div>
              <span className={`px-3 py-1 border text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${selectedCategory.status === 'Active' ? 'border-black bg-black text-white' : 'border-gray-400 bg-gray-100 text-gray-500'}`}>
                {selectedCategory.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500 mb-1">Parent Category</p>
                <p className="text-sm font-mono font-bold bg-gray-50 inline-block px-2 border border-black">
                  {getParentName(selectedCategory.parentId)}
                </p>
              </div>
              <div>
                 <p className="text-xs font-bold uppercase text-gray-500 mb-1">Created Date</p>
                 <p className="text-sm font-mono">{selectedCategory.created_at}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-gray-500 mb-1">Description</p>
              <p className="text-sm bg-gray-50 p-4 border border-black min-h-[80px]">
                {selectedCategory.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="col-span-1 border border-black p-6 bg-gray-50 flex flex-col justify-center items-center text-center">
             <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center bg-white mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-2xl font-mono font-black">{selectedCategory.itemCount}</span>
             </div>
             <h3 className="font-black uppercase tracking-tighter text-sm">Linked Items</h3>
             <p className="text-xs font-bold text-gray-500 mt-2">
               Products or materials currently assigned to this node.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: FORM (ADD / UPDATE)
  // ==========================================
  if (currentView === "form") {
    // Lọc bỏ chính nó và con của nó khỏi danh sách Parent hợp lệ (Tránh vòng lặp vô hạn)
    const validParents = categories.filter(c => c.id !== formData.id);

    return (
      <div className="bg-white text-black pb-10">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-black">
          <button onClick={handleOpenList} className="p-2 border border-black hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter">
              {isEditing ? "Update Category Data" : "Create New Category"}
            </h1>
            <p className="text-sm text-gray-600 mt-1 uppercase font-bold tracking-widest">
              {isEditing ? "Modify existing attributes" : "New items default to Disabled status"}
            </p>
          </div>
        </div>

        <div className="border border-black bg-white p-6 md:p-8 max-w-2xl">
          <div className="space-y-6">
            
            {isEditing && (
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category ID</label>
                <input 
                  type="text" value={formData.id} disabled 
                  className="w-full p-2 border border-black text-sm bg-gray-100 font-mono cursor-not-allowed" 
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Category Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="e.g., Roasted Coffee Beans"
                className="w-full p-2 border border-black text-sm font-bold outline-none focus:ring-1 focus:ring-black" 
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Parent Category</label>
              <select 
                value={formData.parentId || ""}
                onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                className="w-full p-2 border border-black text-sm font-bold uppercase outline-none focus:ring-1 focus:ring-black bg-white"
              >
                <option value="">-- No Parent (Root Level) --</option>
                {validParents.map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1 font-bold">Select a parent to create a sub-category hierarchy.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Description</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Describe the items that belong in this category..."
                className="w-full p-2 border border-black text-sm h-32 outline-none focus:ring-1 focus:ring-black resize-none" 
              />
            </div>

            {/* STATUS đã bị loại bỏ khỏi Form. Update/Create đều xử lý ngoài List */}
            {!isEditing && (
              <div className="p-3 border border-black bg-gray-50 flex items-start gap-2">
                 <AlertTriangle size={16} className="mt-0.5" />
                 <p className="text-xs font-bold">New categories are created with a <span className="uppercase underline">Disabled</span> status by default. You must explicitly activate them from the Category List after creation.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-black">
            <button 
              onClick={handleOpenList} 
              className="px-6 py-2 border border-black bg-white hover:bg-gray-100 text-sm font-bold uppercase transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveCategory} 
              className="px-8 py-2 border border-black bg-black text-white hover:invert text-sm font-bold uppercase transition-all"
            >
              {isEditing ? "Save Changes" : "Create Node"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}