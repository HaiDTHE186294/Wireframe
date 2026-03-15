import { Outlet, Link, useLocation } from "react-router";
import { Search, User, Bell, Settings } from "lucide-react";

// --- GROUPED MENU ITEMS (Theo sát Use Case hệ thống ERP Katak) ---
const menuGroups = [
  {
    title: "Main",
    items: [
      { path: "/", label: "Dashboard" }
    ]
  },
  {
    title: "Catalog & Content",
    items: [
      { path: "/categories", label: "Categories" },
      { path: "/product-catalog", label: "Product Catalog (Master)" },
      { path: "/homepage-management", label: "Homepage Components" },
      { path: "/blogs", label: "Blog Management" },
    ]
  },
  {
    title: "Inventory & Production",
    items: [
      { path: "/suppliers", label: "Suppliers" },
      { path: "/materials", label: "Materials" },
      { path: "/production-execution", label: "Production Execution" },
      { path: "/stock-ledger", label: "Stock Ledger" },
      { path: "/export-management", label: "Export Product" },
      { path: "/traceability", label: "Traceability" },
    ]
  },
  {
    title: "Sales & CRM",
    items: [
      { path: "/order-management", label: "Order Management" },
      { path: "/customer-crm", label: "Customer CRM" },
      { path: "/promotions", label: "Promotions" },
      { path: "/reviews", label: "Reviews" },
    ]
  },
  {
    title: "Administration",
    items: [
      { path: "/staff-management", label: "Staff Management" },
    ]
  }
];

export function Layout() {
  const location = useLocation();

  // Helper để lấy tên trang hiện tại hiển thị trên Breadcrumb
  const getActiveLabel = () => {
    if (location.pathname === "/system-settings") return "System Settings";
    for (const group of menuGroups) {
      const found = group.items.find(item => item.path === location.pathname);
      if (found) return found.label;
    }
    return "Dashboard";
  };

  return (
    <div className="flex h-screen bg-white text-black font-sans">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-64 border-r border-black flex flex-col bg-white">
        
        {/* Brand Logo / Title */}
        <div className="p-6 border-b border-black">
          <h1 className="text-xl font-bold uppercase tracking-tighter">Katak ERP</h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 text-gray-500">Command Center</p>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-2 border-b border-dashed border-gray-200 pb-1">
                {group.title}
              </h2>
              <div className="space-y-1 mt-2">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block px-3 py-2 text-sm transition-all ${
                        isActive
                          ? "border-2 border-black font-bold uppercase tracking-tighter" // Chỉ dùng viền và chữ đậm
                          : "border border-transparent hover:border-black font-medium"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer - Settings */}
        <div className="p-4 border-t border-black flex justify-between items-center bg-white">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Config</span>
          <Link
            to="/system-settings"
            className={`p-2 transition-all ${
              location.pathname === "/system-settings"
                ? "border-2 border-black" 
                : "border border-transparent hover:border-black"
            }`}
            title="System Settings"
          >
            <Settings size={20} className="text-black" />
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-black px-6 flex items-center justify-between bg-white">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <span className="text-gray-400">Home</span>
            <span className="text-gray-400">/</span>
            <span className="text-black border-b-2 border-black pb-0.5">
              {getActiveLabel()}
            </span>
          </div>

          {/* Utility Tools */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border border-black px-3 py-1.5 bg-white">
              <Search size={14} className="text-black" />
              <input
                type="text"
                placeholder="GLOBAL SEARCH..."
                className="outline-none bg-transparent text-xs font-bold uppercase placeholder:text-gray-400 w-48 text-black"
              />
            </div>
            
            <button className="relative border border-black p-2 hover:border-dashed transition-all bg-white">
              <Bell size={16} className="text-black" />
              <div className="absolute top-1 right-1 w-2 h-2 border border-black bg-white rounded-full"></div>
            </button>
            
            <div className="flex items-center gap-2 border border-black px-3 py-1.5 bg-white cursor-pointer hover:border-dashed transition-all">
              <User size={14} className="text-black" />
              <span className="text-xs font-bold uppercase tracking-wider text-black">CEO Admin</span>
            </div>
          </div>
        </header>

        {/* Main Routing Canvas */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1440px] mx-auto p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}