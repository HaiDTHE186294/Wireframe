import React, { useState } from "react";
import { Image as ImageIcon, Link as LinkIcon, Plus, Edit2, Trash2, LayoutTemplate, X, Search, CheckCircle } from "lucide-react";

// --- INTERFACES ---
interface ProductSlot {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface BlogSlot {
  id: string;
  title: string;
  date: string;
}

type ModalType = "HERO_BANNER" | "FEATURED" | "STORY" | "BEST_SELLER" | "BLOG" | null;

export function HomepageManagement() {
  // --- STATES ---
  
  // 1. Hero Banners (Exactly 3 slots, uses Blog data)
  const [heroBanners, setHeroBanners] = useState<(BlogSlot | null)[]>([
    { id: "BLG-01", title: "The Art of Pour Over", date: "2026-02-25" },
    null,
    null
  ]);

  // 2. Featured Collection
  const [featured, setFeatured] = useState<(ProductSlot | null)[]>([
    { id: "PROD-01", name: "Arabica Premium", price: 262500, imageUrl: "image-url" },
    null,
    null
  ]);

  // 3. Katak Story (Exactly 1 slot, uses Blog data)
  const [story, setStory] = useState<(BlogSlot | null)[]>([
    { id: "BLG-03", title: "Farm to Cup: Our Journey", date: "2026-03-10" }
  ]);

  // 4. Best Seller
  const [bestSellers, setBestSellers] = useState<(ProductSlot | null)[]>([
    null, null, null
  ]);

  // 5. Coffee Culture / Blogs
  const [blogs, setBlogs] = useState<(BlogSlot | null)[]>([
    { id: "BLG-02", title: "Understanding Roast Levels", date: "2026-03-01" },
    null,
    null
  ]);

  // --- MODAL & UI STATES ---
  const [selectorModal, setSelectorModal] = useState<{ type: ModalType, slotIndex: number }>({ type: null, slotIndex: -1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- MOCK DATA ---
  const mockProducts: ProductSlot[] = [
    { id: "PROD-01", name: "Arabica Premium", price: 262500, imageUrl: "" },
    { id: "PROD-02", name: "Robusta Honey", price: 180000, imageUrl: "" },
    { id: "PROD-03", name: "Signature Blend", price: 320000, imageUrl: "" },
    { id: "PROD-04", name: "Cold Brew Pack", price: 150000, imageUrl: "" },
    { id: "PROD-05", name: "Ethiopia Yirgacheffe", price: 450000, imageUrl: "" },
  ];

  const mockBlogs: BlogSlot[] = [
    { id: "BLG-01", title: "The Art of Pour Over", date: "2026-02-25" },
    { id: "BLG-02", title: "Understanding Roast Levels", date: "2026-03-01" },
    { id: "BLG-03", title: "Farm to Cup: Our Journey", date: "2026-03-10" },
    { id: "BLG-04", title: "Water Temperature Matters", date: "2026-03-15" },
    { id: "BLG-05", title: "Holiday Promo 2026", date: "2026-03-20" },
  ];

  // --- HANDLERS ---
  const handleSave = () => {
    setToastMessage("SYS_MSG: LAYOUT_SAVED_SUCCESSFULLY");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openSelector = (type: ModalType, index: number) => {
    setSelectorModal({ type, slotIndex: index });
    setSearchQuery("");
  };

  const selectItem = (item: any) => {
    const { type, slotIndex } = selectorModal;
    if (type === "HERO_BANNER") {
      const newArr = [...heroBanners]; newArr[slotIndex] = item; setHeroBanners(newArr);
    } else if (type === "FEATURED") {
      const newArr = [...featured]; newArr[slotIndex] = item; setFeatured(newArr);
    } else if (type === "STORY") {
      const newArr = [...story]; newArr[slotIndex] = item; setStory(newArr);
    } else if (type === "BEST_SELLER") {
      const newArr = [...bestSellers]; newArr[slotIndex] = item; setBestSellers(newArr);
    } else if (type === "BLOG") {
      const newArr = [...blogs]; newArr[slotIndex] = item; setBlogs(newArr);
    }
    setSelectorModal({ type: null, slotIndex: -1 });
  };

  const removeItem = (type: ModalType, index: number) => {
    if (type === "HERO_BANNER") {
      const newArr = [...heroBanners]; newArr[index] = null; setHeroBanners(newArr);
    } else if (type === "FEATURED") {
      const newArr = [...featured]; newArr[index] = null; setFeatured(newArr);
    } else if (type === "STORY") {
      const newArr = [...story]; newArr[index] = null; setStory(newArr);
    } else if (type === "BEST_SELLER") {
      const newArr = [...bestSellers]; newArr[index] = null; setBestSellers(newArr);
    } else if (type === "BLOG") {
      const newArr = [...blogs]; newArr[index] = null; setBlogs(newArr);
    }
  };

  // --- RENDER HELPERS ---
  const WireframeImagePlaceholder = ({ imageUrl, text = "IMAGE" }: { imageUrl?: string, text?: string }) => {
    if (imageUrl) {
      return <img src={imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80" />;
    }
    return (
      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center bg-white"
        style={{
          backgroundImage: 'linear-gradient(to top right, transparent calc(50% - 1px), black 50%, transparent calc(50% + 1px)), linear-gradient(to bottom right, transparent calc(50% - 1px), black 50%, transparent calc(50% + 1px))'
        }}
      >
        <span className="bg-white px-2 py-1 text-xs border border-black uppercase font-bold">{text}</span>
      </div>
    );
  };

  const renderSlot = (item: any, type: NonNullable<ModalType>, index: number) => {
    const isEmpty = item === null;
    const isBlogType = type === "HERO_BANNER" || type === "STORY" || type === "BLOG";

    return (
      <div key={`${type}-${index}`} className={`border p-4 h-48 flex flex-col justify-between transition-none ${isEmpty ? 'border-dashed border-black' : 'border-black'}`}>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-black">SLOT [{index + 1}]</span>
          {!isEmpty && (
            <button onClick={() => removeItem(type, index)} className="text-black hover:bg-black hover:text-white border border-transparent hover:border-black p-1 transition-none" title="Clear Slot">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {isEmpty ? (
          <div className="flex-1 border border-black flex flex-col items-center justify-center cursor-pointer group hover:bg-black hover:text-white transition-none" onClick={() => openSelector(type, index)}>
            <Plus size={24} className="mb-2" />
            <span className="text-xs font-bold uppercase">ASSIGN_ITEM</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col cursor-pointer group" onClick={() => openSelector(type, index)}>
            <div className="flex-1 border border-black mb-2 relative overflow-hidden bg-white">
              <WireframeImagePlaceholder />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 flex items-center justify-center border border-black transition-none">
                <span className="text-xs font-bold uppercase flex items-center gap-1"><Edit2 size={12}/> CHANGE_ITEM</span>
              </div>
            </div>
            {isBlogType ? (
              <>
                <p className="text-sm font-bold truncate uppercase">{item.title}</p>
                <p className="text-[10px] mt-1">DATE: {item.date}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold truncate uppercase">{item.name}</p>
                <p className="text-[10px] mt-1">PRICE: {item.price.toLocaleString()} VND</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white text-black min-h-screen pb-20 font-mono selection:bg-black selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-black border border-black px-6 py-4 flex items-center gap-3">
          <CheckCircle size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Header Sticky */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black sticky top-0 bg-white z-10 pt-6 px-8">
        <div className="flex items-center gap-3">
          <LayoutTemplate size={28} />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter">HOMEPAGE_CMS_EDITOR</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1">WIREFRAME_ARCHITECTURE_V2</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="px-6 py-3 bg-white text-black font-bold uppercase text-xs hover:bg-black hover:text-white border border-black transition-none"
        >
          EXECUTE_SAVE
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-16 px-8">
        
        {/* 1. HERO BANNERS (Modified to use Blog selection) */}
        <section>
          <div className="mb-4 flex items-center justify-between border-b border-black pb-2">
            <h2 className="text-base font-bold uppercase tracking-widest">1. HERO_BANNERS [CAROUSEL]</h2>
            <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-3 py-1">3 SLOTS (USES BLOG DATA)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {heroBanners.map((item, idx) => renderSlot(item, "HERO_BANNER", idx))}
          </div>
        </section>

        {/* 2. FEATURED COLLECTION */}
        <section>
          <div className="mb-4 flex items-center justify-between border-b border-black pb-2">
            <h2 className="text-base font-bold uppercase tracking-widest">2. FEATURED_COLLECTION</h2>
            <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-3 py-1">3 SLOTS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((item, idx) => renderSlot(item, "FEATURED", idx))}
          </div>
        </section>

        {/* 3. BRAND STORY (Modified to use Blog selection) */}
        <section>
          <div className="mb-4 flex items-center justify-between border-b border-black pb-2">
            <h2 className="text-base font-bold uppercase tracking-widest">3. BRAND_STORY_BLOCK</h2>
            <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-3 py-1">1 SLOT (USES BLOG DATA)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Story now only uses 1 slot based on the array length we set in state */}
            {story.map((item, idx) => renderSlot(item, "STORY", idx))}
          </div>
        </section>

        {/* 4. BEST SELLER */}
        <section>
          <div className="mb-4 flex items-center justify-between border-b border-black pb-2">
            <h2 className="text-base font-bold uppercase tracking-widest">4. BEST_SELLER_GRID</h2>
            <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-3 py-1">3 SLOTS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bestSellers.map((item, idx) => renderSlot(item, "BEST_SELLER", idx))}
          </div>
        </section>

        {/* 5. COFFEE CULTURE (BLOGS) */}
        <section>
          <div className="mb-4 flex items-center justify-between border-b border-black pb-2">
            <h2 className="text-base font-bold uppercase tracking-widest">5. ARTICLES_FEED</h2>
            <span className="text-[10px] uppercase font-bold tracking-widest border border-black px-3 py-1">3 SLOTS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((item, idx) => renderSlot(item, "BLOG", idx))}
          </div>
        </section>

      </div>

      {/* ================= MODAL: SELECTOR ================= */}
      {selectorModal.type !== null && (
        <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectorModal({ type: null, slotIndex: -1 })}>
          <div className="bg-white border border-black p-8 w-full max-w-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 border-b border-black pb-4">
              <h2 className="text-xl font-bold uppercase tracking-tighter">
                SELECT_{selectorModal.type} <span className="opacity-50">/ SLOT_{selectorModal.slotIndex + 1}</span>
              </h2>
              <button onClick={() => setSelectorModal({ type: null, slotIndex: -1 })} className="p-2 border border-transparent hover:border-black transition-none">
                <X size={24} />
              </button>
            </div>

            <div className="relative mb-6 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={20} />
              <input 
                type="text" 
                placeholder={`QUERY_DATABASE...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-black text-sm font-bold uppercase outline-none focus:bg-black focus:text-white placeholder:text-black/30 tracking-wider transition-none"
                autoFocus
              />
            </div>

            <div className="border border-black overflow-y-auto flex-1 bg-white">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {/* Determine data source based on slot type */}
                  {(["HERO_BANNER", "STORY", "BLOG"].includes(selectorModal.type) ? mockBlogs : mockProducts)
                    .filter((item: any) => 
                      item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (item.name || item.title).toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((item: any) => (
                    <tr key={item.id} className="border-b border-black last:border-b-0 hover:bg-black hover:text-white cursor-pointer transition-none group" onClick={() => selectItem(item)}>
                      <td className="p-4 text-xs w-28 border-r border-black font-bold">{item.id}</td>
                      <td className="p-4 font-bold text-sm uppercase">{item.name || item.title}</td>
                      <td className="p-4 text-right text-xs border-l border-black w-36 font-bold">
                        {item.price ? `${item.price.toLocaleString()} VND` : item.date}
                      </td>
                      <td className="p-4 text-center w-28 border-l border-black">
                        <span className="text-[10px] font-bold uppercase border border-black bg-white text-black group-hover:border-white px-3 py-1">SELECT</span>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Empty State */}
                  {(["HERO_BANNER", "STORY", "BLOG"].includes(selectorModal.type) ? mockBlogs : mockProducts).filter((item: any) => 
                      item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (item.name || item.title).toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-sm font-bold uppercase tracking-widest text-black/50">
                          NULL_RESULT
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}