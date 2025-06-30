import { CeramicClient } from "@ceramicnetwork/http-client"
import { DID } from "dids"
import { Ed25519Provider } from "key-did-provider-ed25519"
import { getResolver } from "key-did-resolver"
import type { DiaryEntry } from "@/types/diary"

// Ceramic configuration
const CERAMIC_URL = "https://ceramic-clay.3boxlabs.com"

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

export class CeramicService {
  private ceramic: CeramicClient
  private did: DID | null = null
  private initialized = false

  constructor() {
    this.ceramic = new CeramicClient(CERAMIC_URL)
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Generate or retrieve DID
      const seed = this.getOrCreateSeed()
      const provider = new Ed25519Provider(seed)

      this.did = new DID({ provider, resolver: getResolver() })
      await this.did.authenticate()

      // Set DID on Ceramic client
      this.ceramic.did = this.did

      this.initialized = true
      console.log("Ceramic initialized with DID:", this.did.id)
    } catch (error) {
      console.error("Failed to initialize Ceramic:", error)
      throw error
    }
  }

  private getOrCreateSeed(): Uint8Array {
    const savedSeed = localStorage.getItem("ceramic-seed")
    if (savedSeed) {
      return new Uint8Array(JSON.parse(savedSeed))
    }

    // Generate new seed
    const seed = new Uint8Array(32)
    crypto.getRandomValues(seed)
    localStorage.setItem("ceramic-seed", JSON.stringify(Array.from(seed)))
    return seed
  }

  async createEntry(entry: Omit<CeramicEntry, "ceramicId">): Promise<CeramicEntry> {
    await this.initialize()

    try {
      // For now, create a local entry with Ceramic-style ID
      // In a full implementation, you would create a TileDocument
      const ceramicId = `ceramic_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      const ceramicEntry: CeramicEntry = {
        ...entry,
        ceramicId,
        id: ceramicId,
      }

      // Store locally for quick access
      this.storeEntryLocally(ceramicEntry)
      
      console.log("Entry created with Ceramic-style ID:", ceramicId)
      console.log("Using DID:", this.did?.id)

      return ceramicEntry
    } catch (error) {
      console.error("Error creating entry on Ceramic:", error)
      
      // Fallback to local storage
      const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const fallbackEntry: CeramicEntry = {
        ...entry,
        ceramicId: fallbackId,
        id: fallbackId,
      }
      this.storeEntryLocally(fallbackEntry)
      return fallbackEntry
    }
  }

  private storeEntryLocally(entry: CeramicEntry): void {
    try {
      const entries = this.getLocalEntries()
      entries.unshift(entry)
      localStorage.setItem("ceramic-entries", JSON.stringify(entries))
    } catch (error) {
      console.error("Error storing entry locally:", error)
    }
  }

  private getLocalEntries(): CeramicEntry[] {
    try {
      const saved = localStorage.getItem("ceramic-entries")
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

  async getMyEntries(): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      // For now, return locally stored entries
      // In a full implementation, you would query Ceramic for documents owned by this DID
      return this.getLocalEntries()
    } catch (error) {
      console.error("Error fetching my entries from Ceramic:", error)
      return []
    }
  }

  async getAllPublicEntries(limit = 50): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      // For now, return sample entries mixed with local entries
      const localEntries = this.getLocalEntries()
      const sampleEntries = this.getSampleEntries()
      
      const combined = [...localEntries, ...sampleEntries]
      return combined.slice(0, limit)
    } catch (error) {
      console.error("Error fetching public entries from Ceramic:", error)
      return []
    }
  }

  async getEntriesByMood(mood: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const allEntries = await this.getAllPublicEntries(100)
      const filtered = allEntries.filter((entry) => entry.mood === mood)
      return filtered.slice(0, limit)
    } catch (error) {
      console.error("Error fetching entries by mood from Ceramic:", error)
      return []
    }
  }

  async searchEntries(searchTerm: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const allEntries = await this.getAllPublicEntries(100)
      const filtered = allEntries.filter((entry) => 
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
      return filtered.slice(0, limit)
    } catch (error) {
      console.error("Error searching entries on Ceramic:", error)
      return []
    }
  }

  async getLocationMoodAnalysis(): Promise<LocationMoodData[]> {
    await this.initialize()

    try {
      const entries = await this.getMyEntries()
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
      const entries = await this.getMyEntries()
      return entries.filter((entry) => entry.location === location)
    } catch (error) {
      console.error("Error fetching entries by location:", error)
      return []
    }
  }

  private getSampleEntries(): CeramicEntry[] {
    return [
      {
        id: "sample-1",
        ceramicId: "sample-1",
        content: "Welcome to the decentralized diary! This entry is stored on the Ceramic Network.",
        mood: "happy",
        location: "San Francisco, CA",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        anonymous: true,
        verified: true,
      },
      {
        id: "sample-2",
        ceramicId: "sample-2",
        content: "The Ceramic protocol provides a great foundation for decentralized applications with user-owned data.",
        mood: "peaceful",
        location: "New York, NY",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        anonymous: true,
        verified: true,
      },
    ]
  }

  getDID(): string | null {
    return this.did?.id || null
  }
}

// Global Ceramic instance
let ceramicInstance: CeramicService | null = null

export async function getCeramicService(): Promise<CeramicService> {
  if (!ceramicInstance) {
    ceramicInstance = new CeramicService()
    await ceramicInstance.initialize()
  }
  return ceramicInstance
}
