/**
 * API Services - Integration Examples
 * 
 * This file demonstrates how to integrate each API service
 * into your React components.
 */

// ============================================================================
// 1. EXECUTIVE DASHBOARD - ALREADY INTEGRATED
// ============================================================================

// File: src/pages/ExecutiveDashboard.jsx
// Status: ✅ Complete - Fetches metrics, compliance, schedules, and sync time
// Pattern: useEffect + useState for data management + loading/error states

// Key integration points:
// - Fetches 4 metrics KPIs from dashboardService.getMetrics()
// - Loads regional compliance data from dashboardService.getComplianceByRegion()
// - Displays upcoming schedules from dashboardService.getSchedules()
// - Shows last sync time from dashboardService.getLastSync()
// - Handles loading state with spinner message
// - Handles error state with fallback message
// - Renders data dynamically from state using .map() for lists

// ============================================================================
// 2. SLA PROPOSAL MANAGEMENT - READY FOR INTEGRATION
// ============================================================================

// File: src/pages/SLAProposalManagement.jsx
// Next steps: Update to use slaService instead of hardcoded data

// BEFORE (Current - Hardcoded):
/*
const SLAProposalManagement = () => {
  const [contracts, setContracts] = useState([
    { id: 'contract-001', client: 'Zenith Core Infra', ... },
    { id: 'contract-002', client: 'Abuja Power Grid Ltd.', ... },
    ...
  ])
}
*/

// AFTER (Recommended):
import { useState, useEffect } from 'react'
import { slaService } from '../services/slaService.js'

const SLAProposalManagement = () => {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [draftFilters, setDraftFilters] = useState({ type: '', region: '' })

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const data = await slaService.getContracts({
          type: draftFilters.type,
          region: draftFilters.region,
        })
        setContracts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [draftFilters.type, draftFilters.region])

  // Also fetch proposal activity timeline
  useEffect(() => {
    slaService.getProposalActivity().then(setActivity).catch(console.error)
  }, [])

  // ... rest of component
}

// Integration checklist:
// [ ] Import slaService and useEffect
// [ ] Add state for loading, error, contracts, activity
// [ ] Create fetchContracts() function
// [ ] Call fetchContracts in useEffect with proper dependencies
// [ ] Update filter handlers to trigger refetch
// [ ] Add loading/error UI states
// [ ] Render contracts from state instead of hardcoded array

// ============================================================================
// 3. MAINTENANCE OPS MATRIX - READY FOR INTEGRATION
// ============================================================================

// File: src/pages/MaintenanceOpsMatrix.jsx
// Next steps: Use maintenanceService for tickets, downtime, and PFI data

// Integration points needed:
// - Replace hardcoded tickets array with maintenanceService.getTickets()
// - Replace hardcoded downtime bars with maintenanceService.getDowntimeProjection()
// - Replace hardcoded PFI data with maintenanceService.getPFIStatus()

// Example integration:
import { maintenanceService } from '../services/maintenanceService.js'

const MaintenanceOpsMatrix = () => {
  const [tickets, setTickets] = useState([])
  const [downtime, setDowntime] = useState([])
  const [pfiStatus, setPFIStatus] = useState({})
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsData, downtimeData, pfiData] = await Promise.all([
          maintenanceService.getTickets(),
          maintenanceService.getDowntimeProjection(),
          maintenanceService.getPFIStatus(),
        ])
        setTickets(ticketsData)
        setDowntime(downtimeData)
        setPFIStatus(pfiData)
      } catch (err) {
        console.error('Failed to fetch maintenance data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle logging new repair ticket
  const handleLogRepair = async (formData) => {
    try {
      await maintenanceService.logRepairTicket(formData)
      // Refetch tickets after successful creation
      const updated = await maintenanceService.getTickets()
      setTickets(updated)
      setIsLogModalOpen(false)
    } catch (err) {
      alert('Failed to log repair: ' + err.message)
    }
  }

  // Render tickets.map(), downtime.map(), PFI data from state
  // Use loading state for initial load
  // Use error handling for network failures
}

// Integration checklist:
// [ ] Import maintenanceService and useEffect
// [ ] Add state for tickets, downtime, pfiStatus, loading
// [ ] Create fetchData() function with Promise.all()
// [ ] Call fetchData in useEffect on mount
// [ ] Update modal submit handler to use maintenanceService.logRepairTicket()
// [ ] Refetch tickets after successful log
// [ ] Render all data from state using .map()
// [ ] Add loading state UI

// ============================================================================
// 4. CLIENT PORTAL DASHBOARD - READY FOR INTEGRATION
// ============================================================================

// File: src/pages/ClientPortalDashboard.jsx
// Next steps: Fetch client-specific data from clientService

// Integration points needed:
// - Get client profile from clientService.getClientProfile()
// - Fetch SLA status from clientService.getSLAStatus()
// - Load tickets from clientService.getTickets()
// - Load alerts from clientService.getAlerts()
// - Display maintenance timeline from clientService.getMaintenanceTimeline()

// Example integration:
import { clientService } from '../services/clientService.js'

const ClientPortalDashboard = () => {
  const [client, setClient] = useState(null)
  const [slaStatus, setSLAStatus] = useState(null)
  const [tickets, setTickets] = useState([])
  const [alerts, setAlerts] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const clientId = 'ACC-DGT-001' // Get from auth or URL params

    const fetchClientData = async () => {
      try {
        const [clientData, slaData, ticketsData, alertsData, maintData] = await Promise.all([
          clientService.getClientProfile(clientId),
          clientService.getSLAStatus(clientId),
          clientService.getTickets(clientId),
          clientService.getAlerts(clientId),
          clientService.getMaintenanceTimeline(clientId),
        ])
        setClient(clientData)
        setSLAStatus(slaData)
        setTickets(ticketsData)
        setAlerts(alertsData)
        setMaintenance(maintData)
      } catch (err) {
        console.error('Failed to fetch client data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [])

  // Handle PFI approval
  const handleApprovePFI = async (pfiId) => {
    try {
      await clientService.approvePFI(pfiId)
      // Refetch alerts to update status
      const updated = await clientService.getAlerts('ACC-DGT-001')
      setAlerts(updated)
    } catch (err) {
      alert('Failed to approve: ' + err.message)
    }
  }

  // Handle ticket response
  const handleTicketResponse = async (ticketId, response) => {
    try {
      await clientService.submitTicketResponse(ticketId, response)
      // Refetch tickets
      const updated = await clientService.getTickets('ACC-DGT-001')
      setTickets(updated)
    } catch (err) {
      alert('Failed to respond: ' + err.message)
    }
  }
}

// Integration checklist:
// [ ] Import clientService and useEffect
// [ ] Add state for all data sections (client, slaStatus, tickets, alerts, maintenance)
// [ ] Create fetchClientData() function with Promise.all()
// [ ] Call fetchClientData in useEffect with clientId dependency
// [ ] Get clientId from auth context or URL params
// [ ] Update PFI approval button to call clientService.approvePFI()
// [ ] Update ticket response handler to call clientService.submitTicketResponse()
// [ ] Refetch affected data after actions
// [ ] Add loading/error states

// ============================================================================
// 5. AUTHENTICATION INTEGRATION - APP.JSX
// ============================================================================

// File: src/App.jsx
// Next steps: Integrate authService for login flow and token management

// Key integrations needed:
import { authService } from './services/authService.js'

// In App component or before rendering:
useEffect(() => {
  // Initialize authentication on app startup (restore token from localStorage)
  authService.initializeFromStorage()
}, [])

// In OperationsLogin.jsx:
const handleLogin = async (email, password, rememberDevice) => {
  try {
    const result = await authService.loginOperations(email, password, rememberDevice)
    if (result.success) {
      navigate('/') // Redirect to dashboard
    }
  } catch (err) {
    setError('Login failed: ' + err.message)
  }
}

// In ClientLogin.jsx:
const handleLogin = async (email, password, keepSignedIn) => {
  try {
    const result = await authService.loginClient(email, password, keepSignedIn)
    if (result.success) {
      navigate('/client') // Redirect to client portal
    }
  } catch (err) {
    setError('Login failed: ' + err.message)
  }
}

// In logout handlers (e.g., Settings menu):
const handleLogout = () => {
  authService.logout()
  navigate('/login')
}

// Integration checklist:
// [ ] Import authService in App.jsx
// [ ] Add useEffect to call authService.initializeFromStorage()
// [ ] Update login form handlers to use authService.loginOperations() or loginClient()
// [ ] Add error handling for failed login attempts
// [ ] Implement route guards to check authService.isAuthenticated()
// [ ] Add logout button handler using authService.logout()
// [ ] Implement token refresh logic (optional, for longer sessions)

// ============================================================================
// 6. CREATING A CUSTOM HOOK - OPTIONAL ENHANCEMENT
// ============================================================================

// File: src/hooks/useDashboard.js
// Purpose: Encapsulate dashboard data fetching logic in a reusable hook

import { useState, useEffect } from 'react'
import { dashboardService } from '../services/dashboardService.js'

export const useDashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metrics, compliance, schedules, sync] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getComplianceByRegion(),
          dashboardService.getSchedules(),
          dashboardService.getLastSync(),
        ])
        setData({ metrics, compliance, schedules, sync })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}

// Usage in component:
// const { data, loading, error } = useDashboard()
// if (loading) return <div>Loading...</div>
// return <div>{data.metrics.activeSLAs}</div>

// ============================================================================
// SUMMARY
// ============================================================================

/*
COMPLETION STATUS:
✅ ExecutiveDashboard.jsx - COMPLETE (with API integration)
⏳ SLAProposalManagement.jsx - Ready for integration
⏳ MaintenanceOpsMatrix.jsx - Ready for integration
⏳ ClientPortalDashboard.jsx - Ready for integration
⏳ Login pages (OperationsLogin, ClientLogin) - Ready for auth integration
⏳ App.jsx - Ready for auth initialization

PRIORITY ORDER FOR INTEGRATION:
1. Auth service in login pages (unblocks all other flows)
2. Dashboard refinement (already done)
3. SLA service (used by multiple pages)
4. Maintenance service (for operations features)
5. Client service (for client portal)

TESTING CHECKLIST:
- [ ] Test each service independently in browser console
- [ ] Verify error handling (disable backend, check fallbacks)
- [ ] Check loading states (use DevTools throttle)
- [ ] Verify data updates after CRUD operations
- [ ] Test auth token persistence across page reloads
- [ ] Validate CORS headers if using real backend
- [ ] Monitor network tab for unnecessary requests
- [ ] Check browser console for any warnings/errors
*/
