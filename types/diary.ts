export interface DiaryEntry {
  id: string
  content: string
  mood: string
  location?: string
  timestamp: Date
  anonymous: boolean
}

export interface AnalysisResult {
  overallMood: string
  emotionalPatterns: string[]
  insights: string[]
  recommendations: string[]
  summary: string
}
