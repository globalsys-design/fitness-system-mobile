import { MobileHeader } from "./mobile-header";
import { InteractiveMenu } from "./interactive-menu";

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  /**
   * Pass true on list/feed screens so the header hides on scroll-down.
   * Keep false (default) on forms and detail screens.
   */
  hideHeaderOnScroll?: boolean;
}

export function MobileLayout({
  children,
  title,
  showBack,
  actions,
  hideHeaderOnScroll = false,
}: MobileLayoutProps) {
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
      <InteractiveMenu />
    </div>
  );
}
