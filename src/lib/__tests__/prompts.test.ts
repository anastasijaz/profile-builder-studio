import { describe, expect, it } from "vitest";
import { diffPrompts, promptsSchema, PROMPT_QUESTIONS } from "../prompts";

describe("promptsSchema", () => {
  it("accepts up to 3 answered prompts from the library", () => {
    const ok = PROMPT_QUESTIONS.slice(0, 3).map((question) => ({ question, answer: "Yes" }));
    expect(promptsSchema.safeParse(ok).success).toBe(true);
    expect(promptsSchema.safeParse([]).success).toBe(true);
  });
  it("rejects a 4th prompt, duplicates, empty answers and made-up questions", () => {
    const four = PROMPT_QUESTIONS.slice(0, 4).map((question) => ({ question, answer: "x" }));
    expect(promptsSchema.safeParse(four).success).toBe(false);
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
