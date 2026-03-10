import { useState } from "react";
import { Lock, Unlock, Eye, Edit, Plus, Search, X } from "lucide-react";

// --- TYPES & INTERFACES ---
type SystemRole = "CEO" | "Admin" | "Sale" | "Inventory";

interface StaffMember {
  user_id: string;
  username: string;
  email: string;
  status: "Active" | "Locked";
  roles: SystemRole[];
  fullname: string;
  phone: string;
  date_of_birth: string;
  gender: "Male" | "Female" | "Other";
  created_at: string;
}

const AVAILABLE_ROLES: SystemRole[] = ["CEO", "Admin", "Sale", "Inventory"];

type ViewMode = "LIST" | "ADD" | "DETAIL";

export function StaffManagement() {
  // --- STATES ---
  const [currentUser] = useState("admin_hai");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  
  const [viewMode, setViewMode] = useState<ViewMode>("LIST");
  const [isEditable, setIsEditable] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [lockReason, setLockReason] = useState("");

  // --- MOCK DATA ---
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { 
      user_id: "USR-000", username: "ceo_boss", email: "ceo@katak.com", roles: ["CEO", "Admin"], status: "Active",
      fullname: "Phạm Tối Cao", phone: "0999888999", date_of_birth: "1980-01-01", gender: "Male", created_at: "2024-01-01"
    },
    { 
      user_id: "USR-001", username: "admin_hai", email: "hai@katak.com", roles: ["Admin", "Inventory"], status: "Active",
      fullname: "Nguyễn Văn Hải", phone: "0901234567", date_of_birth: "2004-11-03", gender: "Male", created_at: "2025-11-01"
    },
    { 
      user_id: "USR-002", username: "manager_linh", email: "linh@katak.com", roles: ["Admin", "Sale"], status: "Active",
      fullname: "Trần Thị Linh", phone: "0988777666", date_of_birth: "1995-05-20", gender: "Female", created_at: "2026-01-10"
    },
    { 
      user_id: "USR-003", username: "sale_nam", email: "nam.le@katak.com", roles: ["Sale"], status: "Active",
      fullname: "Lê Văn Nam", phone: "0911222333", date_of_birth: "1998-12-12", gender: "Male", created_at: "2026-02-15"
    },
    { 
      user_id: "USR-004", username: "kho_dung", email: "dung.kho@katak.com", roles: ["Inventory"], status: "Locked",
      fullname: "Hoàng Văn Dũng", phone: "0944555666", date_of_birth: "1992-03-15", gender: "Male", created_at: "2026-01-05"
    }
  ]);

  const [formData, setFormData] = useState<Partial<StaffMember>>({
    username: "", email: "", roles: [], fullname: "", phone: "", date_of_birth: "", gender: "Male"
  });

  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setFormData({ username: "", email: "", roles: [], fullname: "", phone: "", date_of_birth: "", gender: "Male" });
    setIsEditable(true);
    setViewMode("ADD");
  };

  const handleOpenDetail = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setFormData(staff);
    setIsEditable(false);
    setViewMode("DETAIL");
  };

  const handleToggleRole = (role: SystemRole) => {
    if (!isEditable) return;
    const currentRoles = formData.roles || [];
    if (currentRoles.includes(role)) {
      setFormData({ ...formData, roles: currentRoles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, roles: [...currentRoles, role] });
    }
  };

  const handleSaveStaff = () => {
    if (!formData.roles || formData.roles.length === 0) return alert("Please select at least one role.");
    
    if (viewMode === "DETAIL" && selectedStaff) {
      // Update
      setStaffList(staffList.map(s => s.user_id === formData.user_id ? { ...s, ...formData } as StaffMember : s));
    } else {
      // Create new
      const newStaff: StaffMember = {
        ...formData as StaffMember,
        user_id: `USR-${String(staffList.length + 1).padStart(3, "0")}`,
        status: "Active",
        created_at: new Date().toISOString().split("T")[0]
      };
      setStaffList([...staffList, newStaff]);
    }
    setViewMode("LIST");
    setIsEditable(false);
  };

  const handleCancelForm = () => {
    if (viewMode === "DETAIL" && isEditable && selectedStaff) {
      setFormData(selectedStaff);
      setIsEditable(false);
    } else {
      setViewMode("LIST");
      setIsEditable(false);
    }
  };

  const handleToggleLock = (staff: StaffMember, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (staff.username === currentUser) return alert("You cannot lock your own account.");
    if (staff.roles.includes("CEO") && !staffList.find(s => s.username === currentUser)?.roles.includes("CEO")) {
      return alert("Only a CEO can lock another CEO's account.");
    }
    
    setSelectedStaff(staff);
    if (staff.status === "Active") setShowLockModal(true);
    else setStaffList(staffList.map(s => s.user_id === staff.user_id ? { ...s, status: "Active" } : s));
  };

  const confirmLock = () => {
    setStaffList(staffList.map(s => s.user_id === selectedStaff?.user_id ? { ...s, status: "Locked" } : s));
    setShowLockModal(false); setLockReason("");
  };

  const filteredStaff = staffList.filter(s => 
    (s.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || s.username.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === "" || s.roles.includes(roleFilter as SystemRole))
  );

  return (
    <div className="bg-white text-black min-h-screen pb-10">
      
      {/* ================= MÀN HÌNH 1: LIST ================= */}
      {viewMode === "LIST" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Staff Management</h1>
              <p className="text-sm font-bold mt-1 uppercase tracking-widest text-gray-600">Manage system users, access control, and profiles</p>
            </div>
            <button 
              onClick={handleOpenCreate} 
              className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 text-sm font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Plus size={16} /> New Staff
            </button>
          </div>

          {/* Toolbar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name or username..." 
                  className="w-full pl-9 pr-4 py-2 border border-black text-sm outline-none focus:ring-1 focus:ring-black"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="border border-black px-3 py-2 text-sm outline-none bg-white min-w-[150px] font-bold"
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {AVAILABLE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-end text-sm border border-black px-4 bg-gray-50">
              <span className="text-gray-500 mr-2 uppercase font-bold text-xs">Current User:</span>
              <strong className="font-mono">{currentUser}</strong>
            </div>
          </div>

          {/* Table */}
          <div className="border border-black bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black bg-gray-50">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black w-12">#</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black">Identity</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black">Full Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black">Roles</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-black text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member, idx) => (
                  <tr key={member.user_id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${member.username === currentUser ? "bg-gray-50" : "bg-white"} ${member.status === "Locked" ? "opacity-60" : ""}`}>
                    <td className="px-4 py-4 text-sm text-center border-r border-black font-mono text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-4 border-r border-black">
                      <div className="font-bold text-sm font-mono">{member.user_id}</div>
                      <div className="text-xs text-gray-500 mt-1">@{member.username}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold border-r border-black">{member.fullname}</td>
                    <td className="px-4 py-4 border-r border-black">
                      <div className="flex flex-wrap gap-1">
                        {member.roles.map(role => (
                          <span key={role} className="border border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r border-black text-center">
                      <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider ${member.status === 'Locked' ? 'border-red-600 text-red-600 bg-red-50' : 'border-green-600 text-green-600'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleToggleLock(member)} 
                          disabled={member.username === currentUser}
                          className={`p-2 border border-black transition-colors ${member.username === currentUser ? 'bg-gray-100 opacity-50 cursor-not-allowed' : member.status === 'Locked' ? 'bg-black text-white hover:invert' : 'bg-white hover:bg-gray-200'}`}
                          title={member.status === 'Active' ? "Lock Account" : "Unlock Account"}
                        >
                          {member.status === 'Active' ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                        <button onClick={() => handleOpenDetail(member)} className="px-3 py-1 border border-black bg-white hover:bg-gray-200 text-xs font-bold uppercase flex items-center gap-2 transition-colors">
                          <Eye size={14} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-sm italic text-gray-500">No staff found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ================= MÀN HÌNH 2: FORM ADD / DETAIL ================= */}
      {(viewMode === "ADD" || viewMode === "DETAIL") && (
        <div className="max-w-4xl mx-auto bg-white border-2 border-black p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-black">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                {viewMode === "ADD" ? "Create New Staff" : "Staff Profile"}
              </h2>
              {viewMode === "DETAIL" && !isEditable && (
                <button onClick={() => setIsEditable(true)} className="px-3 py-1 border border-black bg-white hover:bg-gray-100 flex items-center gap-1 text-sm font-bold uppercase tracking-wider">
                  <Edit size={14} /> Unlock Edit
                </button>
              )}
            </div>
            <button onClick={handleCancelForm} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-xs transition-colors">
              Back to List
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Cột 1: Account Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-300 pb-2">Account Info</h3>
                
                <div className="space-y-4">
                  {viewMode === "DETAIL" && (
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">User ID</label>
                      <input type="text" value={formData.user_id || ""} disabled className="w-full px-3 py-2 border border-black text-sm bg-gray-100 font-mono" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Username *</label>
                    <input 
                      type="text" 
                      disabled={viewMode === "DETAIL"} 
                      value={formData.username} 
                      onChange={(e) => setFormData({...formData, username: e.target.value})} 
                      className={`w-full px-3 py-2 border border-black text-sm font-mono ${viewMode === "DETAIL" ? "bg-gray-100" : "bg-white"} outline-none focus:ring-1 focus:ring-black`} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Email *</label>
                    <input 
                      type="email" 
                      disabled={!isEditable}
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className={`w-full px-3 py-2 border border-black text-sm ${!isEditable ? "bg-gray-100" : "bg-white"} outline-none focus:ring-1 focus:ring-black`} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2">Roles (Select multiple) *</label>
                    <div className={`grid grid-cols-2 gap-2 border border-black p-4 ${!isEditable ? "bg-gray-100" : "bg-white"}`}>
                      {AVAILABLE_ROLES.map(role => (
                        <label key={role} className={`flex items-center gap-2 text-sm font-bold uppercase ${isEditable ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-70"}`}>
                          <input 
                            type="checkbox" 
                            disabled={!isEditable}
                            className="w-4 h-4 border-2 border-black accent-black"
                            checked={formData.roles?.includes(role) || false}
                            onChange={() => handleToggleRole(role)}
                          />
                          {role}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột 2: Personal Profile */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-300 pb-2">Personal Profile</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      disabled={!isEditable}
                      value={formData.fullname} 
                      onChange={(e) => setFormData({...formData, fullname: e.target.value})} 
                      className={`w-full px-3 py-2 border border-black text-sm font-bold ${!isEditable ? "bg-gray-100" : "bg-white"} outline-none focus:ring-1 focus:ring-black`} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Phone</label>
                    <input 
                      type="text" 
                      disabled={!isEditable}
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      className={`w-full px-3 py-2 border border-black text-sm font-mono ${!isEditable ? "bg-gray-100" : "bg-white"} outline-none focus:ring-1 focus:ring-black`} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Gender</label>
                      <select 
                        disabled={!isEditable}
                        value={formData.gender} 
                        onChange={(e) => setFormData({...formData, gender: e.target.value as any})} 
                        className={`w-full px-3 py-2 border border-black text-sm uppercase ${!isEditable ? "bg-gray-100" : "bg-white"} outline-none`}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1">Date of Birth</label>
                      <input 
                        type="date" 
                        disabled={!isEditable}
                        value={formData.date_of_birth} 
                        onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} 
                        className={`w-full px-3 py-2 border border-black text-sm font-mono ${!isEditable ? "bg-gray-100" : "bg-white"} outline-none focus:ring-1 focus:ring-black`} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditable && (
            <div className="flex justify-end gap-3 mt-10 pt-6 border-t-2 border-black">
              <button onClick={handleCancelForm} className="px-6 py-2 border border-black bg-white hover:bg-gray-100 font-bold uppercase text-sm tracking-wider">Cancel</button>
              <button onClick={handleSaveStaff} className="px-8 py-2 border border-black bg-black text-white hover:invert font-bold uppercase text-sm tracking-wider transition-all">
                {viewMode === "ADD" ? "Create Staff" : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL: LOCK REASON --- */}
      {showLockModal && selectedStaff && (
        <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black p-8 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-black">
              <div>
                <h2 className="font-black text-xl uppercase tracking-tighter text-red-600">Suspend Account</h2>
                <p className="text-sm font-bold mt-1">{selectedStaff.fullname}</p>
                <p className="text-xs font-mono text-gray-500">@{selectedStaff.username}</p>
              </div>
              <button onClick={() => setShowLockModal(false)} className="p-1 border border-black hover:bg-gray-100"><X size={16}/></button>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase mb-2">Reason for suspension *</label>
              <textarea 
                value={lockReason} 
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Policy violation, leaving company..." 
                className="w-full p-3 border border-black text-sm h-28 outline-none focus:ring-2 focus:ring-red-600"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-black">
              <button onClick={() => setShowLockModal(false)} className="px-4 py-2 border border-black bg-white hover:bg-gray-100 text-xs font-bold uppercase tracking-wider">Cancel</button>
              <button 
                onClick={confirmLock} 
                disabled={!lockReason.trim()} 
                className="px-4 py-2 bg-red-600 text-white border border-black hover:bg-red-700 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:bg-gray-400"
              >
                Confirm Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}