import { useState, useMemo } from "react";
import { AlertTriangle, Blend, Beaker, Search } from "lucide-react";

export function ProductionExecution() {
  // --- STATE QUẢN LÝ NGUYÊN LIỆU ĐẦU VÀO ---
  const [selectedInputs, setSelectedInputs] = useState<Record<string, number>>({});
  const [materialSearch, setMaterialSearch] = useState(""); // State search nguyên liệu
  
  // --- STATE QUẢN LÝ THÀNH PHẨM ĐẦU RA ---
  const [targetVariant, setTargetVariant] = useState("");
  const [variantSearch, setVariantSearch] = useState(""); // State search thành phẩm

  const [roastProfile, setRoastProfile] = useState("");
  const [finishedQty, setFinishedQty] = useState("");
  const [lossQty, setLossQty] = useState("");

  // Dữ liệu Mock
  const availableBatches = [
    { id: "MAT-20260228-001", name: "Arabica Green Beans", stock: 500, unitCost: 250000 },
    { id: "MAT-20260227-005", name: "Robusta Green Beans", stock: 300, unitCost: 200000 },
    { id: "MAT-20260226-003", name: "Arabica Premium", stock: 200, unitCost: 400000 },
    { id: "MAT-20260225-002", name: "Peaberry Blend", stock: 150, unitCost: 280000 },
  ];

  const productVariants = [
    { sku: "SIG-250-W", name: "Signature Blend - 250g - Whole Bean" },
    { sku: "SIG-500-GP", name: "Signature Blend - 500g - Ground Phin" },
    { sku: "ACD-500-W", name: "Arabica Cầu Đất - 500g - Whole Bean" },
    { sku: "ACD-250-GM", name: "Arabica Cầu Đất - 250g - Ground Machine" },
  ];

  // --- LOGIC LỌC TÌM KIẾM ---
  const filteredBatches = availableBatches.filter(
    b => b.name.toLowerCase().includes(materialSearch.toLowerCase()) || 
         b.id.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const filteredVariants = productVariants.filter(
    v => v.name.toLowerCase().includes(variantSearch.toLowerCase()) || 
         v.sku.toLowerCase().includes(variantSearch.toLowerCase())
  );

  // --- LOGIC TÍNH TOÁN ĐỘNG (DYNAMIC CALCULATIONS) ---
  const calculations = useMemo(() => {
    let totalKg = 0;
    let totalValue = 0;

    Object.entries(selectedInputs).forEach(([id, qty]) => {
      if (qty > 0) {
        const batch = availableBatches.find(b => b.id === id);
        if (batch) {
          totalKg += qty;
          totalValue += qty * batch.unitCost;
        }
      }
    });

    const isBlending = Object.keys(selectedInputs).filter(k => selectedInputs[k] > 0).length > 1;
    const avgUnitCost = totalKg > 0 ? totalValue / totalKg : 0;
    
    const loss = parseFloat(lossQty) || 0;
    const lossPercentage = totalKg > 0 ? (loss / totalKg) * 100 : 0;
    const isLossWarning = lossPercentage > 20;

    const finished = parseFloat(finishedQty) || 0;
    const cogsPerUnit = finished > 0 ? totalValue / finished : 0;

    return { totalKg, totalValue, avgUnitCost, isBlending, lossPercentage, isLossWarning, cogsPerUnit };
  }, [selectedInputs, lossQty, finishedQty]);

  // --- HANDLERS ---
  const handleToggleBatch = (batchId: string, checked: boolean) => {
    const newInputs = { ...selectedInputs };
    if (checked) {
      newInputs[batchId] = 0; 
    } else {
      delete newInputs[batchId]; 
    }
    setSelectedInputs(newInputs);
  };

  const handleQtyChange = (batchId: string, qty: string, maxStock: number) => {
    const val = parseFloat(qty);
    const safeVal = isNaN(val) ? 0 : Math.min(val, maxStock); 
    setSelectedInputs({ ...selectedInputs, [batchId]: safeVal });
  };

  return (
    <div className="pb-10 max-w-7xl mx-auto bg-white text-black">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Production Execution</h1>
          <p className="text-sm font-bold mt-1 uppercase tracking-widest text-gray-600">Create Product Batch</p>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold text-sm uppercase">
            Cancel
          </button>
          <button 
            disabled={calculations.totalKg === 0 || !targetVariant || !finishedQty}
            className="px-6 py-2 border border-black bg-black text-white hover:bg-gray-800 font-bold text-sm uppercase disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Complete Production
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ================= LEFT COLUMN: INPUT ================= */}
        <div className="space-y-6">
          
          {/* Step 1: Material Selection & Blending */}
          <div className="border border-black bg-white">
            <div className="border-b border-black p-3 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold uppercase text-sm tracking-wider">Step 1: Material Input</h2>
              {calculations.isBlending && (
                <span className="flex items-center gap-1 text-[10px] border border-black bg-black text-white px-2 py-0.5 font-bold uppercase tracking-widest">
                  <Blend size={12} /> Auto-Blend Mode
                </span>
              )}
            </div>

            {/* Search Bar cho Nguyên liệu */}
            <div className="p-3 border-b border-black bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={14} />
                <input 
                  type="text" 
                  placeholder="Search material by name or ID..." 
                  className="w-full pl-9 pr-3 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black"
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                />
              </div>
            </div>
            
            {/* List Nguyên liệu có đánh số thứ tự */}
            <div className="h-[280px] overflow-y-auto bg-white">
              {filteredBatches.length === 0 ? (
                <div className="p-4 text-center text-sm italic border-b border-black">No materials found.</div>
              ) : (
                filteredBatches.map((batch, index) => {
                  const isSelected = selectedInputs[batch.id] !== undefined;
                  return (
                    <div key={batch.id} className={`border-b border-black p-3 transition-colors ${isSelected ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}>
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-sm font-bold pt-0.5 w-4">{index + 1}.</span>
                        
                        <input 
                          type="checkbox" 
                          id={`batch-${batch.id}`}
                          className="mt-1 w-4 h-4 border-2 border-black accent-black cursor-pointer"
                          checked={isSelected}
                          onChange={(e) => handleToggleBatch(batch.id, e.target.checked)}
                        />
                        
                        <div className="flex-1">
                          <label htmlFor={`batch-${batch.id}`} className="flex justify-between items-center mb-1 cursor-pointer">
                            <span className="font-bold text-sm uppercase">{batch.name}</span>
                            <span className="text-xs font-mono border border-black px-2 py-0.5 bg-white">STOCK: {batch.stock} KG</span>
                          </label>

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs font-mono">{batch.id}</p>
                              <p className="text-xs font-mono">{batch.unitCost.toLocaleString()} ₫/kg</p>
                            </div>
                            
                            {/* Khung nhập khối lượng xuất hiện khi được tick */}
                            {isSelected && (
                              <div className="flex items-center gap-2 mt-2">
                                <label className="text-xs font-bold uppercase">Use (Kg):</label>
                                <input 
                                  type="number" 
                                  value={selectedInputs[batch.id] || ""}
                                  onChange={(e) => handleQtyChange(batch.id, e.target.value, batch.stock)}
                                  className="w-20 px-2 py-1 border border-black text-right text-sm font-bold font-mono focus:outline-none focus:bg-white bg-gray-50"
                                  placeholder="0"
                                  autoFocus
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Summary Footer */}
            <div className="p-4 bg-white border-t-2 border-black">
              <h3 className="text-xs font-bold uppercase mb-2">Input Summary</h3>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-black font-mono">{calculations.totalKg} <span className="text-xs font-bold uppercase tracking-widest">Kg Total</span></p>
                  {calculations.isBlending && <p className="text-xs font-mono mt-1 flex items-center gap-1"><Beaker size={12}/> AVG COST: {calculations.avgUnitCost.toLocaleString(undefined, {maximumFractionDigits:0})} ₫/KG</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest">Total Value</p>
                  <p className="text-lg font-bold font-mono">{calculations.totalValue.toLocaleString()} ₫</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Roasting */}
          <div className="border border-black p-4 bg-white">
            <h2 className="font-bold uppercase text-sm mb-4 border-b border-black pb-2 tracking-wider">Step 2: Roasting Config</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Roast Profile</label>
                <select value={roastProfile} onChange={(e) => setRoastProfile(e.target.value)} className="w-full px-3 py-2 border border-black bg-white text-sm font-bold uppercase">
                  <option value="">-- SELECT --</option>
                  <option value="light">Light Roast</option>
                  <option value="medium">Medium Roast</option>
                  <option value="dark">Dark Roast</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Production Date</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-black text-sm font-mono font-bold" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: OUTPUT ================= */}
        <div className="space-y-6">
          
          {/* Step 3: Output & Yield */}
          <div className="border border-black bg-white">
            <div className="border-b border-black p-3 bg-gray-50">
              <h2 className="font-bold uppercase text-sm tracking-wider">Step 3: Target Output & Yield</h2>
            </div>

            <div className="p-4 space-y-5">
              {/* Vùng chọn Target Variant dạng List Search */}
              <div className="border border-black p-3">
                <label className="block text-xs font-bold uppercase mb-2">Target Product (Select 1)</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search SKU or Name..." 
                    className="w-full pl-9 pr-3 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black"
                    value={variantSearch}
                    onChange={(e) => setVariantSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-[160px] overflow-y-auto border border-black bg-white">
                  {filteredVariants.length === 0 ? (
                     <div className="p-3 text-center text-sm italic">No variants found.</div>
                  ) : (
                    filteredVariants.map((variant, index) => {
                      const isActive = targetVariant === variant.sku;
                      return (
                        <div 
                          key={variant.sku} 
                          onClick={() => setTargetVariant(variant.sku)}
                          className={`p-3 border-b border-black cursor-pointer flex items-start gap-2 transition-colors ${isActive ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                        >
                          <span className="font-mono text-sm w-4 pt-0.5">{index + 1}.</span>
                          <div>
                            <p className="font-bold text-sm font-mono">{variant.sku}</p>
                            <p className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-600'}`}>{variant.name}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Finished Qty (Units) *</label>
                  <input type="number" value={finishedQty} onChange={(e) => setFinishedQty(e.target.value)} className="w-full px-3 py-2 border border-black text-sm font-mono font-bold" placeholder="e.g. 500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Loss Quantity (Kg)</label>
                  <input type="number" value={lossQty} onChange={(e) => setLossQty(e.target.value)} className={`w-full px-3 py-2 text-sm font-mono font-bold ${calculations.isLossWarning ? "border-2 border-dashed border-black bg-gray-100" : "border border-black"}`} placeholder="Weight loss..." />
                </div>
              </div>

              {/* Loss Warning Logic */}
              {calculations.isLossWarning && (
                <div className="p-3 border-2 border-dashed border-black bg-white flex gap-2 items-start">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase">High Loss Warning</p>
                    <p className="text-xs">Loss rate is <b>{calculations.lossPercentage.toFixed(1)}%</b> (Exceeds standard 20%). Please verify input weights.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: System Generation & Costing */}
          <div className="border-2 border-black bg-white p-6">
            <h2 className="font-bold uppercase text-sm mb-4 border-b border-black pb-2 tracking-wider">Step 4: Financial Preview</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-dashed border-black pb-3">
                <span className="text-xs uppercase font-bold tracking-widest">Generated Lot Code</span>
                <span className="font-mono text-lg font-bold">LOT-{new Date().toISOString().split('T')[0].replace(/-/g, '')}-01</span>
              </div>

              <div className="flex justify-between items-end border-b border-dashed border-black pb-3">
                <span className="text-xs uppercase font-bold tracking-widest">Total Material Cost</span>
                <span className="font-mono text-lg">{calculations.totalValue.toLocaleString()} ₫</span>
              </div>

              <div className="flex justify-between items-end pt-2">
                <div>
                  <span className="block text-xs uppercase font-bold tracking-widest">Unit COGS (Giá vốn/SP)</span>
                  <span className="text-[10px] font-mono">Cost ÷ {finishedQty || 0} Units</span>
                </div>
                <span className="font-mono text-3xl font-black">
                  {calculations.cogsPerUnit.toLocaleString(undefined, {maximumFractionDigits:0})} ₫
                </span>
              </div>
            </div>
          </div>
          
          {/* Note to grading panel */}
          {calculations.isBlending && (
            <p className="text-xs border border-black p-3 italic uppercase font-bold text-center bg-gray-50">
              * System will generate an auto-mix inventory transaction to maintain 1-to-1 DB integrity.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}