import type { DiaryEntry } from "@/types/diary"

// Simple Ceramic configuration
const CERAMIC_URL = process.env.NEXT_PUBLIC_CERAMIC_URL || "https://ceramic-clay.3boxlabs.com"

export interface CeramicEntry extends DiaryEntry {
  ceramicId?: string
  verified: boolean
  location?: string
}

export interface LocationMoodData {
  location: string
  moods: {
    [mood: string]: number
  }
  totalEntries: number
  dominantMood: string
  averageEntriesPerVisit: number
}

// For now, we'll use a hybrid approach - local storage with Ceramic-like structure
// This allows the app to work while we resolve the Ceramic setup issues
export class WorkingCeramicService {
  private initialized = false
  private userDID: string | null = null

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Generate a simple DID-like identifier
      this.userDID = this.getOrCreateDID()
      this.initialized = true

      console.log("Working Ceramic service initialized")
      console.log("User DID:", this.userDID)

      // Test connection to Ceramic in background
      this.testCeramicConnection()
    } catch (error) {
      console.error("Failed to initialize Working Ceramic:", error)
      throw error
    }
  }

  private getOrCreateDID(): string {
    const savedDID = localStorage.getItem("ceramic-working-did")
    if (savedDID) {
      return savedDID
    }

    // Generate a simple DID-like identifier
    const did = `did:key:working${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem("ceramic-working-did", did)
    return did
  }

  private async testCeramicConnection() {
    try {
      const response = await fetch(`${CERAMIC_URL}/api/v0/node/healthcheck`)
      if (response.ok) {
        console.log("✅ Ceramic node is accessible at:", CERAMIC_URL)
      } else {
        console.log("⚠️ Ceramic node returned status:", response.status)
      }
    } catch (error) {
      console.log("ℹ️ Ceramic node not accessible, using local storage fallback")
    }
  }

  async createEntry(entry: Omit<CeramicEntry, "ceramicId">): Promise<CeramicEntry> {
    await this.initialize()

    try {
      const ceramicId = `ceramic_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      const ceramicEntry: CeramicEntry = {
        ...entry,
        ceramicId,
        id: ceramicId,
      }

      // Store locally for now
      const myEntries = this.getMyEntriesFromStorage()
      myEntries.unshift(ceramicEntry)
      localStorage.setItem("ceramic-working-entries", JSON.stringify(myEntries))

      // Also add to public feed
      const publicEntries = this.getPublicEntriesFromStorage()
      publicEntries.unshift(ceramicEntry)
      localStorage.setItem("ceramic-working-public", JSON.stringify(publicEntries))

      // In the background, try to sync to Ceramic
      this.syncToCeramicInBackground(ceramicEntry)

      return ceramicEntry
    } catch (error) {
      console.error("Error creating entry:", error)
      throw error
    }
  }

  private async syncToCeramicInBackground(entry: CeramicEntry) {
    try {
      // This would be where we sync to actual Ceramic
      // For now, just log that we would sync
      console.log("📡 Would sync to Ceramic:", entry.ceramicId)
    } catch (error) {
      console.log("⚠️ Background sync failed:", error)
    }
  }

  async getMyEntries(): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      return this.getMyEntriesFromStorage()
    } catch (error) {
      console.error("Error fetching my entries:", error)
      return []
    }
  }

  async getAllPublicEntries(limit = 50): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const entries = this.getPublicEntriesFromStorage()
      return entries.slice(0, limit)
    } catch (error) {
      console.error("Error fetching public entries:", error)
      return []
    }
  }

  async getEntriesByMood(mood: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const entries = this.getPublicEntriesFromStorage()
      const filtered = entries.filter((entry) => entry.mood === mood)
      return filtered.slice(0, limit)
    } catch (error) {
      console.error("Error fetching entries by mood:", error)
      return []
    }
  }

  async searchEntries(searchTerm: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const entries = this.getPublicEntriesFromStorage()
      const filtered = entries.filter((entry) => entry.content.toLowerCase().includes(searchTerm.toLowerCase()))
      return filtered.slice(0, limit)
    } catch (error) {
      console.error("Error searching entries:", error)
      return []
    }
  }

  async getLocationMoodAnalysis(): Promise<LocationMoodData[]> {
    await this.initialize()

    try {
      const entries = this.getMyEntriesFromStorage()
      const locationMap = new Map<string, CeramicEntry[]>()

      // Group entries by location
      entries.forEach((entry) => {
        const location = entry.location || "Unknown Location"
        if (!locationMap.has(location)) {
          locationMap.set(location, [])
        }
        locationMap.get(location)!.push(entry)
      })

      // Analyze mood patterns for each location
      const locationMoodData: LocationMoodData[] = []

      locationMap.forEach((locationEntries, location) => {
        const moodCounts: { [mood: string]: number } = {}

        locationEntries.forEach((entry) => {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
        })

        // Find dominant mood
        const dominantMood = Object.entries(moodCounts).reduce((a, b) =>
          moodCounts[a[0]] > moodCounts[b[0]] ? a : b,
        )[0]

        locationMoodData.push({
          location,
          moods: moodCounts,
          totalEntries: locationEntries.length,
          dominantMood,
          averageEntriesPerVisit: Math.round((locationEntries.length / 1) * 10) / 10,
        })
      })

      // Sort by total entries (most visited first)
      return locationMoodData.sort((a, b) => b.totalEntries - a.totalEntries)
    } catch (error) {
      console.error("Error analyzing location-mood patterns:", error)
      return []
    }
  }

  async getEntriesByLocation(location: string): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const entries = this.getMyEntriesFromStorage()
      return entries.filter((entry) => entry.location === location)
    } catch (error) {
      console.error("Error fetching entries by location:", error)
      return []
    }
  }

  private getMyEntriesFromStorage(): CeramicEntry[] {
    try {
      const saved = localStorage.getItem("ceramic-working-entries")
      if (saved) {
        const parsed = JSON.parse(saved)
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

  private getPublicEntriesFromStorage(): CeramicEntry[] {
    try {
      const saved = localStorage.getItem("ceramic-working-public")
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }))
      }

      // Return sample entries if none exist
      return this.getSampleEntries()
    } catch {
      return this.getSampleEntries()
    }
  }

  private getSampleEntries(): CeramicEntry[] {
    return [
      {
        id: "sample-1",
        ceramicId: "sample-1",
        content: "Welcome to the Ceramic-powered diary! This app is ready to connect to the decentralized network.",
        mood: "happy",
        location: "San Francisco, CA",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        anonymous: true,
        verified: true,
      },
      {
        id: "sample-2",
        ceramicId: "sample-2",
        content:
          "The app works locally while we establish the full Ceramic connection. Your data will sync when ready!",
        mood: "peaceful",
        location: "New York, NY",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        anonymous: true,
        verified: true,
      },
    ]
  }

  getDID(): string | null {
    return this.userDID
  }
}

// Global Working Ceramic instance
let workingCeramicInstance: WorkingCeramicService | null = null

export async function getCeramicService(): Promise<WorkingCeramicService> {
  if (!workingCeramicInstance) {
    workingCeramicInstance = new WorkingCeramicService()
    await workingCeramicInstance.initialize()
  }
  return workingCeramicInstance
}
