import { z } from "zod";

/** Sport prompts from the original Lovable design. Must match the DB check constraint. */
export const PROMPT_QUESTIONS = [
  "My current PR is…",
  "Currently training for…",
  "How to approach me at the gym…",
  "Favourite snack bar…",
  "Post-workout ritual…",
  "My sport origin story…",
  "Race I'd do with a stranger…",
  "My simple pleasures…",
] as const;

export const MAX_PROMPTS = 3;
export const PROMPT_ANSWER_MAX = 150;

export type PromptDraft = { question: string; answer: string };
export type Prompt = PromptDraft & { id: string };

export const promptsSchema = z
  .array(
    z.object({
      question: z.enum(PROMPT_QUESTIONS),
      answer: z
        .string()
        .trim()
        .min(1, "Write an answer, or remove this prompt.")
        .max(PROMPT_ANSWER_MAX, `Keep answers under ${PROMPT_ANSWER_MAX} characters.`),
    }),
  )
  .max(MAX_PROMPTS, `Pick up to ${MAX_PROMPTS} prompts.`)
  .refine((list) => new Set(list.map((p) => p.question)).size === list.length, {
    message: "Each prompt can only be used once.",
  });

/** Plan the DB writes needed to go from `current` to `next` (matched by question). */
export function diffPrompts(current: Prompt[], next: PromptDraft[]) {
  const byQuestion = new Map(current.map((p) => [p.question, p]));
  const keep = new Set(next.map((p) => p.question));
  return {
    remove: current.filter((p) => !keep.has(p.question)).map((p) => p.id),
    upsert: next.map((p, position) => ({
      id: byQuestion.get(p.question)?.id,
      question: p.question,
      answer: p.answer.trim(),
      position,
    })),
  };
}
