import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  Building, 
  Search, 
  Send, 
  Trash2,
  Filter,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export interface ContactMessageItem {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
  category: 'suporte' | 'parceria' | 'comercial' | 'reclamacao' | 'geral';
  receivedAt: string;
  status: 'novo' | 'em_atendimento' | 'respondido' | 'arquivado';
  notes?: string;
}

export const INITIAL_CONTACT_MESSAGES: ContactMessageItem[] = [
  {
    id: 'msg-001',
    senderName: 'António Mondlane',
    senderEmail: 'antonio.m@gmail.com',
    senderPhone: '+258 84 321 9876',
    subject: 'Parceria de Fornecimento para Condomínio em Maputo',
    message: 'Gostaria de saber como integrar a gestão dos 4 edifícios do nosso condomínio na Polana com técnicos permanentes de canalização e segurança.',
    category: 'comercial',
    receivedAt: '2026-02-28 09:30',
    status: 'novo'
  },
  {
    id: 'msg-002',
    senderName: 'Cláudia Simango',
    senderEmail: 'claudia.simango@empresa.co.mz',
    senderPhone: '+258 82 555 4321',
    subject: 'Pedido de Orçamento para Equipa de Limpeza e Apoio Pós-Obra',
    message: 'Precisamos de uma equipa com 6 profissionais para limpeza pesada pós-obra de um armazém em Matola Rio durante 3 dias.',
    category: 'parceria',
    receivedAt: '2026-02-27 16:45',
    status: 'em_atendimento'
  },
  {
    id: 'msg-003',
    senderName: 'Eng. Marcelino Cossa',
    senderEmail: 'cossa.marcelino@gmail.com',
    senderPhone: '+258 87 111 2233',
    subject: 'Candidatura de Engenheiro Eletricista com Equipa Própria',
    message: 'Tenho uma equipa de 4 técnicos certificados para instalações solares e trifásicas. Pretendemos ser credenciados no TARIRA Connect.',
    category: 'geral',
    receivedAt: '2026-02-26 11:15',
    status: 'respondido'
  }
];

interface TariraContactMessagesManagerProps {
  onTriggerAuditLog?: (action: string, details: string) => void;
}

export const TariraContactMessagesManager: React.FC<TariraContactMessagesManagerProps> = ({
  onTriggerAuditLog
}) => {
  const [messages, setMessages] = useState<ContactMessageItem[]>(() => {
    try {
      const saved = localStorage.getItem('tarira_contact_messages');
      if (saved) return JSON.parse(saved);
    } catch (err) {}
    return INITIAL_CONTACT_MESSAGES;
  });
  const [isLoadingServer, setIsLoadingServer] = useState<boolean>(true);

  // Vai buscar as mensagens REAIS submetidas pelos clientes via /api/contact.
  // Este painel mostrava sempre as 3 mensagens de exemplo fixas, mesmo depois
  // de existirem mensagens reais no servidor — os pedidos dos clientes nunca
  // chegavam a aparecer aqui. Mantemos as alterações de estado feitas
  // localmente (respondido/arquivado/notas) como sobreposição, já que o
  // servidor ainda só tem GET/POST para /api/contact (sem endpoint de
  // atualização), para não perder o trabalho de triagem já feito.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/contact');
        if (!res.ok) return;
        const serverData = await res.json();
        if (cancelled || !Array.isArray(serverData)) return;

        let localOverrides: Record<string, Partial<ContactMessageItem>> = {};
        try {
          const savedOverrides = localStorage.getItem('tarira_contact_messages_overrides');
          if (savedOverrides) localOverrides = JSON.parse(savedOverrides);
        } catch (err) {}

        const mapped: ContactMessageItem[] = serverData.map((c: any) => ({
          id: c.id,
          senderName: c.name || 'Contacto Comercial',
          senderEmail: c.email || '',
          senderPhone: c.phone || undefined,
          subject: c.company ? `${c.serviceType || 'Contacto'} — ${c.company}` : (c.serviceType || 'Contacto Geral'),
          message: c.notes || '',
          category: (['suporte', 'parceria', 'comercial', 'reclamacao', 'geral'].includes(c.serviceType) ? c.serviceType : 'comercial') as ContactMessageItem['category'],
          receivedAt: c.createdAt || new Date().toISOString(),
          status: (c.status === 'pending' ? 'novo' : c.status) as ContactMessageItem['status'],
          notes: c.internalNotes || undefined,
          ...(localOverrides[c.id] || {})
        }));

        if (mapped.length > 0) {
          setMessages(mapped);
          localStorage.setItem('tarira_contact_messages', JSON.stringify(mapped));
        }
      } catch (err) {
        console.warn('Aviso ao carregar mensagens de contacto do servidor (a usar cache local):', err);
      } finally {
        if (!cancelled) setIsLoadingServer(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMsg, setSelectedMsg] = useState<ContactMessageItem | null>(null);
  const [replyText, setReplyText] = useState('');

  const saveMessages = (newList: ContactMessageItem[], changedId?: string, changedFields?: Partial<ContactMessageItem>) => {
    setMessages(newList);
    try {
      localStorage.setItem('tarira_contact_messages', JSON.stringify(newList));
      // Guarda também a alteração isolada por ID, para não se perder no
      // próximo carregamento a partir do servidor (que não sabe destes campos).
      if (changedId && changedFields) {
        const savedOverrides = localStorage.getItem('tarira_contact_messages_overrides');
        const overrides = savedOverrides ? JSON.parse(savedOverrides) : {};
        overrides[changedId] = { ...(overrides[changedId] || {}), ...changedFields };
        localStorage.setItem('tarira_contact_messages_overrides', JSON.stringify(overrides));
      }
    } catch (err) {}
  };

  const handleUpdateStatus = (msgId: string, newStatus: ContactMessageItem['status']) => {
    const updated = messages.map((m) => (m.id === msgId ? { ...m, status: newStatus } : m));
    saveMessages(updated, msgId, { status: newStatus });
    if (selectedMsg && selectedMsg.id === msgId) {
      setSelectedMsg({ ...selectedMsg, status: newStatus });
    }
    if (onTriggerAuditLog) {
      onTriggerAuditLog(
        'STATUS_MENSAGEM_CONTACTO',
        `Mensagem de contacto #${msgId} alterada para status "${newStatus}"`
      );
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta mensagem?')) {
      const updated = messages.filter((m) => m.id !== msgId);
      saveMessages(updated);
      if (selectedMsg && selectedMsg.id === msgId) {
        setSelectedMsg(null);
      }
      if (onTriggerAuditLog) {
        onTriggerAuditLog('ELIMINAR_MENSAGEM_CONTACTO', `Mensagem #${msgId} eliminada`);
      }
    }
  };

  const handleSendWhatsAppReply = (msg: ContactMessageItem) => {
    if (!msg.senderPhone) {
      alert('Esta mensagem não tem número de telefone registado.');
      return;
    }
    const cleanPhone = msg.senderPhone.replace(/\D/g, '');
    const phoneNum = cleanPhone.startsWith('258') ? cleanPhone : `258${cleanPhone.slice(-9)}`;
    const text = `Olá *${msg.senderName}*, agradecemos o seu contacto à TARIRA referente a "*${msg.subject}*".\n\n${replyText || 'Estamos a acompanhar o seu pedido e ficamos ao dispor para atendê-lo.'}`;
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`, '_blank');
    handleUpdateStatus(msg.id, 'respondido');
  };

  const handleSendEmailReply = (msg: ContactMessageItem) => {
    const subject = encodeURIComponent(`TARIRA - Resposta ao Contacto: ${msg.subject}`);
    const body = encodeURIComponent(
      `Exmo(a) ${msg.senderName},\n\nAgradecemos o seu contacto através da nossa plataforma.\n\n${replyText}\n\nCom os melhores cumprimentos,\nEquipa de Atendimento e Operações TARIRA\ntarira.ecossistema@gmail.com`
    );
    window.open(`mailto:${msg.senderEmail}?subject=${subject}&body=${body}`, '_blank');
    handleUpdateStatus(msg.id, 'respondido');
  };

  const filteredMessages = messages.filter((m) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      m.senderName.toLowerCase().includes(q) ||
      m.senderEmail.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-blue-500/25 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 text-[10px] font-mono font-bold uppercase tracking-widest border border-blue-500/30">
              💬 CENTRAL DE MENSAGENS & CONTACTOS
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#172554]">
            Mensagens Recebidas & Atendimento ao Cliente
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Acompanhe e responda a todos os pedidos de informação, propostas comerciais e dúvidas submetidos no formulário de contacto do portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-mono text-slate-500">
            Total:{' '}
            <span className="font-bold text-blue-700">{messages.length}</span> (
            <span className="text-rose-600 font-bold">
              {messages.filter((m) => m.status === 'novo').length} novas
            </span>
            )
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Filtrar por remetente, email, assunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-blue-400"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-[#172554] rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-400"
          >
            <option value="all">Todos os Estados</option>
            <option value="novo">🔴 Novos ({messages.filter((m) => m.status === 'novo').length})</option>
            <option value="em_atendimento">🟡 Em Atendimento</option>
            <option value="respondido">🟢 Respondidos</option>
            <option value="arquivado">⚪ Arquivados</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Messages List + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List (Left column) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
              Nenhuma mensagem encontrada.
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelected = selectedMsg?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMsg(msg);
                    setReplyText('');
                  }}
                  className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-400/80 bg-white shadow-xl'
                      : 'border-slate-200/80 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          msg.status === 'novo'
                            ? 'bg-rose-500 animate-pulse'
                            : msg.status === 'em_atendimento'
                            ? 'bg-blue-400'
                            : msg.status === 'respondido'
                            ? 'bg-emerald-400'
                            : 'bg-slate-600'
                        }`}
                      />
                      <span className="font-bold text-[#172554] text-xs">{msg.senderName}</span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {msg.receivedAt}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-blue-700 line-clamp-1 mb-1">
                    {msg.subject}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-200/60 text-[10px]">
                    <span className="text-slate-400 font-mono">
                      ✉️ {msg.senderEmail}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono font-bold uppercase ${
                        msg.status === 'novo'
                          ? 'bg-rose-50 text-rose-700 border border-rose-800/40'
                          : msg.status === 'em_atendimento'
                          ? 'bg-blue-50 text-blue-700 border border-blue-800/40'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-800/40'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Message Detail & Reply Box (Right column) */}
        <div className="lg:col-span-5">
          {selectedMsg ? (
            <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 bg-white shadow-2xl space-y-5 sticky top-28">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-700 block mb-1">
                    DETALHE DA MENSAGEM #{selectedMsg.id}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#172554]">
                    {selectedMsg.subject}
                  </h3>
                </div>

                <button
                  onClick={() => handleDeleteMessage(selectedMsg.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/30 transition-all cursor-pointer"
                  title="Eliminar Mensagem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sender Details */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Remetente:</span>
                  <span className="font-bold text-[#172554]">{selectedMsg.senderName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <a
                    href={`mailto:${selectedMsg.senderEmail}`}
                    className="text-blue-700 hover:underline font-mono"
                  >
                    {selectedMsg.senderEmail}
                  </a>
                </div>
                {selectedMsg.senderPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Telefone / WA:</span>
                    <span className="text-emerald-600 font-mono font-bold">
                      {selectedMsg.senderPhone}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Data de Envio:</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {selectedMsg.receivedAt}
                  </span>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                  Conteúdo da Mensagem:
                </label>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedMsg.message}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                  Atualizar Estado:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedMsg.id, 'em_atendimento')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedMsg.status === 'em_atendimento'
                        ? 'bg-[#172554] text-white border-blue-400'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🟡 Em Atendimento
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedMsg.id, 'respondido')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedMsg.status === 'respondido'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🟢 Respondido
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedMsg.id, 'arquivado')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedMsg.status === 'arquivado'
                        ? 'bg-slate-700 text-[#172554] border-slate-600'
                        : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ⚪ Arquivar
                  </button>
                </div>
              </div>

              {/* Quick Reply Box */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="text-[10px] uppercase font-mono font-bold text-blue-700 block">
                  Resposta Rápida:
                </label>
                <textarea
                  rows={3}
                  placeholder="Escreva a resposta para enviar via WhatsApp ou Email..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-[#172554] rounded-xl p-3 text-xs outline-none focus:border-blue-400 leading-relaxed"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendWhatsAppReply(selectedMsg)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>💬 Responder no WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleSendEmailReply(selectedMsg)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <span>✉️ Responder por Email</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200/80 bg-white text-center text-slate-500 text-xs">
              👈 Selecione uma mensagem à esquerda para visualizar o conteúdo completo e enviar resposta rápida.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
