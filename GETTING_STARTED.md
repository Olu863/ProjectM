# 🚀 Complete Frontend Integration Package

## 📚 Documentation Files

I've created comprehensive documentation to guide your integration:

| File | Purpose | Read When |
|------|---------|-----------|
| **INTEGRATION_SUMMARY.md** | 🌟 **START HERE** - Quick overview & key concepts | New to integration |
| **REACT_INTEGRATION.md** | Complete React implementation guide with examples | Building with React |
| **ENVIRONMENT_SETUP.md** | Configuration, troubleshooting, deployment | Setting up environments |
| **API_BACKEND_ENDPOINTS.md** | Complete API reference documentation | Need endpoint details |
| **API_SERVICES_GUIDE.md** | Service layer architecture & patterns | Understanding the services |
| **.env.local.example** | Copy this file to `.env.local` | Setting up configuration |

---

## ✅ Quick Setup (5 minutes)

### Step 1: Copy Environment File
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```bash
VITE_API_URL=https://localhost:7008/api
VITE_LOG_REQUESTS=true
```

### Step 2: Ensure Backend is Running
```bash
# In another terminal
cd ProjectM.API
dotnet run
# Should show: Now listening on: https://localhost:7008
```

### Step 3: Restart Frontend
```bash
npm run dev
# Vite should show: Local: http://127.0.0.1:5173/
```

### Step 4: Test Login
Open browser console and try:
```javascript
// In browser console
await (await fetch('https://localhost:7008/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'test@example.com',
    password: 'password123'
  })
})).json()
```

You should get back a JWT token.

---

## 🎯 Integration Roadmap

### Phase 1: Authentication (10 min)
- [ ] Create `.env.local` with API URL
- [ ] Get test credentials from backend team
- [ ] Verify login endpoint works (see step 4 above)
- [ ] Update `OperationsLogin.jsx` to use `authService.loginOperations()`
- [ ] Update `ClientLogin.jsx` to use `authService.loginClient()`
- [ ] Test login flow in browser

### Phase 2: API Integration (15 min)
- [ ] Update `ExecutiveDashboard.jsx` ✅ (already done!)
- [ ] Update `SLAProposalManagement.jsx` to use `slaService`
- [ ] Update `MaintenanceOpsMatrix.jsx` to use `maintenanceService`
- [ ] Update `ClientPortalDashboard.jsx` to use `clientService`
- [ ] Add loading states to each page

### Phase 3: Error Handling (10 min)
- [ ] Add try/catch to login forms
- [ ] Handle 401 Unauthorized (redirect to login)
- [ ] Display user-friendly error messages
- [ ] Implement token refresh on expiry

### Phase 4: Testing (10 min)
- [ ] Login and verify token stored
- [ ] Test each dashboard page loads data
- [ ] Test error handling (disable API, check error message)
- [ ] Test logout and redirect to login
- [ ] Test token refresh on 401

### Phase 5: Production Ready (5 min)
- [ ] Create `.env.production.local` with production API URL
- [ ] Run `npm run build`
- [ ] Test production build locally
- [ ] Deploy to your hosting platform

---

## 🔐 API Authentication

Your ProjectM API uses **JWT Bearer Tokens**. Here's the flow:

```
1. POST /api/Users/login
   {email, password}
   ↓
2. Get JWT token in response
   {token: "eyJ...", user: {...}}
   ↓
3. Store token in sessionStorage
   ↓
4. Use in Authorization header for all requests
   Authorization: Bearer {token}
```

**Implementation is already in:**
- `src/services/authService.js` - Login/logout/token management
- `src/services/api.js` - Auto-adds token to all requests

---

## 📋 Key Services (Already Built!)

Your React app has 5 pre-built services ready to use:

### 1. **authService** - Authentication
```javascript
import { authService } from './services/authService.js'

// Login
await authService.loginOperations(email, password)
await authService.loginClient(email, password)

// Logout
authService.logout()

// Token management
await authService.refreshToken()
authService.isAuthenticated()
```

### 2. **dashboardService** - Executive Dashboard
```javascript
import { dashboardService } from './services/dashboardService.js'

await dashboardService.getMetrics()
await dashboardService.getComplianceByRegion()
await dashboardService.getSchedules()
await dashboardService.getLastSync()
```

### 3. **slaService** - SLA & Proposals
```javascript
import { slaService } from './services/slaService.js'

await slaService.getContracts(filters)
await slaService.getProposalActivity()
await slaService.createProposal(data)
```

### 4. **maintenanceService** - Repairs & Maintenance
```javascript
import { maintenanceService } from './services/maintenanceService.js'

await maintenanceService.getTickets(filters)
await maintenanceService.getPFIStatus()
await maintenanceService.logRepairTicket(data)
```

### 5. **clientService** - Client Portal
```javascript
import { clientService } from './services/clientService.js'

await clientService.getSLAStatus(clientId)
await clientService.getTickets(clientId)
await clientService.getAlerts(clientId)
```

---

## 🧪 Quick Test Endpoints

### Test 1: Verify API is Running
```bash
# Should return without error
curl https://localhost:7008/swagger/index.html
```

### Test 2: Login
```bash
curl -X POST https://localhost:7008/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@example.com",
    "password":"admin123"
  }'

# Response should include: {"token":"eyJ...","user":{...}}
```

### Test 3: Use Token
```bash
# Save token from step 2
TOKEN="eyJ..."

# Use in request
curl https://localhost:7008/api/ClientCompanies \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚨 Common Issues & Solutions

### Issue: "CORS error"
**Symptom:** `Access to XMLHttpRequest... has been blocked by CORS policy`

**Solution:** 
1. Ensure backend API is running on `https://localhost:7008`
2. Backend `Program.cs` should have CORS policy configured
3. Your frontend origin (http://127.0.0.1:5173) must be in CORS allowed origins

**Check CORS headers:**
```javascript
// In browser console
fetch('https://localhost:7008/api/users')
  .then(r => console.log('CORS OK:', r.headers.get('Access-Control-Allow-Origin')))
```

### Issue: "401 Unauthorized"
**Symptom:** All API calls return 401 error

**Solution:**
1. Get a valid JWT token by logging in
2. Verify token is stored: `localStorage.getItem('sla_sentinel_auth_token')`
3. Ensure `Authorization: Bearer {token}` header is sent
4. Check token hasn't expired

**Debug:**
```javascript
// In browser console
import { authService } from './services/authService.js'
console.log('Token:', authService.getToken())
console.log('User:', authService.getUser())
console.log('Auth:', authService.isAuthenticated())
```

### Issue: "API URL not found"
**Symptom:** `VITE_API_URL is undefined`

**Solution:**
1. Create `.env.local` file
2. Add `VITE_API_URL=https://localhost:7008/api`
3. Restart dev server: `npm run dev`
4. Verify: `console.log(process.env.VITE_API_URL)`

### Issue: "Self-signed certificate error"
**Symptom:** `SSL_CERTIFICATE_PROBLEM` or similar

**Solution:**
1. For development: Set `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env.local`
2. For production: Use valid SSL certificate
3. Trust the certificate on your system

---

## 📝 Integration Examples

### Example 1: Update Login Page

Current `OperationsLogin.jsx`:
```javascript
// OLD - No API call
const handleLogin = async (e) => {
  e.preventDefault()
  // Mock navigation
  navigate('/')
}
```

Updated `OperationsLogin.jsx`:
```javascript
// NEW - Uses authService
import { authService } from '../services/authService.js'

const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  
  try {
    const result = await authService.loginOperations(email, password)
    if (result.success) {
      navigate('/')
    }
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

### Example 2: Fetch Data in Dashboard

```javascript
import { useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService.js'

function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardService.getMetrics()
      .then(setMetrics)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>SLAs: {metrics.activeSLAs}</div>
}
```

---

## 🎓 Learning Path

**Day 1 - Setup:**
1. Read `INTEGRATION_SUMMARY.md`
2. Create `.env.local`
3. Test login endpoint works

**Day 2 - Implementation:**
1. Read `REACT_INTEGRATION.md`
2. Update login pages
3. Test authentication

**Day 3 - Integration:**
1. Update all page components
2. Test data fetching
3. Handle errors

**Day 4 - Testing:**
1. Test all pages work
2. Test error scenarios
3. Test production build

**Day 5 - Deployment:**
1. Read `ENVIRONMENT_SETUP.md`
2. Create production config
3. Deploy to production

---

## 🔍 File Structure

```
ProjectM/
├── src/
│   ├── services/
│   │   ├── api.js                    # Base HTTP client ✅
│   │   ├── authService.js            # Login/logout/tokens ✅
│   │   ├── dashboardService.js       # Dashboard data ✅
│   │   ├── slaService.js             # SLA & proposals ✅
│   │   ├── maintenanceService.js     # Repairs & maintenance ✅
│   │   └── clientService.js          # Client portal ✅
│   ├── pages/
│   │   ├── OperationsLogin.jsx       # 📝 Update to use authService
│   │   ├── ClientLogin.jsx           # 📝 Update to use authService
│   │   ├── ExecutiveDashboard.jsx    # ✅ Already integrated!
│   │   ├── SLAProposalManagement.jsx # 📝 Update to use slaService
│   │   ├── MaintenanceOpsMatrix.jsx  # 📝 Update to use maintenanceService
│   │   └── ClientPortalDashboard.jsx # 📝 Update to use clientService
│   └── ...
├── .env.local                        # 📝 Create from .env.local.example
├── .env.local.example                # ✅ Provided
├── package.json
└── ...

Documentation:
├── INTEGRATION_SUMMARY.md            # ✅ Quick overview
├── REACT_INTEGRATION.md              # ✅ Complete guide
├── ENVIRONMENT_SETUP.md              # ✅ Configuration
├── API_BACKEND_ENDPOINTS.md          # ✅ Endpoint reference
└── API_SERVICES_GUIDE.md             # ✅ Service architecture
```

---

## ✅ Pre-Integration Checklist

Before you start integrating:

- [ ] Backend API is running (`dotnet run`)
- [ ] API is accessible at `https://localhost:7008`
- [ ] You have test credentials (email & password)
- [ ] `.env.local` is created with correct API URL
- [ ] Dev server is running (`npm run dev`)
- [ ] Browser console shows no errors
- [ ] You can login via Swagger UI or cURL

---

## 🚀 Next Steps

1. **Right Now:**
   - Copy `.env.local.example` to `.env.local`
   - Update `VITE_API_URL` in `.env.local`
   - Restart dev server

2. **Next 5 Minutes:**
   - Read `INTEGRATION_SUMMARY.md`
   - Test login endpoint works

3. **Next 15 Minutes:**
   - Read `REACT_INTEGRATION.md`
   - Update login pages

4. **Next 30 Minutes:**
   - Update all dashboard pages
   - Test each page works

5. **Next Hour:**
   - Add error handling
   - Test error scenarios
   - Test production build

---

## 📞 Stuck?

1. **Check the documentation:**
   - General help → `INTEGRATION_SUMMARY.md`
   - React help → `REACT_INTEGRATION.md`
   - Config help → `ENVIRONMENT_SETUP.md`
   - API help → `API_BACKEND_ENDPOINTS.md`

2. **Enable logging:**
   ```bash
   # In .env.local
   VITE_LOG_REQUESTS=true
   VITE_DEBUG_MODE=true
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Look at Console tab
   - Look at Network tab (see API calls)
   - Look at Application → Cookies (see token)

4. **Verify API is working:**
   ```javascript
   // In browser console
   fetch('https://localhost:7008/api/users/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email: 'test@example.com', password: 'pass' })
   }).then(r => r.json()).then(d => console.log(d))
   ```

---

## 🎉 Success Indicators

You'll know it's working when:

✅ You can log in from the login page
✅ Dashboard shows real data from the API  
✅ Filters work and refetch data
✅ Error messages show when API is down
✅ Logout redirects to login page
✅ Production build works

---

**Ready to integrate?** Start with `INTEGRATION_SUMMARY.md` →

