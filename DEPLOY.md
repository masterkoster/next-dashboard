# Deployment Guide

## Prerequisites
- Azure CLI installed
- GitHub repository with this code

## Option 1: GitHub Actions (Recommended)

### Step 1: Create Azure Static Web App
```bash
az staticwebapp create \
  --name your-app-name \
  --resource-group Aviationtwo \
  --location westus3
```

### Step 2: Get the API Token
```bash
az staticwebapp show \
  --name your-app-name \
  --resource-group Aviationtwo \
  --query properties.apiKey
```

### Step 3: Add Secrets to GitHub
Go to your GitHub repo → Settings → Secrets and add:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: The token from Step 2
- `TAILHISTORY_FUNCTION_URL`: `https://aviation-logic-dk-ctethpg7fmehc2cd.westus3-01.azurewebsites.net/api/tailhistory`
- `DATABASE_URL`: Your database connection string

### Step 4: Push to GitHub
```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

---

## Option 2: Azure CLI (Quick Deploy)

### Build the app locally:
```bash
npm install
npm run build
```

### Deploy to Azure Static Web Apps:
```bash
az staticwebapp create \
  --name your-app-name \
  --resource-group Aviationtwo \
  --location westus3

az staticwebapp up \
  --name your-app-name \
  --resource-group Aviationtwo \
  --location westus3 \
  --app-location "." \
  --output-location ".next" \
  --api-location ""
```

---

## Azure Function Deployment

Make sure your Azure Function is deployed with pymssql:

```bash
cd azure-function
func azure functionapp publish aviation-logic-dk --python
```

Set the DATABASE_URL in Azure:
```bash
az functionapp config appsettings set \
  --name aviation-logic-dk \
  --resource-group Aviationtwo \
  --settings "DATABASE_URL=Server=tcp:aviation-server-dk.database.windows.net,1433;Database=aviation_db;User ID=CloudSA183a5780;Password=Password123;Encrypt=true;TrustServerCertificate=false;"
```
