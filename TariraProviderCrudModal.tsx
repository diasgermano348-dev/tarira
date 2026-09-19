import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, DollarSign, Briefcase, Star, Award, Image, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Candidate } from './types';
import { CATEGORIES_TAXONOMY, getSpecialtiesForCategory, findCategoryItem } from './categoriesData';
import { uploadImageToImgBB } from './imgbbUpload';

interface TariraProviderCrudModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  type?: 'provider' | 'professional'; // provider = Ofício/Campo (Connect), professional = Especialista/Escritório (Recruit)
  initialData?: Partial<Candidate>;
  candidate?: Partial<Candidate> | null;
  onClose: () => void;
  onSave?: (data: Partial<Candidate>) => Promise<void> | void;
  onSubmit?: (data: Partial<Candidate>) => Promise<void> | void;
  operatorName?: string;
  operatorRole?: string;
}

export const TariraProviderCrudModal: React.FC<TariraProviderCrudModalProps> = ({
  isOpen,
  mode,
  type = 'provider',
  initialData,
  candidate,
  onClose,
  onSave,
  onSubmit,
  operatorName = 'Administrador Geral',
  operatorRole = 'admin'
}) => {
  const effectiveData = initialData || candidate || undefined;
  const effectiveSave = onSave || onSubmit || (() => {});

  const [formType, setFormType] = useState<'provider' | 'professional'>(
    effectiveData?.isProfessional ? 'professional' : type
  );

  const [name, setName] = useState(effectiveData?.name || '');
  const [surname, setSurname] = useState(effectiveData?.surname || '');
  const [title, setTitle] = useState(effectiveData?.title || '');
  // IMPORTANTE: guardar sempre o id canónico da taxonomia (ex.: "limpeza_especializada",
  // "manutencao_reparacoes") e nunca o nome legível ("Limpeza Especializada") — era o
  // nome a ser gravado como "category" que impedia o Técnicos de Campo / Talentos e
  // Quadros de reconhecerem a categoria exata do prestador e o filtro por categoria
  // (Limpeza, Manutenção, Construção, Elite Tech, etc.) deixava de funcionar corretamente.
  const [category, setCategory] = useState(
    // Normaliza sempre para o id canónico — mesmo ao editar um registo antigo cuja
    // "category" tenha sido gravada como nome legível (ex.: "Limpeza Especializada"),
    // para que ao guardar de novo o registo passe a ter o id correto.
    (effectiveData?.category && findCategoryItem(effectiveData.category)?.id) ||
      effectiveData?.category ||
      (formType === 'provider' ? 'manutencao_reparacoes' : 'ti_software')
  );
  const [subCategory, setSubCategory] = useState(effectiveData?.subCategory || '');
  const [email, setEmail] = useState(effectiveData?.email || '');
  const [phone, setPhone] = useState(effectiveData?.phone || '');
  const [whatsapp, setWhatsapp] = useState(effectiveData?.whatsapp || effectiveData?.phone || '');
  const [city, setCity] = useState(effectiveData?.city || '');
  const [residence, setResidence] = useState(effectiveData?.residence || '');
  const [hourlyRate, setHourlyRate] = useState<number>(effectiveData?.hourlyRate || effectiveData?.rateMzn || (formType === 'provider' ? 450 : 850));
  const [expectedSalaryMin, setExpectedSalaryMin] = useState<number>(effectiveData?.expectedSalaryMin || 35000);
  const [expectedSalaryMax, setExpectedSalaryMax] = useState<number>(effectiveData?.expectedSalaryMax || 65000);
  const [experienceYears, setExperienceYears] = useState<number>(effectiveData?.experienceYears || 4);
  const [matchScore, setMatchScore] = useState<number>(effectiveData?.matchScore || 92);
  const [rating, setRating] = useState<number>(effectiveData?.rating || 4.9);
  const [availableNow, setAvailableNow] = useState<boolean>(effectiveData?.availableNow ?? true);
  const [availableForEmergency, setAvailableForEmergency] = useState<boolean>(effectiveData?.availableForEmergency ?? false);
  const [status, setStatus] = useState<'approved' | 'pending' | 'rejected'>(
    (effectiveData?.status as 'approved' | 'pending' | 'rejected') || 'approved'
  );
  const [photo, setPhoto] = useState(effectiveData?.photo || '');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [bio, setBio] = useState(
    effectiveData?.bio || ''
  );
  const [skillsInput, setSkillsInput] = useState(
    (effectiveData?.skills || []).join(', ')
  );

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Available specialties for chosen category
  const specialties = getSpecialtiesForCategory(category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Por favor introduza o nome.');
      return;
    }
    if (!category.trim()) {
      setErrorMsg('Por favor seleccione a categoria.');
      return;
    }

    setSaving(true);
    try {
      const skillsArray = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const candidatePayload: Partial<Candidate> = {
        id: initialData?.id || `cand-${Date.now()}`,
        name: name.trim(),
        surname: surname.trim(),
        title: title.trim() || (subCategory || category),
        category: category,
        subCategory: subCategory.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || phone.trim() || undefined,
        city: city.trim(),
        residence: residence.trim(),
        hourlyRate: Number(hourlyRate) || 350,
        rateMzn: Number(hourlyRate) || 350,
        rate: Number(hourlyRate) || 350,
        expectedSalaryMin: Number(expectedSalaryMin) || 35000,
        expectedSalaryMax: Number(expectedSalaryMax) || 65000,
        experienceYears: Number(experienceYears) || 3,
        matchScore: Number(matchScore) || 90,
        rating: Number(rating) || 4.9,
        availableNow: availableNow,
        availableForEmergency: availableForEmergency,
        isProfessional: formType === 'professional',
        status: status,
        photo: photo.trim() || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
        bio: bio.trim(),
        skills: skillsArray.length > 0 ? skillsArray : [category, subCategory || 'Especialista'],
        timestamp: effectiveData?.timestamp || 'Hoje',
      };

      if (effectiveSave) {
        await effectiveSave(candidatePayload);
      }
      onClose();
    } catch (err: any) {
      console.error('Erro ao guardar prestador:', err);
      setErrorMsg(err.message || 'Erro ao guardar dados do prestador.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start sm:items-center animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-border shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 border border-border text-slate-500 hover:bg-slate-200 hover:text-slate-800 font-bold transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 z-30"
          title="Fechar"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#172554] border border-blue-200">
              {operatorRole === 'central' ? 'Central de Atendimento' : 'Administração TARIRA'}
            </span>
            <span className="text-[11px] text-slate-500">Operador: <strong className="text-slate-700">{operatorName}</strong></span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#172554] font-bold">
            {mode === 'create' ? (
              formType === 'provider' ? '➕ Novo Prestador de Ofício' : '➕ Novo Profissional Especialista'
            ) : (
              formType === 'provider' ? '✏️ Editar Ficha de Prestador' : '✏️ Editar Ficha de Profissional'
            )}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Preencha os dados de conformidade, contacto WhatsApp, categorias e valores para registo na base central.
          </p>
        </div>

        {/* Type Toggle: Prestador vs Profissional */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-border mb-6 gap-2">
          <button
            type="button"
            onClick={() => setFormType('provider')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              formType === 'provider'
                ? 'bg-[#172554] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛠️ Prestador de Ofício (Connect)</span>
          </button>
          <button
            type="button"
            onClick={() => setFormType('professional')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              formType === 'professional'
                ? 'bg-[#172554] text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎓 Profissional Especialista (Recruit)</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name & Surname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-700 block font-semibold mb-1">
                Nome Próprio *
              </label>
              <input
                type="text"
                required
                placeholder=""
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-700 block font-semibold mb-1">
                Apelido *
              </label>
              <input
                type="text"
                required
                placeholder=""
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Title / Role Description */}
          <div>
            <label className="text-xs text-slate-700 block font-semibold mb-1">
              Título Profissional / Cargo
            </label>
            <input
              type="text"
              placeholder=""
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
            />
          </div>

          {/* Row 3: Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-700 block font-semibold mb-1">
                Categoria Principal *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory('');
                }}
                className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all cursor-pointer"
              >
                {CATEGORIES_TAXONOMY.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-700 block font-semibold mb-1">
                Especialidade / Sub-Área
              </label>
              {specialties.length > 0 ? (
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all cursor-pointer"
                >
                  <option value="">Geral / Todas as especialidades</option>
                  {specialties.map((spec, sIdx) => (
                    <option key={sIdx} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder=""
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
                />
              )}
            </div>
          </div>

          {/* Row 4: Contact Info (WhatsApp is critical for Central dispatch) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-700 block font-semibold mb-1">
                WhatsApp Directo *
              </label>
              <input
                type="text"
                required
                placeholder=""
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-emerald-300 text-emerald-700 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 transition-all font-mono font-semibold"
              />
            </div>
            <div>
              <label className="text-xs text-slate-700 block font-semibold mb-1">
                Telefone Alternativo
              </label>
              <input
                type="text"
                placeholder=""
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-700 block font-semibold mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
              />
            </div>
          </div>

          {/* Row 5: Rates & Locations */}
          {formType === 'provider' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-700 block font-semibold mb-1">
                  Taxa Base (MZN / Hora)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-blue-200 text-[#172554] font-mono font-bold rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 block font-semibold mb-1">
                  Cidade / Província
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 block font-semibold mb-1">
                  Anos de Experiência
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-700 block font-semibold mb-1">
                  Salário Mínimo (De MZN)
                </label>
                <input
                  type="number"
                  value={expectedSalaryMin}
                  onChange={(e) => setExpectedSalaryMin(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-blue-200 text-[#172554] font-mono font-bold rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 block font-semibold mb-1">
                  Salário Máximo (Até MZN)
                </label>
                <input
                  type="number"
                  value={expectedSalaryMax}
                  onChange={(e) => setExpectedSalaryMax(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-blue-200 text-[#172554] font-mono font-bold rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 block font-semibold mb-1">
                  Cidade / Província
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 block font-semibold mb-1">
                  Anos de Experiência
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Row 6: Availability & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 rounded-2xl bg-slate-50 border border-border">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="availNow"
                checked={availableNow}
                onChange={(e) => setAvailableNow(e.target.checked)}
                className="w-4 h-4 rounded text-[#172554] bg-white border-slate-300 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="availNow" className="text-xs text-slate-700 cursor-pointer font-bold">
                ⚡ Disponível Agora
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="availEmerg"
                checked={availableForEmergency}
                onChange={(e) => setAvailableForEmergency(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 bg-white border-slate-300 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="availEmerg" className="text-xs text-slate-700 cursor-pointer font-bold">
                🚨 Atende Urgências 24/7
              </label>
            </div>
            <div>
              <label className="text-[10px] tracking-wider text-slate-500 uppercase block font-bold mb-1">
                Estado de Conformidade
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-white border border-border text-slate-800 rounded-lg p-1.5 text-xs outline-none focus:border-[#172554] cursor-pointer"
              >
                <option value="approved">✅ Aprovado / Ativo</option>
                <option value="pending">⏳ Em Triagem</option>
                <option value="rejected">⛔ Suspenso / Inativo</option>
              </select>
            </div>
          </div>

          {/* Row 7: Photo — link OU upload direto de ficheiro */}
          <div>
            <label className="text-xs text-slate-700 block font-semibold mb-1">
              Fotografia de Perfil
            </label>
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  placeholder="Colar o link de uma fotografia..."
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all font-mono"
                />
                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors ${photoUploading ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-wait' : 'bg-white border-slate-200 text-[#172554] hover:bg-slate-50'}`}>
                    <Image className="w-3.5 h-3.5" />
                    <span>{photoUploading ? 'A carregar...' : 'Carregar do dispositivo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={photoUploading}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setPhotoUploading(true);
                        try {
                          const url = await uploadImageToImgBB(file);
                          setPhoto(url);
                        } catch (err) {
                          console.warn('Erro ao carregar fotografia:', err);
                        } finally {
                          setPhotoUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">ou cole um link acima</span>
                </div>
              </div>
              {photo && (
                <img
                  src={photo}
                  alt="Preview"
                  className="w-11 h-11 rounded-xl object-cover border border-blue-200 shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>

          {/* Row 8: Bio & Skills */}
          <div>
            <label className="text-xs text-slate-700 block font-semibold mb-1">
              Competências & Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              placeholder=""
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 block font-semibold mb-1">
              Resumo / Biografia Profissional
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-border text-slate-800 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-[#172554] focus:ring-1 focus:ring-[#172554]/20 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white border border-border text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#172554] hover:bg-[#172554] text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span>A gravar registo...</span>
              ) : (
                <span>
                  {mode === 'create' ? '💾 Criar Registo no Sistema' : '💾 Guardar Alterações'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
