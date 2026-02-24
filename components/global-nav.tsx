"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Plane, Search, Bell, ChevronDown, LogOut, MessageCircle, Settings, User, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppSwitcher } from "@/app/components/app-switcher";
import { APP_MODULES } from "@/lib/modules";
import { useAuthModal } from "@/app/components/AuthModalContext";

export function GlobalNav() {
  const { data: session } = useSession();
  const { openLoginModal } = useAuthModal();
  const pathname = usePathname();

  const userTier = session?.user?.tier;
  const userRole = session?.user?.role;
  const isProPlus = userTier === 'proplus' || userRole === 'admin' || userRole === 'owner';

  // Don't show on home page
  const isHomePage = pathname === '/';
  if (isHomePage) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Plane className="h-5 w-5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AviationHub</span>
              <span className="text-base font-semibold text-foreground">Pilot Platform</span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {APP_MODULES.slice(0, 3).map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith(module.href)
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {module.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground md:flex"
          >
            <Search className="h-4 w-4" />
            Search
            <span className="text-xs text-muted-foreground/70">Ctrl + K</span>
          </Link>

          <button
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 text-muted-foreground transition hover:text-foreground sm:flex"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          <Link
            href="/messages"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/80 text-muted-foreground transition hover:text-foreground sm:flex"
            aria-label="Messages"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>

          <AppSwitcher isProPlus={isProPlus} />

          {session ? (
            <ProfileMenu />
          ) : (
            <Button size="sm" className="ml-1" onClick={() => openLoginModal()}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function ProfileMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AV';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/25 text-sm font-semibold text-primary">
          {initials}
        </span>
        <span className="hidden flex-col text-left text-xs text-muted-foreground sm:flex">
          <span className="text-sm font-medium text-foreground">{session?.user?.name || 'Pilot'}</span>
          <span>{session?.user?.email}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur">
          <div className="border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{session?.user?.name || 'Pilot'}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
          <div className="flex flex-col gap-1 px-2 py-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <Link
              href="/support"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <HelpCircle className="h-4 w-4" />
              Support
            </Link>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="m-2 inline-flex w-[calc(100%-1rem)] items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-destructive transition hover:bg-secondary/80"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
