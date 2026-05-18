import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  enrollMoodleStudent,
  getOrCreateMoodleCourse,
  getOrCreateMoodleUser
} from "@/lib/moodle/client";

type ProgramForMoodle = {
  code: string;
  id: string;
  moodle_course_id: number | null;
  title: string;
};

type ProfileForMoodle = {
  full_name: string | null;
  moodle_user_id: number | null;
};

export async function syncCourseToMoodle(input: {
  program: ProgramForMoodle;
  supabase: SupabaseClient;
}) {
  if (input.program.moodle_course_id) {
    return input.program.moodle_course_id;
  }

  try {
    const courseId = await getOrCreateMoodleCourse({
      code: input.program.code,
      id: input.program.id,
      title: input.program.title
    });

    await input.supabase
      .from("programs")
      .update({
        moodle_course_id: courseId,
        moodle_sync_error: null
      })
      .eq("id", input.program.id);

    return courseId;
  } catch (error) {
    await input.supabase
      .from("programs")
      .update({
        moodle_sync_error: error instanceof Error ? error.message : "Unknown Moodle course sync error."
      })
      .eq("id", input.program.id);

    throw error;
  }
}

export async function syncUserToMoodle(input: {
  profile: ProfileForMoodle | null;
  supabase: SupabaseClient;
  user: User;
}) {
  if (input.profile?.moodle_user_id) {
    return input.profile.moodle_user_id;
  }

  if (!input.user.email) {
    throw new Error("The authenticated user does not have an email.");
  }

  try {
    const moodleUserId = await getOrCreateMoodleUser({
      email: input.user.email,
      fullName: input.profile?.full_name,
      id: input.user.id
    });

    await input.supabase
      .from("profiles")
      .update({
        moodle_sync_error: null,
        moodle_user_id: moodleUserId
      })
      .eq("id", input.user.id);

    return moodleUserId;
  } catch (error) {
    await input.supabase
      .from("profiles")
      .update({
        moodle_sync_error: error instanceof Error ? error.message : "Unknown Moodle user sync error."
      })
      .eq("id", input.user.id);

    throw error;
  }
}

export async function syncEnrollmentToMoodle(input: {
  enrollmentId: string;
  moodleCourseId: number | null;
  moodleUserId: number;
  supabase: SupabaseClient;
}) {
  if (!input.moodleCourseId) {
    await input.supabase
      .from("enrollments")
      .update({
        moodle_sync_error: "El curso aun no esta sincronizado con Moodle."
      })
      .eq("id", input.enrollmentId);
    return;
  }

  try {
    await enrollMoodleStudent({
      courseId: input.moodleCourseId,
      userId: input.moodleUserId
    });

    await input.supabase
      .from("enrollments")
      .update({
        moodle_course_id: String(input.moodleCourseId),
        moodle_enrolled_at: new Date().toISOString(),
        moodle_sync_error: null
      })
      .eq("id", input.enrollmentId);
  } catch (error) {
    await input.supabase
      .from("enrollments")
      .update({
        moodle_sync_error: error instanceof Error ? error.message : "Unknown Moodle enrollment sync error."
      })
      .eq("id", input.enrollmentId);
  }
}
