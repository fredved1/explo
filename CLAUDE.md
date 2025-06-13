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

## Architecture

- **Single Page Application**: All content in `app/page.tsx` with tab-based navigation
- **State Management**: React hooks with localStorage for persistence
- **Styling**: Tailwind CSS v4 with inline theme configuration
- **Key Features**:
  - Countdown timer to event date
  - Team sign-up voting system
  - Activity preference voting
  - Weather widget and map integration
  - Animated photo carousel with Framer Motion

## Git Configuration

- Remote: git@github.com:fredved1/explo.git
- Not in the main project directory but in the familieweekend-exloo subdirectory