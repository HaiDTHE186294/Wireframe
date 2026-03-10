import { 
  TrendingUp, 
  ShoppingCart, 
  Factory, 
  Lock, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Package, 
  Truck 
} from "lucide-react";

export function Dashboard() {
  // --- MOCK DATA ---
  const kpis = [
    { label: "Total Revenue (30 Days)", value: "450,000,000 ₫", subtext: "+15% vs last month", icon: TrendingUp },
    { label: "Total Orders", value: "127", subtext: "42 B2B / 85 B2C", icon: ShoppingCart },
    { label: "Roasted Batches", value: "34", subtext: "Total volume: 850kg", icon: Factory },
    { label: "QC Locked Lots", value: "2", subtext: "Requires immediate action", icon: Lock },
  ];

  const orderPipeline = [
    { stage: "Pending Approval", count: 3, icon: Clock, alert: true },
    { stage: "Awaiting Stock", count: 12, icon: AlertTriangle, alert: true }, // Nút thắt cổ chai (Cần xưởng rang)
    { stage: "Packing", count: 18, icon: Package, alert: false },
    { stage: "Shipping", count: 45, icon: Truck, alert: false },
  ];

  const topProducts = [
    { name: "Signature Blend 500g (Hạt)", sales: 2500 },
    { name: "Arabica Cầu Đất 1kg (Hạt)", sales: 1800 },
    { name: "Robusta Honey 500g (Pha Phin)", sales: 1500 },
    { name: "Cold Brew Blend 250g", sales: 1200 },
    { name: "Decaf Special 250g", sales: 900 },
  ];
  const maxSales = Math.max(...topProducts.map((p) => p.sales));

  const actionItems = [
    { id: 1, type: "urgent", text: "3 B2B Orders exceed 20M ₫ limit and require CEO approval.", time: "10 mins ago" },
    { id: 2, type: "urgent", text: "12 Orders are Awaiting Stock (Missing: Arabica Cầu Đất 1kg). Initiate roasting immediately.", time: "1 hour ago" },
    { id: 3, type: "warning", text: "Raw Material MAT-M001 (Arabica Green) is below minimum threshold (Remaining: 45kg).", time: "2 hours ago" },
    { id: 4, type: "warning", text: "Product Lot LOT-20260228-001 was locked. 2 pending orders contain this lot.", time: "3 hours ago" },
    { id: 5, type: "info", text: "Production Batch BAT-005 (Medium Roast) completed successfully.", time: "5 hours ago" },
  ];

  return (
    <div className="bg-white text-black pb-10">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-black flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold">Executive Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Katat Coffee Roastery - Real-time Operations & Analytics</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-bold uppercase mb-1">System Status</p>
          <div className="flex items-center gap-2 border border-black px-3 py-1 bg-gray-50">
            <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
            <span className="text-xs font-mono font-bold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isWarning = kpi.label === "QC Locked Lots" && parseInt(kpi.value) > 0;
          return (
            <div key={idx} className={`border border-black p-4 ${isWarning ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-3 text-gray-600">
                <span className="text-xs font-bold uppercase">{kpi.label}</span>
                <Icon size={16} className={isWarning ? "text-black" : "text-gray-400"} />
              </div>
              <p className="text-2xl font-bold font-mono mb-1">{kpi.value}</p>
              <p className={`text-xs ${isWarning ? 'font-bold text-black' : 'text-gray-500'}`}>{kpi.subtext}</p>
            </div>
          );
        })}
      </div>

      {/* Row 2: Charts & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Left: Revenue Chart Placeholder */}
        <div className="border border-black bg-white">
          <div className="p-4 border-b border-black flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-sm">Revenue Snapshot (30 Days)</h2>
            <select className="text-xs border border-black bg-white px-2 py-1 outline-none">
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="p-6 h-64 flex flex-col items-center justify-end bg-white">
            <div className="flex items-end justify-between w-full h-40 gap-2 border-b border-black pb-1">
              {[40, 55, 45, 70, 65, 85, 95, 80, 60, 75, 90, 100].map((height, i) => (
                <div key={i} className="flex-1 bg-black hover:bg-gray-700 transition-colors relative group" style={{ height: `${height}%` }}>
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-black text-white px-1">
                    {height}M
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between w-full mt-2 text-[10px] font-mono text-gray-500">
              <span>Day 1</span>
              <span>Day 15</span>
              <span>Day 30</span>
            </div>
          </div>
        </div>

        {/* Right: Order Fulfillment Pipeline */}
        <div className="border border-black bg-white flex flex-col">
          <div className="p-4 border-b border-black bg-gray-50">
            <h2 className="font-bold text-sm">Order Fulfillment Pipeline</h2>
            <p className="text-xs text-gray-500 mt-1">Current bottlenecks in operations</p>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-center">
            {orderPipeline.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={idx} className="flex items-center mb-4 last:mb-0">
                  <div className={`w-32 flex items-center justify-between p-3 border border-black ${stage.alert ? 'bg-gray-100' : 'bg-white'}`}>
                    <span className="text-xs font-bold uppercase">{stage.stage}</span>
                    <Icon size={14} className={stage.alert ? "text-black" : "text-gray-400"} />
                  </div>
                  <div className="flex-1 flex items-center">
                    <div className="h-px bg-black flex-1 mx-2 relative">
                      <ArrowRight size={12} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white" />
                    </div>
                    <div className={`border border-black px-4 py-2 font-mono font-bold text-lg min-w-[3rem] text-center ${stage.alert && stage.count > 0 ? 'bg-black text-white' : 'bg-white'}`}>
                      {stage.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Products & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Top Products */}
        <div className="border border-black bg-white">
          <div className="p-4 border-b border-black bg-gray-50">
            <h2 className="font-bold text-sm">Top Selling Products</h2>
          </div>
          <div className="p-4 space-y-4">
            {topProducts.map((product, index) => {
              const percentage = (product.sales / maxSales) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold">{product.name}</span>
                    <span className="font-mono">{product.sales.toLocaleString()} units</span>
                  </div>
                  <div className="border border-black h-4 bg-gray-100 w-full">
                    <div className="h-full bg-black transition-all" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Action Center */}
        <div className="border border-black bg-white">
          <div className="p-4 border-b border-black flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-sm">Action Center</h2>
            <span className="text-[10px] font-bold uppercase border border-black px-2 py-0.5 bg-black text-white">
              {actionItems.filter(i => i.type === 'urgent').length} Urgent
            </span>
          </div>
          <div className="divide-y divide-black max-h-[300px] overflow-y-auto">
            {actionItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3">
                <div className="mt-0.5">
                  {item.type === 'urgent' && <AlertTriangle size={16} className="text-black" />}
                  {item.type === 'warning' && <AlertTriangle size={16} className="text-gray-500" />}
                  {item.type === 'info' && <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center text-[10px] font-bold">i</div>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${item.type === 'urgent' ? 'font-bold' : ''}`}>
                    {item.text}
                  </p>
                  <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase">{item.time}</p>
                </div>
                <div>
                  <button className="text-[10px] font-bold uppercase border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}