import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import type { DiaryEntry } from "@/types/diary"
import { verifyHumanProof } from "@/lib/rarimo"

const analysisSchema = z.object({
  overallMood: z.string().describe("The dominant emotional tone across all entries"),
  emotionalPatterns: z.array(z.string()).describe("Recurring emotional themes and patterns"),
  insights: z.array(z.string()).describe("Key psychological insights and observations"),
  recommendations: z.array(z.string()).describe("Actionable recommendations for emotional wellbeing"),
  summary: z.string().describe("A comprehensive summary of the analysis"),
})

export async function POST(request: Request) {
  try {
    const { entries, userProof }: { entries: DiaryEntry[]; userProof?: string } = await request.json()

    if (!entries || entries.length === 0) {
      return Response.json({ error: "No entries provided" }, { status: 400 })
    }

    // Verify human proof if provided
    if (userProof) {
      const isValidHuman = await verifyHumanProof(userProof)
      if (!isValidHuman) {
        return Response.json({ error: "Invalid human verification" }, { status: 403 })
      }
    }

    // Prepare entries text for analysis
    const entriesText = entries
      .map((entry, index) => `Entry ${index + 1} (${entry.mood}): ${entry.content}`)
      .join("\n\n")

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: analysisSchema,
      system: `You are an empathetic AI therapist and emotional intelligence expert. 
      Analyze diary entries with compassion and provide helpful insights. 
      Focus on emotional patterns, mental health indicators, and constructive guidance.
      Be supportive, non-judgmental, and encouraging in your analysis.
      
      Note: These entries are from verified humans using zero-knowledge proof technology,
      ensuring authenticity while maintaining complete anonymity.`,
      prompt: `Please analyze the following verified anonymous diary entries and provide insights:

${entriesText}

Provide a comprehensive analysis including:
1. Overall emotional tone and mood
2. Recurring emotional patterns and themes
3. Key psychological insights
4. Practical recommendations for emotional wellbeing
5. A supportive summary

Keep your analysis constructive, empathetic, and focused on growth and wellbeing.`,
    })

    return Response.json(object)
  } catch (error) {
    console.error("Analysis error:", error)
    return Response.json({ error: "Analysis failed" }, { status: 500 })
  }
}
