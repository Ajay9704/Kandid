"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Send, Eye, Reply } from 'lucide-react'

export default function MessagesPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const response = await fetch('/api/messages')
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      // Handle different response formats
      const messages = Array.isArray(data) ? data : (data.data || [])
      
      // Always use real data
      return messages
    },
    staleTime: 0, // Don't cache, always fetch fresh data
    gcTime: 0, // Don't cache, always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  })

  const filteredMessages = messages.filter((message: any) => {
    const matchesSearch = message.leadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'read': return 'bg-green-100 text-green-800'
      case 'replied': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Track all your LinkedIn messages and conversation history
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={filterStatus === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'replied' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterStatus('replied')}
          >
            Replied
          </Button>
          <Button 
            variant={filterStatus === 'sent' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterStatus('sent')}
          >
            Pending
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading messages...
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No messages found matching your search.' : 'No messages yet.'}
                </div>
              ) : (
                filteredMessages.map((message: any) => (
                <div key={message.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {message.leadName.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{message.leadName}</h3>
                          <span className="text-sm text-muted-foreground">at {message.company}</span>
                          <Badge variant="outline" className="text-xs">LinkedIn</Badge>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(message.status)}>
                            {message.status === 'replied' ? 'Replied' : message.status === 'read' ? 'Read' : 'Sent'}
                          </Badge>
                          {message.status === 'replied' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-1 ml-auto"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {message.messageType} • Sequence Step {message.messageType === 'Connection Request' ? '1' : message.messageType === 'Follow-up Message' ? '2' : '3'}
                      </p>
                      <p className="text-sm bg-muted/30 rounded p-2 mb-3">{message.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Sent: {new Date(message.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {message.readAt && (
                            <span className="flex items-center text-green-600">
                              <Eye className="w-3 h-3 mr-1" />
                              Read: {new Date(message.readAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          )}
                          {message.repliedAt && (
                            <span className="flex items-center text-blue-600">
                              <Reply className="w-3 h-3 mr-1" />
                              Replied: {new Date(message.repliedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // View message details
                              console.log('View message:', message.id)
                            }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Follow up action
                              console.log('Follow up with:', message.leadName)
                            }}
                            title="Follow Up"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Follow Up
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {message.status === 'replied' ? 'Lead marked as qualified • Ready for next step' :
                         message.status === 'read' ? 'Message read • Follow-up scheduled in 3 days' :
                         'Message delivered • Awaiting response'}
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}