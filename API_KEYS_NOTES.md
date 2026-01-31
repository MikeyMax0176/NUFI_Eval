# API Keys Configuration Notes

## Your NUFI Trial Keys

Based on the email from NUFI, you have been provided with:

### Primary Key (Data Enrichment & International Blacklists)
- **Key**: `b5064493373942c5b54dfdbc1c745f44`
- **Limit**: 50 transactions
- **Use**: This is configured as your primary key for the Data Enrichment and International Blacklists endpoints

### Backup Key (General API)
- **Key**: `ccbd58f8a5fa420fb0d6ef7d37c199ef`
- **Limit**: 100 transactions
- **Note**: Currently commented out in .env, can be used if the primary key is exhausted

## Current Configuration

The `.env` file has been set up with:
```env
NUFI_API_KEY=b5064493373942c5b54dfdbc1c745f44
NUFI_API_SECRET=b5064493373942c5b54dfdbc1c745f44
```

## Important Considerations

### Transaction Limits
- **Data Enrichment & Blacklists**: 50 transactions total
- **General Key (backup)**: 100 transactions
- Use the **request counter** in the UI to monitor your usage

### Testing Strategy
1. **Start with the Data Enrichment key** (already configured)
2. **Monitor the stats bar** at the top of the UI
3. **Test incrementally** - don't exhaust all queries at once
4. If you get authentication errors, the API might require a different key format

### If Authentication Fails

The email provides API keys, but NUFI's documentation might use a key/secret pair differently. If you encounter auth errors:

**Option 1**: Try the General key instead
```env
NUFI_API_KEY=ccbd58f8a5fa420fb0d6ef7d37c199ef
NUFI_API_SECRET=ccbd58f8a5fa420fb0d6ef7d37c199ef
```

**Option 2**: NUFI might only need a single key in the header
- Check the actual NUFI API documentation for header format
- Modify `server/services/nufiService.js` if needed

**Option 3**: Contact NUFI support for clarification on:
- Whether both keys can be used together
- The correct header format (x-api-key, x-api-secret)
- Whether a separate secret is provided

## Security Reminders

✓ `.env` file is secured with 600 permissions (owner read/write only)
✓ `.env` is in .gitignore - will not be committed
✓ Keys are never exposed to the frontend
✓ Backend proxy keeps keys server-side only

## Compliance

As mentioned in the NUFI email:
- Handle with production-level security
- Comply with data protection regulations
- Use only for testing and evaluation
- Don't share keys publicly

## Contact for Support

If you need technical support during your trial:
- Contact NUFI support (as mentioned in their email)
- Provide your client information: Michael Maxwell

## Next Steps

1. **Start the application**: `npm run dev`
2. **Test with a simple query** (e.g., just a name)
3. **Check for any authentication errors** in the backend console
4. **Monitor your transaction count** in the stats bar
5. **If errors occur**, try the alternative key configuration above

---

**Trial Period Active**: January 27, 2026  
**Primary Key Transactions**: 50 remaining  
**Backup Key Transactions**: 100 available
