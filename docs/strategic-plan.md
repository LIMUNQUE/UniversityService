# Plan estrategico inicial

Fuente: proforma PRO-2026-001, Portal Academico Esencial.

## Alcance base

1. Autenticacion y usuarios
   - Login/logout con correo y contrasena.
   - Roles: estudiante y docente.
   - Perfil editable.
   - Recuperacion de contrasena por email.

2. Aula virtual
   - Moodle Open Source como LMS.
   - Tema visual institucional.
   - Vista estudiante: materias, tareas y calificaciones.
   - Vista docente: contenidos, tareas y calificacion.

3. Pagos
   - Proveedor configurable: PayPhone, Kushki o Stripe.
   - Pago de matricula o inscripcion.
   - Historial de pagos.
   - Comprobante por email.

4. Landing institucional
   - Inicio informativo.
   - Programas o cursos disponibles.
   - Contacto.
   - Responsive design y SEO basico.

## Fases

1. Setup tecnico: Next.js, Tailwind, Supabase, estructura de rutas.
2. UI/UX: pantallas clave de landing, login y dashboard.
3. Desarrollo core: Supabase Auth, perfiles, roles y RLS.
4. Moodle: instalacion/configuracion externa e integracion por curso.
5. Pagos: endpoint de checkout y webhook del proveedor elegido.
6. Testing y entrega: pruebas funcionales, deploy y documentacion.

## Decision pendiente

Elegir proveedor de pago principal para Ecuador: PayPhone o Kushki. Stripe queda como alternativa internacional.
