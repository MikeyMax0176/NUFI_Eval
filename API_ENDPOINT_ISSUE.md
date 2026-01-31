# NUFI API Endpoint Resolution Issue

## Problem

The application is receiving a DNS error:
```
getaddrinfo ENOTFOUND api.nufi.mx
```

This means the domain `api.nufi.mx` cannot be resolved to an IP address.

## Possible Causes

1. **Incorrect Base URL** - The actual NUFI API might use a different domain
2. **API Not Accessible** - The API might be behind a firewall or VPN
3. **Placeholder Documentation** - The documentation might not reflect the actual production URL
4. **Trial Access Required** - The API might only be accessible after account activation

## Solutions to Try

### 1. Find the Correct Base URL

You need to obtain the **actual API base URL** from NUFI. Common patterns for Mexican APIs:

- `https://api.nufi.com.mx`
- `https://api-prod.nufi.mx`
- `https://nufi.mx/api/v1`
- `https://services.nufi.com.mx`
- `https://api.nufidata.com`

### 2. Update the Base URL

Once you have the correct URL, update it in your `.env` file:

```bash
# Add this to .env
NUFI_API_BASE_URL=https://[correct-api-domain]
```

Or directly in the code at `/workspaces/NUFI_Eval/server/services/nufiService.js`:

```javascript
const NUFI_BASE_URL = 'https://[correct-api-domain]';
```

### 3. Check Your API Documentation Email

Review the email from NUFI that provided your API keys. It should contain:
- ✅ API Key(s)
- ✅ **API Base URL or Endpoint**
- ✅ Example API calls
- ✅ Authentication method

### 4. Test with curl

Once you have the correct URL, test it:

```bash
# Test if the domain resolves
nslookup [api-domain]

# Test if the API responds
curl -I https://[api-domain]

# Test with authentication
curl -X POST https://[api-domain]/v1/enrichment/phone \
  -H "Content-Type: application/json" \
  -H "x-api-key: b5064493373942c5b54dfdbc1c745f44" \
  -H "x-api-secret: b5064493373942c5b54dfdbc1c745f44" \
  -d '{"phone": "+525512345678"}'
```

## Quick Fix - Using Environment Variable

The code has been updated to use an environment variable for the base URL:

```bash
# In your .env file, add:
NUFI_API_BASE_URL=https://actual-api-url-here
```

Then restart the server:
```bash
npm run server
```

## Contact NUFI Support

If you cannot find the correct API endpoint, contact NUFI support with:

1. Your client name: **Michael Maxwell**
2. Your API keys (they can verify your account)
3. Ask specifically for:
   - The production API base URL
   - Example curl commands
   - Any VPN or IP whitelist requirements

## Testing Without Real API

If you want to test the GUI functionality without the actual API, you could:

1. Create a mock API server
2. Use JSON placeholder data
3. Test with `localhost` mock endpoints

Let me know if you need help setting up a mock server!

---

**Current Status:** DNS resolution failing for `api.nufi.mx`  
**Action Required:** Obtain correct API base URL from NUFI documentation or support  
**Workaround Available:** Set `NUFI_API_BASE_URL` in `.env` once you have the correct URL
