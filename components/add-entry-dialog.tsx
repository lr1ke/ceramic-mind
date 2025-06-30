"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { X, MapPin } from "lucide-react"

interface AddEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEntry: (content: string, mood: string, location?: string) => void
}

export function AddEntryDialog({ open, onOpenChange, onAddEntry }: AddEntryDialogProps) {
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")
  const [location, setLocation] = useState("")

  const handleSubmit = () => {
    if (content.trim() && mood) {
      onAddEntry(content.trim(), mood, location.trim() || undefined)
      setContent("")
      setMood("")
      setLocation("")
      onOpenChange(false)
    }
  }

  const moods = [
    { value: "happy", label: "😊 Happy" },
    { value: "sad", label: "😢 Sad" },
    { value: "anxious", label: "😰 Anxious" },
    { value: "angry", label: "😠 Angry" },
    { value: "peaceful", label: "😌 Peaceful" },
    { value: "excited", label: "🤩 Excited" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-black dark:text-white">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">Share a thought</DialogTitle>
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="min-h-[120px] resize-none border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-500 text-lg"
              maxLength={280}
            />
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">{content.length}/280 characters</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mood" className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                How are you feeling?
              </Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                  {moods.map((moodOption) => (
                    <SelectItem
                      key={moodOption.value}
                      value={moodOption.value}
                      className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {moodOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                Location (optional)
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you?"
                  className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
                  maxLength={50}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-500">Your thoughts will be shared anonymously</div>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || !mood}
              className="bg-blue-600 dark:bg-gray-700 hover:bg-blue-700 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500 text-white dark:text-gray-200 rounded-full px-6"
            >
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
