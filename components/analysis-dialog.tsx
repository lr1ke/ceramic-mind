"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, TrendingUp, Lightbulb, Heart } from "lucide-react"
import type { DiaryEntry, AnalysisResult } from "@/types/diary"

interface AnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entries: DiaryEntry[]
  onAnalysisComplete: () => void
}

export function AnalysisDialog({ open, onOpenChange, entries, onAnalysisComplete }: AnalysisDialogProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entries }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (error) {
      console.error("Analysis error:", error)
      // Show error message but don't break the UI
      setAnalysis({
        overallMood: "Unable to analyze",
        emotionalPatterns: ["Analysis service temporarily unavailable"],
        insights: ["Please try again later"],
        recommendations: ["Check your connection and retry"],
        summary: "We encountered an issue while analyzing your entries. Please try again.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClose = () => {
    setAnalysis(null)
    onAnalysisComplete()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Analysis
          </DialogTitle>
        </DialogHeader>

        {!analysis && !isAnalyzing && (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Analyze {entries.length} {entries.length === 1 ? "entry" : "entries"} to discover emotional patterns,
              insights, and personalized recommendations.
            </p>
            <Button
              onClick={handleAnalyze}
              className="w-full bg-blue-600 dark:bg-gray-700 hover:bg-blue-700 dark:hover:bg-gray-600 text-white dark:text-gray-200"
            >
              <Brain className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">Analyzing your entries...</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Heart className="w-5 h-5 text-red-500 dark:text-red-400" />
                  Overall Mood
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-lg px-3 py-1 bg-blue-100 dark:bg-gray-800 text-blue-800 dark:text-gray-200 border-blue-200 dark:border-gray-700">
                  {analysis.overallMood}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  Emotional Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.emotionalPatterns.map((pattern, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Lightbulb className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Brain className="w-5 h-5 text-green-500 dark:text-green-400" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-black dark:text-white">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>

            <Button
              onClick={handleClose}
              className="w-full bg-blue-600 dark:bg-gray-700 hover:bg-blue-700 dark:hover:bg-gray-600 text-white dark:text-gray-200"
            >
              Close Analysis
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
