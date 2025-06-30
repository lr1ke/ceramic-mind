"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { DiaryEntry } from "@/types/diary"
import { getCeramicService, type CeramicEntry } from "@/lib/ceramic-v2"

interface SyncStatus {
  status: "idle" | "syncing" | "success" | "error"
  message?: string
  lastSync?: Date
}

interface StorageContextType {
  entries: CeramicEntry[]
  isLoading: boolean
  syncStatus: SyncStatus
  addEntry: (entry: DiaryEntry) => Promise<void>
  refreshEntries: () => Promise<void>
  clearLocalData: () => void
  retryFailedSync: () => Promise<void>
}

const StorageContext = createContext<StorageContextType | undefined>(undefined)

export function StorageProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CeramicEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: "idle" })

  useEffect(() => {
    loadEntriesFromCeramic()
  }, [])

  const loadEntriesFromCeramic = async () => {
    setIsLoading(true)
    setSyncStatus({ status: "syncing", message: "Connecting to Ceramic Network..." })

    try {
      const ceramic = await getCeramicService()
      const ceramicEntries = await ceramic.getMyEntries()

      setEntries(ceramicEntries || [])
      setSyncStatus({
        status: "success",
        lastSync: new Date(),
        message: "Connected to Ceramic Network",
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSyncStatus((prev) => ({
          ...prev,
          message: undefined,
        }))
      }, 3000)
    } catch (error) {
      console.error("Error loading entries from Ceramic:", error)
      setSyncStatus({
        status: "error",
        message: "Using local storage (Ceramic connection pending)",
      })

      // Set empty array on error
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  const addEntry = async (entry: DiaryEntry) => {
    setSyncStatus({ status: "syncing", message: "Saving entry..." })

    try {
      const ceramic = await getCeramicService()

      const ceramicEntry: Omit<CeramicEntry, "ceramicId"> = {
        ...entry,
        verified: true,
      }

      const savedEntry = await ceramic.createEntry(ceramicEntry)

      // Add to local state
      setEntries((prev) => [savedEntry, ...(prev || [])])

      setSyncStatus({
        status: "success",
        lastSync: new Date(),
        message: "Entry saved successfully",
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSyncStatus((prev) => ({
          ...prev,
          message: undefined,
        }))
      }, 3000)
    } catch (error) {
      console.error("Error saving entry:", error)
      setSyncStatus({
        status: "error",
        message: "Failed to save entry",
      })
      throw error
    }
  }

  const refreshEntries = async () => {
    await loadEntriesFromCeramic()
  }

  const clearLocalData = () => {
    localStorage.removeItem("ceramic-working-entries")
    localStorage.removeItem("ceramic-working-public")
    localStorage.removeItem("ceramic-working-did")
    setEntries([])
    setSyncStatus({ status: "idle" })
  }

  const retryFailedSync = async () => {
    if (syncStatus.status === "error") {
      await refreshEntries()
    }
  }

  return (
    <StorageContext.Provider
      value={{
        entries,
        isLoading,
        syncStatus,
        addEntry,
        refreshEntries,
        clearLocalData,
        retryFailedSync,
      }}
    >
      {children}
    </StorageContext.Provider>
  )
}

export function useStorage() {
  const context = useContext(StorageContext)
  if (context === undefined) {
    throw new Error("useStorage must be used within a StorageProvider")
  }
  return context
}
