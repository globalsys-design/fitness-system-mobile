import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors, pdfFonts, pdfSpacing } from "./theme";

const styles = StyleSheet.create({
  section: {
    marginBottom: pdfSpacing.xl,
  },
  sectionTitle: {
    fontSize: pdfFonts.lg,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.foreground,
    marginBottom: pdfSpacing.md,
    paddingBottom: pdfSpacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: pdfColors.primary,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: pdfColors.border,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: pdfSpacing.md,
  },
  cardIcon: {
    width: 80,
    backgroundColor: pdfColors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: pdfSpacing.lg,
  },
  cardIconText: {
    fontSize: 28,
  },
  cardIconLabel: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.primary,
    marginTop: pdfSpacing.sm,
    textAlign: "center",
  },
  cardBody: {
    flex: 1,
    padding: pdfSpacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: pdfSpacing.md,
  },
  cardField: {
    width: "45%",
  },
  cardFieldLabel: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardFieldValue: {
    fontSize: pdfFonts.md,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.foreground,
  },
  notesSection: {
    width: "100%",
    marginTop: pdfSpacing.sm,
    paddingTop: pdfSpacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: pdfColors.border,
  },
  notesLabel: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  notesText: {
    fontSize: pdfFonts.sm,
    fontFamily: "Helvetica-Oblique",
    color: pdfColors.foreground,
  },
});

/** Mapeamento de modalidades → emoji + nome pt-BR */
const MODALITY_MAP: Record<string, { icon: string; label: string }> = {
  bike: { icon: "🚴", label: "Bicicleta" },
  running: { icon: "🏃", label: "Corrida" },
  swimming: { icon: "🏊", label: "Natação" },
  elliptical: { icon: "🚴‍♀️", label: "Elíptico" },
  rowing: { icon: "🚣", label: "Remo" },
  walking: { icon: "🚶", label: "Caminhada" },
  treadmill: { icon: "🏃‍♂️", label: "Esteira" },
  "jump-rope": { icon: "⛹️", label: "Pular Corda" },
};

const INTENSITY_MAP: Record<string, string> = {
  low: "Baixa (50-60% FC máx)",
  moderate: "Moderada (60-70% FC máx)",
  high: "Alta (70-85% FC máx)",
  "very-high": "Muito Alta (>85% FC máx)",
};

const FREQUENCY_MAP: Record<string, string> = {
  daily: "Diária",
  "3x-week": "3x por semana",
  "4x-week": "4x por semana",
  "5x-week": "5x por semana",
  "6x-week": "6x por semana",
};

interface AerobicData {
  modality?: string;
  intensity?: string;
  duration?: number;
  frequency?: string;
  speed?: number;
  rpm?: number;
  resistance?: number;
  incline?: number;
  spm?: number;
  notes?: string;
}

interface AerobicCardsProps {
  data: AerobicData;
}

export function AerobicCards({ data }: AerobicCardsProps) {
  if (!data) return null;

  const modality = MODALITY_MAP[data.modality || "running"] || {
    icon: "🏃",
    label: data.modality || "Aeróbico",
  };

  return (
    <View style={styles.section}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Prescrição Aeróbica</Text>

      {/* Card */}
      <View style={styles.card}>
        {/* Icon Section */}
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{modality.icon}</Text>
          <Text style={styles.cardIconLabel}>{modality.label}</Text>
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          {/* Duração */}
          {data.duration && (
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>Duração</Text>
              <Text style={styles.cardFieldValue}>{data.duration} min</Text>
            </View>
          )}

          {/* Intensidade */}
          {data.intensity && (
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>Intensidade</Text>
              <Text style={styles.cardFieldValue}>
                {INTENSITY_MAP[data.intensity] || data.intensity}
              </Text>
            </View>
          )}

          {/* Frequência */}
          {data.frequency && (
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>Frequência</Text>
              <Text style={styles.cardFieldValue}>
                {FREQUENCY_MAP[data.frequency] || data.frequency}
              </Text>
            </View>
          )}

          {/* Velocidade */}
          {data.speed && (
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>Velocidade</Text>
              <Text style={styles.cardFieldValue}>{data.speed} km/h</Text>
            </View>
          )}

          {/* RPM */}
          {data.rpm && (
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>RPM</Text>
              <Text style={styles.cardFieldValue}>{data.rpm} rpm</Text>
            </View>
          )}

          {/* Resistência */}
          {data.resistance && (
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>Resistência</Text>
              <Text style={styles.cardFieldValue}>Nível {data.resistance}</Text>
            </View>
          )}

          {/* Inclinação */}
          {data.incline && (
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>Inclinação</Text>
              <Text style={styles.cardFieldValue}>{data.incline}%</Text>
            </View>
          )}

          {/* SPM */}
          {data.spm && (
            <View style={styles.cardField}>
              <Text style={styles.cardFieldLabel}>Golpes/min</Text>
              <Text style={styles.cardFieldValue}>{data.spm} spm</Text>
            </View>
          )}

          {/* Notas */}
          {data.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Observações</Text>
              <Text style={styles.notesText}>{data.notes}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
