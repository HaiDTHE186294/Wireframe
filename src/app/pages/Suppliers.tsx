import { useState } from "react";
import { Plus, Edit } from "lucide-react";
import { Pagination } from "../components/Pagination";

interface Supplier {
  code: string;
  name: string;
  taxCode: string;
  contact: string;
  address?: string;
  email?: string;
}

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { code: "SUP001", name: "Highland Coffee Suppliers", taxCode: "0123456789", contact: "+84 901 234 567", address: "Ha Noi", email: "highland@supplier.com" },
    { code: "SUP002", name: "Vietnam Coffee Export Co.", taxCode: "0987654321", contact: "+84 902 345 678", address: "Ho Chi Minh", email: "export@vncoffee.com" },
    { code: "SUP003", name: "Arabica Premium Ltd.", taxCode: "0111222333", contact: "+84 903 456 789", address: "Da Lat", email: "contact@arabica.com" },
  ]);

  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Supplier>({
    code: "",
    name: "",
    taxCode: "",
    contact: "",
    address: "",
    email: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(suppliers.length / itemsPerPage);
  const paginatedSuppliers = suppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setNewSupplier({
      code: `SUP${String(suppliers.length + 1).padStart(3, "0")}`,
      name: "",
      taxCode: "",
      contact: "",
      address: "",
      email: "",
    });
    setShowSupplierForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({ ...supplier });
    setShowSupplierForm(true);
  };

  const handleSaveSupplier = () => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.code === editingSupplier.code ? newSupplier : s));
    } else {
      setSuppliers([...suppliers, newSupplier]);
    }
    setShowSupplierForm(false);
    setNewSupplier({ code: "", name: "", taxCode: "", contact: "", address: "", email: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-black">
        <h1 className="text-xl font-bold">Suppliers</h1>
        <button
          onClick={handleAddSupplier}
          className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Supplier
        </button>
      </div>

      <div className="border border-black">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black">
              <th className="px-4 py-3 text-left text-sm font-bold">STT</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Supplier Code</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Tax Code</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSuppliers.map((supplier, index) => (
              <tr
                key={supplier.code}
                className={`border-b border-black ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="px-4 py-3 text-sm text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td className="px-4 py-3 text-sm font-bold font-mono">{supplier.code}</td>
                <td className="px-4 py-3 text-sm">{supplier.name}</td>
                <td className="px-4 py-3 text-sm">{supplier.taxCode}</td>
                <td className="px-4 py-3 text-sm">{supplier.contact}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleEditSupplier(supplier)}
                    className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-1"
                  >
                    <Edit size={14} />
                    <span className="text-xs">Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={suppliers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Supplier Add/Update Form */}
      {showSupplierForm && (
        <div
          className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center"
          onClick={() => setShowSupplierForm(false)}
        >
          <div
            className="bg-white border border-black p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-black">
              <h2 className="font-bold">
                {editingSupplier ? "Update Supplier" : "Add Supplier"}
              </h2>
              <button
                onClick={() => setShowSupplierForm(false)}
                className="px-3 py-1 border border-black hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Supplier Code</label>
                <input
                  type="text"
                  value={newSupplier.code}
                  readOnly
                  className="w-full px-3 py-2 border border-black bg-gray-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Supplier Name *</label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 border border-black"
                  placeholder="Enter supplier name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Tax Code *</label>
                  <input
                    type="text"
                    value={newSupplier.taxCode}
                    onChange={(e) => setNewSupplier({ ...newSupplier, taxCode: e.target.value })}
                    className="w-full px-3 py-2 border border-black"
                    placeholder="Tax identification number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Contact Phone *</label>
                  <input
                    type="text"
                    value={newSupplier.contact}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                    className="w-full px-3 py-2 border border-black"
                    placeholder="+84 xxx xxx xxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  className="w-full px-3 py-2 border border-black"
                  placeholder="email@supplier.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Address</label>
                <textarea
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  className="w-full px-3 py-2 border border-black h-20"
                  placeholder="Supplier address..."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowSupplierForm(false)}
                className="px-4 py-2 border border-black bg-white hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSupplier}
                disabled={!newSupplier.name || !newSupplier.taxCode || !newSupplier.contact}
                className={`px-4 py-2 border border-black ${
                  newSupplier.name && newSupplier.taxCode && newSupplier.contact
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-200 cursor-not-allowed"
                }`}
              >
                {editingSupplier ? "Update Supplier" : "Add Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}