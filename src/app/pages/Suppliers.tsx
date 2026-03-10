import { useState } from "react";
import { Plus, Edit, Search, Eye, Ban, CheckCircle, AlertTriangle, X } from "lucide-react";
import { Pagination } from "../components/Pagination";

interface Supplier {
  code: string;
  name: string;
  taxCode: string;
  contact: string;
  address?: string;
  email?: string;
  status: "Active" | "Disabled"; // Thêm status
}

type ViewMode = "LIST" | "ADD" | "DETAIL";

export function Suppliers() {
  // --- STATES ---
  const [viewMode, setViewMode] = useState<ViewMode>("LIST");
  const [isEditable, setIsEditable] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { code: "SUP001", name: "Highland Coffee Suppliers", taxCode: "0123456789", contact: "+84 901 234 567", address: "Ha Noi", email: "highland@supplier.com", status: "Active" },
    { code: "SUP002", name: "Vietnam Coffee Export Co.", taxCode: "0987654321", contact: "+84 902 345 678", address: "Ho Chi Minh", email: "export@vncoffee.com", status: "Active" },
    { code: "SUP003", name: "Arabica Premium Ltd.", taxCode: "0111222333", contact: "+84 903 456 789", address: "Da Lat", email: "contact@arabica.com", status: "Disabled" },
  ]);

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Supplier>({
    code: "", name: "", taxCode: "", contact: "", address: "", email: "", status: "Active"
  });

  // --- STATUS MODAL STATES ---
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [supplierToToggle, setSupplierToToggle] = useState<Supplier | null>(null);

  // --- FILTER & PAGINATION ---
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- HANDLERS ---
  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setNewSupplier({
      code: `SUP${String(suppliers.length + 1).padStart(3, "0")}`,
      name: "", taxCode: "", contact: "", address: "", email: "", status: "Active"
    });
    setIsEditable(true);
    setViewMode("ADD");
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({ ...supplier });
    setIsEditable(false);
    setViewMode("DETAIL");
  };

  const handleSaveSupplier = () => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.code === editingSupplier.code ? newSupplier : s));
    } else {
      setSuppliers([...suppliers, newSupplier]);
    }
    setViewMode("LIST");
    setIsEditable(false);
  };

  const handleCancelForm = () => {
    if (viewMode === "DETAIL" && isEditable && editingSupplier) {
      setNewSupplier({ ...editingSupplier });
      setIsEditable(false);
    } else {
      setViewMode("LIST");
      setIsEditable(false);
    }
  };

  // Status Toggle Logic
  const requestToggleStatus = (supplier: Supplier) => {
    setSupplierToToggle(supplier);
    setShowStatusModal(true);
  };

  const confirmToggleStatus = () => {
    if (supplierToToggle) {
      setSuppliers(suppliers.map(s => {
        if (s.code === supplierToToggle.code) {
          return { ...s, status: s.status === "Active" ? "Disabled" : "Active" };
        }
        return s;
      }));
    }
    setShowStatusModal(false);
    setSupplierToToggle(null);
  };

  return (
    <div className="bg-white text-black min-h-screen pb-10">
      
      {/* ================= MÀN HÌNH 1: LIST ================= */}
      {viewMode === "LIST" && (
        <>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Suppliers</h1>
              <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-widest">Partner Directory</p>
            </div>
            <button
              onClick={handleAddSupplier}
              className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 flex items-center gap-2 text-sm font-bold uppercase"
            >
              <Plus size={16} />
              Add Supplier
            </button>
          </div>

          <div className="mb-6 p-4 border border-black bg-gray-50 flex gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search supplier by name..."
                className="w-full pl-9 pr-4 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black bg-white"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {filteredSuppliers.length} Suppliers Found
            </p>
          </div>

          <div className="border border-black bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-black w-12 text-center">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-black">Supplier Code</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-black">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-black">Tax Code</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase border-r border-black">Contact</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase border-r border-black">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-sm italic text-gray-500">No suppliers found.</td></tr>
                ) : (
                  paginatedSuppliers.map((supplier, index) => (
                    <tr
                      key={supplier.code}
                      className={`border-b border-black hover:bg-gray-50 transition-colors ${supplier.status === 'Disabled' ? 'opacity-60 bg-gray-100' : 'bg-white'}`}
                    >
                      <td className="px-4 py-3 text-sm text-center border-r border-black text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="px-4 py-3 text-sm font-bold font-mono border-r border-black">{supplier.code}</td>
                      <td className="px-4 py-3 text-sm font-bold border-r border-black">{supplier.name}</td>
                      <td className="px-4 py-3 text-sm border-r border-black font-mono">{supplier.taxCode}</td>
                      <td className="px-4 py-3 text-sm border-r border-black font-mono">{supplier.contact}</td>
                      <td className="px-4 py-3 border-r border-black text-center">
                        <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-fit mx-auto ${supplier.status === 'Active' ? 'border-black bg-white text-black' : 'border-gray-400 bg-gray-200 text-gray-500'}`}>
                          {supplier.status === 'Active' ? <CheckCircle size={10} /> : <Ban size={10} />}
                          {supplier.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewSupplier(supplier)}
                            className="p-1.5 border border-black bg-white hover:bg-gray-100"
                            title="View/Edit Detail"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => requestToggleStatus(supplier)}
                            className={`p-1.5 border border-black hover:bg-gray-100 transition-colors ${supplier.status === 'Disabled' ? 'bg-black text-white hover:invert' : 'bg-white text-black'}`}
                            title={supplier.status === "Active" ? "Disable Supplier" : "Enable Supplier"}
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
            {filteredSuppliers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredSuppliers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>

          {/* --- MODAL: CONFIRM TOGGLE STATUS --- */}
          {showStatusModal && supplierToToggle && (
            <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setShowStatusModal(false)}>
              <div className="bg-white border-2 border-black p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-4">
                  <AlertTriangle size={24} className="text-black" />
                  <h2 className="font-black text-xl uppercase tracking-tighter">Confirm Action</h2>
                </div>
                
                <div className="mb-8">
                  <p className="text-sm font-bold mb-3">
                    Are you sure you want to <span className="uppercase underline">{supplierToToggle.status === 'Active' ? 'Disable' : 'Activate'}</span> this supplier?
                  </p>
                  <div className="p-4 border border-black bg-gray-50 font-mono text-sm font-bold">
                    {supplierToToggle.code} - {supplierToToggle.name}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-black">
                  <button onClick={() => setShowStatusModal(false)} className="px-6 py-2 border border-black font-bold uppercase text-xs hover:bg-gray-100 transition-colors">Cancel</button>
                  <button onClick={confirmToggleStatus} className="px-6 py-2 bg-black text-white border border-black font-bold uppercase text-xs hover:invert transition-all">
                    Yes, {supplierToToggle.status === 'Active' ? 'Disable' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= MÀN HÌNH 2: ADD / DETAIL (GỘP) ================= */}
      {(viewMode === "ADD" || viewMode === "DETAIL") && (
        <div className="max-w-4xl mx-auto bg-white border-2 border-black p-8 shadow-sm mt-4">
          <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-black">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {viewMode === "ADD" ? "Add Supplier" : "Supplier Details"}
              </h2>
              {viewMode === "DETAIL" && !isEditable && (
                <button onClick={() => setIsEditable(true)} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors">
                  <Edit size={14} /> Unlock Edit
                </button>
              )}
            </div>
            <button onClick={() => setViewMode("LIST")} className="px-4 py-2 border border-black hover:bg-gray-100 font-bold uppercase text-xs transition-colors">
              Back to List
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Business Information</h3>
               {viewMode === "DETAIL" && (
                 <span className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-fit ${newSupplier.status === 'Active' ? 'border-black bg-black text-white' : 'border-gray-400 bg-gray-100 text-gray-500'}`}>
                   {newSupplier.status}
                 </span>
               )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-gray-500">Supplier Code (Auto)</label>
              <input
                type="text"
                value={newSupplier.code}
                readOnly
                className="w-full px-3 py-2 border border-black bg-gray-100 font-mono text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Supplier Name *</label>
              <input
                type="text"
                value={newSupplier.name}
                readOnly={!isEditable}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                className={`w-full px-3 py-2 border border-black text-sm font-bold ${!isEditable ? "bg-gray-100 outline-none" : "focus:ring-1 focus:ring-black outline-none"}`}
                placeholder="Enter supplier name"
                autoFocus={isEditable}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Tax Code *</label>
                <input
                  type="text"
                  value={newSupplier.taxCode}
                  readOnly={!isEditable}
                  onChange={(e) => setNewSupplier({ ...newSupplier, taxCode: e.target.value })}
                  className={`w-full px-3 py-2 border border-black text-sm font-mono ${!isEditable ? "bg-gray-100 outline-none" : "focus:ring-1 focus:ring-black outline-none"}`}
                  placeholder="Tax identification number"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Contact Phone *</label>
                <input
                  type="text"
                  value={newSupplier.contact}
                  readOnly={!isEditable}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                  className={`w-full px-3 py-2 border border-black text-sm font-mono ${!isEditable ? "bg-gray-100 outline-none" : "focus:ring-1 focus:ring-black outline-none"}`}
                  placeholder="+84 xxx xxx xxx"
                />
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-200">
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 pb-2">Contact Details</h3>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Email</label>
              <input
                type="email"
                value={newSupplier.email}
                readOnly={!isEditable}
                onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                className={`w-full px-3 py-2 border border-black text-sm font-mono ${!isEditable ? "bg-gray-100 outline-none" : "focus:ring-1 focus:ring-black outline-none"}`}
                placeholder="email@supplier.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1">Address</label>
              <textarea
                value={newSupplier.address}
                readOnly={!isEditable}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                className={`w-full px-3 py-2 border border-black h-24 text-sm resize-none ${!isEditable ? "bg-gray-100 outline-none" : "focus:ring-1 focus:ring-black outline-none"}`}
                placeholder="Supplier full address..."
              />
            </div>
          </div>

          {isEditable && (
            <div className="flex gap-3 justify-end mt-10 pt-6 border-t-2 border-black">
              <button
                onClick={handleCancelForm}
                className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase tracking-wider text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSupplier}
                disabled={!newSupplier.name || !newSupplier.taxCode || !newSupplier.contact}
                className={`px-8 py-2 border border-black font-bold uppercase tracking-wider text-sm transition-all ${
                  newSupplier.name && newSupplier.taxCode && newSupplier.contact
                    ? "bg-black text-white hover:invert"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {viewMode === "ADD" ? "Save Supplier" : "Update Supplier"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}