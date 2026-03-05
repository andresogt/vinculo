# Configuración interna - Vinculo en Vercel

## 1. Variables de entorno en Vercel

Ya las agregaste. Verifica que tengas:

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (secret, nunca en cliente) |
| `OPENAI_API_KEY` | API key de OpenAI |
| `CRON_SECRET` | (Opcional) Para proteger `/api/chat/check-in` |
| `NEXT_PUBLIC_APP_URL` | (Opcional) URL de producción, ej: `https://tu-app.vercel.app` |

---

## 2. Supabase – Migraciones

La base de datos debe tener las tablas. Opciones:

### Opción A: Supabase CLI

```bash
cd vinculo
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

(Reemplaza `TU_PROJECT_REF` con el ref de tu proyecto en Supabase → Settings → General)

### Opción B: SQL Editor en Supabase (recomendado)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto
2. **SQL Editor** → New query
3. Copia y pega todo el contenido de `supabase/full-schema.sql`
4. Run

---

## 3. Supabase – URLs de autenticación

Para que login/signup funcione en producción:

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Site URL:** `https://tu-app.vercel.app`
3. **Redirect URLs** → añade:
   - `https://tu-app.vercel.app/**`
   - `https://tu-app.vercel.app/auth/callback`
   - `http://localhost:3000/**` (para desarrollo local)

---

## 4. NEXT_PUBLIC_APP_URL (recomendado)

En Vercel → Project Settings → Environment Variables:

- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://tu-proyecto.vercel.app`

Útil para redirects de Stripe y enlaces absolutos.

---

## 5. Redeploy

Después de agregar o cambiar variables:

- Vercel → Deployments → los 3 puntos del último deploy → **Redeploy**

---

## Checklist rápido

- [ ] Variables de entorno en Vercel
- [ ] Migraciones ejecutadas en Supabase
- [ ] Site URL y Redirect URLs en Supabase
- [ ] `NEXT_PUBLIC_APP_URL` configurado (opcional)
- [ ] Redeploy en Vercel
