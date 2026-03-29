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
  table: {
    width: "100%",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: pdfColors.border,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: pdfColors.primary,
    paddingVertical: pdfSpacing.md,
    paddingHorizontal: pdfSpacing.lg,
  },
  tableHeaderCell: {
    fontSize: pdfFonts.sm,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.headerText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: pdfSpacing.md,
    paddingHorizontal: pdfSpacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: pdfColors.border,
  },
  tableRowAlt: {
    backgroundColor: pdfColors.tableBg,
  },
  tableCell: {
    fontSize: pdfFonts.base,
    fontFamily: "Helvetica",
    color: pdfColors.foreground,
  },
  tableCellBold: {
    fontSize: pdfFonts.base,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.foreground,
  },
  observationText: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica-Oblique",
    color: pdfColors.mutedForeground,
    marginTop: 2,
  },
  // Column widths — optimized for A4
  colNum: { width: "6%" },
  colExercise: { width: "34%" },
  colSeries: { width: "10%", textAlign: "center" as const },
  colReps: { width: "12%", textAlign: "center" as const },
  colLoad: { width: "13%", textAlign: "center" as const },
  colRest: { width: "12%", textAlign: "center" as const },
  colObs: { width: "13%" },
  // Summary
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: pdfSpacing.xl,
    marginTop: pdfSpacing.md,
    paddingRight: pdfSpacing.lg,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: pdfSpacing.sm,
  },
  summaryLabel: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica",
    color: pdfColors.mutedForeground,
  },
  summaryValue: {
    fontSize: pdfFonts.sm,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.foreground,
  },
});

interface Exercise {
  name: string;
  series: number;
  repetitions: string;
  load: string;
  rest: string;
  observations?: string;
}

interface ExerciseTableProps {
  exercises: Exercise[];
}

export function ExerciseTable({ exercises }: ExerciseTableProps) {
  if (!exercises || exercises.length === 0) return null;

  const totalSeries = exercises.reduce((acc, e) => acc + (e.series || 0), 0);

  return (
    <View style={styles.section}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>Exercícios de Musculação</Text>

      {/* Table */}
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colNum]}>#</Text>
          <Text style={[styles.tableHeaderCell, styles.colExercise]}>
            Exercício
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colSeries]}>Séries</Text>
          <Text style={[styles.tableHeaderCell, styles.colReps]}>Reps</Text>
          <Text style={[styles.tableHeaderCell, styles.colLoad]}>Carga</Text>
          <Text style={[styles.tableHeaderCell, styles.colRest]}>Desc.</Text>
          <Text style={[styles.tableHeaderCell, styles.colObs]}>Obs.</Text>
        </View>

        {/* Rows */}
        {exercises.map((exercise, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              index % 2 === 1 ? styles.tableRowAlt : {},
            ]}
          >
            <Text style={[styles.tableCellBold, styles.colNum]}>
              {index + 1}
            </Text>
            <View style={styles.colExercise}>
              <Text style={styles.tableCellBold}>{exercise.name}</Text>
              {exercise.observations && (
                <Text style={styles.observationText}>
                  {exercise.observations}
                </Text>
              )}
            </View>
            <Text style={[styles.tableCell, styles.colSeries]}>
              {exercise.series}
            </Text>
            <Text style={[styles.tableCell, styles.colReps]}>
              {exercise.repetitions}
            </Text>
            <Text style={[styles.tableCell, styles.colLoad]}>
              {exercise.load}
            </Text>
            <Text style={[styles.tableCell, styles.colRest]}>
              {exercise.rest}
            </Text>
            <Text style={[styles.tableCell, styles.colObs]}>
              {exercise.observations ? "✓" : "—"}
            </Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total de exercícios:</Text>
          <Text style={styles.summaryValue}>{exercises.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total de séries:</Text>
          <Text style={styles.summaryValue}>{totalSeries}</Text>
        </View>
      </View>
    </View>
  );
}
