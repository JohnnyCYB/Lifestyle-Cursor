import { useMemo, useState } from 'react'
import { Beaker, Cloud, LogIn, LogOut, Monitor, User, UserPlus, X } from 'lucide-react'
import './ProfileModal.css'

export default function ProfileModal({
  onClose,
  accountMode,
  authEnabled,
  authUser,
  localDisplayName,
  onSignIn,
  onSignUp,
  onSignOut,
  onContinueLocal,
  onSwitchToDemo,
}) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState(() => localDisplayName ?? '')
  const [busy, setBusy] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [notice, setNotice] = useState('')

  const cloudName = authUser?.user_metadata?.display_name || authUser?.email || 'Cloud User'
  const currentModeLabel = useMemo(() => {
    if (accountMode === 'demo') return 'Demo Account'
    if (authUser) return 'Cloud Account'
    return 'Local Account'
  }, [accountMode, authUser])

  async function submit(event) {
    event.preventDefault()
    if (!authEnabled) {
      setErrorText('Supabase auth is not configured in this environment.')
      return
    }
    if (!email.trim() || !password.trim()) {
      setErrorText('Please enter both email and password.')
      return
    }
    if (mode === 'signup' && !displayName.trim()) {
      setErrorText('Please add a display name for your cloud profile.')
      return
    }
    setBusy(true)
    setErrorText('')
    setNotice('')
    try {
      const result = mode === 'signup'
        ? await onSignUp({ email: email.trim(), password, displayName: displayName.trim() })
        : await onSignIn({ email: email.trim(), password })
      if (result?.error) {
        setErrorText(result.error.message || 'Auth request failed.')
        return
      }
      if (mode === 'signup') setNotice('Account created. Check your email if confirmation is required.')
      else setNotice('Signed in successfully.')
    } catch (error) {
      setErrorText(error?.message || 'Auth request failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSignOut() {
    setBusy(true)
    setErrorText('')
    setNotice('')
    try {
      const result = await onSignOut()
      if (result?.error) {
        setErrorText(result.error.message || 'Sign out failed.')
        return
      }
      setNotice('Signed out. You are now using Local Account.')
    } catch (error) {
      setErrorText(error?.message || 'Sign out failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="Account profile" onClick={onClose}>
      <section className="profile-modal-sheet" onClick={(event) => event.stopPropagation()}>
        <header className="profile-modal-header">
          <div>
            <span className="eyebrow">Account</span>
            <h2>{currentModeLabel}</h2>
          </div>
          <button className="icon-toggle" type="button" onClick={onClose} aria-label="Close account dialog">
            <X size={18} />
          </button>
        </header>

        <div className="profile-mode-grid">
          <article className="profile-mode-card">
            <Monitor size={17} />
            <div>
              <strong>Local Account</strong>
              <p>Browser-only save, no sign-in required.</p>
            </div>
          </article>
          <article className="profile-mode-card">
            <Cloud size={17} />
            <div>
              <strong>Cloud Account</strong>
              <p>Supabase auth enabled {authEnabled ? 'in this app' : 'when env vars are set'}.</p>
            </div>
          </article>
          <article className="profile-mode-card">
            <Beaker size={17} />
            <div>
              <strong>Demo Account</strong>
              <p>Sandbox mode with unlocks and no calendar sync actions.</p>
            </div>
          </article>
        </div>

        <div className="profile-current-line">
          <User size={16} />
          <span>Current name: <strong>{accountMode === 'demo' ? 'Demo Player' : authUser ? cloudName : (localDisplayName || 'Player')}</strong></span>
        </div>

        {authUser ? (
          <section className="profile-auth-panel">
            <p>Signed in as <strong>{cloudName}</strong></p>
            <button className="secondary-button full-width" type="button" onClick={handleSignOut} disabled={busy}>
              <LogOut size={17} />Sign out
            </button>
          </section>
        ) : (
          <section className="profile-auth-panel">
            <div className="profile-auth-tabs">
              <button type="button" aria-pressed={mode === 'signin'} onClick={() => setMode('signin')}>Sign in</button>
              <button type="button" aria-pressed={mode === 'signup'} onClick={() => setMode('signup')}>Sign up</button>
            </div>
            {!authEnabled && (
              <p className="profile-auth-disabled">Supabase credentials missing. Local and Demo still work normally.</p>
            )}
            <form className="profile-auth-form" onSubmit={submit}>
              {mode === 'signup' && (
                <>
                  <label htmlFor="profile-display-name">Display name</label>
                  <input
                    id="profile-display-name"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Your name"
                    disabled={busy || !authEnabled}
                  />
                </>
              )}
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@email.com"
                disabled={busy || !authEnabled}
              />
              <label htmlFor="profile-password">Password</label>
              <input
                id="profile-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                disabled={busy || !authEnabled}
              />
              <button className="primary-button full-width" type="submit" disabled={busy || !authEnabled}>
                {mode === 'signup' ? <UserPlus size={17} /> : <LogIn size={17} />}
                {mode === 'signup' ? 'Create cloud account' : 'Sign in to cloud'}
              </button>
            </form>
          </section>
        )}

        {errorText && <p className="profile-auth-error">{errorText}</p>}
        {notice && <p className="profile-auth-notice">{notice}</p>}

        <footer className="profile-modal-actions">
          <button className="secondary-button" type="button" onClick={onContinueLocal} disabled={busy}>
            Continue local-only
          </button>
          <button className="secondary-button" type="button" onClick={onSwitchToDemo} disabled={busy}>
            Switch to Demo Account
          </button>
        </footer>
      </section>
    </div>
  )
}
