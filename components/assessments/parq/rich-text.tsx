/**
 * renderRichText — parser mínimo seguro para **negrito** inline.
 *
 * Evita dangerouslySetInnerHTML: quebra a string por `**...**`, retorna
 * ReactNode com <strong> nos trechos destacados. Aceita apenas negrito
 * (o PAR-Q+ usa só isso). Caracteres literais `*` fora de pares ficam como estão.
 */

import type { ReactNode } from "react";

const BOLD_REGEX = /\*\*([^*]+)\*\*/g;

export function renderRichText(text: string): ReactNode {
  if (!text.includes("**")) return text;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  // eslint-disable-next-line no-cond-assign
  while ((match = BOLD_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={`b-${key++}`} className="font-semibold text-foreground">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}
