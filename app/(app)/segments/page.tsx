"use client"

import { useState, useEffect } from "react"
import { Customer } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCurrency, getRiskColor, getLTVTierColor } from "@/lib/utils"
import { Search, Filter, Play, Users, Target } from "lucide-react"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"

interface Segment {
  id: string
  name: string
  description: string
  criteria: string
  customerCount: number
  avgRiskScore: number
  avgLTV: number
}

const predefinedSegments: Segment[] = [
  {
    id: "high-risk",
    name: "High Risk Customers",
    description: "Customers with risk score > 70",
    criteria: "riskScore > 70",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "high-value",
    name: "High Value Customers",
    description: "VIP and Gold tier customers",
    criteria: "ltvTier in ['VIP', 'Gold']",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "inactive",
    name: "Inactive Customers",
    description: "No purchase in last 60 days",
    criteria: "lastPurchaseAt < 60 days ago",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "low-engagement",
    name: "Low Email Engagement",
    description: "Email open rate < 20%",
    criteria: "emailEngagement.openRate < 0.2",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  }
]

export default function SegmentsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [segments, setSegments] = useState<Segment[]>(predefinedSegments)
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [selectedPlay, setSelectedPlay] = useState<string | undefined>(undefined)
  const [isPlayDialogOpen, setIsPlayDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<{
    search?: string
    riskBand?: string
    ltvTier?: string
  }>({})

  useEffect(() => {
    loadCustomers()
  }, [filters])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '1000', // Load more for segments
        ...filters
      })

      const response = await apiClient.get<{
        customers: Customer[]
        total: number
        hasMore: boolean
      }>(`/customers?${params}`)

      setCustomers(response.customers)
      
      // Update segment statistics
      const updatedSegments = segments.map(segment => {
        let segmentCustomers = response.customers
        
        // Apply segment criteria (simplified)
        switch (segment.id) {
          case 'high-risk':
            segmentCustomers = response.customers.filter(c => c.riskScore > 70)
            break
          case 'high-value':
            segmentCustomers = response.customers.filter(c => ['VIP', 'Gold'].includes(c.ltvTier))
            break
          case 'inactive':
            segmentCustomers = response.customers.filter(c => {
              if (!c.lastPurchaseAt) return true
              const daysSinceLastPurchase = (Date.now() - new Date(c.lastPurchaseAt).getTime()) / (1000 * 60 * 60 * 24)
              return daysSinceLastPurchase > 60
            })
            break
          case 'low-engagement':
            segmentCustomers = response.customers.filter(c => c.emailEngagement.openRate < 0.2)
            break
        }

        const avgRiskScore = segmentCustomers.length > 0 
          ? segmentCustomers.reduce((sum, c) => sum + c.riskScore, 0) / segmentCustomers.length 
          : 0
        const avgLTV = segmentCustomers.length > 0 
          ? segmentCustomers.reduce((sum, c) => sum + c.ltv, 0) / segmentCustomers.length 
          : 0

        return {
          ...segment,
          customerCount: segmentCustomers.length,
          avgRiskScore: Math.round(avgRiskScore),
          avgLTV: Math.round(avgLTV)
        }
      })
      
      setSegments(updatedSegments)
    } catch (error) {
      toast.error("Failed to load customers")
      console.error("Error loading customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }

  const handleFilter = (newFilters: { riskBand?: string; ltvTier?: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleSelectCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomers)
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId)
    } else {
      newSelected.add(customerId)
    }
    setSelectedCustomers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set())
    } else {
      setSelectedCustomers(new Set(customers.map(c => c.id)))
    }
  }

  const handleTriggerPlay = async () => {
    if (selectedCustomers.size === 0) {
      toast.error("Please select customers first")
      return
    }

    if (!selectedPlay) {
      toast.error("Please select a play")
      return
    }

    try {
      await apiClient.post('/trigger-play', {
        customerIds: Array.from(selectedCustomers),
        playId: selectedPlay,
        customerCount: selectedCustomers.size
      })
      
      toast.success(`Play triggered for ${selectedCustomers.size} customers`)
      setIsPlayDialogOpen(false)
      setSelectedCustomers(new Set())
    } catch (error) {
      toast.error("Failed to trigger play")
      console.error("Error triggering play:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segments</h1>
          <p className="text-muted-foreground">
            Manage customer segments and bulk actions
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading segments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Segments</h1>
        <p className="text-muted-foreground">
          Manage customer segments and bulk actions
        </p>
      </div>

      {/* Segment Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {segment.name}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{segment.customerCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg Risk: {segment.avgRiskScore} | Avg LTV: {formatCurrency(segment.avgLTV)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Table with Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer List ({customers.length.toLocaleString()})</span>
            <div className="flex items-center space-x-2">
              <Dialog open={isPlayDialogOpen} onOpenChange={setIsPlayDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={selectedCustomers.size === 0}
                    className="flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Apply Play ({selectedCustomers.size})</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Apply Play to Selected Customers</DialogTitle>
                    <DialogDescription>
                      Choose a play to apply to {selectedCustomers.size} selected customers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Play</label>
                      <Select value={selectedPlay} onValueChange={setSelectedPlay}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a play" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="play-001">20% Discount Code</SelectItem>
                          <SelectItem value="play-002">Loyalty Points Bonus</SelectItem>
                          <SelectItem value="play-003">Personalized Bundle</SelectItem>
                          <SelectItem value="play-004">Content Nurture Series</SelectItem>
                          <SelectItem value="play-005">CS Outreach Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPlayDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleTriggerPlay} disabled={!selectedPlay}>
                      Apply Play
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select onValueChange={(value) => handleFilter({ riskBand: value === "all" ? undefined : value })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Risk Band" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleFilter({ ltvTier: value === "all" ? undefined : value })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="LTV Tier" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Bronze">Bronze</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.size === customers.length && customers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>LTV</TableHead>
                  <TableHead>Last Purchase</TableHead>
                  <TableHead>Email Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedCustomers.has(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {customer.avatarUrl ? (
                            <img
                              src={customer.avatarUrl}
                              alt={customer.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {customer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskColor(customer.riskBand)}>
                          {customer.riskBand}
                        </Badge>
                        <span className="text-sm font-medium">{customer.riskScore}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={getLTVTierColor(customer.ltvTier)}>
                          {customer.ltvTier}
                        </Badge>
                        <span className="text-sm">{formatCurrency(customer.ltv)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.lastPurchaseAt ? new Date(customer.lastPurchaseAt).toLocaleDateString() : 'Never'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Open: {(customer.emailEngagement.openRate * 100).toFixed(1)}%</div>
                        <div>Click: {(customer.emailEngagement.clickRate * 100).toFixed(1)}%</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
