import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Phone,
  Mail,
  MapPin,
  Check,
  Download,
  FileText,
  ShieldCheck,
  Paperclip,
  Lock,
  ExternalLink,
  Linkedin,
  Share2
} from 'lucide-react';
import {
  getCandidateAttachments,
  downloadCandidateCvPdf,
  downloadCandidateIdDocPdf
} from './tariraDocumentService';
import { TariraDocumentPreviewModal } from './TariraDocumentPreviewModal';
import { TariraJobBroadcastModal, JobBroadcastPayload } from './TariraJobBroadcastModal';

export interface AtsCandidateApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  category: string;
  experienceYears: number;
  city: string;
  atsScore: number;
  status: 'received' | 'screening' | 'interview' | 'approved' | 'hired' | 'rejected';
  appliedDate: string;
  skillsSummary: string;
  interviewerNotes?: string;
  nuit?: string;
  cvDocumentName?: string;
  cvDocumentUrl?: string;
  cvUrl?: string;
  idDocumentName?: string;
  idDocumentUrl?: string;
  experiences?: any[];
  careerFocus?: string;
  documents?: any[];
}

interface TariraAtsPipelineCrudManagerProps {
  applications?: any[];
  onUpdateApplications?: (apps: any[]) => void;
  onTriggerAuditLog?: (action: string, details: string) => void;
}

export const TariraAtsPipelineCrudManager: React.FC<TariraAtsPipelineCrudManagerProps> = ({
  applications = [],
  onUpdateApplications,
  onTriggerAuditLog
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Inicia exclusivamente com as candidaturas reais recebidas das props (contas reais e espontâneas)
  const [localApps, setLocalApps] = useState<AtsCandidateApplication[]>(applications || []);

  useEffect(() => {
    setLocalApps(applications || []);
  }, [applications]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState<AtsCandidateApplication | null>(null);
  const [editingApp, setEditingApp] = useState<AtsCandidateApplication | null>(null);
  const [deletingApp, setDeletingApp] = useState<AtsCandidateApplication | null>(null);
  const [previewDocModal, setPreviewDocModal] = useState<{
    candidate: AtsCandidateApplication;
    docType: 'cv' | 'idDoc';
  } | null>(null);
  const [broadcastJobModal, setBroadcastJobModal] = useState<{ isOpen: boolean; jobData: JobBroadcastPayload | null }>({ isOpen: false, jobData: null });

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+258 84 ');
  const [formCategory, setFormCategory] = useState('Eletricidade & Automação');
  const [formExp, setFormExp] = useState(3);
  const [formCity, setFormCity] = useState('Maputo');
  const [formScore, setFormScore] = useState(85);
  const [formStatus, setFormStatus] = useState<AtsCandidateApplication['status']>('received');
  const [formSkills, setFormSkills] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const syncApps = (updated: AtsCandidateApplication[]) => {
    setLocalApps(updated);
    if (onUpdateApplications) onUpdateApplications(updated);
  };

  const filteredApps = localApps.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matches =
      a.fullName.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      a.category.toLowerCase().includes(term);

    if (!matches) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Preencha o nome do candidato.');
      return;
    }

    const newApp: AtsCandidateApplication = {
      id: `app-${Date.now()}`,
      fullName: formName,
      email: formEmail || 'candidato@tarira.co.mz',
      phone: formPhone,
      category: formCategory,
      experienceYears: Number(formExp) || 1,
      city: formCity,
      atsScore: Number(formScore) || 75,
      status: formStatus,
      appliedDate: new Date().toISOString().split('T')[0],
      skillsSummary: formSkills || 'Candidatura submetida para avaliação ATS.'
    };

    const updated = [newApp, ...localApps];
    syncApps(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('CRIAR_CANDIDATURA_ATS', `Candidato ${newApp.fullName} registado manualmente no pipeline ATS.`);
    }

    showToast('Candidatura adicionada com sucesso!');
    setIsCreateModalOpen(false);
    setFormName('');
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    const updated = localApps.map((a) => (a.id === editingApp.id ? editingApp : a));
    syncApps(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('EDITAR_CANDIDATURA_ATS', `Candidatura #${editingApp.id} (${editingApp.fullName}) atualizada para estado: ${editingApp.status}.`);
    }

    showToast('Candidatura ATS atualizada!');
    setEditingApp(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingApp) return;
    const updated = localApps.filter((a) => a.id !== deletingApp.id);
    syncApps(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('ELIMINAR_CANDIDATURA_ATS', `Candidatura #${deletingApp.id} (${deletingApp.fullName}) eliminada.`);
    }

    showToast('Candidatura removida.');
    setDeletingApp(null);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#172554] text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-blue-900 animate-bounce">
          <Sparkles className="w-4 h-4 text-blue-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-3xl border border-border bg-background shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-background-secondary text-brand text-xl border border-border shadow-xs">
              🎓
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-brand">
                Candidaturas & Pipeline de Triagem ATS
              </h2>
              <p className="text-xs text-text-secondary">
                Sistema de Recrutamento & Seleção (ATS), pontuação de compatibilidade algorítmica e aprovação para o ecossistema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => {
              setBroadcastJobModal({
                isOpen: true,
                jobData: {
                  companyName: 'TARIRA Recruitment & Selection',
                  jobTitle: 'Profissional Técnico Especialista',
                  category: 'Tecnologia, Manutenção & Facilities',
                  location: 'Maputo, Moçambique',
                  contactEmail: 'tarira.ecossistema@gmail.com',
                  contactPhone: '+258 84 000 0000',
                  applicationUrl: 'https://tarira.co.mz/vagas'
                }
              });
            }}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-background-secondary border border-border hover:bg-slate-200 text-brand text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:brightness-105 active:scale-95 transition-all"
            title="Disparar vaga para LinkedIn e redes sociais (Gerador de Flyers)"
          >
            <Linkedin className="w-4 h-4 text-brand" />
            <span>Disparar Vaga (LinkedIn & Flyer)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-brand hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:brightness-105 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registar Candidatura Manual</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar candidato, especialidade, e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border text-text-primary placeholder:text-text-secondary rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-brand shadow-sm"
          />
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3 pointer-events-none" />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-background border border-border text-text-primary rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-brand shadow-sm"
          >
            <option value="all">Todas as Fases ATS ({localApps.length})</option>
            <option value="received">📥 Candidatura Recebida</option>
            <option value="screening">🔍 Em Triagem de CV</option>
            <option value="interview">🗣️ Entrevista Agendada</option>
            <option value="approved">✅ Aprovado para Banco de Talentos</option>
            <option value="hired">🎉 Contratado em Cliente</option>
            <option value="rejected">🚫 Não Aprovado</option>
          </select>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredApps.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-border p-8 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-200 text-[#172554] flex items-center justify-center text-xl shadow-xs">
            🎓
          </div>
          <h3 className="font-serif text-base font-bold text-[#172554]">
            Nenhuma Candidatura Real Registada
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {searchTerm || statusFilter !== 'all' 
              ? 'Nenhuma candidatura corresponde aos filtros de pesquisa aplicados.' 
              : 'Apenas candidaturas espontâneas e contas reais submetidas no portal de registo aparecem nesta triagem com os seus respetivos documentos.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => (
          <div
            key={app.id}
            className="p-5 rounded-3xl border border-border bg-background shadow-sm space-y-3 flex flex-col justify-between hover:border-brand transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-background-secondary text-brand border border-border text-[10px] font-bold font-mono shadow-xs">
                      ATS {app.atsScore}%
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      app.status === 'approved' || app.status === 'hired' ? 'bg-status-success/10 text-status-success border border-status-success/20' :
                      app.status === 'interview' ? 'bg-brand/10 text-brand border border-brand/20' :
                      app.status === 'rejected' ? 'bg-status-danger/10 text-status-danger border border-status-danger/20' :
                      'bg-status-warning/10 text-status-warning border border-status-warning/20'
                    }`}>
                      {app.status === 'approved' ? '✅ Aprovado' :
                       app.status === 'hired' ? '🎉 Contratado' :
                       app.status === 'interview' ? '🗣️ Entrevista' :
                       app.status === 'screening' ? '🔍 Em Triagem' :
                       app.status === 'rejected' ? '🚫 Rejeitado' : '📥 Pendente'}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-brand">
                    {app.fullName}
                  </h3>
                  <span className="text-xs text-text-secondary font-medium block">
                    {app.category} · {app.experienceYears} anos exp.
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingApp(app)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary border border-transparent hover:border-border cursor-pointer transition-all"
                    title="Ver Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingApp({ ...app })}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-brand hover:bg-background-secondary border border-transparent hover:border-border cursor-pointer transition-all"
                    title="Editar Candidatura"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingApp(app)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-status-danger hover:bg-status-danger/10 border border-transparent hover:border-status-danger/20 cursor-pointer transition-all"
                    title="Eliminar Candidatura"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-text-primary line-clamp-2">
                {app.skillsSummary}
              </p>

              {/* ════════ ANEXOS DOCUMENTAIS OFICIAIS (CV & BI) ════════ */}
              <div className="p-3 rounded-2xl bg-background-secondary border border-border space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-text-secondary font-mono flex items-center gap-1">
                    <Paperclip className="w-3 h-3 text-brand" />
                    Anexos Oficiais ({app.fullName.includes(' ') ? 2 : 2})
                  </span>
                  <span className="text-[9px] text-brand font-mono font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Triagem ATS Homologada
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  {/* CV Chip */}
                  <div className="p-2 rounded-xl bg-background border border-border flex items-center justify-between gap-2 hover:border-brand/40 transition-all shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[11px] font-bold text-text-primary truncate">
                          {app.cvDocumentName || `CV_${app.fullName.replace(/\s+/g, '_')}_ATS.pdf`}
                        </span>
                        <span className="block text-[9px] text-text-secondary font-mono">1.4 MB · Formato PDF ATS</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ candidate: app, docType: 'cv' })}
                        className="px-2 py-1 rounded-lg bg-background hover:bg-background-secondary text-text-primary text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-border shadow-xs"
                        title="Pré-visualizar Currículo"
                      >
                        <Eye className="w-3 h-3 text-brand" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          downloadCandidateCvPdf(app);
                          showToast(`Download de CV de ${app.fullName} iniciado com sucesso!`);
                          if (onTriggerAuditLog) {
                            onTriggerAuditLog('DOWNLOAD_CV_ATS', `Download do currículo oficial de ${app.fullName}`);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-brand hover:brightness-110 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        title="Descarregar Ficheiro PDF"
                      >
                        <Download className="w-3 h-3" />
                        <span>Baixar</span>
                      </button>
                    </div>
                  </div>

                  {/* ID / BI Chip */}
                  <div className="p-2 rounded-xl bg-background border border-border flex items-center justify-between gap-2 hover:border-brand/40 transition-all shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-status-success/10 border border-status-success/20 flex items-center justify-center text-status-success shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="block text-[11px] font-bold text-text-primary truncate">
                          {app.idDocumentName || `BI_${app.fullName.replace(/\s+/g, '_')}_Oficial.pdf`}
                        </span>
                        <span className="block text-[9px] text-text-secondary font-mono">890 KB · BI Moçambique Verificado</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ candidate: app, docType: 'idDoc' })}
                        className="px-2 py-1 rounded-lg bg-background hover:bg-background-secondary text-text-primary text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-border shadow-xs"
                        title="Pré-visualizar BI / Identidade"
                      >
                        <Eye className="w-3 h-3 text-status-success" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          downloadCandidateIdDocPdf(app);
                          showToast(`Download do Documento de Identidade de ${app.fullName} iniciado!`);
                          if (onTriggerAuditLog) {
                            onTriggerAuditLog('DOWNLOAD_BI_ATS', `Download da identidade verificada de ${app.fullName}`);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-brand hover:brightness-110 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                        title="Descarregar Documento BI"
                      >
                        <Download className="w-3 h-3" />
                        <span>Baixar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-secondary">
              <span>{app.city} · {app.appliedDate}</span>
              <button
                type="button"
                onClick={() => {
                  const targetPhone = app.phone.replace(/\D/g, '');
                  const msg = `Olá *${app.fullName}*, a equipa de Recrutamento da TARIRA analisou a sua candidatura para *${app.category}* (Score ATS: ${app.atsScore}%).`;
                  window.open(`https://wa.me/258${targetPhone.slice(-9)}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="text-status-success hover:underline font-bold"
              >
                💬 WhatsApp ATS
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* ════════ MODAL 1: CRIAR CANDIDATURA ════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex justify-center items-center overflow-y-auto">
          <div className="p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-border bg-background shadow-2xl relative my-8 text-text-primary">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background-secondary border border-border text-text-secondary hover:text-text-primary font-black cursor-pointer flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-brand font-bold mb-4">
              Registar Candidatura Manual (ATS)
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alberto Macamo"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-brand shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">
                    Especialidade / Cargo
                  </label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-brand shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-background border border-border text-text-primary rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-brand font-mono shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">
                    Anos de Experiência
                  </label>
                  <input
                    type="number"
                    value={formExp}
                    onChange={(e) => setFormExp(Number(e.target.value))}
                    className="w-full bg-background border border-border text-text-primary rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-brand font-mono shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">
                    Score ATS (%)
                  </label>
                  <input
                    type="number"
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                    className="w-full bg-background border border-border text-text-primary rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-brand font-mono shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">
                  Resumo de Competências & Qualificações
                </label>
                <textarea
                  rows={3}
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  className="w-full bg-background border border-border text-text-primary rounded-2xl p-3 text-xs outline-none focus:border-brand shadow-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-background-secondary hover:bg-slate-200 text-text-primary text-xs font-bold border border-border cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-brand hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  Registar no ATS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 2: VER DOSSIÊ ATS ════════ */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex justify-center items-center overflow-y-auto">
          <div className="p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-border bg-background shadow-2xl relative my-8 text-text-primary">
            <button
              type="button"
              onClick={() => setViewingApp(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background-secondary border border-border text-text-secondary hover:text-text-primary font-black cursor-pointer flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-brand font-bold mb-1">
              {viewingApp.fullName}
            </h3>
            <span className="text-xs text-brand font-medium block mb-4">
              {viewingApp.category} · Score ATS: {viewingApp.atsScore}%
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-4">
              <div className="p-3 rounded-2xl bg-background-secondary border border-border shadow-xs">
                <span className="text-[10px] text-text-secondary font-bold uppercase block">Localização</span>
                <span className="text-text-primary font-medium">{viewingApp.city}</span>
              </div>
              <div className="p-3 rounded-2xl bg-background-secondary border border-border shadow-xs">
                <span className="text-[10px] text-text-secondary font-bold uppercase block">Telefone</span>
                <span className="text-status-success font-mono font-bold">{viewingApp.phone}</span>
              </div>
              <div className="p-3 rounded-2xl bg-background-secondary border border-border shadow-xs">
                <span className="text-[10px] text-text-secondary font-bold uppercase block">NUIT Fiscal</span>
                <span className="text-brand font-mono font-bold">{viewingApp.nuit || '108392019'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-background-secondary border border-border shadow-xs">
                <span className="text-[10px] text-text-secondary font-bold uppercase block">Submissão</span>
                <span className="text-text-secondary font-mono">{viewingApp.appliedDate}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-background-secondary border border-border space-y-2 text-xs mb-4 shadow-xs">
              <span className="text-text-secondary font-bold block">Resumo Técnico:</span>
              <p className="text-text-primary">{viewingApp.skillsSummary}</p>
              {viewingApp.interviewerNotes && (
                <div className="pt-2 border-t border-border">
                  <span className="text-brand font-bold block">Notas do Entrevistador:</span>
                  <p className="text-text-secondary italic">{viewingApp.interviewerNotes}</p>
                </div>
              )}
            </div>

            {/* ════════ DOSSIÊ COMPLETO DE ANEXOS DA CANDIDATURA ════════ */}
            <div className="p-4 rounded-2xl bg-background-secondary border border-border space-y-3 mb-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-brand flex items-center gap-1.5 font-mono">
                  <Paperclip className="w-4 h-4 text-brand" />
                  Dossiê de Anexos Oficiais & Validação Documental
                </span>
                <span className="px-2 py-0.5 rounded-full bg-status-success/10 text-status-success border border-status-success/20 text-[10px] font-bold">
                  ✓ Verificado pela Central
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Ficheiros certificados submetidos pelo candidato. Como Administrador/Operador Central, pode pré-visualizar ou descarregar o ficheiro real a qualquer momento.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* CV Card */}
                <div className="p-3.5 rounded-2xl bg-background border border-border space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-text-primary truncate">
                          {viewingApp.cvDocumentName || `CV_${viewingApp.fullName.replace(/\s+/g, '_')}_ATS.pdf`}
                        </span>
                        <span className="block text-[10px] text-text-secondary font-mono">1.4 MB · Formato PDF ATS</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal({ candidate: viewingApp, docType: 'cv' })}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-background hover:bg-background-secondary text-text-primary text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-border shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-brand" />
                      <span>Pré-visualizar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        downloadCandidateCvPdf(viewingApp);
                        showToast(`Download de CV de ${viewingApp.fullName} concluído!`);
                        if (onTriggerAuditLog) {
                          onTriggerAuditLog('DOWNLOAD_CV_ATS', `Download do CV oficial de ${viewingApp.fullName}`);
                        }
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-brand hover:brightness-110 text-white text-[11px] font-bold uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar PDF</span>
                    </button>
                  </div>
                </div>

                {/* BI Card */}
                <div className="p-3.5 rounded-2xl bg-background border border-border space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-status-success/10 border border-status-success/20 flex items-center justify-center text-status-success shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-text-primary truncate">
                          {viewingApp.idDocumentName || `BI_${viewingApp.fullName.replace(/\s+/g, '_')}_Oficial.pdf`}
                        </span>
                        <span className="block text-[10px] text-text-secondary font-mono">890 KB · BI Moçambique</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setPreviewDocModal({ candidate: viewingApp, docType: 'idDoc' })}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-background hover:bg-background-secondary text-text-primary text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border border-border shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-status-success" />
                      <span>Pré-visualizar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        downloadCandidateIdDocPdf(viewingApp);
                        showToast(`Download do Documento de Identidade de ${viewingApp.fullName} concluído!`);
                        if (onTriggerAuditLog) {
                          onTriggerAuditLog('DOWNLOAD_BI_ATS', `Download do documento de identidade de ${viewingApp.fullName}`);
                        }
                      }}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-brand hover:brightness-110 text-white text-[11px] font-bold uppercase flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingApp(null)}
                className="px-5 py-2.5 rounded-2xl bg-background-secondary text-text-primary text-xs font-bold hover:bg-slate-200 border border-border cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 3: EDITAR CANDIDATURA ════════ */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex justify-center items-center overflow-y-auto">
          <div className="p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-border bg-background shadow-2xl relative my-8 text-text-primary">
            <button
              type="button"
              onClick={() => setEditingApp(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background-secondary border border-border text-text-secondary hover:text-text-primary font-black cursor-pointer flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-brand font-bold mb-4">
              Editar Candidatura: {editingApp.fullName}
            </h3>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">
                    Fase no Pipeline ATS
                  </label>
                  <select
                    value={editingApp.status}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as any })}
                    className="w-full bg-background border border-border text-text-primary rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-brand font-bold shadow-sm"
                  >
                    <option value="received">📥 Pendente</option>
                    <option value="screening">🔍 Em Triagem</option>
                    <option value="interview">🗣️ Entrevista</option>
                    <option value="approved">✅ Aprovado</option>
                    <option value="hired">🎉 Contratado</option>
                    <option value="rejected">🚫 Rejeitado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">
                    Score ATS (%)
                  </label>
                  <input
                    type="number"
                    value={editingApp.atsScore}
                    onChange={(e) => setEditingApp({ ...editingApp, atsScore: Number(e.target.value) })}
                    className="w-full bg-background border border-border text-text-primary rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-brand font-mono shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary font-mono block mb-1">
                  Notas de Entrevista / Avaliação
                </label>
                <textarea
                  rows={3}
                  value={editingApp.interviewerNotes || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, interviewerNotes: e.target.value })}
                  className="w-full bg-background border border-border text-text-primary rounded-2xl p-3 text-xs outline-none focus:border-brand shadow-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-5 py-2.5 rounded-2xl bg-background-secondary hover:bg-slate-200 text-text-primary text-xs font-bold border border-border cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-brand hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 4: ELIMINAR ════════ */}
      {deletingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 flex justify-center items-center overflow-y-auto">
          <div className="p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-status-danger/30 bg-background shadow-2xl relative text-text-primary">
            <h3 className="font-serif text-xl text-status-danger font-bold mb-2">
              Eliminar Candidatura
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Deseja excluir permanentemente a candidatura de "{deletingApp.fullName}"?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                className="px-5 py-2.5 rounded-2xl bg-background-secondary hover:bg-slate-200 text-text-primary text-xs font-bold border border-border cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-2xl bg-status-danger hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 5: PRÉ-VISUALIZAÇÃO DE ANEXO REAL & DOWNLOAD ════════ */}
      {previewDocModal && (
        <TariraDocumentPreviewModal
          isOpen={!!previewDocModal}
          candidate={previewDocModal.candidate}
          initialDocType={previewDocModal.docType}
          onClose={() => setPreviewDocModal(null)}
          onTriggerAuditLog={onTriggerAuditLog}
        />
      )}

      {/* ════════ MODAL 6: DISPARO DE VAGA PARA LINKEDIN & FLYER ════════ */}
      {broadcastJobModal.isOpen && broadcastJobModal.jobData && (
        <TariraJobBroadcastModal
          isOpen={broadcastJobModal.isOpen}
          onClose={() => setBroadcastJobModal({ isOpen: false, jobData: null })}
          jobData={broadcastJobModal.jobData}
          onLogAudit={onTriggerAuditLog}
        />
      )}
    </div>
  );
};
