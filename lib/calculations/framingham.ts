export type Gender = "M" | "F" | null;

export interface FraminghamInput {
  gender: Gender;
  age: string;
  totalCholesterol: string;
  hdl: string;
  systolic: string;
  isTreatedBP: boolean;
  isSmoker: boolean;
  hasDiabetes: boolean;
}

export interface FraminghamResult {
  score: number;
  risk10Year: number;
}

export function calcFraminghamScore(
  data: FraminghamInput
): FraminghamResult | null {
  const age = parseInt(data.age);
  const tc = parseInt(data.totalCholesterol);
  const hdl = parseInt(data.hdl);
  const sbp = parseInt(data.systolic);

  if (!data.gender || isNaN(age) || isNaN(tc) || isNaN(hdl) || isNaN(sbp))
    return null;

  let points = 0;

  if (data.gender === "M") {
    if (age >= 20 && age <= 34) points += -9;
    else if (age <= 39) points += -4;
    else if (age <= 44) points += 0;
    else if (age <= 49) points += 3;
    else if (age <= 54) points += 6;
    else if (age <= 59) points += 8;
    else if (age <= 64) points += 10;
    else if (age <= 69) points += 11;
    else if (age <= 74) points += 12;
    else points += 13;

    if (tc < 160) points += 0;
    else if (tc <= 199) points += 4;
    else if (tc <= 239) points += 7;
    else if (tc <= 279) points += 9;
    else points += 11;

    if (hdl >= 60) points += -1;
    else if (hdl >= 50) points += 0;
    else if (hdl >= 40) points += 1;
    else points += 2;

    if (!data.isTreatedBP) {
      if (sbp < 120) points += 0;
      else if (sbp <= 129) points += 0;
      else if (sbp <= 139) points += 1;
      else if (sbp <= 159) points += 1;
      else points += 2;
    } else {
      if (sbp < 120) points += 0;
      else if (sbp <= 129) points += 1;
      else if (sbp <= 139) points += 2;
      else if (sbp <= 159) points += 2;
      else points += 3;
    }

    if (data.isSmoker) points += 8;
    if (data.hasDiabetes) points += 5;
  } else {
    if (age >= 20 && age <= 34) points += -7;
    else if (age <= 39) points += -3;
    else if (age <= 44) points += 0;
    else if (age <= 49) points += 3;
    else if (age <= 54) points += 6;
    else if (age <= 59) points += 8;
    else if (age <= 64) points += 10;
    else if (age <= 69) points += 12;
    else if (age <= 74) points += 14;
    else points += 16;

    if (tc < 160) points += 0;
    else if (tc <= 199) points += 4;
    else if (tc <= 239) points += 8;
    else if (tc <= 279) points += 11;
    else points += 13;

    if (hdl >= 60) points += -1;
    else if (hdl >= 50) points += 0;
    else if (hdl >= 40) points += 1;
    else points += 2;

    if (!data.isTreatedBP) {
      if (sbp < 120) points += 0;
      else if (sbp <= 129) points += 1;
      else if (sbp <= 139) points += 2;
      else if (sbp <= 159) points += 3;
      else points += 4;
    } else {
      if (sbp < 120) points += 0;
      else if (sbp <= 129) points += 3;
      else if (sbp <= 139) points += 4;
      else if (sbp <= 159) points += 5;
      else points += 6;
    }

    if (data.isSmoker) points += 9;
    if (data.hasDiabetes) points += 7;
  }

  let risk10Year: number;
  if (data.gender === "M") {
    if (points <= 4) risk10Year = 1;
    else if (points <= 6) risk10Year = 2;
    else if (points <= 8) risk10Year = 5;
    else if (points <= 10) risk10Year = 6;
    else if (points <= 12) risk10Year = 10;
    else if (points <= 14) risk10Year = 16;
    else if (points <= 16) risk10Year = 25;
    else risk10Year = 30;
  } else {
    if (points <= 12) risk10Year = 1;
    else if (points <= 14) risk10Year = 2;
    else if (points <= 16) risk10Year = 4;
    else if (points <= 18) risk10Year = 6;
    else if (points <= 20) risk10Year = 8;
    else if (points <= 22) risk10Year = 11;
    else if (points <= 24) risk10Year = 14;
    else risk10Year = 30;
  }

  return { score: points, risk10Year };
}

export function classifyFraminghamRisk(risk10Year: number): {
  label: string;
  level: "low" | "moderate" | "high";
} {
  if (risk10Year < 10) return { label: "Baixo", level: "low" };
  if (risk10Year < 20) return { label: "Moderado", level: "moderate" };
  return { label: "Alto", level: "high" };
}
