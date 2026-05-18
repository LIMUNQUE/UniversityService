"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncCourseToMoodle } from "@/lib/moodle/sync";
import { createClient } from "@/lib/supabase/server";

async function requireTeacherForProgram(programId: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: program } = await supabase
    .from("programs")
    .select("id, code, title, teacher_id, moodle_course_id")
    .eq("id", programId)
    .maybeSingle<{
      code: string;
      id: string;
      moodle_course_id: number | null;
      teacher_id: string | null;
      title: string;
    }>();

  if (!program || program.teacher_id !== user.id) {
    throw new Error("Only the course teacher can add classroom content.");
  }

  return { supabase, user };
}

export async function syncProgramWithMoodle(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");

  if (!programId) {
    throw new Error("Program id is required.");
  }

  const { supabase } = await requireTeacherForProgram(programId);
  const { data: program, error } = await supabase
    .from("programs")
    .select("id, code, title, moodle_course_id")
    .eq("id", programId)
    .single<{
      code: string;
      id: string;
      moodle_course_id: number | null;
      title: string;
    }>();

  if (error) {
    throw new Error(error.message);
  }

  await syncCourseToMoodle({
    program,
    supabase
  }).catch(() => null);

  revalidatePath(`/programs/${programId}`);
  revalidatePath("/programs");
}

export async function createMaterial(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const resourceUrl = String(formData.get("resourceUrl") ?? "").trim();

  if (!programId || !title) {
    throw new Error("Program and title are required.");
  }

  const { supabase, user } = await requireTeacherForProgram(programId);

  const { error } = await supabase.from("course_materials").insert({
    program_id: programId,
    title,
    description: description || null,
    resource_url: resourceUrl || null,
    created_by: user.id
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/programs/${programId}`);
}

export async function createAssignment(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueAt = String(formData.get("dueAt") ?? "").trim();

  if (!programId || !title) {
    throw new Error("Program and title are required.");
  }

  const { supabase, user } = await requireTeacherForProgram(programId);

  const { error } = await supabase.from("assignments").insert({
    program_id: programId,
    title,
    description: description || null,
    due_at: dueAt || null,
    created_by: user.id
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/programs/${programId}`);
}
