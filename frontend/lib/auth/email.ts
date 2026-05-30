export const ALLOWED_EMAIL_DOMAINS = ["@tezu.ac.in", "@tezu.ernet.in"] as const;

export function isAllowedInstitutionEmail(email: string) {
  const emailLower = email.trim().toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some((domain) => emailLower.endsWith(domain));
}

export const ALLOWED_EMAIL_MESSAGE =
  "Only emails ending with @tezu.ac.in or @tezu.ernet.in are allowed.";
