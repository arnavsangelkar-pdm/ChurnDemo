"use client"

import { useAppStore } from "@/lib/store"
import { KPICard } from "@/components/dashboard/kpi-card"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { 
  Users, 
  TrendingDown, 
  DollarSign, 
  TrendingUp,
  BarChart3,
  LineChart,
  PieChart
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts"

// Mock chart data
const churnRiskByCohort = [
  { cohort: "Q1 2023", risk: 15.2 },
  { cohort: "Q2 2023", risk: 12.8 },
  { cohort: "Q3 2023", risk: 18.5 },
  { cohort: "Q4 2023", risk: 14.1 },
  { cohort: "Q1 2024", risk: 11.9 },
]

const riskOverTime = [
  { week: "Week 1", risk: 12.3 },
  { week: "Week 2", risk: 11.8 },
  { week: "Week 3", risk: 13.1 },
  { week: "Week 4", risk: 12.9 },
  { week: "Week 5", risk: 11.5 },
  { week: "Week 6", risk: 10.8 },
  { week: "Week 7", risk: 12.1 },
  { week: "Week 8", risk: 11.9 },
  { week: "Week 9", risk: 10.5 },
  { week: "Week 10", risk: 9.8 },
  { week: "Week 11", risk: 11.2 },
  { week: "Week 12", risk: 10.9 },
]

const offerMix = [
  { type: "Discount", count: 45, percentage: 35 },
  { type: "Loyalty", count: 32, percentage: 25 },
  { type: "Content", count: 28, percentage: 22 },
  { type: "CS Outreach", count: 23, percentage: 18 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function DashboardPage() {
  const { kpis } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor churn risk and retention performance in real-time
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="At-Risk Customers"
          value={kpis.atRiskCustomers.toLocaleString()}
          change={-2.3}
          changeLabel="vs last month"
          icon={<Users className="h-4 w-4" />}
          trend="up"
        />
        <KPICard
          title="Predicted Churn Rate"
          value={formatPercentage(kpis.predictedChurnRate)}
          change={-1.2}
          changeLabel="vs last month"
          icon={<TrendingDown className="h-4 w-4" />}
          trend="up"
        />
        <KPICard
          title="30d Retained Revenue"
          value={formatCurrency(kpis.retainedRevenue30d)}
          change={5.7}
          changeLabel="vs last month"
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
        />
        <KPICard
          title="Avg. Treatment Effect"
          value={formatPercentage(kpis.avgTreatmentEffect)}
          change={2.1}
          changeLabel="vs last month"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Churn Risk by Cohort</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={churnRiskByCohort}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Risk']} />
                <Bar dataKey="risk" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Risk Over Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={riskOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Risk']} />
                <Line 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Offer Mix</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={offerMix}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }: any) => `${type} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {offerMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
