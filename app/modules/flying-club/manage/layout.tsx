'use client'

import { ReactNode, Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import PageContainer from '@/components/modules/PageContainer'
import ManageSidebar from '@/components/club/ManageSidebar'
import { ManageContextProvider, ManageGroup } from '@/components/club/ManageContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FetchState = 'idle' | 'loading' | 'ready'

const DEMO_GROUPS: ManageGroup[] = [
  {
    id: 'demo-1',
    name: 'Sky High Flying Club',
    description: 'Demo club for previewing operations features.',
  },
  {
    id: 'demo-2',
    name: 'Weekend Warriors',
    description: 'Sample weekend-only fleet.',
  },
]

export default function ManageLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}> 
      <ManageLayoutInner>{children}</ManageLayoutInner>
    </Suspense>
  )
}

function ManageLayoutInner({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [groups, setGroups] = useState<ManageGroup[]>([])
  const [status, setStatus] = useState<FetchState>('idle')
  const [isDemo, setIsDemo] = useState(false)

  const queryGroup = searchParams.get('group')
  const [selectedGroupId, setSelectedGroupIdState] = useState<string | null>(queryGroup)

  useEffect(() => {
    setStatus('loading')
    let cancelled = false

    async function loadGroups() {
      try {
        const response = await fetch('/api/groups')
        if (!response.ok) {
          throw new Error('Unable to load groups')
        }
        const data = await response.json()
        if (cancelled) return
        const normalized: ManageGroup[] = (Array.isArray(data) ? data : []).map((group: any) => ({
          id: group.id,
          name: group.name,
          description: group.description ?? null,
          role: group.role ?? group.userRole ?? undefined,
        }))
        if (normalized.length === 0) {
          throw new Error('No groups found')
        }
        setGroups(normalized)
        setIsDemo(false)
      } catch (error) {
        if (cancelled) return
        setGroups(DEMO_GROUPS)
        setIsDemo(true)
      } finally {
        if (!cancelled) {
          setStatus('ready')
        }
      }
    }

    loadGroups()
    return () => {
      cancelled = true
    }
  }, [])

  // Ensure selected group stays in sync with URL/search params
  const selectedGroupIdStateful = useMemo(() => {
    if (!selectedGroupId) return null
    const exists = groups.some((group) => group.id === selectedGroupId)
    return exists ? selectedGroupId : null
  }, [selectedGroupId, groups])

  useEffect(() => {
    setSelectedGroupIdState(queryGroup)
  }, [queryGroup])

  useEffect(() => {
    if (status !== 'ready') return
    if (!selectedGroupIdStateful && groups.length > 0) {
      handleGroupChange(groups[0].id)
    }
  }, [status, groups, selectedGroupIdStateful])

  const handleGroupChange = (groupId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (groupId) {
      params.set('group', groupId)
    } else {
      params.delete('group')
    }
    setSelectedGroupIdState(groupId)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const contextValue = useMemo(() => ({
    groups,
    selectedGroupId: selectedGroupIdStateful,
    setSelectedGroupId: handleGroupChange,
    isDemo,
  }), [groups, selectedGroupIdStateful, isDemo])

  const layoutReady = status === 'ready'

  return (
    <ManageContextProvider value={contextValue}>
      <PageContainer fluid className="space-y-6">
        <header className="space-y-4 rounded-xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Manage Club Operations</h1>
              <p className="text-sm text-muted-foreground">Dispatch, member management, billing, and integrations all in one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/modules/flying-club">Back to dashboard</Link>
              </Button>
              <Button size="sm" variant="secondary" onClick={() => alert('Group creation coming soon')}>
                Create group
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground" htmlFor="manage-group-select">
              Active club
            </label>
            <select
              id="manage-group-select"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={selectedGroupIdStateful ?? ''}
              onChange={(event) => handleGroupChange(event.target.value || null)}
              disabled={!layoutReady}
            >
              {!layoutReady && <option value="">Loading…</option>}
              {layoutReady && groups.length === 0 && <option value="">No clubs available</option>}
              {layoutReady && groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            {isDemo && (
              <span className="text-xs font-medium uppercase text-amber-600">Demo data</span>
            )}
          </div>
        </header>

        <div className={cn('flex flex-col gap-6 lg:flex-row', 'lg:items-start')}>
          <ManageSidebar />
          <div className="flex-1 space-y-6">
            {children}
          </div>
        </div>
      </PageContainer>
    </ManageContextProvider>
  )
}

function LoadingFallback() {
  return (
    <PageContainer fluid className="space-y-6">
      <div className="rounded-xl border border-border bg-card/80 p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Loading club management tools…</p>
      </div>
    </PageContainer>
  )
}
