# QuickBooks Integration - What You Need to Do Manually

## ✅ What's Already Done (Code Complete)

✅ Database schema (Integration, QuickBooksMapping, SyncLog models)  
✅ QuickBooks API client with OAuth 2.0  
✅ OAuth routes (connect, callback, disconnect)  
✅ Data sync logic (customers, items, invoices)  
✅ API endpoints for status and manual sync  
✅ Updated UI component with real API calls  
✅ Token refresh and expiry handling  
✅ Error logging and sync history  

---

## 🔧 What You Need to Do Manually

### 1. Create QuickBooks Developer Account (FREE, 15 minutes)

**Steps:**
1. Go to https://developer.intuit.com/
2. Click "Get started" → Sign in with Intuit account (or create one)
3. Click "Create an app"
4. Choose "QuickBooks Online and Payments"
5. App name: "AviationHub" or your company name
6. Description: "Flying club management integration"

**Result:** You'll get:
- ✅ Client ID
- ✅ Client Secret

---

### 2. Configure OAuth Settings (5 minutes)

In your app dashboard:

**A. Add Redirect URIs:**
```
Development: http://localhost:3000/api/integrations/quickbooks/callback
Production:  https://koster.im/api/integrations/quickbooks/callback
```

**B. Select Scopes:**
- ✅ `com.intuit.quickbooks.accounting`

**C. Save**

---

### 3. Add Environment Variables (2 minutes)

Copy these to your `.env.local` (development) or Vercel (production):

```env
# From QuickBooks Developer Dashboard
QUICKBOOKS_CLIENT_ID=your_client_id_here
QUICKBOOKS_CLIENT_SECRET=your_client_secret_here

# Your callback URL
QUICKBOOKS_REDIRECT_URI=http://localhost:3000/api/integrations/quickbooks/callback

# Start with sandbox for testing
QUICKBOOKS_ENVIRONMENT=sandbox
```

**Production (Vercel):**
1. Go to Vercel dashboard → koster.im project
2. Settings → Environment Variables
3. Add the same variables with production values:
   ```
   QUICKBOOKS_REDIRECT_URI=https://koster.im/api/integrations/quickbooks/callback
   QUICKBOOKS_ENVIRONMENT=production
   ```

---

### 4. Update Database Schema (2 minutes)

Run Prisma migration:

```bash
cd C:\Users\David\next-dashboard
npx prisma db push
npx prisma generate
```

This will create 3 new tables:
- `Integration` - Stores OAuth tokens
- `QuickBooksMapping` - Maps local entities to QB entities
- `SyncLog` - Tracks sync history

---

### 5. Create Sandbox Company (OPTIONAL - for testing, 5 minutes)

**For Testing Only:**
1. In Intuit Developer Dashboard → Sandbox
2. Click "Create sandbox company"
3. Choose "Retail" or any type
4. Use this for testing before going live

**For Production:**
- Skip sandbox
- Connect to your real QuickBooks Online company

---

### 6. Test the Integration (5 minutes)

**A. Start dev server:**
```bash
npm run dev
```

**B. Navigate to:**
```
http://localhost:3000/flying-club/manage/add-ons
```

**C. Click "Connect" on QuickBooks card**

**D. You'll be redirected to QuickBooks:**
- Sign in with Intuit account
- Select company (sandbox or production)
- Click "Authorize"

**E. You'll be redirected back to AviationHub:**
- Should see "Connected" status
- Should see "Last synced" timestamp

**F. Click "Sync Now":**
- Syncs members → Customers
- Syncs aircraft → Service Items
- Shows sync results

**G. Verify in QuickBooks:**
- Log into QuickBooks Online
- Check **Sales** → **Customers**
- Check **Products & Services** → **Services**

---

## 💰 Do You Need to Pay for Something?

### QuickBooks Online Subscription
**YES - Required**

You need an active QuickBooks Online subscription:
- **Simple Start**: $30/month (basic features)
- **Essentials**: $55/month (recommended for clubs)
- **Plus**: $85/month (advanced features)
- **Advanced**: $200/month (enterprise)

**Recommendation**: Start with **Essentials** ($55/month)

**Free Trial**: QuickBooks offers 30-day free trial

### Intuit Developer Account
**NO - Free**

- ✅ Free to create
- ✅ Free for sandbox testing
- ✅ Free for production (single company)
- ✅ No API fees
- ✅ 500 requests/minute limit (more than enough)

### AviationHub
**NO Additional Fees**

- ✅ QuickBooks integration included with your plan
- ✅ No per-sync charges
- ✅ Unlimited syncs

**Total Cost: $55/month** (just QuickBooks Online Essentials)

---

## 🔄 Timeline

| Task | Time | Can Automate? |
|------|------|---------------|
| Create developer account | 15 min | ❌ No (requires Intuit login) |
| Configure OAuth | 5 min | ❌ No (must use their UI) |
| Add env variables | 2 min | ❌ No (manual copy-paste) |
| Run database migration | 2 min | ✅ Yes (in CI/CD) |
| Test connection | 5 min | ❌ No (manual OAuth) |
| **Total** | **29 minutes** | - |

---

## 🚀 Deployment Steps

### Development (Local)
```bash
# 1. Add environment variables to .env.local
# 2. Run migrations
npx prisma db push
npx prisma generate

# 3. Start dev server
npm run dev

# 4. Test at http://localhost:3000/flying-club/manage/add-ons
```

### Production (Vercel)
```bash
# 1. Add environment variables to Vercel dashboard
# 2. Deploy
git push origin master

# 3. Vercel auto-deploys to koster.im
# 4. Test at https://koster.im/flying-club/manage/add-ons
```

---

## 📝 Quick Start Checklist

- [ ] Create Intuit Developer account
- [ ] Create new app in Developer Dashboard
- [ ] Copy Client ID and Client Secret
- [ ] Add Redirect URI in app settings
- [ ] Add environment variables locally
- [ ] Run `npx prisma db push`
- [ ] Run `npx prisma generate`
- [ ] Test locally with `npm run dev`
- [ ] Add environment variables to Vercel
- [ ] Deploy to production
- [ ] Test on koster.im
- [ ] Connect your QuickBooks Online company
- [ ] Run initial sync
- [ ] Verify data in QuickBooks

**Estimated Total Time: 30-45 minutes**

---

## ⚠️ Important Notes

1. **Start with Sandbox**: Test everything in sandbox before connecting production QuickBooks
2. **Backup QuickBooks**: Before first sync, backup your QuickBooks company
3. **Review Mappings**: Check that members → customers mapping is correct
4. **Monitor First Sync**: Watch the first sync carefully for any errors
5. **OAuth Tokens**: Expire after 100 days - reconnect if needed

---

## 🆘 If Something Goes Wrong

### Can't connect to QuickBooks
1. Check environment variables are set correctly
2. Verify redirect URI matches exactly
3. Try creating a new app in Developer Dashboard

### Sync failing
1. Check SyncLog table for error details:
   ```sql
   SELECT * FROM SyncLog ORDER BY startedAt DESC LIMIT 5
   ```
2. Check integration status:
   ```sql
   SELECT * FROM Integration WHERE provider = 'quickbooks'
   ```

### Need to disconnect and reconnect
1. Click "Disconnect" in UI
2. Wait 10 seconds
3. Click "Connect" again
4. Re-authorize

---

## 📞 Support

**QuickBooks API Issues:**
- Developer Forums: https://help.developer.intuit.com/

**AviationHub Integration:**
- Email: support@aviationhub.com
- GitHub: Open an issue

**Need Help?**
- The full setup guide: `docs/QUICKBOOKS_SETUP.md`
- Code documentation: `lib/integrations/quickbooks-client.ts`
