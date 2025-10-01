"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"
import { 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Users, 
  TestTube,
  Activity
} from "lucide-react"

const activityIcons = {
  risk_detected: AlertTriangle,
  play_triggered: Target,
  customer_engaged: Users,
  revenue_impact: TrendingUp,
  experiment_started: TestTube,
}

const activityColors = {
  risk_detected: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
  play_triggered: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
  customer_engaged: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950",
  revenue_impact: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950",
  experiment_started: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
}

export function ActivityFeed() {
  const { activityFeed } = useAppStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Live Activity Feed</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityFeed.slice(0, 10).map((event) => {
            const Icon = activityIcons[event.type]
            const colorClass = activityColors[event.type]
            
            return (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  colorClass
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {event.message}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {event.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(event.occurredAt)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
