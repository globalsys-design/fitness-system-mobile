import React from "react";
import { View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import { pdfColors, pdfFonts, pdfSpacing } from "./theme";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: pdfColors.headerBg,
    paddingHorizontal: pdfSpacing["2xl"],
    paddingVertical: pdfSpacing.lg,
    borderRadius: 6,
    marginBottom: pdfSpacing.xl,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: pdfSpacing.lg,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: pdfFonts["2xl"],
    fontFamily: "Helvetica-Bold",
    color: pdfColors.headerText,
  },
  brandName: {
    fontSize: pdfFonts.xl,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.headerText,
  },
  brandSub: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica",
    color: "rgba(255,255,255,0.75)",
    marginTop: 1,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  clientName: {
    fontSize: pdfFonts.md,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.headerText,
  },
  meta: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica",
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
});

interface PdfHeaderProps {
  professionalName: string;
  clientName: string;
  date: string;
  type: string;
}

export function PdfHeader({
  professionalName,
  clientName,
  date,
  type,
}: PdfHeaderProps) {
  return (
    <View style={styles.header}>
      {/* Left — Brand */}
      <View style={styles.leftSection}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>F</Text>
        </View>
        <View>
          <Text style={styles.brandName}>Fitness System</Text>
          <Text style={styles.brandSub}>
            Prescrição de {type === "TRAINING" ? "Treino" : "Aeróbico"}
          </Text>
        </View>
      </View>

      {/* Right — Client + Professional */}
      <View style={styles.rightSection}>
        <Text style={styles.clientName}>{clientName}</Text>
        <Text style={styles.meta}>Prof. {professionalName}</Text>
        <Text style={styles.meta}>{date}</Text>
      </View>
    </View>
  );
}
