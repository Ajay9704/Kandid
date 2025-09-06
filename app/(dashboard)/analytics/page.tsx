"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  MessageSquare,
  Linkedin,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalLeads: number
    totalCampaigns: number
    connectionRate: number
    responseRate: number
    conversionRate: number
    avgResponseTime: number
  }
  trends: {
    leadsThisWeek: number
    leadsLastWeek: number
    connectionsThisWeek: number
    connectionsLastWeek: number
    responsesThisWeek: number
    responsesLastWeek: number
  }
  campaignPerformance: Array<{
    id: string
    name: string
    leads: number
    connections: number
    responses: number
    connectionRate: number
    responseRate: number
    status: string
  }>
  leadsByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  connectionsByStatus: Array<{
    status: string
    count: number
    percentage: number
  }>
  timeAnalysis: {
    bestDaysToConnect: Array<{ day: string; rate: number }>
    bestTimesToConnect: Array<{ hour: string; rate: number }>
    avgTimeToResponse: number
  }
}

async function fetchAnalytics(): Promise<AnalyticsData> {
  // Simulate API call - in real app, this would fetch from your analytics endpoint
  const [leadsRes, campaignsRes] = await Promise.all([
    fetch('/api/leads'),
    fetch('/api/campaigns')
  ])

  if (!leadsRes.ok || !campaignsRes.ok) {
    throw new Error('Failed to fetch analytics data')
  }

  const leads = await leadsRes.json()
  const campaigns = await campaignsRes.json()

  // Calculate analytics
  const totalLeads = leads.length
  const totalCampaigns = campaigns.length
  const connectedLeads = leads.filter((lead: any) => lead.connectionStatus === 'connected').length
  const respondedLeads = leads.filter((lead: any) => lead.status === 'responded').length
  const convertedLeads = leads.filter((lead: any) => lead.status === 'converted').length

  const connectionRate = totalLeads > 0 ? (connectedLeads / totalLeads) * 100 : 0
  const responseRate = connectedLeads > 0 ? (respondedLeads / connectedLeads) * 100 : 0
  const conversionRate = respondedLeads > 0 ? (convertedLeads / respondedLeads) * 100 : 0

  // Mock trend data
  const trends = {
    leadsThisWeek: Math.floor(totalLeads * 0.3),
    leadsLastWeek: Math.floor(totalLeads * 0.25),
    connectionsThisWeek: Math.floor(connectedLeads * 0.4),
    connectionsLastWeek: Math.floor(connectedLeads * 0.35),
    responsesThisWeek: Math.floor(respondedLeads * 0.5),
    responsesLastWeek: Math.floor(respondedLeads * 0.4),
  }

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

  // Group leads by connection status
  const connectionCounts = leads.reduce((acc: any, lead: any) => {
    acc[lead.connectionStatus || 'not_connected'] = (acc[lead.connectionStatus || 'not_connected'] || 0) + 1
    return acc
  }, {})

  const connectionsByStatus = Object.entries(connectionCounts).map(([status, count]) => ({
    status,
    count: count as number,
    percentage: totalLeads > 0 ? ((count as number) / totalLeads) * 100 : 0
  }))

  return {
    overview: {
      totalLeads,
      totalCampaigns,
      connectionRate,
      responseRate,
      conversionRate,
      avgResponseTime: 2.4 // hours
    },
    trends,
    campaignPerformance: campaigns.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      leads: campaign.totalLeads || Math.floor(Math.random() * 50) + 10,
      connections: Math.floor(Math.random() * 30) + 5,
      responses: Math.floor(Math.random() * 20) + 2,
      connectionRate: Math.floor(Math.random() * 40) + 40,
      responseRate: Math.floor(Math.random() * 30) + 50,
      status: campaign.status
    })),
    leadsByStatus,
    connectionsByStatus,
    timeAnalysis: {
      bestDaysToConnect: [
        { day: 'Tuesday', rate: 78 },
        { day: 'Wednesday', rate: 75 },
        { day: 'Thursday', rate: 72 },
        { day: 'Monday', rate: 68 },
        { day: 'Friday', rate: 65 }
      ],
      bestTimesToConnect: [
        { hour: '9-10 AM', rate: 82 },
        { hour: '10-11 AM', rate: 79 },
        { hour: '2-3 PM', rate: 76 },
        { hour: '3-4 PM', rate: 73 },
        { hour: '11-12 PM', rate: 70 }
      ],
      avgTimeToResponse: 2.4
    }
  }
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
  qualified: 'bg-green-100 text-green-800',
  nurturing: 'bg-orange-100 text-orange-800',
}

const connectionStatusColors = {
  not_connected: 'bg-gray-100 text-gray-800',
  request_sent: 'bg-blue-100 text-blue-800',
  connected: 'bg-green-100 text-green-800',
  request_received: 'bg-yellow-100 text-yellow-800',
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: fetchAnalytics,
    staleTime: 30000, // Consider data fresh for 30 seconds
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Loading analytics...</p>
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
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-red-500">Error loading analytics data</p>
          </div>
        </div>
      </div>
    )
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0
    return Math.round(((current - previous) / previous) * 100)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your LinkedIn outreach performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection Rate</CardTitle>
            <Linkedin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.connectionRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics?.trends.connectionsThisWeek || 0, analytics?.trends.connectionsLastWeek || 0)}
              <span className={getTrendPercentage(analytics?.trends.connectionsThisWeek || 0, analytics?.trends.connectionsLastWeek || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(getTrendPercentage(analytics?.trends.connectionsThisWeek || 0, analytics?.trends.connectionsLastWeek || 0))}% from last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.responseRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics?.trends.responsesThisWeek || 0, analytics?.trends.responsesLastWeek || 0)}
              <span className={getTrendPercentage(analytics?.trends.responsesThisWeek || 0, analytics?.trends.responsesLastWeek || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(getTrendPercentage(analytics?.trends.responsesThisWeek || 0, analytics?.trends.responsesLastWeek || 0))}% from last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              From responses to qualified leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              Average time to first response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="timing">Best Times</TabsTrigger>
          <TabsTrigger value="breakdown">Status Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of leads by current status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.leadsByStatus.map((item) => (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={statusColors[item.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                        <span className="text-sm font-medium">{item.count} leads</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Connection Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Connection Status Distribution</CardTitle>
                <CardDescription>
                  LinkedIn connection status breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.connectionsByStatus.map((item) => (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={connectionStatusColors[item.status as keyof typeof connectionStatusColors] || 'bg-gray-100 text-gray-800'}>
                          {item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <span className="text-sm font-medium">{item.count} leads</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Detailed performance metrics for each campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.campaignPerformance.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.leads} total leads</p>
                      </div>
                      <Badge className={campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{campaign.connections}</div>
                        <div className="text-xs text-muted-foreground">Connections</div>
                        <div className="text-xs text-blue-600">{campaign.connectionRate}% rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{campaign.responses}</div>
                        <div className="text-xs text-muted-foreground">Responses</div>
                        <div className="text-xs text-green-600">{campaign.responseRate}% rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{Math.floor(campaign.responses * 0.6)}</div>
                        <div className="text-xs text-muted-foreground">Qualified</div>
                        <div className="text-xs text-purple-600">{Math.floor(campaign.responseRate * 0.6)}% rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Best Days to Connect</CardTitle>
                <CardDescription>
                  Connection acceptance rates by day of week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.timeAnalysis.bestDaysToConnect.map((day) => (
                  <div key={day.day} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{day.day}</span>
                      <span className="text-sm text-muted-foreground">{day.rate}% acceptance rate</span>
                    </div>
                    <Progress value={day.rate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Times to Connect</CardTitle>
                <CardDescription>
                  Connection acceptance rates by time of day
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.timeAnalysis.bestTimesToConnect.map((time) => (
                  <div key={time.hour} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{time.hour}</span>
                      <span className="text-sm text-muted-foreground">{time.rate}% acceptance rate</span>
                    </div>
                    <Progress value={time.rate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Total Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.overview.totalLeads}</div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-2">
                  {getTrendIcon(analytics?.trends.leadsThisWeek || 0, analytics?.trends.leadsLastWeek || 0)}
                  <span>
                    {analytics?.trends.leadsThisWeek} this week vs {analytics?.trends.leadsLastWeek} last week
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Connected Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analytics?.connectionsByStatus.find(s => s.status === 'connected')?.count || 0}
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-2">
                  {getTrendIcon(analytics?.trends.connectionsThisWeek || 0, analytics?.trends.connectionsLastWeek || 0)}
                  <span>
                    {analytics?.trends.connectionsThisWeek} this week vs {analytics?.trends.connectionsLastWeek} last week
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Active Conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analytics?.leadsByStatus.find(s => s.status === 'responded')?.count || 0}
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-2">
                  {getTrendIcon(analytics?.trends.responsesThisWeek || 0, analytics?.trends.responsesLastWeek || 0)}
                  <span>
                    {analytics?.trends.responsesThisWeek} this week vs {analytics?.trends.responsesLastWeek} last week
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}