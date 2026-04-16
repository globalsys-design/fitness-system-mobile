import { describe, it, expect } from "vitest";

/**
 * The delta() function from AssessmentCompareView.tsx is a pure utility.
 * We inline it here to test the logic without importing a React component.
 *
 * delta(a, b) = ((b - a) / |a|) * 100
 * Returns null when either value is null/undefined or when a === 0.
 */
function delta(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a == null || b == null || a === 0) return null;
  return ((b - a) / Math.abs(a)) * 100;
}

describe("delta()", () => {
  describe("null / edge cases", () => {
    it("returns null when a is null", () => expect(delta(null, 10)).toBeNull());
    it("returns null when b is null", () => expect(delta(10, null)).toBeNull());
    it("returns null when both are null", () => expect(delta(null, null)).toBeNull());
    it("returns null when a is undefined", () => expect(delta(undefined, 10)).toBeNull());
    it("returns null when b is undefined", () => expect(delta(10, undefined)).toBeNull());
    it("returns null when a is 0 (division guard)", () => expect(delta(0, 5)).toBeNull());
  });

  describe("positive baseline", () => {
    it("no change → 0%", () => expect(delta(100, 100)).toBe(0));
    it("10% increase", () => expect(delta(100, 110)).toBe(10));
    it("50% increase", () => expect(delta(100, 150)).toBe(50));
    it("100% increase (doubled)", () => expect(delta(100, 200)).toBe(100));
    it("10% decrease", () => expect(delta(100, 90)).toBe(-10));
    it("50% decrease", () => expect(delta(100, 50)).toBe(-50));
    it("100% decrease (zeroed)", () => expect(delta(100, 0)).toBe(-100));
  });

  describe("negative baseline (e.g. negative score)", () => {
    it("uses |a| in denominator — value stays negative base", () => {
      // a = -9 (young male Framingham age score), b = -4 (35-39)
      // ((−4 − (−9)) / |−9|) * 100 = (5 / 9) * 100 ≈ 55.56
      const result = delta(-9, -4);
      expect(result).not.toBeNull();
      expect(result!).toBeCloseTo(55.56, 1);
    });

    it("improvement in negative score", () => {
      // a = -5, b = -10 → ((-10 - -5) / 5) * 100 = -100
      expect(delta(-5, -10)).toBeCloseTo(-100, 5);
    });
  });

  describe("realistic fitness metrics", () => {
    it("body fat % reduced from 25 to 20 → -20%", () => {
      expect(delta(25, 20)).toBeCloseTo(-20, 5);
    });
    it("VO2max improved from 40 to 45 → +12.5%", () => {
      expect(delta(40, 45)).toBeCloseTo(12.5, 5);
    });
    it("weight unchanged at 80kg → 0%", () => {
      expect(delta(80, 80)).toBe(0);
    });
    it("Framingham risk worsened from 5% to 10% → +100%", () => {
      expect(delta(5, 10)).toBe(100);
    });
  });

  describe("fractional values", () => {
    it("handles decimal inputs", () => {
      // a = 22.5, b = 21.0 → ((21.0 - 22.5) / 22.5) * 100 ≈ -6.67
      const result = delta(22.5, 21.0);
      expect(result!).toBeCloseTo(-6.67, 1);
    });
  });
});
