import { useState, useMemo } from "react";
import { AlertTriangle, Blend, Beaker, Search, ChevronDown, ChevronRight } from "lucide-react";

// --- INTERFACES ---
interface Variant {
  sku: string;
  name: string;
  weightInKg: number; // Trọng lượng 1 sản phẩm để tính toán giá vốn
}

interface ProductFamily {
  id: string;
  name: string;
  variants: Variant[];
}

export function ProductionExecution() {
  // --- STATE QUẢN LÝ NGUYÊN LIỆU ĐẦU VÀO ---
  const [selectedInputs, setSelectedInputs] = useState<Record<string, number>>({});
  const [materialSearch, setMaterialSearch] = useState("");
  
  // --- STATE QUẢN LÝ THÀNH PHẨM ĐẦU RA ---
  const [variantSearch, setVariantSearch] = useState("");
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]); // Quản lý đóng/mở Product
  const [selectedOutputs, setSelectedOutputs] = useState<Record<string, number>>({}); // { sku: qty }

  const [manufacturingDate, setManufacturingDate] = useState(new Date().toISOString().split('T')[0]);
  const [lossQty, setLossQty] = useState("");

  // --- DỮ LIỆU MOCK ---
  const availableBatches = [
    { id: "MAT-20260228-001", name: "Arabica Green Beans", stock: 500, unitCost: 250000 },
    { id: "MAT-20260227-005", name: "Robusta Green Beans", stock: 300, unitCost: 200000 },
    { id: "MAT-20260226-003", name: "Arabica Premium", stock: 200, unitCost: 400000 },
    { id: "MAT-20260225-002", name: "Peaberry Blend", stock: 150, unitCost: 280000 },
  ];

  // Data Output cấu trúc lại theo Product -> Variants
  const productFamilies: ProductFamily[] = [
    {
      id: "PROD-SIG",
      name: "Signature Blend",
      variants: [
        { sku: "SIG-250-W", name: "250g - Whole Bean", weightInKg: 0.25 },
        { sku: "SIG-500-GP", name: "500g - Ground Phin", weightInKg: 0.5 },
        { sku: "SIG-1000-W", name: "1Kg - Whole Bean", weightInKg: 1 },
      ]
    },
    {
      id: "PROD-ACD",
      name: "Arabica Cầu Đất",
      variants: [
        { sku: "ACD-250-GM", name: "250g - Ground Machine", weightInKg: 0.25 },
        { sku: "ACD-500-W", name: "500g - Whole Bean", weightInKg: 0.5 },
      ]
    }
  ];

  // --- LOGIC LỌC TÌM KIẾM ---
  const filteredBatches = availableBatches.filter(
    b => b.name.toLowerCase().includes(materialSearch.toLowerCase()) || 
         b.id.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const filteredFamilies = productFamilies.map(family => {
    // Nếu tìm kiếm khớp Product Name thì trả về full variants
    if (family.name.toLowerCase().includes(variantSearch.toLowerCase())) {
      return family;
    }
    // Nếu không, lọc các variants khớp với từ khóa
    const matchingVariants = family.variants.filter(v => 
      v.sku.toLowerCase().includes(variantSearch.toLowerCase()) ||
      v.name.toLowerCase().includes(variantSearch.toLowerCase())
    );
    return { ...family, variants: matchingVariants };
  }).filter(family => family.variants.length > 0); // Chỉ giữ lại Product có variant khớp

  // --- LOGIC TÍNH TOÁN ĐỘNG ---
  const calculations = useMemo(() => {
    // 1. Tính toán Đầu vào
    let totalInputKg = 0;
    let totalInputValue = 0;

    Object.entries(selectedInputs).forEach(([id, qty]) => {
      if (qty > 0) {
        const batch = availableBatches.find(b => b.id === id);
        if (batch) {
          totalInputKg += qty;
          totalInputValue += qty * batch.unitCost;
        }
      }
    });

    const isBlending = Object.keys(selectedInputs).filter(k => selectedInputs[k] > 0).length > 1;
    const avgUnitCost = totalInputKg > 0 ? totalInputValue / totalInputKg : 0;
    
    // 2. Tính toán Hao hụt
    const loss = parseFloat(lossQty) || 0;
    const lossPercentage = totalInputKg > 0 ? (loss / totalInputKg) * 100 : 0;
    const isLossWarning = lossPercentage > 20;

    // 3. Tính toán Đầu ra & Giá vốn (COGS)
    let totalOutputKg = 0;
    let totalOutputUnits = 0;
    
    // Tạo map mapping SKU -> Weight để tính tổng Kg thành phẩm
    const skuWeightMap: Record<string, number> = {};
    productFamilies.forEach(f => f.variants.forEach(v => { skuWeightMap[v.sku] = v.weightInKg; }));

    Object.entries(selectedOutputs).forEach(([sku, qty]) => {
      if (qty > 0) {
        totalOutputUnits += qty;
        totalOutputKg += qty * (skuWeightMap[sku] || 0);
      }
    });

    // Giá vốn bình quân trên 1 Kg Thành Phẩm (đã cộng hao hụt)
    const costPerFinishedKg = totalOutputKg > 0 ? totalInputValue / totalOutputKg : 0;

    return { 
      totalInputKg, totalInputValue, avgUnitCost, isBlending, 
      lossPercentage, isLossWarning, 
      totalOutputUnits, totalOutputKg, costPerFinishedKg 
    };
  }, [selectedInputs, selectedOutputs, lossQty]);

  // --- HANDLERS: INPUT ---
  const handleToggleBatch = (batchId: string, checked: boolean) => {
    const newInputs = { ...selectedInputs };
    if (checked) newInputs[batchId] = 0; 
    else delete newInputs[batchId]; 
    setSelectedInputs(newInputs);
  };

  const handleInputQtyChange = (batchId: string, qty: string, maxStock: number) => {
    const val = parseFloat(qty);
    const safeVal = isNaN(val) ? 0 : Math.min(val, maxStock); 
    setSelectedInputs({ ...selectedInputs, [batchId]: safeVal });
  };

  // --- HANDLERS: OUTPUT ---
  const toggleProductExpand = (productId: string) => {
    setExpandedProducts(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleToggleOutputVariant = (sku: string, checked: boolean) => {
    const newOutputs = { ...selectedOutputs };
    if (checked) newOutputs[sku] = 0;
    else delete newOutputs[sku];
    setSelectedOutputs(newOutputs);
  };

  const handleOutputQtyChange = (sku: string, qty: string) => {
    const val = parseInt(qty, 10);
    const safeVal = isNaN(val) || val < 0 ? 0 : val;
    setSelectedOutputs({ ...selectedOutputs, [sku]: safeVal });
  };

  // Tìm weight của 1 SKU để render UI
  const getVariantWeight = (sku: string) => {
    for (const f of productFamilies) {
      const v = f.variants.find(va => va.sku === sku);
      if (v) return v.weightInKg;
    }
    return 0;
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
            disabled={calculations.totalInputKg === 0 || calculations.totalOutputUnits === 0}
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
            
            {/* List Nguyên liệu */}
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
                            
                            {/* Khung nhập khối lượng */}
                            {isSelected && (
                              <div className="flex items-center gap-2 mt-2">
                                <label className="text-xs font-bold uppercase">Use (Kg):</label>
                                <input 
                                  type="number" 
                                  value={selectedInputs[batch.id] || ""}
                                  onChange={(e) => handleInputQtyChange(batch.id, e.target.value, batch.stock)}
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
                  <p className="text-2xl font-black font-mono">{calculations.totalInputKg} <span className="text-xs font-bold uppercase tracking-widest">Kg Total</span></p>
                  {calculations.isBlending && <p className="text-xs font-mono mt-1 flex items-center gap-1"><Beaker size={12}/> AVG COST: {calculations.avgUnitCost.toLocaleString(undefined, {maximumFractionDigits:0})} ₫/KG</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-widest">Total Value</p>
                  <p className="text-lg font-bold font-mono">{calculations.totalInputValue.toLocaleString()} ₫</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Production Details */}
          <div className="border border-black p-4 bg-white">
            <h2 className="font-bold uppercase text-sm mb-4 border-b border-black pb-2 tracking-wider">Step 2: Production Details</h2>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Manufacturing Date *</label>
              <input 
                type="date" 
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm font-mono font-bold" 
              />
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
              {/* Vùng chọn Output Variants (Multiselect) */}
              <div className="border border-black p-3">
                <label className="block text-xs font-bold uppercase mb-2">Target Product Variants</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search SKU or Name..." 
                    className="w-full pl-9 pr-3 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black"
                    value={variantSearch}
                    onChange={(e) => {
                      setVariantSearch(e.target.value);
                      // Auto expand all when searching
                      if (e.target.value) {
                        setExpandedProducts(productFamilies.map(f => f.id));
                      }
                    }}
                  />
                </div>
                
                {/* Variant Accordion List */}
                <div className="max-h-[240px] overflow-y-auto border border-black bg-white">
                  {filteredFamilies.length === 0 ? (
                     <div className="p-3 text-center text-sm italic">No variants found.</div>
                  ) : (
                    filteredFamilies.map((family) => {
                      const isExpanded = expandedProducts.includes(family.id);
                      return (
                        <div key={family.id} className="border-b border-black last:border-b-0">
                          {/* Parent Row */}
                          <div 
                            onClick={() => toggleProductExpand(family.id)}
                            className="p-3 bg-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                          >
                            <span className="font-bold text-sm uppercase">{family.name}</span>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                          
                          {/* Children Rows (Variants) */}
                          {isExpanded && (
                            <div className="bg-white border-t border-black">
                              {family.variants.map((variant) => {
                                const isSelected = selectedOutputs[variant.sku] !== undefined;
                                return (
                                  <div key={variant.sku} className={`p-3 border-b border-gray-200 last:border-b-0 transition-colors flex items-center gap-3 ${isSelected ? 'bg-black text-white' : 'hover:bg-gray-50'}`}>
                                    <input 
                                      type="checkbox" 
                                      id={`output-${variant.sku}`}
                                      className={`w-4 h-4 border-2 cursor-pointer ${isSelected ? 'accent-white' : 'border-black accent-black'}`}
                                      checked={isSelected}
                                      onChange={(e) => handleToggleOutputVariant(variant.sku, e.target.checked)}
                                    />
                                    <label htmlFor={`output-${variant.sku}`} className="flex-1 cursor-pointer">
                                      <div className="font-mono text-sm font-bold">{variant.sku}</div>
                                      <div className={`text-xs mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>{variant.name}</div>
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Khung nhập số lượng cho từng Output đã chọn */}
              {Object.keys(selectedOutputs).length > 0 && (
                <div className="border border-black p-3 bg-gray-50 space-y-3">
                  <h3 className="text-xs font-bold uppercase border-b border-black pb-2 mb-2">Produced Quantities</h3>
                  {Object.keys(selectedOutputs).map(sku => (
                    <div key={sku} className="flex items-center justify-between bg-white border border-black p-2">
                      <div className="flex-1">
                        <p className="font-mono font-bold text-sm">{sku}</p>
                        <p className="text-[10px] text-gray-500">Weight: {getVariantWeight(sku)} kg/unit</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" min="0" step="1"
                          value={selectedOutputs[sku] || ""}
                          onChange={(e) => handleOutputQtyChange(sku, e.target.value)}
                          className="w-24 px-2 py-1 border border-black text-right text-sm font-bold font-mono focus:outline-none focus:ring-1 focus:ring-black"
                          placeholder="0"
                        />
                        <span className="text-xs font-bold uppercase w-10">Units</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-black border-dashed mt-2">
                    <span className="text-xs font-bold uppercase">Total Equivalent Weight:</span>
                    <span className="font-mono font-bold text-sm">{calculations.totalOutputKg} Kg</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Loss Quantity (Kg)</label>
                <input 
                  type="number" min="0" step="0.1"
                  value={lossQty} 
                  onChange={(e) => setLossQty(e.target.value)} 
                  className={`w-full px-3 py-2 text-sm font-mono font-bold ${calculations.isLossWarning ? "border-2 border-dashed border-red-600 bg-red-50 text-red-600" : "border border-black"}`} 
                  placeholder="Estimated roasting loss weight..." 
                />
              </div>

              {/* Loss Warning Logic */}
              {calculations.isLossWarning && (
                <div className="p-3 border border-red-600 bg-red-50 flex gap-2 items-start text-red-700">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black uppercase">High Loss Warning</p>
                    <p className="text-xs">Loss rate is <b>{calculations.lossPercentage.toFixed(1)}%</b> (Exceeds standard 20%). Please verify input weights and roasting logs.</p>
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
                <span className="text-xs uppercase font-bold tracking-widest">Total Material Cost</span>
                <span className="font-mono text-lg">{calculations.totalInputValue.toLocaleString()} ₫</span>
              </div>

              <div className="pt-2 space-y-3">
                <span className="block text-xs uppercase font-bold tracking-widest border-b border-black pb-2 mb-2">Estimated Unit COGS (Giá vốn/SP)</span>
                {Object.keys(selectedOutputs).length === 0 ? (
                  <p className="text-[10px] italic text-gray-500">Select output products to view cost breakdown...</p>
                ) : (
                  Object.keys(selectedOutputs).map(sku => {
                    const weight = getVariantWeight(sku);
                    // Giá vốn của 1 đơn vị = Giá bình quân 1Kg thành phẩm * Trọng lượng 1 đơn vị
                    const unitCogs = calculations.costPerFinishedKg * weight;
                    return (
                      <div key={sku} className="flex justify-between items-center bg-gray-50 p-2 border border-gray-200">
                        <span className="font-mono text-xs">{sku}</span>
                        <span className="font-mono font-black">
                          {unitCogs.toLocaleString(undefined, {maximumFractionDigits:0})} ₫
                        </span>
                      </div>
                    )
                  })
                )}
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