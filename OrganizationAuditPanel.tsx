import React, { useState } from "react";
import {
  ShieldCheck,
  Users,
  UserPlus,
  Activity,
  X
} from "lucide-react";
import { OrgOperator, OperatorAuditAction } from "./supabase";

export type { OrgOperator, OperatorAuditAction };

interface OrganizationAuditPanelProps {
  orgName: string;
  orgType: "company" | "condo" | "admin" | "merchant" | "residential" | "lar";
  orgId: string;
  operators: OrgOperator[];
  activeOperator: OrgOperator;
  onSwitchOperator: (op: OrgOperator) => void;
  onAddOperator: (newOp: Partial<OrgOperator>) => void;
  auditLogs: OperatorAuditAction[];
  onAddAuditAction: (action: Partial<OperatorAuditAction>) => void;
  candidates?: any[];
  hires?: any[];
  canSwitchOperator?: boolean;
}

export const OrganizationAuditPanel: React.FC<OrganizationAuditPanelProps> = ({
  orgName,
  orgType,
  orgId,
  operators,
  activeOperator,
  onSwitchOperator,
  onAddOperator,
  auditLogs,
  onAddAuditAction,
  candidates = [],
  hires = [],
  canSwitchOperator = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isAddOperatorOpen, setIsAddOperatorOpen] = useState(false);
  const [isNewActionOpen, setIsNewActionOpen] = useState(false);

  const isPlatformAdmin = orgType === "admin" || canSwitchOperator;

  const [newOpName, setNewOpName] = useState("");
  const [newOpRole, setNewOpRole] = useState("Validador de RH & Conformidade");
  const [newOpEmail, setNewOpEmail] = useState("");
  const [newOpPerms, setNewOpPerms] = useState<string[]>([
    "Validar Candidatos",
    "Agendar Intervenções"
  ]);

  const [actionType, setActionType] = useState<"VALIDAÇÃO" | "AGENDAMENTO" | "APROVAÇÃO">("VALIDAÇÃO");
  const [targetCandidateId, setTargetCandidateId] = useState("");
  const [actionDetails, setActionDetails] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const filteredLogs = (auditLogs || [])
    .filter(log => log.orgName === orgName || orgType === "admin")
    .filter(log => {
      const matchSearch =
        log.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetEntity.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === "ALL" || log.actionType === filterType;
      return matchSearch && matchType;
    });

  const handleCreateOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpName.trim() || !newOpEmail.trim()) {
      alert("Por favor preencha o Nome e o Email do operador!");
      return;
    }
    const created: Partial<OrgOperator> = {
      id: `op-${Date.now()}`,
      name: newOpName.trim(),
      role: newOpRole.trim() || "Operador de Validação",
      email: newOpEmail.trim(),
      orgId,
      orgName,
      permissions: newOpPerms,
      status: "Ativo",
      lastActive: "Agora mesmo",
      avatar: "👤"
    };
    onAddOperator(created);
    setIsAddOperatorOpen(false);
    setNewOpName("");
    setNewOpEmail("");
    alert(`✅ Novo operador registrado com sucesso para ${orgName}: ${created.name}`);
  };

  const handleExecuteAuditAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionDetails.trim()) {
      alert("Por favor preencha os detalhes da operação de validação ou agendamento!");
      return;
    }
    let targetEntityName = "Objeto Geral / Sistema";
    if (targetCandidateId) {
      const cand = candidates.find(c => c.id === targetCandidateId);
      if (cand) {
        targetEntityName = `${cand.name} ${cand.surname || ''} (${cand.title || cand.category || ''})`;
      }
    }

    const newAction: Partial<OperatorAuditAction> = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }) + ' de Hoje',
      operatorId: activeOperator?.id || 'op-admin',
      operatorName: activeOperator?.name || 'Administrador',
      operatorRole: activeOperator?.role || 'Admin',
      orgName,
      actionType,
      details: actionDetails,
      targetEntity: targetEntityName,
      ipAddress: "197.249.0.12 (Maputo)"
    };

    onAddAuditAction(newAction);
    setIsNewActionOpen(false);
    setActionDetails("");
    setTargetCandidateId("");
    alert(`✅ Operação de ${actionType} registada no Trail de Auditoria para ${orgName}.`);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-widest block">
              AUDITORIA & MULTI-LOGINS
            </span>
            <h2 className="text-xl font-serif font-bold text-[#172554]">{orgName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOperatorOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Novo Operador da Empresa
          </button>
          <button
            onClick={() => setIsNewActionOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Activity className="w-4 h-4" /> Registar Validação
          </button>
        </div>
      </div>

      {/* STRATEGIC LICENSED TARIRA QUALITY AUDITOR BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-white via-blue-50 to-blue-50 border border-blue-500/30 shadow-lg text-left">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              👩‍💼
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-700 border border-blue-500/40 uppercase tracking-wider">
                  Auditor de Qualidade (Licenciado TARIRA)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                  Taxa: 100% Homologado • 0,00 MT (Sem Encargo)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 border border-blue-500/20 text-[10px] font-mono">
                  Supervisão Passiva
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#172554] mt-1">
                Dra. Ana Sousa • Auditora de Conformidade & Qualidade Licenciada TARIRA
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Este auditor é um especialista oficial licenciado pela Central TARIRA para garantir o cumprimento estrito das normas de segurança, certificações profissionais e conformidade legal trabalhista. Trata-se de uma <strong>auditoria de qualidade passiva e não interventiva</strong>, que salvaguarda a sua empresa sem qualquer acesso interferente aos seus dados confidenciais ou insights operacionais.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-right">
              <span className="text-[9px] font-mono text-slate-400 block uppercase">Taxa de Conformidade</span>
              <span className="text-xs font-mono font-bold text-emerald-600">100% Homologado TARIRA</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERNAL COMPANY OPERATORS SECTION */}
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#172554] flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-700" /> Operadores & Gestores Autorizados da Conta ({orgName})
            </h3>
            <p className="text-[11px] text-slate-400">
              Colaboradores internos da sua organização autorizados a solicitar vagas, agendar manutenções e aprovar serviços.
            </p>
          </div>
          <button
            onClick={() => setIsAddOperatorOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-700 text-blue-700 border border-blue-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Adicionar Operador
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Always display the Licensed Auditor card as first certified entity */}
          <div className="p-4 rounded-2xl border bg-blue-500/10 border-blue-500/40 text-white shadow-lg relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👩‍💼</span>
              <span className="text-[9px] font-mono font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                AUDITOR LICENCIADO TARIRA
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#172554]">Dra. Ana Sousa</h4>
            <p className="text-xs text-blue-700/90 font-medium">Auditora de Qualidade & Conformidade</p>
            <p className="text-[11px] text-slate-400 mt-2 font-mono">auditoria.qualidade@tarira.mz</p>
            <div className="mt-2.5 pt-2 border-t border-blue-500/20 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Selo TARIRA MZ-992</span>
              <span className="text-emerald-600 font-bold">100% Passivo</span>
            </div>
          </div>

          {(operators || []).filter(op => op.email !== "ana.sousa@vodacom.co.mz" && op.name !== "Dra. Ana Sousa").map(op => {
            const isActive = activeOperator?.id === op.id;
            return (
              <div
                key={op.id}
                onClick={() => {
                  onSwitchOperator(op);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-500/10 border-blue-500/50 text-white shadow-lg ring-1 ring-blue-500/30'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-200'
                }`}
                title="Clique para alternar operador ativo da sessão"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{op.avatar || '👤'}</span>
                  <div className="flex items-center gap-1.5">
                    {isActive && (
                      <span className="text-[9px] font-mono font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        ATIVO NA SESSÃO
                      </span>
                    )}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      op.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {op.status}
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-[#172554]">{op.name}</h4>
                <p className="text-xs text-slate-400">{op.role}</p>
                <p className="text-[11px] text-slate-500 mt-2 font-mono">{op.email}</p>
                <div className="mt-2 pt-2 border-t border-slate-200/80 text-[10px] text-blue-700 font-mono flex items-center justify-between">
                  <span>Operador Interno</span>
                  <span>{isActive ? '✓ Selecionado' : 'Clique para usar →'}</span>
                </div>
              </div>
            );
          })}

          {(operators || []).filter(op => op.email !== "ana.sousa@vodacom.co.mz" && op.name !== "Dra. Ana Sousa").length === 0 && (
            <div 
              onClick={() => setIsAddOperatorOpen(true)}
              className="p-5 rounded-2xl bg-white border border-dashed border-slate-200 hover:border-blue-500/40 text-center flex flex-col items-center justify-center cursor-pointer transition-all group"
            >
              <UserPlus className="w-6 h-6 text-slate-600 group-hover:text-blue-700 mb-2 transition-colors" />
              <h5 className="text-xs font-bold text-slate-500 group-hover:text-[#172554]">
                Adicionar Operador Interno
              </h5>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs">
                Cadastre gestores de RH ou compras da sua empresa para gerir a conta conjuntamente.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-[#172554] flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-700" /> Registos de Auditoria & Validações
          </h3>
          <input
            type="text"
            placeholder="Pesquisar acção, operador..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-[#172554] focus:outline-none focus:border-blue-500 w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="bg-white text-slate-400 uppercase text-[10px] font-mono border-b border-slate-200">
              <tr>
                <th className="p-3">Hora</th>
                <th className="p-3">Operador</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Entidade Alvo</th>
                <th className="p-3">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 font-bold text-[#172554]">{log.operatorName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200">{log.targetEntity}</td>
                  <td className="p-3 text-slate-400">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOperatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 flex justify-center items-start sm:items-center">
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl max-w-md w-full relative my-2 sm:my-auto max-h-[95vh] overflow-y-auto shadow-2xl">
            <button
              type="button"
              onClick={() => setIsAddOperatorOpen(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-blue-400 text-blue-700 hover:bg-blue-400 hover:text-[#172554] font-black transition-all flex items-center justify-center cursor-pointer shadow-xl active:scale-95 z-30"
              title="Fechar"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h3 className="text-lg font-serif font-bold text-[#172554] mb-4">Adicionar Operador da Empresa</h3>
            <form onSubmit={handleCreateOperator} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newOpName}
                  onChange={e => setNewOpName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-[#172554]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={newOpEmail}
                  onChange={e => setNewOpEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-[#172554]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={newOpRole}
                  onChange={e => setNewOpRole(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-[#172554]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOperatorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold"
                >
                  Registar Operador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewActionOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 flex justify-center items-start sm:items-center">
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl max-w-md w-full relative my-2 sm:my-auto max-h-[95vh] overflow-y-auto shadow-2xl">
            <button
              type="button"
              onClick={() => setIsNewActionOpen(false)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-blue-400 text-blue-700 hover:bg-blue-400 hover:text-[#172554] font-black transition-all flex items-center justify-center cursor-pointer shadow-xl active:scale-95 z-30"
              title="Fechar"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h3 className="text-lg font-serif font-bold text-[#172554] mb-4">Registar Operação Auditada</h3>
            <form onSubmit={handleExecuteAuditAction} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Tipo de Operação</label>
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-[#172554]"
                >
                  <option value="VALIDAÇÃO">VALIDAÇÃO</option>
                  <option value="AGENDAMENTO">AGENDAMENTO</option>
                  <option value="APROVAÇÃO">APROVAÇÃO</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Detalhes & Notas</label>
                <textarea
                  rows={3}
                  required
                  value={actionDetails}
                  onChange={e => setActionDetails(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-[#172554]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewActionOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold"
                >
                  Gravar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
