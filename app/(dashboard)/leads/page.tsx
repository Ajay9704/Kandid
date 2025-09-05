"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Search, Plus, Mail, Building, Calendar, Linkedin, User, Send, Eye } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

interface Lead {
  id: string
  name: string
  email: string
  company?: string | null
  position?: string | null
  linkedinUrl?: string | null
  profileImage?: string | null
  location?: string | null
  status: string
  connectionStatus: string
  sequenceStep: number
  lastContactDate?: string | null
  lastActivity?: string | null
  lastActivityDate?: string | null
  notes?: string | null
  campaignId: string
  userId: string
  createdAt: string
  updatedAt: string
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  responded: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
  new: 'bg-gray-100 text-gray-800',
  qualified: 'bg-green-100 text-green-800',
  nurturing: 'bg-orange-100 text-orange-800',
}

const connectionStatusColors = {
  not_connected: 'bg-gray-100 text-gray-800',
  request_sent: 'bg-blue-100 text-blue-800',
  connected: 'bg-green-100 text-green-800',
  request_received: 'bg-yellow-100 text-yellow-800',
  do_not_contact: 'bg-red-100 text-red-800',
}

async function fetchLeads(): Promise<Lead[]> {
  const response = await fetch('/api/leads')
  if (!response.ok) {
    throw new Error('Failed to fetch leads')
  }
  return response.json()
}

async function createLead(leadData: Partial<Lead>): Promise<Lead> {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  })
  if (!response.ok) {
    throw new Error('Failed to create lead')
  }
  return response.json()
}

async function updateLeadStatus(leadId: string, status: string): Promise<Lead> {
  const response = await fetch(`/api/leads/${leadId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    throw new Error('Failed to update lead status')
  }
  return response.json()
}

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    notes: '',
  })

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })

  const createLeadMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      setShowAddForm(false)
      setNewLead({ name: '', email: '', company: '', notes: '' })
      toast({
        title: "Lead created",
        description: "New lead has been added successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: string }) =>
      updateLeadStatus(leadId, status),
    onSuccess: (updatedLead) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setSelectedLead(updatedLead)
      toast({
        title: "Status updated",
        description: `Lead status changed to ${updatedLead.status}.`,
      })
    },
    onError: (error: any) => {
      console.error('Status update error:', error)
      toast({
        title: "Update failed",
        description: error?.message || "Failed to update lead status. Please try again.",
        variant: "destructive",
      })
    },
    retry: 2, // Retry failed requests twice
  })

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault()
    if (newLead.name && newLead.email) {
      createLeadMutation.mutate(newLead)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-muted-foreground">Loading leads...</p>
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
            <h1 className="text-3xl font-bold">Leads</h1>
            <p className="text-red-500">Error loading leads. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your leads across all campaigns ({leads.length} total)
          </p>
        </div>
        <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Lead</SheetTitle>
              <SheetDescription>
                Create a new lead to track in your pipeline
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleCreateLead} className="space-y-4 mt-6">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="Enter lead name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Add any notes"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createLeadMutation.isPending}
              >
                {createLeadMutation.isPending ? 'Creating...' : 'Create Lead'}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
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
                placeholder="Search leads..."
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
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'contacted' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('contacted')}
                size="sm"
              >
                Contacted
              </Button>
              <Button
                variant={statusFilter === 'responded' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('responded')}
                size="sm"
              >
                Responded
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead Name</TableHead>
                <TableHead>Company & Position</TableHead>
                <TableHead>Connection Status</TableHead>
                <TableHead>Sequence Step</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-sm text-muted-foreground">{lead.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{lead.company || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{lead.position || 'Position not specified'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={connectionStatusColors[lead.connectionStatus as keyof typeof connectionStatusColors] || connectionStatusColors.not_connected}>
                      {lead.connectionStatus?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Connected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                        {lead.sequenceStep || 0}
                      </div>
                      <span className="text-sm">
                        {lead.sequenceStep === 0 ? 'Not Started' : 
                         lead.sequenceStep === 1 ? 'Connection Request' :
                         lead.sequenceStep === 2 ? 'Follow-up 1' :
                         lead.sequenceStep === 3 ? 'Follow-up 2' : 
                         `Step ${lead.sequenceStep}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium">{lead.lastActivity || 'No activity'}</div>
                      <div className="text-xs text-muted-foreground">
                        {lead.lastActivityDate ? new Date(lead.lastActivityDate).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLead(lead)}
                        className="transition-all duration-200 hover:bg-muted"
                        title="View Profile & Status"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {lead.linkedinUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(lead.linkedinUrl || '', '_blank')}
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredLeads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No leads found matching your search.' : 'No leads yet. Create your first lead!'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedLead.name}</SheetTitle>
                <SheetDescription>
                  Lead details and interaction history
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedLead.email}</span>
                    </div>
                    {selectedLead.company && (
                      <div className="flex items-center space-x-3">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedLead.company}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        Created: {new Date(selectedLead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* LinkedIn Connection Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">LinkedIn Connection Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedLead.connectionStatus === 'connected' ? 'bg-green-500' :
                          selectedLead.connectionStatus === 'request_sent' ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="font-medium">
                          {selectedLead.connectionStatus === 'connected' ? 'Connected' :
                           selectedLead.connectionStatus === 'request_sent' ? 'Request Sent' :
                           'Not Connected'}
                        </span>
                      </div>
                      <Badge className={connectionStatusColors[selectedLead.connectionStatus as keyof typeof connectionStatusColors] || connectionStatusColors.not_connected}>
                        {selectedLead.connectionStatus?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Connected'}
                      </Badge>
                    </div>
                    
                    {/* Sequence Progress */}
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Sequence Progress</span>
                        <span className="text-sm text-muted-foreground">Step {selectedLead.sequenceStep || 0}/4</span>
                      </div>
                      <div className="space-y-2">
                        <div className={`flex items-center space-x-2 text-sm ${selectedLead.sequenceStep >= 1 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <div className={`w-2 h-2 rounded-full ${selectedLead.sequenceStep >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Connection Request {selectedLead.sequenceStep >= 1 ? '✓' : ''}</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-sm ${selectedLead.sequenceStep >= 2 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <div className={`w-2 h-2 rounded-full ${selectedLead.sequenceStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Connection Acceptance {selectedLead.sequenceStep >= 2 ? '✓' : ''}</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-sm ${selectedLead.sequenceStep >= 3 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <div className={`w-2 h-2 rounded-full ${selectedLead.sequenceStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Follow-up Message 1 {selectedLead.sequenceStep >= 3 ? '✓' : ''}</span>
                        </div>
                        <div className={`flex items-center space-x-2 text-sm ${selectedLead.sequenceStep >= 4 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <div className={`w-2 h-2 rounded-full ${selectedLead.sequenceStep >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>Follow-up Message 2 {selectedLead.sequenceStep >= 4 ? '✓' : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Last Activity */}
                    {selectedLead.lastActivity && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="font-medium text-sm">Latest Activity</div>
                        <div className="text-sm text-muted-foreground">{selectedLead.lastActivity}</div>
                        {selectedLead.lastActivityDate && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(selectedLead.lastActivityDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lead Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Lead Status</h3>
                  <Badge className={statusColors[selectedLead.status as keyof typeof statusColors] || statusColors.pending}>
                    {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                  </Badge>
                </div>

                {/* Notes */}
                {selectedLead.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedLead.notes}
                    </p>
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Update Status</h3>
                  <div className="space-y-3">
                    <select
                      value={selectedLead.status}
                      onChange={(e) => {
                        setSelectedLead({ ...selectedLead, status: e.target.value })
                      }}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      disabled={updateStatusMutation.isPending}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="responded">Responded</option>
                      <option value="qualified">Qualified</option>
                      <option value="nurturing">Nurturing</option>
                      <option value="converted">Converted</option>
                    </select>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          updateStatusMutation.mutate({
                            leadId: selectedLead.id,
                            status: selectedLead.status
                          })
                        }}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1"
                        type="button"
                      >
                        {updateStatusMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedLead(null)}
                        disabled={updateStatusMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4">
                  <Button size="sm" onClick={() => {
                    window.open(`mailto:${selectedLead.email}`, '_blank')
                  }}>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}