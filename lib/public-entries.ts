import type { DiaryEntry } from "@/types/diary"

// Global public entries storage
const PUBLIC_ENTRIES_KEY = "public-diary-entries"

export interface PublicEntry extends DiaryEntry {
  verified: boolean
}

export class PublicEntriesService {
  // Get all public entries from localStorage (simulating Swarm network)
  static getPublicEntries(): PublicEntry[] {
    try {
      const entries = localStorage.getItem(PUBLIC_ENTRIES_KEY)
      if (entries) {
        const parsed = JSON.parse(entries)
        return parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
      }
      return []
    } catch {
      return []
    }
  }

  // Add entry to public feed
  static addPublicEntry(entry: DiaryEntry): void {
    try {
      const currentEntries = this.getPublicEntries()
      const publicEntry: PublicEntry = {
        ...entry,
        verified: true,
      }

      // Add to beginning of array (newest first)
      const updatedEntries = [publicEntry, ...currentEntries]

      // Keep only last 100 entries to prevent storage bloat
      const limitedEntries = updatedEntries.slice(0, 100)

      localStorage.setItem(PUBLIC_ENTRIES_KEY, JSON.stringify(limitedEntries))
    } catch (error) {
      console.error("Error adding public entry:", error)
    }
  }

  // Simulate loading from Swarm network
  static async loadFromSwarm(): Promise<PublicEntry[]> {
    // In a real implementation, this would fetch from Swarm
    // For now, we'll return local entries with some delay to simulate network
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return this.getPublicEntries()
  }
}
