import React, { useState } from 'react';
import {
  ImageIcon,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Sparkles,
  ExternalLink,
  Layers,
  Check,
  Power,
  Upload,
  Link,
  ArrowRight,
  MoveUp,
  MoveDown,
  Globe,
  Shuffle,
  Info
} from 'lucide-react';
import { LandingBannerItem } from './types';
import { uploadImageToImgBB } from './imgbbUpload';

interface TariraBannersCrudManagerProps {
  banners?: LandingBannerItem[];
  onUpdateBanners?: (banners: LandingBannerItem[]) => void;
  onTriggerAuditLog?: (action: string, details: string) => void;
}

const PRESET_BANNER_IMAGES = [
  {
    name: 'Recrutamento & Profissionais Executivos',
    url: 'https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    name: 'Avaliação & Entrevistas Corporativas',
    url: 'https://images.pexels.com/photos/5439152/pexels-photo-5439152.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    name: 'Ofícios Técnicos & Engenharia de Campo',
    url: 'https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg='
  },
  {
    name: 'Outsourcing & Gestão de Operações B2B',
    url: 'https://images.pexels.com/photos/5816283/pexels-photo-5816283.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    name: 'Supervisão & Equipas Dedicadas',
    url: 'https://images.pexels.com/photos/7658405/pexels-photo-7658405.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    name: 'Tarira Studio & Engenharia Digital',
    url: 'https://images.pexels.com/photos/6077983/pexels-photo-6077983.jpeg?auto=compress&cs=tinysrgb&w=1920'
  },
  {
    name: 'Consultoria Estratégica & Alianças',
    url: 'https://images.pexels.com/photos/7821517/pexels-photo-7821517.jpeg?auto=compress&cs=tinysrgb&w=1920'
  }
];

const TARGET_DESTINATIONS = [
  { value: 'connect', label: '⚡ Tarira Connect (Ofícios Técnicos & Reparações 24/7)' },
  { value: 'recrute', label: '🔗 Tarira Recruit (Quadros & Especialistas Corporativos)' },
  { value: 'business', label: '💼 Tarira Outsourcing (Gestão Operacional B2B)' },
  { value: 'consultoria', label: '💡 Tarira Consulting (Consultoria & Diagnóstico)' },
  { value: 'studio', label: '🚀 Tarira Studio (Design & Software)' },
  { value: 'apply', label: '🛠️ Cadastro de Prestador / Ofícios' },
  { value: 'spontaneous_apply', label: '🎓 Cadastro de Profissional / ATS' },
  { value: 'commercial_admin', label: '🏢 Gestão Comercial & Concursos B2B' },
  { value: 'custom_link', label: '🌐 Link Externo Personalizado (URL)' }
];

export const TariraBannersCrudManager: React.FC<TariraBannersCrudManagerProps> = ({
  banners = [],
  onUpdateBanners,
  onTriggerAuditLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const defaultBanners: LandingBannerItem[] = [
    {
      id: 'b-recrute',
      category: 'recrute',
      title: 'TARIRA Recruit',
      tagline: 'Talento Profissional de Elite, Quadros de TI & Finanças Vetted',
      desc: 'Atração, validação técnica rigorosa e conexão direta de quadros profissionais de alta performance em Moçambique com integridade e competência comprovada.',
      subtitle: 'Atração, validação técnica rigorosa e conexão direta de quadros profissionais de alta performance em Moçambique.',
      badge: 'Recrutamento Vetted',
      ctaText: 'Explorar Quadros de Elite',
      ctaLink: 'recruit_sub',
      targetTab: 'recrute',
      url: 'https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920',
      imageUrl: 'https://images.pexels.com/photos/10376238/pexels-photo-10376238.jpeg?auto=compress&cs=tinysrgb&w=1920',
      active: true,
      priority: 1
    },
    {
      id: 'b-connect',
      category: 'connect',
      title: 'TARIRA Connect',
      tagline: 'Ofícios Técnicos, Engenharia de Campo & Intervenções Certificadas',
      desc: 'Eletricistas qualificados, engenheiros de campo, técnicos de climatização e mestres de obras com contacto direto, pontualidade e rigor técnico em Moçambique.',
      subtitle: 'Eletricistas qualificados, engenheiros de campo, técnicos de climatização e mestres de obras com contacto direto.',
      badge: 'Assistência 24/7',
      ctaText: 'Solicitar Técnico Agora',
      ctaLink: 'connect',
      targetTab: 'connect',
      url: 'https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=',
      imageUrl: 'https://media.istockphoto.com/id/2199351006/photo/blueprint-architecture-and-men-at-table-shaking-hands-for-collaboration-agreement-and.jpg?s=170667a&w=0&k=20&c=Nk_l2MF9VLll_BdOGZtRiWGLEBK8WLhwQILUjZR1zzg=',
      active: true,
      priority: 2
    },
    {
      id: 'b-business',
      category: 'business',
      title: 'TARIRA Outsourcing',
      tagline: 'Recrutamento como parceria, não como transação.',
      desc: 'O seu recrutamento. Sem limites. Recruitment Process Outsourcing (RPO) — a sua função de recrutamento, entregue por nós.',
      subtitle: 'Equipa dedicada. Resultados contínuos.',
      badge: 'Modelo RPO',
      ctaText: 'Fale Connosco',
      ctaLink: 'outsourcing',
      targetTab: 'business',
      url: 'https://images.pexels.com/photos/5816283/pexels-photo-5816283.jpeg?auto=compress&cs=tinysrgb&w=1920',
      imageUrl: 'https://images.pexels.com/photos/5816283/pexels-photo-5816283.jpeg?auto=compress&cs=tinysrgb&w=1920',
      active: true,
      priority: 3
    }
  ];

  const [localBanners, setLocalBanners] = useState<LandingBannerItem[]>(() => {
    try {
      const saved = localStorage.getItem('tarira_landing_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return banners && banners.length > 0 ? banners : defaultBanners;
  });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingBanner, setViewingBanner] = useState<LandingBannerItem | null>(null);
  const [editingBanner, setEditingBanner] = useState<LandingBannerItem | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<LandingBannerItem | null>(null);

  // Form State for Creation
  const [formTitle, setFormTitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formBadge, setFormBadge] = useState('Destaque Oficial');
  const [formCtaText, setFormCtaText] = useState('Explorar Serviços');
  const [formCategory, setFormCategory] = useState('connect');
  const [formTargetTab, setFormTargetTab] = useState('connect');
  const [formCustomUrl, setFormCustomUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState(PRESET_BANNER_IMAGES[0].url);
  const [formActive, setFormActive] = useState(true);

  // Upload helpers
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const syncBanners = (updated: LandingBannerItem[]) => {
    setLocalBanners(updated);
    try {
      localStorage.setItem('tarira_landing_banners', JSON.stringify(updated));
    } catch (e) {}
    if (onUpdateBanners) onUpdateBanners(updated);
  };

  const handleFileUpload = (file: File, isEditing = false) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um ficheiro de imagem válido (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('O tamanho da imagem não deve exceder 5MB.');
      return;
    }

    setIsUploading(true);
    // A imagem é enviada para o ImgBB (com reserva automática) em vez de
    // ficar guardada como Base64 local no localStorage.
    uploadImageToImgBB(file)
      .then((url) => {
        if (isEditing && editingBanner) {
          setEditingBanner({
            ...editingBanner,
            url,
            imageUrl: url
          });
        } else {
          setFormImageUrl(url);
        }
        showToast('Imagem carregada com sucesso!');
      })
      .catch(() => {
        alert('Erro ao carregar a imagem.');
      })
      .finally(() => setIsUploading(false));
  };

  const filteredBanners = localBanners.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.title.toLowerCase().includes(term) ||
      (b.tagline && b.tagline.toLowerCase().includes(term)) ||
      (b.desc && b.desc.toLowerCase().includes(term)) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(term)) ||
      (b.badge && b.badge.toLowerCase().includes(term))
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Preencha o título do banner.');
      return;
    }

    const finalImage = formImageUrl.trim() || PRESET_BANNER_IMAGES[0].url;
    const finalLink = formTargetTab === 'custom_link' ? formCustomUrl : formTargetTab;

    const newBanner: LandingBannerItem = {
      id: `b-${Date.now()}`,
      title: formTitle.trim(),
      tagline: formTagline.trim() || formTitle.trim(),
      desc: formDesc.trim() || formTagline.trim(),
      subtitle: formDesc.trim() || formTagline.trim(),
      badge: formBadge.trim() || 'Destaque Oficial',
      ctaText: formCtaText.trim() || 'Explorar Serviços',
      ctaLink: finalLink,
      targetTab: formTargetTab,
      category: formCategory,
      url: finalImage,
      imageUrl: finalImage,
      active: formActive,
      priority: localBanners.length + 1
    };

    const updated = [newBanner, ...localBanners];
    syncBanners(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('CRIAR_BANNER', `Novo banner "${newBanner.title}" criado com link para ${newBanner.ctaLink}.`);
    }

    showToast('Banner promocional da landing page criado!');
    setIsCreateModalOpen(false);
    // Reset Form
    setFormTitle('');
    setFormTagline('');
    setFormDesc('');
    setFormBadge('Destaque Oficial');
    setFormCtaText('Explorar Serviços');
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;

    const finalImg = editingBanner.url || editingBanner.imageUrl || PRESET_BANNER_IMAGES[0].url;
    const finalBanner: LandingBannerItem = {
      ...editingBanner,
      url: finalImg,
      imageUrl: finalImg,
      tagline: editingBanner.tagline || editingBanner.title,
      desc: editingBanner.desc || editingBanner.subtitle || '',
      subtitle: editingBanner.subtitle || editingBanner.desc || ''
    };

    const updated = localBanners.map((b) => (b.id === finalBanner.id ? finalBanner : b));
    syncBanners(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('EDITAR_BANNER', `Banner #${finalBanner.id} (${finalBanner.title}) e respetivos textos/links atualizados.`);
    }

    showToast('Banner e textos atualizados com sucesso!');
    setEditingBanner(null);
  };

  const handleToggleActive = (banner: LandingBannerItem) => {
    const updated = localBanners.map((b) => (b.id === banner.id ? { ...b, active: !b.active } : b));
    syncBanners(updated);
    showToast(`Banner ${!banner.active ? 'ativado na landing' : 'ocultado'}.`);
  };

  const handleConfirmDelete = () => {
    if (!deletingBanner) return;
    const updated = localBanners.filter((b) => b.id !== deletingBanner.id);
    syncBanners(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('ELIMINAR_BANNER', `Banner #${deletingBanner.id} removido.`);
    }

    showToast('Banner removido.');
    setDeletingBanner(null);
  };

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= localBanners.length) return;

    const list = [...localBanners];
    const item = list[index];
    list.splice(index, 1);
    list.splice(newIndex, 0, item);

    // Update priorities
    const updated = list.map((b, idx) => ({ ...b, priority: idx + 1 }));
    syncBanners(updated);
    showToast('Ordem do carrossel atualizada!');
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
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-700 text-xl border border-blue-500/30">
              🖼️
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-wider border border-blue-500/30">
                  LANDING PAGE • HERO & BANNERS
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {localBanners.filter(b => b.active).length} Ativos no Carrossel
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#172554] mt-1">
                Gestão de Banners, Textos, Upload de Fotos & Links
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Edite os textos, títulos, badges, links de redirecionamento e faça upload de imagens para os slides da landing page.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:brightness-110 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Banner da Landing</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Pesquisar por título, badge ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>As alterações de texto e fotos são sincronizadas instantaneamente no Hero da Landing Page.</span>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredBanners.map((b, index) => {
          const imgSource = b.url || b.imageUrl || PRESET_BANNER_IMAGES[0].url;
          return (
            <div
              key={b.id}
              className={`glass-panel rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                b.active
                  ? 'border-blue-500/30 bg-white hover:border-blue-400/60'
                  : 'border-slate-200 bg-white opacity-75'
              }`}
            >
              {/* Card Banner Preview Image with Overlays */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-white group">
                <img
                  src={imgSource}
                  alt={b.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                />

                {/* Ambient Warm Vignette matching Hero */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-white backdrop-blur-md text-blue-700 border border-blue-500/30 text-[10px] font-mono font-bold shadow-md">
                      🏷️ {b.badge || 'Destaque'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white backdrop-blur-md text-slate-500 text-[10px] font-mono">
                      Posição #{index + 1}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md ${
                      b.active
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${b.active ? 'bg-white animate-ping' : 'bg-slate-500'}`} />
                    {b.active ? 'Ativo no Hero' : 'Oculto'}
                  </span>
                </div>

                {/* Link / CTA overlay button */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="px-3 py-1 rounded-xl bg-white backdrop-blur-md border border-slate-200 text-slate-500 text-[11px] font-mono flex items-center gap-1.5">
                    <Link className="w-3 h-3 text-blue-700" />
                    <span className="truncate max-w-[180px]">Link: {b.targetTab || b.ctaLink || b.category || 'Geral'}</span>
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-[#172554] text-white text-[11px] font-black uppercase shadow-lg flex items-center gap-1">
                    <span>{b.ctaText || 'Explorar'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Card Body - Texts and Controls */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold text-[#172554] leading-snug">
                      {b.title}
                    </h3>
                  </div>

                  {b.tagline && (
                    <p className="text-xs font-medium text-blue-700/90">
                      ✨ {b.tagline}
                    </p>
                  )}

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {b.desc || b.subtitle || 'Sem descrição cadastrada.'}
                  </p>
                </div>

                {/* Action Toolbar */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  {/* Priority reordering */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => movePriority(index, 'up')}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-500 cursor-pointer"
                      title="Mover para cima"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === localBanners.length - 1}
                      onClick={() => movePriority(index, 'down')}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-500 cursor-pointer"
                      title="Mover para baixo"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Active Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      b.active
                        ? 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{b.active ? 'Ocultar da Landing' : 'Ativar no Hero'}</span>
                  </button>

                  {/* Edit & Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingBanner({ ...b })}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-[#172554] text-blue-700 hover:text-white border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Editar Texto, Foto e Link"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingBanner(b)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/20 text-xs transition-all cursor-pointer"
                      title="Eliminar Banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════ MODAL 1: CRIAR NOVO BANNER ════════════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-3xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8 text-left">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4">
              <span className="text-[10px] font-mono uppercase text-blue-700 font-bold tracking-widest block">
                CONFIGURAÇÃO VISUAL • HERO DA LANDING
              </span>
              <h3 className="font-serif text-2xl text-[#172554] font-bold mt-1">
                Adicionar Novo Banner Promocional
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure os textos, links de destino e faça o upload da fotografia de fundo.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Row 1: Title and Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Título Principal do Banner *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TARIRA Connect • Intervenções Rápidas"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Etiqueta / Badge *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: B2B & Residencial"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 2: Tagline and CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Tagline de Impacto (Linha Curta)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Técnicos Certificados em Menos de 45 Minutos"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Texto do Botão CTA
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Solicitar Técnico Agora"
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Descrição / Texto Completo do Slide
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva o escopo dos serviços, garantias e diferenciais competitivos..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              {/* Row 4: Link / Destination Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                    🔗 Destino / Link de Redirecionamento *
                  </label>
                  <select
                    value={formTargetTab}
                    onChange={(e) => {
                      setFormTargetTab(e.target.value);
                      if (e.target.value !== 'custom_link') {
                        setFormCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 cursor-pointer font-medium"
                  >
                    {TARGET_DESTINATIONS.map((dest) => (
                      <option key={dest.value} value={dest.value} className="bg-white text-[#172554]">
                        {dest.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formTargetTab === 'custom_link' ? (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                      URL Personalizada (https://...)
                    </label>
                    <input
                      type="url"
                      placeholder="https://exemplo.com/servico"
                      value={formCustomUrl}
                      onChange={(e) => setFormCustomUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-slate-400 pt-5">
                    <span>O botão redirecionará o utilizador diretamente para a secção selecionada do portal.</span>
                  </div>
                )}
              </div>

              {/* Row 5: Photo Upload & Image URL */}
              <div className="space-y-2 p-4 rounded-2xl bg-white border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                  📸 Fotografia de Fundo do Banner
                </label>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => {
                    const input = document.getElementById('create-banner-upload') as HTMLInputElement;
                    if (input) input.click();
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                    isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-slate-200 bg-white hover:border-blue-500/50'
                  }`}
                >
                  <input
                    id="create-banner-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Upload className="w-5 h-5 text-blue-700" />
                    <p className="font-semibold text-slate-200 text-xs">
                      Clique para fazer upload ou arraste a imagem do seu computador
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Formatos aceites: JPG, PNG, WebP • Resolução recomendada: 1920x1080px
                    </p>
                  </div>
                </div>

                {/* Direct URL Input */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-slate-400 font-mono block">Ou insira o URL da imagem (Unsplash / Pexels / Cloudinary):</span>
                  <input
                    type="url"
                    placeholder="https://images.pexels.com/..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 font-mono block mb-1.5">Fotografias Predefinidas de Alta Resolução:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_BANNER_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImageUrl(preset.url)}
                        className={`p-1.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          formImageUrl === preset.url
                            ? 'border-blue-400 bg-blue-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-200'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <span className="text-[10px] text-slate-500 font-medium truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                {formImageUrl && (
                  <div className="mt-3 p-3 rounded-2xl bg-white border border-slate-200">
                    <span className="text-[10px] font-mono text-blue-700 uppercase font-bold block mb-1.5">
                      Pré-visualização do Banner:
                    </span>
                    <div className="relative h-32 rounded-xl overflow-hidden bg-white">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-center text-left">
                        <span className="text-[9px] font-mono font-bold text-blue-700 uppercase">{formBadge || 'Badge'}</span>
                        <h4 className="text-sm font-serif font-bold text-[#172554]">{formTitle || 'Título do Banner'}</h4>
                        <p className="text-[10px] text-slate-500 max-w-sm line-clamp-1">{formTagline || formDesc}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-7 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg transition-all"
                >
                  Criar e Publicar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL 2: EDITAR BANNER, TEXTOS & LINKS ════════════════ */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-3xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8 text-left">
            <button
              type="button"
              onClick={() => setEditingBanner(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4">
              <span className="text-[10px] font-mono uppercase text-blue-700 font-bold tracking-widest block">
                EDITAR BANNER • {editingBanner.id}
              </span>
              <h3 className="font-serif text-2xl text-[#172554] font-bold mt-1">
                Editar Textos, Foto & Links do Banner
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Altere o título, subtítulo, botões, destino e faça o upload de uma nova imagem.
              </p>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              {/* Row 1: Title and Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Título Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBanner.title}
                    onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Etiqueta / Badge *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBanner.badge || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, badge: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 2: Tagline and CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Tagline de Destaque
                  </label>
                  <input
                    type="text"
                    value={editingBanner.tagline || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, tagline: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    Texto do Botão CTA
                  </label>
                  <input
                    type="text"
                    value={editingBanner.ctaText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaText: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Row 3: Description / Subtitle */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Descrição / Subtítulo Completo
                </label>
                <textarea
                  rows={2}
                  value={editingBanner.desc || editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, desc: e.target.value, subtitle: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl p-3 text-xs outline-none focus:border-blue-400"
                />
              </div>

              {/* Row 4: Link / Target Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                    🔗 Destino / Link de Redirecionamento
                  </label>
                  <select
                    value={editingBanner.targetTab || editingBanner.category || 'connect'}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        targetTab: e.target.value,
                        category: e.target.value,
                        ctaLink: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 cursor-pointer font-medium"
                  >
                    {TARGET_DESTINATIONS.map((dest) => (
                      <option key={dest.value} value={dest.value} className="bg-white text-[#172554]">
                        {dest.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                    URL ou Parâmetro de Link
                  </label>
                  <input
                    type="text"
                    value={editingBanner.ctaLink || editingBanner.targetTab || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, ctaLink: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Photo Upload & Image URL */}
              <div className="space-y-2 p-4 rounded-2xl bg-white border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-blue-700 font-mono block">
                  📸 Atualizar Fotografia de Fundo (Upload ou URL)
                </label>

                {/* Upload Trigger */}
                <div
                  onClick={() => {
                    const input = document.getElementById('edit-banner-upload') as HTMLInputElement;
                    if (input) input.click();
                  }}
                  className="border-2 border-dashed border-slate-200 bg-white hover:border-blue-500/50 rounded-2xl p-4 text-center cursor-pointer transition-all"
                >
                  <input
                    id="edit-banner-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0], true);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Upload className="w-5 h-5 text-blue-700" />
                    <p className="font-semibold text-slate-200 text-xs">
                      Clique para fazer upload de uma nova fotografia
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Substitua a imagem por uma foto do seu dispositivo
                    </p>
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-slate-400 font-mono block">URL da Imagem Atual:</span>
                  <input
                    type="url"
                    value={editingBanner.url || editingBanner.imageUrl || ''}
                    onChange={(e) =>
                      setEditingBanner({
                        ...editingBanner,
                        url: e.target.value,
                        imageUrl: e.target.value
                      })
                    }
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                {/* Preset Options */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 font-mono block mb-1.5">Escolher Foto das Opções Predefinidas:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_BANNER_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setEditingBanner({
                            ...editingBanner,
                            url: preset.url,
                            imageUrl: preset.url
                          })
                        }
                        className={`p-1.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                          (editingBanner.url === preset.url || editingBanner.imageUrl === preset.url)
                            ? 'border-blue-400 bg-blue-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-200'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <span className="text-[10px] text-slate-500 font-medium truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="mt-3 p-3 rounded-2xl bg-white border border-slate-200">
                  <span className="text-[10px] font-mono text-blue-700 uppercase font-bold block mb-1.5">
                    Pré-visualização do Slide Atual:
                  </span>
                  <div className="relative h-32 rounded-xl overflow-hidden bg-white">
                    <img
                      src={editingBanner.url || editingBanner.imageUrl || PRESET_BANNER_IMAGES[0].url}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent p-4 flex flex-col justify-center text-left">
                      <span className="text-[9px] font-mono font-bold text-blue-700 uppercase">{editingBanner.badge}</span>
                      <h4 className="text-sm font-serif font-bold text-[#172554]">{editingBanner.title}</h4>
                      <p className="text-[10px] text-slate-500 max-w-sm line-clamp-1">{editingBanner.tagline || editingBanner.desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-7 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL 3: CONFIRMAR ELIMINAÇÃO ════════════════ */}
      {deletingBanner && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-rose-500/40 bg-white shadow-2xl relative text-left">
            <h3 className="font-serif text-xl text-[#172554] font-bold mb-2">
              Eliminar Banner da Landing Page
            </h3>
            <p className="text-xs text-rose-700 mb-4">
              Tem a certeza de que deseja remover permanentemente o banner "{deletingBanner.title}"?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingBanner(null)}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
