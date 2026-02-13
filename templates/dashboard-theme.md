# Dashboard Theme Template

Use this as a reference for the slate + emerald dashboard styling applied across modules.

## Core palette & typography
- Background: slate-950 gradient to slate-900
- Cards: slate-900/70 with slate-800 borders, soft shadows
- Accent: emerald-500 for pills, hover borders; text accent emerald-100/200
- Text: slate-50 primary, slate-300 secondary, slate-400 meta labels
- Font: Geist (sans) with tight tracking on labels

## Shell snippet (server component)
```tsx
export function DashboardShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Module</p>
          <h1 className="text-3xl font-semibold text-slate-50">{title}</h1>
          {description ? <p className="max-w-3xl text-sm text-slate-300">{description}</p> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
```

## Card pattern
```tsx
<div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/30">
  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Label</p>
  <h3 className="mt-1 text-xl font-semibold text-slate-50">Title</h3>
  <p className="mt-2 text-sm text-slate-300">Support copy.</p>
</div>
```

## Pill / status
```tsx
<span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">Explore</span>
```

Keep this template unchanged as a reference point when creating new modules.
