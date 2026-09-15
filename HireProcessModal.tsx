// High-fidelity Tarira Universal Hire & Contract Modal (Strictly separating Tarira Connect vs Tarira Recruitment)
import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, CheckCircle2, CreditCard, Calendar, Star, ShieldCheck, FileText, Printer, Lock } from "lucide-react";
import { Candidate, Client } from "./types";
import { TariraDatePicker } from "./TariraDatePicker";
import { TariraServiceReceiptModal, TariraReceiptData } from "./TariraServiceReceiptModal";
import { TariraServiceReviewModal } from "./TariraServiceReviewModal";

interface HireProcessModalProps {
  isOpen?: boolean;
  onClose: () => void;
  selectedProfessional: Candidate | null;
  selectedClient?: Client | null;
  uploadImageToImgBB?: (file: File) => Promise<string>;
  isUploadingImgBB?: boolean;
  triggerOperationLog?: (action: string, details: string) => void;
  onHireSuccess?: (createdHire: any) => void;
  isTechnicianCandidate?: boolean;
}

export function HireProcessModal({
  isOpen = true,
  onClose,
  selectedProfessional,
  selectedClient,
  uploadImageToImgBB = async (file: File) => URL.createObjectURL(file),
  isUploadingImgBB = false,
  triggerOperationLog = () => {},
  onHireSuccess = () => {},
  isTechnicianCandidate = false
}: HireProcessModalProps) {
  const [hireStep, setHireStep] = useState<number>(1);
  const [hireForm, setHireForm] = useState({
    type: "normal" as "normal" | "emergency" | "scheduled",
    targetDate: new Date().toISOString().split("T")[0],
    preferredTime: "morning" as "morning" | "afternoon" | "evening" | "any",
    location: "",
    description: "",
    // Technician multimedia (strictly for technicians only)
    voiceUrl: "",
    voiceDuration: 0,
    photoName: "",
    photoUrl: "",
    // Professional contract formulation
    contractType: "termo_certo" as "termo_certo" | "termo_incerto" | "indeterminado",
    contractDurationMonths: 1 as number, // Standard options: 1 Mês, 3 Meses, 12 Meses (Anual)
    contractDurationCustom: "" as string,
    isCustomMonths: false as boolean,
    isRenewable: true as boolean,
    observations: "" as string,
    recruitmentSalaryProposal: selectedProfessional?.expectedSalaryMin || (selectedProfessional?.rateMzn ? selectedProfessional.rateMzn * 4 : 25000),
    negotiationEmail: selectedClient?.email || "",
    workModel: "presential" as "presential" | "remote" | "hybrid",
    workSchedule: "full_time" as "full_time" | "part_time" | "flexible",
    weeklyDayOff: "domingo" as "domingo" | "weekend" | "rotativa",
    // Technician-only workload and effort
    connectWorkloadHours: 4,
    connectEffortLevel: "medium" as "light" | "medium" | "heavy",
    paymentModality: "half" as "half" | "full",
    paymentChannel: "card" as "card" | "mpesa" | "emola" | "izi" | "bank",
    // Technician-only service periodicity (fase 1)
    billingPeriod: "daily" as "daily" | "weekly" | "monthly",
    periodFrequencyDays: 3 as number
  });

  // Inline Step Error for clean validation
  const [stepError, setStepError] = useState<string>("");

  // Debit Card Fields
  const [debitCard, setDebitCard] = useState({
    cardNumber: "",
    cardHolder: selectedClient?.name || "",
    expiryMonth: "12",
    expiryYear: "27",
    cvv: ""
  });

  // Post-payment Receipt & Evaluation states
  const [issuedReceipt, setIssuedReceipt] = useState<TariraReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [reviewHireId, setReviewHireId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [voiceNoteName, setVoiceNoteName] = useState<string>("");
  const recordingIntervalRef = useRef<any>(null);

  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState<number>(0);
  const playVoiceIntervalRef = useRef<any>(null);

  // Complete state reset function to ensure subsequent requests start clean with smart defaults
  const resetAllFormState = () => {
    setHireStep(1);
    setStepError("");
    const defaultLoc = selectedClient?.city || selectedClient?.address || selectedProfessional?.city || "Maputo, Moçambique";
    const defaultDesc = isTechnicianCandidate 
      ? "" 
      : (selectedProfessional?.title 
          ? `Contratação de ${selectedProfessional.title} para integração e desenvolvimento de projetos corporativos.` 
          : "Contratação para quadro corporativo e cumprimento de metas.");

    setHireForm({
      type: "normal",
      targetDate: new Date().toISOString().split("T")[0],
      preferredTime: "morning",
      location: defaultLoc,
      description: defaultDesc,
      voiceUrl: "",
      voiceDuration: 0,
      photoName: "",
      photoUrl: "",
      contractType: "termo_certo",
      contractDurationMonths: 1,
      contractDurationCustom: "",
      isCustomMonths: false,
      isRenewable: true,
      observations: "",
      recruitmentSalaryProposal: selectedProfessional?.expectedSalaryMin || (selectedProfessional?.rateMzn ? selectedProfessional.rateMzn * 4 : 25000),
      negotiationEmail: selectedClient?.email || "",
      workModel: "presential",
      workSchedule: "full_time",
      weeklyDayOff: "domingo",
      connectWorkloadHours: 4,
      connectEffortLevel: "medium",
      paymentModality: "half",
      paymentChannel: "card",
      billingPeriod: "daily",
      periodFrequencyDays: 3
    });
    setDebitCard({
      cardNumber: "",
      cardHolder: selectedClient?.name || "",
      expiryMonth: "12",
      expiryYear: "27",
      cvv: ""
    });
    setVoiceNoteName("");
    setRecordingDuration(0);
    setIsRecording(false);
    setIsPlayingVoice(false);
    setVoicePlaybackProgress(0);
    setIsSubmitting(false);
    setIssuedReceipt(null);
    setIsReceiptModalOpen(false);
    setReviewHireId(null);
    setIsReviewModalOpen(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (playVoiceIntervalRef.current) clearInterval(playVoiceIntervalRef.current);
  };

  // Reset inputs when modal is opened or when target candidate changes
  useEffect(() => {
    if (isOpen && selectedProfessional) {
      resetAllFormState();
    }
  }, [isOpen, selectedProfessional?.id, selectedClient?.id]);

  if (!isOpen || !selectedProfessional) return null;

  const playToneSim = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio context may be restricted in some environments
    }
  };

  const startRecordingSim = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    setVoicePlaybackProgress(0);
    setIsPlayingVoice(false);
    
    if (playVoiceIntervalRef.current) {
      clearInterval(playVoiceIntervalRef.current);
    }
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecordingSim = (finalDur: number) => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    
    const safeDuration = Math.max(1, finalDur);
    const audioName = `instrucao_voz_${new Date().getTime().toString().slice(-4)}.aac`;
    setVoiceNoteName(audioName);
    setHireForm(prev => ({
      ...prev,
      voiceUrl: `blob:simulated-audio-${new Date().getTime()}`,
      voiceDuration: safeDuration
    }));
  };

  const deleteRecordingSim = () => {
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    if (playVoiceIntervalRef.current) clearInterval(playVoiceIntervalRef.current);
    setIsRecording(false);
    setIsPlayingVoice(false);
    setVoicePlaybackProgress(0);
    setVoiceNoteName("");
    setRecordingDuration(0);
    setHireForm(prev => ({ ...prev, voiceUrl: "", voiceDuration: 0 }));
  };

  const togglePlayVoice = () => {
    if (isPlayingVoice) {
      setIsPlayingVoice(false);
      if (playVoiceIntervalRef.current) clearInterval(playVoiceIntervalRef.current);
    } else {
      setIsPlayingVoice(true);
      playToneSim();
      const totalSeconds = hireForm.voiceDuration || 5;
      const stepMs = 100;
      const totalSteps = (totalSeconds * 1000) / stepMs;
      
      if (playVoiceIntervalRef.current) clearInterval(playVoiceIntervalRef.current);
      
      let stepCount = (voicePlaybackProgress / 100) * totalSteps;
      
      playVoiceIntervalRef.current = setInterval(() => {
        stepCount++;
        const prog = (stepCount / totalSteps) * 100;
        if (prog >= 100) {
          setVoicePlaybackProgress(100);
          setIsPlayingVoice(false);
          clearInterval(playVoiceIntervalRef.current);
          setTimeout(() => setVoicePlaybackProgress(0), 400);
        } else {
          setVoicePlaybackProgress(prog);
        }
      }, stepMs);
    }
  };

  const handleClose = () => {
    resetAllFormState();
    onClose();
  };

  // Helper for professional contract period calculation
  const getSelectedDurationMonths = (): number => {
    if (hireForm.contractType === "indeterminado") return 0;
    if (hireForm.isCustomMonths && hireForm.contractDurationCustom) {
      return Math.max(1, parseInt(hireForm.contractDurationCustom, 10) || 1);
    }
    return hireForm.contractDurationMonths || 1;
  };

  const getContractTypeLabel = (): string => {
    if (hireForm.contractType === "indeterminado") {
      return "Contrato por Tempo Indeterminado (Sem Termo)";
    }
    const months = getSelectedDurationMonths();
    const renewLabel = hireForm.isRenewable ? " (Renovável)" : "";
    const periodText = months === 1 ? "1 Mês" : months === 3 ? "3 Meses" : months === 12 ? "Anual (12 Meses)" : `${months} Meses`;
    if (hireForm.contractType === "termo_incerto") {
      return `Contrato a Termo Incerto (~${periodText}${renewLabel})`;
    }
    return `Contrato a Termo Certo (${periodText}${renewLabel})`;
  };

  // Technician calculations
  const techHourlyRate = selectedProfessional.rate || 350;
  const isEmergency = hireForm.type === "emergency" && hireForm.billingPeriod === "daily";
  const techHours = hireForm.connectWorkloadHours || 4;
  // Serviço Doméstico — enquadrado pelo Decreto n.º 52/2026 (Regulamento do Trabalho Doméstico)
  const isDomesticCategory = isTechnicianCandidate && (
    selectedProfessional?.category === "dom" ||
    selectedProfessional?.category === "domesticos" ||
    (selectedProfessional?.subCategory || "").toLowerCase().includes("dom")
  );
  const effortMultiplier = hireForm.connectEffortLevel === "heavy" ? 1.3 : hireForm.connectEffortLevel === "medium" ? 1.1 : 1.0;
  // Periodicidade do Serviço: Diário (visita única), Semanal ou Mensal (recorrente, múltiplos dias de visita)
  const periodVisitDays = hireForm.billingPeriod === "daily" ? 1 : (hireForm.periodFrequencyDays || (hireForm.billingPeriod === "weekly" ? 3 : 12));
  const periodLabel = hireForm.billingPeriod === "daily" ? "dia" : hireForm.billingPeriod === "weekly" ? "semana" : "mês";
  const techBaseAmount = Math.round(techHourlyRate * techHours * effortMultiplier * periodVisitDays);
  const emergencyFee = isEmergency ? 400 : 0;
  const techTotalEstimate = techBaseAmount + emergencyFee;

  const handleConfirmHire = async () => {
    setIsSubmitting(true);
    try {
      const baseSalaryProposal = hireForm.recruitmentSalaryProposal || 
        selectedProfessional.expectedSalaryMin || 
        (selectedProfessional.rateMzn ? selectedProfessional.rateMzn * 4 : 25000);

      const effectiveMonths = getSelectedDurationMonths();
      const clientDisplayName = selectedClient?.name || "Cliente TARIRA Moçambique";
      const candidateFullName = `${selectedProfessional.name} ${selectedProfessional.surname || ""}`.trim();
      const cardLast4Digits = debitCard.cardNumber.replace(/\s/g, '').slice(-4) || "8821";

      const payload = {
        candidateId: selectedProfessional.id,
        candidateName: candidateFullName,
        candidateCategory: selectedProfessional.category || (isTechnicianCandidate ? "tech" : "recruitment"),
        isTechnician: isTechnicianCandidate,
        clientId: selectedClient?.id || "client-1",
        clientName: clientDisplayName,
        clientNuit: selectedClient?.nuit || "400192831",
        clientContact: selectedClient?.phone || selectedClient?.email || "+258 84 000 0000",
        serviceName: selectedProfessional.title || (isTechnicianCandidate ? "Assistência Técnica Especializada" : "Especialista Corporativo"),
        rate: isTechnicianCandidate ? techHourlyRate : 0,
        description: hireForm.description,
        targetDate: hireForm.type === "emergency" ? "Urgência Imediata" : (hireForm.targetDate || "Imediato"),
        type: hireForm.type,
        location: hireForm.location || "Maputo, Moçambique",
        // Professional-specific contract details
        contractType: hireForm.contractType,
        contractDurationMonths: effectiveMonths,
        contractDurationLabel: !isTechnicianCandidate ? getContractTypeLabel() : `${techHours} Horas de Atendimento`,
        isRenewable: hireForm.isRenewable,
        observations: hireForm.observations,
        recruitmentNegotiationNotes: hireForm.observations,
        recruitmentSalaryProposal: baseSalaryProposal,
        negotiationEmail: hireForm.negotiationEmail || "contacto@empresa.co.mz",
        workModel: hireForm.workModel,
        workSchedule: hireForm.workSchedule,
        weeklyDayOff: hireForm.weeklyDayOff,
        workScheduleLabel: hireForm.workSchedule === "full_time" 
          ? `Período Integral (40h/semana • ${hireForm.weeklyDayOff === "weekend" ? "2 folgas/semana" : "1 folga por semana"})` 
          : hireForm.workSchedule === "part_time" 
          ? `Meio Período (20h/semana • com folga)` 
          : "Horário Flexível por Objetivos",
        // Technician-only multimedia (strictly empty for professionals)
        voiceUrl: isTechnicianCandidate ? hireForm.voiceUrl : "",
        voiceDuration: isTechnicianCandidate ? hireForm.voiceDuration : 0,
        photoName: isTechnicianCandidate ? hireForm.photoName : "",
        photoUrl: isTechnicianCandidate ? hireForm.photoUrl : "",
        preferredTime: isTechnicianCandidate ? hireForm.preferredTime : "",
        workloadHours: isTechnicianCandidate ? techHours : 40,
        effortLevel: isTechnicianCandidate ? hireForm.connectEffortLevel : "standard",
        billingPeriod: isTechnicianCandidate ? hireForm.billingPeriod : "",
        periodFrequencyDays: isTechnicianCandidate ? periodVisitDays : 0,
        totalEstimate: isTechnicianCandidate ? techTotalEstimate : baseSalaryProposal,
        paidAmount: isTechnicianCandidate ? (hireForm.paymentModality === "half" ? Math.round(techTotalEstimate / 2) : techTotalEstimate) : 0,
        paymentModality: isTechnicianCandidate ? hireForm.paymentModality : "monthly_salary",
        paymentChannel: hireForm.paymentChannel,
        cardLast4: hireForm.paymentChannel === "card" ? cardLast4Digits : undefined,
        paymentStatus: "confirmed_escrow"
      };

      const res = await fetch("/api/hires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdHire = await res.json();
        onHireSuccess(createdHire);
        triggerOperationLog(
          "HIRE_CREATED",
          `Pedido de contratação criado para ${selectedProfessional.name} (${isTechnicianCandidate ? "Técnico" : "Profissional"}). Modalidade: ${!isTechnicianCandidate ? getContractTypeLabel() : `${hireForm.billingPeriod === "daily" ? "Diário" : hireForm.billingPeriod === "weekly" ? "Semanal" : "Mensal"} • ${techHours}h/visita - ${techTotalEstimate} MZN`}`
        );

        // Generate Tarira Official Receipt Data
        const now = new Date();
        const generatedReceipt: TariraReceiptData = {
          receiptId: `REC-TAR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
          authCode: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          timestamp: `${now.toLocaleDateString("pt-MZ")} às ${now.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}`,
          clientName: clientDisplayName,
          clientNuit: selectedClient?.nuit,
          clientContact: selectedClient?.phone || selectedClient?.email,
          candidateName: candidateFullName,
          candidateCategory: selectedProfessional.category || "Assistência Técnica",
          serviceTitle: selectedProfessional.title || "Serviço Especializado",
          targetDate: hireForm.targetDate || "Imediato",
          location: hireForm.location || "Maputo, Moçambique",
          billingPeriod: hireForm.billingPeriod || "daily",
          hours: techHours,
          ratePerHour: techHourlyRate,
          totalAmount: isTechnicianCandidate ? techTotalEstimate : baseSalaryProposal,
          paidAmount: isTechnicianCandidate ? (hireForm.paymentModality === "half" ? Math.round(techTotalEstimate / 2) : techTotalEstimate) : 0,
          paymentModality: hireForm.paymentModality,
          paymentChannel: hireForm.paymentChannel,
          cardLast4: hireForm.paymentChannel === "card" ? cardLast4Digits : undefined,
          hireId: createdHire.id || `hire-${Date.now()}`
        };

        setIssuedReceipt(generatedReceipt);
        setIsReceiptModalOpen(true);
      } else {
        setStepError("Não foi possível registar o pedido no servidor. Por favor tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setStepError("Erro de comunicação ao submeter o pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="hire-process-modal-overlay" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 flex justify-center items-start sm:items-center">
      {/* Dark opaque backdrop click handler */}
      <div 
        className="fixed inset-0 z-0 cursor-pointer"
        onClick={handleClose}
      ></div>

      <div className="relative z-10 rounded-2xl sm:rounded-3xl p-4 sm:p-7 max-w-xl w-full border border-border bg-background shadow-2xl my-auto text-text-primary max-h-[94vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4 sm:mb-6 border-b border-border pb-3 sm:pb-4 gap-3 shrink-0">
          <div>
            <span className="text-[9px] tracking-wider text-brand font-bold uppercase block mb-1">
              {isTechnicianCandidate ? "TARIRA CONNECT • ASSISTÊNCIA TÉCNICA E DOMÉSTICA" : "TARIRA RECRUITMENT • RECRUTAMENTO & SELEÇÃO CORPORATIVA"}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-text-primary font-bold">
              {isTechnicianCandidate ? "Contratar Técnico(a)" : "Recrutar Profissional"}
            </h3>
            <p className="text-xs text-text-secondary font-medium mt-0.5">
              <span className="text-text-primary font-bold">{selectedProfessional.name} {selectedProfessional.surname || ""}</span> • {selectedProfessional.title || "Especialista"}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-border font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Fechar"
            aria-label="Fechar"
          >
            <span className="text-base sm:text-lg leading-none font-bold">✕</span>
          </button>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="mb-4 sm:mb-6 shrink-0">
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] uppercase font-bold text-text-secondary mb-2">
            <span className={hireStep === 1 ? "text-brand font-black" : ""}>
              {isTechnicianCandidate ? "1. Descrição & Mídia" : "1. Descrição & Contrato"}
            </span>
            <span className={hireStep === 2 ? "text-brand font-black" : ""}>
              {isTechnicianCandidate ? "2. Agenda & Local" : "2. Regime & Local"}
            </span>
            <span className={hireStep === 3 ? "text-brand font-black" : ""}>
              {isTechnicianCandidate ? "3. Pagamento" : "3. Proposta"}
            </span>
          </div>
          <div className="w-full bg-background-secondary h-2 rounded-full overflow-hidden border border-border flex">
            <div className={`h-full bg-brand transition-all duration-300 ${hireStep === 1 ? "w-1/3" : hireStep === 2 ? "w-2/3" : "w-full"}`}></div>
          </div>
        </div>

        {/* SCROLLABLE STEPS CONTAINER */}
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 -mr-1 space-y-4">

        {/* ========================================================================= */}
        {/* STEP 1 */}
        {/* ========================================================================= */}
        {hireStep === 1 && (
          <div className="space-y-4 animate-fade-up">
            
            {/* ═══════════════════════ TECHNICIAN MODE (ORIGINAL STEP 1) ═══════════════════════ */}
            {isTechnicianCandidate ? (
              <>
                {/* 1. Modalidade do Atendimento */}
                <div>
                  <label className="text-[9px] tracking-widest text-slate-400 uppercase block font-bold mb-2">
                    Modalidade do Atendimento
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-1.5 rounded-xl border border-border">
                    <button 
                      type="button"
                      onClick={() => setHireForm({...hireForm, type: "normal"})}
                      className={`py-2 rounded-lg text-center text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        hireForm.type === "normal" ? "bg-[#172554] text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      ⚡ Normal
                    </button>
                    <button 
                      type="button"
                      onClick={() => setHireForm({...hireForm, type: "emergency"})}
                      className={`py-2 rounded-lg text-center text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        hireForm.type === "emergency" ? "bg-red-500 text-white font-black shadow-lg" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      🚨 Emergência
                    </button>
                    <button 
                      type="button"
                      onClick={() => setHireForm({...hireForm, type: "scheduled"})}
                      className={`py-2 rounded-lg text-center text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        hireForm.type === "scheduled" ? "bg-[#172554] text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📅 Agendar
                    </button>
                  </div>
                </div>

                {/* 1b. Periodicidade do Serviço (Diário / Semanal / Mensal) */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] tracking-widest text-[#172554] uppercase block font-black">
                      🗓️ Periodicidade do Serviço
                    </label>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">Fatura por {periodLabel}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "daily", title: "Diário", subtitle: "Visita ou serviço pontual num único dia" },
                      { id: "weekly", title: "Semanal", subtitle: "Visitas recorrentes ao longo da semana" },
                      { id: "monthly", title: "Mensal", subtitle: "Contrato de manutenção / apoio contínuo" }
                    ].map((p) => {
                      const isSelected = hireForm.billingPeriod === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setHireForm({
                            ...hireForm,
                            billingPeriod: p.id as any,
                            periodFrequencyDays: p.id === "weekly" ? 3 : p.id === "monthly" ? 12 : 1
                          })}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-blue-50 border-[#172554] text-[#172554] shadow-xs"
                              : "bg-white border-border text-slate-600 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{p.title}</span>
                            {isSelected ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#172554] shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                            )}
                          </div>
                          <span className="text-[8px] text-slate-400 leading-tight">{p.subtitle}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Descreva a Necessidade do Cliente */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] tracking-widest text-slate-400 uppercase block font-bold">
                      Descreva a Necessidade do Cliente *
                    </label>
                    <span className="text-[8px] text-slate-500 font-mono">{hireForm.description.length}/500</span>
                  </div>
                  <textarea 
                    rows={4}
                    maxLength={500}
                    value={hireForm.description}
                    onChange={(e) => setHireForm({...hireForm, description: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-border text-slate-900 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] transition-all placeholder:text-slate-400"
                    placeholder=""
                  />
                  <p className="text-[9px] text-slate-500 italic mt-1 leading-relaxed">
                    💡 Para um orçamento mais preciso, inclua: (1) tipo de problema ou serviço, (2) local exacto onde é necessário, (3) grau de urgência, e (4) resultado esperado.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Reparação Eléctrica", "Canalização", "Ar Condicionado", "Jardinagem", "Limpeza", "Pintura", "Montagem/Carpintaria"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setHireForm((prev) => ({
                          ...prev,
                          description: prev.description ? `${prev.description}${prev.description.endsWith(" ") || prev.description.endsWith(".") ? "" : ". "}${tag}: ` : `${tag}: `
                        }))}
                        className="px-2.5 py-1 rounded-full bg-slate-100 border border-border text-[9px] text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Mensagem de Voz (Instruções Gravadas) */}
                <div className="p-4 rounded-xl border border-border bg-[#F8FAFC] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] tracking-wider text-slate-400 font-bold uppercase block">
                      Mensagem de Voz (Instruções Gravadas)
                    </span>
                    {voiceNoteName && (
                      <span className="text-[9px] text-emerald-400 font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold">
                        ✓ Áudio Gravado
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center justify-center py-2 space-y-3">
                    {isRecording ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex items-end gap-1 h-8">
                          <div className="w-1.5 bg-[#172554] rounded animate-bounce" style={{ height: "70%", animationDelay: "0.1s" }}></div>
                          <div className="w-1.5 bg-[#172554] rounded animate-bounce" style={{ height: "100%", animationDelay: "0.3s" }}></div>
                          <div className="w-1.5 bg-[#172554] rounded animate-bounce" style={{ height: "40%", animationDelay: "0.5s" }}></div>
                          <div className="w-1.5 bg-[#172554] rounded animate-bounce" style={{ height: "85%", animationDelay: "0.2s" }}></div>
                          <div className="w-1.5 bg-[#172554] rounded animate-bounce" style={{ height: "50%", animationDelay: "0.4s" }}></div>
                        </div>
                        <span className="text-xs font-mono text-[#172554] font-bold animate-pulse">
                          A gravar... {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")}
                        </span>
                        
                        <button 
                          type="button"
                          onClick={() => stopRecordingSim(recordingDuration)}
                          className="px-4 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold uppercase flex items-center gap-1.5 cursor-pointer animate-pulse"
                        >
                          ⏹ Parar Gravação
                        </button>
                      </div>
                    ) : voiceNoteName ? (
                      <div className="w-full flex flex-col bg-white p-3.5 rounded-lg border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎙</span>
                            <div className="text-left">
                              <p className="text-[10px] text-slate-900 font-mono truncate max-w-[180px]">{voiceNoteName}</p>
                              <p className="text-[9px] text-slate-400 font-mono font-bold">
                                Duração: {Math.floor(hireForm.voiceDuration / 60)}:{(hireForm.voiceDuration % 60).toString().padStart(2, "0")}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              type="button"
                              onClick={togglePlayVoice}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isPlayingVoice 
                                  ? "bg-[#172554] text-white font-bold animate-pulse" 
                                  : "bg-blue-50 border border-blue-200 text-[#172554] hover:bg-blue-100"
                              }`}
                              title={isPlayingVoice ? "Pausar" : "Ouvir"}
                            >
                              {isPlayingVoice ? "⏸" : "▶"}
                            </button>
                            <button 
                              type="button"
                              onClick={deleteRecordingSim}
                              className="w-7 h-7 rounded-full bg-slate-100 border border-border flex items-center justify-center text-slate-500 hover:text-red-600 transition-all cursor-pointer"
                              title="Apagar"
                            >
                              🗑
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1.5 border-t border-border">
                          <span className="text-[8px] font-mono text-slate-400">00:00</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                            <div 
                              className="h-full bg-[#172554] transition-all duration-100 ease-linear rounded-full"
                              style={{ width: `${voicePlaybackProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-[8px] font-mono text-slate-400">
                            {Math.floor(hireForm.voiceDuration / 60)}:{(hireForm.voiceDuration % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2 py-1">
                        <button 
                          type="button"
                          onClick={startRecordingSim}
                          className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 hover:border-[#172554] flex items-center justify-center text-[#172554] transition-all cursor-pointer"
                        >
                          🎤
                        </button>
                        <span className="text-[10px] text-slate-400">Clique no microfone para gravar uma instrução por voz</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Foto do Problema ou Local do Serviço (Opcional) */}
                <div className="p-4 rounded-xl border border-border bg-[#F8FAFC] space-y-2">
                  <label className="text-[10px] tracking-wider text-slate-400 font-bold uppercase block">
                    Foto do Problema ou Local do Serviço (Opcional)
                  </label>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="px-3 py-2 rounded-lg bg-[#172554] hover:bg-[#172554] text-white border border-[#172554] text-[10px] font-bold cursor-pointer transition-all inline-block text-center">
                      {isUploadingImgBB ? "A carregar..." : "Carregar Foto..."}
                      <input 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            try {
                              const uploadedUrl = await uploadImageToImgBB(file);
                              setHireForm({
                                ...hireForm,
                                photoName: file.name,
                                photoUrl: uploadedUrl
                              });
                            } catch {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setHireForm({
                                  ...hireForm,
                                  photoName: file.name,
                                  photoUrl: reader.result as string
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>
                    {hireForm.photoName ? (
                      <div className="flex items-center gap-2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-[10px] font-mono">
                        <span>📸 {hireForm.photoName}</span>
                        <button 
                          type="button"
                          onClick={() => setHireForm({...hireForm, photoName: "", photoUrl: ""})}
                          className="text-slate-400 hover:text-white ml-1 font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Nenhuma foto anexada</span>
                    )}
                  </div>

                  {hireForm.photoUrl && (
                    <div className="mt-2.5 p-2 rounded-xl border border-border bg-white flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5 self-start">Visualização da Imagem Anexada:</span>
                      <div className="relative group overflow-hidden rounded-lg border border-border max-w-[240px] max-h-[160px] flex items-center justify-center">
                        <img 
                          src={hireForm.photoUrl} 
                          alt="Anexo do Serviço" 
                          className="max-w-full max-h-[160px] object-contain rounded-lg shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ═══════════════════════ PROFESSIONAL RECRUITMENT STEP 1 ═══════════════════════ */
              /* Strictly WITHOUT voice recording, WITHOUT photo upload, and WITHOUT technician tags */
              <div className="space-y-4">
                
                {/* 1. Modelos de Contrato a Serem Escolhidos (Certo, Incerto, Indeterminado) */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] tracking-widest text-[#172554] uppercase block font-black">
                      📋 Modelos de Contrato (Enquadramento Jurídico MZ)
                    </label>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">Direito do Trabalho</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { 
                        id: "termo_certo", 
                        title: "Certo", 
                        fullName: "Termo Certo",
                        subtitle: "Duração pré-fixada (1 mês, 3 meses ou anual), renovável a pedido do cliente" 
                      },
                      { 
                        id: "termo_incerto", 
                        title: "Incerto", 
                        fullName: "Termo Incerto",
                        subtitle: "Vinculado à conclusão da missão, projeto específico ou substituição temporária" 
                      },
                      { 
                        id: "indeterminado", 
                        title: "Indeterminado", 
                        fullName: "Tempo Indeterminado",
                        subtitle: "Contrato permanente de quadro efetivo, sem termo prefixado" 
                      }
                    ].map((ct) => {
                      const isSelected = hireForm.contractType === ct.id;
                      return (
                        <div
                          key={ct.id}
                          onClick={() => setHireForm({ ...hireForm, contractType: ct.id as any })}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "bg-blue-50 border-[#172554] text-[#172554] shadow-xs"
                              : "bg-white border-border text-slate-600 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">{ct.title}</span>
                              <span className="text-[9px] text-[#172554] font-mono">{ct.fullName}</span>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-[#172554] shrink-0" />
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                            )}
                          </div>
                          <span className="text-[8px] text-slate-400 leading-tight mt-1">{ct.subtitle}</span>
                        </div>
                      );
                    })}
                  </div>

                  {isDomesticCategory && (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300/60">
                      <span className="text-sm shrink-0">⚖️</span>
                      <p className="text-[9.5px] text-amber-800 leading-relaxed">
                        <strong>Base legal:</strong> Regulamento do Trabalho Doméstico (Decreto n.º 52/2026, Artigos 8.º e 9.º) — o contrato a termo certo tem duração máxima de <strong>2 anos</strong> e admite, no máximo, <strong>2 renovações</strong>; após esse limite, converte-se automaticamente em contrato por tempo indeterminado.
                      </p>
                    </div>
                  )}

                  {/* 2. Periodicidade do Serviço (A partir de 1 Mês, 3 Meses e Anual / Todos Renováveis) */}
                  {hireForm.contractType !== "indeterminado" ? (
                    <div className="pt-3 border-t border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] tracking-widest text-slate-700 uppercase block font-bold">
                          ⏱️ Periodicidade do Serviço / Duração do Contrato (Renováveis)
                        </label>
                        <span className="text-[9px] text-[#172554] font-mono font-bold">
                          {hireForm.isCustomMonths 
                            ? `${hireForm.contractDurationCustom || "X"} Meses` 
                            : hireForm.contractDurationMonths === 1 
                              ? "1 Mês" 
                              : hireForm.contractDurationMonths === 3 
                                ? "3 Meses" 
                                : hireForm.contractDurationMonths === 12 
                                  ? "Anual (12M)" 
                                  : `${hireForm.contractDurationMonths} Meses`}
                          {hireForm.isRenewable ? " (Renovável)" : ""}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { months: 1, label: "1 Mês", sub: "Renovável" },
                          { months: 3, label: "3 Meses", sub: "Renovável" },
                          { months: 12, label: "Anual (12 Meses)", sub: "Renovável" },
                          { months: -1, label: "Personalizado", sub: "Outro Prazo" }
                        ].map((period) => {
                          const isSelected = period.months === -1 
                            ? hireForm.isCustomMonths 
                            : !hireForm.isCustomMonths && hireForm.contractDurationMonths === period.months;

                          return (
                            <button
                              key={period.label}
                              type="button"
                              onClick={() => {
                                if (period.months === -1) {
                                  setHireForm({ ...hireForm, isCustomMonths: true });
                                } else {
                                  setHireForm({ 
                                    ...hireForm, 
                                    isCustomMonths: false, 
                                    contractDurationMonths: period.months 
                                  });
                                }
                              }}
                              className={`py-2 px-2 rounded-xl text-center transition-all border cursor-pointer flex flex-col items-center justify-center ${
                                isSelected
                                  ? "bg-[#172554] text-white border-[#172554] font-bold shadow-xs"
                                  : "bg-white border-border text-slate-700 hover:border-slate-300 hover:text-slate-900"
                              }`}
                            >
                              <span className="text-[11px] font-bold leading-tight">{period.label}</span>
                              <span className={`text-[8px] mt-0.5 ${isSelected ? "text-white font-bold" : "text-slate-500"}`}>
                                {period.sub}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {hireForm.isCustomMonths && (
                        <div className="flex items-center gap-2 pt-1">
                          <label className="text-[9px] text-slate-400 uppercase font-bold whitespace-nowrap">Especificar Duração:</label>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={hireForm.contractDurationCustom}
                            onChange={(e) => setHireForm({ ...hireForm, contractDurationCustom: e.target.value })}
                            placeholder=""
                            className="bg-white border border-border text-[#172554] font-mono font-bold text-xs rounded-lg px-3 py-1.5 outline-none w-36 focus:border-[#172554]"
                          />
                          <span className="text-[10px] text-slate-400">meses de vigência</span>
                        </div>
                      )}

                      {/* Renovável Cláusula / Nota Flexível */}
                      <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-border flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={hireForm.isRenewable}
                            onChange={(e) => setHireForm({ ...hireForm, isRenewable: e.target.checked })}
                            className="rounded border-border text-[#172554] focus:ring-0 w-4 h-4 cursor-pointer accent-[#172554]"
                          />
                          <span className="text-[10px] text-slate-700 font-medium">
                            Cláusula de <strong>Renovação Flexível</strong> (com possibilidade de renovações assim que o cliente desejar)
                          </span>
                        </label>
                        <p className="text-[8.5px] text-slate-400 italic pl-6">
                          {isDomesticCategory
                            ? "⚖️ Sujeito ao limite legal de 2 renovações (Art. 8.º, Decreto n.º 52/2026) — após esse limite, o contrato converte-se automaticamente em tempo indeterminado."
                            : "ℹ️ Todos os contratos contam com acompanhamento contínuo e podem ser renovados sucessivamente conforme a vontade da empresa."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2.5 border-t border-border">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-900 flex items-start gap-2">
                        <span className="text-sm">✓</span>
                        <span className="leading-relaxed">
                          <strong>Contrato por Tempo Indeterminado (Sem Termo):</strong> Relação de trabalho contínua com integração e período probatório de acordo com o quadro legal da Lei do Trabalho de Moçambique.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Descreva a Vaga / Requisitos Principais do Cargo */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] tracking-widest text-slate-400 uppercase block font-bold">
                      Descrição da Vaga & Requisitos do Cargo *
                    </label>
                    <span className="text-[8px] text-slate-500 font-mono">{hireForm.description.length}/500</span>
                  </div>
                  <textarea 
                    rows={4}
                    maxLength={500}
                    value={hireForm.description}
                    onChange={(e) => setHireForm({...hireForm, description: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-border text-slate-900 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] transition-all placeholder:text-slate-400"
                    placeholder=""
                  />
                </div>

                {/* 4. Observações & Condições Especiais */}
                <div>
                  <label className="text-[9px] tracking-widest text-[#172554] uppercase block font-bold mb-1">
                    📝 Observações & Condições Especiais da Contratação (Opcional)
                  </label>
                  <textarea 
                    rows={2}
                    value={hireForm.observations}
                    onChange={(e) => setHireForm({...hireForm, observations: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-border text-slate-900 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] transition-all placeholder:text-slate-400"
                    placeholder=""
                  />
                </div>

              </div>
            )}

            {/* INLINE VALIDATION WARNING */}
            {stepError && hireStep === 1 && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{stepError}</span>
              </div>
            )}

            {/* NEXT BUTTON */}
            <div className="pt-2 flex justify-end">
              <button 
                type="button"
                onClick={() => {
                  if (!hireForm.description.trim()) {
                    setStepError(isTechnicianCandidate ? "Por favor preencha a descrição da necessidade do serviço." : "Por favor preencha a descrição da vaga / cargo.");
                    return;
                  }
                  setStepError("");
                  setHireStep(2);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#172554] hover:bg-[#172554] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                Passo Seguinte: {isTechnicianCandidate ? "Agenda & Local" : "Regime & Local"} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2 */}
        {/* ========================================================================= */}
        {hireStep === 2 && (
          <div className="space-y-4 animate-fade-up">
            
            {/* DATE & TIME / SCHEDULE */}
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-border">
                <TariraDatePicker
                  label={isTechnicianCandidate ? "Data de Execução do Serviço" : "Data de Início Prevista"}
                  value={hireForm.targetDate || new Date().toISOString().split("T")[0]}
                  onChange={(newDate) => setHireForm({ ...hireForm, targetDate: newDate })}
                />
              </div>

              {/* REGIME DE TRABALHO & CARGA HORÁRIA */}
              {isTechnicianCandidate ? (
                <div>
                  <label className="text-[9px] tracking-widest text-slate-400 uppercase block font-bold mb-1">
                    Horário de Preferência
                  </label>
                  <select 
                    value={hireForm.preferredTime}
                    onChange={(e) => setHireForm({...hireForm, preferredTime: e.target.value as any})}
                    className="w-full bg-[#F8FAFC] border border-border text-slate-900 rounded-xl p-3 text-xs outline-none cursor-pointer focus:bg-white focus:border-[#172554]"
                  >
                    <option value="morning">Manhã (08h - 12h)</option>
                    <option value="afternoon">Tarde (13h - 17h)</option>
                    <option value="evening">Noite (18h - 21h)</option>
                    <option value="any">Qualquer Horário</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] tracking-widest text-slate-700 uppercase block font-bold">
                      ⏳ Regime de Trabalho & Carga Horária (Legislação MZ)
                    </label>
                    <span className="text-[9px] text-[#172554] font-mono font-bold">
                      {hireForm.workSchedule === "full_time" ? "Período Integral (40h/sem)" : hireForm.workSchedule === "part_time" ? "Meio Período (20h/sem)" : "Horário Flexível"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* 1. Período Integral */}
                    <div
                      onClick={() => setHireForm({ ...hireForm, workSchedule: "full_time" })}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        hireForm.workSchedule === "full_time"
                          ? "bg-blue-50 border-[#172554] text-[#172554] shadow-xs ring-1 ring-[#172554]/20"
                          : "bg-white border-border text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900">Período Integral</span>
                          {hireForm.workSchedule === "full_time" ? (
                            <CheckCircle2 className="w-4 h-4 text-[#172554] shrink-0" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#172554] font-mono font-bold block mb-1">
                          40h / semana
                        </span>
                        <p className="text-[8.5px] text-slate-600 leading-tight">
                          Regime normal de 8h/dia, com <strong>1 folga por semana</strong> (ou fim de semana) conforme a Lei do Trabalho de Moçambique.
                        </p>
                      </div>
                      <div className="mt-2.5 pt-1.5 border-t border-border flex items-center justify-between text-[8px] text-emerald-600 font-mono">
                        <span>✓ 1 Folga Semanal</span>
                        <span>8h / dia</span>
                      </div>
                    </div>

                    {/* 2. Meio Período */}
                    <div
                      onClick={() => setHireForm({ ...hireForm, workSchedule: "part_time" })}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        hireForm.workSchedule === "part_time"
                          ? "bg-blue-50 border-[#172554] text-[#172554] shadow-xs ring-1 ring-[#172554]/20"
                          : "bg-white border-border text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900">Meio Período</span>
                          {hireForm.workSchedule === "part_time" ? (
                            <CheckCircle2 className="w-4 h-4 text-[#172554] shrink-0" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#172554] font-mono font-bold block mb-1">
                          20h / semana
                        </span>
                        <p className="text-[8.5px] text-slate-600 leading-tight">
                          Carga reduzida de 4h/dia (manhãs ou tardes), com folgas semanais e alocação flexível de atividades.
                        </p>
                      </div>
                      <div className="mt-2.5 pt-1.5 border-t border-border flex items-center justify-between text-[8px] text-emerald-600 font-mono">
                        <span>✓ Folga Semanal</span>
                        <span>4h / dia</span>
                      </div>
                    </div>

                    {/* 3. Horário Flexível */}
                    <div
                      onClick={() => setHireForm({ ...hireForm, workSchedule: "flexible" })}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        hireForm.workSchedule === "flexible"
                          ? "bg-blue-50 border-[#172554] text-[#172554] shadow-xs ring-1 ring-[#172554]/20"
                          : "bg-white border-border text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900">Horário Flexível</span>
                          {hireForm.workSchedule === "flexible" ? (
                            <CheckCircle2 className="w-4 h-4 text-[#172554] shrink-0" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#172554] font-mono font-bold block mb-1">
                          Por Objetivos & Metas
                        </span>
                        <p className="text-[8.5px] text-slate-400 leading-tight">
                          Horários adaptáveis e livres segundo as metas, entregas e objetivos estipulados pela organização.
                        </p>
                      </div>
                      <div className="mt-2.5 pt-1.5 border-t border-border flex items-center justify-between text-[8px] text-emerald-400 font-mono">
                        <span>✓ Por Metas</span>
                        <span>Auto-gerido</span>
                      </div>
                    </div>
                  </div>

                  {/* Seleção do Regime de Folga Semanal */}
                  {hireForm.workSchedule !== "flexible" && (
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-border space-y-2">
                      <label className="text-[9px] tracking-wider text-slate-700 uppercase font-bold block">
                        🏖️ Regime de Folga Semanal Obrigatória
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "domingo", label: "1 Folga / Semana", sub: "Domingo (Padrão Legal)" },
                          { id: "weekend", label: "2 Folgas / Semana", sub: "Sábado e Domingo" },
                          { id: "rotativa", label: "Folga Rotativa", sub: "Escala da Empresa" }
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setHireForm({ ...hireForm, weeklyDayOff: f.id as any })}
                            className={`p-2 rounded-lg text-left transition-all border text-[10px] cursor-pointer ${
                              hireForm.weeklyDayOff === f.id
                                ? "bg-[#172554] text-white font-bold border-[#172554]"
                                : "bg-white border-border text-slate-600 hover:border-slate-300 hover:text-slate-900"
                            }`}
                          >
                            <span className="block font-bold text-slate-800">{f.label}</span>
                            <span className="text-[8px] text-slate-500">{f.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* WORK MODEL (PROFESSIONALS ONLY) */}
            {!isTechnicianCandidate && (
              <div>
                <label className="text-[9px] tracking-widest text-slate-400 uppercase block font-bold mb-1">
                  Modelo de Trabalho Pretendido
                </label>
                <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-1.5 rounded-xl border border-border">
                  {[
                    { id: "presential", label: "🏢 Presencial" },
                    { id: "hybrid", label: "🔄 Híbrido" },
                    { id: "remote", label: "💻 Remoto" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setHireForm({ ...hireForm, workModel: m.id as any })}
                      className={`py-2 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer ${
                        hireForm.workModel === m.id ? "bg-[#172554] text-white font-bold shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LOCATION */}
            <div>
              <label className="text-[9px] tracking-widest text-slate-400 uppercase block font-bold mb-1">
                {isTechnicianCandidate ? "Localização Exacta para Despacho *" : "Localização / Sede da Empresa (Cidade & Endereço) *"}
              </label>
              <input 
                type="text"
                required
                value={hireForm.location}
                onChange={(e) => {
                  setHireForm({...hireForm, location: e.target.value});
                  if (stepError) setStepError("");
                }}
                placeholder=""
                className="w-full bg-[#F8FAFC] border border-border text-slate-900 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#172554] space-y-1">
              <p className="font-bold">📍 Cobertura Territorial TARIRA:</p>
              <p className="text-[11px] text-slate-600">
                O candidato {selectedProfessional.name} encontra-se baseado em {selectedProfessional.city || "Maputo"} com disponibilidade para atendimento e prestação no endereço indicado.
              </p>
            </div>

            {/* INLINE VALIDATION WARNING */}
            {stepError && hireStep === 2 && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{stepError}</span>
              </div>
            )}

            <div className="pt-2 flex justify-between">
              <button 
                type="button"
                onClick={() => {
                  setStepError("");
                  setHireStep(1);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 border border-border text-slate-700 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer hover:bg-slate-200"
              >
                Voltar
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (!hireForm.location.trim()) {
                    setStepError("Por favor indique a localização ou endereço da prestação.");
                    return;
                  }
                  setStepError("");
                  setHireStep(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#172554] hover:bg-[#172554] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                Passo Seguinte: {isTechnicianCandidate ? "Orçamento & Pagamento" : "Proposta & Confirmação"} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3 */}
        {/* ========================================================================= */}
        {hireStep === 3 && (
          <div className="space-y-4 animate-fade-up">
            
            {/* SUMMARY CARD */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-border space-y-3">
              <span className="text-[9px] tracking-wider text-[#172554] font-bold uppercase block mb-1">
                {isTechnicianCandidate ? "RESUMO DO PEDIDO DE ASSISTÊNCIA TÉCNICA" : "RESUMO DA PROPOSTA DE CONTRATAÇÃO"}
              </span>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Candidato / Especialista</p>
                  <p className="text-slate-900 font-bold">{selectedProfessional.name} {selectedProfessional.surname || ""}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Função / Categoria</p>
                  <p className="text-[#172554] font-bold">{selectedProfessional.title || "Especialista"}</p>
                </div>

                {!isTechnicianCandidate ? (
                  <>
                    <div className="p-2 rounded-xl bg-white border border-border">
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Modalidade & Periodicidade</p>
                      <p className="text-[#172554] font-bold text-[11px]">{getContractTypeLabel()}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-border">
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Regime & Carga Horária</p>
                      <p className="text-[#172554] font-bold text-[11px]">
                        {hireForm.workSchedule === "full_time" 
                          ? `Período Integral (40h/sem • ${hireForm.weeklyDayOff === "weekend" ? "2 folgas/semana" : "1 folga/semana"})`
                          : hireForm.workSchedule === "part_time"
                          ? "Meio Período (20h/semana • folga regular)"
                          : "Horário Flexível (Por Objetivos / Metas)"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Periodicidade</p>
                      <p className="text-[#172554] font-bold text-[11px]">
                        {hireForm.billingPeriod === "daily" ? "🗓️ Diário" : hireForm.billingPeriod === "weekly" ? `🗓️ Semanal (${hireForm.periodFrequencyDays}d/sem)` : `🗓️ Mensal (${hireForm.periodFrequencyDays}d/mês)`}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[9px] uppercase font-bold">Tipo de Atendimento</p>
                      <p className="text-slate-900 font-bold">
                        {hireForm.type === "emergency" ? "🚨 Emergência" : hireForm.type === "scheduled" ? "📅 Agendado" : "⚡ Normal"}
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">
                    {isTechnicianCandidate ? "Data de Execução" : "Início Previsto"}
                  </p>
                  <p className="text-slate-900 font-medium">{hireForm.targetDate || "Imediato"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[9px] uppercase font-bold">Localização</p>
                  <p className="text-slate-900 font-medium truncate">{hireForm.location}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-border text-xs">
                <p className="text-slate-400 text-[9px] uppercase font-bold mb-1">
                  {isTechnicianCandidate ? "Descrição do Serviço" : "Descrição do Cargo / Vaga"}
                </p>
                <p className="text-slate-600 italic leading-relaxed truncate max-w-full">"{hireForm.description}"</p>
              </div>

              {!isTechnicianCandidate && hireForm.observations && (
                <div className="pt-2 border-t border-border text-xs">
                  <p className="text-[#172554] text-[9px] uppercase font-bold mb-1">Observações & Condições Especiais</p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{hireForm.observations}</p>
                </div>
              )}
            </div>

            {/* ═══════════════════════ TECHNICIAN: HOURLY WORKLOAD ESTIMATE, TOTAL & PAYMENT DETAILS ═══════════════════════ */}
            {isTechnicianCandidate ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-border space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="text-[10px] tracking-wider text-[#172554] font-bold uppercase block">
                      Volume de Trabalho & Estimativa Orçamental
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-50 text-[#172554] border border-blue-200">
                      Preço Transparente
                    </span>
                  </div>

                  {/* Slider Horas por visita */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-bold">Carga Horária {hireForm.billingPeriod === "daily" ? "Estimada" : "por Visita"}:</span>
                      <span className="font-mono font-bold text-[#172554] text-sm">
                        {hireForm.connectWorkloadHours} {hireForm.connectWorkloadHours === 1 ? "Hora" : "Horas"}
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="12"
                      step="1"
                      value={hireForm.connectWorkloadHours}
                      onChange={(e) => setHireForm({ ...hireForm, connectWorkloadHours: parseInt(e.target.value, 10) })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#172554]"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>1h (Rápido)</span>
                      <span>4h (Padrão)</span>
                      <span>8h (Dia Completo)</span>
                      <span>12h (Turno Extendido)</span>
                    </div>

                    {isDomesticCategory && (
                      <div className={`flex items-start gap-2 p-2.5 rounded-xl border ${
                        hireForm.connectWorkloadHours > 8
                          ? "bg-rose-50 border-rose-300/60"
                          : "bg-amber-50 border-amber-300/60"
                      }`}>
                        <span className="text-sm shrink-0">⚖️</span>
                        <p className={`text-[9.5px] leading-relaxed ${hireForm.connectWorkloadHours > 8 ? "text-rose-700" : "text-amber-800"}`}>
                          <strong>Base legal:</strong> Regulamento do Trabalho Doméstico (Decreto n.º 52/2026, Artigo 25.º) — o período normal de trabalho doméstico não pode ser superior a <strong>8 horas/dia</strong> e <strong>48 horas/semana</strong>.
                          {hireForm.connectWorkloadHours > 8 && (
                            <span className="block mt-1 font-bold">⚠️ A carga horária selecionada excede o limite legal diário — ajuste para 8h ou menos, ou formalize como regime de horas extraordinárias.</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Frequência de Visitas (apenas Semanal / Mensal) */}
                  {hireForm.billingPeriod !== "daily" && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-bold">
                          Dias de Visita por {hireForm.billingPeriod === "weekly" ? "Semana" : "Mês"}:
                        </span>
                        <span className="font-mono font-bold text-[#172554] text-sm">
                          {hireForm.periodFrequencyDays} {hireForm.periodFrequencyDays === 1 ? "Dia" : "Dias"}
                        </span>
                      </div>
                      <input 
                        type="range"
                        min="1"
                        max={hireForm.billingPeriod === "weekly" ? 6 : 26}
                        step="1"
                        value={hireForm.periodFrequencyDays}
                        onChange={(e) => setHireForm({ ...hireForm, periodFrequencyDays: parseInt(e.target.value, 10) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#172554]"
                      />
                      <p className="text-[9px] text-slate-500 italic">
                        Ex: {hireForm.billingPeriod === "weekly" ? "3 dias/semana para manutenção recorrente" : "12 dias/mês para apoio técnico contínuo"}
                      </p>
                    </div>
                  )}

                  {/* Nível de Esforço */}
                  <div>
                    <label className="text-[9px] tracking-widest text-slate-400 uppercase block font-bold mb-1.5">
                      Nível de Esforço e Complexidade
                    </label>
                    <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-xl border border-border">
                      {[
                        { id: "light", label: "Leve", mult: "1.0x" },
                        { id: "medium", label: "Médio", mult: "1.1x" },
                        { id: "heavy", label: "Pesado", mult: "1.3x" }
                      ].map((eff) => (
                        <button
                          key={eff.id}
                          type="button"
                          onClick={() => setHireForm({ ...hireForm, connectEffortLevel: eff.id as any })}
                          className={`py-1.5 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer ${
                            hireForm.connectEffortLevel === eff.id
                              ? "bg-[#172554] text-white font-bold shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {eff.label} ({eff.mult})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Total Breakdown */}
                  <div className="p-3 bg-white rounded-xl border border-border space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>
                        Mão de Obra ({techHours}h × {techHourlyRate} MZN/h{periodVisitDays > 1 ? ` × ${periodVisitDays} dias` : ""}):
                      </span>
                      <span className="font-mono">{techBaseAmount.toLocaleString()} MZN</span>
                    </div>
                    {isEmergency && (
                      <div className="flex justify-between text-red-400">
                        <span>Taxa de Despacho de Emergência:</span>
                        <span className="font-mono">+{emergencyFee.toLocaleString()} MZN</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-border text-slate-900 font-bold text-sm">
                      <span className="text-[#172554]">Total Estimado ({hireForm.billingPeriod === "daily" ? "Diário" : hireForm.billingPeriod === "weekly" ? "Semanal" : "Mensal"}):</span>
                      <span className="font-mono text-base text-[#172554] font-black">{techTotalEstimate.toLocaleString()} MZN / {periodLabel}</span>
                    </div>
                  </div>

                  {/* Modalidade de Pagamento do Técnico */}
                  <div className="pt-2 border-t border-border space-y-2">
                    <label className="text-[9px] tracking-widest text-slate-700 uppercase block font-bold">
                      Modalidade de Liquidação do Técnico
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        onClick={() => setHireForm({ ...hireForm, paymentModality: "half" })}
                        className={`p-2.5 rounded-xl border cursor-pointer text-left transition-all ${
                          hireForm.paymentModality === "half"
                            ? "bg-blue-50 border-[#172554] text-[#172554] font-bold shadow-xs"
                            : "bg-white border-border text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">50% Adiantamento Inicial</p>
                        <p className="text-[9px] text-slate-500 mt-0.5 font-mono">
                          {Math.round(techTotalEstimate / 2).toLocaleString()} MZN agora + 50% após conclusão
                        </p>
                      </div>

                      <div
                        onClick={() => setHireForm({ ...hireForm, paymentModality: "full" })}
                        className={`p-2.5 rounded-xl border cursor-pointer text-left transition-all ${
                          hireForm.paymentModality === "full"
                            ? "bg-blue-50 border-[#172554] text-[#172554] font-bold shadow-xs"
                            : "bg-white border-border text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">100% Pagamento Integral</p>
                        <p className="text-[9px] text-slate-500 mt-0.5 font-mono">
                          {techTotalEstimate.toLocaleString()} MZN sob custódia protegida TARIRA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TECHNICIAN PAYMENT CHANNEL & BANK ACCOUNTS */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] tracking-wider text-[#172554] font-bold uppercase block">
                      💳 Canal de Pagamento & Liquidação Directa
                    </span>
                    <span className="text-[9px] text-emerald-600 font-mono font-bold">
                      Garantia Escrow TARIRA
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: "card", label: "Cartão de Débito 🇲🇿", desc: "Visa / Mastercard / BIM / Standard", badge: "Directo" },
                      { id: "mpesa", label: "M-Pesa 🇲🇿", desc: "Carteira Vodacom", badge: "Imediato" },
                      { id: "emola", label: "e-Mola 🇲🇿", desc: "Carteira Movitel", badge: "Imediato" },
                      { id: "izi", label: "IZI / M-Kesh 🇲🇿", desc: "Carteira Bancária", badge: "Imediato" },
                      { id: "bank", label: "Transf. Bancária 🇲🇿", desc: "Standard Bank / BIM", badge: "Depósito" }
                    ].map((ch) => (
                      <div 
                        key={ch.id}
                        onClick={() => setHireForm({ ...hireForm, paymentChannel: ch.id as any })}
                        className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all flex flex-col justify-between min-h-[64px] ${
                          hireForm.paymentChannel === ch.id 
                            ? "bg-blue-50 border-[#172554] shadow-xs text-[#172554] ring-1 ring-[#172554]/20" 
                            : "bg-white border-border hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 block leading-tight">{ch.label}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[8px] text-slate-500 truncate">{ch.desc}</span>
                          <span className="text-[7px] font-mono px-1 py-0.2 rounded bg-blue-100 text-[#172554] font-bold">{ch.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DEBIT CARD DETAILS FORM */}
                  {hireForm.paymentChannel === "card" && (
                    <div className="bg-[#F8FAFC] p-4 rounded-xl border border-border space-y-3 animate-fade-up">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="text-xs font-bold text-[#172554] flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#172554]" />
                          <span>Dados do Cartão de Débito para Liquidação</span>
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono font-bold">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>Débito Seguro Criptografado</span>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-[9px] tracking-wider text-slate-700 uppercase font-bold block mb-1">
                            Número do Cartão de Débito (16 dígitos) *
                          </label>
                          <div className="relative">
                            <input 
                              type="text"
                              required
                              maxLength={19}
                              value={debitCard.cardNumber}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                                const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
                                setDebitCard({ ...debitCard, cardNumber: formatted });
                              }}
                              placeholder=""
                              className="w-full bg-white border border-border text-[#172554] font-mono font-bold text-sm rounded-xl p-2.5 pl-3 outline-none focus:border-[#172554] tracking-wider"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[9px] font-mono text-slate-400">
                              <span>🇲🇿 Ponto 24 / Visa</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] tracking-wider text-slate-700 uppercase font-bold block mb-1">
                              Nome no Cartão (Titular) *
                            </label>
                            <input 
                              type="text"
                              required
                              value={debitCard.cardHolder}
                              onChange={(e) => setDebitCard({ ...debitCard, cardHolder: e.target.value })}
                              placeholder=""
                              className="w-full bg-white border border-border text-slate-900 font-medium uppercase text-xs rounded-xl p-2.5 outline-none focus:border-[#172554]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] tracking-wider text-slate-700 uppercase font-bold block mb-1">
                                Validade (Mês/Ano)
                              </label>
                              <div className="flex gap-1">
                                <select
                                  value={debitCard.expiryMonth}
                                  onChange={(e) => setDebitCard({ ...debitCard, expiryMonth: e.target.value })}
                                  className="w-1/2 bg-white border border-border text-[#172554] font-mono text-xs rounded-xl p-2 outline-none focus:border-[#172554]"
                                >
                                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(m => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                                <select
                                  value={debitCard.expiryYear}
                                  onChange={(e) => setDebitCard({ ...debitCard, expiryYear: e.target.value })}
                                  className="w-1/2 bg-white border border-border text-[#172554] font-mono text-xs rounded-xl p-2 outline-none focus:border-[#172554]"
                                >
                                  {["26", "27", "28", "29", "30", "31"].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[9px] tracking-wider text-slate-700 uppercase font-bold block mb-1">
                                CVV / CVC
                              </label>
                              <input 
                                type="password"
                                maxLength={4}
                                value={debitCard.cvv}
                                onChange={(e) => setDebitCard({ ...debitCard, cvv: e.target.value.replace(/\D/g, '') })}
                                placeholder=""
                                className="w-full bg-white border border-border text-[#172554] font-mono text-center font-bold text-xs rounded-xl p-2 outline-none focus:border-[#172554]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[10px] text-emerald-900">
                          <span>Montante a debitar no cartão:</span>
                          <strong className="font-mono text-xs text-[#172554] font-black">
                            {hireForm.paymentModality === "half" ? Math.round(techTotalEstimate / 2).toLocaleString() : techTotalEstimate.toLocaleString()} MZN
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BANK DETAILS (Standard Bank & Millennium BIM) */}
                  {hireForm.paymentChannel === "bank" && (
                    <div className="bg-[#F8FAFC] p-4 rounded-xl border border-border space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="text-xs font-bold text-[#172554] flex items-center gap-1.5">
                          <span>🏦</span> Contas Bancárias Oficiais para Pagamento:
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">Moçambique (MZN)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Standard Bank */}
                        <div className="p-3 rounded-xl bg-white border border-border space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">Standard Bank Moçambique</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">Standard</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Número de Conta: <strong className="text-[#172554] font-mono text-xs select-all">1029384756</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            NIB: <strong className="text-slate-800 font-mono select-all">0008 0000 1029 3847 5612 8</strong>
                          </p>
                        </div>

                        {/* Millennium BIM */}
                        <div className="p-3 rounded-xl bg-white border border-border space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">Millennium BIM</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">BIM</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Número de Conta: <strong className="text-[#172554] font-mono text-xs select-all">458291048</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            NIB: <strong className="text-slate-800 font-mono select-all">0001 0000 0458 2910 4899 1</strong>
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-400">Titular da Conta: </span>
                          <strong className="text-slate-900 font-medium">TARIRA SERVIÇOS & TECNOLOGIA, LDA</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Referência do Pagamento: </span>
                          <strong className="text-[#172554] font-mono">TEC-{(selectedProfessional.id || "001").replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase()}</strong>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 italic">
                        ℹ️ Efectue o pagamento ou depósito com o número de conta acima. O comprovativo pode ser apresentado ao técnico ou verificado no sistema.
                      </p>
                    </div>
                  )}

                  {/* MOBILE WALLET (M-Pesa / e-Mola / IZI) */}
                  {hireForm.paymentChannel !== "bank" && hireForm.paymentChannel !== "card" && (
                    <div className="space-y-2 pt-1 bg-[#F8FAFC] p-3 rounded-xl border border-border">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] tracking-wider text-slate-700 uppercase font-bold">
                          Número da Carteira Móvel para Débito / Notificação USSD:
                        </label>
                        <span className="text-[9px] text-[#172554] font-mono font-bold">
                          {hireForm.paymentChannel === "mpesa" ? "Vodacom M-Pesa" : hireForm.paymentChannel === "emola" ? "Movitel e-Mola" : "IZI / M-Kesh"}
                        </span>
                      </div>
                      <input 
                        type="text"
                        placeholder=""
                        className="w-full bg-white border border-border text-[#172554] font-mono font-bold rounded-xl p-2.5 text-xs outline-none focus:border-[#172554]"
                      />
                      <p className="text-[9px] text-slate-400 italic">
                        Será emitido um pedido USSD de confirmação no telemóvel para liquidação da quantia de {hireForm.paymentModality === "half" ? Math.round(techTotalEstimate / 2).toLocaleString() : techTotalEstimate.toLocaleString()} MZN.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ═══════════════════════ PROFESSIONAL: SALARY PROPOSAL & CORPORATE SALARY PROCESS ═══════════════════════ */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-border space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-2">
                    <span className="text-[10px] tracking-wider text-[#172554] font-bold uppercase block">
                      Proposta Salarial & Negociação Corporativa
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 w-fit">
                      Contratação Directa TARIRA Recruit
                    </span>
                  </div>

                  {/* Salário Mensal Proposto */}
                  <div className="bg-white p-3.5 rounded-xl border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-700 font-bold uppercase block">
                        Salário Mensal Proposto (MZN / mês) *
                      </label>
                      <span className="text-[9px] text-[#172554] font-mono">Remuneração Base</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        min={5000}
                        step={1000}
                        value={hireForm.recruitmentSalaryProposal || 25000}
                        onChange={(e) => setHireForm({ ...hireForm, recruitmentSalaryProposal: Number(e.target.value) })}
                        className="w-full bg-[#F8FAFC] border border-border text-[#172554] font-mono font-bold text-sm rounded-xl p-2.5 outline-none focus:bg-white focus:border-[#172554]"
                        placeholder=""
                      />
                      <span className="text-xs font-bold text-slate-700 whitespace-nowrap">MZN / mês</span>
                    </div>
                  </div>

                  {/* AVISO IMPORTANTE: O PAGAMENTO A PROFISSIONAIS NÃO É FEITO VIA PORTAL */}
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💼</span>
                      <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider">
                        Modalidade de Pagamento da Remuneração (Transferência Salarial Directa)
                      </h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      O pagamento da remuneração deste profissional <strong>não é efectuado via portal</strong>. A remuneração mensal acordada é <strong>transferida e liquidada directamente pela unidade de negócio / empresa contratante no final de cada mês</strong>, mediante o processamento salarial interno da sua organização.
                    </p>
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-[10px] text-emerald-900 flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>A TARIRA Recruit realiza o enquadramento, triagem prévia, formalização da minuta e garantia de substituição em 24-48h.</span>
                    </div>
                  </div>

                  {/* E-mail Corporativo */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] text-slate-700 font-bold uppercase block">
                      E-mail Corporativo para Envio da Minuta Contratual *
                    </label>
                    <input 
                      type="email"
                      required
                      value={hireForm.negotiationEmail || ""}
                      onChange={(e) => setHireForm({ ...hireForm, negotiationEmail: e.target.value })}
                      placeholder=""
                      className="w-full bg-white border border-border text-slate-900 font-medium rounded-xl p-2.5 text-xs outline-none focus:border-[#172554] placeholder:text-slate-400"
                    />
                    <p className="text-[9px] text-slate-400 italic">
                      A equipa executiva da TARIRA enviará a minuta formal do contrato e as credenciais de validação para este e-mail.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* INLINE VALIDATION / SUBMISSION ERROR — estava em falta no passo 3, fazendo o erro "desaparecer" silenciosamente */}
            {stepError && hireStep === 3 && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{stepError}</span>
              </div>
            )}

            {/* CONFIRMATION ACTIONS */}
            <div className="pt-2 flex justify-between">
              <button 
                type="button"
                onClick={() => setHireStep(2)}
                className="px-5 py-2.5 rounded-xl bg-background-secondary border border-border text-text-secondary hover:text-text-primary text-xs font-bold transition-all cursor-pointer shadow-sm hover:bg-border"
              >
                Voltar
              </button>
              
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmHire}
                className="px-8 py-3 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold hover:scale-[1.01] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "A processar..." : isTechnicianCandidate ? "Confirmar Solicitação de Serviço ⚡" : "Confirmar Proposta de Contratação ⚡"}
              </button>
            </div>
          </div>
        )}

        </div> {/* END SCROLLABLE STEPS CONTAINER */}

      </div>

      {/* RECEIPT MODAL */}
      {isReceiptModalOpen && issuedReceipt && (
        <TariraServiceReceiptModal
          receipt={issuedReceipt}
          onClose={() => {
            setIsReceiptModalOpen(false);
            handleClose();
          }}
          onOpenEvaluation={(hId) => {
            setIsReceiptModalOpen(false);
            setReviewHireId(hId);
            setIsReviewModalOpen(true);
          }}
        />
      )}

      {/* SERVICE REVIEW MODAL */}
      {isReviewModalOpen && reviewHireId && (
        <TariraServiceReviewModal
          isOpen={isReviewModalOpen}
          hireId={reviewHireId}
          candidateName={`${selectedProfessional.name} ${selectedProfessional.surname || ""}`.trim()}
          serviceTitle={selectedProfessional.title || "Assistência Técnica"}
          onClose={() => {
            setIsReviewModalOpen(false);
            handleClose();
          }}
          onSuccess={() => {
            triggerOperationLog(
              "SERVICE_REVIEWED",
              `Avaliação e pontuação registada com sucesso para ${selectedProfessional.name}.`
            );
          }}
        />
      )}
    </div>
  );
}
