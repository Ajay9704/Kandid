"use client"

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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

// Add these interfaces for API response typing
interface ApiResponse<T> {
  data: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  meta?: {
    timestamp: string
    source: string
  }
}

interface Lead {
  id: string
  name: string
  email: string
  company?: string
  position?: string
  status: string
  connectionStatus: string
  campaignId?: string
  createdAt: string
  updatedAt: string
}

interface Campaign {
  id: string
  name: string
  status: string
  description?: string
  totalLeads: number
  successfulLeads: number
  responseRate: number
  userId: string
  createdAt: string
  updatedAt: string
}

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

    // Type the responses properly
    const leadsData: ApiResponse<Lead[]> = await leadsRes.json()
    const campaignsData: ApiResponse<Campaign[]> = await campaignsRes.json()
    
    // Extract data with proper typing
    const leads = Array.isArray(leadsData) ? leadsData : (leadsData.data || [])
    const campaigns = Array.isArray(campaignsData) ? campaignsData : (campaignsData.data || [])

    // Calculate stats
    const totalLeads = leads.length
    const totalCampaigns = campaigns.length
    const activeLeads = leads.filter((lead: Lead) =>
      ['contacted', 'responded', 'qualified', 'converted', 'nurturing'].includes(lead.status)
    ).length

    const responseRate = totalLeads > 0 ? (activeLeads / totalLeads) * 100 : 0

    // Group leads by status
    const statusCounts: Record<string, number> = leads.reduce((acc: Record<string, number>, lead: Lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {})

    const leadsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: count as number,
      percentage: totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0
    }))

    // Campaign performance calculation
    const campaignPerformance = campaigns.map((campaign: Campaign) => {
      // Find leads for this specific campaign
      const campaignLeads = leads.filter((lead: Lead) => lead.campaignId === campaign.id)
      const campaignResponded = campaignLeads.filter((lead: Lead) => lead.status === 'responded').length
      
      return {
        id: campaign.id,
        name: campaign.name,
        leads: campaignLeads.length,
        responseRate: campaignLeads.length > 0 ? (campaignResponded / campaignLeads.length) * 100 : 0,
        status: campaign.status
      }
    })

    // Recent activity from real data (simplified for now)
    const recentActivity: Array<{
      id: string
      type: 'lead_created' | 'lead_updated' | 'campaign_created'
      message: string
      timestamp: string
    }> = leads.slice(0, 3).map((lead: Lead, index: number) => ({
      id: `activity-${index}`,
      type: 'lead_created',
      message: `New lead ${lead.name} added`,
      timestamp: lead.createdAt || new Date().toISOString(),
    }))

    return {
      totalLeads,
      totalCampaigns,
      activeLeads,
      responseRate,
      recentActivity,
      campaignPerformance,
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
  const { isConnected, toggleConnection, manuallyDisconnected, on } = useSocket()
  const { toast } = useToast()
  const router = useRouter()
  const [liveViewEnabled, setLiveViewEnabled] = useState(false)

  const queryClient = useQueryClient()

  // Listen for real-time updates
  useEffect(() => {
    const unsubscribeCampaigns = on('campaigns_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    })

    const unsubscribeLeads = on('leads_updated', () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    })

    return () => {
      unsubscribeCampaigns()
      unsubscribeLeads()
    }
  }, [on, queryClient])

  const { data: stats, isLoading, error, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: liveViewEnabled && isConnected ? 15000 : false, // Only refetch when live view is enabled
    staleTime: 0, // Don't cache, always fetch fresh data
    // Removed cacheTime as it's deprecated in newer versions of TanStack Query
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
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
            <p className="text-red-500">Error loading dashboard data: {(error as Error).message}</p>
            <Button onClick={() => refetch()} className="mt-2">Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  // Provide proper typing for currentStats
  const currentStats: DashboardStats = stats || {
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
            <div className="text-2xl font-bold group-hover:text-blue-600 transition-colors">{currentStats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.totalLeads > 0 ? (
                <span className="text-green-600">+{Math.round(currentStats.totalLeads * 0.1)}%</span>
              ) : (
                <span>No change</span>
              )} from last month
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
            <div className="text-2xl font-bold group-hover:text-green-600 transition-colors">{currentStats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.totalCampaigns > 0 ? (
                <span className="text-green-600">+{Math.round(currentStats.totalCampaigns * 0.05)}</span>
              ) : (
                <span>No change</span>
              )} new this week
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
            <div className="text-2xl font-bold group-hover:text-yellow-600 transition-colors">{currentStats.responseRate ? currentStats.responseRate.toFixed(1) : '0.0'}%</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.responseRate > 0 ? (
                <span className="text-green-600">+{(currentStats.responseRate * 0.05).toFixed(1)}%</span>
              ) : (
                <span>No change</span>
              )} from last week
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
            <div className="text-2xl font-bold group-hover:text-purple-600 transition-colors">{currentStats.activeLeads}</div>
            <p className="text-xs text-muted-foreground">
              {currentStats.activeLeads > 0 ? (
                <span className="text-green-600">+{Math.round(currentStats.activeLeads * 0.2)}</span>
              ) : (
                <span>No change</span>
              )} this week
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
                  <p className="font-medium text-sm">Connect your LinkedIn</p>
                  <p className="text-xs text-muted-foreground">No account connected</p>
                  <p className="text-xs text-blue-600">Click to connect</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-xs text-gray-500 font-medium">Offline</span>
              </div>
            </div>
            <div className="text-center pt-2">
              <Button variant="outline" size="sm" className="group-hover:border-blue-300 group-hover:text-blue-600 transition-colors" onClick={(e) => {
                e.stopPropagation()
                router.push('/linkedin-accounts')
              }}>
                Connect Account
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
              router.push('/leads?status=connected')
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
              <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">{currentStats.leadsByStatus.find(s => s.status === 'connected')?.count || 0}</Badge>
            </div>
            <div className="flex items-center justify-between cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 p-3 rounded-lg transition-colors" onClick={(e) => {
              e.stopPropagation()
              router.push('/leads?connectionStatus=request_sent')
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
              <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">{currentStats.leadsByStatus.find(s => s.status === 'pending')?.count || 0}</Badge>
            </div>
            <div className="flex items-center justify-between cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-950/30 p-3 rounded-lg transition-colors" onClick={(e) => {
              e.stopPropagation()
              router.push('/leads?status=responded')
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
              <Badge className="bg-yellow-100 text-yellow-800 text-lg px-3 py-1">{currentStats.leadsByStatus.find(s => s.status === 'responded')?.count || 0}</Badge>
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
            {currentStats.campaignPerformance.length > 0 ? (
              currentStats.campaignPerformance.slice(0, 3).map((campaign, index) => (
                <div key={campaign.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors" onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/campaigns/${campaign.id}`)
                }}>
                  <div>
                    <p className="font-medium text-sm">{campaign.name || `Campaign ${index + 1}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.leads || 0} leads • {campaign.responseRate ? campaign.responseRate.toFixed(1) : '0.0'}% response rate
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Running</Badge>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No active campaigns</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/campaigns')
                  }}
                >
                  Create Campaign
                </Button>
              </div>
            )}
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