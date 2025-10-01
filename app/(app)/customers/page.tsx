"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Customer } from "@/lib/types"
import { CustomersTable } from "@/components/customers/customers-table"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { Badge } from "@/components/ui/badge"
import { Target } from "lucide-react"

export default function CustomersPage() {
  const { addToast } = useToast()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<{
    search?: string
    riskBand?: string
    ltvTier?: string
    status?: string
    priceSensitivity?: string
    seasonalPattern?: boolean
    customerAgeMax?: number
    engagementScoreMin?: number
    loyaltyScoreMin?: number
    daysSinceLastActivityMin?: number
    daysSinceLastActivityMax?: number
  }>({})
  const [currentSegment, setCurrentSegment] = useState<string | null>(null)

  // Get segment display name
  const getSegmentDisplayName = (segmentId: string | null) => {
    if (!segmentId) return null
    
    const segmentNames: Record<string, string> = {
      'previously-high-value-likely-churn': 'Previously High Value; Likely to Churn',
      'lost-customers-resurrectable': 'Lost Customers; Able to Resurrect',
      'high-value-no-discount-needed': 'High Value; No Discount Needed',
      'price-sensitive-at-risk': 'Price Sensitive; At Risk',
      'new-customers-high-potential': 'New Customers; High Potential',
      'seasonal-customers-dormant': 'Seasonal Customers; Currently Dormant',
      'high-frequency-low-value': 'High Frequency; Low Value',
      'one-time-buyers-engaged': 'One-Time Buyers; Highly Engaged'
    }
    
    return segmentNames[segmentId] || segmentId
  }

  // Handle URL filter parameters
  useEffect(() => {
    const filter = searchParams.get('filter')
    const riskBand = searchParams.get('riskBand')
    const ltvTier = searchParams.get('ltvTier')
    const segment = searchParams.get('segment')
    
    const newFilters: any = {}
    
    // Handle segment-specific filters
    if (segment) {
      setCurrentSegment(segment)
      switch (segment) {
        case 'previously-high-value-likely-churn':
          newFilters.riskBand = 'High'
          newFilters.ltvTier = 'Gold,VIP'
          break
        case 'lost-customers-resurrectable':
          newFilters.status = 'churned'
          newFilters.ltvTier = 'Silver,Gold,VIP'
          newFilters.daysSinceLastActivityMax = 90
          break
        case 'high-value-no-discount-needed':
          newFilters.riskBand = 'Low'
          newFilters.ltvTier = 'Gold,VIP'
          newFilters.loyaltyScoreMin = 80
          break
        case 'price-sensitive-at-risk':
          newFilters.riskBand = 'High,Medium'
          newFilters.priceSensitivity = 'high'
          break
        case 'new-customers-high-potential':
          newFilters.customerAgeMax = 30
          newFilters.engagementScoreMin = 70
          break
        case 'seasonal-customers-dormant':
          newFilters.daysSinceLastActivityMin = 60
          newFilters.seasonalPattern = true
          break
        case 'high-frequency-low-value':
          // Filter for customers with many orders but low average order value
          newFilters.riskBand = 'Low,Medium'
          break
        case 'one-time-buyers-engaged':
          // Filter for customers with single purchase but high engagement
          newFilters.riskBand = 'Low'
          break
      }
    } else {
      setCurrentSegment(null)
    }
    
    if (!segment) {
      if (filter === 'at-risk') {
        newFilters.riskBand = 'High'
      } else if (filter === 'churned') {
        // This would need to be handled by the API - for now just show high risk
        newFilters.riskBand = 'High'
      } else if (filter === 'new') {
        // This would need to be handled by the API - for now just show low risk
        newFilters.riskBand = 'Low'
      } else if (filter === 'seasonal') {
        // This would need to be handled by the API - for now just show medium risk
        newFilters.riskBand = 'Medium'
      }
    }
    
    // Override with explicit URL parameters if provided
    if (riskBand) {
      newFilters.riskBand = riskBand
    }
    
    if (ltvTier) {
      newFilters.ltvTier = ltvTier
    }
    
    if (Object.keys(newFilters).length > 0) {
      setFilters(newFilters) // Set filters directly instead of merging
    } else {
      // If no URL parameters, load all customers
      setFilters({})
    }
  }, [searchParams])

  const loadCustomers = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(filters).map(([key, value]) => [
            key, 
            typeof value === 'boolean' ? value.toString() : (value || '')
          ])
        )
      })

      console.log('API call params:', params.toString())
      console.log('Filters:', filters)

      const response = await apiClient.get<{
        customers: Customer[]
        total: number
        hasMore: boolean
      }>(`/customers?${params}`)

      console.log('API response:', response)

      if (reset || pageNum === 1) {
        setCustomers(response.customers)
      } else {
        setCustomers(prev => [...prev, ...response.customers])
      }
      
      setTotal(response.total)
      setHasMore(response.hasMore)
      setPage(pageNum)
    } catch (error) {
      console.error("Error loading customers:", error)
      addToast({ title: "Error", description: `Failed to load customers: ${error instanceof Error ? error.message : 'Unknown error'}`, type: "error" })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadCustomers(1, true)
  }, [filters])

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }

  const handleFilter = (newFilters: { riskBand?: string; ltvTier?: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleLoadMore = () => {
    loadCustomers(page + 1, false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage and analyze customer data
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          {currentSegment && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {getSegmentDisplayName(currentSegment)}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {currentSegment 
            ? `Viewing customers from segment: ${getSegmentDisplayName(currentSegment)}`
            : "Manage and analyze customer data"
          }
        </p>
      </div>

      <CustomersTable
        customers={customers}
        total={total}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onSearch={handleSearch}
        onFilter={handleFilter}
        loading={loadingMore}
      />
    </div>
  )
}
