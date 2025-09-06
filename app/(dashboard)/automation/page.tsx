"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Bot,
    Clock,
    MessageSquare,
    Users,
    Settings,
    Play,
    Pause,
    Calendar,
    Target,
    Zap,
    AlertTriangle,
    CheckCircle,
    Timer
} from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

interface AutomationSettings {
    id: string
    name: string
    type: 'connection_requests' | 'follow_up_messages' | 'message_sequences'
    enabled: boolean
    dailyLimit: number
    delayBetweenActions: number
    workingHours: {
        start: string
        end: string
        timezone: string
    }
    workingDays: string[]
    templates: Array<{
        id: string
        step: number
        subject?: string
        content: string
        delayDays: number
    }>
    filters: {
        industries: string[]
        jobTitles: string[]
        companySize: string[]
        location: string[]
    }
    safetySettings: {
        respectConnectionLimits: boolean
        avoidWeekends: boolean
        randomizeTimings: boolean
        pauseOnHighRejection: boolean
    }
}

async function fetchAutomationSettings(): Promise<AutomationSettings[]> {
    // Mock data for demo - in real app, this would fetch from your API
    return [
        {
            id: '1',
            name: 'Connection Request Automation',
            type: 'connection_requests',
            enabled: true,
            dailyLimit: 50,
            delayBetweenActions: 15,
            workingHours: {
                start: '09:00',
                end: '17:00',
                timezone: 'UTC'
            },
            workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            templates: [
                {
                    id: '1',
                    step: 1,
                    content: "Hi {firstName}, I noticed we both work in {industry} and thought it would be great to connect!",
                    delayDays: 0
                }
            ],
            filters: {
                industries: ['Technology', 'Software'],
                jobTitles: ['CEO', 'CTO', 'VP'],
                companySize: ['51-200', '201-500'],
                location: ['United States', 'Canada']
            },
            safetySettings: {
                respectConnectionLimits: true,
                avoidWeekends: true,
                randomizeTimings: true,
                pauseOnHighRejection: true
            }
        },
        {
            id: '2',
            name: 'Follow-up Message Sequence',
            type: 'message_sequences',
            enabled: false,
            dailyLimit: 30,
            delayBetweenActions: 20,
            workingHours: {
                start: '10:00',
                end: '16:00',
                timezone: 'UTC'
            },
            workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            templates: [
                {
                    id: '1',
                    step: 1,
                    subject: 'Thanks for connecting!',
                    content: "Hi {firstName}, thanks for connecting! I'd love to learn more about your work at {company}.",
                    delayDays: 1
                },
                {
                    id: '2',
                    step: 2,
                    subject: 'Quick question about {company}',
                    content: "Hi {firstName}, I was curious about how {company} is approaching digital transformation. Would love to hear your thoughts!",
                    delayDays: 3
                }
            ],
            filters: {
                industries: [],
                jobTitles: [],
                companySize: [],
                location: []
            },
            safetySettings: {
                respectConnectionLimits: true,
                avoidWeekends: true,
                randomizeTimings: true,
                pauseOnHighRejection: false
            }
        }
    ]
}

export default function AutomationPage() {
    const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null)
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: automations = [], isLoading } = useQuery({
        queryKey: ['automation-settings'],
        queryFn: fetchAutomationSettings,
    })

    const updateAutomationMutation = useMutation({
        mutationFn: async (automation: AutomationSettings) => {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            return automation
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automation-settings'] })
            toast({
                title: "Settings updated",
                description: "Automation settings have been saved successfully.",
            })
        },
    })

    const toggleAutomationMutation = useMutation({
        mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 500))
            return { id, enabled }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['automation-settings'] })
            toast({
                title: data.enabled ? "Automation enabled" : "Automation paused",
                description: data.enabled ? "Automation is now running." : "Automation has been paused.",
            })
        },
    })

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Automation</h1>
                        <p className="text-muted-foreground">Loading automation settings...</p>
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
                    <h1 className="text-3xl font-bold">Automation</h1>
                    <p className="text-muted-foreground">
                        Configure and manage your LinkedIn outreach automation
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>1 Active Automation</span>
                    </Badge>
                    <Button>
                        <Bot className="w-4 h-4 mr-2" />
                        Create Automation
                    </Button>
                </div>
            </div>

            {/* Automation Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Actions</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">47/50</div>
                        <p className="text-xs text-muted-foreground">
                            Connection requests sent today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">68.5%</div>
                        <p className="text-xs text-muted-foreground">
                            Connection acceptance rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Action</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12m</div>
                        <p className="text-xs text-muted-foreground">
                            Until next connection request
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Automation List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {automations.map((automation) => (
                    <Card key={automation.id} className="relative">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-3 h-3 rounded-full ${automation.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <div>
                                        <CardTitle className="text-lg">{automation.name}</CardTitle>
                                        <CardDescription>
                                            {automation.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Switch
                                    checked={automation.enabled}
                                    onCheckedChange={(enabled) => {
                                        toggleAutomationMutation.mutate({ id: automation.id, enabled })
                                    }}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Daily Limit</Label>
                                    <div className="text-lg font-semibold">{automation.dailyLimit}</div>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Delay (minutes)</Label>
                                    <div className="text-lg font-semibold">{automation.delayBetweenActions}</div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Working Hours</Label>
                                <div className="text-sm">
                                    {automation.workingHours.start} - {automation.workingHours.end}
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Templates</Label>
                                <div className="text-sm">
                                    {automation.templates.length} message template{automation.templates.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedAutomation(automation.id)}
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configure
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        toggleAutomationMutation.mutate({
                                            id: automation.id,
                                            enabled: !automation.enabled
                                        })
                                    }}
                                >
                                    {automation.enabled ? (
                                        <>
                                            <Pause className="w-4 h-4 mr-2" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Start
                                        </>
                                    )}
                                </Button>
                            </div>

                            {automation.enabled && (
                                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-700 dark:text-green-300">
                                            Active • Next action in {Math.floor(Math.random() * 30) + 5} minutes
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detailed Configuration */}
            {selectedAutomation && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Configure: {automations.find(a => a.id === selectedAutomation)?.name}
                        </CardTitle>
                        <CardDescription>
                            Customize automation settings and message templates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="settings" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                                <TabsTrigger value="templates">Templates</TabsTrigger>
                                <TabsTrigger value="safety">Safety</TabsTrigger>
                            </TabsList>

                            <TabsContent value="settings" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Daily Limit</Label>
                                            <div className="mt-2">
                                                <Slider
                                                    defaultValue={[50]}
                                                    max={100}
                                                    step={5}
                                                    className="w-full"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>0</span>
                                                    <span>50</span>
                                                    <span>100</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Delay Between Actions (minutes)</Label>
                                            <div className="mt-2">
                                                <Slider
                                                    defaultValue={[15]}
                                                    max={60}
                                                    step={5}
                                                    className="w-full"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>5</span>
                                                    <span>15</span>
                                                    <span>60</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Working Hours</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Input type="time" defaultValue="09:00" />
                                                <Input type="time" defaultValue="17:00" />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Timezone</Label>
                                            <Select defaultValue="UTC">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UTC">UTC</SelectItem>
                                                    <SelectItem value="EST">Eastern Time</SelectItem>
                                                    <SelectItem value="PST">Pacific Time</SelectItem>
                                                    <SelectItem value="GMT">GMT</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="templates" className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Message Templates</h3>
                                        <Button size="sm">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Add Template
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base">Step 1: Connection Request</CardTitle>
                                                    <Badge>Active</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div>
                                                    <Label>Message Content</Label>
                                                    <Textarea
                                                        defaultValue="Hi {firstName}, I noticed we both work in {industry} and thought it would be great to connect!"
                                                        className="mt-1"
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Available variables: {'{firstName}'}, {'{lastName}'}, {'{company}'}, {'{industry}'}, {'{jobTitle}'}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="safety" className="space-y-4">
                                <div className="space-y-6">
                                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                        <div className="flex items-center space-x-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Safety Settings</h3>
                                        </div>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                                            These settings help protect your LinkedIn account from being flagged or restricted.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Respect LinkedIn Connection Limits</Label>
                                                <p className="text-sm text-muted-foreground">Stay within LinkedIn's daily connection request limits</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Avoid Weekends</Label>
                                                <p className="text-sm text-muted-foreground">Pause automation on weekends</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Randomize Timings</Label>
                                                <p className="text-sm text-muted-foreground">Add random delays to appear more human</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Pause on High Rejection Rate</Label>
                                                <p className="text-sm text-muted-foreground">Automatically pause if rejection rate exceeds 30%</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end space-x-2 pt-6 border-t">
                            <Button variant="outline" onClick={() => setSelectedAutomation(null)}>
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                const automation = automations.find(a => a.id === selectedAutomation)
                                if (automation) {
                                    updateAutomationMutation.mutate(automation)
                                }
                                setSelectedAutomation(null)
                            }}>
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}