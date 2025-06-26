"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Shield,
  Loader2,
  RefreshCw,
  Globe,
  Database,
  TrendingUp,
  MapPin,
  Brain,
  BarChart3,
  CheckCircle2,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePublicEntries } from "@/contexts/public-entries-context"
import { LocationMoodDialog } from "@/components/location-mood-dialog"
import { AnalysisDialog } from "@/components/analysis-dialog"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useAuth } from "@/contexts/auth-context"
import { useStorage } from "@/contexts/storage-context"

export default function PublicFeed() {
  const { entries, isLoading, refreshEntries, getEntriesByMood, searchEntries } = usePublicEntries()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [filteredEntries, setFilteredEntries] = useState(entries)

  const { isAuthenticated } = useAuth()
  const { entries: myEntries } = useStorage()
  const [showLocationMoodDialog, setShowLocationMoodDialog] = useState(false)
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)

  useEffect(() => {
    setFilteredEntries(entries)
  }, [entries])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshEntries()
    setIsRefreshing(false)
  }

  const handleLocationMoodAnalysis = () => {
    if (!isAuthenticated) {
      return
    }
    setShowLocationMoodDialog(true)
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    if (isSelectMode) {
      setSelectedEntries([])
    }
  }

  const handleAnalyzeSelected = () => {
    if (selectedEntries.length > 0) {
      setShowAnalysisDialog(true)
    }
  }

  const toggleEntrySelection = (entryId: string) => {
    if (!isSelectMode) return

    setSelectedEntries((prev) => (prev.includes(entryId) ? prev.filter((id) => id !== entryId) : [...prev, entryId]))
  }

  const exitSelectMode = () => {
    setIsSelectMode(false)
    setSelectedEntries([])
  }

  const handleMoodFilter = async (mood: string) => {
    setSelectedMood(mood)

    if (!mood || mood === "all") {
      setFilteredEntries(entries)
      return
    }

    try {
      const results = await getEntriesByMood(mood)
      setFilteredEntries(results)
    } catch (error) {
      console.error("Mood filter failed:", error)
    }
  }

  const clearFilters = () => {
    setSelectedMood("")
    setSelectedEntries([])
    setIsSelectMode(false)
    setFilteredEntries(entries)
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

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return "now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) {
        return `${diffInHours}h`
      } else {
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(date)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Loading from Ceramic Network...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Explore</h1>
                <p className="text-xs text-gray-500 dark:text-gray-500">Anonymous thoughts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={isRefreshing}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Selection Mode Bar */}
        {isSelectMode && (
          <div className="bg-blue-50 dark:bg-gray-900 border-b border-blue-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-gray-300" />
                <span className="text-sm text-blue-800 dark:text-gray-300">
                  {selectedEntries.length} selected for analysis
                </span>
              </div>
              <div className="flex gap-2">
                {selectedEntries.length > 0 && (
                  <Button
                    onClick={handleAnalyzeSelected}
                    size="sm"
                    className="bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-gray-600 rounded-full px-4"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    Analyze
                  </Button>
                )}
                <Button
                  onClick={exitSelectMode}
                  size="sm"
                  variant="ghost"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis and Filter Controls */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={handleLocationMoodAnalysis}
              className="flex-1 bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-gray-600 rounded-full"
              disabled={!isAuthenticated}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Location Insights
            </Button>
            <Button
              onClick={toggleSelectMode}
              className={`flex-1 rounded-full ${
                isSelectMode
                  ? "bg-blue-700 dark:bg-gray-600 hover:bg-blue-800 dark:hover:bg-gray-500 text-white dark:text-gray-200"
                  : "bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-gray-600"
              }`}
              disabled={!isAuthenticated}
            >
              <Brain className="w-4 h-4 mr-2" />
              {isSelectMode ? "Selecting..." : "Select to Analyze"}
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={selectedMood} onValueChange={handleMoodFilter}>
                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white rounded-full">
                  <SelectValue placeholder="Filter by mood" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                  <SelectItem value="all">All moods</SelectItem>
                  <SelectItem value="happy">😊 Happy</SelectItem>
                  <SelectItem value="sad">😢 Sad</SelectItem>
                  <SelectItem value="anxious">😰 Anxious</SelectItem>
                  <SelectItem value="angry">😠 Angry</SelectItem>
                  <SelectItem value="peaceful">😌 Peaceful</SelectItem>
                  <SelectItem value="excited">🤩 Excited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(selectedMood || isSelectMode) && (
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredEntries.length} thoughts • Ceramic Network
              </span>
            </div>
            <Badge className="bg-blue-100 dark:bg-gray-800 text-blue-800 dark:text-gray-300 border-blue-200 dark:border-gray-700">
              <Database className="w-3 h-3 mr-1" />
              Decentralized
            </Badge>
          </div>
        </div>

        {/* Timeline */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4">
                <Globe className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {searchTerm || selectedMood ? "No matching thoughts" : "No thoughts yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  {searchTerm || selectedMood ? "Try different filters" : "Be the first to share your thoughts!"}
                </p>
              </div>
              {searchTerm || selectedMood ? (
                <Button
                  onClick={clearFilters}
                  className="bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-gray-600 rounded-full"
                >
                  Clear Filters
                </Button>
              ) : (
                <Link href="/">
                  <Button className="bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-gray-600 rounded-full">
                    Share a Thought
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.ceramicId || entry.id}
                onClick={() => toggleEntrySelection(entry.ceramicId || entry.id)}
                className={`p-4 transition-all duration-200 ${isSelectMode ? "cursor-pointer" : ""} ${
                  selectedEntries.includes(entry.ceramicId || entry.id)
                    ? "bg-blue-50 dark:bg-gray-900 border-l-4 border-blue-500 dark:border-gray-500"
                    : isSelectMode
                      ? "hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-l-2 hover:border-gray-300 dark:hover:border-gray-600"
                      : "hover:bg-gray-50 dark:hover:bg-gray-950"
                }`}
              >
                <div className="flex gap-3">
                  {/* Selection Indicator */}
                  {isSelectMode && (
                    <div className="mt-1 flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedEntries.includes(entry.ceramicId || entry.id)
                            ? "bg-blue-500 dark:bg-gray-600 border-blue-500 dark:border-gray-600"
                            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-gray-500"
                        }`}
                      >
                        {selectedEntries.includes(entry.ceramicId || entry.id) && (
                          <CheckCircle2 className="w-3 h-3 text-white dark:text-gray-200" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Anonymous Human</span>
                        <Shield className="w-3 h-3 text-green-500 dark:text-gray-400" />
                        <Database className="w-3 h-3 text-blue-500 dark:text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-500 text-sm">·</span>
                        <span className="text-gray-500 dark:text-gray-500 text-sm">{formatDate(entry.timestamp)}</span>
                      </div>

                      <div>
                        <p className="text-gray-900 dark:text-white leading-relaxed">{entry.content}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-500 capitalize">{entry.mood}</span>
                          </div>
                          {entry.location && (
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                              <MapPin className="w-3 h-3" />
                              <span className="text-sm">{entry.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Encourage Participation */}
        {filteredEntries.length > 0 && (
          <div className="p-6 text-center border-t border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-500 mb-4">Want to share your thoughts?</p>
            <Link href="/">
              <Button className="bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-gray-600 rounded-full">
                Write a Thought
              </Button>
            </Link>
          </div>
        )}

        {/* Analysis Dialogs */}
        <LocationMoodDialog open={showLocationMoodDialog} onOpenChange={setShowLocationMoodDialog} />
        <AnalysisDialog
          open={showAnalysisDialog}
          onOpenChange={setShowAnalysisDialog}
          entries={myEntries.filter((entry) => selectedEntries.includes(entry.ceramicId || entry.id))}
          onAnalysisComplete={() => {
            setSelectedEntries([])
            setIsSelectMode(false)
          }}
        />
      </div>
    </div>
  )
}
