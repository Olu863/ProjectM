# 🚀 React Integration Guide - ProjectM API

## Complete Implementation Guide

This guide covers full integration of your React app with the ProjectM API backend.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Authentication](#authentication)
3. [API Configuration](#api-configuration)
4. [Data Fetching](#data-fetching)
5. [Error Handling](#error-handling)
6. [Token Management](#token-management)
7. [Protected Routes](#protected-routes)
8. [Complete Examples](#complete-examples)

---

## Setup

### 1. Create Environment File

Create `.env.local` in your React project root:

```bash
# .env.local
VITE_API_URL=https://localhost:7008/api
VITE_API_TIMEOUT=10000
VITE_LOG_REQUESTS=true
```

**Note:** Never commit `.env.local` to Git. Add to `.gitignore`:
```
.env.local
.env.*.local
```

### 2. Install Dependencies (Optional)

Your API client already uses `fetch` (no external dependencies needed).

If you want to use `axios` instead:
```bash
npm install axios
```

---

## Authentication

### Option 1: JWT Token in Header (Recommended)

**Step 1: Login**
```javascript
// src/pages/OperationsLogin.jsx
import { authService } from '../services/authService.js'
import { useNavigate } from 'react-router-dom'

export default function OperationsLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const result = await authService.loginOperations(email, password)
      
      if (result.success) {
        // Token automatically stored by authService
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

**Step 2: Initialize Auth on App Startup**
```javascript
// src/App.jsx
import { useEffect } from 'react'
import { authService } from './services/authService.js'

export default function App() {
  useEffect(() => {
    // Restore authentication from storage on app load
    authService.initializeFromStorage()
  }, [])

  return (
    // ... your routes
  )
}
```

### Option 2: Cookie-Based (Alternative)

Update `api.js` to use credentials:
```javascript
// src/services/api.js

class APIClient {
  async request(endpoint, options = {}) {
    const fetchOptions = {
      ...options,
      credentials: 'include', // Auto-include cookies
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    }
    
    // ... rest of request logic
  }
}
```

Then login with cookie endpoint:
```javascript
const result = await apiClient.post('/Users/login-with-cookie', {
  email: 'user@example.com',
  password: 'password123'
})
```

---

## API Configuration

### Update Base URL

The API client already reads from `.env.local`:

```javascript
// src/services/api.js
const baseURL = process.env.VITE_API_URL || 'http://localhost:3000/api'

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.timeout = process.env.VITE_API_TIMEOUT || 10000
  }
  // ...
}
```

### Enable Request Logging

For debugging, enable request logging:

```javascript
// src/services/api.js
async request(endpoint, options = {}) {
  const url = `${this.baseURL}${endpoint}`
  
  if (process.env.VITE_LOG_REQUESTS === 'true') {
    console.log(`[API] ${options.method || 'GET'} ${url}`)
  }
  
  // ... rest of request logic
}
```

---

## Data Fetching

### Simple Data Fetch

```javascript
import { useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService.js'

function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getMetrics()
        setMetrics(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <h2>Active SLAs: {metrics.activeSLAs}</h2>
      <p>Uptime: {metrics.uptime}%</p>
    </div>
  )
}

export default Dashboard
```

### Parallel Data Fetching

Fetch multiple endpoints at once:

```javascript
useEffect(() => {
  const fetchAll = async () => {
    try {
      const [metrics, compliance, schedules] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getComplianceByRegion(),
        dashboardService.getSchedules(),
      ])
      
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

### Conditional Data Fetching

Refetch when filters change:

```javascript
const [filters, setFilters] = useState({ type: '', region: '' })
const [contracts, setContracts] = useState([])

useEffect(() => {
  const fetchFiltered = async () => {
    try {
      const data = await slaService.getContracts({
        type: filters.type,
        region: filters.region,
      })
      setContracts(data)
    } catch (err) {
      setError(err)
    }
  }

  fetchFiltered()
}, [filters.type, filters.region]) // Refetch when filters change
```

---

## Error Handling

### Basic Error Handling

```javascript
async function handleAPICall() {
  try {
    const data = await dashboardService.getMetrics()
    return data
  } catch (error) {
    if (error.status === 401) {
      // Token expired or invalid
      console.error('Authentication failed')
      redirectToLogin()
    } else if (error.status === 403) {
      // User doesn't have permission
      console.error('Access denied')
    } else if (error.status === 404) {
      // Resource not found
      console.error('Resource not found')
    } else {
      // Generic error
      console.error('API error:', error.message)
    }
  }
}
```

### Error Boundary Component

```javascript
// src/components/ErrorBoundary.jsx
import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Caught error:', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

Usage:
```javascript
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

---

## Token Management

### Auto-Refresh on Expiry

Update `api.js` to automatically refresh tokens:

```javascript
// src/services/api.js
async request(endpoint, options = {}) {
  try {
    // Attempt request
    return await this._makeRequest(endpoint, options)
  } catch (error) {
    // If 401, try to refresh token
    if (error.status === 401 && this.authToken) {
      try {
        // Refresh token
        await authService.refreshToken()
        
        // Retry original request
        return await this._makeRequest(endpoint, options)
      } catch (refreshError) {
        // Refresh failed, logout user
        authService.logout()
        window.location.href = '/login'
        throw refreshError
      }
    }
    
    throw error
  }
}

async _makeRequest(endpoint, options) {
  // Actual fetch implementation
  const url = `${this.baseURL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      ...this.defaultHeaders,
      ...options.headers,
      ...(this.authToken && { 
        Authorization: `Bearer ${this.authToken}`
      }),
    },
  })

  if (!response.ok) {
    throw new APIError(
      response.statusText,
      response.status,
      await response.json()
    )
  }

  return response.json()
}
```

### Manual Token Refresh

```javascript
import { authService } from '../services/authService.js'

async function refreshAccessToken() {
  try {
    const newToken = await authService.refreshToken()
    console.log('Token refreshed successfully')
    return newToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    // Redirect to login
    window.location.href = '/login'
  }
}
```

---

## Protected Routes

### Create ProtectedRoute Component

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService.js'

export function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}
```

### Use in App Routes

```javascript
// src/App.jsx
import { ProtectedRoute } from './components/ProtectedRoute'
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<OperationsLogin />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

---

## Complete Examples

### Example 1: Login Page

```javascript
// src/pages/OperationsLogin.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService.js'

export default function OperationsLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberDevice: false,
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await authService.loginOperations(
        formData.email,
        formData.password,
        formData.rememberDevice
      )

      if (result.success) {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome back</h1>
          <p>SLA Sentinel Operations</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@company.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={isPasswordVisible ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="toggle-password"
              >
                {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-group checkbox">
            <input
              id="remember"
              type="checkbox"
              name="rememberDevice"
              checked={formData.rememberDevice}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="remember">Remember this device</label>
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/client/login">Sign in as Client</a>
          <span className="divider">•</span>
          <a href="#">Forgot password?</a>
        </div>
      </div>
    </div>
  )
}
```

### Example 2: Dashboard with API Integration

```javascript
// src/pages/ExecutiveDashboard.jsx
import { useState, useEffect } from 'react'
import { dashboardService } from '../services/dashboardService.js'

export default function ExecutiveDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retrying, setRetrying] = useState(false)

  const fetchDashboardData = async () => {
    setError(null)
    
    try {
      // Fetch all data in parallel
      const [metrics, compliance, schedules, lastSync] = await Promise.all([
        dashboardService.getMetrics(),
        dashboardService.getComplianceByRegion(),
        dashboardService.getSchedules(),
        dashboardService.getLastSync(),
      ])

      setData({
        metrics,
        compliance,
        schedules,
        lastSync,
      })
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError('Unable to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    setLoading(true)
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="page">
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#d7263d' }}>{error}</p>
          <button 
            className="btn-primary"
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  const { metrics, compliance, schedules, lastSync } = data

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Executive Dashboard</h1>
          <p className="page-subtitle">
            {metrics?.uptime >= 99 ? 'System Nominal' : 'System Alert'}
          </p>
        </div>
        <div className="sync-summary">
          <span>Last Sync</span>
          <strong>{lastSync}</strong>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid-4">
        <div className="card metric-card">
          <div className="metric-top">
            <div className="metric-label">Active SLAs</div>
            <span className="metric-icon metric-icon-primary">✓</span>
          </div>
          <div className="metric-value">
            {metrics?.activeSLAs?.toLocaleString()}
          </div>
          <div className="metric-sub metric-positive">+12 this month</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <div className="metric-label">Pending</div>
            <span className="metric-icon metric-icon-muted">⏰</span>
          </div>
          <div className="metric-value">{metrics?.pending}</div>
          <div className="metric-sub">Action required</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <div className="metric-label">Uptime</div>
            <span className="metric-icon metric-icon-success">⚡</span>
          </div>
          <div className="metric-value">{metrics?.uptime}%</div>
          <div className="metric-sub metric-positive">Global Avg</div>
        </div>

        <div className="card metric-card">
          <div className="metric-top">
            <div className="metric-label">Open PFIs</div>
            <span className="metric-icon metric-icon-critical">!</span>
          </div>
          <div className="metric-value critical">{metrics?.openPFIs}</div>
          <div className="metric-sub critical">
            {metrics?.criticalPFIs} Critical
          </div>
        </div>
      </div>

      {/* Compliance & Schedules */}
      <div className="grid-2 mt-lg">
        <div className="card">
          <div className="card-header"><h2>SLA Compliance</h2></div>
          <div className="compliance-list">
            {compliance?.map((region) => (
              <div key={region.region} className="compliance-row">
                <div className="compliance-label">
                  <span>{region.region}</span>
                  <strong>{region.compliance}%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${region.compliance}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Schedules</h2>
            <button className="text-button">View All</button>
          </div>
          <div className="schedule-list">
            {schedules?.map((schedule) => (
              <div key={schedule.id} className="schedule-item">
                <div>
                  <div className="schedule-title">{schedule.title}</div>
                  <div className="schedule-meta">
                    {schedule.location} - {schedule.equipmentId}
                  </div>
                </div>
                <div className="schedule-timing">
                  {schedule.date}
                  <span className={`badge ${
                    schedule.status === 'Scheduled' ? 'muted' : 'warning'
                  }`}>
                    {schedule.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Example 3: Data List with Filters

```javascript
// src/pages/SLAProposalManagement.jsx
import { useState, useEffect } from 'react'
import { slaService } from '../services/slaService.js'

export default function SLAProposalManagement() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    region: '',
  })
  const [activity, setActivity] = useState([])

  // Fetch contracts when filters change
  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true)
      try {
        const data = await slaService.getContracts({
          type: filters.type || undefined,
          region: filters.region || undefined,
        })
        setContracts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [filters.type, filters.region])

  // Fetch proposal activity on mount
  useEffect(() => {
    slaService.getProposalActivity()
      .then(setActivity)
      .catch(err => console.error('Failed to fetch activity:', err))
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>SLA & Proposal Management</h1>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header"><h3>Filter Contracts</h3></div>
        <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="SLA">SLA</option>
            <option value="Proposal">Proposal</option>
          </select>

          <select
            name="region"
            value={filters.region}
            onChange={handleFilterChange}
          >
            <option value="">All Regions</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja</option>
            <option value="Port Harcourt">Port Harcourt</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="card">
        <div className="card-header"><h2>Contracts</h2></div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            Loading contracts...
          </div>
        ) : contracts.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
            No contracts found
          </div>
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Client</th>
                <th>Region</th>
                <th>Term</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(contract => (
                <tr key={contract.id}>
                  <td>{contract.client}</td>
                  <td>{contract.region}</td>
                  <td>{contract.term}</td>
                  <td>
                    <span className={`badge ${contract.tone}`}>
                      {contract.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header"><h2>Proposal Activity</h2></div>
        <div style={{ padding: '1rem' }}>
          {activity.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: item.status === 'complete' ? '#2a9d8f' : '#999',
                marginTop: '6px',
              }} />
              <div>
                <strong>{item.title}</strong>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 🧪 Testing Checklist

- [ ] Login works and stores token
- [ ] Dashboard loads data from API
- [ ] Filters trigger data refetch
- [ ] Error handling displays properly
- [ ] Token refresh works on 401
- [ ] Logout clears session
- [ ] Protected routes work
- [ ] Loading states display
- [ ] Empty states display

---

## 🚀 Next Steps

1. ✅ Create `.env.local` with API URL
2. ✅ Update login pages with `authService`
3. ✅ Update all pages to fetch real data
4. ✅ Test with backend
5. ✅ Add error handling
6. ✅ Deploy to production

**Ready?** Let's integrate! 🎉

