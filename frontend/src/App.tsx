import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from '@components/layout/Layout'

// Pages (Claude Code will build these)
import Dashboard from '@pages/Dashboard'
import Bookings from '@pages/Bookings'
import Rooms from '@pages/Rooms'
import Guests from '@pages/Guests'
import Analytics from '@pages/Analytics'
import Staff from '@pages/Staff'
import Restaurant from '@pages/Restaurant'
import Events from '@pages/Events'
import Concierge from '@pages/Concierge'
import Settings from '@pages/Settings'
import Login from '@pages/Login'

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="guests" element={<Guests />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="staff" element={<Staff />} />
          <Route path="restaurant" element={<Restaurant />} />
          <Route path="events" element={<Events />} />
          <Route path="concierge" element={<Concierge />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}
