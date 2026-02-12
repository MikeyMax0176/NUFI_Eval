# NUFI API Testing GUI

Internal tactical testing interface for the NUFI API. Built for local development and GitHub Codespaces with trial subscription keys.

## 🎯 Purpose

This tool provides a clean, no-frills GUI for testing NUFI API endpoints:
- **General Data Enrichment API** - Query Mexican citizen data (RFC, CURP, names, etc.)
- **International Blacklists API** - Check against international sanctions and watchlists
- **Data Enrichment by Phone** - Internet search for contact information by phone number
- **Data Enrichment by Email** - Internet search for contact information by email
- **Data Enrichment by Name** - Internet search for contact information by name
- **Contact Profiling (Phone/Email)** - Analyze and profile contact data
- **RENAPO CURP Validation** - Validate CURP against Mexican national registry

Designed for evaluation, demos, and internal testing with strict transaction limits.

## 🏗️ Architecture

```
NUFI_Eval/
├── server/                 # Express backend (proxy to NUFI API)
│   ├── index.js           # Main server entry point
│   ├── routes/            # API route handlers
│   ├── services/          # NUFI API service functions
│   └── middleware/        # Request counter, error handling
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Export utilities (CSV, DOC, JSON)
│   │   └── App.js         # Main application
│   └── public/
├── .env                   # API keys (DO NOT COMMIT)
└── .env.example          # Template for environment variables
```

## 🚀 Quick Start (GitHub Codespaces)

### 1. Clone and Open in Codespaces

```bash
# Open this repository in GitHub Codespaces
# The dev container will automatically configure the environment
```

### 2. Configure API Keys

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your NUFI API key:

```env
NUFI_API_KEY=your_api_key_here

# Optional explicit subscription key (defaults to NUFI_API_KEY)
NUFI_SUBSCRIPTION_KEY=
NUFI_API_BASE_URL=https://nufi.azure-api.net
PORT=3001
```

**⚠️ Important:** 
- Get your API key from [NUFI API Documentation](https://docs.nufi.mx/)
- The API uses Azure API Management endpoint: `https://nufi.azure-api.net`
- Trial keys have strict transaction limits - use wisely
- Never commit `.env` to version control (it's in `.gitignore`)
- See [NUFI_API_REFERENCE.md](NUFI_API_REFERENCE.md) for detailed API documentation and response examples

### 3. Install Dependencies

```bash
# Install all dependencies (root, server, and client)
npm run install-all
```

### 4. Run the Application

```bash
# Start both backend and frontend concurrently
npm run dev
```

This will start:
- **Backend server** on `http://localhost:3001`
- **React frontend** on `http://localhost:3000`

The frontend will automatically proxy API requests to the backend.

### 5. Open in Browser

In Codespaces, VS Code will show a notification to open the forwarded port. Click to open `http://localhost:3000` in your browser.

## 📖 How to Use

### Basic Workflow

1. **Select API Endpoint**
   - Choose from 8 NUFI endpoints in the dropdown (enrichment, blacklist, phone/email/name enrichment, profiling, RENAPO)

2. **Fill Search Parameters**
   - Enter at least one parameter (more parameters = better accuracy)
   - Fields are based strictly on NUFI API documentation
   - Leave unused fields empty

3. **Submit Query**
   - Click "Submit Query" button
   - Loading state will appear while querying the API
   - Results appear in the right panel

4. **View Results**
   - **Table View**: Clean, readable key-value table (hides empty fields)
   - **JSON View**: Raw API response for debugging
   - Toggle between views using the buttons

5. **Export Data**
   - **CSV**: Flat format for spreadsheet analysis
   - **JSON**: Complete API response with metadata
   - **DOC**: Formatted Word-compatible report

### API Endpoints

#### General Data Enrichment
Parameters supported:
- `rfc` - Mexican tax ID (RFC)
- `curp` - Mexican unique citizen registry (CURP)
- `nombre` - First name
- `apellidoPaterno` - Paternal surname
- `apellidoMaterno` - Maternal surname
- `fechaNacimiento` - Birth date (YYYY-MM-DD)
- `entidadNacimiento` - Birth state/entity

#### International Blacklists
Parameters supported:
- `nombre` - First name
- `apellidoPaterno` - Paternal surname
- `apellidoMaterno` - Maternal surname
- `fechaNacimiento` - Birth date (YYYY-MM-DD)
- `pais` - Country code (ISO format, e.g., MX, US, UK)

#### Data Enrichment by Phone
Internet search for possible names, emails, phone numbers, and social networks
- `phone` - Phone number with country code (e.g., +525512345678)

#### Data Enrichment by Email
Internet search for possible names, emails, phone numbers, and social networks
- `email` - Valid email address

#### Data Enrichment by Name
Internet search for possible names, emails, phone numbers, and social networks
- `nombre` - First name
- `apellidoPaterno` - Paternal surname
- `apellidoMaterno` - Maternal surname (optional)

#### Contact Data Analysis and Profiling - Phone
Analyze and profile contact data based on phone number
- `phone` - Phone number with country code

#### Contact Data Analysis and Profiling - Email
Analyze and profile contact data based on email address
- `email` - Valid email address

#### CURP Name Search
Search CURP using personal data fields
- `tipo_busqueda` - Search mode (use `datos`)
- `clave_entidad` - Two-letter state code
- `dia_nacimiento` - Birth day (DD)
- `mes_nacimiento` - Birth month (MM)
- `anio_nacimiento` - Birth year (YYYY)
- `nombres` - First name(s)
- `primer_apellido` - Paternal surname
- `segundo_apellido` - Maternal surname (optional)
- `sexo` - `H` for male, `M` for female

## 📊 Request Counter

The stats bar at the top tracks:
- **Total Requests**: All API calls made during this session
- **Enrichment Requests**: Calls to data enrichment endpoint
- **Blacklist Requests**: Calls to blacklist endpoint
- **Errors**: Failed requests
- **Uptime**: Server runtime

This helps monitor trial key usage to avoid exceeding limits.

## 🔒 Security Considerations

✅ **Implemented:**
- API keys stored in environment variables (never in code)
- Backend acts as proxy (keys never exposed to frontend)
- `.env` automatically ignored by git
- No raw PII logged to console (only sanitized metadata)

⚠️ **Remember:**
- This is for **local/Codespace use only**
- Not designed for production deployment
- Trial keys have transaction limits
- Do not share API credentials

## 🛠️ Development

### Run Individual Components

```bash
# Backend only
npm run server

# Frontend only (in separate terminal)
npm run client

# Build production frontend
npm run build
```

### API Stats Endpoint

View detailed usage statistics:
```bash
curl http://localhost:3001/api/stats
```

Returns:
```json
{
  "totalRequests": 12,
  "enrichmentRequests": 7,
  "blacklistRequests": 5,
  "errors": 1,
  "startTime": "2026-01-27T10:30:00.000Z",
  "uptime": 1850
}
```

### Project Dependencies

**Backend:**
- `express` - Web server
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `axios` - HTTP client for NUFI API
- `nodemon` - Dev server with auto-reload

**Frontend:**
- `react` - UI framework
- `react-dom` - React DOM rendering
- `react-scripts` - Create React App tooling

**Root:**
- `concurrently` - Run multiple npm scripts

## 📝 Trial Limits & Best Practices

1. **Transaction Limits**
   - Trial keys have strict limits (check NUFI documentation)
   - Use the request counter to track usage
   - Plan queries carefully to stay within limits

2. **Query Optimization**
   - More parameters = more accurate results
   - Start with specific identifiers (RFC, CURP) when available
   - Use name-based searches as fallback

3. **Error Handling**
   - Rate limit errors: Wait before retrying
   - Invalid parameters: Check NUFI docs for correct format
   - Auth errors: Verify API keys in `.env`

## 🐛 Troubleshooting

### "API credentials not configured"
- Ensure `.env` file exists in root directory
- Check that `NUFI_API_KEY` and `NUFI_API_SECRET` are set
- Restart the server after updating `.env`

### "Network error" or "Failed to fetch"
- Check that backend server is running on port 3001
- Verify no firewall blocking localhost connections
- Check browser console for CORS errors

### "At least one search parameter is required"
- Fill in at least one input field before submitting
- Empty/whitespace-only fields are ignored

### Export not working
- Check browser's download permissions
- Ensure pop-ups are not blocked
- Try a different export format

## 📚 Resources

- [NUFI API Documentation](https://docs.nufi.mx/docs/api-docs-2023/ae382f90ddde0-introduccion)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)

## 📄 License

Internal tool - for evaluation and testing purposes only.

---

**Built with:** React + Node.js + Express  
**Style:** Tactical, minimal, no-frills  
**Purpose:** Testing, evaluation, demos
