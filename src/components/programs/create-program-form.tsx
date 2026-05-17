import { Plus } from "lucide-react";
import { createProgram } from "@/app/programs/actions";

export function CreateProgramForm() {
  return (
    <form action={createProgram} className="card grid gap-4 p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Docente
        </p>
        <h2 className="mt-2 text-2xl font-bold">Crear programa</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-[0.65fr_1.35fr]">
        <label>
          <span className="mb-2 block text-sm font-semibold">Codigo</span>
          <input className="field" maxLength={24} name="code" placeholder="CUR-004" required />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">Titulo</span>
          <input className="field" name="title" placeholder="Nombre del programa" required />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold">Modalidad</span>
          <select className="field" name="modality" defaultValue="En linea">
            <option>En linea</option>
            <option>Presencial</option>
            <option>Hibrido</option>
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">Inicio</span>
          <input className="field" name="startsOn" type="date" />
        </label>
      </div>

      <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 font-semibold text-white">
        <Plus size={18} aria-hidden="true" /> Crear programa
      </button>
    </form>
  );
}
