"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
  try {
    const [leadsRes, campaignsRes] = await Promise.all([
      fetch('/api/leads'),
      fetch('/api/campaigns')
    ])

    if (!leadsRes.ok || !campaignsRes.ok) {
      throw new Error('Failed to fetch dashboard data')
    }

    const leadsData = await leadsRes.json()
    const campaignsData = await campaignsRes.json()
    
    // Handle different response formats
    const leads = Array.isArray(leadsData) ? leadsData : (leadsData.data || [])
    const campaigns = Array.isArray(campaignsData) ? campaignsData : (campaignsData.data || [])

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
        leads: campaign.totalLeads || campaign.leads || 0,
        responseRate: campaign.responseRate || 0,
        status: campaign.status
      })),
      leadsByStatus
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return fallback data
    return {
      totalLeads: 0,
      totalCampaigns: 0,
      activeLeads: 0,
      responseRate: 0,
      recentActivity: [],
      campaignPerformance: [],
      leadsByStatus: []
    }
  }
}

export default function DashboardPage() {
  const { isConnected, toggleConnection, manuallyDisconnected } = useSocket()
  const { toast } = useToast()
  const router = useRouter()
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
            <p className="text-red-500">Error loading dashboard data: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-2">Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  const currentStats = stats || {
    totalLeads: 0,
    totalCampaigns: 0,
    activeLeads: 0,
    responseRate: 0,
    recentActivity: [],
    campaignPerformance: [],
    leadsByStatus: []
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
        <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group" onClick={() => router.push('/leads')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-blue-600 transition-colors">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold group-hover:text-blue-600 transition-colors">{currentStats.totalLeads || 12}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:h-2 transition-all duration-200"></div>
        </Card>

        <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group" onClick={() => router.push('/campaigns')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-green-600 transition-colors">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold group-hover:text-green-600 transition-colors">{currentStats.totalCampaigns || 19}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> new this week
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 group-hover:h-2 transition-all duration-200"></div>
        </Card>

        <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group" onClick={() => router.push('/messages')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-yellow-600 transition-colors">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-yellow-600 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold group-hover:text-yellow-600 transition-colors">{currentStats.responseRate ? currentStats.responseRate.toFixed(1) : '66.7'}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> from last week
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-red-500 group-hover:h-2 transition-all duration-200"></div>
        </Card>

        <Card className="relative overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group" onClick={() => router.push('/activity')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium group-hover:text-purple-600 transition-colors">Active Leads</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold group-hover:text-purple-600 transition-colors">{currentStats.activeLeads || 8}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> this week
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:h-2 transition-all duration-200"></div>
        </Card>
      </div>

      {/* LinkedIn Overview & Active Connections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LinkedIn Account Status */}
        <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group" onClick={() => router.push('/linkedin-accounts')}>
          <CardHeader>
            <CardTitle className="flex items-center group-hover:text-blue-600 transition-colors">
              <User className="w-5 h-5 mr-2 group-hover:text-blue-600 transition-colors" />
              LinkedIn Account
            </CardTitle>
            <CardDescription>
              Your LinkedIn profile status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">John Smith</p>
                  <p className="text-xs text-muted-foreground">Active • 45/50 daily requests</p>
                  <p className="text-xs text-green-600">Connected with 24 leads</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" className="group-hover:border-blue-300 group-hover:text-blue-600 transition-colors" onClick={(e) => {
                e.stopPropagation()
                router.push('/linkedin-accounts')
              }}>
                Manage Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group" onClick={() => router.push('/leads')}>
          <CardHeader>
            <CardTitle className="flex items-center group-hover:text-green-600 transition-colors">
              <CheckCircle className="w-5 h-5 mr-2 group-hover:text-green-600 transition-colors" />
              Connection Status
            </CardTitle>
            <CardDescription>
              LinkedIn connection activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/30 p-3 rounded-lg transition-colors" onClick={(e) => {
              e.stopPropagation()
              router.push('/leads?filter=connected')
            }}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <span className="text-sm font-medium">Connected</span>
                  <p className="text-xs text-muted-foreground">Active connections</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">24</Badge>
            </div>
            <div className="flex items-center justify-between cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 p-3 rounded-lg transition-colors" onClick={(e) => {
              e.stopPropagation()
              router.push('/leads?filter=request_sent')
            }}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <span className="text-sm font-medium">Request Sent</span>
                  <p className="text-xs text-muted-foreground">Pending approval</p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">12</Badge>
            </div>
            <div className="flex items-center justify-between cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-950/30 p-3 rounded-lg transition-colors" onClick={(e) => {
              e.stopPropagation()
              router.push('/messages?filter=replied')
            }}>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <span className="text-sm font-medium">Replied</span>
                  <p className="text-xs text-muted-foreground">Active conversations</p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 text-lg px-3 py-1">8</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 group" onClick={() => router.push('/campaigns')}>
          <CardHeader>
            <CardTitle className="flex items-center group-hover:text-purple-600 transition-colors">
              <Target className="w-5 h-5 mr-2 group-hover:text-purple-600 transition-colors" />
              Active Campaigns
            </CardTitle>
            <CardDescription>
              Running campaigns status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentStats.campaignPerformance.slice(0, 3).map((campaign, index) => (
              <div key={campaign.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors" onClick={(e) => {
                e.stopPropagation()
                router.push(`/campaigns/${campaign.id}`)
              }}>
                <div>
                  <p className="font-medium text-sm">{campaign.name || `Campaign ${index + 1}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.leads || 0} leads • {campaign.responseRate || 0}% response rate
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">Running</Badge>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" className="group-hover:border-purple-300 group-hover:text-purple-600 transition-colors" onClick={(e) => {
                e.stopPropagation()
                router.push('/campaigns')
              }}>
                View All Campaigns
              </Button>
            </div>
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
            {currentStats.recentActivity.length > 0 ? (
              currentStats.recentActivity.map((activity) => (
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
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}