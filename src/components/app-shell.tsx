"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Database,
  Download,
  FlaskConical,
  Menu,
  Settings2,
  SplitSquareVertical,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Übersicht", icon: FlaskConical },
  { href: "/datensatz", label: "Datensatz", icon: Database },
  { href: "/vergleich", label: "Vergleich", icon: SplitSquareVertical },
  { href: "/auswertung", label: "Auswertung", icon: BarChart3 },
  { href: "/export", label: "Export / LoRA", icon: Download },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-full bg-[oklch(0.97_0.01_210)]">
      <div className="mx-auto flex min-h-full max-w-[1400px]">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-[oklch(0.22_0.03_210)] text-[oklch(0.96_0.01_200)] md:flex md:flex-col">
          <div className="px-5 py-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[oklch(0.78_0.05_175)]">
              Masterarbeit
            </p>
            <h1 className="mt-1 font-heading text-xl font-semibold tracking-tight">
              DatasheetBench
            </h1>
            <p className="mt-2 text-sm leading-5 text-white/70">
              GPT-5 gegen ein lokal angelerntes Modell, mit eurem Materialschema.
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-3 pb-6">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-white/12 text-white"
                      : "text-white/70 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border bg-white/80 px-4 py-3 backdrop-blur md:hidden">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                DatasheetBench
              </p>
              <p className="text-sm font-medium">Vergleichswerkbank</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setOpen((value) => !value)}>
              <Menu className="size-4" />
            </Button>
          </header>
          {open ? (
            <nav className="grid gap-1 border-b bg-white p-3 md:hidden">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ) : null}
          <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
