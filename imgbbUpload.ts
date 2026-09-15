import { getSupabaseClient } from './supabase';

/**
 * Envia uma imagem para o ImgBB (armazenamento externo de imagens), com
 * reserva para o Supabase Storage e, em último caso, Base64 local — para que
 * nenhuma fotografia fique bloqueada mesmo sem configuração completa.
 *
 * Esta função replica a lógica já usada em App.tsx (uploadImageToImgBB) para
 * que os formulários de registo/criação de conta (StandardRegistrationForm,
 * SupabaseAuthModal) também guardem fotografias reais no ImgBB em vez de as
 * enviar como Base64 dentro do próprio registo.
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  // 1) Tentativa principal: ImgBB
  try {
    const imgbbApiKey = ((import.meta as any).env?.VITE_IMGBB_API_KEY || '').trim();
    if (imgbbApiKey) {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result?.success && result.data?.url) {
        return result.data.url as string;
      }
    }
  } catch (imgErr) {
    console.warn('Aviso: Upload para o ImgBB falhou, a tentar Supabase Storage / Base64:', imgErr);
  }

  // 2) Reserva: Supabase Storage (se o cliente estiver configurado)
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage.from('uploads').upload(cleanName, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (!error && data) {
        const { data: publicData } = supabase.storage.from('uploads').getPublicUrl(cleanName);
        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      }
    }
  } catch (supErr) {
    console.warn('Aviso: Upload para o Supabase Storage não disponível:', supErr);
  }

  // 3) Último recurso: Base64 local (garante que a fotografia nunca se perde)
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Erro ao converter ficheiro para Base64'));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
