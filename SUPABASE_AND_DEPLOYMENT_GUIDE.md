# Guía Completa de Configuración: Supabase, Autenticación, Admin y Despliegue en Vercel

Esta guía detalla paso a paso todo lo necesario para configurar Supabase desde cero, crear la cuenta de Administrador, configurar variables de entorno y desplegar la aplicación en Vercel.

---

## 1. Configuración de Supabase (SQL, Tablas y Storage)

### Paso 1.1: Ejecutar el Script SQL en Supabase
1. Ingresa a [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Selecciona o crea tu proyecto (por ejemplo: `tarira-portal`).
3. En el menú lateral izquierdo, haz clic en **SQL Editor** (ícono de terminal `>_`).
4. Haz clic en **New query**.
5. Abre el archivo `supabase_schema.sql` de tu proyecto, copia todo su contenido y pégalo en el editor SQL de Supabase.
6. Haz clic en el botón verde **Run** (o presiona `Ctrl + Enter` / `Cmd + Enter`).
7. Verás el mensaje `Success. No rows returned`. Esto creará y configurará todas las tablas:
   - `profiles`
   - `operators`
   - `candidates`
   - `service_categories`
   - `hires`
   - `clients`
   - `audit_logs`
   - `commercial_proposals`
   - `payment_orders`
   - `payout_requests`
   - `spontaneous_applications`
   - `partner_companies`
   - `partner_stores`
   - `landing_banners`
   - `site_content`

---

### Paso 1.2: Configurar Supabase Storage (50 MB y Buckets Públicos)
El script SQL ya crea automáticamente los buckets con un límite de 50 MB (`52428800` bytes) y políticas RLS públicas. Para verificarlo en la interfaz:
1. En el menú lateral, ve a **Storage** -> **Buckets**.
2. Confirma que existan los siguientes buckets:
   - `tarira-documents` (Público)
   - `tarira-photos` (Público)
   - `proposals_documents` (Público)
   - `consulting_proposals` (Público)
   - `uploads` (Público)
3. *(Opcional)* Si deseas que el límite sea completamente ilimitado/unset en lugar de 50MB, puedes ejecutar en el SQL Editor:
   ```sql
   update storage.buckets set file_size_limit = null where id in ('tarira-documents', 'tarira-photos', 'proposals_documents', 'consulting_proposals', 'uploads');
   ```

---

## 2. Configurar Autenticación en Supabase

1. En el menú lateral de Supabase, ve a **Authentication** -> **Providers** -> **Email**.
2. Asegúrate de que **Enable Email provider** esté activo (`ON`).
3. **Recomendación para pruebas inmediatas y producción ágil**:
   - En **Authentication** -> **URL Configuration**:
     - **Site URL**: Coloca la URL de tu app en producción (ejemplo: `https://tu-proyecto.vercel.app` o tu dominio).
     - **Redirect URLs**: Añade:
       - `http://localhost:3000/**`
       - `http://localhost:5173/**`
       - `https://tu-proyecto.vercel.app/**`
   - Si no quieres obligar a confirmar el correo electrónico por email antes de que puedan hacer login, ve a **Authentication** -> **Providers** -> **Email** y desactiva **Confirm email** (`OFF`), o déjalo activo si prefieres verificación estricta.

---

## 3. Cómo Crear y Habilitar una Cuenta de Administrador

Tienes dos métodos fáciles para tener acceso como Administrador:

### Método A: Crear usuario en la App y promoverlo a Admin en Supabase (Recomendado)
1. Abre tu aplicación y regístrate normalmente con tu correo (ejemplo: `admin@tarira.co.mz` o tu correo personal).
2. Ve al panel de **Supabase** -> **SQL Editor** -> **New query**.
3. Ejecuta la siguiente consulta para asignarle rol `admin` y darle acceso completo de operador:

```sql
-- 1. Promover el perfil a admin
update public.profiles 
set role = 'admin', is_active = true 
where email = 'tu_correo@ejemplo.com';

-- 2. Registrar en la tabla de operadores centrales con permisos totales
insert into public.operators (
  id, name, email, role, access_level, org_id, org_name, permissions, status, avatar
)
values (
  'op-admin-principal',
  'Administrador Principal',
  'tu_correo@ejemplo.com',
  'Direção Executiva & Super Admin',
  'admin',
  'admin-org',
  'Central TARIRA Admin',
  '["Acesso Total", "Validar Pedidos", "Despachar Prestadores", "Contactar WhatsApp", "Gerir Categorias", "Exportar Relatórios", "Auditoria"]'::jsonb,
  'Ativo',
  '👑'
)
on conflict (id) do update set
  email = excluded.email,
  access_level = 'admin',
  status = 'Ativo';
```

### Método B: Crear el usuario directamente desde el panel de Supabase
1. Ve a **Authentication** -> **Users** -> **Add user** -> **Create user**.
2. Introduce el email y una contraseña segura. Marca la casilla **Auto Confirm User?** en `Yes`.
3. Copia el `User UID` generado.
4. Ve al **SQL Editor** y ejecuta:
```sql
insert into public.profiles (id, name, email, role, city, is_active)
values ('PEGA_AQUI_EL_USER_UID', 'Super Admin Tarira', 'correo_creado@ejemplo.com', 'admin', 'Maputo', true)
on conflict (id) do update set role = 'admin', is_active = true;

insert into public.operators (id, name, email, role, access_level, org_id, org_name, permissions, status, avatar)
values (
  'op-admin-1', 'Super Admin Tarira', 'correo_creado@ejemplo.com',
  'Super Admin', 'admin', 'admin-org', 'Central TARIRA Admin',
  '["Acesso Total"]'::jsonb, 'Ativo', '👑'
)
on conflict (id) do update set access_level = 'admin', status = 'Ativo';
```

---

## 4. Obtener las Claves de API de Supabase

1. En Supabase, ve a **Project Settings** (ícono de engranaje abajo a la izquierda) -> **API**.
2. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://xyzcompany.supabase.co`)
   - **anon / public key** (clave pública `eyJhb...`)
   - **service_role key** (clave secreta privada, sólo para backend)

---

## 5. Configurar Variables y Desplegar en Vercel

### Paso 5.1: Conectar el Repositorio a Vercel
1. Ve a [https://vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New...** -> **Project**.
3. Selecciona tu repositorio (`Tarira-ecosystem` o el nombre que le diste).

### Paso 5.2: Configurar las Variables de Entorno en Vercel
En la sección **Environment Variables**, agrega las siguientes claves y sus valores copiados de Supabase:

| Nombre de la Variable | Valor | Ámbito |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` (tu anon key) | Production, Preview, Development |
| `SUPABASE_URL` | `https://tu-proyecto.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` (tu service role key) | Production, Preview, Development |
| `GEMINI_API_KEY` | *(Opcional / Tu API Key de Google AI)* | Production, Preview, Development |
| `CLOUDINARY_CLOUD_NAME` | *(Opcional)* | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | *(Opcional)* | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | *(Opcional)* | Production, Preview, Development |

### Paso 5.3: Desplegar
1. Haz clic en **Deploy**.
2. Vercel compilará la aplicación (`npm run build`).
3. Una vez finalizado, recibirás el enlace público de tu aplicación (por ejemplo: `https://tarira-ecosystem.vercel.app`).

---

## 6. Probar el Login y Acceso de Administrador

1. Abre tu aplicación desplegada en el navegador.
2. Haz clic en **Entrar / Login** (o en el botón de candado / Acesso Administrativo).
3. Ingresa con el correo y contraseña del usuario administrador configurado.
4. El sistema detectará automáticamente el rol `admin` del perfil y te otorgará:
   - Acceso al módulo de **Central de Despacho & Atendimento**.
   - Acceso al módulo **Comercial / CRM & Propostas**.
   - Acceso al panel de **Auditoria Organizacional & Registo de Operadores**.
   - Permiso para editar/eliminar candidatos, validar pedidos y gestionar categorías.
