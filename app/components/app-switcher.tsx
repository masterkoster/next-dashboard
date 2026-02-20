"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { APP_MODULES, AppModule } from "@/lib/modules";
import { cn } from "@/lib/utils";

interface AppSwitcherProps {
  isProPlus?: boolean;
}

export function AppSwitcher({ isProPlus }: AppSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const filteredModules = APP_MODULES.map((module) => annotateModule(module, isProPlus));

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 text-muted-foreground transition hover:text-foreground"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open app switcher"
      >
        <GridIcon className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Switch applications</p>
              <p className="text-xs text-muted-foreground">AviationHub suite</p>
            </div>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">BETA</span>
          </div>
          <div className="grid grid-cols-2 gap-2 px-3 pb-3">
            {filteredModules.map(({ module, disabled }) => (
              <ModuleTile key={module.id} module={module} disabled={disabled} onSelect={() => setOpen(false)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function annotateModule(module: AppModule, isProPlus?: boolean) {
  const disabled = module.requiresProPlus && !isProPlus;
  return { module, disabled };
}

interface ModuleTileProps {
  module: AppModule;
  disabled?: boolean;
  onSelect: () => void;
}

function ModuleTile({ module, disabled, onSelect }: ModuleTileProps) {
  const content = (
    <div
      className={cn(
        "group flex h-full flex-col gap-1 rounded-xl border border-border/60 bg-card/80 p-3 transition hover:border-primary/50 hover:bg-card",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-base">{module.icon}</span>
        {module.badge && (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">{module.badge}</span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-sm font-semibold text-foreground">{module.name}</p>
        <p className="text-xs text-muted-foreground leading-snug">{module.description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[10px] font-medium text-muted-foreground transition group-hover:text-primary">
        Open
        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </div>
  );

  if (disabled) {
    return <div>{content}</div>;
  }

  return (
    <Link href={module.href} onClick={onSelect} className="h-full">
      {content}
    </Link>
  );
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1.5" />
      <rect x="15" y="3" width="6" height="6" rx="1.5" />
      <rect x="3" y="15" width="6" height="6" rx="1.5" />
      <rect x="15" y="15" width="6" height="6" rx="1.5" />
    </svg>
  );
}
