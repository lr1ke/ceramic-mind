import { CeramicClient } from "@ceramicnetwork/http-client"
import { DID } from "dids"
import { Ed25519Provider } from "key-did-provider-ed25519"
import { getResolver } from "key-did-resolver"
import { fromString } from "uint8arrays/from-string"
import type { DiaryEntry } from "@/types/diary"

// Ceramic configuration
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

export class SimpleCeramicService {
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
      console.log("Simple Ceramic initialized with DID:", this.did.id)
    } catch (error) {
      console.error("Failed to initialize Simple Ceramic:", error)
      throw error
    }
  }

  private getOrCreateSeed(): Uint8Array {
    const savedSeed = localStorage.getItem("ceramic-simple-seed")
    if (savedSeed) {
      return fromString(savedSeed, "base64")
    }

    // Generate new seed
    const seed = new Uint8Array(32)
    crypto.getRandomValues(seed)
    localStorage.setItem("ceramic-simple-seed", Buffer.from(seed).toString("base64"))
    return seed
  }

  async createEntry(entry: Omit<CeramicEntry, "ceramicId">): Promise<CeramicEntry> {
    await this.initialize()

    try {
      // For now, we'll store entries as simple documents
      // In a full implementation, you'd use a proper schema
      const doc = await this.ceramic.createDocument("tile", {
        content: entry.content,
        mood: entry.mood,
        location: entry.location || null,
        timestamp: entry.timestamp.toISOString(),
        anonymous: entry.anonymous,
        verified: entry.verified,
        type: "diary-entry",
      })

      return {
        ...entry,
        ceramicId: doc.id.toString(),
        id: doc.id.toString(),
      }
    } catch (error) {
      console.error("Error creating entry on Simple Ceramic:", error)
      throw error
    }
  }

  async getMyEntries(): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      // This is a simplified version - in production you'd use proper indexing
      console.log("Loading entries from Ceramic...")

      // For now, return empty array as we need proper indexing for queries
      // In a real implementation, you'd use ComposeDB or ceramic-idx
      return []
    } catch (error) {
      console.error("Error fetching my entries from Simple Ceramic:", error)
      return []
    }
  }

  async getAllPublicEntries(limit = 50): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      // This would require proper indexing in a real implementation
      return []
    } catch (error) {
      console.error("Error fetching public entries from Simple Ceramic:", error)
      return []
    }
  }

  async getEntriesByMood(mood: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()
    return []
  }

  async searchEntries(searchTerm: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()
    return []
  }

  async getLocationMoodAnalysis(): Promise<LocationMoodData[]> {
    await this.initialize()
    return []
  }

  async getEntriesByLocation(location: string): Promise<CeramicEntry[]> {
    await this.initialize()
    return []
  }

  getDID(): string | null {
    return this.did?.id || null
  }
}

// Global Simple Ceramic instance
let simpleCeramicInstance: SimpleCeramicService | null = null

export async function getCeramicService(): Promise<SimpleCeramicService> {
  if (!simpleCeramicInstance) {
    simpleCeramicInstance = new SimpleCeramicService()
    await simpleCeramicInstance.initialize()
  }
  return simpleCeramicInstance
}
