# API Configuration Guide for FASM Mobile

## Problem: "Network Error" when trying to login

The error occurs because **`localhost` doesn't work in React Native** when running on physical devices or emulators.

## Solution: Use Your Computer's IP Address

### Step 1: Find Your Computer's IP Address

#### Windows:
```bash
ipconfig
```
Look for **IPv4 Address** under your active network adapter (Wi-Fi or Ethernet)
Example: `192.168.1.100`

#### Mac/Linux:
```bash
ifconfig
```
Look for **inet** under your active network adapter (en0 for Wi-Fi, en1 for Ethernet)
Example: `192.168.1.100`

### Step 2: Update API Configuration

Open [`services/config/api.config.ts`](services/config/api.config.ts:19) and change:

**FROM:**
```typescript
baseUrl: 'https://localhost:7104',
```

**TO:**
```typescript
baseUrl: 'https://192.168.1.100:7104',  // Use YOUR actual IP
```

### Step 3: Configure Your API Server

Make sure your API server is:

1. **Running on your computer**
2. **Listening on all interfaces (0.0.0.0)** not just localhost
3. **Allowing connections from your network**

For ASP.NET Core, update `launchSettings.json`:
```json
{
  "applicationUrl": "https://0.0.0.0:7104;http://0.0.0.0:7103"
}
```

### Step 4: SSL Certificate Issues (HTTPS)

If using HTTPS with a self-signed certificate, you may need to:

#### Option A: Use HTTP instead (Development only)
```typescript
baseUrl: 'http://192.168.1.100:7103',  // Use HTTP port
```

#### Option B: Trust the certificate on your device
- For Android: Install the certificate in device settings
- For iOS: Trust the certificate in Settings > General > About > Certificate Trust Settings

### Step 5: Firewall Settings

Ensure your firewall allows incoming connections on port 7104:

#### Windows Firewall:
```powershell
New-NetFirewallRule -DisplayName "FASM API" -Direction Inbound -LocalPort 7104 -Protocol TCP -Action Allow
```

## Testing the Connection

1. Update the IP in [`api.config.ts`](services/config/api.config.ts:19)
2. Restart your Expo app (`r` in terminal or close and reopen)
3. Try to login
4. Check the console logs for the full URL being called

## Common Issues

### Issue: "Network request failed"
- **Cause**: Device can't reach your computer
- **Fix**: Make sure both devices are on the same Wi-Fi network

### Issue: "SSL handshake failed"
- **Cause**: Self-signed certificate not trusted
- **Fix**: Use HTTP for development or trust the certificate

### Issue: "Connection refused"
- **Cause**: API server not running or firewall blocking
- **Fix**: Start API server and check firewall rules

## Example Configuration

If your IP is `192.168.1.100`:

```typescript
export const API_CONFIG = {
  baseUrl: 'http://192.168.1.100:7103',  // HTTP for development
  timeout: 30000,
  endpoints: {
    login: '/api/account/login',
    refreshToken: '/api/account/refresh-token',
    getAuth: '/api/account/me',
  },
} as const;
```

## Verification

The console logs should show:
```
=== API Request ===
Full URL: http://192.168.1.100:7103/api/account/login
Method: POST
...
```

If you see your IP address in the logs, the configuration is correct!