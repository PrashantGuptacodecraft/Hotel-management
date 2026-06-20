import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/store/auth'

import Layout from '@components/layout/Layout'
import CustomerLayout from '@components/customer/CustomerLayout'
import { RequireAuth, RequireStaff, PublicOnly } from '@components/auth/guards'

// Auth pages
import Login from '@pages/Login'
import Register from '@pages/Register'
import VerifyEmail from '@pages/VerifyEmail'
import ForgotPassword from '@pages/ForgotPassword'
import ResetPassword from '@pages/ResetPassword'

// Customer pages
import BrowseRooms from '@pages/customer/BrowseRooms'
import BookRoom from '@pages/customer/BookRoom'
import MyBookings from '@pages/customer/MyBookings'
import Profile from '@pages/customer/Profile'

// Admin pages
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

export default function App() {
  const bootstrap = useAuth((s) => s.bootstrap)

  // Restore the session from the refresh cookie on first load.
  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <Routes>
      {/* Public auth */}
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Customer-facing site */}
      <Route element={<CustomerLayout />}>
        <Route index element={<BrowseRooms />} />
        <Route path="/book/:id" element={<BookRoom />} />
        <Route element={<RequireAuth />}>
          <Route path="/account" element={<MyBookings />} />
          <Route path="/account/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin / staff dashboard */}
      <Route element={<RequireStaff />}>
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
