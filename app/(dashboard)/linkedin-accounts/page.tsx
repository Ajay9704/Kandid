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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="relative hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">{account.name}</div>
                    <div className="text-sm text-muted-foreground">LinkedIn Profile</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={account.isActive ? "default" : "secondary"}>
                    {account.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Recent Activity</div>
                <div className="text-xs text-muted-foreground">Connection request sent 7 min ago</div>
                <div className="text-xs text-muted-foreground">Message replied 15 min ago</div>
                <div className="text-xs text-muted-foreground">Profile viewed 23 min ago</div>
              </div>

              {/* Connection Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded">
                  <div className="text-lg font-bold text-green-600">24</div>
                  <div className="text-xs text-green-600">Accepted</div>
                </div>
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                  <div className="text-lg font-bold text-blue-600">12</div>
                  <div className="text-xs text-blue-600">Pending</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded">
                  <div className="text-lg font-bold text-yellow-600">8</div>
                  <div className="text-xs text-yellow-600">Replied</div>
                </div>
              </div>

              {/* Daily/Weekly Limits */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Connections</span>
                    <span className="font-medium">{account.currentDailyCount}/{account.dailyLimit}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${(account.currentDailyCount / account.dailyLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weekly Connections</span>
                    <span className="font-medium">{account.currentWeeklyCount}/{account.weeklyLimit}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all" 
                      style={{ width: `${(account.currentWeeklyCount / account.weeklyLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Active Campaigns */}
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-sm font-medium mb-2">Active Campaigns</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Q4 Outreach Campaign</span>
                    <span className="text-green-600">Running</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Tech Executive Outreach</span>
                    <span className="text-blue-600">Scheduled</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Activity className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}