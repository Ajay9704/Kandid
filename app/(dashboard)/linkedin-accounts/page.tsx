"use client"

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Plus, User, Activity, Settings, Trash2 } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

interface LinkedInAccount {
  id: string
  name: string
  linkedinUrl: string
  isActive: boolean
  dailyLimit: number
  weeklyLimit: number
  currentDailyCount: number
  currentWeeklyCount: number
  lastResetDate?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export default function LinkedInAccountsPage() {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: '',
    linkedinUrl: '',
    dailyLimit: 50,
    weeklyLimit: 200,
  })

  const { data: accounts = [], isLoading, refetch } = useQuery<LinkedInAccount[]>({
    queryKey: ['linkedin-accounts'],
    queryFn: async () => {
      const response = await fetch('/api/linkedin-accounts')
      if (!response.ok) throw new Error('Failed to fetch accounts')
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  })

  const createAccountMutation = useMutation({
    mutationFn: async (accountData: typeof newAccount) => {
      const response = await fetch('/api/linkedin-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      })
      if (!response.ok) throw new Error('Failed to create account')
      return response.json()
    },
    onSuccess: () => {
      refetch()
      setShowAddForm(false)
      setNewAccount({ name: '', linkedinUrl: '', dailyLimit: 50, weeklyLimit: 200 })
      toast({
        title: "Account added",
        description: "LinkedIn account has been added successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add LinkedIn account.",
        variant: "destructive",
      })
    },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Accounts</h1>
          <p className="text-muted-foreground">
            Manage your LinkedIn accounts and connection limits
          </p>
        </div>
        <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add LinkedIn Account</SheetTitle>
              <SheetDescription>
                Connect a new LinkedIn account for outreach campaigns
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (newAccount.name && newAccount.linkedinUrl) {
                createAccountMutation.mutate(newAccount)
              }
            }} className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="Enter account name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">LinkedIn URL *</label>
                <Input
                  value={newAccount.linkedinUrl}
                  onChange={(e) => setNewAccount({ ...newAccount, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Daily Limit</label>
                <Input
                  type="number"
                  value={newAccount.dailyLimit}
                  onChange={(e) => setNewAccount({ ...newAccount, dailyLimit: parseInt(e.target.value) })}
                  placeholder="50"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Weekly Limit</label>
                <Input
                  type="number"
                  value={newAccount.weeklyLimit}
                  onChange={(e) => setNewAccount({ ...newAccount, weeklyLimit: parseInt(e.target.value) })}
                  placeholder="200"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createAccountMutation.isPending}
              >
                {createAccountMutation.isPending ? 'Adding...' : 'Add Account'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Single LinkedIn Account */}
      <div className="max-w-2xl">
        <Card className="relative hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">John Smith</div>
                  <div className="text-sm text-muted-foreground">LinkedIn Profile • Active Account</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Information */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-sm font-medium mb-3">Profile Information</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">LinkedIn URL:</span>
                  <a href="https://linkedin.com/in/johnsmith" target="_blank" className="text-blue-600 hover:underline">
                    linkedin.com/in/johnsmith
                  </a>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account Status:</span>
                  <span className="text-green-600 font-medium">Active & Verified</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Activity:</span>
                  <span>2 minutes ago</span>
                </div>
              </div>
            </div>

            {/* Connection Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">24</div>
                <div className="text-xs text-green-600 font-medium">Connected</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-xs text-blue-600 font-medium">Request Sent</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">8</div>
                <div className="text-xs text-yellow-600 font-medium">Replied</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-xs text-purple-600 font-medium">Following</div>
              </div>
            </div>

            {/* Daily/Weekly Limits */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily Connection Requests</span>
                  <span className="font-medium">45/50</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: '90%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">5 requests remaining today</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Weekly Connection Requests</span>
                  <span className="font-medium">180/200</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-green-600 h-3 rounded-full transition-all" style={{ width: '90%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">20 requests remaining this week</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-sm font-medium mb-3">Recent Activity</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Connection request sent to Sarah Johnson</span>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Message replied from Mike Chen</span>
                  <span className="text-xs text-muted-foreground">15 min ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Profile viewed by Lisa Wang</span>
                  <span className="text-xs text-muted-foreground">23 min ago</span>
                </div>
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-sm font-medium mb-3">Active Campaigns</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Q4 Outreach Campaign</span>
                  <Badge className="bg-green-100 text-green-800">Running</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Tech Executive Outreach</span>
                  <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Holiday Promotion</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Activity className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}