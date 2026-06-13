import { describe, it, expect } from "vitest";
import {
  validateApplication,
  isApplicationValid,
  buildApplicationPayload,
  type ApplicationForm,
} from "@/lib/careers";

const valid: ApplicationForm = {
  name: "Wanjiru Kamau",
  phone: "0712 345 678",
  email: "wanjiru@example.com",
  interest: "training",
  message: "I'd like to enrol in the beginner aesthetics course.",
};

describe("validateApplication", () => {
  it("passes a fully valid application", () => {
    expect(isApplicationValid(validateApplication(valid))).toBe(true);
  });

  it("requires a name within RLS bounds (1–200)", () => {
    expect(validateApplication({ ...valid, name: "" }).name).toBeTruthy();
    expect(validateApplication({ ...valid, name: "x".repeat(201) }).name).toBeTruthy();
  });

  it("requires a phone within RLS bounds (5–20, digits)", () => {
    expect(validateApplication({ ...valid, phone: "123" }).phone).toBeTruthy();
    expect(validateApplication({ ...valid, phone: "1".repeat(25) }).phone).toBeTruthy();
    expect(validateApplication({ ...valid, phone: "07ab345678" }).phone).toBeTruthy();
  });

  it("allows email to be omitted but rejects malformed ones", () => {
    expect(isApplicationValid(validateApplication({ ...valid, email: "" }))).toBe(true);
    expect(validateApplication({ ...valid, email: "not-an-email" }).email).toBeTruthy();
  });

  it("only accepts the two interest tracks (mirrors RLS)", () => {
    expect(
      validateApplication({ ...valid, interest: "other" as ApplicationForm["interest"] }).interest
    ).toBeTruthy();
  });

  it("bounds the message at 2000 chars (mirrors RLS)", () => {
    expect(validateApplication({ ...valid, message: "x".repeat(2001) }).message).toBeTruthy();
    expect(isApplicationValid(validateApplication({ ...valid, message: "" }))).toBe(true);
  });
});

describe("buildApplicationPayload", () => {
  it("normalizes phone and empties to null, status new", () => {
    const payload = buildApplicationPayload({ ...valid, phone: "0712 345-678", email: "", message: " " });
    expect(payload).toEqual({
      name: "Wanjiru Kamau",
      phone: "0712345678",
      email: null,
      interest: "training",
      message: null,
      status: "new",
    });
  });
});
