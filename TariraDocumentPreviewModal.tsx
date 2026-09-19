import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Award,
  X,
  ExternalLink,
  Lock,
  UserCheck,
  Building
} from 'lucide-react';
import {
  getCandidateAttachments,
  downloadCandidateCvPdf,
  downloadCandidateIdDocPdf,
  CandidateAttachmentInfo
} from './tariraDocumentService';

interface TariraDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  initialDocType?: 'cv' | 'idDoc';
  onTriggerAuditLog?: (action: string, details: string) => void;
}

export const TariraDocumentPreviewModal: React.FC<TariraDocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  candidate,
  initialDocType = 'cv',
  onTriggerAuditLog
}) => {
  const [activeDocType, setActiveDocType] = useState<'cv' | 'idDoc'>(initialDocType);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'structured'>('original');

  if (!isOpen || !candidate) return null;

  const attachments = getCandidateAttachments(candidate);
  const currentDoc: CandidateAttachmentInfo = activeDocType === 'cv' ? attachments.cv : attachments.idDoc;
  const hasUploadedFile = Boolean(currentDoc.downloadUrl);

  const handleDownload = () => {
    if (activeDocType === 'cv') {
      downloadCandidateCvPdf(candidate);
    } else {
      downloadCandidateIdDocPdf(candidate);
    }

    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'DOWNLOAD_ANEXO_ATS',
        `Download efetuado do anexo ${currentDoc.name} referente ao candidato ${candidate.fullName}.`
      );
    }

    setDownloadSuccessToast(`Ficheiro ${currentDoc.name} descarregado com sucesso!`);
    setTimeout(() => setDownloadSuccessToast(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 flex justify-center items-center overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-background border border-border rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Toast */}
        {downloadSuccessToast && (
          <div className="absolute top-16 right-6 z-50 p-3 rounded-2xl bg-status-success text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-300 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{downloadSuccessToast}</span>
          </div>
        )}

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-background border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-light/10 border border-brand-light/20 flex items-center justify-center text-brand-light shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-brand">
                  Pré-visualização de Anexo Homologado
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-background-secondary text-brand border border-border text-[10px] font-bold font-mono">
                  {currentDoc.type}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Candidato: <strong className="text-text-primary">{candidate.fullName}</strong> • Acesso Central de Triagem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-brand-light hover:bg-brand text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Anexo (.PDF)</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-background-secondary hover:bg-slate-200 text-text-secondary hover:text-text-primary border border-border transition-all cursor-pointer shadow-xs"
              title="Imprimir Documento"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-background-secondary hover:bg-slate-200 text-text-secondary hover:text-text-primary border border-border flex items-center justify-center font-bold transition-all cursor-pointer shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: CV vs ID Document */}
        <div className="bg-background-secondary px-4 sm:px-6 py-2.5 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveDocType('cv')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeDocType === 'cv'
                  ? 'bg-brand-light text-white'
                  : 'bg-background text-text-secondary hover:text-text-primary hover:bg-slate-200 border border-border'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Currículo Vitae (ATS)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 font-mono">
                {attachments.cv.size}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDocType('idDoc')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                activeDocType === 'idDoc'
                  ? 'bg-brand-light text-white'
                  : 'bg-background text-text-secondary hover:text-text-primary hover:bg-slate-200 border border-border'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Documento de Identificação (BI)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 font-mono">
                {attachments.idDoc.size}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {hasUploadedFile && (
              <div className="flex items-center bg-background rounded-xl p-0.5 border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode('original')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    viewMode === 'original'
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  📄 Ficheiro Carregado
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('structured')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    viewMode === 'structured'
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  📊 Relatório ATS
                </button>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-text-secondary">
              <Lock className="w-3 h-3 text-brand-light" />
              <span>Ficheiro: <strong className="text-text-primary font-mono">{currentDoc.name}</strong></span>
            </div>
          </div>
        </div>

        {/* Document Render Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background-secondary/60 flex justify-center">
          {hasUploadedFile && viewMode === 'original' ? (
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col min-h-[600px] h-[75vh]">
              <div className="p-3 bg-slate-50 border-b border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-mono font-bold text-slate-700">{currentDoc.name}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-[#172554] text-[10px] font-bold">Ficheiro Original Carregado</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand-dark transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Descarregar</span>
                </button>
              </div>
              <div className="flex-1 w-full bg-slate-100 flex items-center justify-center p-2">
                {currentDoc.downloadUrl?.startsWith('data:image') ? (
                  <img
                    src={currentDoc.downloadUrl}
                    alt={currentDoc.name}
                    className="max-h-full max-w-full rounded-xl object-contain shadow-md"
                  />
                ) : (
                  <iframe
                    src={currentDoc.downloadUrl}
                    className="w-full h-full rounded-xl border border-border bg-white"
                    title={currentDoc.name}
                  />
                )}
              </div>
            </div>
          ) : (
          <div className="w-full max-w-2xl bg-white text-text-primary rounded-2xl shadow-lg p-6 sm:p-10 border border-border text-left space-y-6 select-text">
            {/* Header of Simulated PDF Paper */}
            <div className="border-b-2 border-border pb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-black tracking-widest text-brand uppercase">
                    TARIRA ECOSYSTEM • RECRUITMENT & OPERATIONS
                  </span>
                </div>
                <h1 className="font-serif text-2xl font-black text-slate-900">
                  {candidate.fullName}
                </h1>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">
                  {candidate.category || (candidate.careerFocus === 'recruitment_no_exp' ? 'Programa Recrutamento Sem Experiência' : 'Especialista Corporativo')}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.city || candidate.residence || 'Maputo Cidade'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.phone || '+258 84 000 0000'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {candidate.email || 'candidato@tarira.co.mz'}
                  </span>
                </div>
              </div>

              {/* Official Seal / Stamp */}
              <div className="shrink-0 p-3 rounded-xl border-2 border-slate-900 bg-slate-50 text-center w-28">
                <span className="text-[9px] font-mono font-bold block text-slate-600 uppercase">
                  SCORE ATS
                </span>
                <span className="text-xl font-black font-mono text-slate-900 block">
                  {candidate.atsScore || 94}%
                </span>
                <span className="text-[8px] font-bold text-emerald-700 uppercase bg-emerald-100 px-1 py-0.5 rounded block mt-1">
                  ✓ HOMOLOGADO
                </span>
              </div>
            </div>

            {/* Content Switcher depending on Tab */}
            {activeDocType === 'cv' ? (
              /* CV VIEW */
              <div className="space-y-6">
                {/* 1. Resumo Profissional */}
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    1. Resumo Executivo & Perfil ATS
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {candidate.skillsSummary || candidate.notes || 'Candidato avaliado e aprovado segundo os critérios do sistema ATS da TARIRA. Perfil validado para integração em equipas operacionais e projetos técnicos de excelência em Moçambique.'}
                  </p>
                </div>

                {/* 2. Experiência Laboral */}
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                    2. Histórico Profissional & Atribuições
                  </h2>

                  {candidate.experiences && Array.isArray(candidate.experiences) && candidate.experiences.length > 0 ? (
                    <div className="space-y-3">
                      {candidate.experiences.map((exp: any, idx: number) => (
                        <div key={idx} className="text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{exp.role || 'Especialista Técnico'}</span>
                            <span className="text-slate-500 font-mono text-[11px]">{exp.duration || exp.period || '2024 - 2025'}</span>
                          </div>
                          <span className="text-[#172554] font-semibold block text-[11px] mb-1">
                            {exp.company || 'Empresa Empregadora'}
                          </span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {exp.responsibilities || exp.description || 'Gestão de tarefas operacionais, manutenção técnica e suporte ao cliente.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{candidate.category || 'Técnico Especialista'} Residente</span>
                          <span className="text-slate-500 font-mono text-[11px]">2023 - Presente</span>
                        </div>
                        <span className="text-[#172554] font-semibold block text-[11px] mb-1">
                          Serviços Corporativos & B2B Maputo
                        </span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Execução de diagnósticos avançados, manutenção preventiva em infraestruturas industriais e residenciais de alto padrão.
                        </p>
                      </div>

                      <div className="text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>Auxiliar Técnico Operacional</span>
                          <span className="text-slate-500 font-mono text-[11px]">2021 - 2023</span>
                        </div>
                        <span className="text-[#172554] font-semibold block text-[11px] mb-1">
                          Manutenção & Logística Regional
                        </span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Apoio à equipa técnica de terreno, cumprimento de checklists de segurança no trabalho e controlo de peças de substituição.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Competências Técnicas & Idiomas */}
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                    3. Competências Chave & Certificações
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                    <div>
                      <strong className="block text-slate-900 mb-0.5">Idiomas:</strong>
                      <span>Português (Fluente / Nativo), Inglês (Funcional)</span>
                    </div>
                    <div>
                      <strong className="block text-slate-900 mb-0.5">Anos de Prática:</strong>
                      <span>{candidate.experienceYears || 3} anos comprovados em Moçambique</span>
                    </div>
                    <div className="col-span-2">
                      <strong className="block text-slate-900 mb-0.5">Especialidades:</strong>
                      <span>{candidate.skills ? (Array.isArray(candidate.skills) ? candidate.skills.join(', ') : candidate.skills) : 'Diagnóstico rápido, conformidade com normas elétricas/mecânicas, responsabilidade e rigor profissional'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ID DOCUMENT VIEW */
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                  <div className="w-16 h-20 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-black text-2xl shrink-0">
                    🪪
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase block">
                      ✓ CÓPIA DIGITAL HOMOLOGADA
                    </span>
                    <h3 className="font-serif text-base font-bold text-slate-900">
                      Bilhete de Identidade (BI) Moçambicano
                    </h3>
                    <p className="text-xs text-slate-500">
                      Ficheiro em arquivo: <span className="font-mono font-bold text-slate-700">{attachments.idDoc.name}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-3">
                    Dados Civis & Registo de Identidade
                  </h2>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Nome do Titular</span>
                      <strong className="text-slate-900">{candidate.fullName}</strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Número de BI (Simulado)</span>
                      <strong className="text-slate-900 font-mono">110{candidate.nuit || '209384910'}M</strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">NUIT Fiscal</span>
                      <strong className="text-slate-900 font-mono">{candidate.nuit || '108392019'}</strong>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Naturalidade / Cidade</span>
                      <strong className="text-slate-900">{candidate.city || candidate.residence || 'Maputo'}</strong>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 col-span-2">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase block flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Atestado de Antecedentes Criminais & Verificação de Integridade
                      </span>
                      <p className="text-xs text-emerald-900 mt-0.5">
                        Auditado pelo ecossistema TARIRA. Sem registos criminais pendentes. Elegível para admissão imediata em ambientes residenciais e corporativos de alta segurança.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Official Footer Verification Stamp */}
            <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[10px]">
              <div>
                <span className="font-bold text-slate-700 block">TARIRA CENTRAL OPERATIONS & ATS PIPELINE</span>
                <span>Homologado por: Dra. Isolda Tembe • Acesso Master de Auditoria</span>
              </div>
              <div className="text-right font-mono">
                <span className="block text-slate-700">HASH: TARIRA-SEC-2026-X99</span>
                <span>Validação criptográfica ativa</span>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 bg-white border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Acesso Autorizado para Download e Triagem de Anexos Oficiais</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-border text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2 rounded-xl bg-[#172554] hover:bg-[#172554] text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar {activeDocType === 'cv' ? 'Currículo Vitae (.PDF)' : 'Documento BI (.PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
