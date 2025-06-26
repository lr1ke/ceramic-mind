interface SwarmConfig {
  gatewayUrl: string
  beeApiUrl: string
}

const SWARM_CONFIG: SwarmConfig = {
  gatewayUrl: "https://gateway.ethswarm.org",
  beeApiUrl: "https://bee-0.gateway.ethswarm.org",
}

export interface SwarmReference {
  hash: string
  url: string
}

// Encryption utilities for privacy
async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  )
}

async function encryptData(data: string, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoder.encode(data),
  )

  return { encrypted, iv }
}

async function decryptData(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedData,
  )

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

// Swarm storage class
export class SwarmStorage {
  private config: SwarmConfig
  private encryptionKey: CryptoKey | null = null

  constructor(config?: Partial<SwarmConfig>) {
    this.config = { ...SWARM_CONFIG, ...config }
  }

  async initialize(): Promise<void> {
    // Generate or retrieve encryption key
    const savedKey = localStorage.getItem("swarm-encryption-key")
    if (savedKey) {
      const keyData = JSON.parse(savedKey)
      this.encryptionKey = await crypto.subtle.importKey(
        "jwk",
        keyData,
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"],
      )
    } else {
      this.encryptionKey = await generateKey()
      const exportedKey = await crypto.subtle.exportKey("jwk", this.encryptionKey)
      localStorage.setItem("swarm-encryption-key", JSON.stringify(exportedKey))
    }
  }

  async uploadData(data: any): Promise<SwarmReference> {
    if (!this.encryptionKey) {
      throw new Error("Swarm storage not initialized")
    }

    try {
      const jsonData = JSON.stringify(data)
      const { encrypted, iv } = await encryptData(jsonData, this.encryptionKey)

      // Combine IV and encrypted data
      const combinedData = new Uint8Array(iv.length + encrypted.byteLength)
      combinedData.set(iv)
      combinedData.set(new Uint8Array(encrypted), iv.length)

      // Upload to Swarm
      const response = await fetch(`${this.config.beeApiUrl}/bytes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: combinedData,
      })

      if (!response.ok) {
        throw new Error(`Swarm upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      const hash = result.reference

      return {
        hash,
        url: `${this.config.gatewayUrl}/bytes/${hash}`,
      }
    } catch (error) {
      console.error("Swarm upload error:", error)
      throw error
    }
  }

  async downloadData(reference: SwarmReference): Promise<any> {
    if (!this.encryptionKey) {
      throw new Error("Swarm storage not initialized")
    }

    try {
      const response = await fetch(`${this.config.gatewayUrl}/bytes/${reference.hash}`)

      if (!response.ok) {
        throw new Error(`Swarm download failed: ${response.statusText}`)
      }

      const combinedData = new Uint8Array(await response.arrayBuffer())

      // Extract IV and encrypted data
      const iv = combinedData.slice(0, 12)
      const encrypted = combinedData.slice(12)

      // Decrypt data
      const decryptedJson = await decryptData(encrypted.buffer, this.encryptionKey, iv)
      return JSON.parse(decryptedJson)
    } catch (error) {
      console.error("Swarm download error:", error)
      throw error
    }
  }

  async uploadEntries(entries: any[]): Promise<SwarmReference> {
    return await this.uploadData({
      entries,
      timestamp: Date.now(),
      version: "1.0",
    })
  }

  async downloadEntries(reference: SwarmReference): Promise<any[]> {
    const data = await this.downloadData(reference)
    return data.entries || []
  }
}

// Global Swarm instance
let swarmInstance: SwarmStorage | null = null

export async function getSwarmStorage(): Promise<SwarmStorage> {
  if (!swarmInstance) {
    swarmInstance = new SwarmStorage()
    await swarmInstance.initialize()
  }
  return swarmInstance
}
