console.log("🏺 Testing Ceramic connection...")

const CERAMIC_URL = "https://ceramic-clay.3boxlabs.com"

async function testCeramic() {
  try {
    // Simple fetch test to the Ceramic node
    const response = await fetch(`${CERAMIC_URL}/api/v0/node/healthcheck`)

    if (response.ok) {
      const data = await response.text()
      console.log("✅ Ceramic node is accessible!")
      console.log("🔗 URL:", CERAMIC_URL)
      console.log("📊 Response:", data)
    } else {
      console.log("⚠️  Ceramic node responded with status:", response.status)
    }
  } catch (error) {
    console.log("❌ Cannot reach Ceramic node:", error.message)
    console.log("🔄 Trying alternative approach...")

    // Try a different endpoint
    try {
      const altResponse = await fetch(`${CERAMIC_URL}/api/v0/commits`)
      console.log("✅ Alternative endpoint works! Status:", altResponse.status)
    } catch (altError) {
      console.log("❌ Alternative endpoint also failed:", altError.message)
    }
  }
}

testCeramic()
