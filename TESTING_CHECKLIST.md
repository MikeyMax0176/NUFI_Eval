# Testing Checklist

Use this checklist to verify the NUFI API Testing GUI is working correctly.

## Pre-Flight Checks

- [ ] Node.js 16+ installed (`node --version`)
- [ ] .env file created with valid NUFI API credentials
- [ ] All dependencies installed (`npm run install-all`)
- [ ] No port conflicts on 3000 and 3001

## Backend Tests

### Server Startup
- [ ] Backend starts without errors: `npm run server`
- [ ] Server logs show: "🚀 NUFI Eval Server running on port 3001"
- [ ] Health check responds: `curl http://localhost:3001/api/health`
- [ ] Stats endpoint works: `curl http://localhost:3001/api/stats`

### API Credentials
- [ ] Server doesn't show "API credentials not configured" error
- [ ] Server doesn't show "Please update NUFI API credentials" error
- [ ] .env file is loaded correctly (check logs)

### Request Counter
- [ ] Stats endpoint returns valid JSON
- [ ] totalRequests starts at 0
- [ ] enrichmentRequests starts at 0
- [ ] blacklistRequests starts at 0
- [ ] errors starts at 0
- [ ] uptime increases over time

## Frontend Tests

### Application Load
- [ ] Frontend starts without errors: `npm run client`
- [ ] Browser opens to http://localhost:3000
- [ ] Header displays: "NUFI API Testing Interface"
- [ ] Stats bar is visible at top
- [ ] Input panel loads on left side
- [ ] Results panel shows empty state on right

### UI Components
- [ ] StatsBar displays all 5 metrics
- [ ] API selector dropdown has 2 options
- [ ] Default selection is "General Data Enrichment"
- [ ] Input fields match selected API
- [ ] Submit button is enabled
- [ ] Results panel shows "No Results Yet" message

### API Selection
- [ ] Switching to "International Blacklists" changes form fields
- [ ] Switching back to "General Data Enrichment" changes form fields
- [ ] Form data is cleared when switching APIs
- [ ] API indicator shows correct API name

## General Data Enrichment Tests

### Valid Queries
- [ ] Submit with only First Name field filled
  - [ ] Loading spinner appears
  - [ ] Results display in table view
  - [ ] No errors shown
  - [ ] Stats bar increments totalRequests
  - [ ] Stats bar increments enrichmentRequests

- [ ] Submit with multiple fields (First Name + Paternal Surname)
  - [ ] Results are more specific
  - [ ] Metadata shows correct parameters used

- [ ] Submit with RFC field
  - [ ] Results include RFC-related data
  - [ ] No errors

### Invalid Queries
- [ ] Submit with all fields empty
  - [ ] Alert shows "Please fill in at least one field"
  - [ ] No API request made

- [ ] Submit with only whitespace in fields
  - [ ] Treated as empty
  - [ ] Alert shown

### Field Validation
- [ ] All 7 enrichment fields are present:
  - [ ] RFC (Tax ID)
  - [ ] CURP (Citizen ID)
  - [ ] First Name
  - [ ] Paternal Surname
  - [ ] Maternal Surname
  - [ ] Birth Date
  - [ ] Birth State/Entity

## International Blacklist Tests

### Valid Queries
- [ ] Submit with only First Name field filled
  - [ ] Loading spinner appears
  - [ ] Results display in table view
  - [ ] No errors shown
  - [ ] Stats bar increments blacklistRequests

- [ ] Submit with First Name + Country
  - [ ] Results are filtered by country
  - [ ] Metadata shows both parameters used

### Field Validation
- [ ] All 5 blacklist fields are present:
  - [ ] First Name
  - [ ] Paternal Surname
  - [ ] Maternal Surname
  - [ ] Birth Date
  - [ ] Country

## Results Display Tests

### Table View
- [ ] Table view is default
- [ ] Table shows field names in left column
- [ ] Table shows values in right column
- [ ] Empty/null fields are hidden
- [ ] Nested objects are flattened (dot notation)
- [ ] Arrays are displayed as comma-separated values

### JSON View
- [ ] Click "JSON" toggle button
- [ ] JSON view displays formatted response
- [ ] Syntax is properly indented
- [ ] Complete response includes metadata
- [ ] Toggle back to "Table" works

### Metadata Display
- [ ] Metadata bar shows:
  - [ ] Endpoint name
  - [ ] Parameters used
  - [ ] Timestamp (formatted)

## Export Tests

### CSV Export
- [ ] Click "Export CSV" button
- [ ] File downloads automatically
- [ ] Filename includes timestamp
- [ ] File opens in Excel/spreadsheet app
- [ ] Headers are clean (no dots/underscores)
- [ ] Data is properly quoted
- [ ] All non-empty fields are present

### JSON Export
- [ ] Click "Export JSON" button
- [ ] File downloads automatically
- [ ] Filename includes timestamp
- [ ] File opens in text editor
- [ ] JSON is properly formatted
- [ ] Includes complete API response
- [ ] Includes metadata

### DOC Export
- [ ] Click "Export DOC" button
- [ ] File downloads automatically
- [ ] Filename includes timestamp
- [ ] File opens in Microsoft Word
- [ ] Document has proper formatting:
  - [ ] Title header
  - [ ] Query information section
  - [ ] Results table
  - [ ] Footer with timestamp
- [ ] All data is readable

## Error Handling Tests

### Network Errors
- [ ] Stop backend server
- [ ] Submit query from frontend
- [ ] Error state displays: "Network error: Failed to fetch"
- [ ] No crash or blank screen

### API Errors
- [ ] Use invalid API credentials in .env
- [ ] Restart backend
- [ ] Submit query
- [ ] Error message displays (not raw stack trace)
- [ ] Stats bar increments error count

### Validation Errors
- [ ] Submit empty form
- [ ] Alert appears with helpful message
- [ ] No API request is made
- [ ] App remains functional

## Stats Bar Tests

### Counter Updates
- [ ] Make enrichment request
  - [ ] totalRequests increases by 1
  - [ ] enrichmentRequests increases by 1
  - [ ] blacklistRequests stays same

- [ ] Make blacklist request
  - [ ] totalRequests increases by 1
  - [ ] blacklistRequests increases by 1
  - [ ] enrichmentRequests stays same

### Error Tracking
- [ ] Generate an error (invalid request)
- [ ] Errors count increases
- [ ] Error count displays in red color

### Uptime Display
- [ ] Uptime shows minutes and seconds
- [ ] Uptime increases over time
- [ ] Format is readable (e.g., "5m 23s")

## Performance Tests

### Loading States
- [ ] Click submit
- [ ] Button text changes to "Querying API..."
- [ ] Button is disabled during request
- [ ] Loading spinner appears in results panel
- [ ] UI remains responsive

### Response Time
- [ ] Simple query completes in < 5 seconds
- [ ] Complex query completes in < 10 seconds
- [ ] Timeout after 30 seconds (if no response)

## Browser Compatibility Tests

Test in multiple browsers if possible:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

Check:
- [ ] UI renders correctly
- [ ] Forms work
- [ ] Exports download
- [ ] No console errors

## Security Tests

### API Key Protection
- [ ] Open browser DevTools → Network tab
- [ ] Submit query
- [ ] Check request to /api/nufi/*
- [ ] API keys are NOT visible in:
  - [ ] Request headers
  - [ ] Request body
  - [ ] Response
  - [ ] URL

### PII Protection
- [ ] Open browser console
- [ ] Submit query with personal data
- [ ] Check console logs
- [ ] Personal data is NOT logged
- [ ] Only sanitized metadata is logged

### Environment Variables
- [ ] Check .gitignore includes `.env`
- [ ] Run `git status`
- [ ] .env file is NOT tracked by git
- [ ] Only .env.example is tracked

## Integration Tests

### Full Workflow
- [ ] Start fresh (clear browser cache)
- [ ] Open application
- [ ] View stats (all zeros)
- [ ] Select enrichment API
- [ ] Fill in 2-3 fields
- [ ] Submit query
- [ ] Wait for results
- [ ] Verify table displays data
- [ ] Switch to JSON view
- [ ] Export to CSV
- [ ] Export to JSON
- [ ] Export to DOC
- [ ] Verify all 3 files downloaded
- [ ] Switch to blacklist API
- [ ] Submit another query
- [ ] Check stats updated correctly

## Cleanup Tests

### Server Shutdown
- [ ] Press Ctrl+C in backend terminal
- [ ] Server stops gracefully
- [ ] No error messages

### Browser Cleanup
- [ ] Close browser tab
- [ ] Reopen application
- [ ] Stats show previous session data (in-memory counter reset)

## Documentation Tests

- [ ] README.md is complete and clear
- [ ] QUICKSTART.md is accurate
- [ ] PROJECT_SUMMARY.md matches implementation
- [ ] ARCHITECTURE.md diagrams are correct
- [ ] All code has helpful comments

## Codespaces-Specific Tests

If using GitHub Codespaces:
- [ ] Port 3000 is forwarded automatically
- [ ] Port 3001 is forwarded automatically
- [ ] Notification appears to open port
- [ ] Application works in forwarded port browser
- [ ] .env file persists across Codespace sessions

## Final Checklist

- [ ] All tests pass
- [ ] No console errors
- [ ] No server errors
- [ ] Exports work correctly
- [ ] Stats tracking is accurate
- [ ] Documentation is up to date
- [ ] Code is clean and commented
- [ ] .env is in .gitignore
- [ ] Ready for demo/evaluation

---

## Notes

Record any issues found:

```
Issue: 
Steps to reproduce:
Expected:
Actual:
```

---

**Tested By**: _____________  
**Date**: _____________  
**Version**: 1.0.0  
**Status**: ☐ Pass  ☐ Fail
