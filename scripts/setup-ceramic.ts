import { CeramicClient } from "@ceramicnetwork/http-client"
import { DID } from "dids"
import { Ed25519Provider } from "key-did-provider-ed25519"
import { getResolver } from "key-did-resolver"
import { readFileSync, writeFileSync } from "fs"
import { createComposite, writeEncodedComposite } from "@composedb/devtools-node"

const CERAMIC_URL = process.env.CERAMIC_URL || "https://ceramic-clay.3boxlabs.com"

async function setupCeramic() {
  console.log("🏺 Setting up Ceramic...")
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

    // Read the GraphQL schema
    const schema = readFileSync("./schema.graphql", "utf-8")
    console.log("📖 Schema loaded")

    // Create composite
    console.log("📝 Creating composite from schema...")
    const composite = await createComposite(ceramic, schema)

    // Create composites directory if it doesn't exist
    try {
      await import("fs").then((fs) => fs.mkdirSync("./composites", { recursive: true }))
    } catch (e) {
      // Directory might already exist
    }

    // Write the composite definition
    await writeEncodedComposite(composite, "./composites/diary-entry.json")

    // Also create a runtime definition for the app
    const runtimeDefinition = {
      models: composite.toRuntime().models,
      definition: composite.toRuntime(),
    }

    writeFileSync("./composites/runtime-definition.json", JSON.stringify(runtimeDefinition, null, 2))

    console.log("✅ Ceramic setup complete!")
    console.log("📄 Composite definition written to ./composites/diary-entry.json")
    console.log("🏃 Runtime definition written to ./composites/runtime-definition.json")
    console.log("🔗 Model IDs:", composite.modelIDs)

    // Save the model ID for use in the app
    const modelConfig = {
      DIARY_ENTRY_MODEL_ID: composite.modelIDs[0],
      CERAMIC_URL: CERAMIC_URL,
    }

    writeFileSync("./composites/model-config.json", JSON.stringify(modelConfig, null, 2))

    console.log("⚙️  Model configuration saved to ./composites/model-config.json")
  } catch (error) {
    console.error("❌ Setup failed:", error)

    // More detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    process.exit(1)
  }
}

setupCeramic().catch(console.error)
