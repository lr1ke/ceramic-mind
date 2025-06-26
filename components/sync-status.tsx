"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cloud, Loader2, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { useStorage } from "@/contexts/storage-context"

export function SyncStatus() {
  const { syncStatus, retryFailedSync } = useStorage()

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case "syncing":
        return <Loader2 className="w-3 h-3 animate-spin" />
      case "success":
        return <CheckCircle className="w-3 h-3" />
      case "error":
        return <AlertTriangle className="w-3 h-3" />
      default:
        return <Cloud className="w-3 h-3" />
    }
  }

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case "syncing":
        return "bg-blue-900 text-blue-300 border-blue-700"
      case "success":
        return "bg-green-900 text-green-300 border-green-700"
      case "error":
        return "bg-red-900 text-red-300 border-red-700"
      default:
        return "bg-gray-800 text-gray-400 border-gray-700"
    }
  }

  const getStatusText = () => {
    if (syncStatus.message) return syncStatus.message

    switch (syncStatus.status) {
      case "syncing":
        return "Syncing..."
      case "success":
        return syncStatus.lastSync ? `Synced ${syncStatus.lastSync.toLocaleTimeString()}` : "Synced"
      case "error":
        return "Sync failed"
      default:
        return "Ready"
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getStatusColor()} flex items-center gap-1 text-xs`}>
        {getStatusIcon()}
        {getStatusText()}
      </Badge>

      {syncStatus.status === "error" && (
        <Button
          onClick={retryFailedSync}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-gray-400 hover:text-gray-300"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  )
}
