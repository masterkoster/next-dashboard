# QuickBooks Integration Setup Guide

## Overview

This guide walks you through setting up the QuickBooks Online integration for AviationHub. This integration automatically syncs:
- Flying club members → QuickBooks Customers
- Aircraft & rates → QuickBooks Service Items  
- Flight bookings → QuickBooks Invoices
- Payments → QuickBooks Payments

---

## Prerequisites

✅ **QuickBooks Online account** (any plan: Simple Start, Essentials, Plus, or Advanced)  
✅ **Admin access** to your QuickBooks company  
✅ **Flying club on AviationHub** with active subscription

---

## Step 1: Create QuickBooks Developer Account

### A. Sign Up for Intuit Developer Account

1. Go to **https://developer.intuit.com/**
2. Click **"Get started"** or **"Sign in"**
3. Use your **existing Intuit/QuickBooks credentials** OR create a new account
4. Agree to the Developer Agreement

### B. Create a New App

1. Once logged in, go to **Dashboard** → **My Apps**
2. Click **"Create an app"**
3. Select **"QuickBooks Online and Payments"**
4. Fill out the app details:
   - **App name**: `AviationHub Integration` (or your club name)
   - **Description**: `Sync flying club data with QuickBooks`
   - **Category**: `Accounting`

---

## Step 2: Configure OAuth 2.0 Settings

### A. Get Your Credentials

1. In your app dashboard, go to **Keys & credentials** tab
2. Note down:
   - **Client ID**: `ABxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Client Secret**: `xxxxxxxxxxxxxxxxxxxxx`

### B. Set Redirect URIs

1. Scroll to **"Redirect URIs"** section
2. Add your callback URL:
   - **Development**: `http://localhost:3000/api/integrations/quickbooks/callback`
   - **Production**: `https://yourdomain.com/api/integrations/quickbooks/callback`

3. Click **"Save"**

### C. Select Scopes

1. Go to **Scopes** section
2. Ensure these are enabled:
   - ✅ `com.intuit.quickbooks.accounting`
   
3. Click **"Save"**

---

## Step 3: Add Environment Variables

Add these to your `.env.local` file (development) or hosting environment (production):

```env
# QuickBooks OAuth Credentials
QUICKBOOKS_CLIENT_ID=ABxxxxxxxxxxxxxxxxxxxxxxxxxxxx
QUICKBOOKS_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxx
QUICKBOOKS_REDIRECT_URI=http://localhost:3000/api/integrations/quickbooks/callback
QUICKBOOKS_ENVIRONMENT=sandbox

# For production, change to:
# QUICKBOOKS_ENVIRONMENT=production
# QUICKBOOKS_REDIRECT_URI=https://yourdomain.com/api/integrations/quickbooks/callback
```

### Important Notes:
- Use `sandbox` environment for testing
- Use `production` for real QuickBooks companies
- **Never commit `.env.local` to git!**

---

## Step 4: Test Connection (Sandbox)

### A. Create Sandbox Company

1. In Intuit Developer Dashboard, go to **Sandbox**
2. Click **"Create a sandbox company"**
3. Select a company type (e.g., "Retail")
4. Your test company is now ready

### B. Connect from AviationHub

1. Log into AviationHub
2. Go to **Flying Club** → **Manage** → **Add-ons**
3. Find **QuickBooks** card
4. Click **"Connect"**
5. You'll be redirected to QuickBooks authorization page
6. **Sign in with your Intuit Developer account**
7. Select your **sandbox company**
8. Click **"Authorize"**
9. You'll be redirected back to AviationHub

### C. Verify Connection

1. The QuickBooks card should now show **"Connected"**
2. You should see **"Last synced:"** timestamp
3. Click **"Sync Now"** to test data sync
4. Check your QuickBooks sandbox company:
   - Go to **Sales** → **Customers** (members should appear)
   - Go to **Products & Services** → **Services** (aircraft should appear)

---

## Step 5: Production Setup

### A. Submit App for Review (if needed)

If you're syncing data for **multiple clubs** or **commercial use**, you need Intuit approval:

1. Go to your app in Developer Dashboard
2. Go to **"Submit for production"**
3. Fill out the production checklist:
   - Privacy policy URL
   - Terms of service URL
   - Support email
   - App description
4. Submit for review (usually takes 3-5 business days)

### B. For Single Club (No Review Needed)

If you're only using this for **your own club**, you can use production immediately:

1. Change `.env` to:
   ```env
   QUICKBOOKS_ENVIRONMENT=production
   ```
2. Update redirect URI in Developer Dashboard
3. Connect using your **real QuickBooks Online company**

---

## Step 6: Configure Sync Settings

### A. Map Accounts (Recommended)

1. In AviationHub, go to **Flying Club** → **Manage** → **Add-ons**
2. Click **"QuickBooks Settings"** (future feature)
3. Map:
   - Aircraft rental income → QuickBooks Income Account
   - Fuel surcharge → QuickBooks Income Account
   - Instructor fees → QuickBooks Income Account
   - Membership dues → QuickBooks Income Account

### B. Set Sync Frequency

Default: **Every 10 minutes**

To change:
```typescript
// In database or UI settings
syncFrequency: 30 // minutes
```

---

## What Gets Synced?

### Members → Customers
- ✅ Name
- ✅ Email
- ✅ Create new customers automatically
- ❌ Phone number (optional - add if needed)

### Aircraft → Service Items
- ✅ Registration number (e.g., "N12345 - Aircraft Rental")
- ✅ Item type: Service
- ✅ Mapped to income account
- ✅ Rates (price per hour)

### Bookings → Invoices (Future)
- ⏳ Create invoice after flight completion
- ⏳ Line items: Hobbs time × hourly rate
- ⏳ Additional charges: fuel, instructor, etc.
- ⏳ Due date: configurable

### Payments → QB Payments (Future)
- ⏳ Sync Stripe payments to QuickBooks
- ⏳ Match payments to invoices
- ⏳ Reconcile member balances

---

## Troubleshooting

### "Failed to connect to QuickBooks"

**Causes:**
- Invalid Client ID/Secret
- Wrong redirect URI
- Expired developer account

**Fix:**
1. Check `.env.local` has correct credentials
2. Verify redirect URI matches exactly in Developer Dashboard
3. Try creating a new app in Developer Dashboard

### "Token expired" error

**Causes:**
- QuickBooks tokens expire after 100 days of inactivity
- Integration needs to refresh tokens

**Fix:**
1. Click "Disconnect" in AviationHub
2. Click "Connect" again to re-authorize
3. Tokens will be refreshed automatically

### Data not syncing

**Causes:**
- Sync job not running
- API rate limits hit
- Invalid data format

**Fix:**
1. Click "Sync Now" manually
2. Check **Sync Logs** in database:
   ```sql
   SELECT * FROM SyncLog 
   WHERE integrationId = 'xxx' 
   ORDER BY startedAt DESC
   ```
3. Look at `errorMessage` column for details

### Duplicate customers/items in QuickBooks

**Causes:**
- Mapping table not updated
- Manual entries in QuickBooks

**Fix:**
1. Check `QuickBooksMapping` table
2. If mapping exists, sync won't create duplicates
3. If you manually created entries, create mappings:
   ```sql
   INSERT INTO QuickBooksMapping (integrationId, entityType, entityId, qbId, qbName)
   VALUES ('integration-id', 'member', 'member-id', 'qb-customer-id', 'Customer Name')
   ```

---

## Security Best Practices

✅ **Encrypt tokens** in database (production)
✅ **Use HTTPS** for all callbacks
✅ **Validate state parameter** (CSRF protection)
✅ **Rotate secrets** regularly
✅ **Limit scope** to only what you need
✅ **Monitor sync logs** for suspicious activity
✅ **Implement rate limiting** on API routes

---

## Costs

### QuickBooks Online
- **Required**: QuickBooks Online subscription
  - Simple Start: $30/month
  - Essentials: $55/month
  - Plus: $85/month
  - Advanced: $200/month
- **Recommend**: Essentials or Plus for flying clubs

### Intuit Developer Account
- **Free** for development and single-company use
- **No fees** for OAuth integration
- **API limits**: 500 requests/minute (more than enough)

### AviationHub
- QuickBooks integration **included** with Pro/Enterprise plans
- No additional fees

---

## Support

### QuickBooks API Issues
- **Developer Forums**: https://help.developer.intuit.com/
- **API Documentation**: https://developer.intuit.com/app/developer/qbo/docs/get-started

### AviationHub Integration Issues
- **Email**: support@aviationhub.com
- **In-app**: Click "Help" → "Contact Support"

---

## Next Steps

✅ Complete setup above  
✅ Test in sandbox environment  
✅ Verify data syncs correctly  
✅ Move to production when ready  
✅ Configure automatic syncing  
✅ Train club admins on QuickBooks workflow

---

**Last Updated**: February 2026  
**Version**: 1.0
