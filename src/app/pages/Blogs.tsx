import { useState } from "react";
import { Search, Plus, Edit, ArrowLeft, Trash2, Check, Image as ImageIcon, Link as LinkIcon, Eye, Code } from "lucide-react";

// --- ENUMS & INTERFACES ---
enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED"
}

type ThumbnailType = "URL" | "UPLOAD";

interface Blog {
  id: string;
  title: string;
  content: string; // Lưu trữ HTML
  thumbnail: string;
  thumbnailType: ThumbnailType;
  author: string;
  status: BlogStatus;
  created_at: string;
  updated_at: string;
}

export function BlogManagement() {
  // --- STATES ---
  const [currentView, setCurrentView] = useState<"list" | "form">("list");
  
  // States cho màn List
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // States cho màn Form (Detail/Update/Add)
  const [isEditMode, setIsEditMode] = useState(false); // Trạng thái Toggle Xem <-> Sửa
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(false); // Toggle xem trước HTML khi đang edit
  
  const initialFormState: Partial<Blog> = {
    title: "", content: "", thumbnail: "", thumbnailType: "URL", status: BlogStatus.DRAFT
  };
  const [formData, setFormData] = useState<Partial<Blog>>(initialFormState);

  // --- MOCK DATA ---
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: "BLG-001",
      title: "The Art of Roasting: Finding the Perfect Profile",
      content: "<h2>Introduction</h2><p>Roasting coffee is a delicate balance of temperature and time...</p><h3>First Crack</h3><p>The first crack signifies the bean expanding...</p>",
      thumbnail: "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?w=800&q=80",
      thumbnailType: "URL",
      author: "CEO Admin",
      status: BlogStatus.PUBLISHED,
      created_at: "2026-03-01 10:00",
      updated_at: "2026-03-01 10:00"
    },
    {
      id: "BLG-002",
      title: "Arabica vs Robusta: What you need to know for wholesale",
      content: "<h2>Key Differences</h2><p>Arabica beans are known for their sweetness, while Robusta provides body and crema...</p>",
      thumbnail: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=800&q=80",
      thumbnailType: "URL",
      author: "Sale Manager",
      status: BlogStatus.DRAFT,
      created_at: "2026-03-05 14:30",
      updated_at: "2026-03-08 09:15"
    },
    {
      id: "BLG-003",
      title: "Holiday Promotion Announcement 2026",
      content: "<h2>Special Offers</h2><p>Get ready for our biggest B2B discounts of the year...</p>",
      thumbnail: "",
      thumbnailType: "UPLOAD",
      author: "CEO Admin",
      status: BlogStatus.ARCHIVED,
      created_at: "2025-12-01 08:00",
      updated_at: "2026-01-15 10:00"
    }
  ]);

  // --- HANDLERS ---
  const handleOpenList = () => {
    setCurrentView("list");
    setIsEditMode(false);
    setIsCreatingNew(false);
  };

  const handleOpenDetail = (blog: Blog) => {
    setFormData(blog);
    setIsCreatingNew(false);
    setIsEditMode(false); // Mở mặc định ở chế độ XEM (View Detail)
    setCurrentView("form");
  };

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsCreatingNew(true);
    setIsEditMode(true); // Tạo mới thì bắt buộc phải ở chế độ SỬA
    setPreviewHtml(false);
    setCurrentView("form");
  };

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      alert("Title and Content are required.");
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");

    if (isCreatingNew) {
      const newBlog: Blog = {
        ...(formData as Blog),
        id: `BLG-${String(blogs.length + 1).padStart(3, "0")}`,
        author: "CEO Admin", // Hardcode user hiện tại
        created_at: timestamp,
        updated_at: timestamp
      };
      setBlogs([newBlog, ...blogs]);
    } else {
      setBlogs(blogs.map(b => b.id === formData.id ? { ...b, ...formData, updated_at: timestamp } as Blog : b));
    }
    
    // Lưu xong thì quay về chế độ XEM (View) của chính bài viết đó
    setIsCreatingNew(false);
    setIsEditMode(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to mark this blog as DELETED?")) {
      setBlogs(blogs.map(b => b.id === id ? { ...b, status: BlogStatus.DELETED } : b));
      handleOpenList();
    }
  };

  // --- RENDER HELPERS ---
  const getStatusDisplay = (status: BlogStatus) => {
    let borderStyle = "border-black text-black";
    if (status === BlogStatus.PUBLISHED) borderStyle = "border-black text-black font-bold border-2";
    if (status === BlogStatus.ARCHIVED) borderStyle = "border-gray-400 text-gray-500 border-dashed";
    if (status === BlogStatus.DELETED) borderStyle = "border-black text-black line-through";
    
    return (
      <span className={`px-2 py-1 text-[10px] uppercase tracking-widest border ${borderStyle}`}>
        {status}
      </span>
    );
  };

  // ==========================================
  // VIEW: LIST
  // ==========================================
  if (currentView === "list") {
    const filteredBlogs = blogs.filter(b => 
      b.status !== BlogStatus.DELETED && // Ẩn các bài đã xóa khỏi view mặc định
      (statusFilter === "ALL" || b.status === statusFilter) &&
      (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="bg-white text-black pb-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter">Blog Management</h1>
            <p className="text-xs text-gray-600 mt-1 uppercase font-bold tracking-widest">Content & SEO Administration</p>
          </div>
          <button 
            onClick={handleOpenCreate} 
            className="px-4 py-2 border-2 border-black bg-white text-black hover:border-dashed hover:bg-gray-50 text-xs font-bold uppercase flex items-center gap-2 transition-all"
          >
            <Plus size={16} /> Write New Article
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH TITLE OR AUTHOR..." 
              className="w-full pl-9 pr-4 py-2 border border-black text-xs font-bold uppercase placeholder:text-gray-400 outline-none focus:border-2 focus:border-black transition-all"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border border-black px-3 py-2 text-xs font-bold uppercase outline-none bg-white focus:border-2 transition-all"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value={BlogStatus.PUBLISHED}>Published</option>
            <option value={BlogStatus.DRAFT}>Draft</option>
            <option value={BlogStatus.ARCHIVED}>Archived</option>
          </select>
        </div>

        {/* Table */}
        <div className="border border-black">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-16 text-center">Thumb</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black">Article Title</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-32">Author</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-32">Last Updated</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-28 text-center">Status</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-xs font-bold uppercase text-gray-500 border-t border-black">No articles found.</td></tr>
              ) : (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-black hover:bg-gray-50 transition-colors">
                    <td className="p-2 border-r border-black text-center">
                      {blog.thumbnail ? (
                        <div className="w-10 h-10 border border-black mx-auto bg-gray-100 overflow-hidden">
                          <img src={blog.thumbnail} alt="thumb" className="w-full h-full object-cover grayscale opacity-80" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 border border-dashed border-gray-400 mx-auto flex items-center justify-center text-gray-400">
                          <ImageIcon size={14} />
                        </div>
                      )}
                    </td>
                    <td className="p-3 border-r border-black">
                      <p className="text-sm font-bold">{blog.title}</p>
                      <p className="text-[10px] font-mono text-gray-500 mt-1">ID: {blog.id}</p>
                    </td>
                    <td className="p-3 border-r border-black text-xs font-bold uppercase">{blog.author}</td>
                    <td className="p-3 border-r border-black text-xs font-mono">{blog.updated_at.split(" ")[0]}</td>
                    <td className="p-3 border-r border-black text-center">
                      {getStatusDisplay(blog.status)}
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleOpenDetail(blog)} 
                        className="px-3 py-1 border border-black bg-white hover:border-dashed hover:font-bold text-xs uppercase transition-all"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: FORM (DETAIL & UPDATE COMBINED)
  // ==========================================
  if (currentView === "form") {
    return (
      <div className="bg-white text-black pb-10">
        
        {/* Header Toolbar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black sticky top-0 bg-white z-10 pt-4">
          <div className="flex items-center gap-4">
            <button onClick={handleOpenList} className="p-2 border border-black hover:border-dashed transition-all" title="Back to List">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tighter">
                {isCreatingNew ? "Draft New Article" : (isEditMode ? "Edit Article" : "Article Detail")}
              </h1>
              {!isCreatingNew && <p className="text-xs font-mono text-gray-500 mt-1">ID: {formData.id}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isCreatingNew && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${isEditMode ? "bg-gray-100 border-dashed" : "bg-white hover:border-dashed"}`}
              >
                {isEditMode ? <Eye size={14}/> : <Edit size={14}/>}
                {isEditMode ? "Switch to View Mode" : "Switch to Edit Mode"}
              </button>
            )}

            {isEditMode && (
              <button 
                onClick={handleSave} 
                className="px-6 py-2 border-2 border-black bg-white text-black font-black uppercase text-xs hover:border-dashed transition-all flex items-center gap-2"
              >
                <Check size={16} /> Save Data
              </button>
            )}

            {!isCreatingNew && isEditMode && (
              <button 
                onClick={() => handleDelete(formData.id!)} 
                className="p-2 border-2 border-black bg-white text-black hover:border-dashed transition-all"
                title="Move to Trash"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ================= MODE: READ / VIEW ================= */}
        {!isEditMode ? (
          <div className="max-w-3xl mx-auto mt-8 border border-black p-8 relative">
            <div className="absolute top-0 right-0 p-4">
              {getStatusDisplay(formData.status as BlogStatus)}
            </div>
            
            <h1 className="text-3xl font-black mb-4 leading-tight">{formData.title}</h1>
            
            <div className="flex gap-4 text-xs font-mono border-b border-black pb-4 mb-6 uppercase">
              <span>By: <span className="font-bold">{formData.author}</span></span>
              <span>Updated: {formData.updated_at}</span>
            </div>

            {formData.thumbnail && (
              <div className="mb-8 border border-black p-1">
                <img src={formData.thumbnail} alt="Cover" className="w-full h-auto object-cover grayscale" style={{ maxHeight: '400px' }} />
              </div>
            )}

            {/* Khung render HTML thực tế */}
            <div className="font-sans leading-relaxed text-sm [&>h2]:text-xl [&>h2]:font-bold [&>h2]:uppercase [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:border-b [&>h2]:border-black [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-2 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4">
              <div dangerouslySetInnerHTML={{ __html: formData.content || "<p class='italic text-gray-400'>No content available.</p>" }} />
            </div>
          </div>
        ) : 
        
        // ================= MODE: EDIT / CREATE =================
        (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Article Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="Enter a captivating title..."
                  className="w-full p-3 border-2 border-black text-lg font-bold outline-none focus:border-dashed transition-all" 
                />
              </div>

              {/* HTML Content Editor (Wireframe level config) */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-bold uppercase">HTML Content Configuration *</label>
                  <button 
                    onClick={() => setPreviewHtml(!previewHtml)}
                    className="text-[10px] font-bold uppercase border border-black px-2 py-1 hover:bg-gray-100 flex items-center gap-1"
                  >
                    {previewHtml ? <Code size={12}/> : <Eye size={12}/>}
                    {previewHtml ? "Show Source" : "Live Preview"}
                  </button>
                </div>
                
                {previewHtml ? (
                  <div className="w-full p-4 border-2 border-black min-h-[400px] overflow-auto bg-gray-50">
                    <div className="font-sans text-sm [&>h2]:text-xl [&>h2]:font-bold [&>h2]:uppercase [&>h2]:mt-6 [&>h2]:mb-2 [&>h2]:border-b [&>h2]:border-black [&>p]:mb-4" 
                         dangerouslySetInnerHTML={{ __html: formData.content || "<p class='text-gray-400 font-mono text-xs'>Preview area...</p>" }} />
                  </div>
                ) : (
                  <textarea 
                    value={formData.content} 
                    onChange={(e) => setFormData({...formData, content: e.target.value})} 
                    placeholder="<h2>Write your heading</h2><p>Write your paragraph here...</p>"
                    className="w-full p-4 border-2 border-black text-sm font-mono leading-relaxed min-h-[400px] outline-none focus:border-dashed transition-all bg-white" 
                  />
                )}
                <p className="text-[10px] font-bold uppercase text-gray-500 mt-2">Supports raw HTML tags (h2, p, strong, ul, li).</p>
              </div>
            </div>

            {/* Right Column: Meta & Config */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Publishing Status */}
              <div className="border border-black p-5 bg-white">
                <h3 className="text-xs font-bold uppercase border-b border-black pb-2 mb-4">Publishing Status</h3>
                <div className="flex flex-col gap-3">
                  {Object.values(BlogStatus).map(status => (
                    <label key={status} className={`flex items-center gap-3 p-2 border cursor-pointer transition-all ${formData.status === status ? 'border-2 border-black font-bold' : 'border-transparent hover:border-gray-300'}`}>
                      <input 
                        type="radio" 
                        name="status" 
                        value={status} 
                        checked={formData.status === status} 
                        onChange={() => setFormData({...formData, status: status as BlogStatus})}
                        className="w-4 h-4 accent-black"
                      />
                      <span className="text-sm uppercase">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Thumbnail Configuration */}
              <div className="border border-black p-5 bg-white">
                <h3 className="text-xs font-bold uppercase border-b border-black pb-2 mb-4">Cover Image (Thumbnail)</h3>
                
                <div className="flex border border-black mb-4">
                  <button 
                    onClick={() => setFormData({...formData, thumbnailType: "URL", thumbnail: ""})}
                    className={`flex-1 py-2 text-xs font-bold uppercase flex items-center justify-center gap-2 border-r border-black transition-colors ${formData.thumbnailType === 'URL' ? 'bg-gray-100 border-b-2 border-black' : 'bg-white'}`}
                  >
                    <LinkIcon size={12}/> Web URL
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, thumbnailType: "UPLOAD", thumbnail: ""})}
                    className={`flex-1 py-2 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors ${formData.thumbnailType === 'UPLOAD' ? 'bg-gray-100 border-b-2 border-black' : 'bg-white'}`}
                  >
                    <ImageIcon size={12}/> Upload
                  </button>
                </div>

                {formData.thumbnailType === "URL" ? (
                  <div>
                    <input 
                      type="text" 
                      placeholder="https://example.com/image.jpg"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                      className="w-full p-2 border border-black text-xs font-mono outline-none focus:border-2 focus:border-black"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-black p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                    <ImageIcon size={24} className="mx-auto mb-2 text-black" />
                    <span className="text-xs font-bold uppercase">Click to select file</span>
                    <p className="text-[10px] font-mono mt-1 text-gray-500">Max 2MB. JPG, PNG.</p>
                    <input type="file" className="hidden" />
                  </div>
                )}

                {/* Preview Image */}
                {formData.thumbnail && formData.thumbnailType === "URL" && (
                  <div className="mt-4 border border-black p-1">
                    <p className="text-[10px] font-bold uppercase mb-1">Preview:</p>
                    <img src={formData.thumbnail} alt="Preview" className="w-full h-32 object-cover grayscale border border-gray-200" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x200?text=Invalid+Image+URL")} />
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}