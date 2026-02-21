"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Plane, Menu, X, User, MessageSquare, Settings, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Modules", href: "#modules" },
  { label: "Pricing", href: "#pricing" },
  { label: "Privacy", href: "#privacy" },
  { label: "Marketplace", href: "/modules/marketplace" },
]

export function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-2xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            AviationHub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {/* Always show Dashboard button with dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Dashboard
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-800 border border-slate-700 shadow-lg overflow-hidden z-50">
                {isLoggedIn ? (
                  <>
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-700">
                      <div className="font-medium text-white">{session.user?.name || 'User'}</div>
                      <div className="text-xs text-slate-400">{session.user?.email}</div>
                    </div>
                    
                    {/* Menu items for logged in */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Plane className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/modules/social/messages"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                        onClick={() => setShowDropdown(false)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Messages
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <div className="border-t border-slate-700 mt-1 pt-1">
                        <button
                          onClick={() => { signOut(); setShowDropdown(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Menu items for logged out - redirect to login */
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Plane className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/modules/social/messages"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="border-t border-slate-700 mt-1 pt-1">
                      <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-emerald-400 hover:bg-slate-700"
                        onClick={() => setShowDropdown(false)}
                      >
                        <LogOut className="h-4 w-4" />
                        Log in
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Show login/signup buttons only when NOT logged in */}
          {!isLoggedIn && (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/api/auth/signin">Log in</Link>
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/signup">Start Free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            
            {/* Mobile Dashboard Links */}
            <div className="mt-3 border-t border-border pt-3">
              <div className="text-xs text-slate-500 px-3 mb-2">Dashboard</div>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Plane className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/modules/social/messages"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {isLoggedIn ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-start text-red-400" 
                  onClick={() => { signOut(); setOpen(false); }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="justify-start text-muted-foreground" asChild>
                    <Link href="/api/auth/signin" onClick={() => setOpen(false)}>Log in</Link>
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground" asChild>
                    <Link href="/signup" onClick={() => setOpen(false)}>Start Free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
