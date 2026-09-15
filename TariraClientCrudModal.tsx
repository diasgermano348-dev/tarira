import React, { useState, useEffect } from 'react';
import { Building, User, Mail, Phone, MapPin, FileText, Check, X, ShieldCheck } from 'lucide-react';
import { Client } from './types';

interface TariraClientCrudModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: Partial<Client>;
  onClose: () => void;
  onSave: (clientData: Partial<Client>) => Promise<void> | void;
  operatorName?: string;
  operatorRole?: string;
}

export const TariraClientCrudModal: React.FC<TariraClientCrudModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
  operatorName = 'Administrador',
  operatorRole = 'Central TARIRA'
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    type: 'company',
    email: '',
    phone: '+258 ',
    nuit: '',
    city: 'Maputo',
    address: '',
    linkedin: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          name: '',
          type: 'company',
          email: '',
          phone: '+258 84 ',
          nuit: '',
          city: 'Maputo',
          address: '',
          linkedin: ''
        });
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Por favor insira o Nome da Empresa ou Cliente.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        id: formData.id || `client-${Date.now()}`,
        createdAt: formData.createdAt || new Date().toISOString()
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao guardar dados do cliente');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto">
      <div className="bg-background border border-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl relative my-8 animate-fade-up text-left text-text-primary">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-background-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <div className="p-3 rounded-2xl bg-brand/10 border border-brand/20 text-brand text-xl">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-light">
              {mode === 'create' ? 'NOVO REGISTO CORPORATIVO' : 'EDIÇÃO DE CLIENTE'}
            </span>
            <h2 className="text-xl font-bold text-text-primary">
              {mode === 'create' ? 'Registar Empresa / Cliente no Ecossistema' : `Editar: ${formData.name}`}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-text-secondary block mb-1">
                Nome da Empresa ou Cliente *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Cervejas de Moçambique, SA"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-background border border-border text-text-primary rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-text-secondary block mb-1">
                Tipo de Entidade
              </label>
              <select
                value={formData.type || 'company'}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full bg-background border border-border text-text-primary rounded-xl p-2.5 text-xs outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
              >
                <option value="company">🏢 Empresa / Corporativo B2B</option>
                <option value="condo">🏘️ Condomínio Residencial / Comercial</option>
                <option value="residential">🏠 Particular / Cliente Residencial</option>
                <option value="individual">👤 Profissional / Individual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-text-secondary block mb-1">
                Email de Contacto / Facturação
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="compras@empresa.co.mz"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-background border border-border text-text-primary rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-text-secondary block mb-1">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="+258 84 000 0000"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-background border border-border text-text-primary rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-text-secondary block mb-1">
                NUIT (NIF Moçambique)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="400123456"
                  value={formData.nuit || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, nuit: e.target.value }))}
                  className="w-full bg-background border border-border text-text-primary rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-text-secondary block mb-1">
                Província / Cidade
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                <select
                  value={formData.city || 'Maputo'}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-background border border-border text-text-primary rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
                >
                  <option value="Maputo">Maputo Cidade</option>
                  <option value="Matola">Matola (Maputo Província)</option>
                  <option value="Beira">Beira (Sofala)</option>
                  <option value="Nampula">Nampula</option>
                  <option value="Tete">Tete</option>
                  <option value="Pemba">Pemba (Cabo Delgado)</option>
                  <option value="Quelimane">Quelimane (Zambézia)</option>
                  <option value="Chimoio">Chimoio (Manica)</option>
                  <option value="Inhambane">Inhambane / Vilankulo</option>
                  <option value="Xai-Xai">Xai-Xai (Gaza)</option>
                  <option value="Lichinga">Lichinga (Niassa)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-text-secondary block mb-1">
                Endereço / Sede
              </label>
              <input
                type="text"
                placeholder="Av. 24 de Julho, 1234"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full bg-background border border-border text-text-primary rounded-xl p-2.5 text-xs outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light shadow-xs"
              />
            </div>
          </div>

          <div className="p-3 bg-background-secondary rounded-xl border border-border text-[11px] text-text-secondary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
            <span>
              Registo supervisionado por <strong className="text-text-primary">{operatorName}</strong> ({operatorRole}).
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-background-secondary hover:bg-slate-200 text-text-primary border border-border text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-light hover:bg-brand text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <span>A gravar...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{mode === 'create' ? 'Registar Cliente' : 'Guardar Alterações'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
