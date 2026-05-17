import {
  BookOpen,
  CalendarDays,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  UserRound
} from "lucide-react";

export const roles = [
  {
    name: "Estudiante",
    description: "Placeholder para cursos, tareas, pagos y documentos.",
    icon: UserRound
  },
  {
    name: "Docente",
    description: "Placeholder para contenidos, tareas, calificaciones y asistencia.",
    icon: GraduationCap
  }
];

export const modules = [
  {
    title: "Autenticacion",
    description: "Login, recuperacion de clave, perfiles y roles con Supabase Auth.",
    icon: ShieldCheck,
    status: "Base"
  },
  {
    title: "Aula virtual",
    description: "Integracion preparada para Moodle con cursos, tareas y notas.",
    icon: BookOpen,
    status: "Moodle"
  },
  {
    title: "Pagos",
    description: "Flujo listo para PayPhone, Kushki o Stripe y comprobantes por email.",
    icon: CreditCard,
    status: "Proveedor"
  },
  {
    title: "Landing",
    description: "Programas, admisiones, contacto y SEO inicial responsive.",
    icon: LayoutDashboard,
    status: "Web"
  }
];

export const courses = [
  {
    code: "PROG-001",
    name: "Programa placeholder",
    mode: "Hibrido",
    date: "2026"
  },
  {
    code: "CUR-002",
    name: "Curso placeholder",
    mode: "En linea",
    date: "2026"
  },
  {
    code: "DIP-003",
    name: "Diplomado placeholder",
    mode: "Presencial",
    date: "2026"
  }
];

export const activity = [
  {
    title: "Matricula ordinaria",
    description: "Placeholder de calendario academico.",
    icon: CalendarDays
  },
  {
    title: "Entrega de tarea",
    description: "Placeholder de Moodle.",
    icon: FileText
  },
  {
    title: "Pago pendiente",
    description: "Placeholder de colegiatura.",
    icon: CreditCard
  }
];
