import DashboardClient from '@/components/DashboardClient'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const currentYear = 2025 // FY 2025-2026 starts July 2025
  const defaultMonth = 'July'

  return (
    <DashboardClient initialMonth={defaultMonth} initialYear={currentYear} />
  )
}
