"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, User, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { login, isVerifying } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAuth = async () => {
    try {
      setError(null)
      await login()
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError("Authentication failed. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Human Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!success && !isVerifying && (
            <>
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-black dark:text-white">
                    <User className="w-5 h-5" />
                    Verify Your Humanity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    To maintain a safe and authentic community, we use Rarimo's zero-knowledge proof system to verify
                    that you're human.
                  </p>
                  <div className="bg-blue-50 dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-gray-700">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">Privacy Protected</h4>
                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                      Your personal information remains completely private. We only verify your humanity, not your
                      identity.
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                      <span>Anonymous diary entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                      <span>Zero-knowledge verification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                      <span>No personal data stored</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                onClick={handleAuth}
                className="w-full bg-blue-600 dark:bg-gray-700 hover:bg-blue-700 dark:hover:bg-gray-600 text-white dark:text-gray-200"
              >
                <Shield className="w-4 h-4 mr-2" />
                Verify with Rarimo
              </Button>
            </>
          )}

          {isVerifying && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
              <div className="text-center">
                <h3 className="font-medium text-black dark:text-white">Generating Zero-Knowledge Proof</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This may take a few moments...</p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400" />
              <div className="text-center">
                <h3 className="font-medium text-green-700 dark:text-green-400">Verification Successful!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">You can now create diary entries</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
