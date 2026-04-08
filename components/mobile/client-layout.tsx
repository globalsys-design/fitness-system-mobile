import { MobileHeader } from "./mobile-header";
import { ClientNav } from "./client-nav";

interface ClientLayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  hideHeaderOnScroll?: boolean;
}

export function ClientLayout({
  children,
  title,
  showBack,
  actions,
  hideHeaderOnScroll = false,
}: ClientLayoutProps) {
  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      <MobileHeader
        title={title}
        showBack={showBack}
        actions={actions}
        hideOnScroll={hideHeaderOnScroll}
      />
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        {children}
      </main>
      <ClientNav />
    </div>
  );
}
