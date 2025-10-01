"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Search, Filter, Play, Users, Target, Zap } from "lucide-react"
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
    id: "previously-high-value-likely-churn",
    name: "Previously High Value; Likely to Churn",
    description: "High-value customers showing churn signals - immediate intervention needed",
    criteria: "ltvTier in ['Gold', 'VIP'] AND riskScore >= 60",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "lost-customers-resurrectable",
    name: "Lost Customers; Able to Resurrect",
    description: "Churned customers with high reactivation potential",
    criteria: "status = 'churned' AND ltvTier in ['Silver', 'Gold', 'VIP'] AND daysSinceLastActivity < 90",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "high-value-no-discount-needed",
    name: "High Value; No Discount Needed",
    description: "Loyal high-value customers who don't require incentives",
    criteria: "ltvTier in ['Gold', 'VIP'] AND riskScore < 30 AND loyaltyScore >= 80",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "price-sensitive-at-risk",
    name: "Price Sensitive; At Risk",
    description: "Customers likely to churn due to price sensitivity",
    criteria: "riskScore >= 50 AND priceSensitivity = 'high'",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "new-customers-high-potential",
    name: "New Customers; High Potential",
    description: "Recent customers with strong early engagement signals",
    criteria: "customerAge < 30 days AND engagementScore >= 70",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "seasonal-customers-dormant",
    name: "Seasonal Customers; Currently Dormant",
    description: "Customers with seasonal purchase patterns currently inactive",
    criteria: "lastActivity > 60 days AND seasonalPattern = true",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "high-frequency-low-value",
    name: "High Frequency; Low Value",
    description: "Customers who buy frequently but have low individual order values",
    criteria: "totalOrders >= 10 AND avgOrderValue < 50",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  },
  {
    id: "one-time-buyers-engaged",
    name: "One-Time Buyers; Highly Engaged",
    description: "Customers who made only one purchase but show high engagement signals",
    criteria: "totalOrders = 1 AND engagementScore >= 80 AND emailEngagement.openRate >= 0.4",
    customerCount: 0,
    avgRiskScore: 0,
    avgLTV: 0
  }
]

export default function SegmentsPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [segments, setSegments] = useState<Segment[]>(predefinedSegments)
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [selectedPlay, setSelectedPlay] = useState<string | undefined>(undefined)
  const [isPlayDialogOpen, setIsPlayDialogOpen] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [isSegmentPlayDialogOpen, setIsSegmentPlayDialogOpen] = useState(false)
  const [segmentPlay, setSegmentPlay] = useState<string | undefined>(undefined)
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
        
        // Apply segment criteria based on predefined rules
        switch (segment.id) {
          case 'previously-high-value-likely-churn':
            segmentCustomers = response.customers.filter(c => 
              ['Gold', 'VIP'].includes(c.ltvTier) && c.riskScore >= 50
            )
            break
          case 'lost-customers-resurrectable':
            segmentCustomers = response.customers.filter(c => 
              (c.status === 'churned' || c.daysSinceLastActivity > 90) && 
              ['Silver', 'Gold', 'VIP'].includes(c.ltvTier) && 
              c.daysSinceLastActivity < 120
            )
            break
          case 'high-value-no-discount-needed':
            segmentCustomers = response.customers.filter(c => 
              ['Gold', 'VIP'].includes(c.ltvTier) && 
              c.riskScore < 40 && 
              c.loyaltyScore >= 60
            )
            break
          case 'price-sensitive-at-risk':
            segmentCustomers = response.customers.filter(c => 
              c.riskScore >= 40 && c.priceSensitivity === 'high'
            )
            break
          case 'new-customers-high-potential':
            segmentCustomers = response.customers.filter(c => 
              c.customerAge < 45 && c.engagementScore >= 50
            )
            break
          case 'seasonal-customers-dormant':
            segmentCustomers = response.customers.filter(c => 
              c.daysSinceLastActivity > 45 && (c.seasonalPattern === true || c.customerAge > 180)
            )
            break
          case 'high-frequency-low-value':
            segmentCustomers = response.customers.filter(c => 
              c.totalOrders >= 6 && (c.totalRevenue / c.totalOrders) < 75
            )
            break
          case 'one-time-buyers-engaged':
            segmentCustomers = response.customers.filter(c => 
              c.totalOrders === 1 && c.engagementScore >= 30 && c.emailEngagement.openRate >= 0.2
            )
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

  const handleSegmentClick = (segment: Segment) => {
    setSelectedSegment(segment)
    setSegmentPlay(undefined)
    setIsSegmentPlayDialogOpen(true)
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

  const handleTriggerSegmentPlay = async () => {
    if (!selectedSegment) {
      toast.error("No segment selected")
      return
    }

    if (!segmentPlay) {
      toast.error("Please select a play")
      return
    }

    try {
      await apiClient.post('/trigger-segment-play', {
        segmentId: selectedSegment.id,
        playId: segmentPlay,
        customerCount: selectedSegment.customerCount
      })
      
      toast.success(`Play triggered for ${selectedSegment.customerCount} customers in segment: ${selectedSegment.name}`)
      setIsSegmentPlayDialogOpen(false)
      setSelectedSegment(null)
      setSegmentPlay(undefined)
    } catch (error) {
      toast.error("Failed to trigger segment play")
      console.error("Error triggering segment play:", error)
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
          <Card 
            key={segment.id} 
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 hover:bg-gray-50"
            onClick={() => handleSegmentClick(segment)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {segment.name}
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{segment.customerCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg Risk: {segment.avgRiskScore} | Avg LTV: {formatCurrency(segment.avgLTV)}
              </p>
              <p className="text-xs text-blue-600 mt-1">Click to apply play →</p>
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

      {/* Segment Play Selection Dialog */}
      <Dialog open={isSegmentPlayDialogOpen} onOpenChange={setIsSegmentPlayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Play to Segment</DialogTitle>
            <DialogDescription>
              Choose a play to apply to the "{selectedSegment?.name}" segment ({selectedSegment?.customerCount.toLocaleString()} customers).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Play</label>
              <Select value={segmentPlay} onValueChange={setSegmentPlay}>
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
            {selectedSegment && (
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Segment Details:</h4>
                <div className="text-xs space-y-1">
                  <div><strong>Name:</strong> {selectedSegment.name}</div>
                  <div><strong>Description:</strong> {selectedSegment.description}</div>
                  <div><strong>Customer Count:</strong> {selectedSegment.customerCount.toLocaleString()}</div>
                  <div><strong>Avg Risk Score:</strong> {selectedSegment.avgRiskScore}</div>
                  <div><strong>Avg LTV:</strong> {formatCurrency(selectedSegment.avgLTV)}</div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                if (selectedSegment) {
                  const filterParams = new URLSearchParams()
                  filterParams.set('segment', selectedSegment.id)
                  const url = `/customers?${filterParams.toString()}`
                  router.push(url)
                }
              }}
            >
              View Customers
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSegmentPlayDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTriggerSegmentPlay} disabled={!segmentPlay}>
                Apply Play to Segment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
