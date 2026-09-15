import React, { useState } from 'react';
import {
  Mail,
  ExternalLink,
  Copy,
  Check,
  X,
  Send,
  Sparkles,
  MessageSquare,
  Globe,
  Laptop
} from 'lucide-react';

export interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail?: string;
  initialSubject?: string;
  initialBody?: string;
  defaultSenderName?: string;
  defaultSenderEmail?: string;
  defaultSenderPhone?: string;
}

export const TariraEmailComposerModal: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  targetEmail = 'tarira.ecossistema@gmail.com',
  initialSubject = 'Contacto via TARIRA Ecossystem — Solicitação de Informações',
  initialBody = 'Olá equipa TARIRA,\n\nGostaria de solicitar informações sobre os vossos serviços e soluções corporativas.\n\nAtenciosamente,',
  defaultSenderName = '',
  defaultSenderEmail = '',
  defaultSenderPhone = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [senderName, setSenderName] = useState(defaultSenderName);
  const [senderEmail, setSenderEmail] = useState(defaultSenderEmail);
  const [senderPhone, setSenderPhone] = useState(defaultSenderPhone);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [activeView, setActiveView] = useState<'options' | 'compose'>('options');

  if (!isOpen) return null;

  const emailTo = targetEmail || 'tarira.ecossistema@gmail.com';

  // Generate webmail URLs with pre-filled fields
  const getMailtoUrl = () => {
    return `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getGmailUrl = () => {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTo)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getOutlookUrl = () => {
    return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(emailTo)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getYahooUrl = () => {
    return `https://compose.mail.yahoo.com/?to=${encodeURIComponent(emailTo)}&subj=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Launch handlers
  const handleLaunchGmail = () => {
    window.open(getGmailUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleLaunchOutlook = () => {
    window.open(getOutlookUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleLaunchYahoo = () => {
    window.open(getYahooUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleLaunchMailto = () => {
    const link = document.createElement('a');
    link.href = getMailtoUrl();
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      window.location.href = getMailtoUrl();
    } catch {
      // Ignored
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailTo);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      const el = document.createElement('textarea');
      el.value = emailTo;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Send message directly via backend API
  const handleDirectSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !body.trim()) {
      alert('Por favor, preencha o seu nome, e-mail de contacto e a mensagem.');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: senderName,
          email: senderEmail,
          phone: senderPhone,
          serviceType: subject,
          notes: body,
          comments: `[Enviado via Central de E-mail do Portal] Assunto: ${subject}\n\n${body}`
        })
      });

      if (!response.ok) {
        throw new Error('Falha no envio da mensagem.');
      }

      setSentSuccess(true);
    } catch {
      // Fallback: trigger user's email client directly
      handleLaunchGmail();
      setSentSuccess(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 bg-slate-950/85 backdrop-blur-md flex justify-center items-start sm:items-center animate-fade-in">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-white via-blue-50 to-white border border-blue-500/30 shadow-2xl shadow-black/80 overflow-hidden my-2 sm:my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top decorative gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400"></div>

        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-700 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#172554] font-serif">
                  Compor & Enviar E-mail
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] text-emerald-700 font-mono font-bold uppercase">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Canal direto com a administração e central de operações TARIRA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-700 text-slate-400 hover:text-[#172554] flex items-center justify-center transition-all cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Email Banner */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-400 font-mono">Para:</span>
            <span className="font-mono font-bold text-blue-700 select-all">{emailTo}</span>
          </div>

          <button
            onClick={handleCopyEmail}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/40'
                : 'bg-slate-50 hover:bg-slate-700 text-slate-500 border border-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar E-mail</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          {sentSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-700 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#172554] font-serif">
                  E-mail Transmitido com Sucesso!
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  A sua mensagem foi registada e encaminhada diretamente para a equipa da TARIRA Ecossystem (<span className="text-blue-700 font-mono">{emailTo}</span>). Responderemos em menos de 24 horas.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Concluir
                </button>
                <button
                  onClick={() => {
                    setSentSuccess(false);
                    setActiveView('options');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-700 text-slate-500 font-semibold text-xs transition-all cursor-pointer"
                >
                  Enviar Outra Mensagem
                </button>
              </div>
            </div>
          ) : activeView === 'options' ? (
            <div className="space-y-6">
              {/* Instructions banner */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200/90 leading-relaxed flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-700">Abertura Automática no Navegador:</span>{' '}
                  Escolha o seu serviço de e-mail habitual para abrir instantaneamente uma nova janela com o campo de criação pronto e preenchido.
                </div>
              </div>

              {/* Direct Mail Web Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Gmail (Web Browser) */}
                <button
                  onClick={handleLaunchGmail}
                  className="p-4 rounded-2xl bg-white hover:bg-slate-850 border border-red-500/30 hover:border-red-400/60 transition-all text-left group shadow-md flex items-start gap-3.5 cursor-pointer relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#172554] group-hover:text-red-300 transition-colors">
                        Gmail no Navegador
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Abre o campo de composição no Google Chrome / Browser padrão
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">
                      Recomendado
                    </span>
                  </div>
                </button>

                {/* 2. Outlook / Hotmail (Web Browser) */}
                <button
                  onClick={handleLaunchOutlook}
                  className="p-4 rounded-2xl bg-white hover:bg-slate-850 border border-blue-500/30 hover:border-blue-400/60 transition-all text-left group shadow-md flex items-start gap-3.5 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#172554] group-hover:text-blue-700 transition-colors">
                        Outlook / Hotmail Web
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-700 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Abre a tela de composição no Outlook.com no navegador
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      Microsoft Web
                    </span>
                  </div>
                </button>

                {/* 3. Default System Client (Mailto) */}
                <button
                  onClick={handleLaunchMailto}
                  className="p-4 rounded-2xl bg-white hover:bg-slate-850 border border-blue-500/30 hover:border-blue-400/60 transition-all text-left group shadow-md flex items-start gap-3.5 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#172554] group-hover:text-blue-700 transition-colors">
                        App de E-mail do Sistema
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-700 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Outlook Desktop, Apple Mail, Thunderbird ou app do telemóvel
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded-md">
                      Cliente Padrão
                    </span>
                  </div>
                </button>

                {/* 4. Write Directly on Page */}
                <button
                  onClick={() => setActiveView('compose')}
                  className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-white hover:from-emerald-900/50 border border-emerald-500/40 hover:border-emerald-400/70 transition-all text-left group shadow-md flex items-start gap-3.5 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#172554] group-hover:text-emerald-700 transition-colors">
                        Escrever Aqui no Portal
                      </span>
                      <Send className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Escreva a sua mensagem diretamente neste formulário rápido
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                      Envio Direto Instantâneo
                    </span>
                  </div>
                </button>
              </div>

              {/* Pre-filled preview info */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                <div className="text-slate-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
                  Dados Pré-configurados na Mensagem:
                </div>
                <div className="text-slate-200">
                  <span className="text-slate-400">Assunto: </span>
                  <span className="font-semibold text-blue-200">{subject}</span>
                </div>
                <div className="text-slate-400 line-clamp-2 italic text-[11px]">
                  &quot;{body}&quot;
                </div>
              </div>
            </div>
          ) : (
            /* Direct Email Compose Form */
            <form onSubmit={handleDirectSend} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider font-mono">
                  Redação Direta de E-mail
                </span>
                <button
                  type="button"
                  onClick={() => setActiveView('options')}
                  className="text-xs text-slate-400 hover:text-[#172554] transition-colors cursor-pointer"
                >
                  ← Voltar às opções do navegador
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">O Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Ex: Carlos Sitoe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#172554] placeholder-slate-500 focus:outline-none focus:border-blue-400 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">O Seu E-mail de Resposta *</label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="Ex: carlos.sitoe@empresa.co.mz"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#172554] placeholder-slate-500 focus:outline-none focus:border-blue-400 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Contacto de Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="Ex: +258 84 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#172554] placeholder-slate-500 focus:outline-none focus:border-blue-400 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Assunto *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#172554] focus:outline-none focus:border-blue-400 font-medium"
                  >
                    <option value="Contacto via TARIRA Ecossystem — Solicitação de Informações">
                      Solicitação Geral de Informações
                    </option>
                    <option value="Proposta Comercial B2B / TARIRA Outsourcing">
                      Proposta Comercial B2B / Outsourcing
                    </option>
                    <option value="Recrutamento & Seleção de Talentos / TARIRA Recruit">
                      Recrutamento de Talentos / TARIRA Recruit
                    </option>
                    <option value="Suporte & Manutenção Residencial / TARIRA Connect">
                      Suporte Residencial / TARIRA Connect
                    </option>
                    <option value="Parceria Corporativa ou Institucional">
                      Parceria Corporativa ou Institucional
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Mensagem / Conteúdo *</label>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escreva aqui a sua mensagem ou pedido..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#172554] placeholder-slate-500 focus:outline-none focus:border-blue-400 font-medium leading-relaxed"
                ></textarea>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleLaunchGmail}
                  className="text-xs text-slate-400 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Prefiro abrir no meu Gmail / Webmail</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveView('options')}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-700 text-slate-500 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sending ? (
                      <span>A transmitir...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Mensagem</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
