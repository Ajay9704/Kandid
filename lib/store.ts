import { create } from 'zustand'
import { Lead, Campaign } from './db/schema'

interface AppState {
  // Sidebar state
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  
  // Selected items
  selectedLead: Lead | null
  setSelectedLead: (lead: Lead | null) => void
  
  selectedCampaign: Campaign | null
  setSelectedCampaign: (campaign: Campaign | null) => void
  
  // Filters and search
  leadsSearch: string
  setLeadsSearch: (search: string) => void
  
  campaignsSearch: string
  setCampaignsSearch: (search: string) => void
  
  leadsStatusFilter: string
  setLeadsStatusFilter: (status: string) => void
  
  campaignsStatusFilter: string
  setCampaignsStatusFilter: (status: string) => void
  
  // UI state
  leadDetailOpen: boolean
  setLeadDetailOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar state
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  // Selected items
  selectedLead: null,
  setSelectedLead: (lead) => set({ selectedLead: lead }),
  
  selectedCampaign: null,
  setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),
  
  // Filters and search
  leadsSearch: '',
  setLeadsSearch: (search) => set({ leadsSearch: search }),
  
  campaignsSearch: '',
  setCampaignsSearch: (search) => set({ campaignsSearch: search }),
  
  leadsStatusFilter: 'all',
  setLeadsStatusFilter: (status) => set({ leadsStatusFilter: status }),
  
  campaignsStatusFilter: 'all',
  setCampaignsStatusFilter: (status) => set({ campaignsStatusFilter: status }),
  
  // UI state
  leadDetailOpen: false,
  setLeadDetailOpen: (open) => set({ leadDetailOpen: open }),
}))

// Export useStore as an alias for backward compatibility
export const useStore = useAppStore