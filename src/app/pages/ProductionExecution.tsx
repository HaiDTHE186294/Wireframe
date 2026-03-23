import { useState, useMemo } from "react";
import { AlertTriangle, Blend, Beaker, Search, ChevronDown, ChevronRight, Package } from "lucide-react";

// --- INTERFACES ---
interface Variant {
  sku: string;
  name: string;
  weightInKg: number; 
}

interface ProductFamily {
  id: string;
  name: string;
  variants: Variant[];
}

export function ProductionExecution() {
  // --- STATE QUẢN LÝ NGUYÊN LIỆU ĐẦU VÀO (Bao gồm Used & Loss cho từng Batch) ---
  const [selectedInputs, setSelectedInputs] = useState<Record<string, { used: number, loss: number }>>({});
  const [materialSearch, setMaterialSearch] = useState("");
  
  // --- STATE QUẢN LÝ SẢN XUẤT ---
  const [manufacturingDate, setManufacturingDate] = useState(new Date().toISOString().split('T')[0]);

  // --- STATE QUẢN LÝ THÀNH PHẨM ĐẦU RA ---
  const [variantSearch, setVariantSearch] = useState("");
  const [expandedProducts, setExpandedProducts] = useState<string[]>([]);
  const [selectedOutputs, setSelectedOutputs] = useState<Record<string, number>>({}); 

  // --- DỮ LIỆU MOCK ---
  const availableBatches = [
    { id: "MAT-20260228-001", name: "Arabica Green Beans", stock: 500, unitCost: 250000 },
    { id: "MAT-20260227-005", name: "Robusta Green Beans", stock: 300, unitCost: 200000 },
    { id: "MAT-20260226-003", name: "Arabica Premium", stock: 200, unitCost: 400000 },
    { id: "MAT-20260225-002", name: "Peaberry Blend", stock: 150, unitCost: 280000 },
  ];

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
    if (family.name.toLowerCase().includes(variantSearch.toLowerCase())) {
      return family;
    }
    const matchingVariants = family.variants.filter(v => 
      v.sku.toLowerCase().includes(variantSearch.toLowerCase()) ||
      v.name.toLowerCase().includes(variantSearch.toLowerCase())
    );
    return { ...family, variants: matchingVariants };
  }).filter(family => family.variants.length > 0);

  // --- LOGIC TÍNH TOÁN ĐỘNG ---
  const calculations = useMemo(() => {
    // 1. Tính toán Đầu vào & Hao hụt
    let totalInputKg = 0;
    let totalLossKg = 0;
    let totalInputValue = 0;

    Object.entries(selectedInputs).forEach(([id, data]) => {
      if (data.used > 0) {
        const batch = availableBatches.find(b => b.id === id);
        if (batch) {
          totalInputKg += data.used;
          totalLossKg += data.loss;
          totalInputValue += data.used * batch.unitCost;
        }
      }
    });

    // Fix lỗi Javascript Floating Point (ví dụ: 0.30000000000004)
    totalInputKg = Number(totalInputKg.toFixed(2));
    totalLossKg = Number(totalLossKg.toFixed(2));

    const isBlending = Object.keys(selectedInputs).filter(k => selectedInputs[k].used > 0).length > 1;
    const avgUnitCost = totalInputKg > 0 ? totalInputValue / totalInputKg : 0;
    
    // Net yield sau rang
    const totalRoastedKg = Number(Math.max(0, totalInputKg - totalLossKg).toFixed(2));

    // 2. Tính toán Đầu ra & Giá vốn (COGS)
    let totalOutputKg = 0;
    let totalOutputUnits = 0;
    
    const skuWeightMap: Record<string, number> = {};
    productFamilies.forEach(f => f.variants.forEach(v => { skuWeightMap[v.sku] = v.weightInKg; }));

    Object.entries(selectedOutputs).forEach(([sku, qty]) => {
      if (qty > 0) {
        totalOutputUnits += qty;
        totalOutputKg += qty * (skuWeightMap[sku] || 0);
      }
    });

    totalOutputKg = Number(totalOutputKg.toFixed(2));

    // 3. Hàng rời còn dư (Sẽ lưu ở Product Batch)
    const leftoverBulkKg = Number(Math.max(0, totalRoastedKg - totalOutputKg).toFixed(2));
    const isOverPackaged = totalOutputKg > totalRoastedKg; // Cảnh báo đóng gói lố số hạt rang được

    // 4. Giá vốn bình quân trên 1 Kg Thành Phẩm (đã bao gồm hao hụt rang)
    const costPerRoastedKg = totalRoastedKg > 0 ? totalInputValue / totalRoastedKg : 0;

    return { 
      totalInputKg, totalLossKg, totalRoastedKg, totalInputValue, avgUnitCost, isBlending, 
      totalOutputUnits, totalOutputKg, leftoverBulkKg, isOverPackaged, costPerRoastedKg 
    };
  }, [selectedInputs, selectedOutputs]);

  // --- HANDLERS: INPUT ---
  const handleToggleBatch = (batchId: string, checked: boolean) => {
    const newInputs = { ...selectedInputs };
    if (checked) {
      newInputs[batchId] = { used: 0, loss: 0 }; 
    } else {
      delete newInputs[batchId]; 
    }
    setSelectedInputs(newInputs);
  };

  const handleInputChange = (batchId: string, field: 'used' | 'loss', qty: string, maxStock?: number) => {
    const val = parseFloat(qty);
    const safeVal = isNaN(val) || val < 0 ? 0 : val;
    
    setSelectedInputs(prev => {
      const currentData = prev[batchId] || { used: 0, loss: 0 };
      const updatedData = { ...currentData, [field]: safeVal };
      
      // Capping mức sử dụng tối đa bằng số tồn kho
      if (field === 'used' && maxStock !== undefined) {
        updatedData.used = Math.min(updatedData.used, maxStock);
      }
      
      return { ...prev, [batchId]: updatedData };
    });
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
          <button className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold text-sm uppercase transition-colors">
            Cancel
          </button>
          <button 
            disabled={calculations.totalInputKg === 0 || calculations.totalRoastedKg === 0 || calculations.isOverPackaged}
            className="px-6 py-2 border border-black bg-black text-white hover:invert font-bold text-sm uppercase disabled:opacity-30 disabled:hover:invert-0 transition-all"
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

            {/* Search Bar */}
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
            <div className="h-[320px] overflow-y-auto bg-white border-b border-black">
              {filteredBatches.length === 0 ? (
                <div className="p-4 text-center text-sm italic">No materials found.</div>
              ) : (
                filteredBatches.map((batch, index) => {
                  const isSelected = selectedInputs[batch.id] !== undefined;
                  const inputData = selectedInputs[batch.id];

                  return (
                    <div key={batch.id} className={`border-b border-gray-200 p-3 transition-colors ${isSelected ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}>
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
                              <p className="text-xs font-mono mt-1 text-gray-500">{batch.unitCost.toLocaleString()} ₫/kg</p>
                            </div>
                          </div>

                          {/* Khung nhập khối lượng xuất hiện khi được tick */}
                          {isSelected && (
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-300">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold uppercase mb-1">Raw Used (Kg):</label>
                                <input 
                                  type="number" min="0" step="0.1"
                                  value={inputData?.used || ""}
                                  onChange={(e) => handleInputChange(batch.id, 'used', e.target.value, batch.stock)}
                                  className="w-full px-2 py-1.5 border border-black text-right text-sm font-bold font-mono focus:outline-none focus:bg-white bg-gray-50"
                                  placeholder="0"
                                  autoFocus
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold uppercase mb-1 text-red-600">Loss (Kg):</label>
                                <input 
                                  type="number" min="0" step="0.1"
                                  value={inputData?.loss || ""}
                                  onChange={(e) => handleInputChange(batch.id, 'loss', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-red-400 text-right text-sm font-bold font-mono focus:outline-none focus:bg-red-50 bg-gray-50 text-red-600"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Summary Footer */}
            <div className="p-5 bg-white">
              <h3 className="text-xs font-bold uppercase mb-3 border-b border-black pb-1">Input & Yield Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Raw Input</p>
                  <p className="text-lg font-black font-mono">{calculations.totalInputKg} <span className="text-[10px]">Kg</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1">Total Loss</p>
                  <p className="text-lg font-black font-mono text-red-600">{calculations.totalLossKg} <span className="text-[10px]">Kg</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-1">Net Roasted</p>
                  <p className="text-lg font-black font-mono text-green-700">{calculations.totalRoastedKg} <span className="text-[10px]">Kg</span></p>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-dashed border-gray-300 pt-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Material Value</p>
                  <p className="text-sm font-bold font-mono">{calculations.totalInputValue.toLocaleString()} ₫</p>
                </div>
                {calculations.isBlending && (
                  <div className="text-right text-xs font-mono flex items-center gap-1 text-gray-600">
                    <Beaker size={12}/> AVG: {calculations.avgUnitCost.toLocaleString(undefined, {maximumFractionDigits:0})} ₫/KG
                  </div>
                )}
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
                className="w-full px-3 py-2 border border-black text-sm font-mono font-bold outline-none focus:border-dashed" 
              />
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: OUTPUT ================= */}
        <div className="space-y-6">
          
          {/* Step 3: Packaging */}
          <div className="border border-black bg-white flex flex-col h-full">
            <div className="border-b border-black p-3 bg-gray-50 flex items-center gap-2">
              <Package size={16}/>
              <h2 className="font-bold uppercase text-sm tracking-wider">Step 3: Packaging (Variants)</h2>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="border border-black p-3 mb-4">
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
                      if (e.target.value) setExpandedProducts(productFamilies.map(f => f.id));
                    }}
                  />
                </div>
                
                {/* Variant Accordion List */}
                <div className="max-h-[240px] overflow-y-auto border border-black bg-white">
                  {filteredFamilies.length === 0 ? (
                     <div className="p-3 text-center text-sm italic text-gray-500">No variants found.</div>
                  ) : (
                    filteredFamilies.map((family) => {
                      const isExpanded = expandedProducts.includes(family.id);
                      return (
                        <div key={family.id} className="border-b border-black last:border-b-0">
                          <div 
                            onClick={() => toggleProductExpand(family.id)}
                            className="p-3 bg-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                          >
                            <span className="font-bold text-sm uppercase">{family.name}</span>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                          
                          {isExpanded && (
                            <div className="bg-white border-t border-black">
                              {family.variants.map((variant) => {
                                const isSelected = selectedOutputs[variant.sku] !== undefined;
                                return (
                                  <div key={variant.sku} className={`p-3 border-b border-gray-200 last:border-b-0 flex items-center gap-3 transition-colors ${isSelected ? 'bg-black text-white' : 'hover:bg-gray-50'}`}>
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

              {/* Nhập số lượng cho các Variant đã chọn */}
              {Object.keys(selectedOutputs).length > 0 ? (
                <div className="border border-black p-3 bg-gray-50 space-y-2 flex-1">
                  <h3 className="text-xs font-bold uppercase border-b border-black pb-2 mb-2">Packaged Quantities</h3>
                  {Object.keys(selectedOutputs).map(sku => (
                    <div key={sku} className="flex items-center justify-between bg-white border border-gray-300 p-2">
                      <div>
                        <p className="font-mono font-bold text-sm">{sku}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{getVariantWeight(sku)} Kg / Unit</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" min="0" step="1"
                          value={selectedOutputs[sku] || ""}
                          onChange={(e) => handleOutputQtyChange(sku, e.target.value)}
                          className="w-20 px-2 py-1 border border-black text-right text-sm font-bold font-mono outline-none focus:border-dashed"
                          placeholder="0"
                        />
                        <span className="text-xs font-bold uppercase w-10">Units</span>
                      </div>
                    </div>
                  ))}
                  
                  {calculations.isOverPackaged && (
                     <div className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1 mt-3 p-2 bg-red-50 border border-red-200">
                        <AlertTriangle size={12}/> Packaged weight exceeds Net Roasted Yield!
                     </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t border-black border-dashed mt-2">
                    <span className="text-xs font-bold uppercase">Total Equivalent Weight:</span>
                    <span className="font-mono font-bold text-sm">{calculations.totalOutputKg} Kg</span>
                  </div>
                </div>
              ) : (
                <div className="border border-black border-dashed flex-1 flex items-center justify-center bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest min-h-[100px]">
                  No Variants Selected
                </div>
              )}
            </div>
          </div>

          {/* Step 4: System Generation & Costing */}
          <div className="border-2 border-black bg-white p-6">
            <h2 className="font-bold uppercase text-sm mb-4 border-b border-black pb-2 tracking-wider">4. Inventory & Cost Preview</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-dashed border-gray-300 pb-2">
                <span className="text-xs uppercase font-bold text-gray-500">Total Packaged Weight</span>
                <span className="font-mono text-sm">{calculations.totalOutputKg} Kg</span>
              </div>
              
              <div className="flex justify-between items-end border-b border-dashed border-gray-300 pb-2">
                <div>
                  <span className="block text-xs uppercase font-bold">Unpackaged Leftover (Bulk)</span>
                  <span className="text-[10px] text-gray-500 uppercase">Stored automatically in Product Batch</span>
                </div>
                <span className={`font-mono text-lg font-bold ${calculations.leftoverBulkKg > 0 ? 'text-black' : 'text-gray-400'}`}>
                  {calculations.leftoverBulkKg} Kg
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <span className="block text-xs uppercase font-bold tracking-widest border-b border-black pb-2 mb-2">Estimated Unit COGS</span>
                {Object.keys(selectedOutputs).length === 0 ? (
                  <p className="text-[10px] italic text-gray-500">Select variants to view cost breakdown...</p>
                ) : (
                  Object.keys(selectedOutputs).map(sku => {
                    const weight = getVariantWeight(sku);
                    const unitCogs = calculations.costPerRoastedKg * weight;
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

        </div>
      </div>
    </div>
  );
}