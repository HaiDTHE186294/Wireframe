import { useState, useEffect } from "react";
import React from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Lock,
  Unlock,
  Search,
  Filter,
  Image as ImageIcon,
  AlertTriangle,
  Layers,
  X,
  Globe,
} from "lucide-react";
import { Pagination } from "../components/Pagination";

// 1. CẬP NHẬT INTERFACES KHỚP VỚI DATABASE
interface SensoryData {
  bitter: number;  // 1-10
  sweet: number;   // 1-10
  sour: number;    // 1-10
  body: number;    // 1-10
  caffein: number; // %
  flavor: string;  // Text
}

interface ProductBatch {
  batchId: string;
  quantity: number;
  costPrice: string;
  manufacturingDate: string;
  expiryDate: string;
}

interface Variant {
  sku: string;
  weight: string;
  form: string;
  salePrice: string;
  status: "Active" | "Inactive" | "Locked";
  batches: ProductBatch[];
}

interface ParentProduct {
  id: string;
  name: string;
  summary: string;
  story: string;
  category: string;
  metaTitle: string;
  metaDescription: string;
  thumbnailUrl?: string;
  imageUrls: string[];
  status: "Active" | "Inactive" | "Locked";
  variants: Variant[];
  sensoryData?: SensoryData;
}

type ViewMode = "LIST" | "ADD_PRODUCT" | "DETAIL_PRODUCT";

const defaultSensory: SensoryData = { bitter: 5, sweet: 5, sour: 5, body: 5, caffein: 0, flavor: "" };

export function ProductCatalog() {
  // --- STATES HIỂN THỊ UI ---
  const [viewMode, setViewMode] = useState<ViewMode>("LIST");
  const [isEditable, setIsEditable] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [expandedVariants, setExpandedVariants] = useState<string[]>([]);
  
  // --- STATES FORMS ---
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ParentProduct | null>(null);
  const [editingVariant, setEditingVariant] = useState<{ productId: string; variant: Variant | null }>({ productId: "", variant: null });
  const [currentProductId, setCurrentProductId] = useState<string>("");
  const [currentProductSensory, setCurrentProductSensory] = useState<SensoryData>(defaultSensory);

  // State tạm để nhập link ảnh vào mảng
  const [tempImageUrl, setTempImageUrl] = useState("");

  // --- STATES SEARCH, FILTER & PAGINATION ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterStockStatus, setFilterStockStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- MOCK DATA ĐÃ BỔ SUNG BATCH ---
  const [products, setProducts] = useState<ParentProduct[]>([
    {
      id: "PROD-001",
      name: "Signature Blend",
      summary: "Our signature coffee blend with balanced flavor profile",
      story: "<p>Crafted from the finest beans across Vietnam's highlands...</p>",
      category: "Premium Blends",
      metaTitle: "Signature Blend - Premium Vietnamese Coffee | Katak Coffee",
      metaDescription: "Experience our signature blend coffee with balanced aroma and rich taste",
      thumbnailUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100",
      imageUrls: [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200"
      ],
      status: "Active",
      variants: [
        {
          sku: "SIG-250-W",
          weight: "250g",
          form: "Whole Bean",
          salePrice: "180000",
          status: "Active",
          batches: [
            { batchId: "PB-202601-01", quantity: 50, costPrice: "120000", manufacturingDate: "2026-01-10", expiryDate: "2026-07-10" },
            { batchId: "PB-202602-05", quantity: 150, costPrice: "118000", manufacturingDate: "2026-02-15", expiryDate: "2026-08-15" }
          ]
        },
        {
          sku: "SIG-250-GP",
          weight: "250g",
          form: "Ground Phin",
          salePrice: "180000",
          status: "Active",
          batches: [
            { batchId: "PB-202601-02", quantity: 5, costPrice: "125000", manufacturingDate: "2026-01-12", expiryDate: "2026-07-12" }
          ]
        },
        {
          sku: "SIG-500-W",
          weight: "500g",
          form: "Whole Bean",
          salePrice: "340000",
          status: "Active",
          batches: []
        },
      ],
      sensoryData: { bitter: 3, sweet: 4, sour: 2, body: 4, caffein: 1.5, flavor: "Caramel, Chocolate" },
    },
    {
      id: "PROD-002",
      name: "Arabica Cầu Đất",
      summary: "Single-origin Arabica from Cầu Đất region",
      story: "<p>Sourced from the legendary Cầu Đất region...</p>",
      category: "Single Origin",
      metaTitle: "Arabica Cầu Đất - Single Origin Coffee | Katak Coffee",
      metaDescription: "Premium single-origin Arabica coffee from Cầu Đất highlands",
      status: "Locked",
      imageUrls: [],
      variants: [
        {
          sku: "ACD-250-W",
          weight: "250g",
          form: "Whole Bean",
          salePrice: "220000",
          status: "Active",
          batches: [
            { batchId: "PB-202512-99", quantity: 20, costPrice: "160000", manufacturingDate: "2025-12-01", expiryDate: "2026-06-01" }
          ]
        },
      ],
    },
  ]);

  // --- HELPER FUNCTIONS ---
  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const toggleVariant = (sku: string) => {
    setExpandedVariants(prev => prev.includes(sku) ? prev.filter(id => id !== sku) : [...prev, sku]);
  };

  const handleToggleProductStatus = (productId: string) => {
    setProducts(products.map(p => p.id === productId ? { ...p, status: p.status === "Locked" ? "Active" : "Locked" } : p));
  };

  const getVariantStockInfo = (batches: ProductBatch[]) => {
    const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
    let stockStatus = "In Stock";
    if (totalQuantity === 0) stockStatus = "Out of Stock";
    else if (totalQuantity <= 10) stockStatus = "Low Stock";
    return { totalQuantity, stockStatus };
  };

  // --- FORM STATES & HANDLERS ---
  const [newProduct, setNewProduct] = useState<ParentProduct>({
    id: "", name: "", summary: "", story: "", category: "", metaTitle: "", metaDescription: "", thumbnailUrl: "", imageUrls: [], status: "Active", variants: [],
  });

  const [newVariant, setNewVariant] = useState<Variant>({
    sku: "", weight: "", form: "", salePrice: "", status: "Active", batches: [],
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setCurrentProductSensory({ ...defaultSensory });
    setTempImageUrl("");
    setNewProduct({
      id: `PROD-${String(products.length + 1).padStart(3, "0")}`,
      name: "", summary: "", story: "", category: "", metaTitle: "", metaDescription: "", thumbnailUrl: "", imageUrls: [], status: "Active", variants: [],
    });
    setViewMode("ADD_PRODUCT");
    setIsEditable(true);
  };

  const handleDetailProduct = (product: ParentProduct) => {
    setEditingProduct(product);
    setCurrentProductSensory(product.sensoryData ? { ...product.sensoryData } : { ...defaultSensory });
    setTempImageUrl("");
    setNewProduct({ ...product, imageUrls: product.imageUrls || [] });
    setViewMode("DETAIL_PRODUCT");
    setIsEditable(false);
  };

  const handleAddGalleryImage = () => {
    if (tempImageUrl.trim()) {
      setNewProduct({ ...newProduct, imageUrls: [...newProduct.imageUrls, tempImageUrl.trim()] });
      setTempImageUrl("");
    }
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setNewProduct({ ...newProduct, imageUrls: newProduct.imageUrls.filter((_, index) => index !== indexToRemove) });
  };

  const handleSaveProduct = () => {
    const productToSave = { ...newProduct, sensoryData: currentProductSensory };
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? productToSave : p));
    } else {
      setProducts([...products, productToSave]);
    }
    setViewMode("LIST");
    setIsEditable(false);
  };

  const handleCancelProduct = () => {
    if (viewMode === 'DETAIL_PRODUCT' && isEditable && editingProduct) {
      setNewProduct({ ...editingProduct, imageUrls: editingProduct.imageUrls || [] });
      setCurrentProductSensory(editingProduct.sensoryData ? { ...editingProduct.sensoryData } : { ...defaultSensory });
      setIsEditable(false);
    } else {
      setViewMode("LIST");
      setIsEditable(false);
    }
  };

  // --- VARIANT HANDLERS (Giữ nguyên Modal cho Variant vì nó phụ thuộc Product) ---
  const handleAddVariant = (productId: string) => {
    setCurrentProductId(productId);
    setEditingVariant({ productId, variant: null });
    setNewVariant({ sku: "", weight: "", form: "", salePrice: "", status: "Active", batches: [] });
    setShowVariantForm(true);
  };

  const handleEditVariant = (productId: string, variant: Variant) => {
    setCurrentProductId(productId);
    setEditingVariant({ productId, variant });
    setNewVariant({ ...variant });
    setShowVariantForm(true);
  };

  const handleSaveVariant = () => {
    setProducts(products.map(p => {
      if (p.id === currentProductId) {
        if (editingVariant.variant) {
          return { ...p, variants: p.variants.map(v => v.sku === editingVariant.variant!.sku ? newVariant : v) };
        } else {
          return { ...p, variants: [...p.variants, newVariant] };
        }
      }
      return p;
    }));
    setShowVariantForm(false);
  };

  // --- LỌC DỮ LIỆU & PHÂN TRANG ---
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filterCategory, filterStatus, filterStockStatus]);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "" || p.category === filterCategory;
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    let matchStock = true;
    if (filterStockStatus !== "All") {
      matchStock = p.variants.some(v => {
        const { stockStatus } = getVariantStockInfo(v.batches);
        return stockStatus === filterStockStatus;
      });
    }
    return matchSearch && matchCat && matchStatus && matchStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="pb-10 bg-white text-black min-h-screen">
      
      {/* =========================================
         MÀN HÌNH 1: DANH SÁCH PRODUCT MASTER
      ========================================= */}
      {viewMode === "LIST" && (
        <>
          <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Product Catalog (Master)</h1>
              <p className="text-sm mt-1 font-bold text-gray-600 uppercase tracking-widest">Parent Products, Variant Configuration & Batch Tracking</p>
            </div>
            <button onClick={handleAddProduct} className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 flex items-center gap-2 text-sm font-bold uppercase">
              <Plus size={16} /> Add Parent Product
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 border border-black">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search products by name..."
                className="w-full pl-9 pr-3 py-2 border border-black text-sm outline-none bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="px-3 py-2 border border-black bg-white text-sm outline-none min-w-[150px] font-bold" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              <option value="Premium Blends">Premium Blends</option>
              <option value="Single Origin">Single Origin</option>
            </select>
            <select className="px-3 py-2 border border-black bg-white text-sm outline-none min-w-[150px] font-bold" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Parent Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Locked">Locked</option>
            </select>
            <select className="px-3 py-2 border border-black bg-white text-sm outline-none min-w-[150px] font-bold" value={filterStockStatus} onChange={(e) => setFilterStockStatus(e.target.value)}>
              <option value="All">All Stock Status</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            {currentProducts.length === 0 ? (
              <div className="p-8 text-center border border-black bg-gray-50 italic">No products found matching criteria.</div>
            ) : (
              currentProducts.map((product, index) => {
                const isExpanded = expandedProducts.includes(product.id);
                const isLocked = product.status === "Locked";
                const stt = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <div key={product.id} className={`border border-black transition-opacity ${isLocked ? "opacity-60 bg-gray-100" : "bg-white"}`}>
                    <div onClick={() => toggleProduct(product.id)} className="p-4 border-b border-black flex items-center justify-between cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <button className="p-1 border border-black bg-white">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <div className="w-8 h-8 flex items-center justify-center font-bold font-mono text-sm border border-black bg-white">{stt}</div>
                        <div className="w-12 h-12 border border-black flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                          {product.thumbnailUrl ? <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{product.name}</h3>
                            <span className={`text-[10px] px-2 py-0.5 border font-bold uppercase ${isLocked ? "border-red-600 text-red-600" : "border-green-600 text-green-600"}`}>
                              {product.status}
                            </span>
                          </div>
                          <p className="text-xs mt-1 uppercase text-gray-500 font-bold">ID: <span className="font-mono text-black">{product.id}</span> | Category: <span className="text-black">{product.category}</span></p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleToggleProductStatus(product.id); }} className={`px-2 py-1 border border-black hover:bg-gray-100 flex items-center gap-2 ${isLocked ? "bg-red-50" : "bg-white"}`} title={isLocked ? "Unlock Product" : "Lock Product"}>
                          {isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDetailProduct(product); }} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-2 uppercase font-bold text-xs">
                          <Eye size={14} /> Detail
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold uppercase text-xs tracking-wider">Variant Configuration & Inventory</h4>
                          <button onClick={() => handleAddVariant(product.id)} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-2 text-xs font-bold uppercase">
                            <Plus size={14} /> Add Variant
                          </button>
                        </div>
                        
                        <table className="w-full border border-black">
                          <thead>
                            <tr className="border-b border-black bg-white">
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-black w-8"></th>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-black">SKU</th>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-black">Attributes</th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase border-r border-black">Sale Price</th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase border-r border-black">Total Qty</th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase border-r border-black">Stock Status</th>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.variants.map((variant, vIdx) => {
                              const isVariantExpanded = expandedVariants.includes(variant.sku);
                              const { totalQuantity, stockStatus } = getVariantStockInfo(variant.batches);

                              return (
                                <React.Fragment key={variant.sku}>
                                  <tr className={`border-b border-black ${vIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                    <td className="px-4 py-3 text-center border-r border-black">
                                      <button onClick={() => toggleVariant(variant.sku)} className="p-1 border border-black bg-white hover:bg-gray-200" title="View Batches">
                                        {isVariantExpanded ? <ChevronDown size={14} /> : <Layers size={14} />}
                                      </button>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-mono font-bold border-r border-black">{variant.sku}</td>
                                    <td className="px-4 py-3 text-sm border-r border-black">{variant.weight} / {variant.form}</td>
                                    <td className="px-4 py-3 text-sm text-right border-r border-black font-mono">{parseInt(variant.salePrice).toLocaleString()} ₫</td>
                                    <td className="px-4 py-3 text-sm text-center border-r border-black font-mono font-bold">{totalQuantity}</td>
                                    <td className="px-4 py-3 text-sm text-center border-r border-black">
                                      <span className={`text-[10px] px-2 py-0.5 border font-bold uppercase flex items-center justify-center gap-1 w-fit mx-auto ${
                                        stockStatus === "In Stock" ? "border-green-600 text-green-600" :
                                        stockStatus === "Low Stock" ? "border-yellow-600 text-yellow-600" :
                                        "border-red-600 text-red-600"
                                      }`}>
                                        {stockStatus === "Low Stock" && <AlertTriangle size={10} />}
                                        {stockStatus}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm flex gap-2">
                                      <button onClick={() => handleEditVariant(product.id, variant)} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 text-xs flex items-center gap-1 font-bold uppercase">
                                        <Edit size={12} /> Edit
                                      </button>
                                    </td>
                                  </tr>

                                  {isVariantExpanded && (
                                    <tr className="border-b border-black bg-gray-200">
                                      <td colSpan={7} className="p-0">
                                        <div className="p-4 pl-16">
                                          <h5 className="font-bold text-xs mb-2 uppercase text-gray-700 flex items-center gap-2">
                                            <Layers size={14} /> Product Batches for {variant.sku}
                                          </h5>
                                          {variant.batches.length === 0 ? (
                                            <p className="text-xs italic text-gray-500">No batches recorded.</p>
                                          ) : (
                                            <table className="w-full max-w-3xl border border-black bg-white">
                                              <thead>
                                                <tr className="bg-gray-100 border-b border-black text-xs text-left uppercase">
                                                  <th className="p-2 border-r border-black">Batch ID</th>
                                                  <th className="p-2 border-r border-black text-right">Cost Price</th>
                                                  <th className="p-2 border-r border-black text-center">Qty</th>
                                                  <th className="p-2 border-r border-black">MFG Date</th>
                                                  <th className="p-2">EXP Date</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {variant.batches.map(batch => (
                                                  <tr key={batch.batchId} className="border-b border-gray-300 text-xs font-mono">
                                                    <td className="p-2 border-r border-black font-bold">{batch.batchId}</td>
                                                    <td className="p-2 border-r border-black text-right">{parseInt(batch.costPrice).toLocaleString()} ₫</td>
                                                    <td className="p-2 border-r border-black text-center font-bold">{batch.quantity}</td>
                                                    <td className="p-2 border-r border-black">{batch.manufacturingDate}</td>
                                                    <td className="p-2">{batch.expiryDate}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 border-t-2 border-black pt-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredProducts.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}

      {/* =========================================
         MÀN HÌNH 2: ADD / DETAIL PRODUCT (GỘP CHUNG)
      ========================================= */}
      {(viewMode === "ADD_PRODUCT" || viewMode === "DETAIL_PRODUCT") && (
        <div className="bg-white border-2 border-black p-6 w-full shadow-sm max-w-5xl mx-auto mt-4">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {viewMode === "ADD_PRODUCT" ? "Create Parent Product" : "Product Details"}
              </h2>
              {viewMode === "DETAIL_PRODUCT" && !isEditable && (
                <button onClick={() => setIsEditable(true)} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-1 text-sm font-bold uppercase">
                  <Edit size={14} /> Unlock Edit
                </button>
              )}
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black hover:bg-gray-100 font-bold uppercase text-sm">Back to List</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase mb-1">Product ID (Auto)</label>
                  <input type="text" value={newProduct.id} readOnly className="w-full px-3 py-2 border border-black bg-gray-100 font-mono text-sm" />
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold uppercase mb-1">Status</label>
                  <select value={newProduct.status} onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as any })} disabled={!isEditable} className={`w-full px-3 py-2 border border-black text-sm ${!isEditable ? 'bg-gray-100 opacity-80 cursor-not-allowed' : 'bg-white'}`}>
                    <option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Locked">Locked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Product Name *</label>
                <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} readOnly={!isEditable} className={`w-full px-3 py-2 border border-black text-sm ${!isEditable ? 'bg-gray-100 outline-none' : ''}`} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Category *</label>
                <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} disabled={!isEditable} className={`w-full px-3 py-2 border border-black text-sm ${!isEditable ? 'bg-gray-100 opacity-80 cursor-not-allowed' : 'bg-white'}`}>
                  <option value="">-- Select --</option><option value="Premium Blends">Premium Blends</option><option value="Single Origin">Single Origin</option>
                </select>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-20 h-20 border border-black bg-gray-50 flex items-center justify-center shrink-0">
                  {newProduct.thumbnailUrl ? <img src={newProduct.thumbnailUrl} alt="thumb" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" />}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase mb-1">Thumbnail URL</label>
                  <input type="text" value={newProduct.thumbnailUrl || ""} onChange={(e) => setNewProduct({ ...newProduct, thumbnailUrl: e.target.value })} readOnly={!isEditable} className={`w-full px-3 py-2 border border-black text-sm font-mono ${!isEditable ? 'bg-gray-100 outline-none' : ''}`} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Summary *</label>
                <textarea value={newProduct.summary} onChange={(e) => setNewProduct({ ...newProduct, summary: e.target.value })} readOnly={!isEditable} className={`w-full px-3 py-2 border border-black h-20 text-sm ${!isEditable ? 'bg-gray-100 outline-none' : ''}`} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Story (HTML)</label>
                <textarea value={newProduct.story} onChange={(e) => setNewProduct({ ...newProduct, story: e.target.value })} readOnly={!isEditable} className={`w-full px-3 py-2 border border-black h-32 font-mono text-xs ${!isEditable ? 'bg-gray-100 outline-none' : ''}`} />
              </div>
            </div>
          </div>

          {/* SEO METADATA SECTION */}
          <div className="mt-8 border-t-2 border-black pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} />
              <h3 className="text-sm font-black uppercase">Search Engine Optimization (SEO Metadata)</h3>
            </div>
            <div className="border border-black p-4 bg-gray-50 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Meta Title *</label>
                <input 
                  type="text" 
                  placeholder="Tiêu đề hiển thị trên Google..."
                  value={newProduct.metaTitle} 
                  onChange={(e) => setNewProduct({ ...newProduct, metaTitle: e.target.value })} 
                  readOnly={!isEditable} 
                  className={`w-full px-3 py-2 border border-black text-sm ${!isEditable ? 'bg-gray-100' : 'bg-white'}`} 
                />
                <p className="text-[10px] mt-1 text-gray-500 font-bold uppercase">Recommended: 50-60 characters</p>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Meta Description *</label>
                <textarea 
                  placeholder="Đoạn mô tả ngắn hiển thị trên trang kết quả tìm kiếm..."
                  value={newProduct.metaDescription} 
                  onChange={(e) => setNewProduct({ ...newProduct, metaDescription: e.target.value })} 
                  readOnly={!isEditable} 
                  className={`w-full px-3 py-2 border border-black h-20 text-sm ${!isEditable ? 'bg-gray-100' : 'bg-white'}`} 
                />
                <p className="text-[10px] mt-1 text-gray-500 font-bold uppercase">Recommended: 150-160 characters</p>
              </div>

              {/* Google Preview (Visual only) */}
              <div className="mt-4 p-4 bg-white border border-gray-300 rounded shadow-sm max-w-2xl">
                <p className="text-[10px] text-gray-400 mb-1 font-mono uppercase">Google Search Preview:</p>
                <p className="text-[#1a0dab] text-xl font-medium hover:underline cursor-pointer truncate">{newProduct.metaTitle || "Your Product Name - Katak Coffee"}</p>
                <p className="text-[#006621] text-sm mb-1 truncate">https://katakcoffee.com/product/{newProduct.id || "ID"}</p>
                <p className="text-[#545454] text-sm leading-snug line-clamp-2">{newProduct.metaDescription || "No description provided. Add meta description to improve click-through rate."}</p>
              </div>
            </div>
          </div>

          {/* GALLERY SECTION */}
          <div className="mt-6 border-t border-black pt-6">
            <h3 className="text-sm font-black uppercase mb-4">Additional Images (Gallery)</h3>
            <div className="border border-black p-4 bg-gray-50">
              {isEditable && (
                <div className="flex gap-2 mb-4">
                  <input type="text" value={tempImageUrl} onChange={(e) => setTempImageUrl(e.target.value)} className="flex-1 px-3 py-2 border border-black text-sm font-mono" placeholder="Paste image URL here..." />
                  <button type="button" onClick={handleAddGalleryImage} className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 text-sm font-bold uppercase whitespace-nowrap">Add Image</button>
                </div>
              )}
              {newProduct.imageUrls.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {newProduct.imageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 border border-black shrink-0 bg-white group">
                      <img src={url} alt={`gallery-img-${idx}`} className="w-full h-full object-cover" />
                      {isEditable && (
                        <button type="button" onClick={() => handleRemoveGalleryImage(idx)} className="absolute -top-2 -right-2 bg-white border border-black p-1 rounded-full text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100" title="Remove image">
                          <X size={12} strokeWidth={3} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic p-2 border border-dashed border-gray-400">No additional images added yet.</p>
              )}
            </div>
          </div>

          {/* INTEGRATED SENSORY PROFILE */}
          <div className="border-t-2 border-black pt-6 mt-6">
            <h3 className="text-sm font-black uppercase mb-4">Product Sensory Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-black p-4 bg-gray-50">
              {/* Radar Chart (SVG) */}
              <div className="col-span-1 flex flex-col items-center justify-center border-r border-black pr-4">
                <svg width="200" height="200" viewBox="0 0 120 120" className="w-full max-w-[200px] h-auto">
                  <polygon points="60,10 110,60 60,110 10,60" fill="none" stroke="#ccc" strokeWidth="1" />
                  <polygon points="60,35 85,60 60,85 35,60" fill="none" stroke="#ccc" strokeWidth="1" />
                  <line x1="60" y1="10" x2="60" y2="110" stroke="#aaa" strokeWidth="1" strokeDasharray="2,2"/>
                  <line x1="10" y1="60" x2="110" y2="60" stroke="#aaa" strokeWidth="1" strokeDasharray="2,2"/>
                  <text x="60" y="8" textAnchor="middle" fontSize="5" fontWeight="bold" fill="black">BITTER</text>
                  <text x="112" y="62" textAnchor="start" fontSize="5" fontWeight="bold" fill="black">SWEET</text>
                  <text x="60" y="118" textAnchor="middle" fontSize="5" fontWeight="bold" fill="black">SOUR</text>
                  <text x="8" y="62" textAnchor="end" fontSize="5" fontWeight="bold" fill="black">BODY</text>
                  <polygon 
                    points={`
                      60,${60 - (currentProductSensory.bitter * 5)} 
                      ${60 + (currentProductSensory.sweet * 5)},60 
                      60,${60 + (currentProductSensory.sour * 5)} 
                      ${60 - (currentProductSensory.body * 5)},60
                    `}
                    fill="black" fillOpacity="0.2" stroke="black" strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* Sliders & Text Inputs */}
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {['bitter', 'sweet', 'sour', 'body'].map((attr) => (
                    <div key={attr}>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold uppercase">{attr}</label>
                        <span className="text-xs font-mono font-bold bg-white border border-black px-1">
                          {currentProductSensory[attr as keyof SensoryData]}/10
                        </span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1" 
                        value={currentProductSensory[attr as keyof SensoryData]}
                        onChange={(e) => setCurrentProductSensory({ ...currentProductSensory, [attr]: parseInt(e.target.value) })}
                        disabled={!isEditable}
                        className="w-full accent-black cursor-pointer disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-black pt-4 mt-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold uppercase mb-1">Caffeine (%)</label>
                    <input 
                      type="number" min="0" max="100" step="0.1"
                      value={currentProductSensory.caffein}
                      onChange={(e) => setCurrentProductSensory({ ...currentProductSensory, caffein: parseFloat(e.target.value) || 0 })}
                      readOnly={!isEditable}
                      className={`w-full px-3 py-2 border border-black text-sm font-mono ${!isEditable ? 'bg-gray-100 outline-none' : 'bg-white'}`}
                      placeholder="%"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase mb-1">Flavor Notes</label>
                    <input 
                      type="text" 
                      value={currentProductSensory.flavor}
                      onChange={(e) => setCurrentProductSensory({ ...currentProductSensory, flavor: e.target.value })}
                      readOnly={!isEditable}
                      className={`w-full px-3 py-2 border border-black text-sm ${!isEditable ? 'bg-gray-100 outline-none' : 'bg-white'}`}
                      placeholder="e.g., Floral, Nutty, Dark Chocolate..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isEditable && (
            <div className="flex gap-2 justify-end mt-8 border-t-2 border-black pt-4">
              <button onClick={handleCancelProduct} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-sm">Cancel</button>
              <button onClick={handleSaveProduct} disabled={!newProduct.name || !newProduct.category} className="px-6 py-2 border border-black bg-black text-white hover:invert font-bold uppercase text-sm disabled:opacity-50">
                {viewMode === "ADD_PRODUCT" ? "Save Product" : "Update Product"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================
         MODAL: VARIANT FORM (Giữ nguyên vì thao tác nhanh)
      ========================================= */}
      {showVariantForm && (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center p-4" onClick={() => setShowVariantForm(false)}>
          <div className="bg-white border-2 border-black p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-black">
              <h2 className="font-bold text-lg uppercase tracking-tighter">{editingVariant.variant ? "Update Variant" : "Add Variant"}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase mb-1">SKU (Unique) *</label>
                  <input type="text" value={newVariant.sku} onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })} disabled={!!editingVariant.variant} className="w-full px-3 py-2 border border-black font-mono text-sm disabled:bg-gray-100" />
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-bold uppercase mb-1">Status</label>
                  <select value={newVariant.status} onChange={(e) => setNewVariant({ ...newVariant, status: e.target.value as any })} className="w-full px-3 py-2 border border-black bg-white text-sm">
                    <option value="Active">Active</option><option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Weight *</label>
                  <select value={newVariant.weight} onChange={(e) => setNewVariant({ ...newVariant, weight: e.target.value })} className="w-full px-3 py-2 border border-black bg-white text-sm">
                    <option value="">-- Select --</option><option value="250g">250g</option><option value="500g">500g</option><option value="1kg">1kg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Form *</label>
                  <select value={newVariant.form} onChange={(e) => setNewVariant({ ...newVariant, form: e.target.value })} className="w-full px-3 py-2 border border-black bg-white text-sm">
                    <option value="">-- Select --</option><option value="Whole Bean">Whole Bean</option><option value="Ground Phin">Ground Phin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Sale Price (Giá bán VNĐ) *</label>
                <input type="number" value={newVariant.salePrice} onChange={(e) => setNewVariant({ ...newVariant, salePrice: e.target.value })} className="w-full px-3 py-2 border border-black text-sm font-mono" placeholder="e.g. 180000" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-8 pt-4 border-t border-black">
              <button onClick={() => setShowVariantForm(false)} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-sm">Cancel</button>
              <button onClick={handleSaveVariant} disabled={!newVariant.sku || !newVariant.weight || !newVariant.form || !newVariant.salePrice} className="px-6 py-2 border border-black font-bold uppercase text-sm bg-black text-white hover:invert disabled:opacity-50">Save Variant</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}