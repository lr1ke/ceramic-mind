"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getCeramicService, type CeramicEntry } from "@/lib/ceramic-v2"

interface PublicEntriesContextType {
  entries: CeramicEntry[]
  isLoading: boolean
  refreshEntries: () => Promise<void>
  getEntriesByMood: (mood: string) => Promise<CeramicEntry[]>
  searchEntries: (searchTerm: string) => Promise<CeramicEntry[]>
}

const PublicEntriesContext = createContext<PublicEntriesContextType | undefined>(undefined)

export function PublicEntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CeramicEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPublicEntries()
  }, [])

  const loadPublicEntries = async () => {
    setIsLoading(true)
    try {
      const ceramic = await getCeramicService()
      const publicEntries = await ceramic.getAllPublicEntries(50)
      setEntries(publicEntries || [])
    } catch (error) {
      console.error("Error loading public entries:", error)
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  const refreshEntries = async () => {
    await loadPublicEntries()
  }

  const getEntriesByMood = async (mood: string): Promise<CeramicEntry[]> => {
    try {
      const ceramic = await getCeramicService()
      return (await ceramic.getEntriesByMood(mood)) || []
    } catch (error) {
      console.error("Error getting entries by mood:", error)
      return []
    }
  }

  const searchEntries = async (searchTerm: string): Promise<CeramicEntry[]> => {
    try {
      const ceramic = await getCeramicService()
      return (await ceramic.searchEntries(searchTerm)) || []
    } catch (error) {
      console.error("Error searching entries:", error)
      return []
    }
  }

  return (
    <PublicEntriesContext.Provider
      value={{
        entries,
        isLoading,
        refreshEntries,
        getEntriesByMood,
        searchEntries,
      }}
    >
      {children}
    </PublicEntriesContext.Provider>
  )
}

export function usePublicEntries() {
  const context = useContext(PublicEntriesContext)
  if (context === undefined) {
    throw new Error("usePublicEntries must be used within a PublicEntriesProvider")
  }
  return context
}
