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
import { Search, Plus, Mail, Building, Calendar } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

interface Lead {
  id: string
  name: string
  email: string
  company?: string | null
  status: string
  lastContactDate?: string | null
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
      setSelectedLead(updatedLead)
      toast({
        title: "Status updated",
        description: `Lead status changed to ${updatedLead.status}.`,
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lead status. Please try again.",
        variant: "destructive",
      })
    },
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
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.company || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[lead.status as keyof typeof statusColors] || statusColors.pending}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                    >
                      View Details
                    </Button>
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

                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Status</h3>
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
                  <select
                    value={selectedLead.status}
                    onChange={(e) => {
                      updateStatusMutation.mutate({
                        leadId: selectedLead.id,
                        status: e.target.value
                      })
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