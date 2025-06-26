"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  PlusCircle,
  Brain,
  Shield,
  LogOut,
  Database,
  Loader2,
  Globe,
  MessageCircle,
  MapPin,
  CheckCircle2,
  X,
} from "lucide-react"
import type { DiaryEntry } from "@/types/diary"
import { AddEntryDialog } from "@/components/add-entry-dialog"
import { AnalysisDialog } from "@/components/analysis-dialog"
import { AuthDialog } from "@/components/auth-dialog"
import { SyncStatus } from "@/components/sync-status"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useAuth } from "@/contexts/auth-context"
import { useStorage } from "@/contexts/storage-context"
import Link from "next/link"

export default function DiaryApp() {
  const { isAuthenticated, logout } = useAuth()
  const { entries, isLoading, syncStatus, addEntry } = useStorage()
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const handleAddEntry = async (content: string, mood: string, location?: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      content,
      mood,
      location,
      timestamp: new Date(),
      anonymous: true,
    }

    await addEntry(newEntry)
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    if (isSelectMode) {
      setSelectedEntries([])
    }
  }

  const toggleEntrySelection = (entryId: string) => {
    if (!isSelectMode) return

    setSelectedEntries((prev) => (prev.includes(entryId) ? prev.filter((id) => id !== entryId) : [...prev, entryId]))
  }

  const handleNewEntry = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }
    setShowAddDialog(true)
  }

  const handleAnalyzeEntry = (entryId: string) => {
    setSelectedEntries([entryId])
    setShowAnalysisDialog(true)
  }

  const handleAnalyzeSelected = () => {
    if (selectedEntries.length > 0) {
      setShowAnalysisDialog(true)
    }
  }

  const exitSelectMode = () => {
    setIsSelectMode(false)
    setSelectedEntries([])
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
        }).format(new Date(date))
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Connecting to Ceramic Network...</p>
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
            <h1 className="text-xl font-bold">My Diary</h1>
            <div className="flex items-center gap-3">
              <Link href="/feed">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Globe className="w-4 h-4" />
                </Button>
              </Link>
              <ThemeSwitcher />
              {isAuthenticated ? (
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAuthDialog(true)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                >
                  <Shield className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Status Bar */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Badge className="bg-green-100 dark:bg-gray-800 text-green-800 dark:text-gray-300 border-green-200 dark:border-gray-700">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                  <Shield className="w-3 h-3 mr-1" />
                  Unverified
                </Badge>
              )}
            </div>
            <SyncStatus />
          </div>
        </div>

        {/* Selection Mode Bar */}
        {isSelectMode && (
          <div className="bg-blue-50 dark:bg-gray-900 border-b border-blue-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-gray-300" />
                <span className="text-sm text-blue-800 dark:text-gray-300">{selectedEntries.length} selected</span>
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

        {/* Compose */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Button
                onClick={handleNewEntry}
                variant="ghost"
                className="w-full text-left text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 justify-start h-auto p-3 border border-gray-200 dark:border-gray-800 rounded-xl"
              >
                What's on your mind?
              </Button>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {entries.length > 1 && !isSelectMode && (
                    <Button
                      onClick={toggleSelectMode}
                      size="sm"
                      variant="outline"
                      className="border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full px-3"
                    >
                      Select
                    </Button>
                  )}
                </div>
                <Button
                  onClick={handleNewEntry}
                  size="sm"
                  className="bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-gray-600 rounded-full px-4"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  New Entry
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Ceramic Info */}
        {entries.length > 0 && syncStatus.status === "success" && !syncStatus.message && (
          <div className="border-b border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <Database className="w-4 h-4" />
              <span>Stored on Ceramic Network • Decentralized & Queryable</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {entries.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4">
                <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No entries yet</h3>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Share your thoughts with the world</p>
              </div>
              {isAuthenticated ? (
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-gray-600 rounded-full"
                >
                  Write your first entry
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-blue-600 dark:bg-gray-700 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-gray-600 rounded-full"
                >
                  Get verified to start
                </Button>
              )}
            </div>
          ) : (
            entries.map((entry) => (
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">You</span>
                      <Shield className="w-3 h-3 text-green-500 dark:text-gray-400" />
                      <Database className="w-3 h-3 text-blue-500 dark:text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-500 text-sm">·</span>
                      <span className="text-gray-500 dark:text-gray-500 text-sm">{formatDate(entry.timestamp)}</span>
                    </div>

                    <div className="mb-3">
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

                      {!isSelectMode && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAnalyzeEntry(entry.ceramicId || entry.id)
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          Analyze
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Dialogs */}
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
        <AddEntryDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAddEntry={handleAddEntry} />
        <AnalysisDialog
          open={showAnalysisDialog}
          onOpenChange={setShowAnalysisDialog}
          entries={entries.filter((entry) => selectedEntries.includes(entry.ceramicId || entry.id))}
          onAnalysisComplete={() => {
            setSelectedEntries([])
            setIsSelectMode(false)
          }}
        />
      </div>
    </div>
  )
}
