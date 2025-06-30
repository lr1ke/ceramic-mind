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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Connecting to Ceramic Network...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">My Diary</h1>
            <div className="flex items-center gap-3">
              <Link href="/feed">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-accent"
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
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAuthDialog(true)}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
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
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-muted text-muted-foreground border-border">
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
          <div className="px-4 py-3 bg-accent border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">
                  {selectedEntries.length} selected
                </span>
                <Button
                  onClick={handleAnalyzeSelected}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={selectedEntries.length === 0}
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Analyze
                </Button>
              </div>
              <Button
                onClick={exitSelectMode}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Compose */}
        <div className="border-b border-border p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Button
                onClick={handleNewEntry}
                variant="ghost"
                className="w-full text-left text-muted-foreground hover:text-foreground justify-start h-auto p-3 border border-border rounded-xl"
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
                      className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full px-3"
                    >
                      Select
                    </Button>
                  )}
                </div>
                <Button
                  onClick={handleNewEntry}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4"
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
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Database className="w-4 h-4" />
              <span>Stored on Ceramic Network • Decentralized & Queryable</span>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="divide-y divide-border">
          {entries.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No entries yet</h3>
                <p className="text-muted-foreground text-sm">Share your thoughts with the world</p>
              </div>
              {isAuthenticated ? (
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                >
                  Write your first entry
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAuthDialog(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                >
                  Get verified to start
                </Button>
              )}
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => toggleEntrySelection(entry.id)}
                className={`p-4 transition-all duration-200 ${isSelectMode ? "cursor-pointer" : ""} ${
                  selectedEntries.includes(entry.id)
                    ? "bg-accent border-l-4 border-primary"
                    : isSelectMode
                      ? "hover:bg-accent hover:border-l-2 hover:border-border"
                      : "hover:bg-accent/50"
                }`}
              >
                <div className="flex gap-3">
                  {/* Selection Indicator */}
                  {isSelectMode && (
                    <div className="mt-1 flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedEntries.includes(entry.id)
                            ? "bg-primary border-primary"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {selectedEntries.includes(entry.id) && (
                          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">You</span>
                      <Shield className="w-3 h-3 text-green-500" />
                      <Database className="w-3 h-3 text-blue-500" />
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">{formatDate(entry.timestamp)}</span>
                    </div>

                    <div className="mb-3">
                      <p className="text-foreground leading-relaxed">{entry.content}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                          <span className="text-sm text-muted-foreground capitalize">{entry.mood}</span>
                        </div>
                        {entry.location && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="text-sm">{entry.location}</span>
                          </div>
                        )}
                      </div>

                      {!isSelectMode && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAnalyzeEntry(entry.id)
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground hover:bg-accent"
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
      </div>

      {/* Dialogs */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      <AddEntryDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAddEntry={handleAddEntry} />
      <AnalysisDialog
        open={showAnalysisDialog}
        onOpenChange={setShowAnalysisDialog}
        entries={entries.filter((entry) => selectedEntries.includes(entry.id))}
        onAnalysisComplete={() => {
          setSelectedEntries([])
          setIsSelectMode(false)
        }}
      />
    </div>
  )
}
