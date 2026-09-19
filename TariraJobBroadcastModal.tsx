import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Linkedin,
  MessageCircle,
  Mail,
  Facebook,
  Sparkles,
  ExternalLink,
  Eye,
  Sliders,
  Maximize2,
  ShieldCheck,
  Building2,
  MapPin,
  Briefcase,
  CheckCircle2,
  Calendar,
  Layers,
  FileImage,
  RefreshCw,
  Send,
  Smartphone
} from 'lucide-react';

export interface JobBroadcastPayload {
  id?: string;
  companyName: string;
  jobTitle: string;
  category?: string;
  location?: string;
  workModel?: 'Presencial' | 'Híbrido' | 'Remoto' | string;
  seniority?: string;
  headcount?: number;
  salaryBudget?: string;
  urgency?: string;
  mandatoryCriteria?: string;
  desirableCriteria?: string;
  applicationUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  benefits?: string;
  deadline?: string;
}

interface TariraJobBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobData: JobBroadcastPayload;
  onLogAudit?: (action: string, details: string) => void;
}

type AspectRatioMode = '1:1' | '1.91:1' | '9:16';
type FlyerTheme = 'executive_dark' | 'tech_navy' | 'clean_gold';

export const TariraJobBroadcastModal: React.FC<TariraJobBroadcastModalProps> = ({
  isOpen,
  onClose,
  jobData: initialJobData,
  onLogAudit
}) => {
  if (!isOpen) return null;

  // Editable job state
  const [job, setJob] = useState<JobBroadcastPayload>({
    id: initialJobData.id || `VAGA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    companyName: initialJobData.companyName || 'Empresa Contratante',
    jobTitle: initialJobData.jobTitle || 'Especialista Técnico / Profissional',
    category: initialJobData.category || 'Tecnologia & Inovação',
    location: initialJobData.location || 'Maputo, Moçambique',
    workModel: initialJobData.workModel || 'Híbrido',
    seniority: initialJobData.seniority || 'Sénior / Especialista',
    headcount: initialJobData.headcount || 1,
    salaryBudget: initialJobData.salaryBudget || 'Pacote Competitivo + Benefícios de Saúde',
    urgency: initialJobData.urgency || 'Normal (3-5 dias)',
    mandatoryCriteria: initialJobData.mandatoryCriteria || '• Experiência comprovada superior a 3 anos\n• Formação relevante na área ou certificações técnicas\n• Forte capacidade analítica e autonomia profissional',
    desirableCriteria: initialJobData.desirableCriteria || '• Domínio de inglês profissional\n• Experiência prévia em ambientes corporativos',
    applicationUrl: initialJobData.applicationUrl || `https://tarira.co.mz/vagas/candidatura?ref=${initialJobData.id || 'REQ-MZ'}`,
    contactEmail: initialJobData.contactEmail || 'tarira.ecossistema@gmail.com',
    contactPhone: initialJobData.contactPhone || '+258 84 000 0000',
    benefits: initialJobData.benefits || 'Seguro de Saúde • Subsídio de Transporte • Formação Contínua',
    deadline: initialJobData.deadline || 'Até 15 dias após publicação'
  });

  // Presentation State
  const [activeTab, setActiveTab] = useState<'flyer' | 'linkedin_copy' | 'multichannel' | 'edit'>('flyer');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('1:1');
  const [flyerTheme, setFlyerTheme] = useState<FlyerTheme>('tech_navy');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState(false);
  const [flyerPreviewUrl, setFlyerPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper to copy text
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 3000);
    if (onLogAudit) {
      onLogAudit('COPIA_TEXTO_DISPARO', `Copiado texto de disparo para ${key} referente à vaga: ${job.jobTitle}`);
    }
  };

  // Generate LinkedIn Formatted Post Text
  const linkedInPostText = `📢 ESTAMOS A CONTRATAR EM MOÇAMBIQUE! 🇲🇿
${job.companyName.toUpperCase()} • EM PARCERIA COM TARIRA RECRUIT

💼 Oportunidade: ${job.jobTitle}
🏢 Empresa: ${job.companyName}
📍 Localização: ${job.location}
💼 Regime: ${job.workModel} • ${job.seniority}
👥 Vagas Abertas: ${job.headcount} ${job.headcount > 1 ? 'vagas' : 'vaga'}

🎯 Principais Requisitos:
${job.mandatoryCriteria ? job.mandatoryCriteria.split('\n').filter(Boolean).map(l => l.startsWith('•') ? l : `• ${l}`).join('\n') : '• Experiência comprovada na área\n• Autonomia e rigor profissional'}

${job.desirableCriteria ? `✨ Requisitos Desejáveis:\n${job.desirableCriteria.split('\n').filter(Boolean).map(l => l.startsWith('•') ? l : `• ${l}`).join('\n')}\n` : ''}
💰 Pacote & Benefícios:
${job.salaryBudget}
${job.benefits ? `(${job.benefits})` : ''}

🔗 COMO CANDIDATAR-SE:
As candidaturas são processadas com triagem oficial via ecossistema TARIRA:
👉 Link de Candidatura: ${job.applicationUrl}
📧 E-mail Oficial: ${job.contactEmail}
📱 Telefone / Suporte de R&S: ${job.contactPhone}

⏳ Prazo de Submissão: ${job.deadline}

#VagasMocambique #EmpregoMZ #Recrutamento #VagasDeEmprego #TariraRecruit #OportunidadeDeTrabalho #TalentosMZ #Maputo #Hiring #Carreira #Vagas${job.category?.replace(/\s+/g, '') || 'Tech'}`;

  // WhatsApp formatted text
  const whatsAppPostText = `📢 *VAGA DE EMPREGO EM MOÇAMBIQUE* 🇲🇿
*${job.companyName.toUpperCase()}* • TARIRA RECRUIT

💼 *Cargo:* ${job.jobTitle}
📍 *Local:* ${job.location}
🏢 *Regime:* ${job.workModel} (${job.seniority})
👥 *Vagas:* ${job.headcount}

🎯 *Requisitos Principais:*
${job.mandatoryCriteria ? job.mandatoryCriteria.split('\n').filter(Boolean).map(l => l.startsWith('•') ? l : `• ${l}`).join('\n') : '• Experiência comprovada na função'}

💰 *Remuneração / Benefícios:*
${job.salaryBudget}

👉 *Candidaturas Oficiais aqui:*
${job.applicationUrl}

✉️ *Dúvidas / Envio de CV:*
${job.contactEmail} | ${job.contactPhone}

_Partilhe com profissionais qualificados da sua rede!_`;

  // Draw Flyer on Canvas
  const drawFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions according to LinkedIn standard
    let width = 1080;
    let height = 1080;
    if (aspectRatio === '1.91:1') {
      width = 1200;
      height = 627;
    } else if (aspectRatio === '9:16') {
      width = 1080;
      height = 1920;
    }

    canvas.width = width;
    canvas.height = height;

    // Theme Color Palettes
    let bgGradientStart = '#0b1329';
    let bgGradientEnd = '#030712';
    let primaryGold = '#f59e0b';
    let lightGold = '#fde68a';
    let textPrimary = '#ffffff';
    let textSecondary = '#cbd5e1';
    let cardBg = 'rgba(15, 23, 42, 0.75)';
    let cardBorder = 'rgba(245, 158, 11, 0.35)';

    if (flyerTheme === 'executive_dark') {
      bgGradientStart = '#18181b';
      bgGradientEnd = '#09090b';
      primaryGold = '#eab308';
      lightGold = '#fef08a';
      cardBg = 'rgba(24, 24, 27, 0.85)';
      cardBorder = 'rgba(234, 179, 8, 0.4)';
    } else if (flyerTheme === 'clean_gold') {
      bgGradientStart = '#0f172a';
      bgGradientEnd = '#1e1b4b';
      primaryGold = '#d97706';
      lightGold = '#fbbf24';
      cardBg = 'rgba(30, 41, 59, 0.85)';
      cardBorder = 'rgba(217, 119, 6, 0.4)';
    }

    // 1. Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, bgGradientStart);
    bgGradient.addColorStop(1, bgGradientEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative geometric glows
    const radGlow1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 10, width * 0.85, height * 0.15, width * 0.4);
    radGlow1.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
    radGlow1.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow1;
    ctx.fillRect(0, 0, width, height);

    const radGlow2 = ctx.createRadialGradient(width * 0.1, height * 0.85, 10, width * 0.1, height * 0.85, width * 0.35);
    radGlow2.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    radGlow2.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow2;
    ctx.fillRect(0, 0, width, height);

    // Top Brand Bar & Tarira Official Badge
    const pad = width * 0.06;
    let currY = pad;

    // Outer framing border
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(pad * 0.5, pad * 0.5, width - pad, height - pad);

    // 2. Top Header: TARIRA RECRUIT • VAGA OFICIAL
    ctx.fillStyle = primaryGold;
    ctx.font = `bold ${Math.round(width * 0.024)}px monospace`;
    ctx.fillText('TARIRA RECRUIT • SELEÇÃO CORPORATIVA & TALENTOS MZ', pad, currY);

    // Official Verification Pill (Right aligned)
    const badgeText = `VAGA VERIFICADA • REF: ${job.id}`;
    ctx.font = `bold ${Math.round(width * 0.018)}px sans-serif`;
    const badgeW = ctx.measureText(badgeText).width + 30;
    const badgeH = width * 0.035;
    const badgeX = width - pad - badgeW;
    const badgeY = currY - badgeH * 0.75;

    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = primaryGold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = lightGold;
    ctx.fillText(badgeText, badgeX + 15, badgeY + badgeH * 0.68);

    currY += width * 0.07;

    // 3. Main Call to Action: "ESTAMOS A CONTRATAR"
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.round(width * 0.065)}px "Times New Roman", serif`;
    ctx.fillText('ESTAMOS A CONTRATAR', pad, currY);

    currY += width * 0.035;
    ctx.fillStyle = primaryGold;
    ctx.font = `bold ${Math.round(width * 0.024)}px sans-serif`;
    ctx.fillText('WE ARE HIRING • OPORTUNIDADE PROFISSIONAL', pad, currY);

    currY += width * 0.045;

    // 4. Job Title Hero Card (White on Dark Glass)
    const cardW = width - pad * 2;
    const isLandscape = aspectRatio === '1.91:1';
    const heroCardH = isLandscape ? height * 0.28 : height * 0.22;

    ctx.fillStyle = cardBg;
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pad, currY, cardW, heroCardH, 20);
    ctx.fill();
    ctx.stroke();

    // Inside Hero Card: Position Title & Company
    let insideY = currY + heroCardH * 0.35;
    ctx.fillStyle = textPrimary;
    ctx.font = `bold ${Math.round(width * 0.045)}px sans-serif`;
    
    // Fit text if too long
    let titleText = job.jobTitle;
    if (ctx.measureText(titleText).width > cardW - 40) {
      titleText = titleText.substring(0, 32) + '...';
    }
    ctx.fillText(titleText, pad + 30, insideY);

    insideY += width * 0.04;
    ctx.fillStyle = lightGold;
    ctx.font = `bold ${Math.round(width * 0.028)}px sans-serif`;
    ctx.fillText(`Empresa: ${job.companyName}`, pad + 30, insideY);

    // Pill tags (Location, Regime, Senioridade)
    insideY += width * 0.04;
    const pills = [
      `📍 ${job.location}`,
      `💼 ${job.workModel}`,
      `⭐ ${job.seniority}`,
      `👥 ${job.headcount} ${job.headcount > 1 ? 'Vagas' : 'Vaga'}`
    ];

    let pillX = pad + 30;
    ctx.font = `bold ${Math.round(width * 0.018)}px sans-serif`;
    pills.forEach((pill) => {
      const pW = ctx.measureText(pill).width + 24;
      const pH = width * 0.032;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.roundRect(pillX, insideY - pH * 0.75, pW, pH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(pill, pillX + 12, insideY - pH * 0.05);
      pillX += pW + 12;
    });

    currY += heroCardH + (isLandscape ? width * 0.025 : width * 0.04);

    // 5. Requirements Section (Key Criteria)
    if (!isLandscape || height >= 620) {
      ctx.fillStyle = lightGold;
      ctx.font = `bold ${Math.round(width * 0.022)}px sans-serif`;
      ctx.fillText('CRITÉRIOS & REQUISITOS CHAVE:', pad, currY);

      currY += width * 0.035;

      const rawReqs = (job.mandatoryCriteria || '')
        .split('\n')
        .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, isLandscape ? 2 : 4);

      ctx.font = `${Math.round(width * 0.021)}px sans-serif`;
      rawReqs.forEach((req) => {
        // Draw gold checkmark
        ctx.fillStyle = primaryGold;
        ctx.fillText('✓', pad + 5, currY);

        ctx.fillStyle = textSecondary;
        let line = req;
        if (ctx.measureText(line).width > cardW - 50) {
          line = line.substring(0, 52) + '...';
        }
        ctx.fillText(line, pad + 32, currY);
        currY += width * 0.036;
      });

      currY += width * 0.02;
    }

    // 6. Salary & Benefits Pill Bar
    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    const salaryBarH = isLandscape ? width * 0.05 : width * 0.065;
    ctx.beginPath();
    ctx.roundRect(pad, currY, cardW, salaryBarH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = primaryGold;
    ctx.font = `bold ${Math.round(width * 0.022)}px sans-serif`;
    ctx.fillText('💰 PACOTE SALARIAL:', pad + 20, currY + salaryBarH * 0.6);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(width * 0.022)}px sans-serif`;
    const salLabelW = ctx.measureText('💰 PACOTE SALARIAL:').width + 15;
    ctx.fillText(job.salaryBudget || 'Negociável', pad + 20 + salLabelW, currY + salaryBarH * 0.6);

    currY += salaryBarH + width * 0.04;

    // 7. Footer: How to Apply & Tarira QR Code Simulation
    const footerH = isLandscape ? width * 0.08 : width * 0.12;
    const footerY = height - pad - footerH;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.beginPath();
    ctx.roundRect(pad, footerY, cardW, footerH, 16);
    ctx.fill();
    ctx.stroke();

    // Call to Action inside Footer
    ctx.fillStyle = primaryGold;
    ctx.font = `900 ${Math.round(width * 0.024)}px sans-serif`;
    ctx.fillText('🚀 CANDIDATURAS ABERTAS • SUBA O SEU CV:', pad + 25, footerY + footerH * 0.42);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(width * 0.022)}px monospace`;
    ctx.fillText(job.applicationUrl || 'https://tarira.co.mz/vagas', pad + 25, footerY + footerH * 0.78);

    // Simulated QR Code Graphic Box (Right edge of footer)
    const qrSize = footerH * 0.75;
    const qrX = width - pad - qrSize - 20;
    const qrY = footerY + (footerH - qrSize) * 0.5;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 8);
    ctx.fill();

    // Draw stylized QR squares inside
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(qrX + 6, qrY + 6, qrSize * 0.35, qrSize * 0.35);
    ctx.fillRect(qrX + qrSize - qrSize * 0.35 - 6, qrY + 6, qrSize * 0.35, qrSize * 0.35);
    ctx.fillRect(qrX + 6, qrY + qrSize - qrSize * 0.35 - 6, qrSize * 0.35, qrSize * 0.35);

    // Inner dots
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX + 10, qrY + 10, qrSize * 0.18, qrSize * 0.18);
    ctx.fillRect(qrX + qrSize - qrSize * 0.35 - 2, qrY + 10, qrSize * 0.18, qrSize * 0.18);
    ctx.fillRect(qrX + 10, qrY + qrSize - qrSize * 0.35 - 2, qrSize * 0.18, qrSize * 0.18);

    // Center micro dot
    ctx.fillStyle = primaryGold;
    ctx.fillRect(qrX + qrSize * 0.42, qrY + qrSize * 0.42, qrSize * 0.16, qrSize * 0.16);

    // Export image preview URL
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setFlyerPreviewUrl(dataUrl);
    } catch (e) {
      console.warn('Canvas export preview warning:', e);
    }
  };

  // Re-render canvas whenever relevant states change
  useEffect(() => {
    drawFlyer();
  }, [job, aspectRatio, flyerTheme, isOpen]);

  // Download flyer as PNG
  const handleDownloadFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGeneratingFlyer(true);

    try {
      const link = document.createElement('a');
      const filename = `TARIRA_VAGA_FLYER_${job.companyName.replace(/\s+/g, '_')}_${aspectRatio.replace(':', 'x')}.png`;
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onLogAudit) {
        onLogAudit('DOWNLOAD_FLYER_VAGA', `Descarregado flyer oficial de vaga para ${job.companyName} (${aspectRatio})`);
      }
    } catch (err) {
      console.error('Erro ao baixar flyer:', err);
      alert('Erro ao gerar ficheiro PNG. Tente novamente.');
    } finally {
      setIsGeneratingFlyer(false);
    }
  };

  // Copy flyer image to clipboard (Supported in modern Chrome/Edge/Firefox)
  const handleCopyFlyerImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // @ts-ignore
          const item = new ClipboardItem({ 'image/png': blob });
          // @ts-ignore
          await navigator.clipboard.write([item]);
          setCopiedKey('flyer_image');
          setTimeout(() => setCopiedKey(null), 3000);
        } catch (err) {
          // Fallback to download
          handleDownloadFlyer();
          alert('Imagem copiada ou guardada. Pode agora colar diretamente no LinkedIn (Ctrl+V)!');
        }
      });
    } catch (e) {
      handleDownloadFlyer();
    }
  };

  // Direct Disparo para LinkedIn
  const handleLaunchLinkedIn = () => {
    copyToClipboard(linkedInPostText, 'linkedin_direct');
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(job.applicationUrl || 'https://tarira.co.mz')}`;
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
    if (onLogAudit) {
      onLogAudit('DISPARO_LINKEDIN', `Disparo direto para LinkedIn iniciado para ${job.companyName}: ${job.jobTitle}`);
    }
  };

  // Direct Disparo para WhatsApp
  const handleLaunchWhatsApp = () => {
    copyToClipboard(whatsAppPostText, 'whatsapp_direct');
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppPostText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (onLogAudit) {
      onLogAudit('DISPARO_WHATSAPP', `Disparo para WhatsApp iniciado para ${job.companyName}: ${job.jobTitle}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-background border border-border w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-background-secondary p-5 sm:p-6 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 font-bold shadow-sm">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-brand/10 border border-brand/20 text-brand font-mono text-[10px] font-bold uppercase">
                  DISPARO MULTICANAL DE VAGA & FLYER
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-brand font-mono text-[10px] flex items-center gap-1 font-bold">
                  <Linkedin className="w-3 h-3" />
                  Formato Oficial LinkedIn
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary tracking-tight mt-1">
                {job.jobTitle}
              </h2>
              <p className="text-xs text-text-secondary font-mono">
                {job.companyName} • {job.location}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-background border border-border text-text-secondary hover:text-text-primary hover:bg-background-secondary flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="bg-background-secondary px-6 pt-3 border-b border-border flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('flyer')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'flyer'
                ? 'border-brand text-brand'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileImage className="w-4 h-4" />
            <span>Gerador de Flyer Oficial (LinkedIn & Redes)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('linkedin_copy')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'linkedin_copy'
                ? 'border-brand text-brand'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Linkedin className="w-4 h-4" />
            <span>Disparo para LinkedIn (Post Feed & Copy)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('multichannel')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'multichannel'
                ? 'border-brand text-brand'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Outras Redes (WhatsApp, Facebook, E-mail)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'edit'
                ? 'border-brand text-brand'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Ajustar Detalhes da Vaga</span>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ════════ TAB 1: FLYER GENERATOR & DOWNLOAD ════════ */}
          {activeTab === 'flyer' && (
            <div className="space-y-6">
              {/* Controls bar */}
              <div className="p-4 rounded-2xl bg-background-secondary border border-border flex flex-wrap items-center justify-between gap-4 shadow-sm">
                {/* Format selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-text-secondary block">
                    Formato de Publicação:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('1:1')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                        aspectRatio === '1:1'
                          ? 'bg-brand text-white border-brand'
                          : 'bg-background text-text-primary border-border hover:bg-background-secondary'
                      }`}
                    >
                      Quadrado LinkedIn Feed (1:1 • 1080x1080)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('1.91:1')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                        aspectRatio === '1.91:1'
                          ? 'bg-brand text-white border-brand'
                          : 'bg-background text-text-primary border-border hover:bg-background-secondary'
                      }`}
                    >
                      Banner LinkedIn (1.91:1 • 1200x627)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                        aspectRatio === '9:16'
                          ? 'bg-brand text-white border-brand'
                          : 'bg-background text-text-primary border-border hover:bg-background-secondary'
                      }`}
                    >
                      Stories / Status (9:16)
                    </button>
                  </div>
                </div>

                {/* Theme selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-text-secondary block">
                    Estilo Visual do Flyer:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFlyerTheme('tech_navy')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                        flyerTheme === 'tech_navy'
                          ? 'bg-brand text-white border-brand'
                          : 'bg-background text-text-primary border-border hover:bg-background-secondary'
                      }`}
                    >
                      Tech Navy & Ouro
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlyerTheme('executive_dark')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                        flyerTheme === 'executive_dark'
                          ? 'bg-background-dark text-white border-background-dark'
                          : 'bg-background text-text-primary border-border hover:bg-background-secondary'
                      }`}
                    >
                      Titanium Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlyerTheme('clean_gold')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                        flyerTheme === 'clean_gold'
                          ? 'bg-brand-light text-white border-brand-light'
                          : 'bg-background text-text-primary border-border hover:bg-background-secondary'
                      }`}
                    >
                      Deep Indigo & Gold
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Flyer Preview Area */}
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 p-6 rounded-3xl bg-background-secondary border border-border shadow-sm min-h-[380px]">
                {flyerPreviewUrl ? (
                  <div className="relative group max-w-full flex items-center justify-center">
                    <img
                      src={flyerPreviewUrl}
                      alt="LinkedIn Job Flyer Preview"
                      className={`rounded-2xl border-2 border-border shadow-md transition-all object-contain max-h-[460px] ${
                        aspectRatio === '1:1'
                          ? 'aspect-square w-[380px] sm:w-[420px]'
                          : aspectRatio === '1.91:1'
                          ? 'aspect-[1.91/1] w-[500px]'
                          : 'aspect-[9/16] w-[260px]'
                      }`}
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background-dark/80 backdrop-blur-md border border-border text-white font-mono text-[10px] font-bold">
                      {aspectRatio === '1:1' ? '1080 x 1080 px' : aspectRatio === '1.91:1' ? '1200 x 627 px' : '1080 x 1920 px'}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-text-secondary font-mono text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-brand" />
                    <span>A compor flyer em alta resolução...</span>
                  </div>
                )}

                {/* Right side: Flyer Export Actions */}
                <div className="w-full lg:w-72 space-y-3 shrink-0">
                  <div className="p-4 rounded-2xl bg-background border border-border space-y-2 shadow-sm text-left">
                    <span className="text-[10px] font-mono uppercase font-bold text-brand block">
                      Exportação & Disparo
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Flyer otimizado para o algoritmo do LinkedIn em Moçambique com marca d'água oficial, selo de verificação e QR code.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadFlyer}
                    disabled={isGeneratingFlyer}
                    className="w-full py-3.5 px-4 rounded-2xl bg-brand hover:bg-brand-light text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Baixar Flyer PNG (Alta Resolução)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyFlyerImage}
                    className="w-full py-3 px-4 rounded-2xl bg-background hover:bg-background-secondary text-text-primary font-bold text-xs flex items-center justify-center gap-2 border border-border transition-all cursor-pointer shadow-sm"
                  >
                    {copiedKey === 'flyer_image' ? (
                      <>
                        <Check className="w-4 h-4 text-status-success" />
                        <span className="text-status-success">Imagem Copiada (Ctrl+V)!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-brand" />
                        <span>Copiar Imagem do Flyer</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleLaunchLinkedIn}
                    className="w-full py-3 px-4 rounded-2xl bg-brand-light hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>Disparar para o LinkedIn</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLaunchWhatsApp}
                    className="w-full py-3 px-4 rounded-2xl bg-status-success hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Disparar para WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB 2: LINKEDIN DIRECT POST & COPY ════════ */}
          {activeTab === 'linkedin_copy' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <Linkedin className="w-6 h-6 text-brand shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-brand">
                    Disparo Oficial para o Feed do LinkedIn
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    O texto abaixo foi formatado de acordo com as melhores práticas de atração de talentos no LinkedIn Moçambique, incluindo emojis estruturados, pontos-chave da vaga e hashtags de alto alcance.
                  </p>
                </div>
              </div>

              {/* LinkedIn Post Mockup Preview */}
              <div className="max-w-2xl mx-auto rounded-3xl bg-background border border-border shadow-lg overflow-hidden">
                {/* LinkedIn Card Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-brand text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {job.companyName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                        <span>{job.companyName}</span>
                        <span className="text-[10px] text-brand font-mono font-bold">✓ Verificada</span>
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        Publicado em parceria com TARIRA Recruit • Agora mesmo • 🌐
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand text-[10px] font-bold font-mono">
                    LinkedIn Feed Post
                  </span>
                </div>

                {/* LinkedIn Card Post Content */}
                <div className="p-5 text-text-primary text-xs font-sans whitespace-pre-wrap leading-relaxed space-y-2 border-b border-border bg-background">
                  {linkedInPostText}
                </div>

                {/* Post Footer Action Buttons */}
                <div className="p-4 bg-background-secondary flex flex-wrap items-center justify-between gap-3 border-t border-border">
                  <div className="text-[11px] text-text-secondary font-mono">
                    💡 O texto e o link serão copiados automaticamente ao clicar em disparar.
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(linkedInPostText, 'linkedin_text')}
                      className="px-4 py-2 rounded-xl bg-background hover:bg-background-secondary text-text-primary text-xs font-bold flex items-center gap-1.5 border border-border transition-all cursor-pointer shadow-sm"
                    >
                      {copiedKey === 'linkedin_text' ? (
                        <>
                          <Check className="w-4 h-4 text-status-success" />
                          <span className="text-status-success">Texto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-brand" />
                          <span>Copiar Texto Formatado</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleLaunchLinkedIn}
                      className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>Publicar no LinkedIn 🚀</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB 3: MULTICHANNEL BROADCAST (WHATSAPP, FACEBOOK, EMAIL) ════════ */}
          {activeTab === 'multichannel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WhatsApp Card */}
              <div className="p-5 rounded-3xl bg-background border border-border space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-status-success font-bold text-sm">
                      <MessageCircle className="w-5 h-5" />
                      <span>WhatsApp (Grupos de Vagas & Status)</span>
                    </div>
                    <span className="text-[10px] font-mono text-status-success uppercase font-bold">
                      Direct Send
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Texto formatado em negrito e listas estruturadas, ideal para grupos de emprego em Moçambique no WhatsApp e Telegram.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-background-secondary border border-border text-[11px] text-text-primary font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    {whatsAppPostText}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(whatsAppPostText, 'wa_text')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-background hover:bg-background-secondary text-text-primary text-xs font-bold border border-border flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copiedKey === 'wa_text' ? (
                      <Check className="w-4 h-4 text-status-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-brand" />
                    )}
                    <span>Copiar Texto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLaunchWhatsApp}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-status-success hover:bg-green-700 text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Disparar WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Facebook & Instagram Feed Card */}
              <div className="p-5 rounded-3xl bg-background border border-border space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-brand font-bold text-sm">
                      <Facebook className="w-5 h-5" />
                      <span>Facebook & Instagram Feed</span>
                    </div>
                    <span className="text-[10px] font-mono text-brand uppercase font-bold">
                      Redes Sociais
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    Partilhe a vaga na página corporativa da sua empresa ou grupos de discussão técnica no Facebook e Instagram.
                  </p>

                  <div className="p-3.5 rounded-2xl bg-background-secondary border border-border text-xs text-text-primary space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Link Oficial:</span>
                      <span className="font-mono text-brand truncate max-w-[200px]">
                        {job.applicationUrl}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Formato Recomendado:</span>
                      <span className="font-bold text-text-primary">Flyer Quadrado (1:1)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(linkedInPostText, 'fb_caption')}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-background hover:bg-background-secondary text-text-primary text-xs font-bold border border-border flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copiedKey === 'fb_caption' ? (
                      <Check className="w-4 h-4 text-status-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-brand" />
                    )}
                    <span>Copiar Legenda</span>
                  </button>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(job.applicationUrl || 'https://tarira.co.mz')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Partilhar Facebook</span>
                  </a>
                </div>
              </div>

              {/* Email Blast / Circular Interna RH */}
              <div className="p-5 rounded-3xl bg-background border border-border space-y-4 shadow-sm md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-brand font-bold text-sm">
                    <Mail className="w-5 h-5" />
                    <span>Boletim por E-mail & Portais de Emprego MZ (Emprego.co.mz, Vagas.co.mz)</span>
                  </div>
                  <span className="text-[10px] font-mono text-brand uppercase font-bold">
                    Email Direct
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-text-secondary font-semibold block mb-1">Assunto do E-mail:</label>
                    <div className="p-2.5 rounded-xl bg-background-secondary border border-border font-mono text-text-primary text-[11px]">
                      [VAGA ABERTA] {job.jobTitle} — {job.companyName} (Ref: {job.id})
                    </div>
                  </div>
                  <div>
                    <label className="text-text-secondary font-semibold block mb-1">Destinatário Principal:</label>
                    <div className="p-2.5 rounded-xl bg-background-secondary border border-border font-mono text-brand text-[11px]">
                      {job.contactEmail}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(linkedInPostText, 'email_body')}
                    className="py-2.5 px-4 rounded-xl bg-background hover:bg-background-secondary text-text-primary text-xs font-bold border border-border flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    {copiedKey === 'email_body' ? (
                      <>
                        <Check className="w-4 h-4 text-status-success" />
                        <span className="text-status-success">Corpo do E-mail Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-brand" />
                        <span>Copiar Texto Completo</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:?subject=${encodeURIComponent(`[VAGA ABERTA] ${job.jobTitle} — ${job.companyName}`)}&body=${encodeURIComponent(linkedInPostText)}`}
                    className="py-2.5 px-5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Disparar por E-mail</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ════════ TAB 4: EDIT JOB DETAILS ════════ */}
          {activeTab === 'edit' && (
            <div className="space-y-4 p-5 rounded-3xl bg-background border border-border shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-bold uppercase font-mono text-brand">
                  Personalizar Dados do Flyer & Disparo
                </span>
                <span className="text-[11px] text-text-secondary">
                  As alterações refletem imediatamente no flyer e nos textos.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Título da Vaga:</label>
                  <input
                    type="text"
                    value={job.jobTitle}
                    onChange={(e) => setJob({ ...job, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text-primary text-xs focus:border-brand outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Nome da Empresa:</label>
                  <input
                    type="text"
                    value={job.companyName}
                    onChange={(e) => setJob({ ...job, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text-primary text-xs focus:border-brand outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Localização:</label>
                  <input
                    type="text"
                    value={job.location}
                    onChange={(e) => setJob({ ...job, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text-primary text-xs focus:border-brand outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Regime de Trabalho:</label>
                  <select
                    value={job.workModel}
                    onChange={(e) => setJob({ ...job, workModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text-primary text-xs focus:border-brand outline-none cursor-pointer shadow-sm"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Remoto">Remoto</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Senioridade:</label>
                  <input
                    type="text"
                    value={job.seniority}
                    onChange={(e) => setJob({ ...job, seniority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text-primary text-xs focus:border-brand outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Pacote Salarial & Benefícios:</label>
                  <input
                    type="text"
                    value={job.salaryBudget}
                    onChange={(e) => setJob({ ...job, salaryBudget: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text-primary text-xs focus:border-brand outline-none shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">
                    Critérios Obrigatórios (uma por linha para bullets):
                  </label>
                  <textarea
                    rows={3}
                    value={job.mandatoryCriteria}
                    onChange={(e) => setJob({ ...job, mandatoryCriteria: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text-primary text-xs focus:border-brand outline-none leading-relaxed shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Link Oficial de Candidatura:</label>
                  <input
                    type="text"
                    value={job.applicationUrl}
                    onChange={(e) => setJob({ ...job, applicationUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-brand font-mono text-xs focus:border-brand outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Email de Contacto:</label>
                  <input
                    type="text"
                    value={job.contactEmail}
                    onChange={(e) => setJob({ ...job, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-text-primary text-xs focus:border-brand outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('flyer')}
                  className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar e Ver Flyer Atualizado</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-background-secondary px-6 py-4 border-t border-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-text-secondary font-mono">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>Ecossistema TARIRA Recruit • Multi-Channel Job Broadcast Hub</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-background hover:bg-background-secondary text-text-primary text-xs font-bold transition-all cursor-pointer border border-border shadow-sm"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleLaunchLinkedIn}
              className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Linkedin className="w-4 h-4" />
              <span>Disparar para LinkedIn 🚀</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
