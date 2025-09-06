"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, User, Send, Eye, UserPlus, MessageSquare, LucideIcon } from 'lucide-react'

interface Activity {
  id: string
  activityType: string
  description: string
  leadName: string
  company: string
  createdAt: string
  icon: LucideIcon
  type?: string
  timestamp?: string
}

export default function ActivityPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await fetch('/api/activity')
      if (!response.ok) throw new Error('Failed to fetch activities')
      const data = await response.json()

      // Add mock data for demo if no real data
      if (data.length === 0) {
        return [
          {
            id: '1',
            activityType: 'connection_request_sent',
            description: 'Connection request sent to Sarah Johnson',
            leadName: 'Sarah Johnson',
            company: 'Tech Corp',
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            icon: UserPlus,
          },
          {
            id: '2',
            activityType: 'profile_viewed',
            description: 'Profile viewed by Mike Chen',
            leadName: 'Mike Chen',
            company: 'StartupXYZ',
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            icon: Eye,
          },
          {
            id: '3',
            activityType: 'message_sent',
            description: 'Follow-up message sent to John Smith',
            leadName: 'John Smith',
            company: 'Enterprise Inc',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            icon: Send,
          },
          {
            id: '4',
            activityType: 'connection_accepted',
            description: 'Connection request accepted by Lisa Wang',
            leadName: 'Lisa Wang',
            company: 'Innovation Labs',
            createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            icon: User,
          },
          {
            id: '5',
            activityType: 'message_replied',
            description: 'Message replied by David Brown',
            leadName: 'David Brown',
            company: 'Growth Co',
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            icon: MessageSquare,
          }
        ]
      }

      return data.map((activity: any) => ({
        ...activity,
        icon: activity.activityType === 'connection_request_sent' ? UserPlus :
          activity.activityType === 'profile_viewed' ? Eye :
            activity.activityType === 'message_sent' ? Send :
              activity.activityType === 'connection_accepted' ? User :
                MessageSquare
      }))
    },
    refetchInterval: 15000, // Refetch every 15 seconds for real-time updates
  })

  const filteredActivities = activities.filter((activity: Activity) =>
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'connection_request_sent': return 'bg-blue-100 text-blue-800'
      case 'connection_accepted': return 'bg-green-100 text-green-800'
      case 'message_sent': return 'bg-purple-100 text-purple-800'
      case 'message_replied': return 'bg-orange-100 text-orange-800'
      case 'profile_viewed': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatActivityType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">
            Track all interactions and activities with your leads
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Today</Button>
          <Button variant="outline" size="sm">This Week</Button>
          <Button variant="outline" size="sm">This Month</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search activities..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredActivities.map((activity: Activity) => {
                const IconComponent = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.activityType === 'connection_request_sent' ? 'bg-blue-100 dark:bg-blue-950/30' :
                        activity.activityType === 'connection_accepted' ? 'bg-green-100 dark:bg-green-950/30' :
                          activity.activityType === 'message_sent' ? 'bg-purple-100 dark:bg-purple-950/30' :
                            activity.activityType === 'message_replied' ? 'bg-orange-100 dark:bg-orange-950/30' :
                              'bg-yellow-100 dark:bg-yellow-950/30'
                        }`}>
                        <IconComponent className={`w-5 h-5 ${activity.activityType === 'connection_request_sent' ? 'text-blue-600' :
                          activity.activityType === 'connection_accepted' ? 'text-green-600' :
                            activity.activityType === 'message_sent' ? 'text-purple-600' :
                              activity.activityType === 'message_replied' ? 'text-orange-600' :
                                'text-yellow-600'
                          }`} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {activity.leadName && typeof activity.leadName === 'string' && activity.leadName.trim() ? 
                                activity.leadName.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase() : 'U'}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{activity.leadName || 'Unknown'}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {activity.company}
                        </Badge>
                        <Badge className={getActivityColor(activity.activityType)}>
                          {formatActivityType(activity.activityType)}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {activity.activityType === 'connection_request_sent' && 'Status: Pending approval • Sequence Step 1'}
                        {activity.activityType === 'connection_accepted' && 'Status: Connected • Ready for follow-up message'}
                        {activity.activityType === 'message_sent' && 'Status: Delivered • Follow-up scheduled in 3 days'}
                        {activity.activityType === 'message_replied' && 'Status: Replied • Lead marked as qualified'}
                        {activity.activityType === 'profile_viewed' && 'Status: Profile engagement • Connection opportunity'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}