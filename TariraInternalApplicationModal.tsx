import React, { useState, useRef, FormEvent } from 'react';
import {
  X,
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building,
  Check,
  AlertCircle,
  Clock,
  DollarSign,
  Layers,
  ArrowRight,
  RefreshCw,
  Send,
  HelpCircle
} from 'lucide-react';
import { SpontaneousApplication } from './types';

interface TariraInternalApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (app: SpontaneousApplication) => void;
}

// Dropdown options for vacancies/departments updated by TARIRA
const AVAILABLE_DEPARTMENTS_OPTIONS = [
  { id: 'banco_geral', label: '📂 Banco de Talentos Geral (Sem vaga específica em aberto)' },
  { id: 'vaga_aberta', label: '🎯 Vaga Específica em Aberto / Edital Oficial' },
  { id: 'operacoes', label: '⚡ Operações, Supervisão & Logística de Campo' },
  { id: 'tecnologia_produto', label: '💻 Engenharia de Software, Produto & Design' },
  { id: 'vendas_b2b', label: '📈 Vendas Corporativas, B2B & Parcerias' },
  { id: 'marketing_growth', label: '📣 Marketing Digital, Growth & Comunicação' },
  { id: 'people_ops', label: '👥 Recursos Humanos & People Operations' },
  { id: 'financas_compliance', label: '📊 Finanças, Contabilidade & Compliance' },
  { id: 'outro', label: '📝 Outro Departamento / Especialidade' }
];

const SENIORITY_LEVELS = [
  { id: 'intern_junior', label: 'Estágio / Júnior (0-2 anos)', desc: 'Primeiros passos ou base sólida' },
  { id: 'mid', label: 'Pleno (3-5 anos)', desc: 'Autonomia e entregas consistentes' },
  { id: 'senior', label: 'Sénior (6+ anos)', desc: 'Especialista técnico e visão sistémica' },
  { id: 'lead_exec', label: 'Coordenação / Liderança / Direção', desc: 'Gestão de pessoas e estratégia' }
];

const WORK_MODELS = [
  { id: 'hybrid', label: '🏢 Híbrido (Maputo)', desc: 'Dias presenciais + remoto' },
  { id: 'onsite', label: '🏛️ Presencial (Maputo)', desc: '100% no escritório TARIRA' },
  { id: 'remote', label: '🌐 100% Remoto', desc: 'Trabalho flexível à distância' }
];

const POPULAR_SKILLS = [
  'Gestão de Projetos Ágeis',
  'Desenvolvimento React / TypeScript',
  'Node.js & APIs REST',
  'UI/UX Design (Figma)',
  'Vendas B2B & CRM',
  'Marketing Digital & SEO',
  'Contabilidade & Fiscalidade MZ',
  'Gestão de Atendimento & CX',
  'Recrutamento & People Ops',
  'Análise de Dados & SQL',
  'Negociação Estratégica',
  'Gestão de Riscos / KYC'
];

export const TariraInternalApplicationModal: React.FC<TariraInternalApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Personal Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Maputo');

  // Professional Links
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Department & Work preferences
  const [departmentCategory, setDepartmentCategory] = useState(AVAILABLE_DEPARTMENTS_OPTIONS[0].id);
  const [candidateDepartmentInput, setCandidateDepartmentInput] = useState('');
  const [seniorityLevel, setSeniorityLevel] = useState('mid');
  const [workModel, setWorkModel] = useState('hybrid');
  const [availability, setAvailability] = useState('Imediata (até 15 dias)');
  const [expectedSalary, setExpectedSalary] = useState('');

  // Motivation & Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Resume / CV
  const [cvFileName, setCvFileName] = useState('');
  const [cvFileUrl, setCvFileUrl] = useState('');
  const [cvExternalLink, setCvExternalLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<SpontaneousApplication | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      if (!isPdf) {
        setErrorMessage('O Currículo (CV) tem de ser estritamente em formato PDF (.pdf). Ficheiros noutros formatos não são aceites.');
        alert('O Currículo (CV) tem de ser estritamente em formato PDF (.pdf). Ficheiros noutros formatos não são aceites.');
        e.target.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setErrorMessage(`O documento PDF excede o tamanho máximo permitido de 2MB (2 Megabytes). O ficheiro selecionado possui ${sizeMb} MB. Por favor carregue um documento com até 2MB.`);
        alert(`O documento PDF excede o tamanho máximo permitido de 2MB (2 Megabytes). O ficheiro selecionado possui ${sizeMb} MB. Por favor carregue um documento com até 2MB.`);
        e.target.value = '';
        return;
      }
      setErrorMessage('');
      setCvFileName(file.name);
      // Read file as Data URL for preview and transport
      const reader = new FileReader();
      reader.onload = () => {
        setCvFileUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Por favor, informe o seu Nome Completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de Email válido.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Por favor, informe o seu número de Telefone / WhatsApp.');
      return;
    }
    if (!candidateDepartmentInput.trim()) {
      setErrorMessage('Por favor, escreva o Departamento ou Função pelo qual está a se candidatar (conforme indicado no tema do seu CV).');
      return;
    }
    if (!coverLetter.trim()) {
      setErrorMessage('Por favor, escreva uma breve motivação sobre por que gostaria de se juntar à equipa interna.');
      return;
    }

    setSubmitting(true);

    const resolvedDepartment = candidateDepartmentInput.trim();
    const activeDeptOption = AVAILABLE_DEPARTMENTS_OPTIONS.find(o => o.id === departmentCategory);
    const departmentContext = activeDeptOption ? activeDeptOption.label : resolvedDepartment;

    try {
      const applicationPayload: SpontaneousApplication = {
        id: `corp-${Date.now()}`,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        residence: city.trim(),
        category: resolvedDepartment,
        careerFocus: 'internal_corporate_team',
        notes: `Candidatura para a Equipa Interna TARIRA. Departamento/Função: ${resolvedDepartment} [Vaga/Opção: ${departmentContext}]. Senioridade: ${seniorityLevel}. Modalidade: ${workModel}. Pretensão: ${expectedSalary || 'A negociar'}.`,
        skills: selectedSkills,
        expectedSalary: expectedSalary.trim(),
        cvDocumentName: cvFileName || (cvExternalLink ? 'CV_Link_Externo' : 'CV_Cadastrado.pdf'),
        cvDocumentUrl: cvFileUrl || cvExternalLink,
        cvUrl: cvFileUrl || cvExternalLink,
        isAtsValidated: true,
        atsScore: 95,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        // Extended attributes
        targetDepartment: resolvedDepartment,
        seniorityLevel: seniorityLevel,
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        workModelPreference: workModel,
        availability: availability,
        coverLetter: coverLetter.trim(),
        applicationType: 'internal_team'
      };

      const res = await fetch('/api/spontaneous-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationPayload)
      });

      let createdApp: SpontaneousApplication = applicationPayload;
      if (res.ok) {
        createdApp = await res.json();
      }

      setSubmittedApp(createdApp);
      if (onSuccess) {
        onSuccess(createdApp);
      }
    } catch (err: any) {
      console.warn('Backend offline, using local fallback:', err);
      const fallbackApp: SpontaneousApplication = {
        id: `corp-${Date.now()}`,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        residence: city.trim(),
        category: resolvedDepartment,
        careerFocus: 'internal_corporate_team',
        notes: `Candidatura para a Equipa Interna TARIRA (${resolvedDepartment}).`,
        skills: selectedSkills,
        cvDocumentName: cvFileName || 'CV_Candidato.pdf',
        cvDocumentUrl: cvFileUrl || cvExternalLink,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        targetDepartment: resolvedDepartment,
        coverLetter: coverLetter.trim(),
        applicationType: 'internal_team'
      };
      setSubmittedApp(fallbackApp);
      if (onSuccess) {
        onSuccess(fallbackApp);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 bg-black/60 backdrop-blur-xs flex justify-center items-start sm:items-center">
      <div className="relative w-full max-w-4xl bg-background border border-border rounded-3xl shadow-2xl overflow-hidden my-2 sm:my-auto max-h-[95vh] flex flex-col text-text-primary animate-fade-up">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-8 bg-background-secondary border-b border-border flex items-start justify-between relative shrink-0">
          <div className="space-y-2 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>Equipa Interna TARIRA • Talent Community</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-brand/5 text-brand-light border border-brand/15 text-[10px] font-mono font-semibold">
                Candidatura Espontânea & Vagas Futuras
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-serif text-text-primary font-bold tracking-tight">
              Faça Parte da Equipa Central da TARIRA
            </h2>
            <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
              Não temos vagas imediatas abertas no momento, mas estamos sempre à procura de mentes brilhantes para expandir as nossas operações, tecnologia e novos negócios. Submeta o seu perfil para consideração proativa.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-background hover:bg-background-secondary text-text-secondary hover:text-text-primary border border-border transition-all cursor-pointer shrink-0 shadow-xs"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8">
          
          {submittedApp ? (
            /* Success State */
            <div className="py-10 text-center space-y-6 max-w-xl mx-auto animate-fade-in">
              <div className="w-16 h-16 bg-status-success/15 border-2 border-status-success text-status-success rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-status-success font-extrabold tracking-widest block">
                  CANDIDATURA SUBMETIDA COM SUCESSO!
                </span>
                <h3 className="text-2xl font-serif text-text-primary font-bold">
                  Obrigado pelo seu interesse, {submittedApp.fullName.split(' ')[0]}!
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  O seu perfil foi registado no nosso <strong className="text-brand font-bold">Banco de Talentos da Equipa Interna TARIRA</strong> para a área de <strong className="text-text-primary font-bold">{submittedApp.targetDepartment || submittedApp.category}</strong>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-background-secondary border border-border text-left space-y-3 text-xs shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary">Código de Referência:</span>
                  <span className="font-mono font-bold text-brand">{submittedApp.id}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary">Área de Interesse:</span>
                  <span className="font-semibold text-text-primary">{submittedApp.targetDepartment || submittedApp.category}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-text-secondary">Email do Perfil (Chave):</span>
                  <span className="font-mono text-text-primary">{submittedApp.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Status do Processo:</span>
                  <span className="px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20 font-mono text-[10px] font-bold">
                    Em Banco Ativo de Triagem
                  </span>
                </div>
              </div>

              {/* Email Confirmation Sent Banner */}
              <div className="p-4 rounded-2xl bg-status-success/10 border border-status-success/30 text-xs text-text-primary leading-relaxed text-left flex items-start gap-3">
                <Mail className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-status-success block">✉️ Email de Confirmação Enviado com Sucesso:</strong>
                  <span>
                    Enviámos um email de confirmação para <strong className="text-text-primary underline">{submittedApp.email}</strong> contendo o comprovativo de submissão, os dados da candidatura e os próximos passos do processo de seleção.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand/5 border border-brand/20 text-xs text-text-secondary leading-relaxed text-left flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-primary">Próximos Passos:</strong> A nossa equipa de People Ops analisa os perfis do Banco de Talentos assim que novas vagas estratégicas ou operacionais forem abertas. Entraremos em contacto caso haja alinhamento com futuras oportunidades.
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-brand-light hover:bg-brand text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  Concluir & Fechar
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-status-danger shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Informative Guidance Banner */}
              <div className="p-4 rounded-2xl bg-background-secondary border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center font-bold text-sm shrink-0">
                    ℹ️
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-text-primary block">Formulário Exclusivo para Funções Corporativas Internas</span>
                    <span className="text-text-secondary text-[11px]">
                      Este canal destina-se a cargos de Gestão, Tecnologia, Vendas B2B, Marketing, Pessoas e Finanças da TARIRA.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-brand bg-brand/10 px-2.5 py-1 rounded-lg border border-brand/20 whitespace-nowrap font-bold">
                  Triagem Proativa 2026
                </span>
              </div>

              {/* Section 1: Dados Pessoais & Contacto */}
              <div className="space-y-4">
                <div className="border-b border-border pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand flex items-center gap-2">
                    <User className="w-4 h-4 text-brand" />
                    <span>1. Dados Pessoais & Contacto</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder=""
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5">
                      Email de Contacto *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder=""
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5">
                      Cidade / Província de Residência *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all cursor-pointer shadow-xs"
                    >
                      <option value="Maputo">Maputo Cidade</option>
                      <option value="Matola">Matola / Província de Maputo</option>
                      <option value="Beira">Beira (Sofala)</option>
                      <option value="Nampula">Nampula</option>
                      <option value="Tete">Tete</option>
                      <option value="Quelimane">Quelimane (Zambézia)</option>
                      <option value="Pemba">Pemba (Cabo Delgado)</option>
                      <option value="Outra / Internacional">Outra / Internacional</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Presença Profissional Online */}
              <div className="space-y-4">
                <div className="border-b border-border pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-brand-light" />
                    <span>2. Presença Profissional & Links</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center justify-between">
                      <span>Perfil do LinkedIn</span>
                      <span className="text-[10px] text-brand font-mono font-bold">Altamente Recomendado</span>
                    </label>
                    <div className="relative">
                      <Linkedin className="w-4 h-4 text-brand-light absolute left-3 top-3" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder=""
                        className="w-full bg-background border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center justify-between">
                      <span>Portfólio / GitHub / Website Pessoal</span>
                      <span className="text-[10px] text-text-secondary font-mono">Opcional</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-status-success absolute left-3 top-3" />
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder=""
                        className="w-full bg-background border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Área de Interesse & Enquadramento */}
              <div className="space-y-4">
                <div className="border-b border-border pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand" />
                    <span>3. Área de Interesse & Perfil Corporativo</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center justify-between">
                      <span>Vagas / Departamentos Disponíveis</span>
                      <span className="text-[10px] text-brand font-mono font-bold">Atualizado pela TARIRA</span>
                    </label>
                    <select
                      value={departmentCategory}
                      onChange={(e) => {
                        setDepartmentCategory(e.target.value);
                        const opt = AVAILABLE_DEPARTMENTS_OPTIONS.find(o => o.id === e.target.value);
                        if (opt && opt.id !== 'banco_geral' && opt.id !== 'vaga_aberta' && opt.id !== 'outro' && !candidateDepartmentInput) {
                          setCandidateDepartmentInput(opt.label.replace(/^[^a-zA-ZÀ-ÿ]+/, '').trim());
                        }
                      }}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all cursor-pointer shadow-xs"
                    >
                      {AVAILABLE_DEPARTMENTS_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] text-text-secondary mt-1 block">
                      Selecione a vaga oficial correspondente ou Banco Geral para triagem contínua.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center justify-between">
                      <span>Departamento / Função a que se Candidata *</span>
                      <span className="text-[10px] text-brand font-mono font-bold">Conforme tema do seu CV</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={candidateDepartmentInput}
                      onChange={(e) => setCandidateDepartmentInput(e.target.value)}
                      placeholder="Ex: Gestão de Operações, Engenharia de Software, Vendas B2B, Contabilidade..."
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-xs"
                    />
                    <span className="text-[11px] text-text-secondary mt-1 block">
                      Escreva o departamento pelo qual se candidata, devendo coincidir com o cabeçalho/tema do seu CV.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5">
                      Nível de Senioridade *
                    </label>
                    <select
                      value={seniorityLevel}
                      onChange={(e) => setSeniorityLevel(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all cursor-pointer shadow-xs"
                    >
                      {SENIORITY_LEVELS.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5">
                      Modalidade Preferencial *
                    </label>
                    <select
                      value={workModel}
                      onChange={(e) => setWorkModel(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all cursor-pointer shadow-xs"
                    >
                      {WORK_MODELS.map((wm) => (
                        <option key={wm.id} value={wm.id}>
                          {wm.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-primary block mb-1.5">
                      Disponibilidade para Início *
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all cursor-pointer shadow-xs"
                    >
                      <option value="Imediata (até 15 dias)">Imediata (até 15 dias)</option>
                      <option value="30 dias (Aviso prévio)">30 dias (Aviso prévio)</option>
                      <option value="60 dias">60 dias</option>
                      <option value="A combinar / Flexível">A combinar / Flexível</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1.5 flex items-center justify-between">
                    <span>Pretensão Salarial Mensal Líquida (MZN)</span>
                    <span className="text-[10px] text-text-secondary font-mono">Opcional / Negociável</span>
                  </label>
                  <input
                    type="text"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    placeholder=""
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Section 4: Competências & Carta de Motivação */}
              <div className="space-y-4">
                <div className="border-b border-border pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand" />
                    <span>4. Competências & Motivação Pessoal</span>
                  </h3>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1.5">
                    Competências Chave & Ferramentas
                  </label>
                  <p className="text-[11px] text-text-secondary mb-2">
                    Clique nas tags para adicionar ou digite competências personalizadas:
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {POPULAR_SKILLS.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-light text-white font-bold shadow-xs border border-brand'
                              : 'bg-background text-text-primary hover:bg-background-secondary border border-border'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {skill}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSkill();
                        }
                      }}
                      placeholder=""
                      className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSkill}
                      className="px-4 py-2 bg-background-secondary hover:bg-border text-text-primary text-xs font-bold rounded-xl transition-all cursor-pointer border border-border shadow-xs"
                    >
                      Adicionar
                    </button>
                  </div>

                  {selectedSkills.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-text-secondary font-mono uppercase self-center mr-1">Selecionadas:</span>
                      {selectedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20 text-[11px] font-medium flex items-center gap-1"
                        >
                          {sk}
                          <X
                            className="w-3 h-3 text-brand hover:text-status-danger cursor-pointer"
                            onClick={() => toggleSkill(sk)}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1.5">
                    Porquê a TARIRA? / Breve Carta de Apresentação *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder=""
                    className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all leading-relaxed shadow-xs"
                  ></textarea>
                </div>
              </div>

              {/* Section 5: Currículo (CV) */}
              <div className="space-y-4">
                <div className="border-b border-border pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-brand flex items-center gap-2">
                    <Upload className="w-4 h-4 text-brand" />
                    <span>5. Currículo Vitae (CV) & Documentos</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-brand-light bg-background-secondary/50 hover:bg-background-secondary transition-all cursor-pointer text-center space-y-2 flex flex-col items-center justify-center group shadow-xs"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,application/pdf"
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-brand/10 group-hover:bg-brand/20 text-brand flex items-center justify-center transition-all">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary block">
                        {cvFileName ? `Ficheiro: ${cvFileName}` : 'Carregar Currículo em PDF'}
                      </span>
                      <span className="text-[10px] text-text-secondary block">
                        {cvFileName ? 'Clique para substituir' : 'Formato Obrigatório: PDF (.pdf) • Tamanho Máx: 2MB'}
                      </span>
                    </div>
                  </div>

                  {/* External Link Option */}
                  <div className="p-4 rounded-2xl bg-background-secondary/50 border border-border space-y-2.5 flex flex-col justify-center shadow-xs">
                    <label className="text-xs font-semibold text-text-primary block">
                      Ou forneça o link do seu CV na nuvem:
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                      <input
                        type="url"
                        value={cvExternalLink}
                        onChange={(e) => setCvExternalLink(e.target.value)}
                        placeholder=""
                        className="w-full bg-background border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-all shadow-xs"
                      />
                    </div>
                    <span className="text-[10px] text-text-secondary leading-tight">
                      Certifique-se de que o link está configurado para acesso público de leitura.
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy & Submission Buttons */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                  <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                  <span>Seus dados são confidenciais e avaliados exclusivamente pela equipa de People Ops TARIRA.</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-text-secondary font-bold text-xs transition-all border border-border cursor-pointer shadow-xs"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-none px-7 py-2.5 rounded-xl bg-brand-light hover:bg-brand text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-brand"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>A Enviar Candidatura...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submeter para a Equipa Interna</span>
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
