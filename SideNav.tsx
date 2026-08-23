'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const reports = [
  { name: 'PTW Register', href: '/', icon: '📋' },
]

export default function SideNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="side-nav">
      <div className="side-nav__logo">
        <h1>Site Reports</h1>
        <span>Reporting Platform</span>
      </div>

      <div className="side-nav__section-label">Reports</div>
      {reports.map(r => (
        <Link
          key={r.href}
          href={r.href}
          className={`side-nav__item ${pathname === r.href ? 'active' : ''}`}
        >
          <span className="side-nav__icon">{r.icon}</span>
          <span>{r.name}</span>
        </Link>
      ))}

      <div className="side-nav__bottom">
        {session?.user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/entry" className={`side-nav__item ${pathname === '/entry' ? 'active' : ''}`} style={{ padding: '8px 0' }}>
              <span className="side-nav__icon">✏️</span>
              <span>Data Entry</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn btn--secondary btn--sm"
              style={{ width: '100%', color: '#a0aec0', borderColor: '#a0aec0' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/login" className="btn btn--primary btn--sm" style={{ width: '100%' }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
