import { Suspense } from "react";
import { RecuperarSenhaEnviadoContent } from "@/components/auth/recovery-sent-content";

export default function RecuperarSenhaEnviadoPage() {
  return (
    <Suspense fallback={null}>
      <RecuperarSenhaEnviadoContent />
    </Suspense>
  );
}
