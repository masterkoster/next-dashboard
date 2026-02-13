# Convenience runner for local dev on Windows PowerShell.
# Usage: from repo root run:  ./run-all.ps1

function Ensure-Tool($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Error "Missing required tool: $name"
    exit 1
  }
}

Ensure-Tool npm
Ensure-Tool npx

Write-Host "[1/4] Installing deps (if needed)..." -ForegroundColor Cyan
if (-not (Test-Path node_modules)) {
  npm install
} else {
  Write-Host "node_modules exists; skipping npm install" -ForegroundColor DarkGray
}

Write-Host "[2/4] Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

if ($env:DATABASE_URL) {
  Write-Host "[3/4] Running Prisma migrate (add-credits)..." -ForegroundColor Cyan
  npx prisma migrate dev --name add-credits
} else {
  Write-Warning "DATABASE_URL not set; skipping migrate. Set it to your SQL connection string."
}

Write-Host "[4/4] Starting Next.js dev server (Ctrl+C to stop)..." -ForegroundColor Cyan
$url = "http://localhost:3000"
Start-Process $url
npm run dev
