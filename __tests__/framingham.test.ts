import { describe, it, expect } from "vitest";
import {
  calcFraminghamScore,
  classifyFraminghamRisk,
  type FraminghamInput,
} from "@/lib/calculations/framingham";

// ── Helpers ───────────────────────────────────────────────────────────────────

function male(overrides: Partial<FraminghamInput> = {}): FraminghamInput {
  return {
    gender: "M",
    age: "45",
    totalCholesterol: "220",
    hdl: "45",
    systolic: "130",
    isTreatedBP: false,
    isSmoker: false,
    hasDiabetes: false,
    ...overrides,
  };
}

function female(overrides: Partial<FraminghamInput> = {}): FraminghamInput {
  return {
    gender: "F",
    age: "50",
    totalCholesterol: "200",
    hdl: "55",
    systolic: "125",
    isTreatedBP: false,
    isSmoker: false,
    hasDiabetes: false,
    ...overrides,
  };
}

// ── calcFraminghamScore ───────────────────────────────────────────────────────

describe("calcFraminghamScore", () => {
  describe("returns null for invalid / incomplete input", () => {
    it("null gender", () => {
      expect(calcFraminghamScore(male({ gender: null }))).toBeNull();
    });
    it("non-numeric age", () => {
      expect(calcFraminghamScore(male({ age: "" }))).toBeNull();
    });
    it("non-numeric totalCholesterol", () => {
      expect(calcFraminghamScore(male({ totalCholesterol: "abc" }))).toBeNull();
    });
    it("non-numeric hdl", () => {
      expect(calcFraminghamScore(male({ hdl: "" }))).toBeNull();
    });
    it("non-numeric systolic", () => {
      expect(calcFraminghamScore(male({ systolic: "" }))).toBeNull();
    });
  });

  describe("male scoring", () => {
    it("baseline: age 45, TC 220, HDL 45, SBP 130, no risk factors → score 8, risk 5%", () => {
      // age 45-49 → +3
      // TC 200-239 → +7
      // HDL 40-49 → +1
      // SBP 120-129, untreated → +0
      // no smoke / no diabetes
      // total = 11 → risk10Year = 10
      const result = calcFraminghamScore(male({ age: "45", systolic: "125" }));
      expect(result).not.toBeNull();
      expect(result!.score).toBe(11);
      expect(result!.risk10Year).toBe(10);
    });

    it("smoker adds 8 points", () => {
      const base = calcFraminghamScore(male())!;
      const smoker = calcFraminghamScore(male({ isSmoker: true }))!;
      expect(smoker.score - base.score).toBe(8);
    });

    it("diabetes adds 5 points", () => {
      const base = calcFraminghamScore(male())!;
      const diabetic = calcFraminghamScore(male({ hasDiabetes: true }))!;
      expect(diabetic.score - base.score).toBe(5);
    });

    it("treated BP increases SBP contribution", () => {
      const untreated = calcFraminghamScore(male({ systolic: "130" }))!;
      const treated = calcFraminghamScore(male({ systolic: "130", isTreatedBP: true }))!;
      // SBP 120-129 treated → +1 vs untreated → +0
      expect(treated.score - untreated.score).toBe(1);
    });

    it("young male (20-34) gets -9 age points", () => {
      // age 20-34 → -9, TC 160-199 → +4, HDL ≥60 → -1, SBP<120 untreated → +0
      const result = calcFraminghamScore(
        male({ age: "25", totalCholesterol: "180", hdl: "65", systolic: "110" })
      )!;
      expect(result.score).toBe(-9 + 4 + -1 + 0);
    });

    it("age > 75 gets 13 points", () => {
      const result = calcFraminghamScore(male({ age: "80" }))!;
      // +13 age, TC 220 → +7, HDL 45 → +1, SBP 130 (130-139) untreated → +1
      expect(result.score).toBe(13 + 7 + 1 + 1); // = 22
    });

    it("very high score (≥17) maps to 30% risk", () => {
      const result = calcFraminghamScore(
        male({ age: "70", totalCholesterol: "290", hdl: "35", systolic: "165", isSmoker: true, hasDiabetes: true })
      )!;
      expect(result.risk10Year).toBe(30);
    });
  });

  describe("female scoring", () => {
    it("baseline female: age 48, TC 200, HDL 55, SBP 125 untreated → correct score", () => {
      // age 45-49 → +3
      // TC 200 (200-239 female bracket) → +8
      // HDL 50-59 → +0
      // SBP 125 (120-129) untreated → +1
      // total = 12 → risk10Year = 1 (≤12)
      const result = calcFraminghamScore(female({ age: "48" }))!;
      expect(result.score).toBe(3 + 8 + 0 + 1); // = 12
      expect(result.risk10Year).toBe(1);
    });

    it("smoker adds 9 points for female", () => {
      const base = calcFraminghamScore(female())!;
      const smoker = calcFraminghamScore(female({ isSmoker: true }))!;
      expect(smoker.score - base.score).toBe(9);
    });

    it("diabetes adds 7 points for female", () => {
      const base = calcFraminghamScore(female())!;
      const diabetic = calcFraminghamScore(female({ hasDiabetes: true }))!;
      expect(diabetic.score - base.score).toBe(7);
    });

    it("female age 20-34 gets -7 age points", () => {
      const result = calcFraminghamScore(
        female({ age: "28", totalCholesterol: "155", hdl: "65", systolic: "110" })
      )!;
      // -7 age, 0 TC, -1 HDL, 0 SBP = -8
      expect(result.score).toBe(-7 + 0 + -1 + 0);
    });

    it("female age > 75 gets 16 points", () => {
      const result = calcFraminghamScore(female({ age: "78" }))!;
      // 16 age + TC 200 (200-239 bracket) → +8 + HDL 55 → +0 + SBP 125 untreated → +1 = 25
      expect(result.score).toBe(16 + 8 + 0 + 1); // = 25
    });

    it("very high female score (≥25) maps to 30% risk", () => {
      const result = calcFraminghamScore(
        female({ age: "70", totalCholesterol: "290", hdl: "35", systolic: "165", isSmoker: true, hasDiabetes: true })
      )!;
      expect(result.risk10Year).toBe(30);
    });
  });
});

// ── classifyFraminghamRisk ────────────────────────────────────────────────────

describe("classifyFraminghamRisk", () => {
  it("risk < 10% → Baixo / low", () => {
    const result = classifyFraminghamRisk(5);
    expect(result.label).toBe("Baixo");
    expect(result.level).toBe("low");
  });

  it("risk = 9% → Baixo (boundary)", () => {
    expect(classifyFraminghamRisk(9).level).toBe("low");
  });

  it("risk = 10% → Moderado / moderate", () => {
    const result = classifyFraminghamRisk(10);
    expect(result.label).toBe("Moderado");
    expect(result.level).toBe("moderate");
  });

  it("risk = 19% → Moderado (boundary)", () => {
    expect(classifyFraminghamRisk(19).level).toBe("moderate");
  });

  it("risk = 20% → Alto / high", () => {
    const result = classifyFraminghamRisk(20);
    expect(result.label).toBe("Alto");
    expect(result.level).toBe("high");
  });

  it("risk = 30% → Alto / high", () => {
    expect(classifyFraminghamRisk(30).level).toBe("high");
  });
});
