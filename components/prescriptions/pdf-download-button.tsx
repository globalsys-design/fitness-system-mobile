"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Check } from "lucide-react";
import dynamic from "next/dynamic";

/**
 * Tipagem do prescription para o botão
 */
interface PrescriptionForPdf {
  id: string;
  type: string;
  content: any;
  createdAt: Date | string;
  client: { name: string };
  trainingSheet?: { exercises: any } | null;
}

interface PDFDownloadButtonProps {
  prescription: PrescriptionForPdf;
  professionalName: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
}

/**
 * PDFDownloadButton
 *
 * Client Component que gera o PDF no lado do cliente usando
 * @react-pdf/renderer. Usa dynamic import para evitar bundle
 * do react-pdf no SSR (ele só funciona no browser).
 *
 * Estados:
 * - idle:       Botão normal "Baixar PDF"
 * - generating: Spinner + "Gerando..."
 * - done:       Checkmark + "Pronto!" (por 2s)
 * - error:      Mensagem de erro
 */
export function PDFDownloadButton({
  prescription,
  professionalName,
  variant = "outline",
  size = "sm",
  className = "",
}: PDFDownloadButtonProps) {
  const [status, setStatus] = useState<
    "idle" | "generating" | "done" | "error"
  >("idle");

  const handleDownload = useCallback(async () => {
    setStatus("generating");

    try {
      // Dynamic import para evitar SSR — @react-pdf/renderer
      // só funciona no browser
      const { pdf } = await import("@react-pdf/renderer");
      const { PrescriptionPDF } = await import(
        "./pdf/prescription-pdf"
      );

      // Gera o blob do PDF no client
      const blob = await pdf(
        <PrescriptionPDF
          prescription={prescription}
          professionalName={professionalName}
        />
      ).toBlob();

      // Cria URL temporária e dispara download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const clientName = prescription.client.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
      const type = prescription.type === "TRAINING" ? "treino" : "aerobico";
      link.href = url;
      link.download = `prescricao-${type}-${clientName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, [prescription, professionalName]);

  const isDisabled = status === "generating";

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`gap-1.5 ${className}`}
      onClick={handleDownload}
      disabled={isDisabled}
    >
      {status === "idle" && (
        <>
          <FileDown className="w-3.5 h-3.5" />
          <span className="text-xs">PDF</span>
        </>
      )}
      {status === "generating" && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">Gerando...</span>
        </>
      )}
      {status === "done" && (
        <>
          <Check className="w-3.5 h-3.5" />
          <span className="text-xs">Pronto!</span>
        </>
      )}
      {status === "error" && (
        <>
          <FileDown className="w-3.5 h-3.5" />
          <span className="text-xs">Erro</span>
        </>
      )}
    </Button>
  );
}
