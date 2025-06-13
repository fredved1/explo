# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.3.3 application for a Dutch family weekend event in Exloo (June 2025). It's a single-page application with interactive features for event planning and coordination.

## Common Commands

```bash
# Development
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint checks
```

## Localhost Connection Troubleshooting

If the development server runs but browser shows "site unreachable" or "could not connect to server":

1. **Try alternative ports:**
   ```bash
   PORT=3001 npm run dev
   ```

2. **Bind to explicit IP:**
   ```bash
   npm run dev -- -H 127.0.0.1
   ```

3. **Test connection with curl:**
   ```bash
   curl http://localhost:3000
   ```

4. **Common fixes:**
   - Check browser proxy settings - ensure localhost/127.0.0.1 bypass proxy
   - Disable VPN/security software temporarily
   - Clear DNS cache: `sudo dscacheutil -flushcache`
   - Try different browser or incognito mode
   - Use http://127.0.0.1:3000 instead of localhost

## Cross-Device Database Setup (Upstash Redis)

**Problem:** Team registrations only work per browser (localStorage), not across devices.

**Solution:** Use Upstash Redis via Vercel Marketplace for real-time sync.

### Setup Steps:

1. **Vercel Dashboard** → **Storage** → **Marketplace Database Providers**
2. **Find "Upstash"** → **Create** → **Redis**
3. **Database Name:** `upstash-kv-[random]` (auto-generated)
4. **Region:** Choose closest (lhr1 for Europe)
5. **Free tier:** 500k commands/month
6. **Connect to project** → Environment variables auto-added

### Common Issues & Solutions:

**Issue:** Environment variables not connecting automatically
- **Solution:** Copy Redis URL + token manually from Upstash dashboard
- Add to Vercel Environment Variables as `REDIS_URL` and token

**Issue:** Wrong URL format in code
- **Redis URL format:** `rediss://default:TOKEN@hostname.upstash.io:6379`
- **REST API URL:** `https://hostname.upstash.io` (remove rediss://, port, auth)
- **Token:** Extract from Redis URL (part after `default:` and before `@`)

**Issue:** "fetch failed" errors
- **Debug:** Check Vercel Function Logs for detailed error messages
- **Common:** Wrong hostname or token format

### Final Working Configuration:

```typescript
// app/api/data/route.ts
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: "https://[hostname].upstash.io",  // Extract from Redis URL
  token: "YOUR_TOKEN_HERE"               // From environment or direct
})

export async function GET() {
  const data = await redis.get("familieweekend-data")
  return NextResponse.json(data || { teams: {}, polls: {} })
}

export async function POST(request: Request) {
  const data = await request.json()
  await redis.set("familieweekend-data", data)
  return NextResponse.json({ success: true })
}
```

```typescript
// lib/api.ts - Database-first approach
export async function fetchData() {
  try {
    const response = await fetch("/api/data", { cache: "no-store" })
    if (response.ok) {
      const data = await response.json()
      localStorage.setItem("familieweekend-data", JSON.stringify(data))
      return data
    }
  } catch (error) {
    console.error("Database fetch failed:", error)
  }
  
  // Fallback to localStorage
  const saved = localStorage.getItem("familieweekend-data")
  return saved ? JSON.parse(saved) : { teams: {}, polls: {} }
}

export async function saveData(teams: any, polls: any) {
  const data = { teams, polls }
  
  try {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    
    if (response.ok) {
      localStorage.setItem("familieweekend-data", JSON.stringify(data))
      return { success: true }
    }
  } catch (error) {
    console.error("Database save failed:", error)
  }
  
  // Always backup to localStorage
  localStorage.setItem("familieweekend-data", JSON.stringify(data))
  return { success: false }
}
```

### Testing Database Connection:

```bash
# Test GET
curl https://your-app.vercel.app/api/data

# Test POST
curl -X POST https://your-app.vercel.app/api/data \
  -H "Content-Type: application/json" \
  -d '{"teams":{"test":["TestUser"]},"polls":{}}'

# Should return: {"success":true}
```

### Refresh Strategy:

- **Data refresh:** Every 30 seconds (prevents overwriting during input)
- **Save strategy:** Database first, localStorage backup
- **Load strategy:** Database first, localStorage fallback

## Architecture

- **Single Page Application**: All content in `app/page.tsx` with tab-based navigation
- **State Management**: React hooks with Upstash Redis persistence
- **Styling**: Tailwind CSS v3 with Landal green theme
- **Key Features**:
  - Countdown timer to event date
  - Cross-device team sign-up system
  - Real-time data synchronization
  - Live weather widget (Buienradar)
  - House distribution overview
  - Comprehensive activities section
  - Social media preview optimization

## Deployment

- **Platform:** Vercel
- **Domain:** www.what-to-watch.nl
- **Database:** Upstash Redis (free tier)
- **Environment:** Production with Redis persistence

## Git Configuration

- Remote: git@github.com:fredved1/explo.git
- Not in the main project directory but in the familieweekend-exloo subdirectory