import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  key?: React.Key;
  // Chamado quando o boundary apanha um erro — útil para, por ex., voltar à landing page.
  onReset?: () => void;
  // Texto opcional a mostrar no botão de recuperação.
  resetLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary global do portal TARIRA.
 *
 * Sem isto, qualquer erro de JavaScript lançado durante o render de um
 * formulário (ex: StandardRegistrationForm, TariraCommercialModal, etc.)
 * faz com que o React desmonte toda a árvore de componentes — resultando
 * numa página completamente em branco, sem qualquer mensagem para o
 * utilizador nem forma de voltar atrás.
 *
 * Com este componente, se um erro acontecer dentro de uma secção,
 * mostramos um ecrã de recuperação amigável em vez de uma página em
 * branco, e registamos o erro na consola para ajudar a diagnosticar a
 * causa raiz.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[TARIRA ErrorBoundary] Erro capturado durante o render:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          id="s-error-boundary-fallback"
          className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto p-8 text-center bg-white my-12 rounded-3xl border border-red-200 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-3xl mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-serif font-bold text-[#172554] mb-2">
            Ocorreu um Erro Inesperado
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-md">
            Algo correu mal ao carregar esta secção do portal. A nossa equipa foi notificada.
            Pode tentar novamente ou voltar à Página Principal.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-[#172554] text-white text-xs font-bold hover:bg-[#1A3478] transition-all shadow-sm cursor-pointer"
            >
              {this.props.resetLabel || "Voltar à Página Principal"}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#172554] text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
