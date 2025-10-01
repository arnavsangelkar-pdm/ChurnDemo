"use client"

import { useState } from "react"
import { Customer } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency, formatDate, getRiskColor, getLTVTierColor } from "@/lib/utils"
import { Search, Filter, Eye, Play } from "lucide-react"
import Link from "next/link"

interface CustomersTableProps {
  customers: Customer[]
  total: number
  hasMore: boolean
  onLoadMore: () => void
  onSearch: (search: string) => void
  onFilter: (filters: { riskBand?: string; ltvTier?: string }) => void
  loading?: boolean
}

export function CustomersTable({
  customers,
  total,
  hasMore,
  onLoadMore,
  onSearch,
  onFilter,
  loading = false
}: CustomersTableProps) {
  const [search, setSearch] = useState("")
  const [riskFilter, setRiskFilter] = useState<string | undefined>(undefined)
  const [ltvFilter, setLtvFilter] = useState<string | undefined>(undefined)

  const handleSearch = (value: string) => {
    setSearch(value)
    onSearch(value)
  }

  const handleRiskFilter = (value: string) => {
    setRiskFilter(value)
    onFilter({ riskBand: value === "all" ? undefined : value, ltvTier: ltvFilter === "all" ? undefined : ltvFilter })
  }

  const handleLtvFilter = (value: string) => {
    setLtvFilter(value)
    onFilter({ riskBand: riskFilter === "all" ? undefined : riskFilter, ltvTier: value === "all" ? undefined : value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers ({total.toLocaleString()})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={riskFilter} onValueChange={handleRiskFilter}>
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
            <Select value={ltvFilter} onValueChange={handleLtvFilter}>
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
                <TableHead>Customer</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>LTV</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead>Email Engagement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
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
                      {customer.lastPurchaseAt ? formatDate(customer.lastPurchaseAt) : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Open: {(customer.emailEngagement.openRate * 100).toFixed(1)}%</div>
                      <div>Click: {(customer.emailEngagement.clickRate * 100).toFixed(1)}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/customers/${customer.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {hasMore && (
          <div className="mt-4 text-center">
            <Button onClick={onLoadMore} disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
