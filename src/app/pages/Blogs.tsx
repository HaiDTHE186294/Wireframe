import { useState, useEffect, useRef } from "react";
import { Search, Plus, Edit, ArrowLeft, Trash2, Check, Image as ImageIcon, Eye, Code, Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered } from "lucide-react";
import { Pagination } from "../components/Pagination";

// --- ENUMS & INTERFACES ---
enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED"
}

enum BlogCategory {
  KNOWLEDGE = "Knowledge",
  EVENT = "Event",
  PROMOTION = "Promotion",
  BANNER = "Banner"
}

type ThumbnailType = "URL" | "UPLOAD";

interface Blog {
  id: string;
  title: string;
  content: string; // Lưu trữ HTML
  category: BlogCategory;
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
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States cho màn Form (Detail/Update/Add)
  const [isEditMode, setIsEditMode] = useState(false); // Trạng thái Toggle Xem <-> Sửa
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(false); // Toggle xem trước HTML khi đang edit
  
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Dùng để xử lý insert HTML tags
  
  const initialFormState: Partial<Blog> = {
    title: "", content: "", category: BlogCategory.KNOWLEDGE, thumbnail: "", thumbnailType: "URL", status: BlogStatus.DRAFT
  };
  const [formData, setFormData] = useState<Partial<Blog>>(initialFormState);

  // --- MOCK DATA ---
  const [blogs, setBlogs] = useState<Blog[]>([
    {
      id: "BLG-001",
      title: "The Art of Roasting: Finding the Perfect Profile",
      content: "<h2>Introduction</h2><p>Roasting coffee is a delicate balance of temperature and time...</p><h3>First Crack</h3><p>The first crack signifies the bean expanding...</p>",
      category: BlogCategory.KNOWLEDGE,
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
      category: BlogCategory.KNOWLEDGE,
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
      category: BlogCategory.PROMOTION,
      thumbnail: "",
      thumbnailType: "UPLOAD",
      author: "CEO Admin",
      status: BlogStatus.ARCHIVED,
      created_at: "2025-12-01 08:00",
      updated_at: "2026-01-15 10:00"
    },
    {
      id: "BLG-004",
      title: "Katak Coffee at Vietnam Coffee Expo 2026",
      content: "<h2>Join Us</h2><p>We are thrilled to announce our participation in this year's Expo...</p>",
      category: BlogCategory.EVENT,
      thumbnail: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
      thumbnailType: "URL",
      author: "Marketing Team",
      status: BlogStatus.PUBLISHED,
      created_at: "2026-02-20 09:00",
      updated_at: "2026-02-20 09:00"
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
    setIsEditMode(false); 
    setCurrentView("form");
  };

  const handleOpenCreate = () => {
    setFormData(initialFormState);
    setIsCreatingNew(true);
    setIsEditMode(true); 
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
    
    setIsCreatingNew(false);
    setIsEditMode(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to mark this blog as DELETED?")) {
      setBlogs(blogs.map(b => b.id === id ? { ...b, status: BlogStatus.DELETED } : b));
      handleOpenList();
    }
  };

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  // --- RICH TEXT EDITOR HANDLER ---
  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content?.substring(start, end) || "";
    
    // Nếu chưa chọn chữ nào, chèn 1 thẻ trống với placeholder
    const textToInsert = selectedText ? selectedText : "your text here";
    const newContent = 
      (formData.content || "").substring(0, start) + 
      openTag + textToInsert + closeTag + 
      (formData.content || "").substring(end);
      
    setFormData({ ...formData, content: newContent });

    // Focus lại vào textarea sau khi chèn
    setTimeout(() => {
      textarea.focus();
      // Bôi đen phần text ở giữa thẻ để user gõ đè
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + textToInsert.length);
    }, 0);
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
      b.status !== BlogStatus.DELETED && 
      (statusFilter === "ALL" || b.status === statusFilter) &&
      (categoryFilter === "ALL" || b.category === categoryFilter) &&
      (b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
    const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {Object.values(BlogCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
        <div className="border border-black mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-16 text-center">Thumb</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black">Article Title & Category</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-32">Author</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-32">Last Updated</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-black w-28 text-center">Status</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBlogs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-xs font-bold uppercase text-gray-500 border-t border-black">No articles found.</td></tr>
              ) : (
                paginatedBlogs.map((blog) => (
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold uppercase border border-black px-1 text-gray-600">{blog.category}</span>
                        <span className="text-[10px] font-mono text-gray-500">ID: {blog.id}</span>
                      </div>
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

        {/* Pagination (Always render as requested) */}
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          totalItems={filteredBlogs.length} 
          itemsPerPage={itemsPerPage} 
          onPageChange={setCurrentPage} 
        />
      </div>
    );
  }

  // ==========================================
  // VIEW: FORM (DETAIL & UPDATE COMBINED)
  // ==========================================
  if (currentView === "form") {
    return (
      <div className="bg-white text-black pb-10 max-w-6xl mx-auto">
        
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
            
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase border border-black px-2 py-1 bg-gray-50">{formData.category}</span>
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
            <div className="font-sans leading-relaxed text-sm [&>h1]:text-2xl [&>h1]:font-black [&>h1]:uppercase [&>h1]:mt-8 [&>h1]:mb-4 [&>h1]:border-b-2 [&>h1]:border-black [&>h2]:text-xl [&>h2]:font-bold [&>h2]:uppercase [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:border-b [&>h2]:border-black [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4">
              <div dangerouslySetInnerHTML={{ __html: formData.content || "<p class='italic text-gray-400'>No content available.</p>" }} />
            </div>
          </div>
        ) : 
        
        // ================= MODE: EDIT / CREATE =================
        (
          <div className="flex flex-col gap-8">
            {/* Top Section: Meta & Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="md:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase mb-2">Article Title *</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    placeholder="Enter a captivating title..."
                    className="w-full p-4 border-2 border-black text-xl font-black outline-none focus:border-dashed transition-all bg-white" 
                  />
                </div>
                
                {/* Settings Block */}
                <div className="grid grid-cols-2 gap-6 border-t border-black pt-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2">Category *</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as BlogCategory})}
                      className="w-full p-3 border-2 border-black text-sm font-bold uppercase outline-none focus:border-dashed transition-all bg-white"
                    >
                      {Object.values(BlogCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase mb-2">Publishing Status</h3>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as BlogStatus})}
                      className="w-full p-3 border-2 border-black text-sm font-bold uppercase outline-none focus:border-dashed transition-all bg-white"
                    >
                      {Object.values(BlogStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Thumbnail */}
              <div className="md:col-span-1 border border-black p-5 bg-white h-full flex flex-col">
                <h3 className="text-xs font-bold uppercase border-b border-black pb-2 mb-4">Cover Image</h3>
                <label className="flex-1 block border-2 border-dashed border-black p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors flex flex-col items-center justify-center">
                  <ImageIcon size={32} className="mx-auto mb-2 text-black" />
                  <span className="block text-xs font-bold uppercase mb-1">Upload Thumbnail</span>
                  <p className="text-[10px] font-mono mt-1 text-gray-500">Max 2MB. JPG, PNG</p>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setFormData({...formData, thumbnail: reader.result as string, thumbnailType: "UPLOAD"});
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden" 
                  />
                </label>
                {formData.thumbnail && (
                  <div className="mt-4 border border-black p-1">
                    <img src={formData.thumbnail} alt="Preview" className="w-full h-24 object-cover grayscale border border-gray-200" />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Section: HTML Content Editor (Rich Text Emulator) */}
            <div className="border-t-2 border-black pt-8">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="text-lg font-black uppercase">Story Content</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">HTML Editor Mode</p>
                </div>
                <button 
                  onClick={() => setPreviewHtml(!previewHtml)}
                  className="text-[10px] font-bold uppercase border-2 border-black px-4 py-2 bg-black text-white hover:invert flex items-center gap-2 transition-all"
                >
                  {previewHtml ? <Code size={14}/> : <Eye size={14}/>}
                  {previewHtml ? "Back to Editor" : "Live Preview"}
                </button>
              </div>
              
              {/* Editor Toolbar */}
              {!previewHtml && (
                <div className="flex flex-wrap gap-2 border-2 border-b-0 border-black bg-gray-100 p-2">
                  <div className="flex gap-1 border-r-2 border-black pr-2">
                    <button onClick={() => insertTag("<strong>", "</strong>")} className="p-2 bg-white border border-black hover:bg-gray-200 font-bold" title="Bold"><Bold size={16}/></button>
                    <button onClick={() => insertTag("<em>", "</em>")} className="p-2 bg-white border border-black hover:bg-gray-200 italic" title="Italic"><Italic size={16}/></button>
                    <button onClick={() => insertTag("<u>", "</u>")} className="p-2 bg-white border border-black hover:bg-gray-200 underline" title="Underline"><Underline size={16}/></button>
                  </div>
                  <div className="flex gap-1 border-r-2 border-black pr-2">
                    <button onClick={() => insertTag("<h1>", "</h1>")} className="p-2 bg-white border border-black hover:bg-gray-200 font-black" title="Heading 1"><Heading1 size={16}/></button>
                    <button onClick={() => insertTag("<h2>", "</h2>")} className="p-2 bg-white border border-black hover:bg-gray-200 font-bold" title="Heading 2"><Heading2 size={16}/></button>
                    <button onClick={() => insertTag("<p>", "</p>")} className="px-3 py-2 bg-white border border-black hover:bg-gray-200 font-bold text-xs" title="Paragraph">P</button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => insertTag("<ul>\n  <li>", "</li>\n</ul>")} className="p-2 bg-white border border-black hover:bg-gray-200" title="Bullet List"><List size={16}/></button>
                    <button onClick={() => insertTag("<ol>\n  <li>", "</li>\n</ol>")} className="p-2 bg-white border border-black hover:bg-gray-200" title="Numbered List"><ListOrdered size={16}/></button>
                  </div>
                </div>
              )}
              
              {/* Editor Workspace */}
              {previewHtml ? (
                <div className="w-full p-8 border-2 border-black min-h-[500px] overflow-auto bg-gray-50">
                  <div className="font-sans text-sm [&>h1]:text-2xl [&>h1]:font-black [&>h1]:uppercase [&>h1]:mt-8 [&>h1]:mb-4 [&>h1]:border-b-2 [&>h1]:border-black [&>h2]:text-xl [&>h2]:font-bold [&>h2]:uppercase [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:border-b [&>h2]:border-black [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-2 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4" 
                       dangerouslySetInnerHTML={{ __html: formData.content || "<p class='text-gray-400 font-mono text-xs italic uppercase'>No content yet...</p>" }} />
                </div>
              ) : (
                <textarea 
                  ref={textareaRef}
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})} 
                  placeholder="<h2>Start your story here...</h2>&#10;<p>Write your amazing content...</p>"
                  className="w-full p-6 border-2 border-black text-sm font-mono leading-relaxed min-h-[500px] outline-none focus:bg-yellow-50 transition-colors bg-white" 
                />
              )}
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] font-bold uppercase text-gray-500">Supports raw HTML tags. Use the toolbar for quick formatting.</p>
                <p className="text-[10px] font-mono text-gray-400">Word Count: {(formData.content || "").split(/\s+/).filter(w => w.length > 0).length}</p>
              </div>
            </div>

          </div>
        )}
      </div>
    );
  }

  return null;
}