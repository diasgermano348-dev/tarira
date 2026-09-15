import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  CreditCard,
  Building,
  User,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Smartphone,
  Save,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Copy
} from 'lucide-react';
import { ManualPaymentSettings, PaymentBankAccount } from './types';
import { TariraRegistrationPlansModal } from './TariraRegistrationPlansModal';

export interface PaymentOrderItem {
  id: string;
  clientName: string;
  serviceDescription: string;
  amountMzn: number;
  paymentMethod: 'mpesa' | 'emola' | 'bci' | 'pos' | 'cash';
  methodLabel: string;
  referenceCode: string;
  status: 'paid' | 'pending' | 'refunded' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  notes?: string;
}

interface TariraFinanceCrudManagerProps {
  paymentOrders?: any[];
  onUpdatePaymentOrders?: (orders: any[]) => void;
  onTriggerAuditLog?: (action: string, details: string) => void;
  payoutRequests?: Array<{
    id: string;
    candidateId: string;
    candidateName: string;
    phone?: string;
    amount: number;
    status: 'pending' | 'paid' | 'rejected';
    adminNotes?: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  onApprovePayout?: (id: string) => Promise<void> | void;
  onRejectPayout?: (id: string, notes?: string) => Promise<void> | void;
}

export const TariraFinanceCrudManager: React.FC<TariraFinanceCrudManagerProps> = ({
  paymentOrders = [],
  onUpdatePaymentOrders,
  onTriggerAuditLog,
  payoutRequests = [],
  onApprovePayout,
  onRejectPayout
}) => {
  // Navigation Tabs between Orders and Payment Settings
  const [activeFinanceTab, setActiveFinanceTab] = useState<'orders' | 'settings' | 'payouts'>('settings');
  const [rejectingPayout, setRejectingPayout] = useState<{ id: string; candidateName: string } | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const defaultPayments: PaymentOrderItem[] = [
    {
      id: 'pay-001',
      clientName: 'Dra. Luísa Cossa',
      serviceDescription: 'Instalação de AC Inverter + Carga de Gás',
      amountMzn: 4500,
      paymentMethod: 'mpesa',
      methodLabel: 'M-Pesa (Vodacom)',
      referenceCode: 'TX-MPESA-998231',
      status: 'paid',
      dueDate: '2026-02-25',
      paidAt: '2026-02-25 14:32',
      notes: 'Liquidado via gateway automático.'
    },
    {
      id: 'pay-002',
      clientName: 'Condomínio Torres da Polana',
      serviceDescription: 'Mensalidade SLA Platinum (Fevereiro 2026)',
      amountMzn: 85000,
      paymentMethod: 'bci',
      methodLabel: 'Transferência BCI / BIM',
      referenceCode: 'FT-CORP-2026-004',
      status: 'pending',
      dueDate: '2026-03-05',
      notes: 'Aguardando comprovativo de transferência bancária.'
    }
  ];

  const [localPayments, setLocalPayments] = useState<PaymentOrderItem[]>(
    paymentOrders && paymentOrders.length > 0 ? paymentOrders : defaultPayments
  );

  // ============================================================================
  // ESTADO DE CONFIGURAÇÃO DE PAGAMENTOS MANUAIS (E-MOLA, M-PESA, BANCOS E PLANOS)
  // ============================================================================
  const defaultPaymentSettings: ManualPaymentSettings = {
    mpesa: {
      number: "+258 84 900 0123",
      holderName: "TARIRA ECOSSISTEMA LDA",
      instructions: "1. Marque *150# no seu telemóvel Vodacom.\n2. Escolha a Opção 1: 'Transferir Dinheiro'.\n3. Digite o número TARIRA: 84 900 0123.\n4. Confirme o Titular: TARIRA ECOSSISTEMA LDA.\n5. Guarde o SMS com a referência da transação e anexe o comprovativo.",
      active: true
    },
    emola: {
      number: "+258 86 900 0123",
      holderName: "TARIRA ECOSSISTEMA LDA",
      instructions: "1. Marque *898# no seu telemóvel Movitel.\n2. Escolha a Opção 1: 'Transferir Dinheiro'.\n3. Digite o número TARIRA: 86 900 0123.\n4. Confirme o Titular: TARIRA ECOSSISTEMA LDA.\n5. Guarde o SMS com a referência da transação e anexe o comprovativo.",
      active: true
    },
    bankAccounts: [
      {
        id: "bank-bim",
        bankName: "Millennium BIM",
        accountNumber: "234567890",
        nib: "0001 0000 0023 4567 8901 2",
        iban: "MZ59000100000023456789012",
        holderName: "TARIRA ECOSSISTEMA LDA",
        active: true
      },
      {
        id: "bank-standard",
        bankName: "Standard Bank Moçambique",
        accountNumber: "109876543",
        nib: "0003 0000 0010 9876 5432 1",
        iban: "MZ59000300000010987654321",
        holderName: "TARIRA ECOSSISTEMA LDA",
        active: true
      },
      {
        id: "bank-bci",
        bankName: "BCI (Banco Comercial e de Investimentos)",
        accountNumber: "543216789",
        nib: "0008 0000 0054 3216 7893 3",
        iban: "MZ59000800000054321678933",
        holderName: "TARIRA ECOSSISTEMA LDA",
        active: true
      }
    ],
    lastUpdated: new Date().toISOString(),
    updatedBy: "Sistema Central TARIRA"
  };

  const [paymentSettings, setPaymentSettings] = useState<ManualPaymentSettings>(defaultPaymentSettings);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // New Bank Account Inline Modal / State
  const [isAddingBank, setIsAddingBank] = useState<boolean>(false);
  const [newBankName, setNewBankName] = useState<string>('');
  const [newBankAccount, setNewBankAccount] = useState<string>('');
  const [newBankNib, setNewBankNib] = useState<string>('');
  const [newBankIban, setNewBankIban] = useState<string>('');
  const [newBankHolder, setNewBankHolder] = useState<string>('TARIRA ECOSSISTEMA LDA');

  // Modals for Payments
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<PaymentOrderItem | null>(null);
  const [editingPayment, setEditingPayment] = useState<PaymentOrderItem | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<PaymentOrderItem | null>(null);
  const [isRegistrationPlansModalOpen, setIsRegistrationPlansModalOpen] = useState(false);

  // Form State for Payment Orders
  const [formClient, setFormClient] = useState('');
  const [formService, setFormService] = useState('');
  const [formAmount, setFormAmount] = useState(3500);
  const [formMethod, setFormMethod] = useState<PaymentOrderItem['paymentMethod']>('mpesa');
  const [formRef, setFormRef] = useState(`TX-${Date.now().toString().slice(-6)}`);
  const [formStatus, setFormStatus] = useState<PaymentOrderItem['status']>('paid');
  const [formNotes, setFormNotes] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  // Carregar dados de pagamento do servidor na montagem
  const fetchPaymentSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const res = await fetch('/api/payment-settings');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setPaymentSettings(data);
        }
      }
    } catch (err) {
      console.warn("[TariraFinance] Falha ao carregar configurações de pagamento:", err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const syncPayments = (updated: PaymentOrderItem[]) => {
    setLocalPayments(updated);
    if (onUpdatePaymentOrders) onUpdatePaymentOrders(updated);
  };

  const filteredPayments = localPayments.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matches =
      p.clientName.toLowerCase().includes(term) ||
      p.serviceDescription.toLowerCase().includes(term) ||
      p.referenceCode.toLowerCase().includes(term);

    if (!matches) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  // Salvar configurações de pagamento atualizadas
  const handleSavePaymentSettings = async () => {
    setIsSavingSettings(true);
    try {
      const token = localStorage.getItem('tarira_session_token') || '';
      const res = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-admin-key': 'tarira2025'
        },
        body: JSON.stringify(paymentSettings)
      });

      if (res.ok) {
        const result = await res.json();
        if (result.settings) {
          setPaymentSettings(result.settings);
        }
        showToast('✓ Dados de pagamento dos planos, e-Mola, M-Pesa e bancos salvos com sucesso!');
        if (onTriggerAuditLog) {
          onTriggerAuditLog(
            'CONFIG_PAGAMENTO_ATUALIZADA',
            `Dados de pagamento manual dos planos atualizados no painel administrativo. e-Mola: ${paymentSettings.emola.number}, M-Pesa: ${paymentSettings.mpesa.number}, Contas Bancárias: ${paymentSettings.bankAccounts.length}`
          );
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(`Erro ao salvar: ${errData.error || 'Acesso não autorizado.'}`);
      }
    } catch (err: any) {
      console.error("Erro ao salvar payment settings:", err);
      showToast('Erro ao comunicar com o servidor.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Adicionar nova conta bancária
  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newBankAccount.trim()) {
      showToast('Por favor, preencha o Nome do Banco e o Número da Conta.');
      return;
    }

    const newAcc: PaymentBankAccount = {
      id: `bank-${Date.now()}`,
      bankName: newBankName.trim(),
      accountNumber: newBankAccount.trim(),
      nib: newBankNib.trim(),
      iban: newBankIban.trim(),
      holderName: newBankHolder.trim() || 'TARIRA ECOSSISTEMA LDA',
      active: true
    };

    setPaymentSettings(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, newAcc]
    }));

    setNewBankName('');
    setNewBankAccount('');
    setNewBankNib('');
    setNewBankIban('');
    setIsAddingBank(false);
    showToast(`✓ Conta do ${newAcc.bankName} adicionada com sucesso! Clique em "Gravar Alterações" para sincronizar.`);
  };

  // Remover conta bancária
  const handleRemoveBankAccount = (id: string, bankName: string) => {
    if (confirm(`Tem a certeza de que deseja remover a conta do ${bankName}?`)) {
      setPaymentSettings(prev => ({
        ...prev,
        bankAccounts: prev.bankAccounts.filter(b => b.id !== id)
      }));
      showToast(`Conta do ${bankName} removida. Lembre-se de Gravar as Alterações.`);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClient.trim() || !formService.trim()) {
      showToast('Preencha os campos obrigatórios.');
      return;
    }

    const methodLabels: Record<string, string> = {
      mpesa: 'M-Pesa (Vodacom)',
      emola: 'E-Mola (Movitel)',
      bci: 'Transferência BCI / BIM',
      pos: 'Cartão / POS',
      cash: 'Numerário / Dinheiro'
    };

    const newPayment: PaymentOrderItem = {
      id: `pay-${Date.now()}`,
      clientName: formClient,
      serviceDescription: formService,
      amountMzn: Number(formAmount) || 0,
      paymentMethod: formMethod,
      methodLabel: methodLabels[formMethod] || formMethod,
      referenceCode: formRef,
      status: formStatus,
      dueDate: new Date().toISOString().split('T')[0],
      paidAt: formStatus === 'paid' ? new Date().toISOString() : undefined,
      notes: formNotes
    };

    const updated = [newPayment, ...localPayments];
    syncPayments(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('CRIAR_ORDEM_PAGAMENTO', `Ordem de pagamento #${newPayment.id} criada para ${newPayment.clientName} no valor de ${newPayment.amountMzn} MZN.`);
    }

    showToast('Ordem financeira registada com sucesso!');
    setIsCreateModalOpen(false);
    setFormClient('');
    setFormService('');
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    const updated = localPayments.map((p) => (p.id === editingPayment.id ? editingPayment : p));
    syncPayments(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('EDITAR_ORDEM_PAGAMENTO', `Ordem de pagamento #${editingPayment.id} atualizada.`);
    }

    showToast('Registo financeiro atualizado!');
    setEditingPayment(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingPayment) return;
    const updated = localPayments.filter((p) => p.id !== deletingPayment.id);
    syncPayments(updated);

    if (onTriggerAuditLog) {
      onTriggerAuditLog('ELIMINAR_ORDEM_PAGAMENTO', `Ordem de pagamento #${deletingPayment.id} eliminada.`);
    }

    showToast('Registo financeiro removido.');
    setDeletingPayment(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`✓ ${label} (${text}) copiado para a área de transferência!`);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#172554] text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-blue-300 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Principal */}
      <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-700 text-xl border border-blue-500/30">
              💳
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#172554]">
                Central Financeira, Pagamentos Manuais & Conta
              </h2>
              <p className="text-xs text-slate-400">
                Gestão dos dados de pagamento (e-Mola, M-Pesa, Bancos), do valor de manutenção de conta e reconciliação manual de ordens.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tabs de Navegação */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveFinanceTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeFinanceTab === 'settings'
                ? 'bg-[#172554] text-white shadow-md font-black'
                : 'text-slate-400 hover:text-[#172554]'
            }`}
          >
            <span>⚙️ Dados de Pagamento</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFinanceTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeFinanceTab === 'orders'
                ? 'bg-[#172554] text-white shadow-md font-black'
                : 'text-slate-400 hover:text-[#172554]'
            }`}
          >
            <span>📋 Ordens & Faturas ({localPayments.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFinanceTab('payouts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeFinanceTab === 'payouts'
                ? 'bg-[#172554] text-white shadow-md font-black'
                : 'text-slate-400 hover:text-[#172554]'
            }`}
          >
            <span>💸 Saques de Prestadores {payoutRequests.filter(p => p.status === 'pending').length > 0 ? `(${payoutRequests.filter(p => p.status === 'pending').length} pendente${payoutRequests.filter(p => p.status === 'pending').length > 1 ? 's' : ''})` : ''}</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          ABA 1: CONFIGURAÇÃO DOS DADOS DE PAGAMENTO DOS PLANOS (E-MOLA, MPESA, BANCOS)
          ════════════════════════════════════════════════════════════════════════ */}
      {activeFinanceTab === 'settings' && (
        <div className="space-y-6">
          {/* Banner Informativo de Fluxo Manual */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-700 border border-blue-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172554]">
                  Fluxo de Pagamento Manual Assistido & Inviolável
                </h3>
                <p className="text-xs text-slate-500">
                  Como não existem APIs diretas para débitos automáticos, os dados aqui definidos (e-Mola, M-Pesa e Bancos) são apresentados aos clientes nas faturas e no checkout de pagamentos.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isSavingSettings}
              onClick={handleSavePaymentSettings}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xl hover:brightness-110 active:scale-95 transition-all shrink-0 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'A Gravar...' : 'Gravar Alterações de Pagamento'}</span>
            </button>
          </div>

          {/* Grid: e-Mola e M-Pesa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CARD 1: e-Mola (Movitel) */}
            <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-700 border border-blue-500/30 flex items-center justify-center font-bold text-base">
                    🟠
                  </span>
                  <div>
                    <h4 className="text-base font-serif font-bold text-[#172554]">
                      e-Mola (Movitel)
                    </h4>
                    <span className="text-[10px] text-blue-700 font-mono">Carteira Móvel & Pagamento USSD</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.emola.active}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      emola: { ...prev.emola, active: e.target.checked }
                    }))}
                    className="accent-blue-500 w-4 h-4 rounded"
                  />
                  <span>Canal Ativo</span>
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Número de Telefone e-Mola
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.emola.number}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      emola: { ...prev.emola, number: e.target.value }
                    }))}
                    placeholder="+258 86 000 0000"
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-4 py-3 text-xs font-mono outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Nome do Titular da Conta
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.emola.holderName}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      emola: { ...prev.emola, holderName: e.target.value }
                    }))}
                    placeholder="TARIRA ECOSSISTEMA LDA"
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-4 py-3 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Instruções de Pagamento / USSD ao Cliente
                  </label>
                  <textarea
                    rows={4}
                    value={paymentSettings.emola.instructions}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      emola: { ...prev.emola, instructions: e.target.value }
                    }))}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-4 py-3 text-xs font-mono outline-none focus:border-blue-400 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: M-Pesa (Vodacom) */}
            <div className="glass-panel p-6 rounded-3xl border border-red-500/30 bg-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-base">
                    🔴
                  </span>
                  <div>
                    <h4 className="text-base font-serif font-bold text-[#172554]">
                      M-Pesa (Vodacom)
                    </h4>
                    <span className="text-[10px] text-red-400 font-mono">Carteira Móvel & Pagamento USSD</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentSettings.mpesa.active}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      mpesa: { ...prev.mpesa, active: e.target.checked }
                    }))}
                    className="accent-blue-500 w-4 h-4 rounded"
                  />
                  <span>Canal Ativo</span>
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Número de Telefone M-Pesa
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.mpesa.number}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      mpesa: { ...prev.mpesa, number: e.target.value }
                    }))}
                    placeholder="+258 84 000 0000"
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-4 py-3 text-xs font-mono outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Nome do Titular da Conta
                  </label>
                  <input
                    type="text"
                    value={paymentSettings.mpesa.holderName}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      mpesa: { ...prev.mpesa, holderName: e.target.value }
                    }))}
                    placeholder="TARIRA ECOSSISTEMA LDA"
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-4 py-3 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Instruções de Pagamento / USSD ao Cliente
                  </label>
                  <textarea
                    rows={4}
                    value={paymentSettings.mpesa.instructions}
                    onChange={(e) => setPaymentSettings(prev => ({
                      ...prev,
                      mpesa: { ...prev.mpesa, instructions: e.target.value }
                    }))}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-4 py-3 text-xs font-mono outline-none focus:border-blue-400 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECÇÃO 2: CONTAS BANCÁRIAS DA EMPRESA */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#172554] flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-700" />
                  <span>Contas Bancárias Oficiais da Empresa</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Adicione, edite ou remova as contas bancárias (BIM, Standard Bank, BCI, etc.) visíveis para transferências e emissão de faturas pró-forma.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingBank(true)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-blue-500/30 text-blue-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Adicionar Conta Bancária</span>
              </button>
            </div>

            {/* Modal / Formulário de Nova Conta Bancária */}
            {isAddingBank && (
              <form onSubmit={handleAddBankAccount} className="p-5 rounded-2xl bg-white border border-blue-500/40 space-y-4 animate-fade-up">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-700 uppercase font-mono">
                    Nova Conta Bancária Corporativa
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingBank(false)}
                    className="text-slate-400 hover:text-[#172554] text-xs"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">Nome do Banco *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Millennium BIM ou Absa"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">Número de Conta *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 234567890"
                      value={newBankAccount}
                      onChange={(e) => setNewBankAccount(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">NIB (21 Dígitos)</label>
                    <input
                      type="text"
                      placeholder="Ex: 0001 0000 0023 4567 8901 2"
                      value={newBankNib}
                      onChange={(e) => setNewBankNib(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">IBAN Moçambique</label>
                    <input
                      type="text"
                      placeholder="Ex: MZ59000100000023456789012"
                      value={newBankIban}
                      onChange={(e) => setNewBankIban(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 font-mono block mb-1">Titular da Conta</label>
                    <input
                      type="text"
                      value={newBankHolder}
                      onChange={(e) => setNewBankHolder(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#172554] hover:bg-blue-400 text-white text-xs font-black uppercase transition-all cursor-pointer shadow-md"
                    >
                      Inserir Conta
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Lista de Contas Bancárias Configuradas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentSettings.bankAccounts.map((b, idx) => (
                <div key={b.id || idx} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 hover:border-blue-500/30 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[#172554] text-sm flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-blue-700" />
                        {b.bankName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBankAccount(b.id, b.bankName)}
                        className="text-slate-500 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remover Conta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Conta:</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-blue-700 font-bold">{b.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(b.accountNumber, `Conta ${b.bankName}`)}
                            className="text-slate-400 hover:text-[#172554] p-1"
                            title="Copiar Conta"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {b.nib && (
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">NIB:</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-slate-500 text-[11px]">{b.nib}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(b.nib, `NIB ${b.bankName}`)}
                              className="text-slate-400 hover:text-[#172554] p-1"
                              title="Copiar NIB"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {b.iban && (
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">IBAN:</span>
                          <span className="font-mono text-slate-400 text-[10px] block truncate">{b.iban}</span>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-mono">Titular:</span>
                        <span className="text-slate-500 text-xs font-semibold">{b.holderName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={b.active}
                        onChange={(e) => {
                          const updated = [...paymentSettings.bankAccounts];
                          updated[idx] = { ...updated[idx], active: e.target.checked };
                          setPaymentSettings(prev => ({ ...prev, bankAccounts: updated }));
                        }}
                        className="accent-blue-500 w-3.5 h-3.5 rounded"
                      />
                      <span>Ativa</span>
                    </label>

                    <span className="text-[10px] font-mono text-emerald-600 font-bold">
                      {b.active ? '● Visível no Checkout' : '○ Oculta'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECÇÃO 3: PLANOS DE REGISTO — ponto único de edição (Empresa, Condomínio, Connect, Recruit) */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#172554] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-700" />
                  <span>Manutenção de Conta & Vantagens</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Os preços mostrados no registo (Empresa, Condomínio, Connect e Recruit) são editados num único ecrã,
                  partilhado com a página TARIRA Connect e o portal de contas registadas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRegistrationPlansModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-emerald-500/50 hover:bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md hover:brightness-105 active:scale-95 transition-all shrink-0"
                title="Definir o valor único de manutenção de conta e as vantagens mostradas aos clientes"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Editar Manutenção de Conta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          ABA 2: ORDENS DE PAGAMENTO & FATURAS (FLUXO MANUAL EXISTENTE)
          ════════════════════════════════════════════════════════════════════════ */}
      {activeFinanceTab === 'orders' && (
        <div className="space-y-6">
          {/* Action Header da Aba de Ordens */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full sm:w-auto flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar por cliente, referência ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none focus:border-blue-400"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                >
                  <option value="all">Todos os Estados Financeiros ({localPayments.length})</option>
                  <option value="paid">✅ Liquidado / Pago</option>
                  <option value="pending">⏳ Pendente de Confirmação</option>
                  <option value="refunded">🔄 Estornado / Devolvido</option>
                  <option value="cancelled">🚫 Cancelado</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#172554] hover:bg-blue-400 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Fatura / Ordem</span>
            </button>
          </div>

          {/* Payments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPayments.map((pay) => (
              <div
                key={pay.id}
                className="glass-panel p-5 rounded-3xl border border-slate-200 bg-white shadow-xl space-y-3 flex flex-col justify-between hover:border-blue-500/30 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono text-blue-700 font-bold">
                          {pay.referenceCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          pay.status === 'paid' ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' :
                          pay.status === 'pending' ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30' :
                          'bg-rose-500/20 text-rose-700 border border-rose-500/30'
                        }`}>
                          {pay.status === 'paid' ? '✅ Liquidado' : pay.status === 'pending' ? '⏳ Pendente' : '🚫 Cancelado'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base font-bold text-[#172554]">
                        {pay.serviceDescription}
                      </h3>
                      <span className="text-xs text-slate-500 block">
                        {pay.clientName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingPayment(pay)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#172554] hover:bg-white cursor-pointer"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPayment({ ...pay })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-white cursor-pointer"
                        title="Editar Registo"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPayment(pay)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/30 cursor-pointer"
                        title="Eliminar Registo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Método:</span>
                      <span className="text-[#172554] font-medium">{pay.methodLabel}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">Valor:</span>
                      <span className="font-mono text-blue-700 font-bold text-base">{pay.amountMzn.toLocaleString()} MZN</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Vencimento: {pay.dueDate}</span>
                  {pay.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = localPayments.map((p) => (p.id === pay.id ? { ...p, status: 'paid' as const } : p));
                        syncPayments(updated);
                        showToast(`Ordem #${pay.referenceCode} marcada como liquidada!`);
                      }}
                      className="text-emerald-600 hover:underline font-bold"
                    >
                      Confirmar Pagamento
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ ABA 3: SAQUES DE PRESTADORES (PEDIDOS DE LEVANTAMENTO) ════════ */}
      {activeFinanceTab === 'payouts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#172554] leading-relaxed">
            💡 Pedidos de saque enviados pelos prestadores a partir do seu "Painel do Prestador". Serviços diários ficam disponíveis assim que o cliente paga; serviços de longa duração só ficam disponíveis para saque no final do mês. Ao aprovar, confirme primeiro que a transferência real (M-Pesa/e-Mola/Banco) foi feita — só depois disso o saldo do prestador é debitado.
          </div>

          {payoutRequests.length === 0 ? (
            <div className="p-10 text-center rounded-3xl bg-white border border-slate-200">
              <span className="text-4xl block mb-2">💸</span>
              <p className="text-sm text-slate-500 font-medium">Ainda não há pedidos de saque registados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payoutRequests.map((req) => (
                <div key={req.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#172554]">{req.candidateName}</h4>
                      {req.phone && <p className="text-[11px] text-slate-400 font-mono">{req.phone}</p>}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      req.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {req.status === 'paid' ? '✅ Pago' : req.status === 'rejected' ? '🚫 Rejeitado' : '⏳ Pendente'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-bold">Valor Solicitado</span>
                    <span className="font-mono text-blue-700 font-bold text-base">{req.amount.toLocaleString()} MZN</span>
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono">Pedido em: {new Date(req.createdAt).toLocaleString('pt-PT')}</p>
                  {req.adminNotes && (
                    <p className="text-[11px] text-slate-500 italic">Nota: {req.adminNotes}</p>
                  )}

                  {req.status === 'pending' && (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await onApprovePayout?.(req.id);
                          onTriggerAuditLog?.('APROVAR_SAQUE', `Saque de ${req.amount} MZN aprovado para ${req.candidateName}.`);
                          showToast(`✅ Saque de ${req.candidateName} aprovado e marcado como pago!`);
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all"
                      >
                        Confirmar Transferência
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRejectingPayout({ id: req.id, candidateName: req.candidateName }); setRejectNotes(''); }}
                        className="flex-1 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold cursor-pointer transition-all"
                      >
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════ MODAL: REJEITAR PEDIDO DE SAQUE ════════ */}
      {rejectingPayout && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-rose-500/40 bg-white shadow-2xl relative">
            <h3 className="font-serif text-xl text-[#172554] font-bold mb-2">
              Rejeitar Pedido de Saque
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Motivo da rejeição para {rejectingPayout.candidateName} (ex: dados bancários incorrectos):
            </p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
              className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 mb-4"
              placeholder="Motivo (opcional)..."
            />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectingPayout(null)}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onRejectPayout?.(rejectingPayout.id, rejectNotes);
                  onTriggerAuditLog?.('REJEITAR_SAQUE', `Saque de ${rejectingPayout.candidateName} rejeitado. Motivo: ${rejectNotes || 'N/A'}`);
                  showToast(`🚫 Pedido de ${rejectingPayout.candidateName} rejeitado.`);
                  setRejectingPayout(null);
                }}
                className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 1: CRIAR PAGAMENTO ════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-700" />
              <span>Emitir Nova Ordem de Pagamento</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Cliente / Empresa Beneficiária *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mozal SA ou Carlos Alberto"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Valor a Cobrar (MZN) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Descrição do Serviço / Fatura *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Recrutamento Técnico Especializado ou Manutenção de Conta"
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Canal de Cobrança
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-semibold"
                  >
                    <option value="mpesa">🔴 M-Pesa (Vodacom)</option>
                    <option value="emola">🟠 E-Mola (Movitel)</option>
                    <option value="bci">🏦 Transferência Bancária (BCI / BIM)</option>
                    <option value="pos">💳 Cartão / POS Presencial</option>
                    <option value="cash">💵 Numerário / Caixa</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Código de Referência Interno
                  </label>
                  <input
                    type="text"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-blue-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Notas Financeiras / Instruções Específicas
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções de pagamento para constar na fatura..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                />
              </div>

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
                  className="px-6 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Criar Ordem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 2: VISUALIZAR DETALHES ════════ */}
      {viewingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setViewingPayment(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-4">
              Recibo da Ordem #{viewingPayment.referenceCode}
            </h3>

            <div className="space-y-3 mb-6 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cliente:</span>
                  <span className="text-[#172554] font-bold">{viewingPayment.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Serviço:</span>
                  <span className="text-[#172554] font-medium">{viewingPayment.serviceDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Canal:</span>
                  <span className="text-blue-700 font-semibold">{viewingPayment.methodLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vencimento:</span>
                  <span className="text-[#172554]">{viewingPayment.dueDate}</span>
                </div>
                {viewingPayment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data de Liquidação:</span>
                    <span className="text-emerald-600 font-mono">{viewingPayment.paidAt}</span>
                  </div>
                )}
                {viewingPayment.notes && (
                  <div className="pt-2 border-t border-slate-200 text-slate-500">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Notas:</span>
                    {viewingPayment.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold">
              <span className="text-[#172554]">Valor Liquidado:</span>
              <span className="text-blue-700 text-lg">{viewingPayment.amountMzn.toLocaleString()} MZN</span>
            </div>

            <div className="pt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="px-5 py-2.5 rounded-2xl bg-white text-slate-500 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ MODAL 3: EDITAR REGISTO ════════ */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-blue-400/40 bg-white shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setEditingPayment(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#172554] font-black cursor-pointer flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-serif text-2xl text-[#172554] font-bold mb-4">
              Editar Ordem #{editingPayment.referenceCode}
            </h3>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  required
                  value={editingPayment.clientName}
                  onChange={(e) => setEditingPayment({ ...editingPayment, clientName: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Valor (MZN)
                  </label>
                  <input
                    type="number"
                    value={editingPayment.amountMzn}
                    onChange={(e) => setEditingPayment({ ...editingPayment, amountMzn: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-mono block mb-1">
                    Estado
                  </label>
                  <select
                    value={editingPayment.status}
                    onChange={(e) => setEditingPayment({ ...editingPayment, status: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 text-[#172554] rounded-2xl px-3 py-2.5 text-xs outline-none focus:border-blue-400 font-bold"
                  >
                    <option value="paid">✅ Liquidado</option>
                    <option value="pending">⏳ Pendente</option>
                    <option value="refunded">🔄 Estornado</option>
                    <option value="cancelled">🚫 Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-500 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#172554] text-white text-xs font-black uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ MODAL 4: ELIMINAR REGISTO ════════ */}
      {deletingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 flex justify-center items-center overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-rose-500/40 bg-white shadow-2xl relative">
            <h3 className="font-serif text-xl text-[#172554] font-bold mb-2">
              Eliminar Registo Financeiro
            </h3>
            <p className="text-xs text-rose-700 mb-4">
              Tem a certeza de que deseja eliminar o registo #{deletingPayment.referenceCode}?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingPayment(null)}
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
      {/* Modal de Manutenção de Conta (valor único + vantagens) */}
      <TariraRegistrationPlansModal
        isOpen={isRegistrationPlansModalOpen}
        onClose={() => setIsRegistrationPlansModalOpen(false)}
        onTriggerAuditLog={onTriggerAuditLog}
      />
    </div>
  );
};
