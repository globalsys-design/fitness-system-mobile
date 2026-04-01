import { MobileHeader } from "./mobile-header";
import { InteractiveMenu } from "./interactive-menu";

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export function MobileLayout({ children, title, showBack, actions }: MobileLayoutProps) {
  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      <MobileHeader title={title} showBack={showBack} actions={actions} />
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>
      <InteractiveMenu />
    </div>
  );
}
