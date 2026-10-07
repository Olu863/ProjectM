# 📚 ProjectM API Frontend Integration - Summary

## 🎯 Quick Overview

Your **ProjectM API** uses **JWT Authentication with Cookies**. This document provides the fastest path to integration.

## 🚀 In 3 Steps

### Step 1: Update Environment
Create `.env.local` in your React project:
```bash
VITE_API_URL=https://localhost:7008/api
VITE_API_TIMEOUT=10000
```

### Step 2: Use API Services
```javascript
import { authService } from './services/authService.js'
import { dashboardService } from './services/dashboardService.js'

// Login
const result = await authService.loginOperations('email@example.com', 'password')

// Get dashboard data
const metrics = await dashboardService.getMetrics()
```

### Step 3: Handle Responses
```javascript
import { useState, useEffect } from 'react'

function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardService.getMetrics()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return <div>{data.activeSLAs}</div>
}
```

---

## 🔐 Authentication Methods

Your API supports **two authentication patterns**:

### Pattern 1: JWT Token + Header (Recommended for SPAs)
```javascript
// Login gets JWT
const { data } = await api.post('/Users/login', { email, password })
const token = data.token

// Use token in Authorization header
const response = await api.get('/ClientCompanies', {
  headers: { 'Authorization': `Bearer ${token}` }
})

// Store in sessionStorage (not localStorage for security)
sessionStorage.setItem('token', token)
```

### Pattern 2: Cookie-Based (Alternative)
```javascript
// Login returns HTTP-only cookie automatically
await api.post('/Users/login-with-cookie', { email, password }, {
  withCredentials: true
})

// Subsequent requests auto-include cookie
const response = await api.get('/ClientCompanies', {
  withCredentials: true
})
```

---

## 📋 API Endpoint Groups

| Group | Count | Purpose |
|-------|-------|---------|
| **Users** | 10 | Login, register, token refresh, logout |
| **ClientCompanies** | 7 | Manage client companies |
| **Repairs** | 11 | Maintenance & repair tickets |
| **SLAs** | 9 | Service level agreements |
| **PFIs** | 8 | Professional fee items (cost approvals) |
| **Notifications** | 8 | User notifications |

---

## ✨ Service Layer (Already Built!)

Your React app already has these services ready:

### `dashboardService.js`
```javascript
await dashboardService.getMetrics()        // KPI metrics
await dashboardService.getComplianceByRegion() // Regional compliance
await dashboardService.getSchedules()      // Maintenance schedules
```

### `slaService.js`
```javascript
await slaService.getContracts(filters)     // Get contracts
await slaService.getProposalActivity()     // Proposal timeline
await slaService.createProposal(data)      // Create proposal
```

### `maintenanceService.js`
```javascript
await maintenanceService.getTickets(filters) // Repair tickets
await maintenanceService.getPFIStatus()      // PFI summary
await maintenanceService.logRepairTicket(data) // Log new ticket
```

### `clientService.js`
```javascript
await clientService.getSLAStatus(clientId)   // Client SLA view
await clientService.getTickets(clientId)     // Client tickets
await clientService.getAlerts(clientId)      // Pending alerts
```

### `authService.js`
```javascript
await authService.loginOperations(email, password)  // Operations login
await authService.loginClient(email, password)      // Client login
await authService.logout()                          // Logout
await authService.refreshToken()                    // Refresh JWT
```

---

## 🎯 Integration Checklist

### Phase 1: Configuration (5 min)
- [ ] Create `.env.local` with `VITE_API_URL`
- [ ] Verify API is running on `https://localhost:7008`
- [ ] Get test credentials from backend team

### Phase 2: Authentication (10 min)
- [ ] Update `OperationsLogin.jsx` to use `authService.loginOperations()`
- [ ] Update `ClientLogin.jsx` to use `authService.loginClient()`
- [ ] Add error handling to login forms
- [ ] Test login flow

### Phase 3: Page Integration (15 min)
- [ ] Update `ExecutiveDashboard.jsx` - Already done! ✅
- [ ] Update `SLAProposalManagement.jsx` to use `slaService`
- [ ] Update `MaintenanceOpsMatrix.jsx` to use `maintenanceService`
- [ ] Update `ClientPortalDashboard.jsx` to use `clientService`

### Phase 4: Error Handling (10 min)
- [ ] Add try/catch to all API calls
- [ ] Implement 401 unauthorized handling
- [ ] Add token refresh logic
- [ ] Display user-friendly error messages

### Phase 5: Testing (10 min)
- [ ] Test each API endpoint
- [ ] Verify loading states work
- [ ] Verify error states work
- [ ] Test token expiry and refresh

---

## 🔗 Connecting to Backend

### Update `api.js` Base URL
```javascript
// In src/services/api.js

class APIClient {
  constructor(baseURL = process.env.VITE_API_URL || 'http://localhost:3000/api') {
    this.baseURL = baseURL
    // ... rest of code
  }
}
```

### Handle Authentication Responses
```javascript
// When login returns token
const { data } = await apiClient.post('/Users/login', { email, password })
apiClient.setAuthToken(data.token)  // Auto-adds to all future requests

// When 401 Unauthorized (token expired)
catch (error) {
  if (error.status === 401) {
    // Attempt refresh
    const newToken = await authService.refreshToken()
    apiClient.setAuthToken(newToken)
    // Retry original request
  }
}
```

---

## 🧪 Quick Test

Use the HTML test page or Postman to verify:

### 1. Login
```bash
POST https://localhost:7008/api/Users/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Use Token
```bash
GET https://localhost:7008/api/ClientCompanies
Authorization: Bearer {token_from_step1}
```

### 3. Expected Response
```json
[
  {
    "id": "123",
    "name": "Company Name",
    "state": "Lagos",
    "userId": "user-id"
  }
]
```

---

## 🚨 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing/invalid token | Login first, check token in header |
| CORS Error | Frontend not in CORS policy | Add origin to `Program.cs` |
| Empty responses | API issue | Check Swagger UI at `/swagger` |
| 404 Not Found | Wrong endpoint | Verify endpoint in Swagger |
| Timeout | API too slow | Increase timeout in `.env` |

---

## 📊 Data Flow

```
┌─────────────────┐
│   React Login   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /Users/login          │
│  {email, password}          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  API Returns JWT Token      │
│  {token: "eyJ..."}          │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Store Token (sessionStorage)    │
│  Add to Authorization Header     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  GET /ClientCompanies                │
│  Header: Authorization: Bearer {token}
└────────┬─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  API Returns Data           │
│  [{id, name, state, ...}]   │
└─────────────────────────────┘
```

---

## 🎓 Next Steps

1. **Read [react-integration.md](react-integration.md)** for complete React implementation
2. **Get test credentials** from your backend team
3. **Update `.env.local`** with API URL
4. **Update login pages** to use `authService`
5. **Test each page** with real backend data
6. **Deploy** to production

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/services/api.js` | Base HTTP client |
| `src/services/authService.js` | Login, logout, token management |
| `src/services/dashboardService.js` | Dashboard data |
| `src/services/slaService.js` | SLA & proposal data |
| `src/services/maintenanceService.js` | Repair & maintenance data |
| `src/services/clientService.js` | Client portal data |
| `.env.local` | API configuration (create this!) |

---

## 🆘 Need Help?

- **How to login?** → See `react-integration.md` - Login Section
- **How to fetch data?** → See `react-integration.md` - Data Fetching Section
- **How to handle errors?** → See `react-integration.md` - Error Handling Section
- **Full implementation?** → See `react-integration.md` - Complete Example

**Ready to integrate?** Jump to [react-integration.md](react-integration.md)! 🚀

