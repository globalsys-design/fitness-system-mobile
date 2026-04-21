"use client";

/**
 * ObjectiveRadar — Radar Chart em SVG puro.
 *
 * Por que SVG puro em vez de recharts?
 *  - Sem dependência adicional (~90KB gzipped economizados).
 *  - Controle total da estética — anéis sutis, stroke do polígono em primary,
 *    glow via filter, pontos com zoom-in no mount.
 *  - Animação GPU-accelerated via CSS (opacity, transform).
 *
 * Input: `values` normalizados em 0..1 (nós passamos média/4) e `labels`.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface ObjectiveRadarProps {
  values: number[]; // cada valor em [0, 1]
  labels: string[];
  size?: number; // px
  className?: string;
}

export function ObjectiveRadar({
  values,
  labels,
  size = 260,
  className,
}: ObjectiveRadarProps) {
  const n = values.length;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36; // espaço para labels externos

  // Ângulos: -90deg (topo) como início, sentido horário.
  const angleFor = (i: number) => (-Math.PI / 2) + (i * 2 * Math.PI) / n;

  const pointFor = (i: number, v: number) => {
    const a = angleFor(i);
    return {
      x: cx + Math.cos(a) * radius * v,
      y: cy + Math.sin(a) * radius * v,
    };
  };

  const labelPointFor = (i: number) => {
    const a = angleFor(i);
    const r = radius + 18;
    return {
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
    };
  };

  // Anéis: 25, 50, 75, 100%.
  const rings = [0.25, 0.5, 0.75, 1];

  // Eixos (linhas do centro às pontas).
  const axes = Array.from({ length: n }, (_, i) => {
    const p = pointFor(i, 1);
    return { x: p.x, y: p.y };
  });

  // Polígono de valores.
  const polyPoints = values
    .map((v, i) => {
      const p = pointFor(i, Math.max(0, Math.min(1, v)));
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Radar de categorias de objetivos"
        className="overflow-visible"
      >
        {/* Anéis concêntricos — n-gon para combinar com o polígono */}
        {rings.map((r, ri) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const p = pointFor(i, r);
            return `${p.x},${p.y}`;
          }).join(" ");
          return (
            <polygon
              key={`ring-${ri}`}
              points={pts}
              fill="none"
              className="stroke-border"
              strokeWidth={1}
              strokeDasharray={ri === rings.length - 1 ? "0" : "2 3"}
              opacity={ri === rings.length - 1 ? 0.6 : 0.35}
            />
          );
        })}

        {/* Eixos */}
        {axes.map((p, i) => (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            className="stroke-border"
            strokeWidth={1}
            opacity={0.35}
          />
        ))}

        {/* Polígono de valores — desenha com fade-in via CSS */}
        <polygon
          points={polyPoints}
          className="fill-primary/20 stroke-primary animate-in fade-in duration-500"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Pontos nas pontas ativas */}
        {values.map((v, i) => {
          if (v <= 0) return null;
          const p = pointFor(i, v);
          return (
            <circle
              key={`pt-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              className="fill-primary stroke-background animate-in zoom-in-50 fade-in duration-300"
              strokeWidth={2}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            />
          );
        })}

        {/* Labels nas pontas */}
        {labels.map((label, i) => {
          const p = labelPointFor(i);
          // Alinhamento automático conforme quadrante.
          const a = angleFor(i);
          const cos = Math.cos(a);
          let anchor: "start" | "middle" | "end" = "middle";
          if (cos > 0.3) anchor = "start";
          else if (cos < -0.3) anchor = "end";
          return (
            <text
              key={`lbl-${i}`}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-wide"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
