'use client'

import { useEffect, useMemo, useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, UserPlus } from 'lucide-react'

import { useManageContext } from './ManageContext'

type ClubRole = 'member' | 'admin' | 'instructor'

interface ClubUser {
  id: string
  name: string
  email: string
  phone: string
  homeAirport: string
  balance: number
  role: ClubRole
  lastFlight?: string
}

const DEMO_USERS: ClubUser[] = [
  {
    id: 'demo-1',
    name: 'David Koster',
    email: 'david@amicurrent.com',
    phone: '(425) 555-0184',
    homeAirport: 'KPAE',
    balance: 0,
    role: 'admin',
    lastFlight: 'Feb 19, 2026',
  },
  {
    id: 'demo-2',
    name: 'Sarah Johnson',
    email: 'sarah@club.com',
    phone: '(206) 555-0107',
    homeAirport: 'KRNT',
    balance: 142.75,
    role: 'member',
    lastFlight: 'Feb 11, 2026',
  },
  {
    id: 'demo-3',
    name: 'Mike Wilson',
    email: 'mike@club.com',
    phone: '(425) 555-0163',
    homeAirport: 'KBLI',
    balance: -25,
    role: 'instructor',
    lastFlight: 'Feb 05, 2026',
  },
  {
    id: 'demo-4',
    name: 'Alex Chen',
    email: 'alex@club.com',
    phone: '(509) 555-0119',
    homeAirport: 'KGEG',
    balance: 87.5,
    role: 'member',
    lastFlight: 'Jan 28, 2026',
  },
]

interface ManageUsersSectionProps {
  roleFilter?: ClubRole
  title: string
  description: string
}

type FetchState = 'idle' | 'loading' | 'ready'

const generateId = () => {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `user-${Math.random().toString(36).slice(2)}`
}

export default function ManageUsersSection({ roleFilter, title, description }: ManageUsersSectionProps) {
  const { selectedGroupId, groups, isDemo } = useManageContext()
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<ClubUser[] | null>(null)
  const [state, setState] = useState<FetchState>('idle')

  const activeGroup = useMemo(() => groups.find((group) => group.id === selectedGroupId) ?? null, [groups, selectedGroupId])

  useEffect(() => {
    if (!selectedGroupId) {
      setUsers(null)
      return
    }

    if (isDemo) {
      setUsers(DEMO_USERS)
      setState('ready')
      return
    }

    let cancelled = false
    setState('loading')

    async function loadUsers() {
      try {
        const response = await fetch(`/api/groups/${selectedGroupId}/members`)
        if (!response.ok) {
          throw new Error('Unable to load members')
        }
        const data = await response.json()
        if (cancelled) return

        const mapped: ClubUser[] = (Array.isArray(data) ? data : []).map((member: any) => ({
          id: member.id ?? member.userId ?? generateId(),
          name: member.user?.name ?? member.name ?? 'Member',
          email: member.user?.email ?? member.email ?? 'unknown@example.com',
          phone: member.user?.phone ?? member.phone ?? '—',
          homeAirport: member.homeAirport ?? member.base ?? '—',
          balance: typeof member.balance === 'number' ? member.balance : 0,
          role: member.role === 'ADMIN' ? 'admin' : member.role === 'CFI' ? 'instructor' : 'member',
          lastFlight: member.lastFlightAt ? new Date(member.lastFlightAt).toLocaleDateString() : undefined,
        }))

        setUsers(mapped.length ? mapped : DEMO_USERS)
      } catch (error) {
        if (!cancelled) {
          setUsers(DEMO_USERS)
        }
      } finally {
        if (!cancelled) {
          setState('ready')
        }
      }
    }

    loadUsers()
    return () => {
      cancelled = true
    }
  }, [selectedGroupId, isDemo])

  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users.filter((user) => {
      const matchesRole = roleFilter ? user.role === roleFilter : true
      const matchesQuery = query
        ? `${user.name} ${user.email} ${user.phone}`.toLowerCase().includes(query.toLowerCase())
        : true
      return matchesRole && matchesQuery
    })
  }, [users, roleFilter, query])

  const totalBalance = filteredUsers.reduce((sum, user) => sum + user.balance, 0)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {activeGroup && (
          <p className="text-xs text-muted-foreground">
            Active club: <span className="font-medium text-foreground">{activeGroup.name}</span>
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roster</CardTitle>
          <CardDescription>Invite new members or review balances before running billing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                disabled={!users || state === 'loading'}
              />
            </div>
            <Button size="sm" onClick={() => alert('Invite flow coming soon')}>
              <UserPlus className="mr-2 h-4 w-4" />
              New User
            </Button>
          </div>

          {users && users.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-lg border">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Departure</th>
                      <th className="px-4 py-3 font-medium text-right">Balance</th>
                      <th className="px-4 py-3 font-medium text-right">Last Flight</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.map((user) => {
                      const balanceLabel = user.balance === 0 ? '$0.00' : `$${user.balance.toFixed(2)}`
                      const badgeVariant = user.balance > 0 ? 'default' : user.balance < 0 ? 'secondary' : 'outline'

                      return (
                        <tr key={user.id}>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{user.phone}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{user.homeAirport}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant={badgeVariant}>{balanceLabel}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">{user.lastFlight ?? '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="outline" size="sm" onClick={() => alert('User detail view coming soon')}>
                              View
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span>
                    Total accounts: <span className="font-semibold text-foreground">{filteredUsers.length}</span>
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>
                    Outstanding balance: <span className="font-semibold text-foreground">${totalBalance.toFixed(2)}</span>
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Use the Billing section to email detailed statements.</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              {state === 'loading' ? 'Loading members…' : 'Select a club above to view members'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
