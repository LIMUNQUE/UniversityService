import { ClipboardList, FilePlus2 } from "lucide-react";
import { createAssignment, createMaterial } from "@/app/programs/[id]/actions";

export function ClassroomForms({ programId }: { programId: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form action={createMaterial} className="card grid gap-4 p-5">
        <input name="programId" type="hidden" value={programId} />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Material
          </p>
          <h2 className="mt-2 text-xl font-bold">Publicar recurso</h2>
        </div>
        <label>
          <span className="mb-2 block text-sm font-semibold">Titulo</span>
          <input className="field" name="title" placeholder="Lectura de la semana" required />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">Descripcion</span>
          <textarea className="field min-h-24 resize-y" name="description" placeholder="Indicaciones breves" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">URL del recurso</span>
          <input className="field" name="resourceUrl" placeholder="https://..." type="url" />
        </label>
        <button className="btn-primary">
          <FilePlus2 size={18} aria-hidden="true" /> Publicar material
        </button>
      </form>

      <form action={createAssignment} className="card grid gap-4 p-5">
        <input name="programId" type="hidden" value={programId} />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Tarea
          </p>
          <h2 className="mt-2 text-xl font-bold">Crear actividad</h2>
        </div>
        <label>
          <span className="mb-2 block text-sm font-semibold">Titulo</span>
          <input className="field" name="title" placeholder="Ensayo corto" required />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">Descripcion</span>
          <textarea className="field min-h-24 resize-y" name="description" placeholder="Consigna de la tarea" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold">Fecha limite</span>
          <input className="field" name="dueAt" type="datetime-local" />
        </label>
        <button className="btn-primary">
          <ClipboardList size={18} aria-hidden="true" /> Crear tarea
        </button>
      </form>
    </div>
  );
}
