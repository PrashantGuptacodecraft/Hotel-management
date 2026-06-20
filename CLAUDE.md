# 🏨 LUXE GRAND — Hotel Management System

## What You Are Building
A world-class, futuristic, enterprise-grade Hotel Management Platform for a 5-star hotel (280 rooms). This must look and feel like a $500,000 SaaS product. The client must be impressed by every single pixel.

## Project Structure
```
hotel-management/
├── frontend/     → React 18 + TypeScript + Vite + Tailwind
└── backend/      → Node.js + Express + TypeScript + Prisma
```

## Design System (FOLLOW EXACTLY)
- **Color Palette:**
  - Background: `#0A0F1C` (Deep Navy)
  - Cards: `#141B2D` with `rgba(255,255,255,0.04)` glassmorphism
  - Gold accent: `#D4AF37` (primary brand color)
  - Electric blue: `#00D4FF` (highlights, charts)
  - Success: `#00E5A0` | Warning: `#FF9500` | Danger: `#FF3B5C`
- **Fonts:** Playfair Display (headings) + Inter (UI) + JetBrains Mono (data)
- **Cards:** Always glassmorphism — `backdrop-filter: blur(12px)` + `border: 1px solid rgba(255,255,255,0.08)`
- **Animations:** Framer Motion on EVERY element. Stagger children by 50ms. Spring physics for interactions.
- **Loading states:** Shimmer skeleton loaders (NEVER spinners)
- **NO Bootstrap. NO shadcn defaults. Every component hand-crafted.**

## Pages to Build (in this order)

### 1. `src/components/layout/Layout.tsx`
Sidebar layout with navigation. Sidebar should have:
- Hotel logo (gold "LG" monogram)
- Nav links: Dashboard, Bookings, Rooms, Guests, Analytics, Staff, Restaurant, Events, Concierge, Settings
- Bottom: User profile card, logout button
- Animated active indicator that slides between nav items
- Collapsible sidebar with smooth animation
- Top bar: search (Cmd+K command palette), notifications bell, date/time

### 2. `src/pages/Dashboard.tsx` ← MOST IMPORTANT — BUILD THIS FIRST
- **KPI Cards (row of 4):** Revenue Today, Occupancy Rate, Active Guests, Pending Tasks
  - Each with animated number counter (react-countup), trend arrow, sparkline mini-chart
- **Room Occupancy Heatmap:** Visual grid of all 280 rooms (floor by floor, 10 floors x 28 rooms)
  - Color coded: green=available, blue=occupied, yellow=cleaning, red=maintenance
  - Hover shows room details tooltip
- **Revenue Chart:** 30-day bar/line combo chart (Recharts) with forecast overlay (dashed line)
- **Today's Timeline:** Arrivals and departures list with check-in/out actions
- **Live Activity Feed:** WebSocket-powered real-time staff activity stream
- **Quick Action Bar:** "New Booking", "Check In", "Check Out", "Send Alert" buttons

### 3. `src/pages/Bookings.tsx`
- Table of all bookings with status badges, source icons, search/filter
- "New Booking" modal: date range picker, room selector, guest lookup/create
- Booking detail drawer: full info, payment status, add-ons, actions
- Kanban view option: columns by booking status

### 4. `src/pages/Rooms.tsx`
- Visual hotel floor plan (SVG) — clickable rooms
- Room list with filter by type/status/floor
- Room detail panel: smart controls (temperature slider, lighting slider, toggles)
- Housekeeping Kanban: To Clean → In Progress → Verified

### 5. `src/pages/Guests.tsx`
- Guest CRM table with avatar, tier badge, last stay, total spend
- Guest profile drawer: 360° view — stay history, preferences, loyalty progress, sentiment score
- Loyalty tier progress bar (Bronze → Silver → Gold → Platinum)

### 6. `src/pages/Analytics.tsx`
- Full analytics dashboard:
  - RevPAR, ADR, GOPPAR trend charts
  - Revenue breakdown pie/donut chart
  - Occupancy heatmap (calendar)
  - Channel performance bar chart
  - 90-day demand forecast
  - Competitor rate table (mock data)

### 7. `src/pages/Staff.tsx`
- Staff list with department filter, status badges
- Weekly shift scheduler (grid view)
- Task board (Kanban) with drag-drop

### 8. `src/pages/Concierge.tsx`
- Full-page chat interface
- Messages with guest avatars and timestamps
- AI-powered responses using OpenAI API
- Quick reply suggestions
- Voice input button (Web Speech API)

### 9. `src/pages/Restaurant.tsx`
- Visual table floor plan (SVG grid)
- Order management list
- Menu items grid with availability toggles

### 10. `src/pages/Login.tsx`
- Luxury full-screen login with hotel background
- Email + password + "Remember me"
- Animated form with Framer Motion

## Code Rules (STRICT)
- TypeScript strict mode — ZERO `any` types. Use types from `src/types/index.ts`
- Every component gets `motion.div` from Framer Motion
- Every data fetch shows skeleton loader while loading
- Every list shows a beautiful empty state illustration when empty
- Every error shows a friendly retry UI
- Use `clsx` + `tailwind-merge` for conditional classes
- All data comes from mock data first (no backend needed to start)
- File naming: PascalCase components, camelCase utilities

## Mock Data Location
Create `src/utils/mockData.ts` with:
- 50 guests with realistic names, Indian + international mix
- 280 rooms across 10 floors (28 per floor, mix of all types)
- 120 bookings (mix of all statuses)
- 30 staff members across all departments
- 12 months of revenue data
- 20 pending tasks

## When to Start Backend
Build the entire frontend with mock data FIRST. Once frontend is complete and looking amazing, then build:
- `backend/src/routes/` — all REST API routes
- `backend/src/controllers/` — business logic
- `backend/src/middleware/auth.ts` — JWT middleware
- Replace frontend mock data with real API calls

## Key Libraries Already Installed
- `framer-motion` — all animations
- `recharts` — all charts
- `lucide-react` — all icons (use these, not emojis)
- `zustand` — global state
- `@tanstack/react-query` — data fetching
- `socket.io-client` — real-time
- `react-hot-toast` — notifications
- `react-countup` — animated numbers
- `date-fns` — date formatting

## Commands
```bash
# Frontend
cd frontend && npm run dev    # runs on port 3000

# Backend  
cd backend && npm run dev     # runs on port 5000

# Install all dependencies
cd frontend && npm install
cd ../backend && npm install
```

## START HERE
1. Run `cd frontend && npm install` first
2. Build `Layout.tsx` + `Dashboard.tsx` with full mock data
3. Show me the running result
4. Continue page by page
