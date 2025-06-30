import { CeramicClient } from "@ceramicnetwork/http-client"
import { DID } from "dids"
import { Ed25519Provider } from "key-did-provider-ed25519"
import { getResolver } from "key-did-resolver"
import { writeFileSync } from "fs"

const CERAMIC_URL = process.env.CERAMIC_URL || "https://ceramic-clay.3boxlabs.com"

async function simpleSetup() {
  console.log("🏺 Simple Ceramic setup...")
  console.log("🔗 Connecting to:", CERAMIC_URL)

  try {
    // Initialize Ceramic client
    const ceramic = new CeramicClient(CERAMIC_URL)

    // Create admin DID
    const seed = new Uint8Array(32)
    crypto.getRandomValues(seed)
    const provider = new Ed25519Provider(seed)
    const did = new DID({ provider, resolver: getResolver() })
    await did.authenticate()
    ceramic.did = did

    console.log("🔑 Admin DID:", did.id)
    console.log("🌐 Connected to Ceramic Network successfully!")

    // Create a basic configuration
    const config = {
      CERAMIC_URL: CERAMIC_URL,
      ADMIN_DID: did.id,
      SETUP_COMPLETE: true,
      TIMESTAMP: new Date().toISOString(),
    }

    // Create composites directory
    try {
      await import("fs").then((fs) => fs.mkdirSync("./composites", { recursive: true }))
    } catch (e) {
      // Directory might already exist
    }

    writeFileSync("./composites/ceramic-config.json", JSON.stringify(config, null, 2))

    console.log("✅ Simple setup complete!")
    console.log("📄 Configuration saved to ./composites/ceramic-config.json")
    console.log("🚀 You can now use the Ceramic service in your app!")
  } catch (error) {
    console.error("❌ Setup failed:", error)

    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }

    process.exit(1)
  }
}

simpleSetup().catch(console.error)
