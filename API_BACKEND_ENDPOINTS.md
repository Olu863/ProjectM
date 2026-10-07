# ProjectM API - Complete Endpoint Documentation

## 🔐 Authentication Required
All endpoints require Bearer JWT token in Authorization header:
```
Authorization: Bearer {jwt_token}
```

### How to Get JWT Token
**Endpoint**: `POST /api/Users/login`
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**: Returns JWT token to use for other API calls

---

## 📋 Complete API Endpoints List

### 1. **ClientCompanies** (Client Management)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ClientCompanies` | List all client companies |
| POST | `/api/ClientCompanies` | Create new client company |
| GET | `/api/ClientCompanies/{id}` | Get company by ID |
| PUT | `/api/ClientCompanies/{id}` | Update company |
| DELETE | `/api/ClientCompanies/{id}` | Delete company |
| GET | `/api/ClientCompanies/user/{userId}` | Get companies by user |
| GET | `/api/ClientCompanies/state/{state}` | Get companies by state |

---

### 2. **Notifications** (User Notifications)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Notifications/my-notifications` | Get user's notifications |
| GET | `/api/Notifications/unread` | Get unread notifications |
| GET | `/api/Notifications/unread-count` | Count unread notifications |
| GET | `/api/Notifications/{id}` | Get notification by ID |
| DELETE | `/api/Notifications/{id}` | Delete notification |
| POST | `/api/Notifications` | Create new notification |
| POST | `/api/Notifications/{id}/mark-read` | Mark notification as read |
| POST | `/api/Notifications/mark-all-read` | Mark all as read |

---

### 3. **PFIs** (Professional Fee Items)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/PFIs` | List all PFIs |
| POST | `/api/PFIs` | Create new PFI |
| GET | `/api/PFIs/{id}` | Get PFI by ID |
| PUT | `/api/PFIs/{id}` | Update PFI |
| DELETE | `/api/PFIs/{id}` | Delete PFI |
| GET | `/api/PFIs/repair/{repairId}` | Get PFIs for specific repair |
| GET | `/api/PFIs/status/{status}` | Get PFIs by status |
| POST | `/api/PFIs/{id}/approve` | Approve PFI |

---

### 4. **Repairs** (Maintenance & Repairs)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Repairs` | List all repairs |
| POST | `/api/Repairs` | Create new repair ticket |
| GET | `/api/Repairs/{id}` | Get repair by ID |
| PUT | `/api/Repairs/{id}` | Update repair |
| DELETE | `/api/Repairs/{id}` | Delete repair |
| GET | `/api/Repairs/client/{clientId}` | Get repairs by client |
| GET | `/api/Repairs/technician/{technicianId}` | Get repairs by technician |
| GET | `/api/Repairs/status/{status}` | Get repairs by status |
| POST | `/api/Repairs/{id}/assign-technician/{technicianId}` | Assign technician |
| POST | `/api/Repairs/{id}/update-status` | Update repair status |
| POST | `/api/Repairs/{id}/complete` | Mark repair complete |

---

### 5. **SLAs** (Service Level Agreements)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/SLAs` | List all SLAs |
| POST | `/api/SLAs` | Create new SLA |
| GET | `/api/SLAs/{id}` | Get SLA by ID |
| PUT | `/api/SLAs/{id}` | Update SLA |
| DELETE | `/api/SLAs/{id}` | Delete SLA |
| GET | `/api/SLAs/client/{clientId}` | Get SLAs by client |
| GET | `/api/SLAs/status/{status}` | Get SLAs by status |
| POST | `/api/SLAs/{id}/activate` | Activate SLA |
| POST | `/api/SLAs/{id}/deactivate` | Deactivate SLA |

---

### 6. **Users** (Authentication & User Management)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Users/{id}` | Get user by ID |
| PUT | `/api/Users/{id}` | Update user |
| DELETE | `/api/Users/{id}` | Delete user |
| POST | `/api/Users/register` | Register new user |
| **POST** | **`/api/Users/login`** | **Login to get JWT token** ⭐ |
| POST | `/api/Users/login-with-cookie` | Login with cookie auth |
| POST | `/api/Users/refresh-token` | Refresh JWT token |
| POST | `/api/Users/refresh-token-cookie` | Refresh with cookie |
| POST | `/api/Users/logout` | Logout user |
| POST | `/api/Users/logout-all-devices` | Logout all sessions |

---

## 🧪 Testing the APIs

### Step 1: Get JWT Token
```bash
curl -X POST "https://localhost:7008/api/Users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "..." }
}
```

### Step 2: Use Token for API Calls
```bash
curl -X GET "https://localhost:7008/api/ClientCompanies" \
  -H "Authorization: Bearer {token_from_step1}"
```

---

## 📱 Integration with React API Services

The services I created earlier (`dashboardService.js`, `slaService.js`, etc.) are ready to integrate with these endpoints. Simply update the `VITE_API_URL` environment variable:

```bash
# .env file
VITE_API_URL=https://localhost:7008/api
```

Then the API services will automatically:
- Call the correct endpoints
- Handle authentication with Bearer tokens
- Parse responses
- Provide mock fallbacks

### Example Usage in React:
```javascript
import { dashboardService } from '../services/dashboardService.js'

// Fetch SLAs
const slas = await slaService.getContracts()

// Fetch repairs
const repairs = await maintenanceService.getTickets()

// Fetch client data
const client = await clientService.getClientProfile('ACC-DGT-001')
```

---

## 🔗 API Base URL
```
https://localhost:7008/api
```

## 📚 Swagger UI
```
https://localhost:7008/swagger/index.html
```

---

## ✅ Implementation Checklist

- [ ] Update `VITE_API_URL` in `.env`
- [ ] Get test user credentials (email/password)
- [ ] Test login endpoint to get JWT token
- [ ] Test each endpoint group with valid token
- [ ] Integrate token into React app via `authService.js`
- [ ] Connect all page components to API services
- [ ] Test with real backend data
- [ ] Handle error responses (401, 404, 500)
- [ ] Implement token refresh on expiry
- [ ] Add loading and error states to UI

---

## 🚀 Next Steps

**Immediate Actions:**
1. **Provide test credentials** (email and password)
2. **Test the login endpoint** to verify API is working
3. **Update React environment** with API_URL
4. **Integrate authService** into login pages
5. **Test each API group** with mock data

**Questions for Your Backend:**
- What are the test user credentials?
- Do user registrations require email verification?
- What is the JWT token expiry time?
- Are there role-based access controls (admin, user, technician)?
- What response format do POST endpoints expect for creating new records?

