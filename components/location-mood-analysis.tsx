"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, TrendingUp, BarChart3, Loader2, RefreshCw } from "lucide-react"
import { getCeramicService, type LocationMoodData } from "@/lib/ceramic-mock"

interface LocationMoodAnalysisProps {
  onLocationSelect?: (location: string) => void
}

export function LocationMoodAnalysis({ onLocationSelect }: LocationMoodAnalysisProps) {
  const [locationData, setLocationData] = useState<LocationMoodData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLocationMoodData()
  }, [])

  const loadLocationMoodData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const ceramic = await getCeramicService()
      const data = await ceramic.getLocationMoodAnalysis()
      setLocationData(data)
    } catch (err) {
      setError("Failed to load location-mood analysis")
      console.error("Location-mood analysis error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getMoodEmoji = (mood: string) => {
    const emojis = {
      happy: "😊",
      sad: "😢",
      anxious: "😰",
      angry: "😠",
      peaceful: "😌",
      excited: "🤩",
    }
    return emojis[mood as keyof typeof emojis] || "😐"
  }

  const getMoodColor = (mood: string) => {
    const colors = {
      happy: "bg-green-100 text-green-800 border-green-200",
      sad: "bg-blue-100 text-blue-800 border-blue-200",
      anxious: "bg-yellow-100 text-yellow-800 border-yellow-200",
      angry: "bg-red-100 text-red-800 border-red-200",
      peaceful: "bg-purple-100 text-purple-800 border-purple-200",
      excited: "bg-orange-100 text-orange-800 border-orange-200",
    }
    return colors[mood as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const calculateMoodPercentage = (moodCount: number, totalEntries: number) => {
    return Math.round((moodCount / totalEntries) * 100)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Analyzing location-mood patterns...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadLocationMoodData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (locationData.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Location Data</h3>
        <p className="text-gray-500">Start adding locations to your entries to see mood patterns by place.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Mood Patterns by Location
        </h3>
        <Button onClick={loadLocationMoodData} variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        {locationData.map((location, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-base">{location.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {location.totalEntries} entries
                  </Badge>
                  {onLocationSelect && (
                    <Button
                      onClick={() => onLocationSelect(location.location)}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      View Entries
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dominant Mood */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Dominant Mood</span>
                <Badge className={getMoodColor(location.dominantMood)}>
                  {getMoodEmoji(location.dominantMood)} {location.dominantMood}
                </Badge>
              </div>

              {/* Mood Distribution */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Mood Distribution</h4>
                {Object.entries(location.moods)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => {
                    const percentage = calculateMoodPercentage(count, location.totalEntries)
                    return (
                      <div key={mood} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            {getMoodEmoji(mood)} {mood}
                          </span>
                          <span className="text-gray-500">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              mood === "happy"
                                ? "bg-green-500"
                                : mood === "sad"
                                  ? "bg-blue-500"
                                  : mood === "anxious"
                                    ? "bg-yellow-500"
                                    : mood === "angry"
                                      ? "bg-red-500"
                                      : mood === "peaceful"
                                        ? "bg-purple-500"
                                        : "bg-orange-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>

              {/* Insights */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Most frequent: {location.dominantMood}</span>
                  </div>
                  <div>
                    <span>Avg. visits: {location.averageEntriesPerVisit}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-900 mb-2">Location Insights</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • You've written from <strong>{locationData.length}</strong> different locations
            </p>
            <p>
              • Most active location: <strong>{locationData[0]?.location}</strong> ({locationData[0]?.totalEntries}{" "}
              entries)
            </p>
            <p>
              • Your happiest place:{" "}
              <strong>{locationData.find((loc) => loc.dominantMood === "happy")?.location || "Not determined"}</strong>
            </p>
            <p>
              • Most peaceful location:{" "}
              <strong>
                {locationData.find((loc) => loc.dominantMood === "peaceful")?.location || "Not determined"}
              </strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
