// "use client"

// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Cloud, Download, Loader2, CheckCircle, AlertCircle, Copy, Database, Shield, Info } from "lucide-react"
// import { useStorage } from "@/contexts/storage-context"
// import type { SwarmReference } from "@/lib/swarm"

// interface SwarmSyncDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// export function SwarmSyncDialog({ open, onOpenChange }: SwarmSyncDialogProps) {
//   const { entries, syncStatus, loadFromSwarm, getSwarmReferences } = useStorage()

//   const [swarmHash, setSwarmHash] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)

//   const handleLoad = async () => {
//     if (!swarmHash.trim()) {
//       setError("Please enter a valid Swarm hash")
//       return
//     }

//     setIsLoading(true)
//     setError(null)

//     try {
//       const reference: SwarmReference = {
//         hash: swarmHash.trim(),
//         url: `https://gateway.ethswarm.org/bytes/${swarmHash.trim()}`,
//       }

//       await loadFromSwarm(reference)
//       setSuccess("Entries successfully loaded from Swarm!")
//       setSwarmHash("")
//     } catch (err) {
//       setError("Failed to load from Swarm. Check the hash and try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text)
//     setSuccess("Hash copied to clipboard!")
//     setTimeout(() => setSuccess(null), 2000)
//   }

//   const references = getSwarmReferences()

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Cloud className="w-5 h-5" />
//             Swarm Storage
//           </DialogTitle>
//         </DialogHeader>

//         <Tabs defaultValue="info" className="w-full">
//           <TabsList className="grid w-full grid-cols-3">
//             <TabsTrigger value="info">Status</TabsTrigger>
//             <TabsTrigger value="load">Load</TabsTrigger>
//             <TabsTrigger value="history">History</TabsTrigger>
//           </TabsList>

//           <TabsContent value="info" className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Info className="w-5 h-5 text-blue-500" />
//                   Auto-Sync Status
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <h4 className="font-medium text-blue-900 mb-2">Automatic Background Sync</h4>
//                   <p className="text-blue-700 text-sm mb-3">
//                     Your entries are automatically encrypted and synced to Swarm's decentralized network in the
//                     background.
//                   </p>
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div className="flex items-center gap-2">
//                       <Database className="w-4 h-4 text-gray-500" />
//                       <span>{entries.length} entries stored</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <Shield className="w-4 h-4 text-green-500" />
//                       <span>End-to-end encrypted</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-3 bg-gray-50 rounded-lg">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm font-medium">Current Status:</span>
//                     <div className="flex items-center gap-2">
//                       {syncStatus.status === "syncing" && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
//                       {syncStatus.status === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
//                       {syncStatus.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
//                       <span className="text-sm capitalize">{syncStatus.status}</span>
//                     </div>
//                   </div>
//                   {syncStatus.lastSync && (
//                     <p className="text-xs text-gray-600 mt-1">Last sync: {syncStatus.lastSync.toLocaleString()}</p>
//                   )}
//                 </div>

//                 <div className="text-xs text-gray-600 space-y-1">
//                   <p>• Entries sync automatically after creation</p>
//                   <p>• Background sync every 5 minutes</p>
//                   <p>• Failed syncs retry automatically</p>
//                   <p>• All data encrypted before upload</p>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="load" className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Download className="w-5 h-5 text-green-500" />
//                   Load from Swarm
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <p className="text-sm text-gray-600">
//                   Load entries from another device or shared collection using a Swarm hash.
//                 </p>

//                 <div>
//                   <Label htmlFor="swarm-hash">Swarm Hash</Label>
//                   <Input
//                     id="swarm-hash"
//                     value={swarmHash}
//                     onChange={(e) => setSwarmHash(e.target.value)}
//                     placeholder="Enter Swarm hash (e.g., 1a2b3c4d...)"
//                     className="font-mono text-sm"
//                   />
//                 </div>

//                 <Button onClick={handleLoad} disabled={isLoading || !swarmHash.trim()} className="w-full">
//                   {isLoading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Loading from Swarm...
//                     </>
//                   ) : (
//                     <>
//                       <Download className="w-4 h-4 mr-2" />
//                       Load Entries
//                     </>
//                   )}
//                 </Button>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="history" className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Sync History</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {references.length === 0 ? (
//                   <p className="text-gray-500 text-center py-4">No sync history yet</p>
//                 ) : (
//                   <div className="space-y-3">
//                     {references
//                       .slice(-5)
//                       .reverse()
//                       .map((ref, index) => (
//                         <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                           <div className="flex-1 min-w-0">
//                             <p className="font-mono text-sm text-gray-600 truncate">{ref.hash}</p>
//                             <p className="text-xs text-gray-500">Swarm reference</p>
//                           </div>
//                           <div className="flex gap-2 ml-2">
//                             <Button onClick={() => copyToClipboard(ref.hash)} variant="ghost" size="sm">
//                               <Copy className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               onClick={() => {
//                                 setSwarmHash(ref.hash)
//                                 // Switch to load tab
//                                 const loadTab = document.querySelector('[value="load"]') as HTMLElement
//                                 loadTab?.click()
//                               }}
//                               variant="ghost"
//                               size="sm"
//                             >
//                               <Download className="w-4 h-4" />
//                             </Button>
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>

//         {/* Status Messages */}
//         {error && (
//           <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
//             <AlertCircle className="w-4 h-4" />
//             <span className="text-sm">{error}</span>
//           </div>
//         )}

//         {success && (
//           <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
//             <CheckCircle className="w-4 h-4" />
//             <span className="text-sm">{success}</span>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   )
// }
