import React, { useState } from 'react';
import { 
  FolderTree, 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Check, 
  Trash2, 
  Eye, 
  Sparkles, 
  Layers, 
  Edit3, 
  Camera,
  RefreshCw,
  Search,
  Tag,
  DollarSign,
  FileText,
  X,
  Type
} from 'lucide-react';
import { CATEGORIES_TAXONOMY, CategoryTaxonomyItem } from './categoriesData';
import { SERVICES } from './data';
import { uploadImageToImgBB } from './imgbbUpload';

interface TariraCategoryPhotosManagerProps {
  categoryImages: { [key: string]: string };
  onUpdateCategoryImages: (images: { [key: string]: string }) => void;
  subServiceImages?: { [key: string]: string };
  onUpdateSubServiceImages?: (images: { [key: string]: string }) => void;
  onTriggerAuditLog?: (action: string, details: string) => void;
}

export const TariraCategoryPhotosManager: React.FC<TariraCategoryPhotosManagerProps> = ({
  categoryImages,
  onUpdateCategoryImages,
  subServiceImages = {},
  onUpdateSubServiceImages,
  onTriggerAuditLog
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'categories' | 'subservices'>('categories');
  const [searchTerm, setSearchTerm] = useState('');

  // Categories list with local storage persistence
  const [categoriesList, setCategoriesList] = useState<CategoryTaxonomyItem[]>(() => {
    try {
      const saved = localStorage.getItem('tarira_categories_taxonomy');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return CATEGORIES_TAXONOMY;
  });

  // Dynamic SubServices list
  const initialSubServices: Array<{
    id: string;
    name: string;
    catName: string;
    catId: string;
    price: number;
    unit: string;
    description?: string;
  }> = [];

  SERVICES.forEach((catGroup: any) => {
    if (catGroup.items && Array.isArray(catGroup.items)) {
      catGroup.items.forEach((item: any) => {
        initialSubServices.push({
          id: item.id || `srv-${item.n || item.name}`,
          name: item.n || item.name || 'Serviço',
          catName: catGroup.name || catGroup.cat || 'Geral',
          catId: catGroup.id || 'general',
          price: item.price || item.priceMzn || 0,
          unit: item.unit || 'sessão',
          description: item.desc || item.details || 'Intervenção técnica padronizada com garantia de qualidade TARIRA.'
        });
      });
    }
  });

  const [subServicesList, setSubServicesList] = useState<Array<{
    id: string;
    name: string;
    catName: string;
    catId: string;
    price: number;
    unit: string;
    description?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('tarira_subservices_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialSubServices;
  });

  // Modal State for Full Editing (Text + Photo)
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    description: string;
    badge: string;
    icon: string;
    group: 'trades' | 'office' | 'domestic';
    specialties: string;
    imageUrl: string;
  } | null>(null);

  const [editingService, setEditingService] = useState<{
    id: string;
    name: string;
    catName: string;
    price: number;
    unit: string;
    description: string;
    imageUrl: string;
  } | null>(null);

  // Add Modals
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // Add Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('⚡');
  const [newCatGroup, setNewCatGroup] = useState<'trades' | 'office' | 'domestic'>('trades');
  const [newCatBadge, setNewCatBadge] = useState('Connect · Campo');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatSpecs, setNewCatSpecs] = useState('');
  const [newCatImageUrl, setNewCatImageUrl] = useState('https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80');

  // Add Service Form
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCat, setNewSrvCat] = useState('Eletricidade & Energia');
  const [newSrvPrice, setNewSrvPrice] = useState(2500);
  const [newSrvUnit, setNewSrvUnit] = useState('intervenção');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvImageUrl, setNewSrvImageUrl] = useState('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80');

  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Helper to get image for category
  const getCatImg = (id: string) => {
    return (
      categoryImages[id] ||
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'
    );
  };

  // Helper to get image for service
  const getServiceImg = (serviceName: string) => {
    if (subServiceImages && subServiceImages[serviceName]) {
      return subServiceImages[serviceName];
    }
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80';
  };

  // File Upload Helper — a imagem é enviada para o ImgBB (com reserva
  // automática) em vez de ficar guardada apenas como Base64 local.
  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um ficheiro de imagem válido.');
      return;
    }
    setIsUploading(true);
    uploadImageToImgBB(file)
      .then((url) => {
        callback(url);
        showToast('Imagem carregada com sucesso!');
      })
      .catch(() => {
        alert('Erro ao carregar a imagem.');
      })
      .finally(() => setIsUploading(false));
  };

  // ════════ SAVE EDIT CATEGORY (PHOTO + TEXT) ════════
  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    // 1. Update text attributes in categories taxonomy
    const specsArray = editingCategory.specialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedCategories = categoriesList.map((cat) => {
      if (cat.id === editingCategory.id) {
        return {
          ...cat,
          name: editingCategory.name,
          description: editingCategory.description,
          badge: editingCategory.badge,
          icon: editingCategory.icon,
          group: editingCategory.group,
          specialties: specsArray.length > 0 ? specsArray : cat.specialties
        };
      }
      return cat;
    });

    setCategoriesList(updatedCategories);
    try {
      localStorage.setItem('tarira_categories_taxonomy', JSON.stringify(updatedCategories));
    } catch (err) {}

    // 2. Update Image
    if (editingCategory.imageUrl.trim()) {
      const updatedImgs = {
        ...categoryImages,
        [editingCategory.id]: editingCategory.imageUrl.trim()
      };
      onUpdateCategoryImages(updatedImgs);
      try {
        localStorage.setItem('tarira_category_images', JSON.stringify(updatedImgs));
      } catch (err) {}
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'EDITAR_CATEGORIA_E_FOTO',
        `Categoria "${editingCategory.name}" e respetiva fotografia atualizadas.`
      );
    }

    showToast(`Categoria "${editingCategory.name}" e foto atualizadas!`);
    setEditingCategory(null);
  };

  // ════════ SAVE EDIT SERVICE (PHOTO + TEXT) ════════
  const handleSaveEditService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    // 1. Update subservice text & price
    const updatedServices = subServicesList.map((srv) => {
      if (srv.id === editingService.id) {
        return {
          ...srv,
          name: editingService.name,
          catName: editingService.catName,
          price: Number(editingService.price) || 0,
          unit: editingService.unit,
          description: editingService.description
        };
      }
      return srv;
    });

    setSubServicesList(updatedServices);
    try {
      localStorage.setItem('tarira_subservices_custom', JSON.stringify(updatedServices));
    } catch (err) {}

    // 2. Update Service Image
    if (editingService.imageUrl.trim() && onUpdateSubServiceImages) {
      const updatedImgs = {
        ...subServiceImages,
        [editingService.name]: editingService.imageUrl.trim()
      };
      onUpdateSubServiceImages(updatedImgs);
      try {
        localStorage.setItem('tarira_subservice_images', JSON.stringify(updatedImgs));
      } catch (err) {}
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'EDITAR_SERVICO_E_FOTO',
        `Serviço "${editingService.name}" (${editingService.price} MZN) e foto atualizados.`
      );
    }

    showToast(`Serviço "${editingService.name}" e foto atualizados!`);
    setEditingService(null);
  };

  // ════════ CREATE CATEGORY ════════
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newId = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const specsArray = newCatSpecs.split(',').map((s) => s.trim()).filter(Boolean);

    const created: CategoryTaxonomyItem = {
      id: newId,
      name: newCatName.trim(),
      group: newCatGroup,
      icon: newCatIcon || '📦',
      badge: newCatBadge || (newCatGroup === 'trades' ? 'Connect · Campo' : 'Recruit · Gestão'),
      description: newCatDesc || 'Categoria criada pelo painel administrativo da TARIRA.',
      specialties: specsArray.length > 0 ? specsArray : ['Atendimento Técnico', 'Especialidade Certificada']
    };

    const updatedCatList = [created, ...categoriesList];
    setCategoriesList(updatedCatList);
    try {
      localStorage.setItem('tarira_categories_taxonomy', JSON.stringify(updatedCatList));
    } catch (err) {}

    if (newCatImageUrl.trim()) {
      const updatedImgs = { ...categoryImages, [newId]: newCatImageUrl.trim() };
      onUpdateCategoryImages(updatedImgs);
      try {
        localStorage.setItem('tarira_category_images', JSON.stringify(updatedImgs));
      } catch (err) {}
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog('CRIAR_CATEGORIA', `Categoria "${created.name}" criada com fotografia.`);
    }

    showToast(`Categoria "${created.name}" criada com sucesso!`);
    setShowAddCatModal(false);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatSpecs('');
  };

  // ════════ CREATE SUBSERVICE ════════
  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvName.trim()) return;

    const newId = `srv-${Date.now()}`;
    const newService = {
      id: newId,
      name: newSrvName.trim(),
      catName: newSrvCat,
      catId: newSrvCat.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      price: Number(newSrvPrice) || 0,
      unit: newSrvUnit,
      description: newSrvDesc || 'Serviço técnico com garantia de qualidade e suporte TARIRA.'
    };

    const updated = [newService, ...subServicesList];
    setSubServicesList(updated);
    try {
      localStorage.setItem('tarira_subservices_custom', JSON.stringify(updated));
    } catch (err) {}

    if (newSrvImageUrl.trim() && onUpdateSubServiceImages) {
      const updatedImgs = { ...subServiceImages, [newService.name]: newSrvImageUrl.trim() };
      onUpdateSubServiceImages(updatedImgs);
      try {
        localStorage.setItem('tarira_subservice_images', JSON.stringify(updatedImgs));
      } catch (err) {}
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog('CRIAR_SERVICO', `Serviço "${newService.name}" adicionado ao catálogo.`);
    }

    showToast(`Serviço "${newService.name}" adicionado com sucesso!`);
    setShowAddServiceModal(false);
    setNewSrvName('');
    setNewSrvDesc('');
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#172554] text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-blue-300 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-blue-500/25 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-widest border border-blue-500/30">
              📂 CATÁLOGO & MULTIMÉDIA • EDIÇÃO DE FOTOS E TEXTOS
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#172554]">
            Gestão de Categorias, Sub-Serviços, Textos & Fotografias
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Edite todos os textos, títulos, descrições, etiquetas, preços e faça o upload de fotografias de cada item do catálogo do ecossistema TARIRA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveViewMode('categories')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'categories'
                  ? 'bg-[#172554] text-white shadow-md'
                  : 'text-slate-500 hover:text-[#172554]'
              }`}
            >
              📂 Categorias & Fotos ({categoriesList.length})
            </button>
            <button
              onClick={() => setActiveViewMode('subservices')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'subservices'
                  ? 'bg-[#172554] text-white shadow-md'
                  : 'text-slate-500 hover:text-[#172554]'
              }`}
            >
              🛠️ Sub-Serviços & Preços ({subServicesList.length})
            </button>
          </div>

          {activeViewMode === 'categories' ? (
            <button
              onClick={() => setShowAddCatModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#172554] text-white hover:brightness-110 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Categoria</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#172554] text-white hover:brightness-110 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Serviço</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Filtrar por nome, texto ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-700" />
          <span>Ao editar qualquer item, você pode alterar tanto o <strong>texto explicativo</strong> quanto a <strong>fotografia</strong> correspondente.</span>
        </div>
      </div>

      {/* ════════ VIEW MODE 1: CATEGORIES (PHOTO + TEXT) ════════ */}
      {activeViewMode === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesList
            .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((cat) => {
              const currentImg = getCatImg(cat.id);
              return (
                <div
                  key={cat.id}
                  className="glass-panel rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl flex flex-col justify-between hover:border-blue-500/40 transition-all group"
                >
                  {/* Category Image Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-white">
                    <img
                      src={currentImg}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-white backdrop-blur-md border border-slate-200 text-xl shadow-md">
                        {cat.icon}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#172554] text-white text-[10px] font-mono font-black uppercase shadow-lg">
                        {cat.badge}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setEditingCategory({
                          id: cat.id,
                          name: cat.name,
                          description: cat.description,
                          badge: cat.badge,
                          icon: cat.icon,
                          group: cat.group,
                          specialties: cat.specialties.join(', '),
                          imageUrl: currentImg
                        })
                      }
                      className="absolute bottom-3 right-3 px-3.5 py-2 rounded-xl bg-white hover:bg-[#172554] text-slate-200 hover:text-[#172554] border border-slate-200 hover:border-blue-400 text-xs font-bold shadow-xl transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Texto & Foto</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-[#172554]">{cat.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                          {cat.group}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-slate-200">
                      <span className="text-[9px] uppercase font-mono text-slate-400 block mb-1.5">
                        Especialidades ({cat.specialties.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cat.specialties.slice(0, 4).map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-white text-slate-500 text-[10px] border border-slate-200"
                          >
                            {spec}
                          </span>
                        ))}
                        {cat.specialties.length > 4 && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 text-[10px] font-bold">
                            +{cat.specialties.length - 4} mais
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ════════ VIEW MODE 2: SUB-SERVICES (PHOTO + TEXT) ════════ */}
      {activeViewMode === 'subservices' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subServicesList
            .filter((srv) => srv.name.toLowerCase().includes(searchTerm.toLowerCase()) || srv.catName.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((srv) => {
              const currentImg = getServiceImg(srv.name);
              return (
                <div
                  key={srv.id}
                  className="glass-panel rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl flex flex-col justify-between hover:border-blue-500/30 transition-all group"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-white">
                    <img
                      src={currentImg}
                      alt={srv.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white backdrop-blur-md border border-slate-200 text-[10px] font-mono text-blue-700 uppercase font-bold">
                      {srv.catName}
                    </span>

                    <button
                      onClick={() =>
                        setEditingService({
                          id: srv.id,
                          name: srv.name,
                          catName: srv.catName,
                          price: srv.price,
                          unit: srv.unit,
                          description: srv.description || '',
                          imageUrl: currentImg
                        })
                      }
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white hover:bg-[#172554] text-slate-200 hover:text-[#172554] border border-slate-200 hover:border-blue-400 text-xs font-bold shadow-xl transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Texto & Foto</span>
                    </button>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#172554] line-clamp-2 leading-snug">
                        {srv.name}
                      </h4>
                      {srv.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {srv.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                      <span className="text-slate-400">Preço Base:</span>
                      <span className="font-mono font-bold text-blue-700">
                        {srv.price.toLocaleString()} MZN / {srv.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ════════ MODAL 1: EDITAR CATEGORIA (TEXTO + FOTO) ════════ */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8 text-left">
            <button
              onClick={() => setEditingCategory(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-3 mb-4">
              <span className="text-[10px] font-mono text-blue-700 uppercase font-bold tracking-widest">
                EDIÇÃO INTEGRAL • CATEGORIA & MULTIMÉDIA
              </span>
              <h3 className="font-serif text-2xl text-[#172554] font-bold mt-1">
                Editar Categoria: {editingCategory.name}
              </h3>
            </div>

            <form onSubmit={handleSaveEditCategory} className="space-y-4">
              {/* Row 1: Name, Icon and Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Ícone / Emoji
                  </label>
                  <input
                    type="text"
                    value={editingCategory.icon}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 text-center"
                  />
                </div>
              </div>

              {/* Row 2: Badge and Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Etiqueta / Badge *
                  </label>
                  <input
                    type="text"
                    value={editingCategory.badge}
                    onChange={(e) => setEditingCategory({ ...editingCategory, badge: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Grupo de Atuação
                  </label>
                  <select
                    value={editingCategory.group}
                    onChange={(e) => setEditingCategory({ ...editingCategory, group: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400"
                  >
                    <option value="trades">⚡ Connect • Ofícios de Campo</option>
                    <option value="office">🔗 Recruit • Quadros & Gestão</option>
                    <option value="domestic">🏠 Serviços Domésticos</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Descrição Explicativa da Categoria
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              {/* Row 4: Specialties */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Especialidades Associadas (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={editingCategory.specialties}
                  onChange={(e) => setEditingCategory({ ...editingCategory, specialties: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                />
              </div>

              {/* Row 5: Photo Upload & URL */}
              <div className="space-y-2 p-4 rounded-2xl bg-white border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                  📸 Fotografia de Capa da Categoria
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="relative h-32 rounded-xl overflow-hidden bg-white border border-slate-200">
                    <img
                      src={editingCategory.imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        const inp = document.getElementById('edit-cat-upload') as HTMLInputElement;
                        if (inp) inp.click();
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-700 text-[#172554] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-600"
                    >
                      <Upload className="w-4 h-4 text-blue-700" />
                      <span>Fazer Upload do Dispositivo</span>
                    </button>
                    <input
                      id="edit-cat-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0], (b64) =>
                            setEditingCategory({ ...editingCategory, imageUrl: b64 })
                          );
                        }
                      }}
                    />

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">Ou URL da imagem:</span>
                      <input
                        type="url"
                        value={editingCategory.imageUrl}
                        onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                        className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-blue-400 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-7 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Salvar Texto & Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 2: EDITAR SERVIÇO (TEXTO + PREÇO + FOTO) ════════ */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8 text-left">
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-3 mb-4">
              <span className="text-[10px] font-mono text-blue-700 uppercase font-bold tracking-widest">
                EDIÇÃO INTEGRAL • SUB-SERVIÇO & MULTIMÉDIA
              </span>
              <h3 className="font-serif text-2xl text-[#172554] font-bold mt-1">
                Editar Serviço: {editingService.name}
              </h3>
            </div>

            <form onSubmit={handleSaveEditService} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Nome do Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.name}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Categoria Associada
                  </label>
                  <input
                    type="text"
                    value={editingService.catName}
                    onChange={(e) => setEditingService({ ...editingService, catName: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Preço Base (MZN)
                  </label>
                  <input
                    type="number"
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Unidade de Cobrança
                  </label>
                  <input
                    type="text"
                    value={editingService.unit}
                    onChange={(e) => setEditingService({ ...editingService, unit: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Descrição dos Trabalhos
                </label>
                <textarea
                  rows={2}
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              {/* Photo Upload for Service */}
              <div className="space-y-2 p-4 rounded-2xl bg-white border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                  📸 Fotografia do Serviço
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="relative h-28 rounded-xl overflow-hidden bg-white border border-slate-200">
                    <img
                      src={editingService.imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        const inp = document.getElementById('edit-srv-upload') as HTMLInputElement;
                        if (inp) inp.click();
                      }}
                      className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-700 text-[#172554] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-600"
                    >
                      <Upload className="w-4 h-4 text-blue-700" />
                      <span>Upload do Dispositivo</span>
                    </button>
                    <input
                      id="edit-srv-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0], (b64) =>
                            setEditingService({ ...editingService, imageUrl: b64 })
                          );
                        }
                      }}
                    />

                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={editingService.imageUrl}
                      onChange={(e) => setEditingService({ ...editingService, imageUrl: e.target.value })}
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-7 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Salvar Serviço & Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 3: ADICIONAR NOVA CATEGORIA ════════ */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8 text-left">
            <button
              onClick={() => setShowAddCatModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-4">
              Adicionar Nova Categoria ao Catálogo
            </h3>

            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Serralharia & Soldadura"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Ícone / Emoji
                  </label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Grupo
                  </label>
                  <select
                    value={newCatGroup}
                    onChange={(e) => setNewCatGroup(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400"
                  >
                    <option value="trades">⚡ Connect • Ofícios de Campo</option>
                    <option value="office">🔗 Recruit • Quadros & Gestão</option>
                    <option value="domestic">🏠 Serviços Domésticos</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={newCatBadge}
                    onChange={(e) => setNewCatBadge(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva a finalidade e escopo desta categoria..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Especialidades (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Soldadura TIG, Estruturas Metálicas, Portões"
                  value={newCatSpecs}
                  onChange={(e) => setNewCatSpecs(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-white border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                  📸 Fotografia Inicial da Categoria
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="relative h-28 rounded-xl overflow-hidden bg-white border border-slate-200">
                    <img
                      src={newCatImageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        const inp = document.getElementById('new-cat-upload') as HTMLInputElement;
                        if (inp) inp.click();
                      }}
                      className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-700 text-[#172554] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-600"
                    >
                      <Upload className="w-4 h-4 text-blue-700" />
                      <span>Upload do Dispositivo</span>
                    </button>
                    <input
                      id="new-cat-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0], (b64) => setNewCatImageUrl(b64));
                        }
                      }}
                    />

                    <input
                      type="url"
                      value={newCatImageUrl}
                      onChange={(e) => setNewCatImageUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Criar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 4: ADICIONAR NOVO SERVIÇO ════════ */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8 text-left">
            <button
              onClick={() => setShowAddServiceModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-4">
              Adicionar Novo Serviço ao Catálogo
            </h3>

            <form onSubmit={handleAddServiceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Nome do Serviço *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Instalação de Painel Solar"
                    value={newSrvName}
                    onChange={(e) => setNewSrvName(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={newSrvCat}
                    onChange={(e) => setNewSrvCat(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Preço Base (MZN)
                  </label>
                  <input
                    type="number"
                    value={newSrvPrice}
                    onChange={(e) => setNewSrvPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={newSrvUnit}
                    onChange={(e) => setNewSrvUnit(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Descrição do Serviço
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva o escopo e detalhes deste serviço..."
                  value={newSrvDesc}
                  onChange={(e) => setNewSrvDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-white border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                  📸 Fotografia Inicial do Serviço
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="relative h-28 rounded-xl overflow-hidden bg-white border border-slate-200">
                    <img
                      src={newSrvImageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        const inp = document.getElementById('new-srv-upload') as HTMLInputElement;
                        if (inp) inp.click();
                      }}
                      className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-700 text-[#172554] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-600"
                    >
                      <Upload className="w-4 h-4 text-blue-700" />
                      <span>Upload do Dispositivo</span>
                    </button>
                    <input
                      id="new-srv-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0], (b64) => setNewSrvImageUrl(b64));
                        }
                      }}
                    />

                    <input
                      type="url"
                      value={newSrvImageUrl}
                      onChange={(e) => setNewSrvImageUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Criar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
