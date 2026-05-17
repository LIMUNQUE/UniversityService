# University Service

Starter del portal academico esencial basado en la proforma PRO-2026-001.

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase Auth, PostgreSQL y Storage
- Moodle como LMS externo/preconfigurado
- PayPhone, Kushki o Stripe como proveedor de pagos
- Resend o SendGrid para correos transaccionales

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Modulos iniciales

- Autenticacion y roles: estudiante y docente
- Programas/cursos: catalogo desde Supabase y matriculas por usuario
- Aula virtual: tarjetas preparadas para Moodle
- Pagos: resumen de matricula e historial placeholder
- Landing institucional: hero, programas, contacto y SEO base

El contenido visible es placeholder por ahora. La siguiente fase natural es conectar Supabase Auth y definir el esquema de base de datos.

## Supabase

1. Copia `.env.example` a `.env.local`.
2. Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Ejecuta `supabase/schema.sql` en el SQL Editor del proyecto Supabase.

El registro esta abierto para estudiantes y docentes. El trigger `handle_new_user` crea el perfil automaticamente usando los metadatos enviados desde el formulario.

Despues de actualizar `schema.sql`, vuelve a ejecutar el archivo completo en Supabase. Las sentencias usan `on conflict` y `drop trigger if exists`, asi que son seguras para repetir durante desarrollo.
