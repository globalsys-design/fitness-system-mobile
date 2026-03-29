import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { pdfColors, pdfFonts, pdfSpacing } from "./theme";

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 20,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: pdfSpacing.md,
    borderTopWidth: 0.5,
    borderTopColor: pdfColors.border,
  },
  leftSection: {
    flexDirection: "column",
    gap: 2,
  },
  qrPlaceholder: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: pdfColors.border,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: pdfSpacing.sm,
  },
  qrText: {
    fontSize: 5,
    fontFamily: "Helvetica",
    color: pdfColors.mutedForeground,
    textAlign: "center",
  },
  qrLabel: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica",
    color: pdfColors.mutedForeground,
  },
  centerSection: {
    alignItems: "center",
  },
  disclaimer: {
    fontSize: 6,
    fontFamily: "Helvetica-Oblique",
    color: pdfColors.mutedForeground,
    textAlign: "center",
    maxWidth: 280,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  pageNumber: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica",
    color: pdfColors.mutedForeground,
  },
  brand: {
    fontSize: pdfFonts.xs,
    fontFamily: "Helvetica-Bold",
    color: pdfColors.primary,
    marginTop: 2,
  },
});

export function PdfFooter() {
  return (
    <View style={styles.footer} fixed>
      {/* Left — QR Code placeholder */}
      <View style={styles.leftSection}>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>QR{"\n"}CODE</Text>
        </View>
        <Text style={styles.qrLabel}>Acesse no app</Text>
      </View>

      {/* Center — Disclaimer */}
      <View style={styles.centerSection}>
        <Text style={styles.disclaimer}>
          Este documento foi gerado automaticamente pelo Fitness System.
          A prescrição deve ser seguida sob orientação do profissional responsável.
        </Text>
      </View>

      {/* Right — Page number + Brand */}
      <View style={styles.rightSection}>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
        />
        <Text style={styles.brand}>fitnesssystem.app</Text>
      </View>
    </View>
  );
}
