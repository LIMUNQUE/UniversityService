"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function enrollInProgram(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!programId) {
    throw new Error("Program id is required.");
  }

  const { error } = await supabase.from("enrollments").insert({
    profile_id: user.id,
    program_id: programId
  });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/programs");
}

export async function leaveProgram(formData: FormData) {
  const programId = String(formData.get("programId") ?? "");
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!programId) {
    throw new Error("Program id is required.");
  }

  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("profile_id", user.id)
    .eq("program_id", programId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/programs");
}

export async function createProgram(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const title = String(formData.get("title") ?? "").trim();
  const modality = String(formData.get("modality") ?? "").trim();
  const startsOn = String(formData.get("startsOn") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: "student" | "teacher" | "admin" }>();

  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    throw new Error("Only teachers can create programs.");
  }

  if (!code || !title) {
    throw new Error("Program code and title are required.");
  }

  const { error } = await supabase.from("programs").insert({
    code,
    title,
    modality: modality || null,
    starts_on: startsOn || null,
    teacher_id: user.id
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/programs");
}
