import * as fs from "fs";
import * as path from "path";
import { tokens } from "./tokens";

const CSS_PATH = path.join(process.cwd(), "app", "globals.css");

const START_ROOT = "/* [TOKENS:ROOT:START] */";
const END_ROOT = "/* [TOKENS:ROOT:END] */";
const START_DARK = "/* [TOKENS:DARK:START] */";
const END_DARK = "/* [TOKENS:DARK:END] */";

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function generateRootBlock(): string {
  const lines: string[] = [":root {", "  /* Colors */"];

  const colorKeys = [
    "background", "foreground", "card", "cardForeground", "popover", "popoverForeground",
    "primary", "primaryForeground", "secondary", "secondaryForeground",
    "muted", "mutedForeground", "accent", "accentForeground",
    "destructive", "destructiveForeground", "border", "input", "ring",
  ];

  for (const key of colorKeys) {
    if (tokens.light[key]) {
      lines.push(`  --${camelToKebab(key)}: ${tokens.light[key]};`);
    }
  }

  lines.push("  /* Charts */");
  for (let i = 1; i <= 5; i++) {
    if (tokens.light[`chart${i}`]) {
      lines.push(`  --chart-${i}: ${tokens.light[`chart${i}`]};`);
    }
  }

  lines.push("  /* Sidebar */");
  const sidebarKeys = ["sidebar", "sidebarForeground", "sidebarPrimary", "sidebarPrimaryForeground",
    "sidebarAccent", "sidebarAccentForeground", "sidebarBorder", "sidebarRing"];
  for (const key of sidebarKeys) {
    if (tokens.light[key]) {
      const cssKey = camelToKebab(key);
      lines.push(`  --${cssKey}: ${tokens.light[key]};`);
    }
  }

  lines.push("  /* Typography */");
  lines.push(`  --font-sans: ${tokens.fonts.sans};`);
  lines.push(`  --font-serif: ${tokens.fonts.serif};`);
  lines.push(`  --font-mono: ${tokens.fonts.mono};`);

  lines.push("  /* Radius */");
  lines.push(`  --radius: ${tokens.radius.default};`);

  lines.push("  /* Shadows */");
  lines.push(`  --shadow-2xs: ${tokens.shadows["2xs"]};`);
  lines.push(`  --shadow-xs: ${tokens.shadows.xs};`);
  lines.push(`  --shadow-sm: ${tokens.shadows.sm};`);
  lines.push(`  --shadow: ${tokens.shadows.default};`);
  lines.push(`  --shadow-md: ${tokens.shadows.md};`);
  lines.push(`  --shadow-lg: ${tokens.shadows.lg};`);
  lines.push(`  --shadow-xl: ${tokens.shadows.xl};`);
  lines.push(`  --shadow-2xl: ${tokens.shadows["2xl"]};`);

  lines.push("  /* Spacing */");
  lines.push(`  --spacing: ${tokens.spacing};`);

  lines.push("}");
  return lines.join("\n");
}

function generateDarkBlock(): string {
  const lines: string[] = [".dark {", "  /* Colors */"];

  const colorKeys = [
    "background", "foreground", "card", "cardForeground", "popover", "popoverForeground",
    "primary", "primaryForeground", "secondary", "secondaryForeground",
    "muted", "mutedForeground", "accent", "accentForeground",
    "destructive", "destructiveForeground", "border", "input", "ring",
  ];

  for (const key of colorKeys) {
    if (tokens.dark[key]) {
      lines.push(`  --${camelToKebab(key)}: ${tokens.dark[key]};`);
    }
  }

  lines.push("  /* Charts */");
  for (let i = 1; i <= 5; i++) {
    if (tokens.dark[`chart${i}`]) {
      lines.push(`  --chart-${i}: ${tokens.dark[`chart${i}`]};`);
    }
  }

  lines.push("  /* Sidebar */");
  const sidebarKeys = ["sidebar", "sidebarForeground", "sidebarPrimary", "sidebarPrimaryForeground",
    "sidebarAccent", "sidebarAccentForeground", "sidebarBorder", "sidebarRing"];
  for (const key of sidebarKeys) {
    if (tokens.dark[key]) {
      const cssKey = camelToKebab(key);
      lines.push(`  --${cssKey}: ${tokens.dark[key]};`);
    }
  }

  lines.push("  /* Typography */");
  lines.push(`  --font-sans: ${tokens.fonts.sans};`);
  lines.push(`  --font-serif: ${tokens.fonts.serif};`);
  lines.push(`  --font-mono: ${tokens.fonts.mono};`);

  lines.push("  /* Radius */");
  lines.push(`  --radius: ${tokens.radius.default};`);

  lines.push("  /* Shadows */");
  lines.push(`  --shadow-2xs: ${tokens.shadows["2xs"]};`);
  lines.push(`  --shadow-xs: ${tokens.shadows.xs};`);
  lines.push(`  --shadow-sm: ${tokens.shadows.sm};`);
  lines.push(`  --shadow: ${tokens.shadows.default};`);
  lines.push(`  --shadow-md: ${tokens.shadows.md};`);
  lines.push(`  --shadow-lg: ${tokens.shadows.lg};`);
  lines.push(`  --shadow-xl: ${tokens.shadows.xl};`);
  lines.push(`  --shadow-2xl: ${tokens.shadows["2xl"]};`);

  lines.push("}");
  return lines.join("\n");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateGlobalsCSS(check: boolean): void {
  const existing = fs.readFileSync(CSS_PATH, "utf-8");

  const newRootBlock = generateRootBlock();
  const newDarkBlock = generateDarkBlock();

  const hasMarkers =
    existing.includes(START_ROOT) &&
    existing.includes(END_ROOT) &&
    existing.includes(START_DARK) &&
    existing.includes(END_DARK);

  if (hasMarkers) {
    const updated = existing
      .replace(
        new RegExp(`${escapeRegex(START_ROOT)}[\\s\\S]*?${escapeRegex(END_ROOT)}`),
        `${START_ROOT}\n${newRootBlock}\n${END_ROOT}`
      )
      .replace(
        new RegExp(`${escapeRegex(START_DARK)}[\\s\\S]*?${escapeRegex(END_DARK)}`),
        `${START_DARK}\n${newDarkBlock}\n${END_DARK}`
      );

    if (check) {
      if (updated === existing) {
        console.log("✅ globals.css is in sync with tokens.ts");
        process.exit(0);
      } else {
        console.error("❌ globals.css is out of sync with tokens.ts. Run `npm run tokens` to update.");
        process.exit(1);
      }
    } else {
      fs.writeFileSync(CSS_PATH, updated, "utf-8");
      console.log("✅ globals.css updated from tokens.ts");
    }
  } else {
    console.warn("⚠️  No token markers found in globals.css. Run without --check to inject markers.");
    if (!check) {
      console.log("Please add token markers manually or let the script inject them.");
    }
    process.exit(check ? 1 : 0);
  }
}

const isCheck = process.argv.includes("--check");
updateGlobalsCSS(isCheck);
