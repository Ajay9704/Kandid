"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { useSession, signOut } from '@/lib/auth-client'
import { useSocket } from '@/lib/hooks/use-socket'
import {
  LayoutDashboard,
  Users,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Activity,
  Zap,
  Sun,
  Moon,
  Monitor,
  Mail
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Target },
  { name: 'LinkedIn Accounts', href: '/linkedin-accounts', icon: User },
  { name: 'Messages', href: '/messages', icon: Mail },
  { name: 'Activity Logs', href: '/activity', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
]

async function fetchQuickStats() {
  try {
    const [leadsRes, campaignsRes] = await Promise.all([
      fetch('/api/leads'),
      fetch('/api/campaigns')
    ])
    
    if (!leadsRes.ok || !campaignsRes.ok) {
      throw new Error('Failed to fetch stats')
    }
    
    const leads = await leadsRes.json()
    const campaigns = await campaignsRes.json()
    
    return {
      totalLeads: leads.length,
      activeLeads: leads.filter((lead: any) => 
        ['contacted', 'responded', 'qualified'].includes(lead.status)
      ).length,
      activeCampaigns: campaigns.filter((campaign: any) => campaign.status === 'active').length,
      newLeadsToday: leads.filter((lead: any) => {
        const today = new Date().toDateString()
        return new Date(lead.createdAt).toDateString() === today
      }).length
    }
  } catch (error) {
    console.error('Error fetching sidebar stats:', error)
    return {
      totalLeads: 0,
      activeLeads: 0,
      activeCampaigns: 0,
      newLeadsToday: 0
    }
  }
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore()
  const { data: session } = useSession()
  const { isConnected, toggleConnection, manuallyDisconnected } = useSocket()
  const { theme, setTheme } = useTheme()
  
  const { data: stats } = useQuery({
    queryKey: ['sidebar-stats'],
    queryFn: fetchQuickStats,
    refetchInterval: 30000,
  })

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-card border-r transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Linkbird
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="ml-auto"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Real-time status */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs font-medium">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleConnection}
              className="h-6 px-2 text-xs"
            >
              {manuallyDisconnected ? 'Connect' : 'Disconnect'}
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {!sidebarCollapsed && stats && (
        <div className="px-4 py-4 border-b">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
              <div className="text-lg font-bold text-blue-600">{stats.totalLeads}</div>
              <div className="text-xs text-blue-600/70">Total Leads</div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
              <div className="text-lg font-bold text-green-600">{stats.activeLeads}</div>
              <div className="text-xs text-green-600/70">Active</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          let badge = null
          
          // Add badges for real-time indicators
          if (item.name === 'Leads' && stats && stats.newLeadsToday > 0) {
            badge = (
              <Badge variant="secondary" className="ml-auto text-xs">
                {stats.newLeadsToday}
              </Badge>
            )
          } else if (item.name === 'Campaigns' && stats && stats.activeCampaigns > 0) {
            badge = (
              <Badge variant="outline" className="ml-auto text-xs">
                {stats.activeCampaigns}
              </Badge>
            )
          }
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start transition-all duration-200',
                  sidebarCollapsed && 'px-2',
                  isActive && 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700'
                )}
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.name}</span>
                    {badge}
                  </>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      {!sidebarCollapsed && (
        <div className="px-4 py-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Theme</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant={theme === 'light' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('light')}
              className="h-8 px-2"
            >
              <Sun className="w-3 h-3" />
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="h-8 px-2"
            >
              <Moon className="w-3 h-3" />
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('system')}
              className="h-8 px-2"
            >
              <Monitor className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t">
        {session?.user ? (
          <div className="space-y-2">
            <div className={cn(
              'flex items-center space-x-3',
              sidebarCollapsed && 'justify-center'
            )}>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              )}
              {!sidebarCollapsed && (
                <Activity className="w-4 h-4 text-green-500" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = '/auth/signin'
                      }
                    }
                  })
                } catch (error) {
                  console.error('Sign out error:', error)
                  // Force redirect even if sign out fails
                  window.location.href = '/auth/signin'
                }
              }}
              className={cn(
                'w-full justify-start text-muted-foreground hover:text-red-600',
                sidebarCollapsed && 'px-2'
              )}
            >
              <LogOut className="w-4 h-4" />
              {!sidebarCollapsed && <span className="ml-2">Sign out</span>}
            </Button>
          </div>
        ) : (
          <div className={cn(
            'flex items-center space-x-3',
            sidebarCollapsed && 'justify-center'
          )}>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Demo User</p>
                <p className="text-xs text-muted-foreground">demo@linkbird.com</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}