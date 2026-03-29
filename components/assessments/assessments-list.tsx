"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardX, FileText, GitCompare, Trash2, MoreVertical, Plus } from "lucide-react";
import { ListHeader, ListEmptyState } from "@/components/lists/list-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FAB } from "@/components/mobile/fab";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Assessment {
  id: string;
  population: string;
  modality: string | null;
  status: string;
  createdAt: Date;
  client: { id: string; name: string; photo: string | null; gender: string | null };
  assistant: { name: string } | null;
}

interface AssessmentsListProps {
  assessments: Assessment[];
}

export function AssessmentsList({ assessments }: AssessmentsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  const filtered = assessments.filter(
    (a) =>
      a.client.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.modality ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const populationLabels: Record<string, string> = {
    NORMAL: "Normal",
    ATHLETE: "Atleta",
    ELDERLY: "Idoso",
    CHILD: "Criança",
    PREGNANT: "Gestante",
  };

  return (
    <div className="flex flex-col">
      <ListHeader
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar avaliações..."
      />

      {filtered.length === 0 ? (
        <ListEmptyState
          icon={<ClipboardX className="w-8 h-8 text-muted-foreground" />}
          message={search ? "Nenhuma avaliação encontrada" : "Nenhuma avaliação ainda"}
          isFiltered={!!search}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((assessment) => (
            <div
              key={assessment.id}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
            >
              <Link href={`/app/avaliacoes/${assessment.id}`} className="flex-1 flex items-start gap-3">
                <Avatar className="w-11 h-11 flex-shrink-0">
                  <AvatarImage src={assessment.client.photo ?? undefined} />
                  <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                    {assessment.client.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {assessment.client.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {populationLabels[assessment.population] ?? assessment.population}
                    {assessment.modality && ` · ${assessment.modality}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(assessment.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </Link>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant="outline"
                  className={assessment.status === "COMPLETE" ? "border-green-200 text-green-700" : ""}
                >
                  {assessment.status === "COMPLETE" ? "Completa" : "Rascunho"}
                </Badge>
                <button
                  onClick={() => {
                    setSelectedAssessment(assessment);
                    setActionsOpen(true);
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions Bottom Sheet */}
      <BottomSheet
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        title={selectedAssessment?.client.name ?? "Ações"}
      >
        <div className="flex flex-col gap-2">
          <Link href={selectedAssessment ? `/app/avaliacoes/${selectedAssessment.id}` : "#"}>
            <Button variant="outline" className="h-12 w-full justify-start" onClick={() => setActionsOpen(false)}>
              <FileText className="w-4 h-4 mr-3" />
              Ver avaliação completa
            </Button>
          </Link>
          <Button variant="outline" className="h-12 w-full justify-start" onClick={() => setActionsOpen(false)}>
            <FileText className="w-4 h-4 mr-3" />
            Gerar relatório PDF
          </Button>
          <Button variant="outline" className="h-12 w-full justify-start" onClick={() => setActionsOpen(false)}>
            <GitCompare className="w-4 h-4 mr-3" />
            Comparar avaliações
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full justify-start text-destructive hover:bg-destructive/5"
            onClick={() => setActionsOpen(false)}
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Excluir avaliação
          </Button>
        </div>
      </BottomSheet>

      {/* FAB — mesmo padrão de Usuários */}
      <FAB
        icon={Plus}
        onClick={() => router.push("/app/avaliacoes/nova")}
        label="Nova Avaliação"
      />
    </div>
  );
}
