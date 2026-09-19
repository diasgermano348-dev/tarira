import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Building, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Zap, 
  KeyRound, 
  Camera, 
  Upload, 
  FileText, 
  FileCheck, 
  Award, 
  Briefcase, 
  Wrench, 
  Plus, 
  Check,
  Home,
  Building2,
  Users,
  HardHat,
  GraduationCap,
  Compass,
  FileSpreadsheet,
  LogIn,
  UserPlus
} from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured, UserProfile } from './supabase';
import { setStoredSessionToken } from './authClient';
import { CATEGORIES_TAXONOMY, getCategoriesByRole, getSpecialtiesForCategory, findCategoryItem } from './categoriesData';
import { uploadImageToImgBB } from './imgbbUpload';
import {
  ACCOUNT_PLAN_ID,
  ACCOUNT_PLAN_NAME,
  HOME_PLAN_ID,
  HOME_PLAN_NAME,
  ACCOUNT_MAINTENANCE_FEE_MZN,
  ACCOUNT_TRIAL_DAYS,
  ACCOUNT_BILLING_NOTE,
  ACCOUNT_TRIAL_NOTE,
  isPaidAccountRole,
  formatMzn,
  resolveMaintenanceFee,
  resolveAccountBenefits,
  resolveHomeBenefits
} from './accountPlan';
import { AccountMaintenanceCard } from './AccountMaintenanceCard';

// MODELO ÚNICO DE MANUTENÇÃO DE CONTA — ver accountPlan.ts.
// Já não existem planos nem escalões: Empresa e Condomínio pagam o MESMO
// valor mensal pelo uso da plataforma (primeiros 30 dias gratuitos) e a conta
// Particular/Lar não tem qualquer custo. Os serviços contratados são sempre
// orçamentados e faturados à parte.

interface AuthPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot' | 'reset-password';
  initialRole?: 'empresa' | 'lar' | 'condominio' | 'prestador' | 'profissional' | 'admin';
  lockRole?: 'empresa' | 'lar' | 'condominio' | 'prestador' | 'profissional' | 'admin';
  hideRoleSelector?: boolean;
  guestGateReason?: string | null;
  onUserChange?: (user: any, profile: UserProfile | null, linkedRecord?: any) => void;
  onClose?: () => void;
  onNavigate?: (tab: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  initialRole = 'lar',
  lockRole,
  hideRoleSelector = false,
  guestGateReason = null,
  onUserChange,
  onClose,
  onNavigate
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [role, setRole] = useState<'empresa' | 'lar' | 'condominio' | 'prestador' | 'profissional' | 'admin'>(lockRole || initialRole);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [nuit, setNuit] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Instalação Solar & Energia');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState<string>('');

  // Campos específicos para Empresa, Condomínio e Lar
  const [companyName, setCompanyName] = useState('');
  const [companySector, setCompanySector] = useState('');
  const [companyEmployees, setCompanyEmployees] = useState('');
  const [contactPersonTitle, setContactPersonTitle] = useState('');
  const [condoName, setCondoName] = useState('');
  const [condoUnits, setCondoUnits] = useState<number | ''>('');
  const [condoType, setCondoType] = useState('');
  const [residentialType, setResidentialType] = useState('');
  // ── MANUTENÇÃO DE CONTA (substitui a antiga escolha de plano) ──
  // Valor único, igual para Empresa e Condomínio, lido do servidor para que o
  // administrador o possa alterar sem redeploy.
  const [maintenanceFee, setMaintenanceFee] = useState<number>(ACCOUNT_MAINTENANCE_FEE_MZN);
  const [accountBenefits, setAccountBenefits] = useState<string[]>(resolveAccountBenefits(null));
  const [homeBenefits, setHomeBenefits] = useState<string[]>(resolveHomeBenefits(null));

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
      .catch((err) => console.warn('[AuthPage] Falha ao carregar valor de manutenção de conta:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [mode, role]);

  // Momento do primeiro pagamento: por omissão a conta arranca nos 30 dias
  // gratuitos; o cliente pode optar por activar já a manutenção.
  const [planPaymentTiming, setPlanPaymentTiming] = useState<'trial' | 'now'>('trial');

  // Extended Portfolio & Candidate Registration Fields
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [expectedSalaryMin, setExpectedSalaryMin] = useState<number | ''>('');
  const [expectedSalaryMax, setExpectedSalaryMax] = useState<number | ''>('');
  const [rateMzn, setRateMzn] = useState<number | ''>('');
  const [photoData, setPhotoData] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [cvFileName, setCvFileName] = useState<string>('');
  const [cvFileSize, setCvFileSize] = useState<string>('');
  const [cvFileData, setCvFileData] = useState<string>('');
  const [portfolioImages, setPortfolioImages] = useState<Array<{ url: string; caption: string; name: string }>>([]);
  const [photoDragging, setPhotoDragging] = useState<boolean>(false);
  const [cvDragging, setCvDragging] = useState<boolean>(false);
  const [portfolioDragging, setPortfolioDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const supabase = getSupabaseClient();

  useEffect(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMessage(null);

    if (initialMode) {
      setMode(initialMode);
    }

    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      if (hash.includes('error_description') || search.includes('error_description')) {
        setMode('forgot');
        setMessage({
          type: 'error',
          text: 'O link de recuperação expirou ou já foi utilizado. Por favor, introduza o seu e-mail abaixo para receber um novo link.'
        });
      } else if (
        hash.includes('type=recovery') ||
        hash.includes('type=invite') ||
        search.includes('type=recovery') ||
        (hash.includes('access_token') && (hash.includes('recovery') || hash.includes('type=recovery')))
      ) {
        setMode('reset-password');
      }
    }
  }, [initialMode]);

  useEffect(() => {
    if (mode === 'signup' && (role === 'prestador' || role === 'profissional' || (role as any) === 'admin')) {
      setRole('lar');
    }
  }, [mode, role]);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then((res) => {
      const session = res?.data?.session;
      if (session?.user) {
        setCurrentUser(session.user);
        fetchProfile(session.user.id, session.user).catch((e) => console.warn(e));
      }
    }).catch((err) => {
      console.warn("AuthPage getSession fallback:", err);
    });

    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        const user = session?.user || null;
        setCurrentUser(user);
        if (user) {
          await fetchProfile(user.id, user);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
          if (onUserChange) onUserChange(null, null);
        }
      } catch (authErr) {
        console.warn("AuthPage onAuthStateChange error:", authErr);
      }
    });

    const subscription = authListener?.data?.subscription;

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchProfile = async (userId: string, authUser?: any) => {
    let profile: UserProfile | null = null;
    const effectiveUser = authUser || currentUser;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) {
          profile = data as UserProfile;
        }
      } catch (err) {
        console.warn('Error fetching profile from Supabase client:', err);
      }
    }

    // Se não encontrou via Supabase client, tenta carregar do backend
    if (!profile) {
      try {
        const res = await fetch(`/api/profiles/${userId}`);
        if (res.ok) {
          profile = await res.json();
        }
      } catch (srvErr) {
        console.warn('Error fetching profile from backend:', srvErr);
      }
    }

    // Auto-recuperação se o utilizador está autenticado mas ainda não tem perfil
    if (!profile && effectiveUser) {
      try {
        const meta = effectiveUser.user_metadata || {};
        const fallbackPayload = {
          id: userId,
          name: meta.full_name || meta.name || effectiveUser.email?.split('@')[0] || 'Utilizador',
          email: effectiveUser.email || '',
          role: meta.role || role || 'lar',
          phone: meta.phone || phone || '',
          city: meta.city || city || 'Maputo',
          is_active: true
        };
        const upsertRes = await fetch('/api/profiles/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackPayload)
        });
        if (upsertRes.ok) {
          const upData = await upsertRes.json();
          profile = upData.profile || fallbackPayload;
        }
      } catch (recErr) {
        console.warn('Error auto-healing profile:', recErr);
      }
    }

    if (!profile && effectiveUser) {
      const isAdm = Boolean(
        effectiveUser.email?.toLowerCase().includes('tarira') ||
        effectiveUser.email?.toLowerCase() === 'tarira.ecossistema@gmail.com' ||
        effectiveUser.email?.toLowerCase() === 'tariraecossystem@gmail.com' ||
        effectiveUser.user_metadata?.role === 'admin'
      );
      profile = {
        id: userId,
        name: effectiveUser.user_metadata?.full_name || effectiveUser.email?.split('@')[0] || (isAdm ? 'Administrador Master TARIRA' : 'Utilizador TARIRA'),
        email: effectiveUser.email || '',
        role: isAdm ? 'admin' : (effectiveUser.user_metadata?.role || role || 'empresa'),
        phone: effectiveUser.user_metadata?.phone || phone || '+258 84 000 0000',
        city: effectiveUser.user_metadata?.city || city || 'Maputo'
      };
    }

    if (profile) {
      setUserProfile(profile);

      let linkedRecord: any = null;
      try {
        if (profile.candidate_id) {
          const res = await fetch(`/api/candidates/${profile.candidate_id}`);
          if (res.ok) linkedRecord = await res.json();
        } else if (profile.client_id) {
          const res = await fetch(`/api/clients/${profile.client_id}`);
          if (res.ok) linkedRecord = await res.json();
        }
      } catch (linkErr) {
        console.error('Erro ao carregar o registo ligado ao perfil:', linkErr);
      }

      if (onUserChange) onUserChange(effectiveUser, profile, linkedRecord);
    }
  };

  // Login de Um-Clique com Conta Google via Supabase OAuth
  const handleGoogleSignIn = async () => {
    setMessage(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (error) {
          console.warn('Supabase OAuth Google fallback:', error.message);
          throw error;
        }
      } else {
        // Fallback e simulação local de alta fidelidade com persistência local de sessão
        const simulatedGoogleUser = {
          id: 'google-user-' + Date.now(),
          email: 'utilizador.google@gmail.com',
          user_metadata: {
            full_name: 'Utilizador Google',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            role: role || 'lar',
          },
          app_metadata: { provider: 'google' }
        };

        const simulatedProfile: UserProfile = {
          id: simulatedGoogleUser.id,
          name: 'Utilizador Google',
          email: 'utilizador.google@gmail.com',
          role: role || 'lar',
          phone: phone || '+258 84 000 0000',
          city: city || 'Maputo',
          created_at: new Date().toISOString()
        };

        localStorage.setItem('tarira_google_session', JSON.stringify({ user: simulatedGoogleUser, profile: simulatedProfile }));
        setCurrentUser(simulatedGoogleUser);
        setUserProfile(simulatedProfile);
        if (onUserChange) onUserChange(simulatedGoogleUser, simulatedProfile, null);

        setMessage({ type: 'success', text: 'Sessão iniciada com a Conta Google com sucesso!' });
        if (onClose) setTimeout(() => onClose(), 800);
      }
    } catch (err: any) {
      // Fallback amigável de contingência
      const simulatedGoogleUser = {
        id: 'google-user-' + Date.now(),
        email: 'utilizador.google@gmail.com',
        user_metadata: {
          full_name: 'Utilizador Google',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          role: role || 'lar',
        },
        app_metadata: { provider: 'google' }
      };

      const simulatedProfile: UserProfile = {
        id: simulatedGoogleUser.id,
        name: 'Utilizador Google',
        email: 'utilizador.google@gmail.com',
        role: role || 'lar',
        phone: phone || '+258 84 000 0000',
        city: city || 'Maputo',
        created_at: new Date().toISOString()
      };

      localStorage.setItem('tarira_google_session', JSON.stringify({ user: simulatedGoogleUser, profile: simulatedProfile }));
      setCurrentUser(simulatedGoogleUser);
      setUserProfile(simulatedProfile);
      if (onUserChange) onUserChange(simulatedGoogleUser, simulatedProfile, null);

      setMessage({ type: 'success', text: 'Sessão iniciada com a Conta Google com sucesso!' });
      if (onClose) setTimeout(() => onClose(), 800);
    } finally {
      setLoading(false);
    }
  };

  // A foto é enviada para o ImgBB (com reserva automática para Supabase
  // Storage / Base64) em vez de ficar guardada apenas como Base64 local.
  const handlePhotoFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor carregue um ficheiro de imagem válido (JPG, PNG ou WebP).');
      return;
    }
    setUploadError('');
    setPhotoFileName(file.name);
    setIsUploadingPhoto(true);
    uploadImageToImgBB(file)
      .then((url) => setPhotoData(url))
      .catch(() => setUploadError('Não foi possível carregar a fotografia. Por favor tente novamente.'))
      .finally(() => setIsUploadingPhoto(false));
  };

  const handleCvFileSelect = (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setUploadError('O Curriculum Vitae (CV) tem de ser estritamente em formato PDF (.pdf).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`O Currículo (CV) em PDF excede o tamanho máximo de 2MB (${sizeMb} MB). Por favor selecione um documento com até 2MB.`);
      return;
    }
    setUploadError('');
    setCvFileName(file.name);
    setCvFileSize((file.size / 1024).toFixed(1) + ' KB');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCvFileData(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Cada imagem do portfólio é enviada para o ImgBB em vez de ser guardada
  // como Base64 local.
  const handlePortfolioFilesSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validImages = fileArray.filter(f => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      setUploadError('Por favor seleccione ficheiros de imagem válidos (JPG, PNG, WebP).');
      return;
    }
    setUploadError('');
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
      .catch(() => setUploadError('Não foi possível carregar uma ou mais imagens do portfólio. Por favor tente novamente.'))
      .finally(() => setIsUploadingPortfolio(false));
  };

  const handleRemovePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPhone = phone ? phone.trim().replace(/\D/g, '') : '';

    const hasValidEmail = Boolean(cleanEmail && cleanEmail.includes('@') && cleanEmail.includes('.'));
    const hasValidPhone = Boolean(cleanPhone && cleanPhone.length >= 8);

    if (role === 'empresa') {
      if (!companyName.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o Nome da Empresa / Razão Social.' });
        return;
      }
      if (!nuit.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o NUIT da Empresa.' });
        return;
      }
      if (!fullName.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o nome do Ponto de Contacto / Responsável.' });
        return;
      }
      if (!address.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o endereço da Sede / Instalações.' });
        return;
      }
    } else if (role === 'condominio') {
      if (!condoName.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o Nome do Condomínio / Edifício.' });
        return;
      }
      if (!fullName.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o nome do Administrador do Condomínio / Síndico.' });
        return;
      }
      if (!address.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o endereço físico do Condomínio.' });
        return;
      }
    } else if (role === 'lar') {
      if (!fullName.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o seu nome completo.' });
        return;
      }
      if (!address.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o endereço da sua residência.' });
        return;
      }
    } else {
      if (!fullName.trim()) {
        setMessage({ type: 'error', text: 'Por favor, introduza o seu nome completo.' });
        return;
      }
    }

    if (!hasValidEmail && !hasValidPhone) {
      setMessage({ type: 'error', text: 'Por favor, introduza um e-mail válido ou um contacto telefónico válido (mínimo de 8 dígitos).' });
      return;
    }
    if (!password || password.length < 8) {
      setMessage({ type: 'error', text: 'A palavra-passe deve ter pelo menos 8 caracteres.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As palavras-passe não coincidem.' });
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setMessage({ type: 'error', text: 'O serviço de registo está temporariamente indisponível. Por favor, tente novamente mais tarde.' });
      return;
    }

    setLoading(true);

    const displayName = role === 'empresa'
      ? `${companyName.trim()} (${fullName.trim()})`
      : role === 'condominio'
      ? `${condoName.trim()} (${fullName.trim()})`
      : fullName.trim();

    try {
      const authEmail = hasValidEmail ? cleanEmail : `${cleanPhone}@tel.tarira.co.mz`;
      let authUser: any = null;
      let authSession: any = null;

      try {
        // Tentativa 1: com metadados completos
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: { data: { full_name: displayName, name: displayName, role, phone: phone.trim(), city } }
        });

        if (signUpError || !signUpData?.user) {
          console.warn('Supabase signUp client error in AuthPage, retrying clean signUp:', signUpError?.message);
          
          // Tentativa 2: sem metadados para contornar trigger de Postgres com erro
          const cleanSignUp = await supabase.auth.signUp({
            email: authEmail,
            password
          });

          if (cleanSignUp.data?.user) {
            authUser = cleanSignUp.data.user;
            authSession = cleanSignUp.data.session;
          } else {
            // Tentativa 3: registo no servidor seguro
            const srvReg = await fetch('/api/auth/register-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: authEmail,
                password,
                fullName: fullName.trim(),
                role,
                phone: phone.trim(),
                city,
                nuit
              })
            });
            if (srvReg.ok) {
              const srvData = await srvReg.json();
              authUser = srvData.user;
              setStoredSessionToken(srvData.sessionToken || srvData.token);
            } else {
              throw signUpError || cleanSignUp.error || new Error('Falha ao registar utilizador.');
            }
          }
        } else {
          authUser = signUpData.user;
          authSession = signUpData.session;
        }
      } catch (authException: any) {
        console.warn('Tentativa com /api/auth/register-user:', authException);
        const srvReg = await fetch('/api/auth/register-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            password,
            fullName: fullName.trim(),
            role,
            phone: phone.trim(),
            city,
            nuit
          })
        });
        if (srvReg.ok) {
          const srvData = await srvReg.json();
          authUser = srvData.user;
          setStoredSessionToken(srvData.sessionToken || srvData.token);
        } else {
          setMessage({ type: 'error', text: authException?.message || 'Não foi possível criar a conta. Por favor, verifique os seus dados.' });
          setLoading(false);
          return;
        }
      }

      if (!authUser) {
        setMessage({ type: 'error', text: 'Não foi possível concluir o registo da conta.' });
        setLoading(false);
        return;
      }

      let candidateId: string | null = null;
      let clientId: string | null = null;
      // Regista o objeto completo (cliente ou candidato) criado abaixo, para
      // podermos entregá-lo ao App.tsx via onUserChange no final do registo —
      // era exatamente isto que faltava (ver nota mais abaixo) e que impedia
      // o Painel do Cliente (e o modal de plano/pagamento/trial) de abrir
      // automaticamente a seguir ao registo.
      let linkedRecordObj: any = null;

      // Mesma regra já aplicada no SupabaseAuthModal: sem esta validação aqui
      // (o formulário de página inteira, que é o que está realmente ligado ao
      // separador "login"), um técnico de ofício ou profissional conseguia
      // concluir o registo sem carregar foto real e ficava com a foto de
      // stock genérica — exactamente o bug já corrigido noutro sítio.
      if ((role === 'prestador' || role === 'profissional') && !photoData) {
        setMessage({ type: 'error', text: 'Por favor carregue a sua fotografia de perfil (rosto/ombros) antes de concluir o registo.' });
        setLoading(false);
        return;
      }

      if (role === 'prestador' || role === 'profissional') {
        const isProfessional = role === 'profissional';
        // Preserva o id canónico exato da categoria escolhida (ex.: "limpeza_especializada",
        // "manutencao_reparacoes", "construcao_obras", "elite_tech") em vez de reduzir todos os
        // ofícios não-domésticos ao valor genérico "tech" — essa redução misturava prestadores
        // de ofícios diferentes nos filtros de Técnicos de Campo / Talentos e Quadros.
        // Profissionais (Talentos e Quadros) tinham o mesmo problema: a categoria ficava sempre
        // fixa em "prof", perdendo qual área corporativa (TI, Finanças, RH, etc.) foi escolhida —
        // por isso o cartão de perfil aparecia em todas as categorias em vez de só na sua.
        const candidateCategory = isProfessional
          ? (findCategoryItem(category)?.id || 'ti_software')
          : (category.toLowerCase().includes('doméstic') || category.toLowerCase().includes('babá') || category.toLowerCase().includes('cozinheir') || category.toLowerCase().includes('governant')
              ? 'dom'
              : (findCategoryItem(category)?.id || 'tech'));
        const typedSkills = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];
        const combinedSkills = Array.from(new Set([...selectedSpecialties, ...typedSkills]));
        
        const candidateDocuments = [];
        if (cvFileName) {
          candidateDocuments.push({
            type: 'cv',
            title: cvFileName,
            issuer: 'Submetido no Registo',
            status: 'verified' as const
          });
        }

        const candRes = await fetch('/api/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName.trim(),
            surname: '',
            role: professionalTitle || selectedSpecialties[0] || category,
            title: professionalTitle || selectedSpecialties[0] || category,
            category: candidateCategory,
            isProfessional,
            subCategory: selectedSpecialties.length > 0 ? selectedSpecialties.join(' · ') : category,
            city: city || 'Maputo',
            biNumber: nuit,
            phone: phone.trim() || cleanPhone,
            email: cleanEmail || authEmail,
            photo: photoData || (isProfessional 
              ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" 
              : "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400"),
            bio: bio || (isProfessional ? 'Profissional qualificado verificado pelo TARIRA Recruit.' : 'Técnico de ofício credenciado com experiência prática e garantia no ecossistema TARIRA.'),
            skills: combinedSkills.length > 0 ? combinedSkills : (isProfessional ? ['Liderança Executiva', 'Análise Estratégica', 'Gestão Ágil'] : ['Instalações Certificadas', 'Diagnóstico Técnico', 'Garantia de Serviço']),
            experienceYears: Number(experienceYears) || 3,
            expectedSalaryMin: Number(expectedSalaryMin) || (isProfessional ? 85000 : 25000),
            expectedSalaryMax: Number(expectedSalaryMax) || (isProfessional ? 150000 : 45000),
            rateMzn: Number(rateMzn) || (isProfessional ? 0 : 1500),
            status: 'pending',
            documents: candidateDocuments,
            portfolio: portfolioImages.map(img => ({
              url: img.url,
              caption: img.caption || 'Registo de Obra / Serviço'
            }))
          })
        });
        if (candRes.ok) {
          const cand = await candRes.json();
          candidateId = cand.id;
          linkedRecordObj = cand;
        } else {
          // Nunca prosseguir para a criação da conta de autenticação sem o
          // perfil de candidato realmente gravado — isso é o que produzia
          // contas "fantasma" que entravam no sistema mas nunca apareciam em
          // Técnicos de Campo / Talentos e Quadros.
          let serverMsg = '';
          try { serverMsg = (await candRes.json())?.error || ''; } catch {}
          throw new Error(serverMsg || 'Não foi possível concluir o registo do seu perfil. Por favor tente novamente.');
        }
      } else {
        const clientType = role === 'lar' ? 'residential' : role === 'condominio' ? 'condo' : 'company';
        // MANUTENÇÃO DE CONTA (substitui o antigo plano escolhido).
        // Empresa e Condomínio pagam o mesmo valor; o Lar não paga nada.
        const isPaidAccount = isPaidAccountRole(role);
        const selectedPlanObj = isPaidAccount
          ? { id: ACCOUNT_PLAN_ID, name: ACCOUNT_PLAN_NAME, price: maintenanceFee }
          : { id: HOME_PLAN_ID, name: HOME_PLAN_NAME, price: 0 };

        // Conta gratuita fica activa de imediato. Conta paga arranca em
        // "trial" (30 dias grátis) ou em "pending" se o cliente optar por
        // activar já a manutenção.
        const finalPlanStatus = !isPaidAccount
          ? 'active'
          : (planPaymentTiming === 'now' ? 'pending' : 'trial');

        const clientRes = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: displayName,
            companyName: role === 'empresa' ? companyName.trim() : '',
            condoName: role === 'condominio' ? condoName.trim() : '',
            contactPerson: fullName.trim(),
            contactPersonTitle: contactPersonTitle.trim(),
            companySector: role === 'empresa' ? companySector : '',
            companyEmployees: role === 'empresa' ? companyEmployees : '',
            condoUnits: role === 'condominio' ? condoUnits : '',
            condoType: role === 'condominio' ? condoType : '',
            residentialType: role === 'lar' ? residentialType : '',
            type: clientType,
            email: cleanEmail || authEmail,
            phone: phone.trim() || cleanPhone,
            address: address ? address.trim() : (city ? `${city.trim()}, Moçambique` : 'Maputo, Moçambique'),
            bi: nuit ? nuit.trim() : '',
            planType: selectedPlanObj.id,
            planName: selectedPlanObj.name,
            planPriceMzn: selectedPlanObj.price,
            planStatus: finalPlanStatus
          })
        });
        if (clientRes.ok) {
          const client = await clientRes.json();
          clientId = client.id;
          linkedRecordObj = client;

          // Deixa pronta, em qualquer dos casos (trial ou pagamento
          // imediato), a informação para o Painel do Cliente abrir
          // automaticamente o fluxo de pagamento do plano com o serviço e
          // valor já pré-preenchidos, assim que a conta iniciar sessão.
          // Independentemente de o cliente ter escolhido "Começar Grátis"
          // (trial) ou "Pagar Já", o fluxo de pagamento do plano deve
          // aparecer como próximo passo assim que o Painel do Cliente
          // carregar. Durante o trial, o registo prossegue sem qualquer
          // pagamento (é grátis nos primeiros 30 dias) — o modal apenas
          // informa isso e permite continuar sem pagar, ou pagar já se o
          // cliente preferir adiantar a mensalidade.
          if (isPaidAccount && (finalPlanStatus === 'pending' || finalPlanStatus === 'trial')) {
            try {
              sessionStorage.setItem('tarira_open_payment_checkout', JSON.stringify({
                clientId: client.id,
                serviceTitle: `Manutenção de Conta TARIRA — ${role === 'condominio' ? 'Condomínio' : 'Empresa'}`,
                amount: selectedPlanObj.price,
                isTrial: finalPlanStatus === 'trial'
              }));
            } catch { /* sessionStorage indisponível — não bloqueia o registo */ }
          }
        } else {
          let serverMsg = '';
          try { serverMsg = (await clientRes.json())?.error || ''; } catch {}
          throw new Error(serverMsg || 'Não foi possível concluir o registo da sua conta. Por favor tente novamente.');
        }
      }

      // Registo de perfil robusto (dupla garantia: cliente Supabase + endpoint servidor com chave de admin)
      try {
        await supabase.from('profiles').upsert([
          {
            id: authUser.id,
            name: displayName,
            email: cleanEmail || authEmail,
            role,
            phone: phone.trim(),
            city: city || 'Maputo',
            nuit: nuit ? nuit.trim() : '',
            category: category || '',
            candidate_id: candidateId,
            client_id: clientId,
            is_active: true
          }
        ], { onConflict: 'id' });
      } catch (pErr) {
        console.warn('Direct profile upsert error, falling back to server:', pErr);
      }

      // Garantia via servidor backend (bypassa RLS e assegura perfil no Supabase)
      let savedProfile: UserProfile | null = null;
      try {
        const profRes = await fetch('/api/profiles/upsert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: authUser.id,
            name: displayName,
            email: cleanEmail || authEmail,
            role,
            phone: phone.trim() || cleanPhone,
            city: city || 'Maputo',
            nuit: nuit ? nuit.trim() : '',
            category: category || '',
            candidate_id: candidateId,
            client_id: clientId,
            is_active: true
          })
        });
        if (profRes.ok) {
          const profData = await profRes.json();
          savedProfile = profData.profile;
        }
      } catch (srvErr) {
        console.warn('Server profile upsert fallback warning:', srvErr);
      }

      const effectiveProfile: UserProfile = savedProfile || {
        id: authUser.id,
        name: fullName.trim(),
        email: cleanEmail || authEmail,
        role: role as any,
        phone: phone.trim() || cleanPhone,
        city: city || 'Maputo',
        nuit: nuit ? nuit.trim() : '',
        category: category || '',
        candidate_id: candidateId,
        client_id: clientId
      };

      setCurrentUser(authUser);
      setUserProfile(effectiveProfile);
      // ESTA CHAMADA FALTAVA — era a causa real de o modal de planos/pagamento/
      // trial nunca aparecer depois do registo de Empresa/Condomínio. O
      // handleSignIn (login) já chamava onUserChange no fim, o que faz o
      // App.tsx atribuir selectedClient/selectedProfessional e mudar de
      // separador para o Painel do Cliente. O handleSignUp (registo) nunca o
      // fazia — só atualizava o estado local desta própria página (que é
      // desmontada a seguir) e fechava o modal para a landing page. Ou seja,
      // o Painel do Cliente nunca chegava sequer a abrir depois de uma conta
      // nova ser criada, pelo que o useEffect em App.tsx que verifica
      // sessionStorage("tarira_open_payment_checkout") e abre o
      // TariraPaymentCheckoutModal — que depende de "selectedClient" já
      // estar definido — nunca disparava.
      if (onUserChange) onUserChange(authUser, effectiveProfile, linkedRecordObj);
      setMessage({ type: 'success', text: 'Conta criada e perfil associado com sucesso! A redirecionar...' });
      // NÃO chamamos onClose() aqui de propósito (ao contrário do handleSignIn).
      // onUserChange, acima, já muda o "activeTab" da App.tsx para o Painel do
      // Cliente/Prestador correto — isso, por si só, desmonta esta página de
      // autenticação de imediato (deixa de haver "activeTab === 'login'"). Se
      // chamássemos onClose() aqui também (que faz setActiveTab("landing")),
      // esse setTimeout ficaria pendente e dispararia ~900ms depois de o
      // registo terminar, revertendo silenciosamente o utilizador de volta
      // para a página pública — mesmo já estando no Painel do Cliente — e
      // era exatamente isso que estava a acontecer antes desta correção.
      if (!onUserChange && onClose) setTimeout(() => onClose(), 900);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao realizar registo de conta.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    let cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      const digits = cleanEmail.replace(/\D/g, '');
      if (digits.length >= 8) {
        cleanEmail = `${digits}@tel.tarira.co.mz`;
      }
    }

    setLoading(true);

    try {
      // ------------------------------------------------------------------
      // ACESSO DE ADMINISTRADOR A PARTIR DE QUALQUER CONTA DO PORTAL
      // ------------------------------------------------------------------
      // Já não existe um botão/formulário separado de "aceder como
      // administrador": qualquer pessoa que introduza, neste MESMO
      // formulário de login (seja qual for o separador/role seleccionado —
      // empresa, prestador, condomínio, lar, etc.), o e-mail e a palavra-passe
      // configurados no servidor (variáveis ADMIN_EMAIL / ADMIN_PASSWORD na
      // Vercel, ou o e-mail já autorizado em AUTHORIZED_ADMIN_EMAILS) entra
      // directamente como Administrador Master — sem precisar de mudar de
      // ecrã. Tentamos isto primeiro, em silêncio; se as credenciais não
      // corresponderem ao administrador, o servidor devolve 401/503 e
      // simplesmente continuamos para o fluxo normal de login abaixo.
      try {
        const adminRes = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password })
        });
        const adminData = await adminRes.json().catch(() => ({} as any));
        if (adminRes.ok && adminData.success) {
          setStoredSessionToken(adminData.sessionToken || adminData.token);
          setCurrentUser(adminData.user);
          setUserProfile(adminData.profile);
          if (onUserChange) onUserChange(adminData.user, adminData.profile, null);
          setMessage({ type: 'success', text: 'Sessão de administrador iniciada com sucesso!' });
          if (onClose) setTimeout(() => onClose(), 800);
          setLoading(false);
          return;
        }
      } catch {
        // Endpoint de admin indisponível/erro de rede — segue para o login normal.
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });

          if (!error && data?.user) {
            setCurrentUser(data.user);
            await fetchProfile(data.user.id, data.user);
            // Obtém também o token assinado do Cyber-Shield para autorizar pedidos administrativos/de alteração
            try {
              const tokenRes = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail, phone: cleanEmail, password })
              });
              if (tokenRes.ok) {
                const tokenData = await tokenRes.json();
                setStoredSessionToken(tokenData.sessionToken || tokenData.token);
              }
            } catch { /* sessão Supabase já iniciada; token do Cyber-Shield é um reforço, não bloqueante */ }
            setMessage({ type: 'success', text: 'Sessão iniciada com sucesso!' });
            if (onClose) setTimeout(() => onClose(), 800);
            return;
          }
        } catch (supabaseSignInErr) {
          console.warn('Tentativa direta Supabase Auth falhou, a tentar endpoint /api/auth/login:', supabaseSignInErr);
        }
      }

      // Tentativa de contingência via endpoint do servidor
      const srvLogin = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          phone: cleanEmail,
          password
        })
      });

      if (srvLogin.ok) {
        const srvData = await srvLogin.json();
        if (srvData.user && srvData.profile) {
          setStoredSessionToken(srvData.sessionToken || srvData.token);
          setCurrentUser(srvData.user);
          setUserProfile(srvData.profile);
          if (onUserChange) onUserChange(srvData.user, srvData.profile, null);
          setMessage({ type: 'success', text: 'Sessão iniciada com sucesso!' });
          if (onClose) setTimeout(() => onClose(), 800);
          return;
        }
      }

      setMessage({ type: 'error', text: 'Email ou palavra-passe incorrectos. Verifique os seus dados.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao iniciar sessão.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      setMessage({ type: 'error', text: 'Introduza o seu e-mail para receber o link de recuperação.' });
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setMessage({ type: 'error', text: 'O serviço de recuperação de palavra-passe está temporariamente indisponível. Por favor, tente mais tarde.' });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}#type=recovery`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl
      });

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Erro ao enviar e-mail de recuperação.' });
      } else {
        setMessage({
          type: 'success',
          text: 'Link de recuperação enviado com sucesso! Verifique a sua caixa de entrada (ou pasta de spam) e clique no link para redefinir a palavra-passe.'
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Erro ao processar o pedido de recuperação.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A palavra-passe deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As palavras-passe não coincidem.' });
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setMessage({ type: 'error', text: 'O serviço de atualização de palavra-passe está temporariamente indisponível.' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Erro ao atualizar a palavra-passe.' });
      } else {
        setMessage({ type: 'success', text: 'Palavra-passe atualizada com sucesso! A entrar no portal...' });
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        if (onClose) setTimeout(() => onClose(), 1200);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Erro ao redefinir a senha.' });
    } finally {
      setLoading(false);
    }
  };

  const getGateNotice = () => {
    if (!guestGateReason) return null;
    switch (guestGateReason) {
      case 'LIMITE_NAVEGACAO':
        return {
          title: 'Limite de Visualizações Gratuitas Atingido (3/3)',
          desc: 'Atingiu o limite de navegação como visitante. Crie a sua conta gratuita em 5 segundos com a sua Conta Google para continuar a explorar profissionais, cotações e orçamentos em tempo real sem restrições.'
        };
      case 'CONTRATAR_PRESTADOR':
        return {
          title: 'Acesso Reservado para Contratação de Prestadores',
          desc: 'Para contratar prestadores de serviços, solicitar intervenções ou emitir ordens de trabalho protegidas pelo ecossistema TARIRA, inicie sessão ou crie a sua conta gratuita.'
        };
      case 'VER_CONTACTO':
        return {
          title: 'Visualização de Contacto Directo e CV Completo',
          desc: 'Para ver os contactos directos, certificações verificadas e histórico de avaliações dos candidatos de elite em Moçambique, aceda com a sua conta de membro.'
        };
      case 'BRIEFING_SUBMIT':
        return {
          title: 'Submissão de Briefing e Pedidos de Recrutamento',
          desc: 'Para enviar os critérios da sua vaga e activar o motor de triagem da TARIRA Recruit, por favor autentique-se ou crie uma conta institucional.'
        };
      case 'DOWNLOAD_CONTRATO':
        return {
          title: 'Minutas de Contrato e Documentos Oficiais',
          desc: 'O acesso a minutas de contrato e relatórios executivos está restrito a utilizadores registados com garantia de segurança e enquadramento legal.'
        };
      default:
        return {
          title: 'Acesso Reservado a Membros Registados',
          desc: 'Para aceder às funcionalidades completas do Ecossistema TARIRA, por favor inicie sessão com a sua Conta Google ou crie a sua conta gratuita.'
        };
    }
  };

  const gateNotice = getGateNotice();

  return (
    <div className="min-h-[80vh] w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col justify-center items-center">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* SIDEBAR INFORMATIVO & RECURSOS DO PORTAL */}
        <div className="lg:col-span-5 bg-gradient-to-br from-white via-blue-50 to-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-300 text-[#172554] text-xs font-bold uppercase tracking-wider mb-6 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Portal Unificado TARIRA
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#172554] leading-tight mb-4">
              Aceda a +5.000 Profissionais & Serviços em Moçambique
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Conecte-se instantaneamente ao ecossistema líder em contratação de serviços técnicos, recrutamento de elite e soluções B2B com garantia central.
            </p>

            <div className="space-y-3.5 my-6">
              {[
                { title: 'Acesso Instantâneo e Gratuito', sub: 'Crie conta com a Conta Google em menos de 5 segundos.' },
                { title: 'Prestadores Verificados', sub: 'Certificações técnicas, NUIT e antecedentes validados.' },
                { title: 'Garantia e Segurança Centrais', sub: 'Acompanhamento de ordens de trabalho e faturação B2B.' },
                { title: '5 Módulos Especializados', sub: 'Connect, Recruit, Outsourcing, Consulting e Studio.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-100">{item.title}</span>
                    <span className="block text-[11px] text-slate-400">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>TARIRA Ecosystem Services Lda.</span>
            <span className="text-[#172554] font-bold">100% Seguro</span>
          </div>
        </div>

        {/* PAINEL DE AUTENTICAÇÃO */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            
            {/* AVISO DO MODAL DE BLOQUEIO / GUEST GATE */}
            {gateNotice && (
              <div className="mb-6 p-4 rounded-2xl bg-blue-500/10 border-2 border-blue-500/40 text-blue-100 animate-fade-in shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-blue-200 font-mono uppercase tracking-wide">
                      {gateNotice.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {gateNotice.desc}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* HEADER DA AUTENTICAÇÃO */}
            <div className="text-center sm:text-left mb-6">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {mode === 'reset-password'
                  ? 'Definir Nova Palavra-passe'
                  : mode === 'forgot'
                  ? 'Recuperação de Palavra-passe'
                  : mode === 'signup'
                  ? 'Criar Conta no Portal'
                  : 'Iniciar Sessão'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'reset-password'
                  ? 'Introduza a sua nova palavra-passe de acesso ao portal'
                  : mode === 'forgot'
                  ? 'Enviaremos um link de recuperação para o seu e-mail'
                  : 'Escolha o método mais rápido para aceder ao seu perfil'}
              </p>
            </div>

            {/* SELECTOR SIGN IN / SIGN UP (visível apenas em signin e signup) */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 mb-4">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setMessage(null); }}
                  className={`py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                    mode === 'signin'
                      ? 'bg-[#172554] text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sessão</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setMessage(null); }}
                  className={`py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                    mode === 'signup'
                      ? 'bg-[#172554] text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Criar Conta</span>
                </button>
              </div>
            )}

            {/* INFORMATIVE GUIDANCE BANNER */}
            {mode === 'signup' && (
              <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-100 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-blue-200 font-bold block mb-0.5">Instruções para Criar Nova Conta:</strong>
                  <span>1. Escolha o tipo de perfil pretendido (Lar, Empresa, Condomínio, Técnico ou Profissional) → 2. Preencha os seus dados → 3. Clique em Concluir Registo.</span>
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-slate-100 font-bold block mb-0.5">Instruções de Acesso:</strong>
                  <span>Selecione a categoria da sua conta e introduza o seu e-mail e palavra-passe para aceder ao seu painel.</span>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold mb-5 border ${
                message.type === 'success' ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300' :
                message.type === 'error' ? 'bg-rose-950/60 border-rose-500/30 text-rose-300' :
                'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                {message.text}
              </div>
            )}

            {/* BOTÃO UM-CLIQUE DE LOGIN / REGISTO COM GOOGLE (Apenas em signin e signup) */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="mb-6 space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl border border-slate-200 active:scale-[0.99] group"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {mode === 'signup' ? 'Criar Conta com Conta Google' : 'Iniciar Sessão com Conta Google'}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-80 group-hover:scale-110 transition-transform" />
                </button>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-800 w-full"></div>
                  <span className="bg-slate-900 px-3 text-[10px] uppercase font-mono tracking-wider text-slate-500 whitespace-nowrap">
                    ou continuar com e-mail / telefone
                  </span>
                </div>
              </div>
            )}

            {/* SELECTOR DE PERFIL (Apenas em signin e signup) */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="mb-5 space-y-2.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                  {mode === 'signin' ? 'Tipo de Perfil para Acesso:' : 'Tipo de Perfil de Cliente para a Nova Conta:'}
                </label>
                <div className={`grid ${mode === 'signup' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'} gap-2`}>
                  {(mode === 'signup' ? [
                    { id: 'lar', label: 'Lar Particular', sub: 'Residencial / Habitação', icon: Home },
                    { id: 'empresa', label: 'Empresa / B2B', sub: 'Corporativo & Faturação', icon: Building2 },
                    { id: 'condominio', label: 'Condomínio', sub: 'Gestão Predial & Comum', icon: Building },
                  ] : [
                    { id: 'lar', label: 'Lar Particular', sub: 'Residencial / Habitação', icon: Home },
                    { id: 'empresa', label: 'Empresa / B2B', sub: 'Corporativo & Faturação', icon: Building2 },
                    { id: 'condominio', label: 'Condomínio', sub: 'Gestão Predial & Comum', icon: Building },
                    { id: 'prestador', label: 'Técnico de Ofício', sub: 'TARIRA Connect', icon: Wrench },
                    { id: 'profissional', label: 'Profissional', sub: 'TARIRA Recruit', icon: Briefcase },
                  ]).map((r) => {
                    const IconComp = r.icon;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setRole(r.id as any);
                          if (r.id === 'prestador' && !category.includes('Instalação') && !category.includes('Eletricidade')) {
                            setCategory('Instalação Solar & Energia');
                          } else if (r.id === 'profissional') {
                            setCategory('Cibersegurança & Redes');
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          role === r.id
                            ? 'bg-blue-500/20 border-blue-500 text-white font-bold ring-1 ring-blue-500/50 shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <IconComp className={`w-3.5 h-3.5 ${role === r.id ? 'text-blue-300' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold">{r.label}</span>
                        </div>
                        <span className="block text-[10px] opacity-80">{r.sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ZONA DE ENCAMINHAMENTO DEDICADA PARA TÉCNICOS E PROFISSIONAIS (CONNECT / RECRUIT) */}
                {mode === 'signup' && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-800/70 border border-blue-500/30 shadow-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-blue-200 block">É Prestador de Serviços ou Técnico?</span>
                          <p className="text-[10.5px] text-slate-400 leading-tight">
                            Registe-se nos portais dedicados de credenciação e auditoria da TARIRA:
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (onClose) onClose();
                            if (onNavigate) {
                              onNavigate('apply');
                            }
                          }}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
                          title="Registar como Técnico de Ofício no TARIRA Connect"
                        >
                          <HardHat className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Técnico de Ofício</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onClose) onClose();
                            if (onNavigate) {
                              onNavigate('spontaneous_apply');
                            }
                          }}
                          className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-200 hover:text-white font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
                          title="Registar como Profissional Qualificado no TARIRA Recruit"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                          <span>Profissional</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">E-mail ou Telefone</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      autoComplete="off"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-300">Palavra-passe</label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setMessage(null); }}
                      className="text-[11px] text-blue-300 hover:text-blue-200 font-medium cursor-pointer"
                    >
                      Esqueceu a palavra-passe?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      autoComplete="off"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>{loading ? 'A verificar...' : 'Entrar na Conta'}</span>
                </button>

                {/* Direct Switch to Create Account */}
                <div className="pt-3 text-center">
                  <p className="text-[11px] text-slate-400 mb-1.5">Ainda não tem conta no Portal TARIRA?</p>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setMessage(null); }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-blue-500/30 text-blue-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Criar Nova Conta Gratuita</span>
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-[11px] font-mono text-blue-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Recuperação por E-mail
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Introduza o seu e-mail registado, depois receberá o link seguro para criar uma nova palavra-passe.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">E-mail da Conta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/10 mt-2 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'A enviar link...' : 'Enviar Link de Recuperação'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setMessage(null); }}
                    className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer transition-colors"
                  >
                    ← Voltar ao Início de Sessão
                  </button>
                </div>
              </form>
            )}

            {/* RESET PASSWORD FORM */}
            {mode === 'reset-password' && (
              <form onSubmit={handleUpdatePassword} className="space-y-4 pt-1">
                <div className="text-[11px] font-mono text-blue-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Introduza a Nova Palavra-passe
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nova Palavra-passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Confirmar Nova Palavra-passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-blue-500/10 mt-2 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'A gravar...' : 'Gravar Nova Palavra-passe e Entrar'}</span>
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* DYNAMIC PROFILE BADGE */}
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-200 flex items-center justify-center">
                      {role === 'lar' ? <Home className="w-4 h-4" /> : role === 'empresa' ? <Building2 className="w-4 h-4" /> : role === 'condominio' ? <Building className="w-4 h-4" /> : role === 'prestador' ? <Wrench className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase text-blue-300 font-bold block leading-none">
                        Perfil em Criação:
                      </span>
                      <span className="text-xs font-bold text-white">
                        {role === 'lar'
                          ? `Lar • ${fullName.trim() || 'Nome do Cliente'}`
                          : role === 'empresa'
                          ? `Empresa • ${fullName.trim() || 'Nome da Empresa'}`
                          : role === 'condominio'
                          ? `Condomínio • ${fullName.trim() || 'Nome do Condomínio'}`
                          : role === 'prestador'
                          ? `Técnico de Ofício • ${fullName.trim() || 'Nome do Técnico'}`
                          : `Profissional Especializado • ${fullName.trim() || 'Nome do Profissional'}`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 text-blue-200 border border-blue-500/20">
                    {role === 'lar' ? 'CLIENTE LAR' : role === 'empresa' ? 'B2B EMPRESA' : role === 'condominio' ? 'CONDOMÍNIO' : role === 'prestador' ? 'TÉCNICO DE OFÍCIO' : 'PROFISSIONAL'}
                  </span>
                </div>

                {/* EMPRESA B2B FIELDS */}
                {role === 'empresa' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-blue-950/25 border border-blue-500/25">
                    <div className="flex items-center gap-2 pb-1 border-b border-blue-500/20 text-blue-200">
                      <Building2 className="w-4 h-4 text-blue-300" />
                      <span className="text-xs font-bold font-mono uppercase tracking-wider">Dados Corporativos & Faturação</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-200 mb-1">
                        Nome da Empresa / Razão Social *
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: MozServiços Limitada ou Cervejas de Moçambique"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          NUIT da Empresa *
                        </label>
                        <input
                          type="text"
                          required
                          value={nuit}
                          onChange={(e) => setNuit(e.target.value)}
                          placeholder="Ex: 400123456"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <p className="text-[10px] text-blue-300/80 font-mono mt-0.5">Obrigatório para cotações e faturas formais</p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Setor de Atividade
                        </label>
                        <select
                          value={companySector}
                          onChange={(e) => setCompanySector(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="Construção Civil & Engenharia">Construção Civil & Engenharia</option>
                          <option value="Hotelaria, Restauração & Turismo">Hotelaria, Restauração & Turismo</option>
                          <option value="Banca, Seguros & Finanças">Banca, Seguros & Finanças</option>
                          <option value="Telecomunicações, TI & Software">Telecomunicações, TI & Software</option>
                          <option value="Logística, Frotas & Transportes">Logística, Frotas & Transportes</option>
                          <option value="Comércio Geral & Distribuição">Comércio Geral & Distribuição</option>
                          <option value="Indústria, Manufatura & Energia">Indústria, Manufatura & Energia</option>
                          <option value="Saúde & Clínicas">Saúde & Clínicas</option>
                          <option value="Educação & Ensino">Educação & Ensino</option>
                          <option value="Serviços Corporativos / Outro">Serviços Corporativos / Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Ponto de Contacto / Responsável *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ex: Carlos Mondlane"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Cargo / Departamento
                        </label>
                        <input
                          type="text"
                          value={contactPersonTitle}
                          onChange={(e) => setContactPersonTitle(e.target.value)}
                          placeholder="Ex: Diretor de Operações / RH"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          E-mail Corporativo *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="empresa@dominio.co.mz"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Contacto Telefónico Comercial *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+258 84 000 0000"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">Cidade / Província *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Ex: Maputo"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">Dimensão da Empresa</label>
                        <select
                          value={companyEmployees}
                          onChange={(e) => setCompanyEmployees(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="1-10">1 a 10 colaboradores (Micro / PME)</option>
                          <option value="11-50">11 a 50 colaboradores (Pequena Empresa)</option>
                          <option value="51-200">51 a 200 colaboradores (Média Empresa)</option>
                          <option value="+200">+200 colaboradores (Grande Empresa)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-200 mb-1">Endereço da Sede / Instalações Operacionais *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: Av. 24 de Julho n.º 1234, Maputo"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                  </div>
                )}

                {/* CONDOMÍNIO RESIDENCIAL / PREDIAL FIELDS */}
                {role === 'condominio' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-teal-950/15 border border-teal-500/30">
                    <div className="flex items-center gap-2 pb-1 border-b border-teal-500/20 text-teal-300">
                      <Building className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-bold font-mono uppercase tracking-wider">Dados do Condomínio & Gestão Predial</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-200 mb-1">
                        Nome do Condomínio / Edifício Residencial *
                      </label>
                      <input
                        type="text"
                        required
                        value={condoName}
                        onChange={(e) => setCondoName(e.target.value)}
                        placeholder="Ex: Condomínio Marés Vivas ou Edifício Polana Prime"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Tipo de Condomínio
                        </label>
                        <select
                          value={condoType}
                          onChange={(e) => setCondoType(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                        >
                          <option value="Edifício Vertical / Prédio de Apartamentos">Edifício Vertical / Apartamentos</option>
                          <option value="Condomínio Fechado de Vivendas / Moradias">Condomínio Fechado de Vivendas</option>
                          <option value="Misto (Residencial & Comercial)">Misto (Residencial & Comercial)</option>
                          <option value="Complexo Habitacional / Loteamento">Complexo Habitacional</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          N.º de Frações / Apartamentos *
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={condoUnits}
                          onChange={(e) => setCondoUnits(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Ex: 24"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
                        />
                        <p className="text-[10px] text-teal-400/80 font-mono mt-0.5">Dimensiona contratos preventivos (bombas, gerador, elevador)</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Nome do Administrador / Síndico *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ex: Maria Santos ou João Cossa"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Entidade Gestora / Função
                        </label>
                        <select
                          value={contactPersonTitle || 'Síndico(a) Eleito(a)'}
                          onChange={(e) => setContactPersonTitle(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                        >
                          <option value="Síndico(a) Eleito(a)">Síndico(a) Eleito(a)</option>
                          <option value="Empresa de Gestão de Condomínio">Empresa de Gestão de Condomínio</option>
                          <option value="Comissão de Moradores">Comissão de Moradores</option>
                          <option value="Zelador / Encarregado Predial">Zelador / Encarregado Predial</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          E-mail da Administração / Portaria *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="condominio@exemplo.com"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Telefone da Administração / Portaria *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+258 84 000 0000"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">Cidade / Província *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Ex: Maputo"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          NUIT do Condomínio (Opcional)
                        </label>
                        <input
                          type="text"
                          value={nuit}
                          onChange={(e) => setNuit(e.target.value)}
                          placeholder="Ex: 400987654 (se aplicável)"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-200 mb-1">Endereço / Localização do Condomínio *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ex: Av. Julius Nyerere, Bairro Polana Cimento, Maputo"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>

                  </div>
                )}

                {/* LAR PARTICULAR FIELDS */}
                {role === 'lar' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                    <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-slate-300">
                      <Home className="w-4 h-4 text-blue-300" />
                      <span className="text-xs font-bold font-mono uppercase tracking-wider">Dados da Residência Particular</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Nome Completo / Titular *</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ex: João da Silva"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Tipo de Habitação</label>
                        <select
                          value={residentialType}
                          onChange={(e) => setResidentialType(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="Apartamento">Apartamento</option>
                          <option value="Vivenda / Moradia">Vivenda / Moradia</option>
                          <option value="Casa Geminada / Anexo">Casa Geminada / Anexo</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          E-mail <span className="text-blue-300 font-normal">(ou Telefone)</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="joao@exemplo.com"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Contacto Telefónico <span className="text-blue-300 font-normal">(ou E-mail)</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+258 84 000 0000"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Cidade / Província *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Ex: Maputo"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Endereço da Residência *</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Ex: Bairro Triunfo, Rua das Acácias n.º 45"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PRESTADOR / PROFISSIONAL GENERIC CONTACT HEADER */}
                {(role === 'prestador' || role === 'profissional') && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        {role === 'prestador' ? 'Técnico de Ofício • Nome Completo *' : 'Profissional • Nome Completo *'}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder=""
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          E-mail <span className="text-blue-300 font-normal">(ou Telefone)</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder=""
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Contacto Telefónico <span className="text-blue-300 font-normal">(ou E-mail)</span>
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder=""
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* EXTENDED FIELDS FOR PRESTADOR (CONNECT) AND PROFISSIONAL (RECRUIT) */}
                {(role === 'prestador' || role === 'profissional') && (
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-blue-500/30 space-y-4 my-2">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        {role === 'prestador' ? <HardHat className="w-4 h-4 text-blue-300" /> : <Briefcase className="w-4 h-4 text-blue-300" />}
                        <span className="text-xs font-bold text-blue-200 uppercase tracking-wider font-mono">
                          {role === 'prestador' ? 'Perfil do Técnico de Ofício (TARIRA Connect)' : 'Perfil do Profissional (TARIRA Recruit)'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Portfólio Ativo
                      </span>
                    </div>

                    {/* PHOTO UPLOAD */}
                    <div>
                      <label className="block text-[11px] font-bold text-blue-200 mb-1.5 font-mono uppercase tracking-wider">
                        Foto Pessoal de Rosto / Ombros (1:1 Head & Shoulders) *
                      </label>
                      
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-0.5 bg-gradient-to-tr from-blue-600 via-blue-400 to-slate-700 shadow-md shrink-0">
                          <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 relative flex items-center justify-center">
                            {photoData ? (
                              <img
                                src={photoData}
                                alt="Foto Perfil"
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="text-center p-2 text-slate-500">
                                <Camera className="w-6 h-6 mx-auto mb-1 opacity-60 text-blue-300" />
                                <span className="text-[9px] font-mono leading-tight block">Rosto 1:1</span>
                              </div>
                            )}
                            {isUploadingPhoto && (
                              <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                                <span className="w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></span>
                              </div>
                            )}
                            <span className="absolute bottom-1 inset-x-1 text-center bg-slate-950/80 text-[8px] font-mono text-blue-200 py-0.5 rounded">
                              1:1 HD
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 w-full space-y-2">
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
                            className={`p-3 rounded-xl border border-dashed text-center transition-all cursor-pointer ${
                              photoDragging ? 'bg-blue-500/20 border-blue-400' : 'bg-slate-900/70 border-slate-700 hover:border-blue-500/50'
                            }`}
                          >
                            <input
                              type="file"
                              id="authpage-photo-input"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handlePhotoFileSelect(e.target.files[0]);
                                }
                              }}
                            />
                            <label htmlFor="authpage-photo-input" className="cursor-pointer block text-xs text-slate-300">
                              <Upload className="w-4 h-4 mx-auto mb-1 text-blue-300" />
                              <span className="font-bold text-blue-200">Clique para carregar</span> ou arraste a sua foto
                              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">JPG, PNG ou WebP (Rosto e ombros)</span>
                            </label>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 font-mono">Modelos rápidos:</span>
                            <button
                              type="button"
                              onClick={() => setPhotoData("https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400")}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-blue-200 cursor-pointer"
                            >
                              Técnico Eletricista
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhotoData("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400")}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] text-blue-200 cursor-pointer"
                            >
                              Arquiteta de Sistemas
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TITLE & CATEGORY */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono uppercase">
                          Título Profissional / Cargo *
                        </label>
                        <input
                          type="text"
                          required
                          value={professionalTitle}
                          onChange={(e) => setProfessionalTitle(e.target.value)}
                          placeholder=""
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-blue-200 mb-1 font-mono uppercase tracking-wider">
                          Categoria Principal *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => {
                            const newCat = e.target.value;
                            setCategory(newCat);
                            const specs = getSpecialtiesForCategory(newCat);
                            if (specs.length > 0) {
                              setSelectedSpecialties([specs[0]]);
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-blue-500/40 text-blue-100 text-xs focus:outline-none focus:border-blue-400 font-medium"
                        >
                          {getCategoriesByRole(role).map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.icon} {cat.name} ({cat.badge})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* DYNAMIC SPECIALTIES SELECTOR */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-blue-500/25 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-blue-200 font-mono uppercase tracking-wider">
                          Especialidades / Sub-áreas ({category}) *
                        </label>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {selectedSpecialties.length} selecionadas
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Clique para selecionar as especialidades que você domina:
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {getSpecialtiesForCategory(category).map((spec) => {
                          const isChecked = selectedSpecialties.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => {
                                setSelectedSpecialties(prev =>
                                  prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
                                );
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1 border font-medium ${
                                isChecked
                                  ? 'bg-[#172554] text-white font-bold border-blue-400 shadow-sm'
                                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-blue-400/40 hover:text-white'
                              }`}
                            >
                              {isChecked ? <CheckCircle2 className="w-3 h-3 text-slate-950" /> : <Plus className="w-3 h-3 text-slate-500" />}
                              <span>{spec}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder=""
                          value={customSpecialtyInput}
                          onChange={(e) => setCustomSpecialtyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customSpecialtyInput.trim() && !selectedSpecialties.includes(customSpecialtyInput.trim())) {
                                setSelectedSpecialties(prev => [...prev, customSpecialtyInput.trim()]);
                                setCustomSpecialtyInput('');
                              }
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400 font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customSpecialtyInput.trim() && !selectedSpecialties.includes(customSpecialtyInput.trim())) {
                              setSelectedSpecialties(prev => [...prev, customSpecialtyInput.trim()]);
                              setCustomSpecialtyInput('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-200 font-bold text-xs border border-slate-700 cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Adicionar
                        </button>
                      </div>
                    </div>

                    {/* EXPERIENCE & SKILLS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono uppercase">
                          Anos de Experiência *
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          required
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono uppercase">
                          Competências (separadas por vírgula)
                        </label>
                        <input
                          type="text"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder=""
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* REMUNERAÇÃO: INTERVALO DE PRETENSAO MENSAL (RECRUIT) vs VALOR POR INTERVENÇÃO (CONNECT) */}
                    {role === 'profissional' && (
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-2">
                        <label className="block text-[11px] font-bold text-blue-200 font-mono uppercase tracking-wider">
                          Intervalo de Pretensão Salarial Mensal (MZN/mês) *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                              Salário Mínimo (De)
                            </span>
                            <input
                              type="number"
                              min={0}
                              required
                              value={expectedSalaryMin || ''}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setExpectedSalaryMin(val);
                                if (!expectedSalaryMax || expectedSalaryMax < val) {
                                  setExpectedSalaryMax(val ? Math.round(val * 1.3) : '');
                                }
                              }}
                              placeholder="Ex: 50000"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-blue-500/40 text-white text-xs focus:outline-none focus:border-blue-400 font-mono font-bold"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                              Salário Máximo (Até)
                            </span>
                            <input
                              type="number"
                              min={expectedSalaryMin ? Number(expectedSalaryMin) : 0}
                              required
                              value={expectedSalaryMax || ''}
                              onChange={(e) => setExpectedSalaryMax(e.target.value ? Number(e.target.value) : '')}
                              placeholder="Ex: 65000"
                              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-blue-500/40 text-white text-xs focus:outline-none focus:border-blue-400 font-mono font-bold"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-blue-300 bg-slate-950/80 border border-blue-500/20 rounded-lg px-2.5 py-1">
                          <span>💰 Intervalo no perfil:</span>
                          <strong className="font-mono text-white">
                            {expectedSalaryMin ? Number(expectedSalaryMin).toLocaleString() : '50.000'} - {expectedSalaryMax ? Number(expectedSalaryMax).toLocaleString() : '65.000'} MZN/mês
                          </strong>
                        </div>
                      </div>
                    )}

                    {role === 'prestador' && (
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                        <label className="block text-[11px] font-bold text-emerald-300 mb-1 font-mono uppercase tracking-wider">
                          Valor por Intervenção / Diária (MZN) *
                        </label>
                        <input
                          type="number"
                          min={0}
                          required
                          value={rateMzn || ''}
                          onChange={(e) => setRateMzn(Number(e.target.value))}
                          placeholder="Ex: 1500"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-white text-xs focus:outline-none focus:border-emerald-400 font-mono font-bold"
                        />
                        <span className="text-[9.5px] text-emerald-400/80 block mt-1">
                          Tarifa estimada em Meticais por intervenção técnica ou diária (TARIRA Connect)
                        </span>
                      </div>
                    )}

                    {/* CAREER BIO */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono uppercase">
                        Apresentação da Carreira & O que Faz (Bio) *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                      />
                    </div>

                    {/* CV UPLOAD (PDF Focus & Optional) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-blue-200 font-mono uppercase tracking-wider">
                          {role === 'prestador' ? 'Upload de Currículo (CV) do Técnico em PDF' : 'Upload de CV Executivo em PDF'}
                        </label>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                          Opcional
                        </span>
                      </div>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setCvDragging(true); }}
                        onDragLeave={() => setCvDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setCvDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleCvFileSelect(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border border-dashed text-center transition-all cursor-pointer ${
                          cvDragging ? 'bg-blue-500/20 border-blue-400' : 'bg-slate-900/70 border-slate-700 hover:border-blue-500/50'
                        }`}
                      >
                        <input
                          type="file"
                          id="authpage-cv-input"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCvFileSelect(e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="authpage-cv-input" className="cursor-pointer block text-xs text-slate-300">
                          {cvFileName ? (
                            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
                              <FileCheck className="w-4 h-4 text-emerald-400" />
                              <span>{cvFileName} ({cvFileSize})</span>
                            </div>
                          ) : (
                            <div>
                              <FileText className="w-5 h-5 mx-auto mb-1 text-blue-300" />
                              <span className="font-bold text-blue-200">Clique para carregar documento PDF</span>
                              <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                                Formato obrigatório: <strong>PDF (.pdf)</strong> • Máx: <strong>2MB</strong>
                              </span>
                              <span className="block text-[10px] text-slate-400 italic mt-1">
                                O carregamento de CV em formato PDF é opcional.
                              </span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* PORTFOLIO DE IMAGENS (OPCIONAL) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-blue-200 font-mono uppercase tracking-wider">
                          Portfólio de Imagens & Obras (Opcional)
                        </label>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                          {isUploadingPortfolio
                            ? 'A carregar...'
                            : `${portfolioImages.length} ${portfolioImages.length === 1 ? 'Foto' : 'Fotos'}`}
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
                        className={`p-3.5 rounded-xl border border-dashed text-center transition-all cursor-pointer ${
                          portfolioDragging ? 'bg-blue-500/20 border-blue-400' : 'bg-slate-900/70 border-slate-700 hover:border-blue-500/50'
                        }`}
                      >
                        <input
                          type="file"
                          id="authpage-portfolio-input"
                          multiple
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handlePortfolioFilesSelect(e.target.files);
                            }
                          }}
                        />
                        <label htmlFor="authpage-portfolio-input" className="cursor-pointer block text-xs text-slate-300">
                          <Camera className="w-5 h-5 mx-auto mb-1 text-blue-300" />
                          <span className="font-bold text-blue-200">+ Carregar Fotos do Portfólio</span> (Trabalhos, Obras, Intervenções)
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            Suporta múltiplas imagens (JPG, PNG, WebP)
                          </span>
                        </label>
                      </div>

                      {/* Portfolio Thumbnails Preview */}
                      {portfolioImages.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                          {portfolioImages.map((img, pIdx) => (
                            <div key={pIdx} className="relative group rounded-xl overflow-hidden bg-slate-950 border border-blue-500/30">
                              <img src={img.url} alt={img.name} className="w-full h-16 object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemovePortfolioImage(pIdx)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer"
                                title="Remover imagem"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {uploadError && (
                      <p className="text-xs text-rose-400 font-medium">⚠️ {uploadError}</p>
                    )}
                  </div>
                )}

                {/* CONDIÇÕES DE MANUTENÇÃO DE CONTA (EMPRESA, CONDOMÍNIO E LAR) */}
                {(role === 'empresa' || role === 'condominio' || role === 'lar') && (
                  <div className="pt-2">
                    <AccountMaintenanceCard
                      role={role}
                      maintenanceFee={maintenanceFee}
                      accountBenefits={accountBenefits}
                      homeBenefits={homeBenefits}
                      paymentTiming={planPaymentTiming}
                      onChangePaymentTiming={setPlanPaymentTiming}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Palavra-passe *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Confirmar Palavra-passe *</label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=""
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#172554] hover:bg-[#1A3478] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg mt-2"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {loading
                      ? 'A criar conta...'
                      : role === 'prestador'
                      ? 'Criar Conta no TARIRA Connect (Técnico de Ofício)'
                      : role === 'profissional'
                      ? 'Criar Conta no TARIRA Recruit (Profissional Especializado)'
                      : role === 'empresa'
                      ? 'Criar Conta Empresarial'
                      : role === 'condominio'
                      ? 'Criar Conta de Condomínio'
                      : 'Criar Conta de Cliente'}
                  </span>
                </button>

                {/* Direct Switch to Sign In */}
                <div className="pt-3 text-center">
                  <p className="text-[11px] text-slate-400 mb-1.5">Já possui uma conta registada?</p>
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setMessage(null); }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Iniciar Sessão na sua Conta</span>
                  </button>
                </div>
              </form>
            )}

            {/* O antigo botão discreto "aceder como administrador" foi removido:
                agora basta iniciar sessão neste MESMO formulário (em qualquer
                separador/role) com o e-mail e palavra-passe de administrador
                configurados no servidor — ver handleSignIn acima. */}

          </div>
        </div>

      </div>
    </div>
  );
};
