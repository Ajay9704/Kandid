"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Search, Plus, Play, Pause, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

interface Campaign {
  id: string
  name: string
  status: string
  description?: string | null
  totalLeads: number
  successfulLeads: number
  responseRate: number
  createdAt: string
  updatedAt: string
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
}

async function fetchCampaigns(): Promise<Campaign[]> {
  const response = await fetch('/api/campaigns')
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns')
  }
  return response.json()
}

async function createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
  const response = await fetch('/api/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaignData),
  })
  if (!response.ok) {
    throw new Error('Failed to create campaign')
  }
  return response.json()
}

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    status: 'draft',
  })

  const queryClient = useQueryClient()
  const { toast } = useToast()
  const router = useRouter()

  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })

  const createCampaignMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      setShowAddForm(false)
      setNewCampaign({ name: '', description: '', status: 'draft' })
      toast({
        title: "Campaign created",
        description: "New campaign has been created successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      })
    },
  })

  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setShowEditForm(true)
  }

  const handleToggleCampaign = (campaign: Campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    toast({
      title: `Campaign ${newStatus}`,
      description: `Campaign "${campaign.name}" has been ${newStatus}.`,
    })
  }

  const handleDeleteCampaign = (campaign: Campaign) => {
    if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      toast({
        title: "Campaign deleted",
        description: `Campaign "${campaign.name}" has been deleted.`,
        variant: "destructive",
      })
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getProgressValue = (campaign: Campaign) => {
    if (campaign.totalLeads === 0) return 0
    return (campaign.successfulLeads / campaign.totalLeads) * 100
  }

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCampaign.name) {
      createCampaignMutation.mutate(newCampaign)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-red-500">Error loading campaigns. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your marketing campaigns and track performance ({campaigns.length} total)
          </p>
        </div>
        <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New Campaign</SheetTitle>
              <SheetDescription>
                Set up a new marketing campaign to track leads and performance
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateCampaign} className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium">Campaign Name *</label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                  placeholder="Enter campaign description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={newCampaign.status}
                  onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={createCampaignMutation.isPending}
              >
                {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Campaign Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + c.totalLeads, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0 
                ? (campaigns.reduce((sum, c) => sum + c.responseRate, 0) / campaigns.length).toFixed(1)
                : '0.0'
              }%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('draft')}
                size="sm"
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'paused' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('paused')}
                size="sm"
              >
                Paused
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Leads</TableHead>
                <TableHead>Successful Leads</TableHead>
                <TableHead>Response Rate</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.name}</div>
                      {campaign.description && (
                        <div className="text-sm text-muted-foreground">
                          {campaign.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[campaign.status as keyof typeof statusColors] || statusColors.draft}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.totalLeads}</TableCell>
                  <TableCell>{campaign.successfulLeads}</TableCell>
                  <TableCell>{campaign.responseRate.toFixed(1)}%</TableCell>
                  <TableCell>
                    <div className="w-full">
                      <Progress value={getProgressValue(campaign)} className="w-[60px]" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {getProgressValue(campaign).toFixed(0)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/campaigns/${campaign.id}`)}
                        title="View campaign details"
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditCampaign(campaign)}
                        title="Edit campaign"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {campaign.status === 'active' ? (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleCampaign(campaign)}
                          title="Pause campaign"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : campaign.status === 'paused' ? (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleCampaign(campaign)}
                          title="Resume campaign"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      ) : null}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteCampaign(campaign)}
                        title="Delete campaign"
                        className="hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No campaigns found matching your search.' : 'No campaigns yet. Create your first campaign!'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Campaign Sheet */}
      <Sheet open={showEditForm} onOpenChange={setShowEditForm}>
        <SheetContent>
          {editingCampaign && (
            <>
              <SheetHeader>
                <SheetTitle>Edit Campaign</SheetTitle>
                <SheetDescription>
                  Update campaign details and settings
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                toast({
                  title: "Campaign updated",
                  description: `Campaign "${editingCampaign.name}" has been updated successfully.`,
                })
                setShowEditForm(false)
              }} className="space-y-4 mt-6">
                <div>
                  <label className="text-sm font-medium">Campaign Name *</label>
                  <Input
                    value={editingCampaign.name}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                    placeholder="Enter campaign name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={editingCampaign.description || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                    placeholder="Enter campaign description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={editingCampaign.status}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value })}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Update Campaign
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}