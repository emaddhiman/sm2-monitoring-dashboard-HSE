'use client'
import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password. Please check your credentials.')
    } else {
      router.push('/entry')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">
          <h2>Site Reports</h2>
          <p>Data Entry Login</p>
        </div>
        <form id="login-form" className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-banner" role="alert">{error}</div>}
          <div className="form-group">
            <label htmlFor="email-input" className="form-label">Email Address</label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@site.com"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password-input" className="form-label">Password</label>
            <input
              id="password-input"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button id="login-submit" type="submit" className="btn btn--primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <a href="/" style={{ fontSize: 12, color: '#4472C4', textDecoration: 'none' }}>
              ← Back to dashboard
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
