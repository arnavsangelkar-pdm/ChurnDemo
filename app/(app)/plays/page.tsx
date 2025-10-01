"use client"

import { useState, useEffect } from "react"
import { Play as PlayType } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { formatPercentage, getStatusColor } from "@/lib/utils"
import { Plus, Play, TestTube, Mail, MessageSquare, Smartphone, Monitor } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

const channelIcons = {
  Email: Mail,
  SMS: Smartphone,
  'On-site': Monitor,
  CS: MessageSquare,
}

const playKinds = {
  Discount: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950",
  Loyalty: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
  Content: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950",
  Bundle: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
  Service: "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-950",
}

export default function PlaysPage() {
  const [plays, setPlays] = useState<PlayType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSimulateDialogOpen, setIsSimulateDialogOpen] = useState(false)
  const [selectedPlay, setSelectedPlay] = useState<PlayType | null>(null)
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)

  // Form state for creating new play
  const [newPlay, setNewPlay] = useState({
    name: "",
    channel: "Email" as PlayType['channel'],
    kind: "Discount" as PlayType['kind'],
    eligibility: "",
    frequencyCapPer30d: 1,
    estUpliftPct: 10,
    estCostPctOfRev: 5,
    description: "",
    copy: ""
  })

  useEffect(() => {
    loadPlays()
  }, [])

  const loadPlays = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<PlayType[]>('/plays')
      setPlays(response)
    } catch (error) {
      toast.error("Failed to load plays")
      console.error("Error loading plays:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlay = async () => {
    try {
      const play = await apiClient.post<PlayType>('/plays', {
        ...newPlay,
        status: 'Draft'
      })
      
      setPlays(prev => [...prev, play])
      setIsCreateDialogOpen(false)
      setNewPlay({
        name: "",
        channel: "Email",
        kind: "Discount",
        eligibility: "",
        frequencyCapPer30d: 1,
        estUpliftPct: 10,
        estCostPctOfRev: 5,
        description: "",
        copy: ""
      })
      toast.success("Play created successfully")
    } catch (error) {
      toast.error("Failed to create play")
      console.error("Error creating play:", error)
    }
  }

  const handleSimulate = async (play: PlayType) => {
    try {
      setSimulating(true)
      setSelectedPlay(play)
      setIsSimulateDialogOpen(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock simulation results
      const results = {
        estimatedReach: Math.floor(Math.random() * 1000) + 100,
        estimatedCost: Math.floor(Math.random() * 5000) + 1000,
        estimatedUplift: play.estUpliftPct + (Math.random() * 10 - 5),
        estimatedRevenue: Math.floor(Math.random() * 20000) + 5000,
        confidence: Math.floor(Math.random() * 30) + 70
      }
      
      setSimulationResults(results)
    } catch (error) {
      toast.error("Failed to simulate play")
      console.error("Error simulating play:", error)
    } finally {
      setSimulating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plays</h1>
          <p className="text-muted-foreground">
            Manage retention plays and campaigns
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading plays...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plays</h1>
          <p className="text-muted-foreground">
            Manage retention plays and campaigns
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Play</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Play</DialogTitle>
              <DialogDescription>
                Create a new retention play to engage customers and reduce churn.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Play Name</Label>
                  <Input
                    id="name"
                    value={newPlay.name}
                    onChange={(e) => setNewPlay(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Welcome Discount"
                  />
                </div>
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select value={newPlay.channel} onValueChange={(value: PlayType['channel']) => setNewPlay(prev => ({ ...prev, channel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="CS">Customer Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kind">Play Type</Label>
                  <Select value={newPlay.kind} onValueChange={(value: PlayType['kind']) => setNewPlay(prev => ({ ...prev, kind: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Discount">Discount</SelectItem>
                      <SelectItem value="Loyalty">Loyalty</SelectItem>
                      <SelectItem value="Content">Content</SelectItem>
                      <SelectItem value="Bundle">Bundle</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency Cap (per 30 days)</Label>
                  <Input
                    id="frequency"
                    type="number"
                    min="1"
                    value={newPlay.frequencyCapPer30d}
                    onChange={(e) => setNewPlay(prev => ({ ...prev, frequencyCapPer30d: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="eligibility">Eligibility Rules</Label>
                <Input
                  id="eligibility"
                  value={newPlay.eligibility}
                  onChange={(e) => setNewPlay(prev => ({ ...prev, eligibility: e.target.value }))}
                  placeholder="e.g., risk >= 50 AND ltvTier in [Bronze,Silver,Gold,VIP]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="uplift">Estimated Uplift (%)</Label>
                  <Input
                    id="uplift"
                    type="number"
                    min="0"
                    max="100"
                    value={newPlay.estUpliftPct}
                    onChange={(e) => setNewPlay(prev => ({ ...prev, estUpliftPct: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Estimated Cost (% of Revenue)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    max="100"
                    value={newPlay.estCostPctOfRev}
                    onChange={(e) => setNewPlay(prev => ({ ...prev, estCostPctOfRev: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPlay.description}
                  onChange={(e) => setNewPlay(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this play does..."
                />
              </div>
              <div>
                <Label htmlFor="copy">Message Copy</Label>
                <Textarea
                  id="copy"
                  value={newPlay.copy}
                  onChange={(e) => setNewPlay(prev => ({ ...prev, copy: e.target.value }))}
                  placeholder="The message content that will be sent to customers..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlay} disabled={!newPlay.name}>
                Create Play
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plays Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plays.map((play) => {
          const ChannelIcon = channelIcons[play.channel]
          
          return (
            <Card key={play.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{play.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{play.channel}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(play.status)}>
                    {play.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge className={playKinds[play.kind]}>
                      {play.kind}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Est. Uplift</span>
                    <span className="text-sm font-medium">{formatPercentage(play.estUpliftPct)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Est. Cost</span>
                    <span className="text-sm font-medium">{formatPercentage(play.estCostPctOfRev)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Frequency Cap</span>
                    <span className="text-sm font-medium">{play.frequencyCapPer30d}/30d</span>
                  </div>
                  {play.description && (
                    <p className="text-sm text-muted-foreground">{play.description}</p>
                  )}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSimulate(play)}
                      className="flex-1"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Simulate
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Trigger
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Simulation Dialog */}
      <Dialog open={isSimulateDialogOpen} onOpenChange={setIsSimulateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulation Results</DialogTitle>
            <DialogDescription>
              Estimated impact for "{selectedPlay?.name}"
            </DialogDescription>
          </DialogHeader>
          {simulating ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Running simulation...</p>
              </div>
            </div>
          ) : simulationResults ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{simulationResults.estimatedReach}</div>
                  <div className="text-sm text-muted-foreground">Estimated Reach</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatPercentage(simulationResults.estimatedUplift)}</div>
                  <div className="text-sm text-muted-foreground">Estimated Uplift</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">${simulationResults.estimatedCost.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Estimated Cost</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">${simulationResults.estimatedRevenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Estimated Revenue</div>
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatPercentage(simulationResults.confidence)} Confidence
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Simulation Confidence Level
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setIsSimulateDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
