"use client"

import { RouteGuard } from "@/components/route-guard"
import { AppLayout } from "@/components/layout/app-layout"

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard>
      <AppLayout>
        {children}
      </AppLayout>
    </RouteGuard>
  )
}
