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
