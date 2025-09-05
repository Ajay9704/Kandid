"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Mail,
  Smartphone,
  Globe,
  Save,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const [settings, setSettings] = useState({
    // Profile settings
    name: 'Demo User',
    email: 'demo@linkbird.com',
    company: 'Linkbird Inc.',
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    leadAlerts: true,
    
    // Privacy settings
    profileVisibility: 'private',
    dataSharing: false,
    
    // Appearance
    theme: 'system',
    language: 'en',
  })

  const handleSave = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
    
    setIsLoading(false)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Company</label>
            <Input
              value={settings.company}
              onChange={(e) => setSettings({ ...settings, company: e.target.value })}
              placeholder="Enter your company name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Email Notifications</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Badge variant={settings.emailNotifications ? "default" : "secondary"}>
              {settings.emailNotifications ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Push Notifications</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your device
              </p>
            </div>
            <Badge variant={settings.pushNotifications ? "default" : "secondary"}>
              {settings.pushNotifications ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your privacy and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-medium">Profile Visibility</span>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile
              </p>
            </div>
            <Badge variant="outline">
              {settings.profileVisibility === 'private' ? 'Private' : 'Public'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-medium">Data Sharing</span>
              <p className="text-sm text-muted-foreground">
                Allow anonymous usage data collection
              </p>
            </div>
            <Badge variant={settings.dataSharing ? "default" : "secondary"}>
              {settings.dataSharing ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your data and account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground">
                Download all your leads and campaign data
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                toast({
                  title: "Export started",
                  description: "Your data export will be ready shortly. You'll receive an email when it's complete.",
                })
              }}
            >
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
            <div>
              <h4 className="font-medium text-red-600">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button 
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  toast({
                    title: "Account deletion requested",
                    description: "Your account deletion request has been submitted. You'll receive a confirmation email.",
                    variant: "destructive",
                  })
                }
              }}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}