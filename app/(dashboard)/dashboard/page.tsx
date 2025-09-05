"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  User,
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
  const { isConnected, toggleConnection, manuallyDisconnected } = useSocket()
  const { toast } = useToast()
  const [liveViewEnabled, setLiveViewEnabled] = useState(false)
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: liveViewEnabled && isConnected ? 15000 : false, // Only refetch when live view is enabled
    staleTime: 5000, // Consider data fresh for 5 seconds
  })

  useEffect(() => {
    // Simulate real-time updates for demo purposes
    if (isConnected && liveViewEnabled) {
      const interval = setInterval(() => {
        // Show periodic updates when live view is enabled
        if (Math.random() > 0.8) {
          const updates = [
            "New lead added to pipeline",
            "Campaign response received",
            "Lead status updated",
            "Dashboard metrics refreshed"
          ]
          const randomUpdate = updates[Math.floor(Math.random() * updates.length)]
          
          toast({
            title: "Live Update",
            description: randomUpdate,
          })
          refetch()
        }
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [isConnected, liveViewEnabled, toast, refetch])

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
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-muted/50">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Online' : 'Offline'}
            </span>
            {manuallyDisconnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleConnection}
                className="h-6 px-2 text-xs"
              >
                Connect
              </Button>
            )}
          </div>
          <Button 
            variant={liveViewEnabled ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              if (!isConnected && !liveViewEnabled) {
                toast({
                  title: "Connection Required",
                  description: "Please connect to enable live view.",
                  variant: "destructive",
                })
                return
              }
              setLiveViewEnabled(!liveViewEnabled)
              toast({
                title: liveViewEnabled ? "Live View Disabled" : "Live View Enabled",
                description: liveViewEnabled 
                  ? "Real-time updates have been disabled" 
                  : "Dashboard will now update in real-time",
              })
            }}
            disabled={!isConnected}
          >
            <Activity className={`w-4 h-4 mr-2 ${liveViewEnabled && isConnected ? 'animate-pulse' : ''}`} />
            {liveViewEnabled ? 'Live View On' : 'Live View'}
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

      {/* LinkedIn Overview & Active Connections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LinkedIn Accounts Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              LinkedIn Accounts
            </CardTitle>
            <CardDescription>
              Active LinkedIn profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">John Smith</p>
                  <p className="text-xs text-muted-foreground">Active • 45/50 daily</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">Paused • 0/50 daily</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        {/* Active Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Active Connections
            </CardTitle>
            <CardDescription>
              Recent connection activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm">Accepted</span>
              </div>
              <Badge className="bg-green-100 text-green-800">24</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm">Pending</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Mail className="w-3 h-3 text-yellow-600" />
                </div>
                <span className="text-sm">Replied</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">8</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Active Campaigns
            </CardTitle>
            <CardDescription>
              Running campaigns status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentStats?.campaignPerformance.filter(c => c.status === 'active').slice(0, 3).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-sm">{campaign.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.leads} leads • {campaign.responseRate.toFixed(1)}% response
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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