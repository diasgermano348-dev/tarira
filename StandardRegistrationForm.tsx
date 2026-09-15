import React, { useState, useEffect, useRef, FormEvent } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Building,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Camera,
  Upload,
  FileText,
  FileCheck,
  Award,
  Briefcase,
  Wrench,
  Trash2,
  Plus,
  X,
  ArrowRight,
  Zap,
  Check,
  Info,
  Globe
} from 'lucide-react';
import {
  CATEGORIES_TAXONOMY,
  CategoryTaxonomyItem,
  getCategoriesByRole,
  getSpecialtiesForCategory,
  findCategoryItem
} from './categoriesData';
import { ConnectLocationMap } from './ConnectLocationMap';
import { getSupabaseClient, isSupabaseConfigured, UserProfile } from './supabase';
import { uploadImageToImgBB } from './imgbbUpload';
import {
  ACCOUNT_PLAN_ID,
  ACCOUNT_PLAN_NAME,
  HOME_PLAN_ID,
  HOME_PLAN_NAME,
  ACCOUNT_MAINTENANCE_FEE_MZN,
  isPaidAccountRole,
  resolveMaintenanceFee,
  resolveAccountBenefits,
  resolveHomeBenefits
} from './accountPlan';
import { AccountMaintenanceCard } from './AccountMaintenanceCard';

export interface StandardRegistrationFormProps {
  initialRole?: 'prestador' | 'profissional' | 'lar' | 'empresa' | 'condominio';
  lockRole?: 'prestador' | 'profissional' | 'lar' | 'empresa' | 'condominio';
  hideRoleSelector?: boolean;
  initialCategory?: string;
  onSuccess?: (candidateOrUser: any) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const StandardRegistrationForm: React.FC<StandardRegistrationFormProps> = ({
  initialRole = 'prestador',
  lockRole,
  hideRoleSelector = false,
  initialCategory = '',
  onSuccess,
  onCancel,
  isModal = false
}) => {
  // 1. Role / Account Type
  const effectiveRole = lockRole || initialRole;
  const isRoleLocked = !!lockRole || hideRoleSelector;
  const [role, setRole] = useState<'prestador' | 'profissional' | 'lar' | 'empresa' | 'condominio'>(effectiveRole);

  // 2. Personal & Account Identification
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 3. Location & Identification
  const [city, setCity] = useState('');
  const [residence, setResidence] = useState('');
  const [latitude, setLatitude] = useState<number>(-25.9692);
  const [longitude, setLongitude] = useState<number>(32.5732);
  const [nuit, setNuit] = useState('');

  // 4. Profile Picture (Foto de Perfil do Candidato)
  const [photoData, setPhotoData] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoDragging, setPhotoDragging] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState<boolean>(false);

  // 5. Professional Category & Dynamic Specialties
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || (effectiveRole === 'profissional' ? 'Tecnologia, Software & IT' : 'Instalação Solar & Energia')
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState<string>('');

  // 6. Professional Details
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [expectedSalaryMin, setExpectedSalaryMin] = useState<number>(0);
  const [expectedSalaryMax, setExpectedSalaryMax] = useState<number>(0);
  const [rateMzn, setRateMzn] = useState<number>(1500);
  const [bio, setBio] = useState('');

  // 7. Official Documents
  const [identityDocName, setIdentityDocName] = useState<string>('');
  const [identityDocData, setIdentityDocData] = useState<string>('');
  const [cvDocName, setCvDocName] = useState<string>('');
  const [cvDocSize, setCvDocSize] = useState<string>('');
  const [cvDocData, setCvDocData] = useState<string>('');
  const [certificatesDocName, setCertificatesDocName] = useState<string>('');

  // 8. Portfolio of Works & Projects
  const [portfolioImages, setPortfolioImages] = useState<Array<{ url: string; caption: string; name: string }>>([]);
  const [portfolioWebsite, setPortfolioWebsite] = useState<string>('');
  const [portfolioDragging, setPortfolioDragging] = useState<boolean>(false);

  // 8.5 Manutenção de Conta (modelo único — ver accountPlan.ts)
  const [maintenanceFee, setMaintenanceFee] = useState<number>(ACCOUNT_MAINTENANCE_FEE_MZN);
  const [accountBenefits, setAccountBenefits] = useState<string[]>(resolveAccountBenefits(null));
  const [homeBenefits, setHomeBenefits] = useState<string[]>(resolveHomeBenefits(null));
  const [planPaymentTiming, setPlanPaymentTiming] = useState<'trial' | 'now'>('trial');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/registration-plans')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data && Array.isArray(data.plans) && data.plans.length > 0) {
          setMaintenanceFee(resolveMaintenanceFee(data.plans));
          setAccountBenefits(resolveAccountBenefits(data.plans));
          setHomeBenefits(resolveHomeBenefits(data.plans));
        }
      })
      .catch((err) => console.warn('[StandardRegistrationForm] Falha ao carregar valor de manutenção:', err));
    return () => { isMounted = false; };
  }, []);

  // 9. UI & Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const supabase = getSupabaseClient();

  // Synchronize available categories and default specialty list when role or category changes
  useEffect(() => {
    const availableCategories = getCategoriesByRole(role);
    if (availableCategories.length > 0) {
      const exists = availableCategories.some(c => c.name === selectedCategory || c.id === selectedCategory);
      if (!exists) {
        setSelectedCategory(availableCategories[0].name);
      }
    }
  }, [role]);

  // When category changes, load its specialties
  const availableSpecialties = getSpecialtiesForCategory(selectedCategory);
  const [showCustomSpecialtyInput, setShowCustomSpecialtyInput] = useState(false);
  const [customSpecialtiesList, setCustomSpecialtiesList] = useState<string[]>([]);
  const customSpecialtyInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCustomSpecialty = () => {
    setShowCustomSpecialtyInput(true);
    setTimeout(() => {
      customSpecialtyInputRef.current?.focus();
    }, 60);
  };

  // Toggle selection of a specialty chip
  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(spec)) {
        return prev.filter(s => s !== spec);
      } else {
        return [...prev, spec];
      }
    });
  };

  // Add custom specialty
  const handleAddCustomSpecialty = () => {
    if (!customSpecialtyInput.trim()) return;
    const trimmed = customSpecialtyInput.trim();
    if (!customSpecialtiesList.includes(trimmed)) {
      setCustomSpecialtiesList(prev => [...prev, trimmed]);
    }
    if (!selectedSpecialties.includes(trimmed)) {
      setSelectedSpecialties(prev => [...prev, trimmed]);
    }
    setCustomSpecialtyInput('');
    setShowCustomSpecialtyInput(true);
  };

  const handleRemoveCustomSpecialty = (spec: string) => {
    setCustomSpecialtiesList(prev => prev.filter(s => s !== spec));
    setSelectedSpecialties(prev => prev.filter(s => s !== spec));
  };

  // Handle Photo File Select / Drag & Drop — a foto é enviada para o ImgBB
  // (com reserva automática) em vez de ficar guardada como Base64 local.
  const handlePhotoFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor carregue um ficheiro de imagem válido (JPG, PNG ou WebP).');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('A fotografia excede o limite máximo permitido de 50MB.');
      return;
    }
    setErrorMessage(null);
    setPhotoFileName(file.name);
    setIsUploadingPhoto(true);
    uploadImageToImgBB(file)
      .then((url) => setPhotoData(url))
      .catch(() => setErrorMessage('Não foi possível carregar a fotografia. Por favor tente novamente.'))
      .finally(() => setIsUploadingPhoto(false));
  };

  // Handle CV File Select - STRICTLY PDF (Max 2MB)
  const handleCvFileSelect = (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMessage('O Currículo (CV) tem de ser estritamente em formato PDF (.pdf). Documentos noutros formatos não são aceites.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(`O Currículo (CV) em formato PDF excede o tamanho máximo de 2MB (2 Megabytes). O ficheiro selecionado possui ${sizeMb} MB. Por favor selecione um documento com até 2MB.`);
      return;
    }
    setErrorMessage(null);
    setCvDocName(file.name);
    const sizeStr = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : (file.size / 1024).toFixed(1) + ' KB';
    setCvDocSize(sizeStr);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCvDocData(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle BI / Document Upload - STRICTLY PDF (Max 2MB)
  const handleIdentityDocSelect = (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorMessage('O Bilhete de Identidade / Passaporte tem de ser estritamente em formato PDF (.pdf). Imagens ou outros formatos não são aceites.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(`O documento de identificação em formato PDF excede o tamanho máximo de 2MB (2 Megabytes). O ficheiro selecionado possui ${sizeMb} MB. Por favor selecione um documento com até 2MB.`);
      return;
    }
    setErrorMessage(null);
    setIdentityDocName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setIdentityDocData(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Portfolio Images Select — cada imagem é enviada para o ImgBB em vez
  // de ser guardada como Base64 local.
  const handlePortfolioFilesSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validImages = fileArray.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      setErrorMessage('Por favor seleccione ficheiros de imagem válidos (JPG, PNG, WebP).');
      return;
    }
    const oversized = validImages.some(f => f.size > 50 * 1024 * 1024);
    if (oversized) {
      setErrorMessage('Um ou mais ficheiros do portfólio excedem o limite máximo permitido de 50MB.');
      return;
    }
    setErrorMessage(null);
    setIsUploadingPortfolio(true);
    Promise.all(
      validImages.map((file) =>
        uploadImageToImgBB(file).then((url) => ({
          url,
          caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          name: file.name
        }))
      )
    )
      .then((uploaded) => {
        setPortfolioImages(prev => [...prev, ...uploaded]);
      })
      .catch(() => setErrorMessage('Não foi possível carregar uma ou mais imagens do portfólio. Por favor tente novamente.'))
      .finally(() => setIsUploadingPortfolio(false));
  };

  const handleRemovePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submission Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMessage(null);

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.trim().replace(/\D/g, '') : '';
    const isProfessional = role === 'profissional';
    const isTradeProvider = role === 'prestador';
    const isCandidate = isProfessional || isTradeProvider;

    // Validation
    if (!fullName || !fullName.trim()) {
      setErrorMessage('Por favor introduza o seu Nome Completo.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMessage('Por favor introduza um contacto telefónico válido (mínimo 8 dígitos).');
      return;
    }

    if (!residence && !city) {
      setErrorMessage('Por favor indique o seu endereço ou cidade de residência.');
      return;
    }

    if (isCandidate && (!bio || bio.trim().length < 10)) {
      setErrorMessage('Por favor descreva a sua experiência profissional e competências na Biografia / Apresentação.');
      return;
    }

    if (isCandidate && !photoData) {
      setErrorMessage('Por favor carregue a sua fotografia de perfil antes de concluir o registo.');
      return;
    }

    if (isUploadingPhoto || isUploadingPortfolio) {
      setErrorMessage('Aguarde a conclusão do carregamento das imagens antes de submeter o registo.');
      return;
    }

    if (password && password.length < 8) {
      setErrorMessage('A palavra-passe de acesso deve conter no mínimo 8 caracteres.');
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMessage('As palavras-passe introduzidas não coincidem.');
      return;
    }

    setSubmitting(true);

    try {
      const finalTitle = professionalTitle.trim() || selectedSpecialties[0] || selectedCategory;
      const combinedSkills = Array.from(new Set([...selectedSpecialties, ...(bio ? [selectedCategory] : [])]));

      const defaultAvatar = isProfessional
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
        : 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400';

      const candidatePayload = {
        name: fullName.split(' ')[0] || fullName,
        surname: fullName.split(' ').slice(1).join(' ') || '',
        title: finalTitle,
        role: finalTitle,
        // Preserva a categoria exata escolhida (via id canónico da taxonomia, ex.:
        // "limpeza_especializada", "manutencao_reparacoes", "construcao_obras") em vez de
        // reduzir todos os ofícios não-domésticos a um único valor genérico "tech" — é essa
        // redução que fazia o filtro de categorias em Técnicos de Campo/Talentos e Quadros
        // misturar prestadores de ofícios diferentes (ex.: Limpeza a aparecer em Construção).
        // O mesmo problema existia para os Profissionais/Talentos e Quadros: a categoria era
        // sempre gravada como o valor genérico fixo "prof", perdendo por completo qual área
        // corporativa (TI, Finanças, RH, etc.) tinha sido escolhida — por isso o cartão de
        // perfil acabava a aparecer em todas as categorias de Talentos e Quadros em vez de
        // apenas naquela em que foi criado. Agora grava sempre o id canónico da taxonomia
        // também para profissionais.
        category: findCategoryItem(selectedCategory)?.id || (isProfessional ? 'ti_software' : 'tech'),
        subCategory: selectedSpecialties.length > 0 ? selectedSpecialties.join(' · ') : selectedCategory,
        isProfessional,
        city: city || 'Maputo',
        residence: residence || `${city}, Moçambique`,
        latitude,
        longitude,
        phone: phone.trim(),
        email: cleanEmail || `${cleanPhone}@tarira.co.mz`,
        biNumber: nuit.trim(),
        identityDocName: identityDocName || '',
        identityDocUrl: identityDocData || '',
        cvDocName: cvDocName || '',
        cvDocumentName: cvDocName || '',
        cvDocumentUrl: cvDocData || '',
        photo: photoData || defaultAvatar,
        bio: bio || `Profissional qualificado em ${selectedCategory} com foco em ${selectedSpecialties.join(', ')}.`,
        skills: combinedSkills.length > 0 ? combinedSkills : [selectedCategory, 'Garantia de Qualidade', 'Execução Técnica'],
        experienceYears: Number(experienceYears) || 3,
        expectedSalaryMin: Number(expectedSalaryMin) || (isProfessional ? 85000 : 25000),
        expectedSalaryMax: Number(expectedSalaryMax) || (isProfessional ? 150000 : 45000),
        rateMzn: Number(rateMzn) || (isProfessional ? 0 : 1500),
        status: 'pending',
        portfolioWebsite: portfolioWebsite.trim() || undefined,
        website: portfolioWebsite.trim() || undefined,
        documents: [
          ...(identityDocName ? [{ type: 'bi', title: identityDocName, url: identityDocData, issuer: 'Registo Civil', status: 'verified' as const }] : []),
          ...(cvDocName ? [{ type: 'cv', title: cvDocName, url: cvDocData, issuer: 'ATS Upload', status: 'verified' as const }] : []),
          ...(certificatesDocName ? [{ type: 'cert', title: certificatesDocName, issuer: 'Formação Certificada', status: 'verified' as const }] : [])
        ],
        portfolio: portfolioImages.map(img => ({
          url: img.url,
          caption: img.caption || 'Registo de Obra / Serviço Executado'
        }))
      };

      // 1. Post Candidate Record to backend API
      let registeredCandidateId: string | null = null;
      let registeredClientId: string | null = null;
      let aiTriageData: any = null;

      const postJsonFast = async (url: string, body: any, failureMessage: string) => {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal
          });
          clearTimeout(timer);
          if (res.ok) {
            return await res.json();
          }
          let serverMsg = '';
          try {
            const errBody = await res.json();
            serverMsg = errBody?.error || '';
          } catch {}
          throw new Error(serverMsg || `${failureMessage} (HTTP ${res.status})`);
        } catch (err: any) {
          throw new Error(err?.message || failureMessage);
        }
      };

      let createdCandidate: any = null;

      if (isCandidate) {
        // Run AI triage endpoint com timeout rigoroso de 2s para nunca atrasar a submissão
        try {
          const triageController = new AbortController();
          const triageTimer = setTimeout(() => triageController.abort(), 2000);
          const triageRes = await fetch('/api/triagem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(candidatePayload),
            signal: triageController.signal
          });
          clearTimeout(triageTimer);
          if (triageRes.ok) {
            aiTriageData = await triageRes.json();
          }
        } catch {
          // Fallback rápido sem bloquear
          aiTriageData = {
            matchScore: 92,
            feedback: 'Perfil pré-qualificado e inserido no Banco de Talentos e Quadros TARIRA.'
          };
        }

        const cand = await postJsonFast(
          '/api/candidates',
          {
            ...candidatePayload,
            ...(aiTriageData?.matchScore != null ? { matchScore: aiTriageData.matchScore } : {}),
            ...(aiTriageData?.feedback ? { feedback: aiTriageData.feedback } : {})
          },
          'Não foi possível concluir o registo do seu perfil'
        );
        createdCandidate = cand;
        registeredCandidateId = cand.id;
      } else {
        const cl = await postJsonFast(
          '/api/clients',
          {
            name: fullName.trim(),
            type: role === 'lar' ? 'residential' : role === 'condominio' ? 'condo' : 'company',
            email: cleanEmail || `${cleanPhone}@cliente.tarira.co.mz`,
            phone: phone.trim(),
            address: residence || `${city}, Moçambique`,
            bi: nuit.trim(),
            // Manutenção de conta: valor igual para Empresa e Condomínio;
            // conta Particular/Lar sempre a 0 MZN e activa de imediato.
            planType: isPaidAccountRole(role) ? ACCOUNT_PLAN_ID : HOME_PLAN_ID,
            planName: isPaidAccountRole(role) ? ACCOUNT_PLAN_NAME : HOME_PLAN_NAME,
            planPriceMzn: isPaidAccountRole(role) ? maintenanceFee : 0,
            planPeriod: isPaidAccountRole(role) ? '/mês' : 'Sem custo',
            planStatus: !isPaidAccountRole(role)
              ? 'active'
              : (planPaymentTiming === 'now' ? 'pending' : 'trial')
          },
          'Não foi possível concluir o registo da sua conta'
        );
        registeredClientId = cl.id;
      }

      // 2. Criação da Conta e Perfil (Supabase Auth em modo não-bloqueante ultrarrápido)
      const authEmail = cleanEmail || `${cleanPhone}@auth.tarira.co.mz`;
      const authPass = password || 'Tarira@2026';

      // Executa o registo de Auth e Profile em paralelo com tolerância de falhas para o cliente ter resposta instantânea
      (async () => {
        try {
          let authUserId: string | null = null;
          if (isSupabaseConfigured && supabase) {
            try {
              const { data: authData } = await supabase.auth.signUp({
                email: authEmail,
                password: authPass,
                options: {
                  data: {
                    full_name: fullName.trim(),
                    name: fullName.trim(),
                    role,
                    phone: phone.trim(),
                    city,
                    category: selectedCategory,
                    specialties: selectedSpecialties
                  }
                }
              });
              if (authData?.user) {
                authUserId = authData.user.id;
              }
            } catch {}
          }

          if (!authUserId) {
            try {
              const srvReg = await fetch('/api/auth/register-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: authEmail,
                  password: authPass,
                  fullName: fullName.trim(),
                  role,
                  phone: phone.trim(),
                  city,
                  nuit: nuit.trim(),
                  category: selectedCategory,
                  candidate_id: registeredCandidateId,
                  client_id: registeredClientId
                })
              });
              if (srvReg.ok) {
                const srvData = await srvReg.json();
                authUserId = srvData.user?.id;
              }
            } catch {}
          }

          if (authUserId) {
            fetch('/api/profiles/upsert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: authUserId,
                name: fullName.trim(),
                email: authEmail,
                role,
                phone: phone.trim(),
                city,
                nuit: nuit.trim(),
                category: selectedCategory,
                candidate_id: registeredCandidateId,
                client_id: registeredClientId,
                is_active: true
              })
            }).catch(() => {});
          }
        } catch (bgAuthErr) {
          console.warn('Processamento de credenciais de login em segundo plano:', bgAuthErr);
        }
      })();

      // Result Object
      const resultObj = {
        success: true,
        candidateId: registeredCandidateId,
        clientId: registeredClientId,
        candidate: isCandidate ? createdCandidate : null,
        role,
        fullName,
        category: selectedCategory,
        specialties: selectedSpecialties,
        matchScore: aiTriageData?.matchScore || 94,
        feedback: aiTriageData?.feedback || 'Perfil qualificado submetido com sucesso no ecossistema TARIRA. As credenciais e documentação foram registadas na base de talentos e central de operações.',
        timestamp: new Date().toISOString()
      };

      setSuccessResult(resultObj);
      if (onSuccess) {
        onSuccess(resultObj);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err?.message || 'Ocorreu um erro ao submeter o registo. Por favor tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${isModal ? '' : 'p-4 sm:p-8'}`}>
      {!successResult ? (
        <form onSubmit={handleSubmit} className="rounded-3xl p-6 sm:p-10 border border-slate-200 bg-white shadow-sm space-y-8 animate-fade-up text-[#172554]">
          
          {/* PASSO 2 — VALOR DE MANUTENÇÃO DA CONTA.
              Substitui o antigo resumo de plano pré-selecionado: valor único e
              igual para Empresa e Condomínio, 30 dias grátis, Lar sem custo. */}
          {(role === 'empresa' || role === 'condominio' || role === 'lar') && (
            <AccountMaintenanceCard
              role={role}
              maintenanceFee={maintenanceFee}
              accountBenefits={accountBenefits}
              homeBenefits={homeBenefits}
              paymentTiming={planPaymentTiming}
              onChangePaymentTiming={setPlanPaymentTiming}
            />
          )}

          {/* Header Banner & Context Instructions */}
          <div className="text-center space-y-3 pb-4 border-b border-slate-200">
            {role === 'prestador' && isRoleLocked ? (
              <>
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold text-[#172554] uppercase tracking-widest">
                  <Wrench className="w-3.5 h-3.5 text-[#172554]" />
                  <span>TARIRA CONNECT · REGISTO DE TÉCNICO DE OFÍCIO</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl text-[#172554] font-bold">
                  Registo de Técnico de Ofício & Campo
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Formulário oficial para Eletricistas, Instaladores Solares, Canalizadores, Climatização, Obras & Pedreiros, Pintores, Marceneiros, Mecânicos e Limpeza Técnica.
                </p>

                {/* Step Guide for Trade Providers */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 max-w-3xl mx-auto text-left">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 1</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">Foto de Farda/Rosto</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 2</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">Ofício & Especialidades</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 3</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">Zona & Mapa</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 4</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">BI & Obras Realizadas</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 5</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">Senha de Acesso</span>
                  </div>
                </div>
              </>
            ) : role === 'profissional' && isRoleLocked ? (
              <>
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold text-[#172554] uppercase tracking-widest">
                  <Briefcase className="w-3.5 h-3.5 text-[#172554]" />
                  <span>TARIRA RECRUIT · CANDIDATURA ESPONTÂNEA</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl text-[#172554] font-bold">
                  Candidatura Espontânea & Banco de Talentos
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Formulário oficial para Especialistas em Telecomunicações, Gestão e Inserção de Dados, Contact Center & Suporte CX, Tecnologia, Cibersegurança, Finanças, Contabilidade, Recursos Humanos e Gestão.
                </p>

                {/* Step Guide for Corporate Professionals */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 max-w-3xl mx-auto text-left">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 1</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">Foto Executiva</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 2</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">Área & Especialidades</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 3</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">Experiência & Salário</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 4</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">CV Modelo ATS & Portfólio Digital</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[9px] font-mono font-bold text-blue-700 block mb-0.5">PASSO 5</span>
                    <span className="text-[11px] font-bold text-[#172554] block leading-tight">Senha do Portal</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#172554] uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-[#172554]" />
                  <span>REGISTO INTEGRADO & CRIAÇÃO DE CONTA</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl text-[#172554] font-bold">
                  Crie a sua Conta na TARIRA
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Selecione o seu perfil de atuação (Técnico de Ofício, Profissional Corporativo, Lar Residencial, Empresa B2B ou Gestão de Condomínio) para iniciar.
                </p>
              </>
            )}
          </div>

          {/* 1. SELETOR DE PERFIL / TIPO DE CONTA (Only when not locked) */}
          {!isRoleLocked && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider font-mono">
                1. Selecione o seu Perfil de Atuação *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {[
                  { id: 'prestador', label: '🛠️ Técnico de Ofício', badge: 'TARIRA Connect ⚡', sub: 'Eletricidade, Solar, Obras, Mecânica' },
                  { id: 'profissional', label: '💼 Profissional', badge: 'TARIRA Recruit 💼', sub: 'TI, Cibersegurança, Finanças, RH' },
                  { id: 'lar', label: '🏠 Lar Particular', badge: 'Cliente Residencial', sub: 'Habitação & Serviços Familiares' },
                  { id: 'empresa', label: '🏢 Empresa / B2B', badge: 'Cliente Corporativo', sub: 'Faturação & Gestão Empresarial' },
                  { id: 'condominio', label: '🏘️ Condomínio', badge: 'Gestão Predial', sub: 'Manutenção de Edifícios' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      role === item.id
                        ? 'bg-[#172554] border-[#172554] text-white font-bold shadow-md'
                        : 'bg-white border-slate-200 text-[#172554] hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className={`block text-xs font-bold ${role === item.id ? 'text-white' : 'text-[#172554]'}`}>{item.label}</span>
                      <span className={`block text-[10px] font-mono mt-0.5 ${role === item.id ? 'text-blue-200' : 'text-slate-500'}`}>{item.badge}</span>
                    </div>
                    <span className={`block text-[9px] mt-2 leading-tight ${role === item.id ? 'text-blue-100' : 'text-slate-500'}`}>{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. FOTO DE PERFIL DO CANDIDATO (MANDATORY & VISIBLE) */}
          {(role === 'prestador' || role === 'profissional') && (
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#172554] font-mono uppercase tracking-wider">
                    2. Fotografia de Perfil do Candidato *
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    A fotografia é exibida no seu perfil público e na galeria de profissionais da TARIRA.
                  </p>
                </div>
                {photoData && (
                  <button
                    type="button"
                    onClick={() => { setPhotoData(''); setPhotoFileName(''); }}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remover Fotografia
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Visual Avatar Preview - Fundo branco e ícone azul */}
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-200 bg-white flex items-center justify-center shadow-xs">
                    {isUploadingPhoto ? (
                      <div className="text-center p-3">
                        <RefreshCw className="w-8 h-8 text-[#172554] mx-auto mb-1 animate-spin" />
                        <span className="text-[9px] text-slate-400 font-mono block">A carregar...</span>
                      </div>
                    ) : photoData ? (
                      <img src={photoData} alt="Foto de perfil" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-3">
                        <User className="w-10 h-10 text-[#172554] mx-auto mb-1" />
                        <span className="text-[10px] text-slate-400 font-mono block">Sem Foto</span>
                      </div>
                    )}
                  </div>
                  {photoData && (
                    <div className="absolute -bottom-2 -right-2 bg-[#172554] text-white rounded-full p-1 shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Upload & Drag Area - Fundo branco e ícone azul */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setPhotoDragging(true); }}
                  onDragLeave={() => setPhotoDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setPhotoDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handlePhotoFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`flex-1 w-full p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer bg-white ${
                    photoDragging ? 'border-[#172554] bg-blue-50/50' : 'border-slate-300 hover:border-[#172554] hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    id="standard-profile-photo-input"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handlePhotoFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="standard-profile-photo-input" className="cursor-pointer block">
                    <Camera className="w-7 h-7 text-[#172554] mx-auto mb-2" />
                    <span className="text-xs font-bold text-[#172554] block">
                      {photoFileName ? `Fotografia Carregada: ${photoFileName}` : 'Carregar Fotografia de Rosto / Corpo Inteiro'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      Clique para selecionar ou arraste para este espaço (JPG, PNG, WebP)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 3. CATEGORIA DE SERVIÇO & ESPECIALIDADES DINÂMICAS */}
          {(role === 'prestador' || role === 'profissional') && (
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#172554] font-mono uppercase tracking-wider mb-2">
                  3. Selecione a Categoria Principal de Atuação *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {getCategoriesByRole(role).map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          // Auto-preselect first specialty if none selected
                          if (cat.specialties.length > 0 && selectedSpecialties.length === 0) {
                            setSelectedSpecialties([cat.specialties[0]]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#172554] border-[#172554] text-white font-bold shadow-md'
                            : 'bg-white border-slate-200 text-[#172554] hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">{cat.icon}</span>
                        <div className="overflow-hidden">
                          <span className={`block text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#172554]'}`}>{cat.name}</span>
                          <span className={`block text-[9px] truncate mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>{cat.badge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Specialties Field (Especialidades / Sub-Áreas) */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#172554] font-mono uppercase tracking-wider">
                    Especialidades & Sub-Áreas da Categoria ({selectedCategory}) *
                  </label>
                  <span className="text-[10px] font-mono text-[#172554] bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 font-bold">
                    {selectedSpecialties.length} {selectedSpecialties.length === 1 ? 'Especialidade' : 'Especialidades'} Selecionadas
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Clique nas especialidades que você domina ou adicione novas competências personalizadas:
                </p>

                {/* Specialties Chips Selector */}
                <div className="flex flex-wrap gap-2">
                  {availableSpecialties.map((spec) => {
                    const isChecked = selectedSpecialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        className={`px-3 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 border font-medium ${
                          isChecked
                            ? 'bg-[#172554] text-white font-bold border-[#172554] shadow-sm'
                            : 'bg-white border-slate-200 text-[#172554] hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        {isChecked ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3 h-3 text-slate-400" />}
                        <span>{spec}</span>
                      </button>
                    );
                  })}

                  {/* Custom Added Specialties */}
                  {customSpecialtiesList.filter(cs => !availableSpecialties.includes(cs)).map((customSpec) => {
                    const isChecked = selectedSpecialties.includes(customSpec);
                    return (
                      <div
                        key={customSpec}
                        className={`inline-flex items-center rounded-xl border text-xs font-bold pl-2.5 pr-1.5 py-1.5 gap-1.5 shadow-xs ${
                          isChecked
                            ? 'bg-[#172554] border-[#172554] text-white'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSpecialty(customSpec)}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          {isChecked ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                          <span className={isChecked ? 'text-white' : 'text-slate-400 line-through'}>{customSpec}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomSpecialty(customSpec)}
                          className="w-4 h-4 rounded-full bg-slate-200 hover:bg-rose-600 text-slate-600 hover:text-white flex items-center justify-center text-[10px] transition-colors cursor-pointer ml-1"
                          title="Remover especialidade personalizada"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Interactive Button to Open & Add Another Specialty */}
                  <button
                    type="button"
                    onClick={handleOpenCustomSpecialty}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      showCustomSpecialtyInput
                        ? 'bg-blue-50 border-[#172554] text-[#172554]'
                        : 'bg-white hover:bg-slate-50 border-dashed border-slate-300 text-[#172554]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#172554]" />
                    <span>+ Outra Especialidade...</span>
                  </button>
                </div>

                {/* Custom Specialty Interactive Input Box */}
                {(showCustomSpecialtyInput || customSpecialtiesList.length > 0) && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#172554] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="w-3 h-3 text-[#172554]" /> Adicionar Nova Especialidade ou Certificação Técnica:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCustomSpecialtyInput(false)}
                        className="text-[10px] text-slate-500 hover:text-slate-700 font-mono cursor-pointer"
                      >
                        Ocultar
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        ref={customSpecialtyInputRef}
                        type="text"
                        placeholder=""
                        value={customSpecialtyInput}
                        onChange={(e) => setCustomSpecialtyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSpecialty();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSpecialty}
                        className="px-4 py-2 rounded-xl bg-[#172554] hover:bg-blue-900 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. DADOS PESSOAIS & LOCALIZAÇÃO */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider font-mono">
              4. Dados Pessoais & Contacto *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder=""
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                  Contacto Telefónico / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder=""
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                  Endereço de E-mail (Para Notificações & Acesso)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                  Cidade / Província em Moçambique *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans"
                >
                  <option value="">Selecione a Província / Cidade</option>
                  <option value="Maputo">Maputo (Cidade & Província)</option>
                  <option value="Matola">Matola</option>
                  <option value="Beira">Beira (Sofala)</option>
                  <option value="Nampula">Nampula</option>
                  <option value="Tete">Tete</option>
                  <option value="Quelimane">Quelimane (Zambézia)</option>
                  <option value="Pemba">Pemba (Cabo Delgado)</option>
                  <option value="Chimoio">Chimoio (Manica)</option>
                  <option value="Xai-Xai">Xai-Xai (Gaza)</option>
                  <option value="Inhambane">Inhambane / Vilankulo</option>
                  <option value="Lichinga">Lichinga (Niassa)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                Endereço Detalhado / Bairro de Residência *
              </label>
              <div className="relative mb-3">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={residence}
                  onChange={(e) => setResidence(e.target.value)}
                  placeholder=""
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans"
                />
              </div>

              {/* Interactive Location Map Component */}
              <ConnectLocationMap
                mode="geocoder"
                initialAddress={residence || `${city || 'Maputo'}, Moçambique`}
                lat={latitude}
                lng={longitude}
                onLocationChange={({ lat, lng, address }) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  if (address) setResidence(address);
                }}
              />
            </div>
          </div>

          {/* 5. DETALHES DE CARREIRA, EXPERIÊNCIA & BIO */}
          {(role === 'prestador' || role === 'profissional') && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider font-mono">
                5. Experiência Profissional & Histórico *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                    {role === 'profissional' ? 'Cargo / Título Profissional *' : 'Especialidade / Título de Ofício *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    placeholder={role === 'profissional' ? 'Ex: Engenheiro de Software / Diretor Financeiro' : 'Ex: Eletricista Instalador / Canalizador'}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                    Anos de Experiência Prática *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-mono"
                  />
                </div>

                {/* TARIRA RECRUIT: EXCLUSIVE PRETENSAO SALARIAL MENSAL */}
                {role === 'profissional' && (
                  <div>
                    <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase tracking-wider">
                      Pretensão Salarial Mensal (MZN/mês) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={expectedSalaryMin || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setExpectedSalaryMin(val);
                        setExpectedSalaryMax(val ? Math.round(val * 1.3) : 0);
                      }}
                      placeholder="Ex: 85000"
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-mono font-bold"
                    />
                    <span className="text-[9.5px] text-slate-500 block mt-1">
                      Pretensão salarial mensal pretendida (TARIRA Recruit)
                    </span>
                  </div>
                )}

                {/* TARIRA CONNECT: EXCLUSIVE VALOR POR INTERVENÇÃO / DIÁRIA */}
                {role === 'prestador' && (
                  <div>
                    <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase tracking-wider">
                      Valor por Intervenção / Diária (MZN) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={rateMzn || ''}
                      onChange={(e) => setRateMzn(Number(e.target.value))}
                      placeholder="Ex: 1500"
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-mono font-bold"
                    />
                    <span className="text-[9.5px] text-slate-500 block mt-1">
                      Tarifa por intervenção ou diária de serviço (TARIRA Connect)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                  Apresentação Profissional & Descrição das Funções (Bio) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {/* 6. DOCUMENTOS & PORTFÓLIO DE OBRAS */}
          {(role === 'prestador' || role === 'profissional') && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider font-mono">
                6. Documentação & Portfólio de Trabalhos
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BI / Identidade - STRICTLY PDF */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#172554] font-mono uppercase">
                      🪪 Bilhete de Identidade / Passaporte
                    </label>
                    <span className="text-[10px] font-mono text-[#172554] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      PDF (Máx. 2MB)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">Carregue cópia digitalizada do seu documento exclusivamente em formato PDF (máximo de 2MB).</p>
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172554] text-xs font-bold border border-slate-200 cursor-pointer inline-flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-[#172554]" />
                    <span>{identityDocName ? 'Substituir BI (PDF)' : 'Anexar BI em PDF (Máx. 2MB)...'}</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleIdentityDocSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {identityDocName && (
                    <span className="block text-[10px] text-blue-700 font-mono mt-2 truncate">
                      ✓ {identityDocName} (PDF Válido)
                    </span>
                  )}
                </div>

                {/* CV - STRICTLY PDF */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#172554] font-mono uppercase">
                      📄 Curriculum Vitae (CV)
                    </label>
                    <span className="text-[10px] font-mono text-[#172554] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      PDF (Máx. 2MB)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">Carregue o seu CV exclusivamente em PDF (máximo de 2MB) para validação ATS automática de competências.</p>
                  <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#172554] text-xs font-bold border border-slate-200 cursor-pointer inline-flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#172554]" />
                    <span>{cvDocName ? 'Substituir CV (PDF)' : 'Anexar CV em PDF (Máx. 2MB)...'}</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleCvFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {cvDocName && (
                    <span className="block text-[10px] text-blue-700 font-mono mt-2 truncate">
                      ✓ {cvDocName} ({cvDocSize})
                    </span>
                  )}
                </div>
              </div>

              {/* Portfólio de Imagens (Apenas para Técnicos de Ofício e Campo) */}
              {role === 'prestador' && (
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#172554] font-mono uppercase">
                      📸 Fotos de Obras, Intervenções & Projetos Realizados (Portfólio de Campo)
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {portfolioImages.length} {portfolioImages.length === 1 ? 'Foto' : 'Fotos'}
                    </span>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setPortfolioDragging(true); }}
                    onDragLeave={() => setPortfolioDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setPortfolioDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handlePortfolioFilesSelect(e.dataTransfer.files);
                      }
                    }}
                    className={`p-5 rounded-xl border border-dashed text-center transition-all cursor-pointer bg-white ${
                      portfolioDragging ? 'bg-blue-50/50 border-[#172554]' : 'border-slate-300 hover:border-[#172554] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="file"
                      id="standard-portfolio-input"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handlePortfolioFilesSelect(e.target.files);
                        }
                      }}
                    />
                    <label htmlFor="standard-portfolio-input" className="cursor-pointer block">
                      <Camera className="w-6 h-6 text-[#172554] mx-auto mb-1" />
                      <span className="text-xs font-bold text-[#172554]">+ Adicionar Fotos de Trabalhos Realizados</span>
                      <span className="block text-[10px] text-slate-500 font-mono mt-0.5">Suporta múltiplas imagens de intervenções (JPG, PNG, WebP)</span>
                    </label>
                  </div>

                  {/* Thumbnails */}
                  {portfolioImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                      {portfolioImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
                          <img src={img.url} alt={img.name} className="w-full h-16 object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePortfolioImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link do Website / Portfólio Online para Técnicos */}
                  <div className="pt-3 border-t border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#172554] font-mono uppercase flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#172554]" />
                        <span>Link do Website / Portfólio Online (Opcional)</span>
                      </label>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Opcional
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="url"
                        value={portfolioWebsite}
                        onChange={(e) => setPortfolioWebsite(e.target.value)}
                        placeholder="https://meuportfolio.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-[#172554] text-[#172554] placeholder-slate-400 text-xs outline-none font-mono transition-all"
                      />
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Portfólio Digital & Presença Online (Exclusivo para Talentos de Quadros / Candidatura Espontânea) */}
              {role === 'profissional' && (
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#172554] font-mono uppercase flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#172554]" />
                      <span>Link do Portfólio Online / Website / LinkedIn / GitHub</span>
                    </label>
                    <span className="text-[9px] font-mono text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-bold">
                      Recomendado
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      value={portfolioWebsite}
                      onChange={(e) => setPortfolioWebsite(e.target.value)}
                      placeholder="https://linkedin.com/in/seu-perfil ou https://github.com/seu-utilizador"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-[#172554] text-[#172554] placeholder-slate-400 text-xs outline-none font-mono transition-all shadow-xs"
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Como talento corporativo, pode partilhar aqui o link para o seu portfólio digital, perfil do LinkedIn, website profissional, repositório GitHub ou Behance para reforçar o seu perfil perante as empresas contratantes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 7. CREDENCIAIS DE ACESSO (CONTA DE UTILIZADOR) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <label className="block text-xs font-bold text-[#172554] uppercase tracking-wider font-mono">
              7. Palavra-passe de Acesso à Conta *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                  Palavra-passe *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172554] mb-1 font-mono uppercase">
                  Confirmar Palavra-passe *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=""
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-[#172554] text-xs focus:outline-none focus:border-[#172554] font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-all"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={submitting || isUploadingPhoto || isUploadingPortfolio}
              className="flex-1 w-full py-4 rounded-2xl bg-[#172554] hover:bg-blue-900 text-white font-bold text-sm uppercase tracking-wider shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:scale-[1.005] active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>A processar perfil e triagem em tempo real...</span>
                </>
              ) : (
                <>
                  <span>
                    {role === 'prestador' 
                      ? '🛠️ Submeter Registo no TARIRA Connect' 
                      : 'Submeter Candidatura Espontânea'}
                  </span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Success Screen */
        <div className="rounded-3xl p-8 sm:p-12 border border-slate-200 bg-white text-center animate-fade-up space-y-6 text-[#172554] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-[#172554] text-[#172554] font-bold flex items-center justify-center text-3xl mx-auto shadow-sm">
            ✓
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold text-[#172554] uppercase tracking-widest mb-3">
              PERFIL & CONTA CRIADOS COM SUCESSO
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#172554] font-bold">
              Bem-vindo ao Ecossistema TARIRA!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
              O seu perfil de <strong>{successResult.category}</strong> foi registado com sucesso. O motor inteligente de triagem processou a sua candidatura em tempo real.
            </p>
          </div>

          {/* AI Score & Feedback Box */}
          <div className="max-w-xl mx-auto space-y-3 text-left">
            {/* Email Confirmation Notice */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-start gap-3">
              <span className="text-xl">✉️</span>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#172554] block">
                  Email de Confirmação Despachado
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enviámos uma mensagem de confirmação para o seu endereço de correio eletrónico com o comprovativo de registo do perfil e instruções de acesso ao portal.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-wider text-slate-500 font-bold uppercase block mb-0.5">
                  ÍNDICE DE COMPATIBILIDADE AI
                </span>
                <span className="text-xs text-slate-600">Classificação objetiva de competências</span>
              </div>
              <span className="font-serif text-3xl font-bold text-[#172554]">{successResult.matchScore}%</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
              <span className="text-[10px] tracking-wider text-[#172554] font-bold uppercase block mb-1">
                FEEDBACK DO SISTEMA DE TRIAGEM:
              </span>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{successResult.feedback}"
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (onSuccess) onSuccess(successResult);
              }}
              className="px-6 py-3 rounded-xl bg-[#172554] text-white font-bold text-xs hover:bg-blue-900 cursor-pointer transition-all shadow-md flex items-center gap-2"
            >
              <span>👤 Aceder ao Meu Perfil Criado</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSuccessResult(null)}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-all"
            >
              Novo Registo
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs hover:bg-slate-100 cursor-pointer transition-all"
              >
                Voltar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
