type MoodleException = {
  errorcode?: string;
  exception?: string;
  message?: string;
};

type MoodleCourse = {
  id: number;
  fullname: string;
  shortname: string;
};

type MoodleUser = {
  id: number;
  email?: string;
  username?: string;
};

function getMoodleConfig() {
  const baseUrl = process.env.MOODLE_BASE_URL ?? process.env.NEXT_PUBLIC_MOODLE_BASE_URL;
  const token = process.env.MOODLE_WS_TOKEN;

  if (!baseUrl || !token) {
    throw new Error("Missing Moodle configuration. Set MOODLE_BASE_URL and MOODLE_WS_TOKEN.");
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    token
  };
}

function appendParams(params: URLSearchParams, value: Record<string, string | number | null | undefined>) {
  Object.entries(value).forEach(([key, entry]) => {
    if (entry !== null && entry !== undefined && entry !== "") {
      params.append(key, String(entry));
    }
  });
}

export async function moodleRequest<T>(
  wsfunction: string,
  payload: Record<string, string | number | null | undefined> = {}
) {
  const { baseUrl, token } = getMoodleConfig();
  const params = new URLSearchParams({
    moodlewsrestformat: "json",
    wsfunction,
    wstoken: token
  });
  appendParams(params, payload);

  const response = await fetch(`${baseUrl}/webservice/rest/server.php`, {
    body: params,
    cache: "no-store",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(`Moodle HTTP ${response.status}`);
  }

  const data = (await response.json()) as T | MoodleException;

  if (typeof data === "object" && data && "exception" in data) {
    const exception = data as MoodleException;
    throw new Error(exception.message ?? exception.errorcode ?? "Moodle webservice error.");
  }

  return data as T;
}

export async function getMoodleSiteInfo() {
  return moodleRequest<{ sitename: string; siteurl: string; username: string }>(
    "core_webservice_get_site_info"
  );
}

export async function getOrCreateMoodleCourse(input: {
  code: string;
  id: string;
  summary?: string | null;
  title: string;
}) {
  const byShortname = await moodleRequest<{ courses: MoodleCourse[] }>(
    "core_course_get_courses_by_field",
    {
      field: "shortname",
      value: input.code
    }
  );

  const existing = byShortname.courses.at(0);
  if (existing) {
    return existing.id;
  }

  const categoryId = Number(process.env.MOODLE_DEFAULT_CATEGORY_ID ?? 1);
  const created = await moodleRequest<MoodleCourse[]>("core_course_create_courses", {
    "courses[0][categoryid]": categoryId,
    "courses[0][format]": "topics",
    "courses[0][fullname]": input.title,
    "courses[0][shortname]": input.code,
    "courses[0][summary]": input.summary ?? `Programa sincronizado desde UniversityService (${input.id}).`
  });

  const course = created.at(0);
  if (!course) {
    throw new Error("Moodle did not return a created course.");
  }

  return course.id;
}

export async function getOrCreateMoodleUser(input: {
  email: string;
  fullName?: string | null;
  id: string;
}) {
  const users = await moodleRequest<MoodleUser[]>("core_user_get_users_by_field", {
    field: "email",
    "values[0]": input.email
  });

  const existing = users.at(0);
  if (existing) {
    return existing.id;
  }

  const [firstname, ...rest] = (input.fullName || input.email.split("@")[0]).trim().split(/\s+/);
  const lastname = rest.join(" ") || "Usuario";
  const username = `us_${input.id.replaceAll("-", "").slice(0, 20)}`;
  const password = `Moodle!${input.id.replaceAll("-", "").slice(0, 8)}Aa1`;

  const created = await moodleRequest<MoodleUser[]>("core_user_create_users", {
    "users[0][auth]": "manual",
    "users[0][email]": input.email,
    "users[0][firstname]": firstname || "Usuario",
    "users[0][lastname]": lastname,
    "users[0][password]": password,
    "users[0][username]": username
  });

  const user = created.at(0);
  if (!user) {
    throw new Error("Moodle did not return a created user.");
  }

  return user.id;
}

export async function enrollMoodleStudent(input: {
  courseId: number;
  userId: number;
}) {
  const roleId = Number(process.env.MOODLE_STUDENT_ROLE_ID ?? 5);

  await moodleRequest<null>("enrol_manual_enrol_users", {
    "enrolments[0][courseid]": input.courseId,
    "enrolments[0][roleid]": roleId,
    "enrolments[0][userid]": input.userId
  });
}

export function getMoodleCourseUrl(courseId?: number | null) {
  const baseUrl = process.env.NEXT_PUBLIC_MOODLE_BASE_URL ?? process.env.MOODLE_BASE_URL;

  if (!baseUrl || !courseId) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, "")}/course/view.php?id=${courseId}`;
}
