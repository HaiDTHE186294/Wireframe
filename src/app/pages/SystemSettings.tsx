import { useState } from "react";
import { Save } from "lucide-react";

export function SystemSettings() {
  const [rawMaterialThreshold, setRawMaterialThreshold] = useState("50");
  const [finishedProductThreshold, setFinishedProductThreshold] = useState("20");
  const [alertEmails, setAlertEmails] = useState(
    "admin@katakcoffee.com\ninventory@katakcoffee.com\nceo@katakcoffee.com"
  );
  const [autoApprovalLimit, setAutoApprovalLimit] = useState("20000000");
  const [expiryMonths, setExpiryMonths] = useState("12");

  const handleSave = () => {
    console.log("Saving system settings...");
    console.log({
      rawMaterialThreshold,
      finishedProductThreshold,
      alertEmails,
      autoApprovalLimit,
      expiryMonths,
    });
    alert("Settings saved successfully!");
  };

  return (
    <div className="bg-white text-black pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-black">
        <div>
          <h1 className="text-xl font-bold">System Configuration</h1>
          <p className="text-sm text-gray-600 mt-1">Global system settings and parameters</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 text-sm flex items-center gap-2 transition-colors"
        >
          <Save size={16} />
          Save Settings
        </button>
      </div>

      <div className="space-y-6">
        {/* Inventory Settings */}
        <div className="border border-black p-6 bg-white">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-200 pb-2">Inventory & Stock Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold mb-1">
                Raw Material Low Stock Alert (Kg)
              </label>
              <input
                type="number"
                value={rawMaterialThreshold}
                onChange={(e) => setRawMaterialThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g., 50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trigger alerts when green bean stock falls below this level.
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                Finished Product Low Stock Alert (Units)
              </label>
              <input
                type="number"
                value={finishedProductThreshold}
                onChange={(e) => setFinishedProductThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black"
                placeholder="e.g., 20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trigger alerts when roasted coffee bags fall below this level.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold mb-1">
              Product Shelf Life (Months from Production Date)
            </label>
            <input
              type="number"
              value={expiryMonths}
              onChange={(e) => setExpiryMonths(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g., 12"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default expiry duration for finished coffee products (counted from production date).
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Alert Email List</label>
            <textarea
              value={alertEmails}
              onChange={(e) => setAlertEmails(e.target.value)}
              className="w-full px-3 py-2 border border-black h-24 font-mono text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter email addresses (one per line)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Low stock notifications will be sent to these email addresses.
            </p>
          </div>
        </div>

        {/* Order Settings */}
        <div className="border border-black p-6 bg-white">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-200 pb-2">Order Management</h2>
          <div className="max-w-md">
            <label className="block text-sm font-bold mb-1">
              Wholesale Auto-Approval Limit (VNĐ)
            </label>
            <input
              type="number"
              value={autoApprovalLimit}
              onChange={(e) => setAutoApprovalLimit(e.target.value)}
              className="w-full px-3 py-2 border border-black text-sm font-mono outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter amount"
            />
            <p className="text-xs text-gray-500 mt-1">
              B2B orders exceeding this value require manual CEO/Manager approval.
            </p>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="border border-black p-6 bg-white">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-200 pb-2">Notification Settings</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer w-fit hover:opacity-80">
              <input type="checkbox" defaultChecked className="w-4 h-4 border-black accent-black cursor-pointer" />
              <span className="text-sm">Enable email notifications for low stock alerts</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer w-fit hover:opacity-80">
              <input type="checkbox" defaultChecked className="w-4 h-4 border-black accent-black cursor-pointer" />
              <span className="text-sm">Enable email notifications for high-value order approvals</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer w-fit hover:opacity-80">
              <input type="checkbox" defaultChecked className="w-4 h-4 border-black accent-black cursor-pointer" />
              <span className="text-sm">Enable email notifications for production completion</span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="mt-8 flex justify-end pt-4 border-t border-black">
        <button
          onClick={handleSave}
          className="px-6 py-2 border border-black bg-black text-white hover:bg-gray-800 text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Save size={16} />
          Save All Settings
        </button>
      </div>
    </div>
  );
}