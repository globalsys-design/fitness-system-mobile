import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "icon" | "horizontal" | "vertical";

const LOGO_SOURCES: Record<LogoVariant, { light: string; dark: string }> = {
  icon: {
    light: "/logos/icon-light.svg",
    dark: "/logos/icon-dark.svg",
  },
  horizontal: {
    light: "/logos/horizontal-light.svg",
    dark: "/logos/horizontal-dark.svg",
  },
  vertical: {
    light: "/logos/vertical-light.svg",
    dark: "/logos/vertical-dark.svg",
  },
};

interface BrandLogoProps {
  /** Variante da logo. Default: "horizontal" */
  variant?: LogoVariant;
  /** White-label: URL da logo customizada do profissional */
  customLogoUrl?: string;
  /** priority={true} para otimização LCP na tela de Login */
  priority?: boolean;
  /** Classes aplicadas ao container (defina w-XX h-XX aqui) */
  className?: string;
}

export function BrandLogo({
  variant = "horizontal",
  customLogoUrl,
  priority = false,
  className,
}: BrandLogoProps) {
  if (customLogoUrl) {
    return (
      <div className={cn("relative", className)}>
        <Image
          src={customLogoUrl}
          alt="Logo"
          fill
          sizes="(max-width: 768px) 200px, 300px"
          priority={priority}
          className="object-contain"
        />
      </div>
    );
  }

  const { light, dark } = LOGO_SOURCES[variant];

  return (
    <div className={cn("relative", className)}>
      {/* Light mode — visible only in light theme */}
      <Image
        src={light}
        alt="Fitness System Logo"
        fill
        sizes="(max-width: 768px) 200px, 300px"
        priority={priority}
        className="object-contain dark:hidden"
      />
      {/* Dark mode — visible only in dark theme */}
      <Image
        src={dark}
        alt="Fitness System Logo"
        fill
        sizes="(max-width: 768px) 200px, 300px"
        priority={priority}
        className="object-contain hidden dark:block"
      />
    </div>
  );
}
