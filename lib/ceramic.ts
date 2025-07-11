import { CeramicClient } from "@ceramicnetwork/http-client"
import { ComposeClient } from "@composedb/client"
import { DID } from "dids"
import { Ed25519Provider } from "key-did-provider-ed25519"
import { getResolver } from "key-did-resolver"
import type { DiaryEntry } from "@/types/diary"

// Ceramic configuration
const CERAMIC_URL = "https://ceramic-clay.3boxlabs.com"

// ComposeDB schema for diary entries
const COMPOSE_SCHEMA = {
  models: {
    DiaryEntry: {
      id: "kjzl6hvfrbw6c99mdfpjx1z3fue7sesgua6gsl1zzxbeskcvlh5erfztjxe7b6a",
      accountRelation: { type: "list" },
    },
  },
  objects: {
    DiaryEntry: {
      content: { type: "string", required: true },
      mood: { type: "string", required: true },
      timestamp: { type: "datetime", required: true },
      anonymous: { type: "boolean", required: true },
      verified: { type: "boolean", required: true },
    },
  },
}

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
  private compose: ComposeClient
  private did: DID | null = null
  private initialized = false

  constructor() {
    this.ceramic = new CeramicClient(CERAMIC_URL)
    this.compose = new ComposeClient({
      ceramic: CERAMIC_URL,
      definition: COMPOSE_SCHEMA,
    })
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Generate or retrieve DID
      const seed = this.getOrCreateSeed()
      const provider = new Ed25519Provider(seed)

      this.did = new DID({ provider, resolver: getResolver() })
      await this.did.authenticate()

      // Set DID on Ceramic and Compose clients
      this.ceramic.did = this.did
      this.compose.setDID(this.did)

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
      const mutation = `
        mutation CreateDiaryEntry($input: CreateDiaryEntryInput!) {
          createDiaryEntry(input: $input) {
            document {
              id
              content
              mood
              timestamp
              anonymous
              verified
            }
          }
        }
      `

      const variables = {
        input: {
          content: {
            content: entry.content,
            mood: entry.mood,
            timestamp: entry.timestamp.toISOString(),
            anonymous: entry.anonymous,
            verified: entry.verified,
          },
        },
      }

      const response = await this.compose.executeQuery(mutation, variables)

      if (response.errors) {
        throw new Error(`Ceramic mutation failed: ${response.errors[0].message}`)
      }

      const createdEntry = response.data.createDiaryEntry.document
      return {
        ...entry,
        ceramicId: createdEntry.id,
        timestamp: new Date(createdEntry.timestamp),
      }
    } catch (error) {
      console.error("Error creating entry on Ceramic:", error)
      throw error
    }
  }

  async getMyEntries(): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const query = `
        query GetMyDiaryEntries {
          viewer {
            diaryEntryList(first: 100) {
              edges {
                node {
                  id
                  content
                  mood
                  timestamp
                  anonymous
                  verified
                }
              }
            }
          }
        }
      `

      const response = await this.compose.executeQuery(query)

      if (response.errors) {
        throw new Error(`Ceramic query failed: ${response.errors[0].message}`)
      }

      const entries = response.data?.viewer?.diaryEntryList?.edges || []
      return entries.map((edge: any) => ({
        id: edge.node.id,
        ceramicId: edge.node.id,
        content: edge.node.content,
        mood: edge.node.mood,
        timestamp: new Date(edge.node.timestamp),
        anonymous: edge.node.anonymous,
        verified: edge.node.verified,
      }))
    } catch (error) {
      console.error("Error fetching my entries from Ceramic:", error)
      return []
    }
  }

  async getAllPublicEntries(limit = 50): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const query = `
        query GetAllDiaryEntries($first: Int!) {
          diaryEntryIndex(first: $first, sorting: { timestamp: DESC }) {
            edges {
              node {
                id
                content
                mood
                timestamp
                anonymous
                verified
              }
            }
          }
        }
      `

      const variables = { first: limit }
      const response = await this.compose.executeQuery(query, variables)

      if (response.errors) {
        throw new Error(`Ceramic query failed: ${response.errors[0].message}`)
      }

      const entries = response.data?.diaryEntryIndex?.edges || []
      return entries.map((edge: any) => ({
        id: edge.node.id,
        ceramicId: edge.node.id,
        content: edge.node.content,
        mood: edge.node.mood,
        timestamp: new Date(edge.node.timestamp),
        anonymous: edge.node.anonymous,
        verified: edge.node.verified,
      }))
    } catch (error) {
      console.error("Error fetching public entries from Ceramic:", error)
      return []
    }
  }

  async getEntriesByMood(mood: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const query = `
        query GetEntriesByMood($mood: String!, $first: Int!) {
          diaryEntryIndex(
            first: $first, 
            sorting: { timestamp: DESC },
            filters: { where: { mood: { equalTo: $mood } } }
          ) {
            edges {
              node {
                id
                content
                mood
                timestamp
                anonymous
                verified
              }
            }
          }
        }
      `

      const variables = { mood, first: limit }
      const response = await this.compose.executeQuery(query, variables)

      if (response.errors) {
        throw new Error(`Ceramic query failed: ${response.errors[0].message}`)
      }

      const entries = response.data?.diaryEntryIndex?.edges || []
      return entries.map((edge: any) => ({
        id: edge.node.id,
        ceramicId: edge.node.id,
        content: edge.node.content,
        mood: edge.node.mood,
        timestamp: new Date(edge.node.timestamp),
        anonymous: edge.node.anonymous,
        verified: edge.node.verified,
      }))
    } catch (error) {
      console.error("Error fetching entries by mood from Ceramic:", error)
      return []
    }
  }

  async searchEntries(searchTerm: string, limit = 20): Promise<CeramicEntry[]> {
    await this.initialize()

    try {
      const query = `
        query SearchDiaryEntries($searchTerm: String!, $first: Int!) {
          diaryEntryIndex(
            first: $first, 
            sorting: { timestamp: DESC },
            filters: { where: { content: { contains: $searchTerm } } }
          ) {
            edges {
              node {
                id
                content
                mood
                timestamp
                anonymous
                verified
              }
            }
          }
        }
      `

      const variables = { searchTerm, first: limit }
      const response = await this.compose.executeQuery(query, variables)

      if (response.errors) {
        throw new Error(`Ceramic query failed: ${response.errors[0].message}`)
      }

      const entries = response.data?.diaryEntryIndex?.edges || []
      return entries.map((edge: any) => ({
        id: edge.node.id,
        ceramicId: edge.node.id,
        content: edge.node.content,
        mood: edge.node.mood,
        timestamp: new Date(edge.node.timestamp),
        anonymous: edge.node.anonymous,
        verified: edge.node.verified,
      }))
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
      const entries = await this.getMyEntries()
      return entries.filter((entry) => entry.location === location)
    } catch (error) {
      console.error("Error fetching entries by location:", error)
      return []
    }
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
