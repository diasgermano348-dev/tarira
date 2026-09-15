import React, { useState, useEffect } from 'react';
import { Phone, Mail, Linkedin, Instagram, Save, CheckCircle2, Info, X } from 'lucide-react';
import { TariraSocialLinksData } from './TariraContactSettingsManager';

interface TariraContactSettingsModalProps {
  isOpen: boolean;
  socialLinks: TariraSocialLinksData;
  onClose: () => void;
  onUpdateSocialLinks?: (updated: TariraSocialLinksData) => void | Promise<void>;
  onTriggerAuditLog?: (action: string, details: string) => void;
}

const onlyDigits = (value: string) => value.replace(/[^\d]/g, '');

// Versão em modal (popup) do gestor de Contactos & Redes Sociais do Site.
// Permite ao operador administrativo actualizar rapidamente os números/telefones oficiais
// (WhatsApp, Linhas Telefónicas), e-mail, LinkedIn e Instagram, a partir de qualquer ecrã
// do painel administrativo, sem ter de navegar até ao separador completo "Contactos & Redes Sociais (Site)".
export const TariraContactSettingsModal: React.FC<TariraContactSettingsModalProps> = ({
  isOpen,
  socialLinks,
  onClose,
  onUpdateSocialLinks,
  onTriggerAuditLog
}) => {
  const [form, setForm] = useState<TariraSocialLinksData>(socialLinks);
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sempre que o modal é reaberto, sincroniza com os dados mais recentes vindos de fora
  useEffect(() => {
    if (isOpen) {
      setForm(socialLinks);
    }
  }, [isOpen, socialLinks]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (field: keyof TariraSocialLinksData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const phone1Digits = onlyDigits(form.phone1);
    const updated: TariraSocialLinksData = {
      ...form,
      // O link do WhatsApp é sempre derivado do Telefone 1, para nunca ficar dessincronizado
      whatsapp: phone1Digits ? `https://wa.me/${phone1Digits}` : form.whatsapp
    };

    try {
      await onUpdateSocialLinks?.(updated);
      setForm(updated);
      onTriggerAuditLog?.(
        'EDITAR_CONTACTOS_SITE',
        'Administrador actualizou os dados da página de Contactos (telefones, e-mail, LinkedIn, Instagram) via modal rápido.'
      );
      showToast('✅ Dados de contacto actualizados com sucesso!');
    } catch (err) {
      showToast('⚠️ Ocorreu um erro ao guardar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 py-4 sm:py-8 flex justify-center items-start sm:items-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="rounded-3xl p-5 sm:p-8 max-w-2xl w-full border border-border bg-white shadow-2xl relative my-2 sm:my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 border border-border text-slate-500 hover:text-slate-900 font-black transition-all flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#172554] shrink-0 text-xl">
            📇
          </div>
          <div>
            <span className="text-[10px] tracking-widest text-[#172554] font-mono font-bold uppercase block">
              Contactos & Redes Sociais do Site
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-slate-900 font-bold">
              Editar Contactos Oficiais
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-5 leading-relaxed">
          Estes dados alimentam directamente o Rodapé, o Canal de WhatsApp e a página "Sede Operacional & Contactos" vista pelos visitantes do site.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-[#172554] font-mono flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> E-mail Institucional
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#172554] focus:bg-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-[#172554] font-mono flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn (URL Completo)
              </label>
              <input
                type="url"
                required
                value={form.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#172554] focus:bg-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-[#172554] font-mono flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Telefone 1 — Operações & Piquete
              </label>
              <input
                type="text"
                required
                placeholder="+258 87 142 5316"
                value={form.phone1}
                onChange={(e) => handleChange('phone1', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#172554] focus:bg-white font-mono"
              />
              <p className="text-[10px] text-slate-400">Usado também para o botão de WhatsApp principal (link gerado automaticamente).</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-[#172554] font-mono flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Telefone 2 — Direcção Comercial
              </label>
              <input
                type="text"
                required
                placeholder="+258 83 536 1379"
                value={form.phone2}
                onChange={(e) => handleChange('phone2', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#172554] focus:bg-white font-mono"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#172554] font-mono flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5" /> Instagram (URL Completo)
              </label>
              <input
                type="url"
                value={form.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://www.instagram.com/tarira.weoversee"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#172554] focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2 text-[11px] text-[#172554] leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Pré-visualização do link de WhatsApp gerado: <strong>{onlyDigits(form.phone1) ? `https://wa.me/${onlyDigits(form.phone1)}` : '—'}</strong>
            </span>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white border border-border text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'A guardar...' : 'Guardar Alterações'}</span>
            </button>
          </div>
        </form>

        {toast && (
          <div className="fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-2xl bg-[#172554] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-up">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
