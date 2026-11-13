import { z } from "zod";
import { isAdult } from "./age";

export const BIO_MAX = 300;
export const MAX_PHOTOS = 6;

export const nameSchema = z
  .string()
  .trim()
  .min(1, "Tell us your first name.")
  .max(40, "Keep it under 40 characters.");

export const birthdateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your birthdate.")
  .refine((v) => v >= "1900-01-01", "Enter a valid birthdate.")
  .refine((v) => isAdult(v), "You must be at least 18 to use Melt.");

export const citySchema = z
  .string()
  .trim()
  .min(1, "Which city are you in?")
  .max(80, "Keep it under 80 characters.");

export const bioSchema = z.string().trim().max(BIO_MAX, `Keep it under ${BIO_MAX} characters.`);

export const interestsSchema = z
  .array(z.number().int())
  .min(1, "Pick at least one sport.")
  .max(10, "Pick up to 10.");

export const basicsSchema = z.object({
  displayName: nameSchema,
  birthdate: birthdateSchema,
  city: citySchema,
});

export type Basics = z.infer<typeof basicsSchema>;

/** First error message per field, for the form. */
export function fieldErrors<T extends z.ZodTypeAny>(schema: T, value: unknown) {
  const res = schema.safeParse(value);
  if (res.success) return {};
  const out: Record<string, string> = {};
  for (const issue of res.error.issues) {
    const key = String(issue.path[0] ?? "_");
    out[key] ??= issue.message;
  }
  return out;
}
