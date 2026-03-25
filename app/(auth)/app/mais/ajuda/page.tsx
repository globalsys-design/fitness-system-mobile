import { MobileLayout } from "@/components/mobile/mobile-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "Como cadastrar um novo cliente?",
    answer: "Vá em Usuários > Clientes > toque no botão '+' no canto inferior direito. Siga o processo de 4 etapas para cadastrar todos os dados.",
  },
  {
    question: "Como criar uma avaliação?",
    answer: "Vá em Avaliações > toque em 'Nova avaliação'. Selecione o cliente, população e modalidade. O sistema irá guiá-lo por todas as etapas.",
  },
  {
    question: "Como exportar um relatório PDF?",
    answer: "Na tela de detalhe de uma avaliação, toque no menu de ações e selecione 'Gerar PDF'. Selecione as seções desejadas e confirme. Este recurso requer plano PRO ou Trial.",
  },
  {
    question: "Como comparar avaliações?",
    answer: "Na listagem de avaliações, selecione até 3 avaliações do mesmo cliente usando o menu de ações e escolha 'Comparar'. Este recurso requer plano PRO ou Trial.",
  },
  {
    question: "Meu trial vai acabar, como faço upgrade?",
    answer: "Vá em Mais > Plano e Faturamento, e toque em 'Fazer upgrade'. Você será redirecionado para o checkout seguro do Stripe.",
  },
  {
    question: "Como alterar minha senha?",
    answer: "Vá em Mais > Segurança > Alterar senha. Informe sua senha atual e a nova senha.",
  },
];

export default function AjudaPage() {
  return (
    <MobileLayout title="Ajuda" showBack>
      <div className="p-4 flex flex-col gap-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <HelpCircle className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="font-semibold text-foreground text-sm">Central de Ajuda</p>
            <p className="text-xs text-muted-foreground">Encontre respostas para suas dúvidas</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Perguntas frequentes</h3>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, index) => (
              <details key={index} className="border border-border rounded-xl px-4 group">
                <summary className="text-sm font-medium text-foreground text-left py-4 cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <span className="text-muted-foreground ml-2">+</span>
                </summary>
                <p className="text-sm text-muted-foreground pb-4">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm font-semibold text-foreground">Precisa de mais ajuda?</p>
          <p className="text-xs text-muted-foreground">
            Entre em contato com nosso suporte por email.
          </p>
          <Button variant="outline" className="h-11 w-full">
            <Mail className="w-4 h-4 mr-2" />
            Enviar email para suporte
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
