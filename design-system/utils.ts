export function tokenKeyToCssVar(key: string): string {
  const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
  return `--${kebab}`;
}

export function sidebarKeyToCssVar(key: string): string {
  const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
  return `--sidebar-${kebab}`;
}
