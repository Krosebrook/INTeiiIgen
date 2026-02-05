import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Check } from "lucide-react";

export type DashboardTheme = 'minimal' | 'glass' | 'dark' | 'corporate' | 'colorful';

interface DashboardThemeSelectorProps {
  theme: DashboardTheme;
  onThemeChange: (theme: DashboardTheme) => void;
}

const themes: { id: DashboardTheme; name: string; description: string; preview: string }[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, simple design with subtle borders',
    preview: 'bg-white border border-slate-200',
  },
  {
    id: 'glass',
    name: 'Glass',
    description: 'Frosted glass effect with blur',
    preview: 'bg-white/30 backdrop-blur border border-white/20',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark mode optimized widgets',
    preview: 'bg-slate-900 border border-slate-700',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional with accent top border',
    preview: 'bg-white border-t-4 border-t-blue-500 shadow-md',
  },
  {
    id: 'colorful',
    name: 'Colorful',
    description: 'Vibrant gradients and bold colors',
    preview: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-200',
  },
];

export function DashboardThemeSelector({ theme, onThemeChange }: DashboardThemeSelectorProps) {
  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-theme-selector">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">{currentTheme.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => onThemeChange(t.id)}
            className="flex items-start gap-3 p-3 cursor-pointer"
            data-testid={`menu-item-theme-${t.id}`}
          >
            <div className={`w-8 h-8 rounded-md flex-shrink-0 ${t.preview}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{t.name}</span>
                {theme === t.id && <Check className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">{t.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getThemeClasses(theme: DashboardTheme): string {
  const baseClasses = 'transition-all duration-200';
  switch (theme) {
    case 'glass':
      return `${baseClasses} bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl rounded-xl`;
    case 'dark':
      return `${baseClasses} !bg-slate-900 !border-slate-700 shadow-2xl rounded-xl [&_*]:!text-slate-100 [&_.text-muted-foreground]:!text-slate-400`;
    case 'corporate':
      return `${baseClasses} bg-card border-t-4 border-t-primary border-x border-b border-border shadow-md rounded-lg`;
    case 'colorful':
      return `${baseClasses} bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/30 shadow-xl rounded-2xl`;
    case 'minimal':
    default:
      return `${baseClasses} bg-card border border-border shadow-sm rounded-xl`;
  }
}
