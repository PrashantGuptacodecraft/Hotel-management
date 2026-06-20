import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Users,
  BarChart3,
  UserCog,
  UtensilsCrossed,
  PartyPopper,
  ConciergeBell,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
  { label: 'Rooms', path: '/admin/rooms', icon: BedDouble },
  { label: 'Guests', path: '/admin/guests', icon: Users },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Staff', path: '/admin/staff', icon: UserCog },
  { label: 'Restaurant', path: '/admin/restaurant', icon: UtensilsCrossed },
  { label: 'Events', path: '/admin/events', icon: PartyPopper },
  { label: 'Concierge', path: '/admin/concierge', icon: ConciergeBell },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
]
