"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, X, BarChart3, List } from "lucide-react"
import { LocationMoodAnalysis } from "@/components/location-mood-analysis"
import { getCeramicService, type CeramicEntry } from "@/lib/ceramic-mock"

interface LocationMoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LocationMoodDialog({ open, onOpenChange }: LocationMoodDialogProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [locationEntries, setLocationEntries] = useState<CeramicEntry[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)

  const handleLocationSelect = async (location: string) => {
    setSelectedLocation(location)
    setIsLoadingEntries(true)

    try {
      const ceramic = await getCeramicService()
      const entries = await ceramic.getEntriesByLocation(location)
      setLocationEntries(entries)
    } catch (error) {
      console.error("Error loading location entries:", error)
      setLocationEntries([])
    } finally {
      setIsLoadingEntries(false)
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location-Mood Analysis
          </DialogTitle>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-300 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="entries" className="flex items-center gap-2" disabled={!selectedLocation}>
              <List className="w-4 h-4" />
              Entries {selectedLocation && `(${selectedLocation})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-4">
            <LocationMoodAnalysis onLocationSelect={handleLocationSelect} />
          </TabsContent>

          <TabsContent value="entries" className="mt-4">
            {selectedLocation ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold">Entries from {selectedLocation}</h3>
                  <span className="text-sm text-gray-500">({locationEntries.length} entries)</span>
                </div>

                {isLoadingEntries ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading entries...</p>
                  </div>
                ) : locationEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No entries found for this location.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {locationEntries.map((entry) => (
                      <div key={entry.ceramicId || entry.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                            <span className="text-sm font-medium capitalize">{entry.mood}</span>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a location from the Analysis tab to view entries.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
