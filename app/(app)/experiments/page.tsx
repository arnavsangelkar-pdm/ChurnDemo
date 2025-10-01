"use client"

import { useState, useEffect } from "react"
import { Experiment, Play as PlayType } from "@/lib/types"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatPercentage, getStatusColor } from "@/lib/utils"
import { Plus, Play, TestTube, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [plays, setPlays] = useState<PlayType[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state for creating new experiment
  const [newExperiment, setNewExperiment] = useState({
    name: "",
    segment: "",
    treatmentPlayId: "",
    controlPct: 50,
    duration: 14
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [experimentsData, playsData] = await Promise.all([
        apiClient.get<Experiment[]>('/experiments'),
        apiClient.get<PlayType[]>('/plays')
      ])
      
      setExperiments(experimentsData)
      setPlays(playsData.filter(play => play.status === 'Active'))
    } catch (error) {
      toast.error("Failed to load experiments")
      console.error("Error loading experiments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExperiment = async () => {
    try {
      setCreating(true)
      
      const startAt = new Date().toISOString()
      const endAt = new Date(Date.now() + newExperiment.duration * 24 * 60 * 60 * 1000).toISOString()
      
      const experiment = await apiClient.post<Experiment>('/experiments', {
        ...newExperiment,
        startAt,
        endAt,
        status: 'Running'
      })
      
      setExperiments(prev => [...prev, experiment])
      setIsCreateDialogOpen(false)
      setNewExperiment({
        name: "",
        segment: "",
        treatmentPlayId: "",
        controlPct: 50,
        duration: 14
      })
      toast.success("Experiment started successfully")
    } catch (error) {
      toast.error("Failed to create experiment")
      console.error("Error creating experiment:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleCompleteExperiment = async (experimentId: string) => {
    try {
      // Simulate completing experiment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const experiment = experiments.find(e => e.id === experimentId)
      if (experiment) {
        // Mock results
        const results = {
          incrementalRevenue: Math.floor(Math.random() * 10000) + 5000,
          winner: (Math.random() > 0.5 ? 'Treatment' : 'Control') as 'Treatment' | 'Control',
          pValue: Math.random() * 0.1,
          upliftPct: Math.random() * 20 + 5
        }
        
        const updatedExperiment = {
          ...experiment,
          status: 'Completed' as const,
          endAt: new Date().toISOString(),
          results
        }
        
        setExperiments(prev => prev.map(e => e.id === experimentId ? updatedExperiment : e))
        toast.success("Experiment completed")
      }
    } catch (error) {
      toast.error("Failed to complete experiment")
      console.error("Error completing experiment:", error)
    }
  }

  const getWinnerIcon = (winner?: string) => {
    switch (winner) {
      case 'Treatment':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'Control':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'Inconclusive':
        return <Minus className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const getWinnerColor = (winner?: string) => {
    switch (winner) {
      case 'Treatment':
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950"
      case 'Control':
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950"
      case 'Inconclusive':
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950"
      default:
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
          <p className="text-muted-foreground">
            Manage A/B tests and measure retention impact
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading experiments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
          <p className="text-muted-foreground">
            Manage A/B tests and measure retention impact
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Start Experiment</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Experiment</DialogTitle>
              <DialogDescription>
                Create a new A/B test to measure the impact of retention plays.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Experiment Name</Label>
                <Input
                  id="name"
                  value={newExperiment.name}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Discount vs Loyalty Points"
                />
              </div>
              <div>
                <Label htmlFor="segment">Target Segment</Label>
                <Select value={newExperiment.segment} onValueChange={(value) => setNewExperiment(prev => ({ ...prev, segment: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-risk">High Risk Customers</SelectItem>
                    <SelectItem value="high-value">High Value Customers</SelectItem>
                    <SelectItem value="inactive">Inactive Customers</SelectItem>
                    <SelectItem value="low-engagement">Low Email Engagement</SelectItem>
                    <SelectItem value="all">All Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="treatment">Treatment Play</Label>
                <Select value={newExperiment.treatmentPlayId} onValueChange={(value) => setNewExperiment(prev => ({ ...prev, treatmentPlayId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment play" />
                  </SelectTrigger>
                  <SelectContent>
                    {plays.filter(play => play.id && play.id.trim() !== '').map((play) => (
                      <SelectItem key={play.id} value={play.id}>
                        {play.name} ({play.channel})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="control">Control Group %</Label>
                  <Input
                    id="control"
                    type="number"
                    min="10"
                    max="90"
                    value={newExperiment.controlPct}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, controlPct: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="7"
                    max="90"
                    value={newExperiment.duration}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateExperiment} 
                disabled={!newExperiment.name || !newExperiment.segment || !newExperiment.treatmentPlayId || creating}
              >
                {creating ? "Starting..." : "Start Experiment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experiments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Recent Experiments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experiment</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiments.map((experiment) => {
                  const treatmentPlay = plays.find(p => p.id === experiment.treatmentPlayId)
                  const startDate = new Date(experiment.startAt)
                  const endDate = experiment.endAt ? new Date(experiment.endAt) : null
                  const now = new Date()
                  const daysRunning = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                  const totalDays = endDate ? Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : newExperiment.duration
                  
                  return (
                    <TableRow key={experiment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{experiment.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Started {startDate.toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{experiment.segment}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {treatmentPlay?.name || 'Unknown Play'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {treatmentPlay?.channel}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(experiment.status)}>
                          {experiment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {daysRunning}/{totalDays} days
                        </div>
                        {experiment.status === 'Running' && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${Math.min(100, (daysRunning / totalDays) * 100)}%` }}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {experiment.results ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              {getWinnerIcon(experiment.results.winner)}
                              <Badge className={getWinnerColor(experiment.results.winner)}>
                                {experiment.results.winner}
                              </Badge>
                            </div>
                            <div className="text-sm">
                              +{formatCurrency(experiment.results.incrementalRevenue)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatPercentage(experiment.results.upliftPct)} uplift
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {experiment.status === 'Running' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteExperiment(experiment.id)}
                          >
                            <TestTube className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
