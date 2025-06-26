import type { DiaryEntry } from "@/types/diary"

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

// Mock data storage keys
const MOCK_ENTRIES_KEY = "mock-ceramic-entries"
const MOCK_PUBLIC_ENTRIES_KEY = "mock-ceramic-public-entries"
const MOCK_DID_KEY = "mock-ceramic-did"

export class MockCeramicService {
  private did: string | null = null
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate or retrieve mock DID
      this.did = this.getOrCreateDID()
      this.initialized = true

      console.log("Mock Ceramic initialized with DID:", this.did)
    } catch (error) {
      console.error("Failed to initialize Mock Ceramic:", error)
      throw error
    }
  }

  private getOrCreateDID(): string {
    const savedDID = localStorage.getItem(MOCK_DID_KEY)
    if (savedDID) {
      return savedDID
    }

    // Generate mock DID
    const did = `did:key:mock${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem(MOCK_DID_KEY, did)
    return did
  }

  async createEntry(entry: Omit<CeramicEntry, "ceramicId">): Promise<CeramicEntry> {
    await this.initialize()

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const ceramicId = `ceramic_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      const ceramicEntry: CeramicEntry = {
        ...entry,
        ceramicId,
        id: ceramicId,
      }

      // Save to user's entries
      const myEntries = this.getMyEntriesFromStorage()
      myEntries.unshift(ceramicEntry)
      localStorage.setItem(MOCK_ENTRIES_KEY, JSON.stringify(myEntries))

      // Add to public feed (anonymous)
      const publicEntries = this.getPublicEntriesFromStorage()
      publicEntries.unshift(ceramicEntry)
      localStorage.setItem(MOCK_PUBLIC_ENTRIES_KEY, JSON.stringify(publicEntries))

      return ceramicEntry
    } catch (error) {
      console.error("Error creating entry on Mock Ceramic:", error)
      throw error
    }
  }

  async getMyEntries(): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      return this.getMyEntriesFromStorage()
    } catch (error) {
      console.error("Error fetching my entries from Mock Ceramic:", error)
      return []
    }
  }

  async getAllPublicEntries(limit = 50): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const entries = this.getPublicEntriesFromStorage()
      return entries.slice(0, limit)
    } catch (error) {
      console.error("Error fetching public entries from Mock Ceramic:", error)
      return []
    }
  }

  async getEntriesByMood(mood: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const entries = this.getPublicEntriesFromStorage()
      const filtered = entries.filter((entry) => entry.mood === mood)
      return filtered.slice(0, limit)
    } catch (error) {
      console.error("Error fetching entries by mood from Mock Ceramic:", error)
      return []
    }
  }

  async searchEntries(searchTerm: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const entries = this.getPublicEntriesFromStorage()
      const filtered = entries.filter((entry) => entry.content.toLowerCase().includes(searchTerm.toLowerCase()))
      return filtered.slice(0, limit)
    } catch (error) {
      console.error("Error searching entries on Mock Ceramic:", error)
      return []
    }
  }

  async getLocationMoodAnalysis(): Promise<LocationMoodData[]> {
    await this.initialize()

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

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
          averageEntriesPerVisit: Math.round((locationEntries.length / 1) * 10) / 10, // Simplified calculation
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
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      const entries = this.getMyEntriesFromStorage()
      return entries.filter((entry) => entry.location === location)
    } catch (error) {
      console.error("Error fetching entries by location:", error)
      return []
    }
  }

  private getMyEntriesFromStorage(): CeramicEntry[] {
    try {
      const saved = localStorage.getItem(MOCK_ENTRIES_KEY)
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
      const saved = localStorage.getItem(MOCK_PUBLIC_ENTRIES_KEY)
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
        content: "Welcome to the anonymous diary! This is a sample entry to show how the Ceramic database works.",
        mood: "happy",
        location: "San Francisco, CA",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        anonymous: true,
        verified: true,
      },
      {
        id: "sample-2",
        ceramicId: "sample-2",
        content:
          "The decentralized database allows for real-time search and filtering across all entries while maintaining privacy.",
        mood: "peaceful",
        location: "New York, NY",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        anonymous: true,
        verified: true,
      },
      {
        id: "sample-3",
        ceramicId: "sample-3",
        content: "Sometimes I feel overwhelmed by all the possibilities that technology brings to our lives.",
        mood: "anxious",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        anonymous: true,
        verified: true,
      },
    ]
  }

  getDID(): string | null {
    return this.did
  }
}

// Global Mock Ceramic instance
let mockCeramicInstance: MockCeramicService | null = null

export async function getCeramicService(): Promise<MockCeramicService> {
  if (!mockCeramicInstance) {
    mockCeramicInstance = new MockCeramicService()
    await mockCeramicInstance.initialize()
  }
  return mockCeramicInstance
}
