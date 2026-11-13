import { describe, expect, it } from "vitest";
import { diffPrompts, MAX_PROMPTS, promptsSchema, PROMPT_QUESTIONS } from "../prompts";

const answered = (n: number) =>
  PROMPT_QUESTIONS.slice(0, n).map((question) => ({ question, answer: "Yes" }));

describe("promptsSchema", () => {
  it(`accepts up to ${MAX_PROMPTS} answered prompts from the library`, () => {
    expect(promptsSchema.safeParse(answered(MAX_PROMPTS)).success).toBe(true);
    expect(promptsSchema.safeParse([]).success).toBe(true);
  });
  it("rejects too many prompts, duplicates, empty answers and made-up questions", () => {
    expect(promptsSchema.safeParse(answered(MAX_PROMPTS + 1)).success).toBe(false);
    const dup = [
      { question: PROMPT_QUESTIONS[0], answer: "a" },
      { question: PROMPT_QUESTIONS[0], answer: "b" },
    ];
    expect(promptsSchema.safeParse(dup).success).toBe(false);
    expect(promptsSchema.safeParse([{ question: PROMPT_QUESTIONS[0], answer: "  " }]).success).toBe(
      false,
    );
    expect(promptsSchema.safeParse([{ question: "Made up?", answer: "x" }]).success).toBe(false);
  });
});

describe("diffPrompts", () => {
  it("keeps ids for kept questions, deletes removed ones, inserts new ones in order", () => {
    const current = [
      { id: "p1", question: "My current PR is…", answer: "old" },
      { id: "p2", question: "Favourite snack bar…", answer: "bar" },
    ];
    const next = [
      { question: "Currently training for…", answer: "Hyrox" },
      { question: "My current PR is…", answer: " new " },
    ];
    expect(diffPrompts(current, next)).toEqual({
      remove: ["p2"],
      upsert: [
        { id: undefined, question: "Currently training for…", answer: "Hyrox", position: 0 },
        { id: "p1", question: "My current PR is…", answer: "new", position: 1 },
      ],
    });
  });
});
