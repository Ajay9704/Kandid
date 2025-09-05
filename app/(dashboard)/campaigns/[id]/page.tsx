"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Settings, 
  Play, 
  Pause,
  User,
  Linkedin,
  Mail,
  Eye
} from 'lucide-react'

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id

  const [campaign] = useState({
    id: campaignId,
    name: 'Q4 Outreach Campaign',
    status: 'active',
    description: 'Targeting tech executives for our new product launch',
    totalLeads: 150,
    successfulLeads: 45,
    responseRate: 30.0,
    createdAt: '2024-01-01T00:00:00Z',
  })

  const [sequences] = useState([
    {
      id: '1',
      stepNumber: 1,
      stepType: 'connection_request',
      title: 'Connection Request',
      content: 'Hi {firstName}, I noticed we both work in the tech industry and thought it would be great to connect!',
      delayDays: 0,
      isActive: true,
    },
    {
      id: '2',
      stepNumber: 2,
      stepType: 'follow_up_message',
      title: 'Follow-up Message 1',
      content: 'Thanks for connecting! I wanted to share some insights about {industry} trends...',
      delayDays: 3,
      isActive: true,
    },
    {
      id: '3',
      stepNumber: 3,
      stepType: 'follow_up_message',
      title: 'Follow-up Message 2',
      content: 'I hope you found the previous insights valuable. I\'d love to discuss how we can help {company}...',
      delayDays: 7,
      isActive: true,
    }
  ])

  const [leads] = useState([
    {
      id: '1',
      name: 'Sarah Johnson',
      company: 'Tech Corp',
      position: 'VP of Engineering',
      connectionStatus: 'connected',
      sequenceStep: 2,
      lastActivity: 'Connection accepted',
      lastActivityDate: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Mike Chen',
      company: 'StartupXYZ',
      position: 'CTO',
      connectionStatus: 'request_sent',
      sequenceStep: 1,
      lastActivity: 'Connection request sent',
      lastActivityDate: '2024-01-14T09:15:00Z',
    }
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.description}</p>
        </div>
        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
          {campaign.status}
        </Badge>
        <Button variant="outline">
          {campaign.status === 'active' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {campaign.status === 'active' ? 'Pause' : 'Resume'}
        </Button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.successfulLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.responseRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(campaign.successfulLeads / campaign.totalLeads) * 100} className="w-full" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="sequence">Sequence</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Connection Requests Sent</span>
                  <span className="font-semibold">120</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Connections Accepted</span>
                  <span className="font-semibold">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Messages Sent</span>
                  <span className="font-semibold">30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Replies Received</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Campaign Leads ({leads.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{lead.name}</h3>
                        <p className="text-sm text-muted-foreground">{lead.position} at {lead.company}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              lead.connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                              lead.connectionStatus === 'request_sent' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {lead.connectionStatus === 'connected' ? 'Connected' :
                             lead.connectionStatus === 'request_sent' ? 'Request Sent' :
                             'Not Connected'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {lead.sequenceStep === 1 ? 'Connection Request' :
                             lead.sequenceStep === 2 ? 'Follow-up 1' :
                             lead.sequenceStep === 3 ? 'Follow-up 2' :
                             `Step ${lead.sequenceStep}`}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {lead.lastActivity} • {new Date(lead.lastActivityDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-3">
                        <div className="text-xs text-muted-foreground">
                          {lead.connectionStatus === 'connected' && lead.sequenceStep === 2 ? 'Ready for follow-up' :
                           lead.connectionStatus === 'request_sent' ? 'Pending approval' :
                           lead.sequenceStep === 3 ? 'Final follow-up sent' :
                           'In progress'}
                        </div>
                        <div className="text-xs font-medium">
                          {new Date(lead.lastActivityDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="LinkedIn Profile">
                        <Linkedin className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Send Message">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                LinkedIn Outreach Sequence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sequences.map((step) => (
                  <div key={step.id} className={`border rounded-lg p-4 ${
                    step.stepNumber === 1 ? 'bg-blue-50 dark:bg-blue-950/30' :
                    step.stepNumber === 2 ? 'bg-green-50 dark:bg-green-950/30' :
                    'bg-yellow-50 dark:bg-yellow-950/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white ${
                          step.stepNumber === 1 ? 'bg-blue-500' :
                          step.stepNumber === 2 ? 'bg-green-500' :
                          'bg-yellow-500'
                        }`}>
                          {step.stepNumber}
                        </div>
                        <div>
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {step.delayDays === 0 ? 'Immediate' : `${step.delayDays} days after previous step`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={step.isActive ? 'default' : 'secondary'}>
                          {step.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {step.stepNumber === 1 ? '45 sent • 24 accepted' :
                           step.stepNumber === 2 ? '18 sent • 8 replied' :
                           '12 sent • 3 replied'}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded p-3 border">
                      <p className="text-sm">{step.content}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Template: {step.stepType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span>
                        {step.stepNumber === 1 ? 'Success Rate: 53%' :
                         step.stepNumber === 2 ? 'Reply Rate: 44%' :
                         'Reply Rate: 25%'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Campaign Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <input 
                    type="text" 
                    value={campaign.name} 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    value={campaign.description} 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button>Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}