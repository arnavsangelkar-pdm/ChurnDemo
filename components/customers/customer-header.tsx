"use client"

import { Customer } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, getRiskColor, getLTVTierColor } from "@/lib/utils"
import { Play, Mail, Phone, MapPin } from "lucide-react"

interface CustomerHeaderProps {
  customer: Customer
  onTriggerPlay: () => void
}

export function CustomerHeader({ customer, onTriggerPlay }: CustomerHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              {customer.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt={customer.name}
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <span className="text-2xl font-medium">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{customer.name}</h1>
              <p className="text-muted-foreground">{customer.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getRiskColor(customer.riskBand)}>
                  {customer.riskBand} Risk
                </Badge>
                <Badge className={getLTVTierColor(customer.ltvTier)}>
                  {customer.ltvTier}
                </Badge>
              </div>
            </div>
          </div>
          <Button onClick={onTriggerPlay} className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Trigger Play</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{customer.riskScore}</div>
            <div className="text-sm text-muted-foreground">Risk Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(customer.ltv)}</div>
            <div className="text-sm text-muted-foreground">Lifetime Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{customer.totalOrders}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatCurrency(customer.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Email Engagement</div>
              <div className="text-sm text-muted-foreground">
                {(customer.emailEngagement.openRate * 100).toFixed(1)}% open, {(customer.emailEngagement.clickRate * 100).toFixed(1)}% click
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Location</div>
              <div className="text-sm text-muted-foreground">
                {customer.location.city}, {customer.location.state}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 text-muted-foreground">📅</div>
            <div>
              <div className="text-sm font-medium">First Purchase</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(customer.firstPurchaseAt)}
              </div>
            </div>
          </div>
        </div>

        {customer.tags.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {customer.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
