# NUFI API Testing GUI - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                               │
│                      http://localhost:3000                           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTP Requests
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                    REACT FRONTEND (Port 3000)                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  App.js (Main Application)                                    │  │
│  │  ├─ State Management (selectedApi, results, loading, error)  │  │
│  │  └─ Stats Fetching                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │  StatsBar    │  │  InputPanel  │  │    ResultsPanel          │ │
│  │              │  │              │  │                          │ │
│  │ • Total Reqs │  │ • API Select │  │ • Table/JSON Toggle      │ │
│  │ • By Type    │  │ • Input Form │  │ • Results Display        │ │
│  │ • Errors     │  │ • Submit Btn │  │ • Export Buttons         │ │
│  │ • Uptime     │  │ • Validation │  │   - CSV                  │ │
│  └──────────────┘  └──────────────┘  │   - JSON                 │ │
│                                       │   - DOC                  │ │
│                                       └──────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  exportUtils.js                                               │  │
│  │  • flattenObject()                                            │  │
│  │  • exportToCSV()                                              │  │
│  │  • exportToJSON()                                             │  │
│  │  • exportToDOC()                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ Proxied API Calls
                                 │ /api/nufi/*
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                    EXPRESS BACKEND (Port 3001)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  index.js (Main Server)                                       │  │
│  │  • CORS enabled                                               │  │
│  │  • JSON parsing                                               │  │
│  │  • Route mounting                                             │  │
│  │  • Error handling                                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Middleware: requestCounter.js                                │  │
│  │  • Tracks all requests                                        │  │
│  │  • Counts by endpoint type                                    │  │
│  │  • Error tracking                                             │  │
│  │  • Uptime calculation                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Routes: nufi.js                                              │  │
│  │  • POST /api/nufi/enrichment → generalDataEnrichment()       │  │
│  │  • POST /api/nufi/blacklist → internationalBlacklist()       │  │
│  │  • POST /api/nufi/enrichment/phone → enrichmentByPhone()     │  │
│  │  • POST /api/nufi/enrichment/email → enrichmentByEmail()     │  │
│  │  • POST /api/nufi/enrichment/name → enrichmentByName()       │  │
│  │  • POST /api/nufi/profiling/phone → profilingPhone()         │  │
│  │  • POST /api/nufi/profiling/email → profilingEmail()         │  │
│  │  • POST /api/nufi/renapo/curp → renapo()                     │  │
│  │  • Error handling & response formatting                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Services: nufiService.js                                     │  │
│  │  • validateCredentials() - Check .env config                 │  │
│  │  • createNufiClient() - Axios instance with auth headers     │  │
│  │  • generalDataEnrichment() - /v1/enrichment endpoint         │  │
│  │  • internationalBlacklist() - /v1/blacklist endpoint         │  │
│  │  • enrichmentByPhone() - /v1/enrichment/phone endpoint       │  │
│  │  • enrichmentByEmail() - /v1/enrichment/email endpoint       │  │
│  │  • enrichmentByName() - /v1/enrichment/name endpoint         │  │
│  │  • profilingPhone() - /v1/profiling/phone endpoint           │  │
│  │  • profilingEmail() - /v1/profiling/email endpoint           │  │
│  │  • renapo() - /curp/v1/consulta endpoint                     │  │
│  │  • Parameter cleaning & validation                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Stats Endpoint                                               │  │
│  │  GET /api/stats → Returns request counter data               │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTPS Requests
                                 │ (with API keys in headers)
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                      NUFI API (api.nufi.mx)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /v1/enrichment                                          │  │
│  │  • RFC, CURP, Name, Birth Date, etc.                         │  │
│  │  • Returns enriched citizen data                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /v1/blacklist                                           │  │
│  │  • Name, Birth Date, Country                                 │  │
│  │  • Returns blacklist check results                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /v1/enrichment/phone                                    │  │
│  │  • Phone number enrichment & social network search           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /v1/enrichment/email                                    │  │
│  │  • Email enrichment & social network search                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /v1/enrichment/name                                     │  │
│  │  • Name-based enrichment & contact discovery                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /v1/profiling/phone                                     │  │
│  │  • Contact data analysis and profiling by phone              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /v1/profiling/email                                     │  │
│  │  • Contact data analysis and profiling by email              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /v1/renapo/curp                                         │  │
│  │  • CURP validation against RENAPO registry                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Query Submission Flow

```
1. User fills form → InputPanel.js
   ↓
2. Form validation (at least one parameter required)
   ↓
3. handleSubmit() in App.js
   ↓
4. POST /api/nufi/enrichment or /api/nufi/blacklist
   ↓
5. requestCounter middleware increments stats
   ↓
6. Route handler in nufi.js
   ↓
7. Service function in nufiService.js
   ↓
8. validateCredentials() checks .env
   ↓
9. createNufiClient() creates Axios instance with auth
   ↓
10. POST to NUFI API (api.nufi.mx)
    ↓
11. NUFI API processes request
    ↓
12. Response flows back through the stack
    ↓
13. Service adds metadata (timestamp, endpoint, params used)
    ↓
14. Response sent to frontend
    ↓
15. ResultsPanel.js displays results
    ↓
16. StatsBar.js refreshes usage stats
```

### Export Flow

```
1. User clicks export button → ResultsPanel.js
   ↓
2. handleExport() called with format (csv/json/doc)
   ↓
3. exportUtils function invoked:
   • exportToCSV() → Flattens data, creates CSV string
   • exportToJSON() → Stringifies complete response
   • exportToDOC() → Generates HTML document
   ↓
4. downloadFile() creates Blob and triggers browser download
   ↓
5. File saved to user's downloads folder
```

## Security Flow

```
┌──────────────────────────────────────────────────────────────┐
│  .env file (ROOT DIRECTORY - NOT COMMITTED TO GIT)           │
│  • NUFI_API_KEY=xxx                                          │
│  • NUFI_API_SECRET=xxx                                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ Loaded by dotenv
                     │
┌────────────────────▼─────────────────────────────────────────┐
│  server/index.js                                             │
│  require('dotenv').config()                                  │
│  process.env.NUFI_API_KEY → Only accessible server-side     │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     │ Used by service layer
                     │
┌────────────────────▼─────────────────────────────────────────┐
│  server/services/nufiService.js                              │
│  • Reads from process.env                                    │
│  • Adds to HTTP headers (x-api-key, x-api-secret)          │
│  • NEVER sent to frontend                                    │
└────────────────────┬─────────────────────────────────────────┐
                     │
                     │ Included in API request
                     │
┌────────────────────▼─────────────────────────────────────────┐
│  NUFI API                                                    │
│  Receives authenticated request                              │
└──────────────────────────────────────────────────────────────┘

Frontend NEVER sees API keys - only receives processed results
```

## Component Hierarchy

```
App.js
├── StatsBar.js
│   └── Displays: {totalRequests, enrichmentRequests, blacklistRequests, errors, uptime}
│
├── InputPanel.js
│   ├── API Selector (dropdown with 8 options)
│   ├── Dynamic Form (based on selectedApi)
│   │   ├── Enrichment Fields: rfc, curp, nombre, apellidoPaterno, etc.
│   │   ├── Blacklist Fields: nombre, apellidoPaterno, fechaNacimiento, pais
│   │   ├── Phone Enrichment: phone
│   │   ├── Email Enrichment: email
│   │   ├── Name Enrichment: nombre, apellidoPaterno, apellidoMaterno
│   │   ├── Phone Profiling: phone
│   │   ├── Email Profiling: email
│   │   └── RENAPO: curp
│   └── Submit Button
│
└── ResultsPanel.js
    ├── View Toggle (Table / JSON)
    ├── Metadata Display
    ├── Export Buttons (CSV, JSON, DOC)
    ├── TableView (if viewMode === 'table')
    │   └── Flattened key-value table
    └── JsonView (if viewMode === 'json')
        └── Syntax-highlighted JSON
```

## State Management

```javascript
// App.js state
{
  selectedApi: 'enrichment' | 'blacklist' | 'enrichmentByPhone' | 
               'enrichmentByEmail' | 'enrichmentByName' | 
               'profilingPhone' | 'profilingEmail' | 'renapo',  // Current API selection
  loading: boolean,                          // Request in progress
  results: {                                 // API response
    success: boolean,
    data: object,
    metadata: {
      timestamp: string,
      endpoint: string,
      paramsUsed: string[]
    }
  } | null,
  error: string | null,                      // Error message
  stats: {                                   // Usage statistics
    totalRequests: number,
    enrichmentRequests: number,
    blacklistRequests: number,
    errors: number,
    uptime: number
  } | null
}
```

## API Endpoint Map

| Frontend URL | Backend Route | NUFI API Endpoint | Purpose |
|-------------|---------------|-------------------|---------|
| POST /api/nufi/enrichment | nufi.js router | POST /v1/enrichment | General data enrichment |
| POST /api/nufi/blacklist | nufi.js router | POST /v1/blacklist | International blacklist check |
| POST /api/nufi/enrichment/phone | nufi.js router | POST /v1/enrichment/phone | Phone-based data enrichment |
| POST /api/nufi/enrichment/email | nufi.js router | POST /v1/enrichment/email | Email-based data enrichment |
| POST /api/nufi/enrichment/name | nufi.js router | POST /v1/enrichment/name | Name-based data enrichment |
| POST /api/nufi/profiling/phone | nufi.js router | POST /v1/profiling/phone | Contact profiling by phone |
| POST /api/nufi/profiling/email | nufi.js router | POST /v1/profiling/email | Contact profiling by email |
| POST /api/nufi/renapo/curp | nufi.js router | POST /curp/v1/consulta | CURP name search |
| GET /api/stats | index.js | N/A | Usage statistics |
| GET /api/health | index.js | N/A | Health check |

## Technology Stack Layers

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer                             │
│  • React Components                             │
│  • Custom CSS (Tactical Design)                 │
│  • Browser APIs (File Download)                 │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│  API Layer                                      │
│  • Fetch API                                    │
│  • JSON serialization                           │
│  • Error handling                               │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│  Backend Layer                                  │
│  • Express.js (HTTP server)                     │
│  • CORS middleware                              │
│  • Custom middleware (request counter)          │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│  Service Layer                                  │
│  • Axios (HTTP client)                          │
│  • Authentication (API keys)                    │
│  • Request/Response transformation              │
└─────────────────────────────────────────────────┘
                     ↕
┌─────────────────────────────────────────────────┐
│  External API                                   │
│  • NUFI API (api.nufi.mx)                      │
│  • RESTful endpoints                            │
│  • JSON responses                               │
└─────────────────────────────────────────────────┘
```

---

**Diagram Version**: 1.0  
**Last Updated**: January 27, 2026
