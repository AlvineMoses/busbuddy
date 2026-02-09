# Development Setup

## Google Maps Configuration

This app uses Google Maps API with domain restrictions. To run in development:

### Option 1: Using Reverse Proxy (Recommended)
1. Ensure `/etc/hosts` has: `127.0.0.1 corp.little.global`
2. Start Vite dev server: `npm run dev` (runs on localhost:3000)
3. Start reverse proxy: `npm run dev:proxy` (runs on corp.little.global:8080)
4. Open: **http://corp.little.global:8080/dashboard**

The browser sends `Referer: http://corp.little.global:8080/...` which matches the API key restriction.

### Option 2: Add localhost to Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your API key
3. Under "HTTP referrers", add: `http://localhost:3000/*`
4. Start Vite: `npm run dev`
5. Open: **http://localhost:3000/dashboard**

## Tech Stack
- **Vite** - Dev server & build tool
- **React 19** + TypeScript
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **React Router v6** - URL routing
- **Zustand** - State management
- **Google Maps** via `@vis.gl/react-google-maps`

## Architecture
- **Smart Data-Flow** with centralized `useAppData` hooks
- **URL-based routing** (`/dashboard`, `/routes`, `/operations`, `/schools`, `/settings`, `/notifications`)
- **Consolidated operations** page with tabs (Drivers, Shifts, Assignments)
- **Embedded pages** pattern with `showHeader` prop for reusable components
