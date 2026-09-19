import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isDone, setIsDone] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setMessage(null);
      setIsDone(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A palavra-passe deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As palavras-passe não coincidem. Digite a mesma senha em ambos os campos.' });
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setMessage({
        type: 'error',
        text: 'O serviço de redefinição de palavra-passe está temporariamente indisponível. Por favor, tente mais tarde.'
      });
      return;
    }

    setLoading(true);

    try {
      // Atualiza a palavra-passe do utilizador autenticado pelo token de recuperação
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Erro ao redefinir a palavra-passe. O link de recuperação pode ter expirado.'
        });
        setLoading(false);
        return;
      }

      setIsDone(true);
      setMessage({
        type: 'success',
        text: 'Palavra-passe atualizada com sucesso! A sua nova senha já está ativa.'
      });

      // Limpar os parâmetros de hash/token da URL do navegador de forma limpa
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      setTimeout(() => {
        if (onSuccess && data?.user) {
          onSuccess(data.user);
        }
        onClose();
      }, 1800);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Erro inesperado ao atualizar a palavra-passe.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-border shadow-2xl p-6 sm:p-8 text-slate-900">
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-slate-100 border border-border text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-[#172554] mb-3 shadow-xs">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-wide">
            Definir Nova Palavra-passe
          </h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Link de recuperação validado. Digite a sua nova palavra-passe abaixo para redefinir o acesso à sua conta.
          </p>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold mb-5 border flex items-start gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : message.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-slate-100 border-border text-slate-700'
            }`}
          >
            {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {message.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            <span>{message.text}</span>
          </div>
        )}

        {!isDone ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                Nova Palavra-passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8FAFC] border border-border text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#172554]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                Confirmar Nova Palavra-passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F8FAFC] border border-border text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#172554]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#172554] hover:bg-[#172554] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                {loading ? 'A guardar nova palavra-passe...' : 'Guardar Nova Palavra-passe'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              A redirecionar para o portal...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
