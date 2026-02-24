'use client'

import { createContext, useContext } from 'react'

export interface ManageGroup {
  id: string
  name: string
  description?: string | null
  role?: string
}

export interface ManageContextValue {
  groups: ManageGroup[]
  selectedGroupId: string | null
  setSelectedGroupId: (groupId: string | null) => void
  isDemo: boolean
}

const ManageContext = createContext<ManageContextValue | undefined>(undefined)

export function ManageContextProvider({ value, children }: { value: ManageContextValue; children: React.ReactNode }) {
  return <ManageContext.Provider value={value}>{children}</ManageContext.Provider>
}

export function useManageContext() {
  const context = useContext(ManageContext)
  if (!context) {
    throw new Error('useManageContext must be used within ManageContextProvider')
  }
  return context
}
