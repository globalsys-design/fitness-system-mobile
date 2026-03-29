# shadcn/ui — Component Library Skill

Capacita o uso correto da biblioteca shadcn/ui v4 no projeto.

## REGRAS CRÍTICAS (shadcn v4)
1. **SEM `asChild`**: A prop `asChild` NÃO existe no shadcn v4. Use composição:
   ```tsx
   // ERRADO: <Button asChild><Link>Click</Link></Button>
   // CERTO:  <Link><Button>Click</Button></Link>
   ```

2. **Imports**: Sempre de `@/components/ui/{component}`
3. **Não editar**: Nunca modifique arquivos em `components/ui/` diretamente
4. **Adicionar novos**: `npx shadcn@latest add {component} -y`

## COMPONENTES DISPONÍVEIS
```
avatar, badge, button, card, dialog, dropdown-menu,
input, label, select, separator, sheet, sidebar,
switch, table, tabs, textarea, tooltip, sonner
```

## PADRÕES DE USO

### Formulários
```tsx
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input id="field" placeholder="Placeholder" className="bg-card border-border" />
</div>
```

### Selects
```tsx
<Select value={value} onValueChange={(v) => setValue(v ?? "")}>
  <SelectTrigger className="bg-card border-border">
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Opção 1</SelectItem>
  </SelectContent>
</Select>
```

### Feedback
- **Toast**: `toast.success("Mensagem")` via Sonner (NÃO shadcn toast)
- **Loading**: `disabled={isPending}` + texto "Salvando..."
- **Badges**: `<Badge className="bg-primary/20 text-primary">Status</Badge>`

### Modais vs Painel
- **Dialog**: Ações rápidas (confirmar, deletar)
- **Sheet**: Formulários laterais em mobile
- **Painel inline**: Formulários complexos (wizards multi-step)

## ESTILIZAÇÃO
- Classes Tailwind no `className` — nunca CSS inline
- Dark mode: tokens semânticos ajustam automaticamente
- Hover/Focus: `hover:bg-muted/50`, `focus-visible:ring-2`
- Disabled: `disabled:opacity-50 disabled:pointer-events-none`

## ÍCONES
- Biblioteca: `lucide-react`
- Tamanhos: `h-4 w-4` (inline), `h-5 w-5` (botões), `h-12 w-12` (empty states)
- Cor: `text-muted-foreground` (padrão), `text-primary` (destaque)
