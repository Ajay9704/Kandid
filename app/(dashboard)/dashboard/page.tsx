"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Target, 
  TrendingUp, 
  Mail,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useSocket } from '@/lib/hooks/use-socket'
import { useToast } from '@/lib/hooks/use-toast'

interface DashboardStats {
  totalLeads: number
  totalCampaigns: number
  activeLeads: number
  responseRate: number
  recentActivity: Array<{
    id: string
    type: 'lead_created' | 'lead_updated' | 'campaign_created'
    message: string
    timestamp: string
  }>
  campaignPerformance: Array<{
    id: string
    name: string
    leads: number
    responseRate: number
    status: string
  }>
  leadsByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const [leadsRes, campaignsRes] = await Promise.all([
    fetch('/api/leads'),
    fetch('/api/campaigns')
  ])
  
  if (!leadsRes.ok || !campaignsRes.ok) {
    throw new Error('Failed to fetch dashboard data')
  }
  
  const leads = await leadsRes.json()
  const campaigns = await campaignsRes.json()
  
  // Calculate stats
  const totalLeads = leads.length
  const totalCampaigns = campaigns.length
  const activeLeads = leads.filter((lead: any) => 
    ['contacted', 'responded', 'qualified'].includes(lead.status)
  ).length
  
  const responseRate = totalLeads > 0 ? (activeLeads / totalLeads) * 100 : 0
  
  // Group leads by status
  const statusCounts = leads.reduce((acc: any, lead: any) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1
    return acc
  }, {})
  
  const leadsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count: count as number,
    percentage: totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0
  }))
  
  // Recent activity (mock for now)
  const recentActivity = [
    {
      id: '1',
      type: 'lead_created' as const,
      message: 'New lead John Smith added to Q4 Campaign',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'lead_updated' as const,
      message: 'Sarah Johnson status updated to Qualified',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'campaign_created' as const,
      message: 'New campaign "Holiday Promotion" created',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ]
  
  return {
    totalLeads,
    totalCampaigns,
    activeLeads,
    responseRate,
    recentActivity,
    campaignPerformance: campaigns.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      leads: campaign.totalLeads,
      responseRate: campaign.responseRate,
      status: campaign.status
    })),
    leadsByStatus
  }
}

const statusColors = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  contacted: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Mail },
  responded: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
  qualified: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Target },
  nurturing: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Activity },
}

export default function DashboardPage() {
  const { isConnected } = useSocket()
  const { toast } = useToast()
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  useEffect(() => {
    // Simulate real-time updates for demo purposes
    if (isConnected) {
      const interval = setInterval(() => {
        // Occasionally show a demo notification
        if (Math.random() > 0.95) {
          toast({
            title: "Real-time Update",
            description: "Dashboard data refreshed",
          })
          refetch()
        }
      }, 10000)
      
      return () => clearInterval(interval)
    }
  }, [isConnected, toast, refetch])

  const currentStats = stats

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Loading your analytics...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-red-500">Error loading dashboard data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your leads.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Real-time connected' : 'Offline'}
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Live View
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats?.totalCampaigns || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> new this week
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats?.responseRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> from last week
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-red-500"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStats?.activeLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> this week
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Lead Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of leads by current status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStats?.leadsByStatus.map((item) => {
              const statusConfig = statusColors[item.status as keyof typeof statusColors] || statusColors.pending
              const IconComponent = statusConfig.icon
              
              return (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Progress value={item.percentage} className="w-20" />
                    <Badge className={`${statusConfig.bg} ${statusConfig.text}`}>
                      {item.count}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Campaign Performance
            </CardTitle>
            <CardDescription>
              Top performing campaigns this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStats?.campaignPerformance.slice(0, 5).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {campaign.leads} leads • {campaign.responseRate.toFixed(1)}% response rate
                  </p>
                </div>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest updates from your campaigns and leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentStats?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}