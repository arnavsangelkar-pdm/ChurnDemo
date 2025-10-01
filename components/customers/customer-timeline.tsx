"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, formatCurrency } from "@/lib/utils"
import { 
  ShoppingCart, 
  Eye, 
  Mail, 
  MessageSquare, 
  Star,
  MousePointer,
  Search,
  CreditCard
} from "lucide-react"

interface TimelineEvent {
  id: string
  type: 'transaction' | 'session' | 'email' | 'support' | 'review'
  occurredAt?: string
  createdAt?: string
  purchasedAt?: string
  [key: string]: any
}

interface CustomerTimelineProps {
  events: TimelineEvent[]
}

const eventIcons = {
  transaction: ShoppingCart,
  session: Eye,
  email: Mail,
  support: MessageSquare,
  review: Star,
}

const eventColors = {
  transaction: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950",
  session: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
  email: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950",
  support: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950",
  review: "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950",
}

export function CustomerTimeline({ events }: CustomerTimelineProps) {
  const getEventIcon = (event: TimelineEvent) => {
    if (event.type === 'session') {
      switch ((event as any).type) {
        case 'page_view': return Eye
        case 'product_view': return Eye
        case 'add_to_cart': return ShoppingCart
        case 'checkout_start': return CreditCard
        case 'rage_click': return MousePointer
        case 'search': return Search
        default: return Eye
      }
    }
    return eventIcons[event.type] || Eye
  }

  const getEventDescription = (event: TimelineEvent) => {
    switch (event.type) {
      case 'transaction':
        return `Order ${event.orderId} - ${formatCurrency(event.subtotal)}`
      case 'session':
        return `${event.type.replace('_', ' ')} on ${event.metadata?.page || 'unknown page'}`
      case 'email':
        return `${event.type} - ${event.campaign}`
      case 'support':
        return `${event.subject} (${event.status})`
      case 'review':
        return `${event.rating} stars for ${event.product}`
      default:
        return 'Unknown event'
    }
  }

  const getEventTime = (event: TimelineEvent) => {
    const time = event.occurredAt || event.createdAt || event.purchasedAt
    return time ? formatDateTime(time) : 'Unknown time'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No timeline events found
            </div>
          ) : (
            events.map((event) => {
              const Icon = getEventIcon(event)
              const colorClass = eventColors[event.type]
              
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
                      {getEventDescription(event)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getEventTime(event)}
                      </span>
                    </div>
                    {event.type === 'transaction' && event.items && (
                      <div className="text-xs text-muted-foreground">
                        {event.items.length} item(s)
                      </div>
                    )}
                    {event.type === 'review' && event.text && (
                      <div className="text-xs text-muted-foreground">
                        "{event.text}"
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
