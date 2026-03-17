import { useState, useMemo, Fragment } from "react";
import { Plus, Search, Upload, Eye, Lock, Unlock, AlertCircle, Edit, Activity, Copy, Save, X } from "lucide-react";
import { Pagination } from "../components/Pagination";

// --- INTERFACES ---
interface SensoryData {
  bitter: number;  // 1-10
  sweet: number;   // 1-10
  sour: number;    // 1-10
  body: number;    // 1-10
  caffein: number; // %
  flavor: string;  // Text
}

interface MaterialMaster {
  id: string;
  name: string;
  category: string;
  origin: string; 
  description: string;
}

interface MaterialBatch {
  id: string;
  materialId: string;
  supplier: string;
  importPrice: number;
  initialQty: number;
  remainingQty: number;
  importDate: string;
  expiryDate: string;
  status: "Active" | "Locked" | "Expired" | "Empty";
  sensoryData?: SensoryData; // Chuyển Sensory xuống Batch
}

type ViewMode = "LIST" | "ADD_MATERIAL" | "DETAIL_MATERIAL" | "IMPORT" | "EXPORT" | "BATCHES" | "STOCK_LEDGER";

const defaultSensory: SensoryData = { bitter: 5, sweet: 5, sour: 5, body: 5, caffein: 0, flavor: "" };

export function Materials() {
  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // View Management
  const [viewMode, setViewMode] = useState<ViewMode>("LIST");
  const [isEditable, setIsEditable] = useState(false);
  
  // Form Data
  const [editingMaterial, setEditingMaterial] = useState<MaterialMaster | null>(null);
  const [selectedMaterialForBatches, setSelectedMaterialForBatches] = useState<MaterialMaster | null>(null);
  
  // Trạng thái mở rộng xem và sửa Sensory ở màn Batch
  const [expandedBatchSensory, setExpandedBatchSensory] = useState<string | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editingSensoryData, setEditingSensoryData] = useState<SensoryData>(defaultSensory);

  // Pagination
  const [currentPageMaterials, setCurrentPageMaterials] = useState(1);
  const itemsPerPage = 10;

  // --- MOCK DATA ---
  const MOCK_SUPPLIERS = ["Highland Coffee Suppliers", "Vietnam Coffee Export Co.", "Arabica Premium Ltd.", "Local Farm DX"];

  const [materialMasters, setMaterialMasters] = useState<MaterialMaster[]>([
    { id: "MAT-M001", name: "Arabica Green Beans", category: "Coffee Beans", origin: "Cầu Đất, Lâm Đồng", description: "Premium Arabica green coffee beans" },
    { id: "MAT-M002", name: "Robusta Green Beans", category: "Coffee Beans", origin: "Buôn Ma Thuột, Đắk Lắk", description: "High-quality Robusta beans" },
    { id: "MAT-M003", name: "Culi Green Beans", category: "Coffee Beans", origin: "Đắk Mil, Đắk Nông", description: "High-quality Culi Beans" },
  ]);

  const [batches, setBatches] = useState<MaterialBatch[]>([
    { 
      id: "BAT-20260115-01", materialId: "MAT-M001", supplier: "Highland Coffee Suppliers", importPrice: 250000, initialQty: 500, remainingQty: 350, importDate: "2026-01-15", expiryDate: "2027-01-15", status: "Active",
      sensoryData: { bitter: 3, sweet: 7, sour: 6, body: 4, caffein: 1.5, flavor: "Floral, Citrus, Caramel" }
    },
    { 
      id: "BAT-20260220-02", materialId: "MAT-M001", supplier: "Local Farm DX", importPrice: 255000, initialQty: 200, remainingQty: 200, importDate: "2026-02-20", expiryDate: "2027-02-20", status: "Active",
      sensoryData: { bitter: 4, sweet: 6, sour: 5, body: 5, caffein: 1.6, flavor: "Nutty, Chocolate" }
    },
    { 
      id: "BAT-20260210-01", materialId: "MAT-M002", supplier: "Vietnam Coffee Export Co.", importPrice: 180000, initialQty: 300, remainingQty: 0, importDate: "2026-02-10", expiryDate: "2027-02-10", status: "Empty",
      sensoryData: { bitter: 8, sweet: 2, sour: 2, body: 9, caffein: 2.7, flavor: "Dark Chocolate, Earthy, Woody" }
    },
  ]);

  // --- DERIVED CALCULATIONS ---
  const getTotalStock = (materialId: string) => {
    return batches
      .filter(b => b.materialId === materialId && b.status === "Active")
      .reduce((sum, b) => sum + b.remainingQty, 0);
  };

  // --- FORM STATES ---
  const [newMaterial, setNewMaterial] = useState<MaterialMaster>({ id: "", name: "", category: "", origin: "", description: "" });
  
  // State cho Form Import
  const [importData, setImportData] = useState({ materialId: "", supplier: "", qty: "", unitPrice: "", importDate: new Date().toISOString().split("T")[0], expiryDate: "" });
  const [importSensory, setImportSensory] = useState<SensoryData>(defaultSensory);
  const [exportData, setExportData] = useState({ materialId: "", batchId: "", type: "Production", qty: "", reference: "", exportDate: new Date().toISOString().split("T")[0] });

  // --- HANDLERS: MATERIAL MASTER ---
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setNewMaterial({ id: `MAT-M${String(materialMasters.length + 1).padStart(3, "0")}`, name: "", category: "", origin: "", description: "" });
    setViewMode("ADD_MATERIAL");
    setIsEditable(true);
  };

  const handleDetailMaterial = (material: MaterialMaster) => {
    setEditingMaterial(material); 
    setNewMaterial({ ...material });
    setViewMode("DETAIL_MATERIAL");
    setIsEditable(false);
  };

  const handleSaveMaterial = () => {
    if (editingMaterial) {
      setMaterialMasters(materialMasters.map(m => m.id === editingMaterial.id ? newMaterial : m));
    } else {
      setMaterialMasters([...materialMasters, newMaterial]);
    }
    setViewMode("LIST");
    setIsEditable(false);
  };

  // --- HANDLERS: VIEW BATCHES ---
  const handleViewBatches = (material: MaterialMaster) => {
    setSelectedMaterialForBatches(material);
    setExpandedBatchSensory(null);
    setEditingBatchId(null);
    setViewMode("BATCHES");
  };

  // --- HANDLERS: SENSORY EDIT IN BATCH ---
  const handleStartEditBatchSensory = (batch: MaterialBatch) => {
    setEditingBatchId(batch.id);
    setEditingSensoryData(batch.sensoryData ? { ...batch.sensoryData } : { ...defaultSensory });
  };

  const handleCancelEditBatchSensory = () => {
    setEditingBatchId(null);
  };

  const handleSaveBatchSensory = () => {
    if (editingBatchId) {
      setBatches(batches.map(b => 
        b.id === editingBatchId ? { ...b, sensoryData: editingSensoryData } : b
      ));
      setEditingBatchId(null);
    }
  };

  // --- HANDLERS: IMPORT BATCH & SENSORY ---
  const handleOpenImport = () => {
    setImportData({ materialId: "", supplier: "", qty: "", unitPrice: "", importDate: new Date().toISOString().split("T")[0], expiryDate: "" });
    setImportSensory({ ...defaultSensory });
    setViewMode("IMPORT");
  };

  const handleAutoFillSensory = () => {
    if (!importData.materialId) {
      alert("Please select a Material first.");
      return;
    }
    // Lấy batch mới nhất của material này (sắp xếp theo importDate giảm dần)
    const materialBatches = batches.filter(b => b.materialId === importData.materialId && b.sensoryData);
    if (materialBatches.length > 0) {
      const latestBatch = materialBatches.sort((a, b) => new Date(b.importDate).getTime() - new Date(a.importDate).getTime())[0];
      if (latestBatch.sensoryData) {
        setImportSensory({ ...latestBatch.sensoryData });
      }
    } else {
      alert("No previous sensory profile found for this material.");
    }
  };

  const handleImportMaterial = () => {
    const newBatch: MaterialBatch = {
      id: `BAT-${importData.importDate.replace(/-/g, "")}-${String(batches.length + 1).padStart(2, "0")}`,
      materialId: importData.materialId, supplier: importData.supplier, importPrice: parseFloat(importData.unitPrice) || 0,
      initialQty: parseFloat(importData.qty), remainingQty: parseFloat(importData.qty),
      importDate: importData.importDate, expiryDate: importData.expiryDate, status: "Active",
      sensoryData: { ...importSensory } // Lưu sensory vào batch
    };
    setBatches([newBatch, ...batches]); // Đưa lên đầu
    setViewMode("LIST");
  };

  const handleExportMaterial = () => {
    setBatches(batches.map(b => {
      if (b.id === exportData.batchId) {
        const newQty = Math.max(0, b.remainingQty - parseFloat(exportData.qty));
        return { ...b, remainingQty: newQty, status: newQty === 0 ? "Empty" : b.status };
      }
      return b;
    }));
    setViewMode("LIST");
    setExportData({ materialId: "", batchId: "", type: "Production", qty: "", reference: "", exportDate: new Date().toISOString().split("T")[0] });
  };

  const handleToggleBatchStatus = (batchId: string) => {
    setBatches(batches.map(b => {
      if (b.id === batchId) {
        if (b.status === "Empty" || b.status === "Expired") return b;
        return { ...b, status: b.status === "Active" ? "Locked" : "Active" };
      }
      return b;
    }));
  };

  // --- FILTERING & PAGINATION ---
  const filteredMaterials = materialMasters.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) || material.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPagesMaterials = Math.ceil(filteredMaterials.length / itemsPerPage);
  const paginatedMaterials = filteredMaterials.slice((currentPageMaterials - 1) * itemsPerPage, currentPageMaterials * itemsPerPage);
  const batchesForExport = useMemo(() => batches.filter(b => b.materialId === exportData.materialId && b.status === "Active"), [exportData.materialId, batches]);

  // --- REUSABLE COMPONENT: SENSORY RADAR ---
  const SensoryRadar = ({ sensory }: { sensory: SensoryData }) => (
    <div className="flex flex-col items-center justify-center">
      <svg width="150" height="150" viewBox="0 0 120 120" className="w-full max-w-[150px] h-auto">
        <polygon points="60,10 110,60 60,110 10,60" fill="none" stroke="#ccc" strokeWidth="1" />
        <polygon points="60,35 85,60 60,85 35,60" fill="none" stroke="#ccc" strokeWidth="1" />
        <line x1="60" y1="10" x2="60" y2="110" stroke="#aaa" strokeWidth="1" strokeDasharray="2,2"/>
        <line x1="10" y1="60" x2="110" y2="60" stroke="#aaa" strokeWidth="1" strokeDasharray="2,2"/>
        <text x="60" y="8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="black">BITTER</text>
        <text x="112" y="62" textAnchor="start" fontSize="6" fontWeight="bold" fill="black">SWEET</text>
        <text x="60" y="118" textAnchor="middle" fontSize="6" fontWeight="bold" fill="black">SOUR</text>
        <text x="8" y="62" textAnchor="end" fontSize="6" fontWeight="bold" fill="black">BODY</text>
        <polygon 
          points={`
            60,${60 - (sensory.bitter * 5)} 
            ${60 + (sensory.sweet * 5)},60 
            60,${60 + (sensory.sour * 5)} 
            ${60 - (sensory.body * 5)},60
          `}
          fill="black" fillOpacity="0.2" stroke="black" strokeWidth="1.5"
        />
      </svg>
    </div>
  );

  return (
    <div className="bg-white text-black min-h-screen">
      
      {/* =========================================
         MÀN HÌNH 1: DANH SÁCH MATERIAL MASTER
      ========================================= */}
      {viewMode === "LIST" && (
        <>
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Material Management</h1>
              <p className="text-sm font-bold mt-1 uppercase tracking-widest text-gray-600">Master Data & Batch Inventory</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddMaterial} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 flex items-center gap-2 text-sm font-bold uppercase">
                <Plus size={16} /> Add Master
              </button>
              <button onClick={handleOpenImport} className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 flex items-center gap-2 text-sm font-bold uppercase">
                <Upload size={16} /> Import (New Batch)
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 border border-black bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase mb-2">Search Materials</label>
                <div className="flex items-center gap-2 border border-black bg-white px-3 py-2">
                  <Search size={14} />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or ID..." className="outline-none bg-transparent text-sm flex-1 focus:ring-0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Filter by Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 border border-black bg-white text-sm">
                  <option value="">All Categories</option><option value="Coffee Beans">Coffee Beans</option><option value="Packaging">Packaging</option><option value="Additives">Additives</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border border-black bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black bg-gray-50">
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black w-12 text-center">STT</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black">Material ID</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black">Origin</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase border-r border-black text-right">Active Stock (Kg)</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMaterials.map((material, index) => {
                  const totalStock = getTotalStock(material.id);
                  const hasStockWarning = totalStock === 0;
                  return (
                    <tr key={material.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-center border-r border-black font-mono">{(currentPageMaterials - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-3 text-sm font-bold font-mono border-r border-black">{material.id}</td>
                      <td className="px-4 py-3 text-sm border-r border-black font-bold">{material.name}</td>
                      <td className="px-4 py-3 text-sm border-r border-black">{material.origin || "-"}</td>
                      <td className="px-4 py-3 text-sm text-right border-r border-black font-mono font-bold">
                        <span className={hasStockWarning ? "text-red-600 flex items-center justify-end gap-1" : ""}>
                          {hasStockWarning && <AlertCircle size={14} />} {totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm flex justify-center gap-2">
                        <button onClick={() => handleViewBatches(material)} className="px-3 py-1 border border-black bg-black text-white hover:invert flex items-center gap-1 text-xs font-bold uppercase"><Eye size={12} /> Batches</button>
                        <button onClick={() => handleDetailMaterial(material)} className="px-3 py-1 border border-black bg-white hover:bg-gray-200 flex items-center gap-1 text-xs font-bold uppercase"><Edit size={12} /> Detail</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination currentPage={currentPageMaterials} totalPages={totalPagesMaterials} totalItems={filteredMaterials.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPageMaterials} />
          </div>
        </>
      )}

      {/* =========================================
         MÀN HÌNH 2: BATCH DRILL-DOWN (INVENTORY)
      ========================================= */}
      {viewMode === "BATCHES" && selectedMaterialForBatches && (
        <div className="bg-white border-2 border-black p-6 w-full shadow-sm max-w-5xl mx-auto mt-4">
           <div className="flex justify-between items-start border-b border-black pb-4 mb-6">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Batch Inventory Details</h2>
              <p className="font-mono text-sm mt-1">{selectedMaterialForBatches.id} • {selectedMaterialForBatches.name}</p>
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black hover:bg-gray-100 font-bold uppercase text-sm">Back to List</button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 mb-2">
              <div className="p-3 border border-black bg-gray-50 flex-1">
                <p className="text-xs uppercase font-bold text-gray-500">Origin / Source</p>
                <p className="font-bold">{selectedMaterialForBatches.origin || "N/A"}</p>
              </div>
              <div className="p-3 border border-black bg-gray-50 flex-1">
                <p className="text-xs uppercase font-bold text-gray-500">Category</p>
                <p className="font-bold">{selectedMaterialForBatches.category}</p>
              </div>
              <div className="p-3 border border-black bg-black text-white flex-1 text-right">
                <p className="text-xs uppercase font-bold text-gray-400">Total Active Stock (Kg)</p>
                <p className="font-bold text-2xl font-mono">{getTotalStock(selectedMaterialForBatches.id)}</p>
              </div>
            </div>

            <div className="border border-black">
              <div className="p-3 border-b border-black bg-gray-100 font-bold uppercase text-sm">List of Received Batches</div>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-black bg-white">
                    <th className="p-2 border-r border-black">Batch Code</th>
                    <th className="p-2 border-r border-black">Supplier</th>
                    <th className="p-2 border-r border-black">Import / Expiry</th>
                    <th className="p-2 border-r border-black text-right">Rem. Qty (Kg)</th>
                    <th className="p-2 border-r border-black text-center">Status</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.filter(b => b.materialId === selectedMaterialForBatches.id).map(batch => (
                    <Fragment key={batch.id}>
                      <tr className={`border-b border-gray-200 ${batch.status === 'Locked' ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}>
                        <td className="p-2 border-r border-black font-mono font-bold">{batch.id}</td>
                        <td className="p-2 border-r border-black">{batch.supplier}</td>
                        <td className="p-2 border-r border-black font-mono">{batch.importDate} <br/> <span className="text-gray-500">EXP: {batch.expiryDate}</span></td>
                        <td className="p-2 border-r border-black text-right font-mono font-bold">
                          {batch.remainingQty} <span className="text-[10px] font-normal text-gray-500">/ {batch.initialQty}</span>
                        </td>
                        <td className="p-2 border-r border-black text-center">
                          <span className={`px-2 py-0.5 border font-bold uppercase tracking-wider text-[10px] ${
                            batch.status === 'Active' ? 'border-black bg-black text-white' : 
                            batch.status === 'Empty' ? 'border-gray-400 text-gray-400' : 'border-black bg-white text-black'
                          }`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => {
                                  if (expandedBatchSensory === batch.id) {
                                    setExpandedBatchSensory(null);
                                    setEditingBatchId(null);
                                  } else {
                                    setExpandedBatchSensory(batch.id);
                                  }
                                }}
                                disabled={!batch.sensoryData}
                                className={`p-1.5 border border-black hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent ${expandedBatchSensory === batch.id ? 'bg-gray-200' : ''}`}
                                title={batch.sensoryData ? "View Sensory Profile" : "No sensory data for this batch"}
                              >
                                <Activity size={14}/>
                              </button>
                              <button 
                                onClick={() => handleToggleBatchStatus(batch.id)}
                                disabled={batch.status === "Empty" || batch.status === "Expired"}
                                className="p-1.5 border border-black hover:bg-gray-200 disabled:opacity-30"
                                title="Lock/Unlock this batch"
                              >
                                {batch.status === 'Locked' ? <Lock size={14}/> : <Unlock size={14}/>}
                              </button>
                            </div>
                        </td>
                      </tr>
                      
                      {/* Accordion Row for Sensory Profile Edit/View */}
                      {expandedBatchSensory === batch.id && batch.sensoryData && (
                        <tr className="border-b border-black bg-gray-50">
                          <td colSpan={6} className="p-4">
                             <div className="border border-black p-4 bg-white">
                                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                                  <h4 className="font-bold uppercase text-xs">Sensory Profile Details</h4>
                                  {editingBatchId === batch.id ? (
                                    <div className="flex gap-2">
                                      <button onClick={handleCancelEditBatchSensory} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-1 text-[10px] font-bold uppercase"><X size={12} /> Cancel</button>
                                      <button onClick={handleSaveBatchSensory} className="px-3 py-1 border border-black bg-black text-white hover:invert flex items-center gap-1 text-[10px] font-bold uppercase"><Save size={12} /> Save</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => handleStartEditBatchSensory(batch)} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-1 text-[10px] font-bold uppercase">
                                      <Edit size={12} /> Edit Profile
                                    </button>
                                  )}
                                </div>
                                
                                <div className="flex gap-6 items-center">
                                  <SensoryRadar sensory={editingBatchId === batch.id ? editingSensoryData : batch.sensoryData} />
                                  <div className="flex-1 grid grid-cols-2 gap-4 text-xs font-mono uppercase">
                                    {['bitter', 'sweet', 'sour', 'body'].map((attr) => {
                                      const isEditing = editingBatchId === batch.id;
                                      const val = isEditing ? editingSensoryData[attr as keyof SensoryData] : batch.sensoryData![attr as keyof SensoryData];
                                      return (
                                        <div key={attr} className="flex flex-col gap-1">
                                          <div className="flex justify-between">
                                            <span className="font-bold text-gray-500">{attr}:</span>
                                            <span>{val}/10</span>
                                          </div>
                                          {isEditing && (
                                            <input 
                                              type="range" min="1" max="10" step="1" 
                                              value={val}
                                              onChange={(e) => setEditingSensoryData({ ...editingSensoryData, [attr]: parseInt(e.target.value) })}
                                              className="w-full accent-black cursor-pointer"
                                            />
                                          )}
                                        </div>
                                      );
                                    })}
                                    
                                    <div className="flex flex-col gap-1">
                                      <span className="font-bold text-gray-500">Caffeine:</span>
                                      {editingBatchId === batch.id ? (
                                        <input 
                                          type="number" min="0" max="100" step="0.1"
                                          value={editingSensoryData.caffein}
                                          onChange={(e) => setEditingSensoryData({ ...editingSensoryData, caffein: parseFloat(e.target.value) || 0 })}
                                          className="p-1 border border-black text-xs font-mono bg-white outline-none"
                                        />
                                      ) : (
                                        <span>{batch.sensoryData.caffein}%</span>
                                      )}
                                    </div>
                                    
                                    <div className="col-span-2 flex flex-col gap-1">
                                      <span className="font-bold text-gray-500">Flavor Notes:</span>
                                      {editingBatchId === batch.id ? (
                                        <input 
                                          type="text" 
                                          value={editingSensoryData.flavor}
                                          onChange={(e) => setEditingSensoryData({ ...editingSensoryData, flavor: e.target.value })}
                                          className="p-1 border border-black text-xs font-sans uppercase bg-white outline-none"
                                        />
                                      ) : (
                                        <span className="font-sans">{batch.sensoryData.flavor}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                  {batches.filter(b => b.materialId === selectedMaterialForBatches.id).length === 0 && (
                    <tr><td colSpan={6} className="p-4 text-center italic">No batches found for this material.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
         MÀN HÌNH 3: ADD/DETAIL/EDIT MATERIAL MASTER
      ========================================= */}
      {(viewMode === "ADD_MATERIAL" || viewMode === "DETAIL_MATERIAL") && (
        <div className="bg-white border-2 border-black p-6 w-full shadow-sm max-w-2xl mx-auto mt-4">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {viewMode === "ADD_MATERIAL" ? "Create Material Master" : "Material Master Details"}
              </h2>
              {viewMode === "DETAIL_MATERIAL" && !isEditable && (
                <button onClick={() => setIsEditable(true)} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-1 text-sm font-bold uppercase">
                  <Edit size={14} /> Unlock Edit
                </button>
              )}
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black hover:bg-gray-100 font-bold uppercase text-sm">Back to List</button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Material ID (Auto)</label>
                <input type="text" value={newMaterial.id} readOnly className="w-full px-3 py-2 border border-black bg-gray-100 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Origin (Xuất xứ) *</label>
                <input 
                  type="text" 
                  value={newMaterial.origin} 
                  onChange={(e) => setNewMaterial({ ...newMaterial, origin: e.target.value })} 
                  readOnly={!isEditable} 
                  className={`w-full px-3 py-2 border border-black text-sm ${!isEditable ? 'bg-gray-100 outline-none' : ''}`} 
                  placeholder="e.g., Cầu Đất, Lâm Đồng" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Material Name *</label>
              <input type="text" value={newMaterial.name} onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })} readOnly={!isEditable} className={`w-full px-3 py-2 border border-black text-sm font-bold ${!isEditable ? 'bg-gray-100 outline-none' : ''}`} placeholder="e.g., Arabica Green Beans" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Category *</label>
                <select value={newMaterial.category} onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })} disabled={!isEditable} className={`w-full px-3 py-2 border border-black text-sm ${!isEditable ? 'bg-gray-100 opacity-80 cursor-not-allowed' : 'bg-white'}`}>
                  <option value="">-- Select Category --</option><option value="Coffee Beans">Coffee Beans</option><option value="Packaging">Packaging</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Description</label>
              <textarea value={newMaterial.description} onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })} readOnly={!isEditable} className={`w-full px-3 py-2 border border-black h-24 text-sm resize-none ${!isEditable ? 'bg-gray-100 outline-none' : ''}`} />
            </div>
          </div>

          {isEditable && (
            <div className="flex gap-2 justify-end mt-8 border-t-2 border-black pt-4">
              <button onClick={() => { setIsEditable(false); if(viewMode==="ADD_MATERIAL") setViewMode("LIST"); }} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-sm">Cancel</button>
              <button onClick={handleSaveMaterial} disabled={!newMaterial.name || !newMaterial.category} className="px-6 py-2 border border-black bg-black text-white hover:invert font-bold uppercase text-sm disabled:opacity-50">
                {viewMode === "ADD_MATERIAL" ? "Save Master Data" : "Update Master Data"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================
         MÀN HÌNH 4: IMPORT MATERIAL (CREATE BATCH)
      ========================================= */}
      {viewMode === "IMPORT" && (
        <div className="bg-white border-2 border-black p-6 w-full shadow-sm max-w-5xl mx-auto mt-4">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Import Material (New Batch)</h2>
              <p className="text-xs uppercase text-gray-500 font-bold mt-1">Record inbound logistics and QC sensory profile</p>
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black hover:bg-gray-100 font-bold uppercase text-sm">
              Back to List
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: Logistics Data */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase border-b border-black pb-2 mb-4">1. Logistics Information</h3>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Select Material Master *</label>
                <select value={importData.materialId} onChange={(e) => setImportData({ ...importData, materialId: e.target.value })} className="w-full px-3 py-2 border border-black bg-white text-sm font-bold">
                  <option value="">-- Select Material --</option>
                  {materialMasters.map(m => <option key={m.id} value={m.id}>{m.id} - {m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Supplier *</label>
                  <select value={importData.supplier} onChange={(e) => setImportData({ ...importData, supplier: e.target.value })} className="w-full px-3 py-2 border border-black bg-white text-sm">
                    <option value="">-- Choose Supplier --</option>
                    {MOCK_SUPPLIERS.map(sup => <option key={sup} value={sup}>{sup}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Import Price (VNĐ) *</label>
                  <input type="number" value={importData.unitPrice} onChange={(e) => setImportData({ ...importData, unitPrice: e.target.value })} className="w-full px-3 py-2 border border-black text-sm font-mono" placeholder="Cost per Kg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Quantity (Kg) *</label>
                  <input type="number" value={importData.qty} onChange={(e) => setImportData({ ...importData, qty: e.target.value })} className="w-full px-3 py-2 border border-black text-sm font-mono font-bold" placeholder="Amount" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Import Date *</label>
                  <input type="date" value={importData.importDate} onChange={(e) => setImportData({ ...importData, importDate: e.target.value })} className="w-full px-3 py-2 border border-black text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Expiry Date *</label>
                  <input type="date" value={importData.expiryDate} onChange={(e) => setImportData({ ...importData, expiryDate: e.target.value })} className="w-full px-3 py-2 border border-black text-sm font-mono" />
                </div>
              </div>
            </div>

            {/* RIGHT: Sensory Profile */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black pb-2 mb-4">
                <h3 className="text-sm font-black uppercase">2. QC Sensory Profile</h3>
                <button 
                  onClick={handleAutoFillSensory} 
                  className="px-2 py-1 border border-black text-[10px] font-bold uppercase flex items-center gap-1 hover:bg-black hover:text-white transition-colors"
                  title="Copy scores from the latest batch of this material"
                >
                  <Copy size={12}/> Auto-fill Latest
                </button>
              </div>
              
              <div className="border border-black p-4 bg-gray-50 relative">
                {/* Visual Radar background */}
                <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
                  <Activity size={100} />
                </div>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 relative z-10">
                  {['bitter', 'sweet', 'sour', 'body'].map((attr) => (
                    <div key={attr}>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold uppercase">{attr}</label>
                        <span className="text-xs font-mono font-bold bg-white border border-black px-1">
                          {importSensory[attr as keyof SensoryData]}/10
                        </span>
                      </div>
                      <input 
                        type="range" min="1" max="10" step="1" 
                        value={importSensory[attr as keyof SensoryData]}
                        onChange={(e) => setImportSensory({ ...importSensory, [attr]: parseInt(e.target.value) })}
                        className="w-full accent-black cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-black pt-4 mt-4 relative z-10">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold uppercase mb-1">Caffeine (%)</label>
                    <input 
                      type="number" min="0" max="100" step="0.1"
                      value={importSensory.caffein}
                      onChange={(e) => setImportSensory({ ...importSensory, caffein: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-black text-sm font-mono bg-white"
                      placeholder="%"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase mb-1">Flavor Notes</label>
                    <input 
                      type="text" 
                      value={importSensory.flavor}
                      onChange={(e) => setImportSensory({ ...importSensory, flavor: e.target.value })}
                      className="w-full px-3 py-2 border border-black text-sm bg-white"
                      placeholder="e.g., Floral, Nutty..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-8 border-t-2 border-black pt-4">
            <button onClick={() => setViewMode("LIST")} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-sm">Cancel</button>
            <button onClick={handleImportMaterial} disabled={!importData.materialId || !importData.supplier || !importData.qty || !importData.expiryDate} className="px-8 py-2 border border-black bg-black text-white hover:invert font-bold uppercase text-sm disabled:opacity-50">
              Confirm & Save Batch
            </button>
          </div>
        </div>
      )}

      {/* =========================================
         MÀN HÌNH 5: EXPORT MATERIAL (USE BATCH)
      ========================================= */}
      {viewMode === "EXPORT" && (
        <div className="bg-white border-2 border-black p-6 w-full shadow-sm max-w-4xl mx-auto mt-4">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Export Material</h2>
              <p className="text-xs uppercase text-gray-500 font-bold mt-1">Deduct from specific batch</p>
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black hover:bg-gray-100 font-bold uppercase text-sm">
              Back to List
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Export Purpose *</label>
              <select value={exportData.type} onChange={(e) => setExportData({ ...exportData, type: e.target.value })} className="w-full px-3 py-2 border border-black bg-white text-sm font-bold">
                <option value="Production">Production Usage</option>
                <option value="Loss">Loss / Damage / Expired</option>
                <option value="Manual">Manual Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Select Material *</label>
              <select value={exportData.materialId} onChange={(e) => setExportData({ ...exportData, materialId: e.target.value, batchId: "" })} className="w-full px-3 py-2 border border-black bg-white text-sm">
                <option value="">-- Choose Material --</option>
                {materialMasters.map(m => <option key={m.id} value={m.id}>{m.id} - {m.name}</option>)}
              </select>
            </div>

            {exportData.materialId && (
              <div className="p-3 border-2 border-dashed border-black bg-gray-50">
                <label className="block text-xs font-bold uppercase mb-2">Select Source Batch *</label>
                {batchesForExport.length === 0 ? (
                  <p className="text-sm text-red-600 font-bold">No active batches available for this material.</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {batchesForExport.map(b => (
                      <label key={b.id} className={`flex items-center gap-3 p-2 border border-black cursor-pointer ${exportData.batchId === b.id ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}>
                        <input type="radio" name="exportBatch" value={b.id} checked={exportData.batchId === b.id} onChange={(e) => setExportData({ ...exportData, batchId: e.target.value })} className="hidden" />
                        <div className="flex-1 flex justify-between items-center text-sm">
                          <span className="font-mono font-bold">{b.id}</span>
                          <span className="font-mono">Rem: {b.remainingQty} Kg</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Deduct Quantity (Kg) *</label>
                <input type="number" value={exportData.qty} onChange={(e) => setExportData({ ...exportData, qty: e.target.value })} className="w-full px-3 py-2 border border-black text-sm font-mono" placeholder="Enter amount" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Reference Note</label>
                <input type="text" value={exportData.reference} onChange={(e) => setExportData({ ...exportData, reference: e.target.value })} className="w-full px-3 py-2 border border-black text-sm" placeholder="Order ID or Reason..." />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-8 border-t-2 border-black pt-4">
            <button onClick={() => setViewMode("LIST")} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-sm">Cancel</button>
            <button onClick={handleExportMaterial} disabled={!exportData.batchId || !exportData.qty} className="px-6 py-2 border border-black bg-black text-white hover:invert font-bold uppercase text-sm disabled:opacity-50">Confirm Export</button>
          </div>
        </div>
      )}

    </div>
  );
}