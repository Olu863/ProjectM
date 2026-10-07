# SLA Sentinel - API Service Architecture

## Overview

This document describes the enterprise-grade API service layer for the SLA Sentinel React application. The architecture provides a modular, scalable approach to data management with built-in error handling, mock data fallbacks, and support for real backend integration.

## Directory Structure

```
src/
├── services/
│   ├── api.js                  # Base API client with HTTP methods
│   ├── authService.js          # Authentication and session management
│   ├── dashboardService.js     # Executive dashboard data
│   ├── slaService.js           # SLA and proposal management
│   ├── maintenanceService.js   # Repair tickets and maintenance data
│   └── clientService.js        # Client portal data
└── pages/
    ├── ExecutiveDashboard.jsx  # Uses dashboardService (example)
    ├── SLAProposalManagement.jsx
    ├── MaintenanceOpsMatrix.jsx
    └── ClientPortalDashboard.jsx
```

## Architecture Components

### 1. Base API Client (`api.js`)

**Purpose**: Provides standardized HTTP communication layer with interceptors and error handling.

**Key Features**:
- Singleton pattern for consistent API instance
- Automatic JWT token management
- Request timeout handling (10s default)
- Custom error class (`APIError`) for consistent error handling
- Support for GET, POST, PUT, PATCH, DELETE operations

**Usage**:
```javascript
import { apiClient } from '../services/api.js'

// Make requests
const { data } = await apiClient.get('/endpoint')
const { data } = await apiClient.post('/endpoint', { body })
```

**Configuration**:
- Base URL: `process.env.VITE_API_URL || 'http://localhost:3000/api'`
- Set environment variable to connect to real backend

### 2. Authentication Service (`authService.js`)

**Purpose**: Manages user authentication, token lifecycle, and session persistence.

**Key Methods**:
- `loginOperations(email, password, rememberDevice)` - Operations team login
- `loginClient(email, password, keepSignedIn)` - Client portal login
- `logout()` - Clear session and token
- `refreshToken()` - Refresh JWT token
- `isAuthenticated()` - Check authentication status
- `getCurrentUser()` - Get current user profile

**Storage**:
- Tokens stored in localStorage under `sla_sentinel_auth_token`
- User data stored in localStorage under `sla_sentinel_user`

**Integration Point**: Initialize auth on app startup via `App.jsx`:
```javascript
import { authService } from './services/authService.js'

useEffect(() => {
  authService.initializeFromStorage()
}, [])
```

### 3. Dashboard Service (`dashboardService.js`)

**Purpose**: Fetches executive dashboard metrics, compliance data, and maintenance schedules.

**Key Methods**:
- `getMetrics()` - KPIs (active SLAs, pending, uptime, open PFIs)
- `getComplianceByRegion()` - Regional SLA compliance percentages
- `getSchedules()` - Upcoming maintenance schedule items
- `getLastSync()` - Last data sync timestamp

**Mock Data**: Built-in fallback values ensure UI renders even without backend

**API Endpoints**:
```
GET  /dashboard/metrics
GET  /dashboard/compliance
GET  /dashboard/schedules
GET  /dashboard/sync-status
```

**Integration Example** (ExecutiveDashboard.jsx):
```javascript
import { dashboardService } from '../services/dashboardService.js'
import { useState, useEffect } from 'react'

const ExecutiveDashboard = () => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getMetrics()
        setMetrics(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>{metrics.activeSLAs}</div>
}
```

### 4. SLA Service (`slaService.js`)

**Purpose**: Manages SLA contracts, proposals, and renewal tracking.

**Key Methods**:
- `getContracts(filters)` - Fetch active contracts with optional filtering
- `getAtRiskRenewals()` - Count of renewals at risk in next 30 days
- `getProposalActivity()` - Timeline of proposal processing steps
- `createProposal(proposalData)` - Submit new proposal
- `sendRenewalProposal(clientId, proposalId)` - Send renewal to client

**API Endpoints**:
```
GET  /sla/contracts
GET  /sla/at-risk-renewals
GET  /sla/proposal-activity
POST /sla/proposals
POST /sla/send-renewal
```

**Filter Support**:
```javascript
// Example filter usage
const contracts = await slaService.getContracts({
  type: 'SLA',
  region: 'Lagos (VI)',
  status: 'Active SLA'
})
```

### 5. Maintenance Service (`maintenanceService.js`)

**Purpose**: Handles repair tickets, equipment downtime, and PFI management.

**Key Methods**:
- `getTickets(filters)` - List repair tickets with optional filters
- `getDowntimeProjection()` - Projected downtime for next 72 hours
- `getPFIStatus()` - Summary of pending, issued, and cost metrics
- `logRepairTicket(ticketData)` - Create new repair ticket
- `updateTicketStatus(ticketId, status)` - Update ticket status

**API Endpoints**:
```
GET  /maintenance/tickets
GET  /maintenance/downtime-projection
GET  /maintenance/pfi-status
POST /maintenance/tickets
PATCH /maintenance/tickets/{id}
```

**PFI Workflow**:
```javascript
// Get PFI status
const status = await maintenanceService.getPFIStatus()
// → { pendingApproval: 3, issuedMTD: 12, totalEstCost: '4.2M' }

// Log new ticket
const ticket = await maintenanceService.logRepairTicket({
  equipmentId: 'GEN-772A',
  issue: 'Coolant leak',
  priority: 'critical',
  estimatedTime: '24h'
})
```

### 6. Client Service (`clientService.js`)

**Purpose**: Provides client-specific views of SLA status, tickets, and maintenance timelines.

**Key Methods**:
- `getClientProfile(clientId)` - Client account details
- `getSLAStatus(clientId)` - Current SLA compliance and target
- `getTickets(clientId)` - Client-facing service tickets
- `getMaintenanceTimeline(clientId)` - Scheduled maintenance for client
- `getAlerts(clientId)` - Pending alerts and notifications
- `approvePFI(pfiId)` - Client approves cost estimate
- `submitTicketResponse(ticketId, response)` - Client response to ticket

**API Endpoints**:
```
GET  /client/profile/{id}
GET  /client/{id}/sla-status
GET  /client/{id}/tickets
GET  /client/{id}/maintenance-timeline
GET  /client/{id}/alerts
POST /client/pfi/{id}/approve
POST /client/tickets/{id}/response
```

## Error Handling Pattern

All services implement graceful degradation:

```javascript
async method() {
  try {
    const { data } = await apiClient.get('/endpoint')
    return data
  } catch (error) {
    console.warn('Failed to fetch, using defaults:', error.message)
    return defaultValues // Built-in fallback
  }
}
```

This ensures the UI never crashes due to network issues - it displays cached/default data instead.

## Integration into React Components

### Pattern 1: Simple Data Fetch

```javascript
import { useState, useEffect } from 'react'
import { dashboardService } from '../services/dashboardService.js'

const MyComponent = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.getMetrics()
      .then(setData)
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  return <div>{data.activeSLAs}</div>
}
```

### Pattern 2: Parallel Data Fetch

```javascript
useEffect(() => {
  const fetchAll = async () => {
    try {
      const [metrics, compliance, schedules] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getComplianceByRegion(),
        dashboardService.getSchedules()
      ])
      // All data loaded in parallel
      setData({ metrics, compliance, schedules })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  fetchAll()
}, [])
```

### Pattern 3: Refetch on Dependency Change

```javascript
useEffect(() => {
  const fetchFiltered = async () => {
    const contracts = await slaService.getContracts({
      type: selectedType,
      region: selectedRegion
    })
    setContracts(contracts)
  }
  fetchFiltered()
}, [selectedType, selectedRegion]) // Refetch when filters change
```

## Environment Configuration

Create `.env` file in project root:

```bash
# Backend API URL (default: http://localhost:3000/api)
VITE_API_URL=https://api.your-domain.com/api

# Authentication
VITE_AUTH_TOKEN_EXPIRY=3600
VITE_AUTH_REFRESH_URL=/auth/refresh
```

Access in code:
```javascript
const apiUrl = process.env.VITE_API_URL
```

## Backend Integration Checklist

When connecting to a real backend:

- [ ] Set `VITE_API_URL` to your backend base URL
- [ ] Implement JWT token generation in backend login endpoints
- [ ] Add CORS headers to backend (allow requests from frontend URL)
- [ ] Create backend endpoints matching the service definitions above
- [ ] Test authentication flow (login → token storage → API calls)
- [ ] Test error responses (simulate 401, 500, network timeout)
- [ ] Monitor API performance and response times

## Performance Optimization

### 1. Caching Strategy

```javascript
// Cache metrics for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000
let cachedMetrics = null
let lastFetch = 0

export const dashboardService = {
  async getMetrics() {
    if (cachedMetrics && Date.now() - lastFetch < CACHE_DURATION) {
      return cachedMetrics
    }
    const data = await apiClient.get('/dashboard/metrics')
    cachedMetrics = data
    lastFetch = Date.now()
    return data
  }
}
```

### 2. Request Debouncing

```javascript
import { useCallback } from 'react'

const debouncedFetch = useCallback(
  debounce((query) => {
    slaService.getContracts({ search: query })
  }, 500),
  []
)
```

### 3. Lazy Loading

```javascript
useEffect(() => {
  // Load priority data first
  dashboardService.getMetrics().then(setMetrics)
  
  // Load secondary data after short delay
  setTimeout(() => {
    dashboardService.getCompliance().then(setCompliance)
  }, 500)
}, [])
```

## Troubleshooting

### Issue: "Network error" on all API calls

**Solution**: Check that `VITE_API_URL` is set and backend is running

### Issue: 401 Unauthorized responses

**Solution**: Verify JWT token is being sent. Check:
```javascript
// In browser console
localStorage.getItem('sla_sentinel_auth_token')
```

### Issue: CORS errors

**Solution**: Backend must include CORS headers:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Issue: Stale data after updates

**Solution**: Clear cache and refetch:
```javascript
// After creating/updating data
await dashboardService.getMetrics() // Will refetch from API
```

## Future Enhancements

- [ ] Add request cancellation on component unmount
- [ ] Implement real-time updates via WebSocket
- [ ] Add request queuing for offline support
- [ ] Implement automatic retry with exponential backoff
- [ ] Add request/response logging for debugging
- [ ] Create custom hooks (useMetrics, useSLAStatus, etc.)
- [ ] Add analytics tracking for API calls

