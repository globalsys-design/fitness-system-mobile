import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors, pdfFonts, pdfSpacing } from "./theme";
import { PdfHeader } from "./pdf-header";
import { ExerciseTable } from "./exercise-table";
import { AerobicCards } from "./aerobic-cards";
import { PdfFooter } from "./pdf-footer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: pdfFonts.base,
    color: pdfColors.foreground,
    backgroundColor: pdfColors.background,
    paddingTop: pdfSpacing["2xl"],
    paddingBottom: 80, // Espaço para o footer fixo
    paddingHorizontal: pdfSpacing["2xl"],
  },
  /** Info card abaixo do header */
  infoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: pdfColors.muted,
    borderRadius: 4,
    padding: pdfSpacing.lg,
    marginBottom: pdfSpacing.xl,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica",
    color: pdfColors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: pdfFonts.md,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.foreground,
  },
  /** Divider */
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: pdfColors.border,
    marginVertical: pdfSpacing.lg,
  },
  /** Notes section */
  notesSection: {
    marginTop: pdfSpacing.lg,
    padding: pdfSpacing.lg,
    backgroundColor: pdfColors.muted,
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: pdfFonts.sm,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.foreground,
    marginBottom: pdfSpacing.sm,
  },
  notesText: {
    fontSize: pdfFonts.sm,
    fontFamily: "Helvetica",
    color: pdfColors.mutedForeground,
    lineHeight: 1.5,
  },
  /** Signature area */
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: pdfSpacing["3xl"],
    paddingTop: pdfSpacing.xl,
  },
  signatureBlock: {
    width: "40%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.foreground,
    marginBottom: pdfSpacing.sm,
  },
  signatureLabel: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica",
    color: pdfColors.mutedForeground,
    textAlign: "center",
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

export interface PrescriptionPDFProps {
  prescription: {
    id: string;
    type: string;
    content: any;
    createdAt: Date | string;
    client: { name: string };
    trainingSheet?: { exercises: any } | null;
  };
  professionalName: string;
}

export function PrescriptionPDF({
  prescription,
  professionalName,
}: PrescriptionPDFProps) {
  const exercises: Exercise[] = Array.isArray(
    prescription.trainingSheet?.exercises
  )
    ? prescription.trainingSheet.exercises
    : [];

  const aerobicData: AerobicData | null =
    prescription.type === "AEROBIC" && prescription.content
      ? (prescription.content as AerobicData)
      : null;

  const formattedDate = format(
    new Date(prescription.createdAt),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );

  const totalExercises = exercises.length;
  const totalSeries = exercises.reduce((acc, e) => acc + (e.series || 0), 0);

  return (
    <Document
      title={`Prescrição - ${prescription.client.name}`}
      author={professionalName}
      subject="Prescrição de Treino"
      creator="Fitness System"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <PdfHeader
          professionalName={professionalName}
          clientName={prescription.client.name}
          date={formattedDate}
          type={prescription.type}
        />

        {/* Info Bar — Training */}
        {prescription.type === "TRAINING" && totalExercises > 0 && (
          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Exercícios</Text>
              <Text style={styles.infoValue}>{totalExercises}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Séries Totais</Text>
              <Text style={styles.infoValue}>{totalSeries}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipo</Text>
              <Text style={styles.infoValue}>Musculação</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data</Text>
              <Text style={styles.infoValue}>
                {format(new Date(prescription.createdAt), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Info Bar — Aerobic */}
        {prescription.type === "AEROBIC" && aerobicData && (
          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipo</Text>
              <Text style={styles.infoValue}>Aeróbico</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duração</Text>
              <Text style={styles.infoValue}>
                {aerobicData.duration || "—"} min
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Frequência</Text>
              <Text style={styles.infoValue}>
                {aerobicData.frequency || "—"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data</Text>
              <Text style={styles.infoValue}>
                {format(new Date(prescription.createdAt), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Training Exercises Table */}
        {prescription.type === "TRAINING" && (
          <ExerciseTable exercises={exercises} />
        )}

        {/* Aerobic Cards */}
        {prescription.type === "AEROBIC" && aerobicData && (
          <AerobicCards data={aerobicData} />
        )}

        {/* Signature Area */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              {prescription.client.name}
            </Text>
            <Text style={styles.signatureLabel}>Cliente</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{professionalName}</Text>
            <Text style={styles.signatureLabel}>Profissional</Text>
          </View>
        </View>

        {/* Footer (fixed on every page) */}
        <PdfFooter />
      </Page>
    </Document>
  );
}
