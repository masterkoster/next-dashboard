'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck } from 'lucide-react'

type Template = {
  id: string
  authority: string
  name: string
  code: string
  category?: string | null
  text: string
}

export default function EndorsementsPage() {
  const { data: session, status } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [studentId, setStudentId] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/endorsements/templates')
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
  }, [status])

  const handleSign = async () => {
    if (!selected || !studentId) return
    await fetch('/api/endorsements/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: selected,
        studentId,
        type: 'typed',
        typedName: session?.user?.name || session?.user?.email || 'Instructor',
        certNumber: 'TBD',
        notes,
      }),
    })
  }

  if (status === 'loading') return <div className="min-h-screen bg-background p-6">Loading…</div>
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Endorsements</h1>
            <p className="text-muted-foreground mb-6">Sign in to manage endorsements.</p>
            <Button onClick={() => signIn()}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6" /> Endorsements</h1>
          <p className="text-sm text-muted-foreground">FAA + EASA endorsement library and signing workflow.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Select an endorsement template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((tpl) => (
                <button key={tpl.id} onClick={() => setSelected(tpl.id)} className={`w-full rounded-md border p-3 text-left ${selected === tpl.id ? 'border-primary' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{tpl.name}</span>
                    <Badge variant="secondary">{tpl.authority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{tpl.code}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sign Endorsement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Student User ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
              <Textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Button onClick={handleSign} disabled={!selected || !studentId}>Sign Endorsement</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
