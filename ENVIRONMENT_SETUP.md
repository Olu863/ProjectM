# ⚙️ Environment & Configuration Setup

## Quick Start

### 1. Create `.env.local`

Create a file called `.env.local` in your React project root (same folder as `package.json`):

```bash
# .env.local
VITE_API_URL=https://localhost:7008/api
VITE_API_TIMEOUT=10000
VITE_ENV=development
VITE_LOG_REQUESTS=true
```

**Important:** Never commit `.env.local` to Git! Add to `.gitignore`:
```gitignore
# Environment
.env.local
.env.*.local
.env
```

### 2. Restart Dev Server

After creating `.env.local`, restart your Vite dev server:

```bash
npm run dev
```

---

## Environment Variables Reference

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `VITE_API_URL` | `http://localhost:3000/api` | Backend API base URL | `https://localhost:7008/api` |
| `VITE_API_TIMEOUT` | `10000` | Request timeout in ms | `15000` |
| `VITE_ENV` | `development` | Environment name | `development`, `staging`, `production` |
| `VITE_LOG_REQUESTS` | `false` | Log API requests | `true` or `false` |
| `VITE_DEBUG_MODE` | `false` | Enable debug logging | `true` or `false` |

---

## Environment-Specific Configurations

### Development

**`.env.local`**
```bash
VITE_API_URL=https://localhost:7008/api
VITE_API_TIMEOUT=10000
VITE_ENV=development
VITE_LOG_REQUESTS=true
VITE_DEBUG_MODE=true
```

**Characteristics:**
- ✅ CORS requests allowed
- ✅ Detailed error messages
- ✅ Request logging enabled
- ✅ No token validation issues
- ✅ Hot module reloading works

### Staging

**`.env.staging.local`**
```bash
VITE_API_URL=https://staging-api.your-domain.com/api
VITE_API_TIMEOUT=15000
VITE_ENV=staging
VITE_LOG_REQUESTS=false
VITE_DEBUG_MODE=false
```

**Characteristics:**
- ✅ Real-like environment
- ✅ Staging API backend
- ✅ SSL certificate validation
- ✅ Longer timeouts
- ✅ Error logging enabled

### Production

**`.env.production.local`**
```bash
VITE_API_URL=https://api.your-domain.com/api
VITE_API_TIMEOUT=30000
VITE_ENV=production
VITE_LOG_REQUESTS=false
VITE_DEBUG_MODE=false
```

**Characteristics:**
- ✅ Production API only
- ✅ HTTPS required
- ✅ No sensitive logging
- ✅ Longer timeouts for reliability
- ✅ Error reporting to service

---

## Local Development Setup

### Step 1: Backend API Running

Ensure your backend is running:

```bash
cd ProjectM.API
dotnet run
```

You should see:
```
info: Microsoft.Hosting.Lifetime[0]
  Now listening on: https://localhost:7008
```

### Step 2: Configure Frontend

Create `.env.local`:
```bash
VITE_API_URL=https://localhost:7008/api
```

### Step 3: Handle HTTPS Certificates

On Windows with self-signed certificates:

```bash
# Trust the certificate (run as administrator)
certutil -addstore root "C:\path\to\certificate.cer"

# Or use NODE_TLS_REJECT_UNAUTHORIZED (development only!)
set NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Step 4: Test Connection

In your browser console:

```javascript
fetch('https://localhost:7008/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'test@example.com',
    password: 'password'
  })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e))
```

---

## Handling CORS Issues

### Issue: CORS error when calling API

**Symptoms:**
```
Access to XMLHttpRequest at 'https://localhost:7008/api/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**

In your backend `Program.cs`:

```csharp
// Add CORS policy (line ~24)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",      // Vite default port
                "https://localhost:3000",
                "https://your-domain.com"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Apply CORS middleware (before MapControllers)
app.UseCors("AllowFrontend");
```

### Issue: Credentials not being sent

**Symptoms:**
```
Cookie not being sent with requests
Authorization header stripped
```

**Solution:**

In your `api.js`:

```javascript
// Ensure credentials are included
const response = await fetch(url, {
  credentials: 'include',  // Include cookies
  headers: {
    'Authorization': `Bearer ${token}`,  // Include token
  },
})
```

Or in Axios:

```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  withCredentials: true,  // Include credentials
})
```

---

## SSL/TLS Certificate Issues

### Issue: "Self-signed certificate" error

**Development Solution:**

Create a `.env.local` with:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0
```

Or use the API client with certificate override:

```javascript
// For development only!
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false,
});

const response = await fetch(url, {
  agent: agent,
})
```

**Production Solution:**

- Use a valid SSL certificate from a trusted CA
- Or use self-signed and trust it properly:

```bash
# On Windows
certutil -addstore root "certificate.crt"

# On macOS
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain certificate.crt

# On Linux
sudo cp certificate.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

---

## Token Configuration

### JWT Token Settings

In backend `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "YourSuperSecretKeyAtLeast32CharactersLong!",
    "Issuer": "YourApp",
    "Audience": "YourAppUsers",
    "ExpiryInMinutes": 15
  }
}
```

### Token Refresh Strategy

Recommended setup in `.env.local`:

```bash
# Short-lived access token (15 min)
VITE_ACCESS_TOKEN_EXPIRY=900

# Refresh token lifetime (7 days)
VITE_REFRESH_TOKEN_EXPIRY=604800

# When to auto-refresh (before 2 min expiry)
VITE_REFRESH_THRESHOLD=120
```

Then use in your API service:

```javascript
// Auto-refresh if token expires in < 2 minutes
const REFRESH_THRESHOLD = process.env.VITE_REFRESH_THRESHOLD || 120

if (timeUntilExpiry < REFRESH_THRESHOLD * 1000) {
  await authService.refreshToken()
}
```

---

## API Rate Limiting

### Configure Timeouts

Adjust based on API response times:

```bash
# For slow APIs (30s)
VITE_API_TIMEOUT=30000

# For fast APIs (5s)
VITE_API_TIMEOUT=5000

# Default (10s)
VITE_API_TIMEOUT=10000
```

### Handle Rate Limiting

If your API uses rate limiting headers:

```javascript
// In api.js
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After')
  const delay = (retryAfter || 60) * 1000
  
  // Wait and retry
  await new Promise(resolve => setTimeout(resolve, delay))
  return this.request(endpoint, options)
}
```

---

## Proxy Setup (Optional)

If you need a proxy for local development:

### Vite Configuration

Create `vite.config.js` with proxy:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7008',
        changeOrigin: true,
        secure: false,  // For self-signed certs in dev
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      }
    }
  }
})
```

Then use in `.env.local`:

```bash
VITE_API_URL=/api
```

Benefits:
- ✅ No CORS issues
- ✅ Same-origin requests
- ✅ Cookies work automatically
- ✅ Good for development

---

## Debugging Configuration Issues

### Enable Request Logging

In `.env.local`:

```bash
VITE_LOG_REQUESTS=true
VITE_DEBUG_MODE=true
```

Then in browser console, you'll see:

```
[API] GET https://localhost:7008/api/ClientCompanies
[API] POST https://localhost:7008/api/Users/login
[API] Response: { token: "...", user: {...} }
```

### Check API is Accessible

```javascript
// In browser console
fetch('https://localhost:7008/api/users', {
  method: 'GET'
})
.then(r => console.log(r.status))
.catch(e => console.error(e))
```

### Verify Token is Stored

```javascript
// In browser console
console.log(localStorage.getItem('sla_sentinel_auth_token'))
console.log(sessionStorage.getItem('sla_sentinel_auth_token'))
```

### Check CORS Headers

```javascript
// In browser console, inspect response headers
fetch('https://localhost:7008/api/users')
.then(r => {
  console.log('Status:', r.status)
  console.log('CORS Headers:', {
    'Access-Control-Allow-Origin': r.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': r.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': r.headers.get('Access-Control-Allow-Headers'),
  })
})
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Set `VITE_ENV=production` in `.env.production.local`
- [ ] Use real HTTPS certificates (not self-signed)
- [ ] Update `VITE_API_URL` to production API
- [ ] Set strong JWT secret (32+ characters, random)
- [ ] Enable HTTPS only in CORS policy
- [ ] Set `Secure` flag on cookies
- [ ] Disable debug logging
- [ ] Set appropriate timeouts
- [ ] Test login flow end-to-end
- [ ] Verify tokens are stored securely

### Environment Variables for Production

```bash
VITE_API_URL=https://api.your-domain.com/api
VITE_API_TIMEOUT=20000
VITE_ENV=production
VITE_LOG_REQUESTS=false
VITE_DEBUG_MODE=false
```

### Build Command

```bash
npm run build
```

This reads from `.env.production.local` automatically.

---

## Troubleshooting Checklist

| Problem | Check | Solution |
|---------|-------|----------|
| API not found | Is API running? | `dotnet run` in API folder |
| CORS error | Frontend origin in CORS policy? | Add to `Program.cs` |
| Login fails | Correct credentials? | Check backend user table |
| 401 on requests | Token in Authorization header? | Check `authService.setToken()` |
| Empty responses | API returning data? | Test with Postman |
| Timeout errors | API too slow? | Increase `VITE_API_TIMEOUT` |
| Certificate error | Self-signed? | Trust cert or set `NODE_TLS_REJECT_UNAUTHORIZED=0` |

---

## Next Steps

1. ✅ Create `.env.local` with `VITE_API_URL`
2. ✅ Restart dev server (`npm run dev`)
3. ✅ Update login page to use `authService`
4. ✅ Test login flow
5. ✅ Update dashboard pages to fetch data
6. ✅ Test error handling
7. ✅ Deploy to staging
8. ✅ Deploy to production

**Ready to deploy?** Run:
```bash
npm run build
```

Then deploy the `dist/` folder to your hosting! 🚀

