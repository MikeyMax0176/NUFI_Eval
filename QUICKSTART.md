# 🚀 Quick Start Guide

Get the NUFI API Testing GUI running in under 5 minutes.

## Prerequisites

- Node.js 16+ installed
- NUFI API trial credentials ([Get them here](https://docs.nufi.mx/))
- GitHub Codespaces (recommended) or local environment

## Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./setup.sh

# Edit .env with your API credentials
nano .env

# Start the application
npm run dev
```

Open http://localhost:3000 in your browser.

## Option 2: Manual Setup

### Step 1: Install Dependencies

```bash
# Install all dependencies at once
npm run install-all

# Or install individually:
npm install                    # Root dependencies
cd server && npm install      # Backend dependencies
cd ../client && npm install   # Frontend dependencies
cd ..
```

### Step 2: Configure API Keys

```bash
# Copy the template
cp .env.example .env

# Edit and add your credentials
nano .env  # or use any text editor
```

Your `.env` file should look like:
```env
NUFI_API_KEY=your_actual_key_here
NUFI_API_SECRET=your_actual_secret_here
PORT=3001
```

### Step 3: Start the Application

```bash
# Start both frontend and backend
npm run dev
```

Or run them separately in different terminals:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

### Step 4: Open in Browser

Navigate to: **http://localhost:3000**

## 🎯 First Query

1. Select **"General Data Enrichment"** from dropdown
2. Fill in at least one field (e.g., First Name: "Juan")
3. Click **"Submit Query"**
4. View results in table or JSON format
5. Export using CSV, JSON, or DOC buttons

## 📊 Monitor Usage

Check the stats bar at the top to track:
- Total API requests made
- Requests by endpoint type
- Error count
- Server uptime

Or visit: http://localhost:3001/api/stats

## 🔧 Troubleshooting

### Backend won't start
- Check if port 3001 is available: `lsof -i :3001`
- Verify `.env` file exists and has valid credentials
- Check for syntax errors: `node server/index.js`

### Frontend won't start
- Check if port 3000 is available: `lsof -i :3000`
- Clear cache: `cd client && rm -rf node_modules && npm install`

### "API credentials not configured"
- Ensure `.env` file is in the root directory
- Verify keys are not still set to placeholder values
- Restart the server after editing `.env`

### No results returned
- Check backend logs for errors
- Verify API credentials are valid
- Ensure at least one field is filled
- Check NUFI API status

## 🎓 Learning Path

1. **Start Simple**: Try enrichment API with just a name
2. **Add Parameters**: Add more fields for better results
3. **Try Blacklist**: Switch to blacklist API
4. **Export Data**: Download results in different formats
5. **Monitor Usage**: Keep an eye on request counter

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for technical details
- Check [NUFI API docs](https://docs.nufi.mx/) for parameter details
- Experiment with different search combinations

## ⚠️ Remember

- **Trial keys have limits** - Use the request counter
- **Local use only** - Not for production deployment
- **No sensitive data in logs** - Safe for demos
- **Stop when done**: `Ctrl+C` in the terminal

---

**Need help?** Check the troubleshooting section in [README.md](README.md)
