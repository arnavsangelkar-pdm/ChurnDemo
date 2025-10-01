"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  description?: string
  trend?: "up" | "down" | "neutral"
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  description,
  trend = "neutral"
}: KPICardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-1 text-xs">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-green-600" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-red-600" />}
            <span className={cn(
              "font-medium",
              isPositive && "text-green-600",
              isNegative && "text-red-600"
            )}>
              {change > 0 ? "+" : ""}{change}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground">vs last month</span>
            )}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
