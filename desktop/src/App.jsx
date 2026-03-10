import { useCallback, useEffect, useMemo, useState } from 'react'

const DEFAULT_BACKEND_URL = normalizeBackendURL(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
)
const AUTH_TOKEN_KEY = 'snaprecall.auth_token'
const AUTH_USER_KEY = 'snaprecall.auth_user'

function normalizeBackendURL(raw) {
  const value = String(raw || '').trim()
  if (!value) {
    return 'http://localhost:8080'
  }
  return value.replace(/\/+$/, '')
}

function getBackendDownHint(backendURL) {
  return `Cannot reach backend at ${backendURL}. Start it with: cd backend && go run ./cmd/server`
}

function getRawBase64(dataUrl) {
  if (!dataUrl) {
    return ''
  }

  const parts = dataUrl.split(',')
  if (parts.length < 2) {
    return dataUrl
  }
  return parts[1]
}

function loadStoredAuthUser() {
  const raw = window.localStorage.getItem(AUTH_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed.user_id === 'string' &&
      parsed.user_id.trim() &&
      typeof parsed.email === 'string' &&
      parsed.email.trim()
    ) {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

function saveAuthSession(token, user) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_USER_KEY)
}

function formatFetchError(err, backendURL) {
  const message = String(err?.message || err || '')
  if (message.toLowerCase().includes('failed to fetch')) {
    return getBackendDownHint(backendURL)
  }
  return message || 'Request failed.'
}

function classifyStatusTone(status) {
  const text = String(status || '').toLowerCase()
  if (!text || text === 'ready') {
    return 'neutral'
  }
  if (text.includes('failed') || text.includes('error')) {
    return 'danger'
  }
  if (
    text.includes('saved') ||
    text.includes('linked') ||
    text.includes('success') ||
    text.includes('logged in')
  ) {
    return 'success'
  }
  return 'info'
}

function App() {
  const backendURL = DEFAULT_BACKEND_URL

  const [authToken, setAuthToken] = useState(() => {
    return window.localStorage.getItem(AUTH_TOKEN_KEY) || ''
  })
  const [authUser, setAuthUser] = useState(loadStoredAuthUser)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(authToken))

  const [question, setQuestion] = useState('')
  const [captureResult, setCaptureResult] = useState(null)
  const [queryResult, setQueryResult] = useState(null)
  const [imageDataURL, setImageDataURL] = useState('')

  const [status, setStatus] = useState('Ready')
  const [isSavingCapture, setIsSavingCapture] = useState(false)
  const [isAsking, setIsAsking] = useState(false)
  const [isUpdatingShortcut, setIsUpdatingShortcut] = useState(false)
  const [isStartingTelegramLink, setIsStartingTelegramLink] = useState(false)
  const [isCheckingTelegramLink, setIsCheckingTelegramLink] = useState(false)

  const [shortcut, setShortcut] = useState('CommandOrControl+Shift+S')
  const [shortcutDraft, setShortcutDraft] = useState('CommandOrControl+Shift+S')
  const [botUsername, setBotUsername] = useState('')
  const [telegramEventID, setTelegramEventID] = useState('')
  const [telegramLinkStatus, setTelegramLinkStatus] = useState('not_linked')

  const userID = authUser?.user_id || ''
  const isTelegramLinked = telegramLinkStatus === 'linked'
  const statusTone = classifyStatusTone(status)

  const authHeaders = useMemo(() => {
    if (!authToken) {
      return {}
    }

    return {
      Authorization: `Bearer ${authToken}`
    }
  }, [authToken])

  const hasElectronAPI = useMemo(
    () => Boolean(window.electronAPI && window.electronAPI.captureScreen),
    []
  )

  useEffect(() => {
    if (!authToken) {
      setAuthUser(null)
      setIsCheckingAuth(false)
      return
    }

    let cancelled = false
    async function validateAuthToken() {
      try {
        setIsCheckingAuth(true)
        const res = await fetch(`${backendURL}/v1/auth/me`, {
          method: 'GET',
          headers: {
            ...authHeaders
          }
        })
        const data = await res.json()

        if (!res.ok || !data?.user) {
          if (!cancelled) {
            clearAuthSession()
            setAuthToken('')
            setAuthUser(null)
          }
          return
        }

        if (!cancelled) {
          setAuthUser(data.user)
          saveAuthSession(authToken, data.user)
        }
      } catch {
        if (!cancelled) {
          clearAuthSession()
          setAuthToken('')
          setAuthUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAuth(false)
        }
      }
    }

    validateAuthToken()

    return () => {
      cancelled = true
    }
  }, [authHeaders, authToken, backendURL])

  const captureAndSave = useCallback(async () => {
    if (!authUser) {
      setStatus('Please log in to capture and save.')
      return
    }

    if (!hasElectronAPI) {
      setStatus('Capture only works inside Electron runtime.')
      return
    }

    try {
      setIsSavingCapture(true)
      setStatus('Capturing screen...')

      const dataUrl = await window.electronAPI.captureScreen()
      setImageDataURL(dataUrl)

      const payload = {
        user_id: userID,
        ocr_text: '',
        image_base64: getRawBase64(dataUrl),
        tag_hint: '',
        source_app: 'desktop',
        source_title: 'Quick Capture'
      }

      setStatus('Saving capture...')
      const res = await fetch(`${backendURL}/v1/captures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) {
        setStatus(`Capture failed: ${data.error || 'unknown error'}`)
        return
      }

      setCaptureResult(data)
      setStatus('Capture saved successfully.')
    } catch (err) {
      setStatus(`Capture failed: ${formatFetchError(err, backendURL)}`)
    } finally {
      setIsSavingCapture(false)
    }
  }, [authHeaders, authUser, backendURL, hasElectronAPI, userID])

  useEffect(() => {
    let unsubscribe = () => {}

    async function init() {
      if (!hasElectronAPI) {
        return
      }

      try {
        const appInfo = await window.electronAPI.getAppInfo()
        if (appInfo?.captureShortcut) {
          setShortcut(appInfo.captureShortcut)
          setShortcutDraft(appInfo.captureShortcut)
        }
      } catch {
        setStatus('Could not load app info.')
      }

      const unbindCapture = window.electronAPI.onCaptureShortcut(async () => {
        setStatus('Shortcut triggered.')
        await captureAndSave()
      })

      const unbindShortcutUpdated = window.electronAPI.onShortcutUpdated((payload) => {
        if (payload?.shortcut) {
          setShortcut(payload.shortcut)
          setShortcutDraft(payload.shortcut)
        }
      })

      unsubscribe = () => {
        unbindCapture()
        unbindShortcutUpdated()
      }
    }

    init()

    return () => {
      unsubscribe()
    }
  }, [captureAndSave, hasElectronAPI])

  useEffect(() => {
    if (!authToken || !authUser?.user_id) {
      setIsCheckingTelegramLink(false)
      setTelegramEventID('')
      setTelegramLinkStatus('not_linked')
      return
    }

    let cancelled = false
    async function loadTelegramStatus() {
      try {
        setIsCheckingTelegramLink(true)
        const res = await fetch(`${backendURL}/v1/integrations/telegram/me`, {
          method: 'GET',
          headers: {
            ...authHeaders
          }
        })
        const data = await res.json()

        if (!cancelled) {
          const nextStatus = data?.status || 'not_linked'
          setTelegramLinkStatus(nextStatus)
          if (nextStatus === 'linked') {
            setTelegramEventID('')
          }
        }
      } catch {
        if (!cancelled) {
          setTelegramLinkStatus('not_linked')
        }
      } finally {
        if (!cancelled) {
          setIsCheckingTelegramLink(false)
        }
      }
    }

    loadTelegramStatus()

    return () => {
      cancelled = true
    }
  }, [authHeaders, authToken, authUser?.user_id, backendURL])

  useEffect(() => {
    if (!telegramEventID || telegramLinkStatus !== 'pending') {
      return
    }

    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(
          `${backendURL}/v1/integrations/telegram/status?event_id=${encodeURIComponent(telegramEventID)}`
        )
        if (!res.ok) {
          return
        }

        const data = await res.json()
        if (data?.status) {
          setTelegramLinkStatus(data.status)
          if (data.status === 'linked') {
            setStatus('Telegram linked successfully.')
          }
        }
      } catch {
        // Keep polling silently while pending.
      }
    }, 3000)

    return () => {
      window.clearInterval(timer)
    }
  }, [backendURL, telegramEventID, telegramLinkStatus])

  async function onAuthSubmit(event) {
    event.preventDefault()

    const email = authEmail.trim()
    const password = authPassword
    if (!email || !password) {
      setStatus('Email and password are required.')
      return
    }

    try {
      setIsAuthenticating(true)
      setStatus(authMode === 'register' ? 'Creating account...' : 'Logging in...')

      const endpoint = authMode === 'register' ? '/v1/auth/register' : '/v1/auth/login'
      const res = await fetch(`${backendURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      if (!res.ok || !data?.token || !data?.user) {
        setStatus(`Auth failed: ${data?.error || 'unknown error'}`)
        return
      }

      setAuthToken(data.token)
      setAuthUser(data.user)
      setAuthPassword('')
      saveAuthSession(data.token, data.user)
      setTelegramEventID('')
      setTelegramLinkStatus('checking')
      setStatus(authMode === 'register' ? 'Account created and logged in.' : 'Logged in.')
    } catch (err) {
      setStatus(`Auth failed: ${formatFetchError(err, backendURL)}`)
    } finally {
      setIsAuthenticating(false)
    }
  }

  function onLogout() {
    clearAuthSession()
    setAuthToken('')
    setAuthUser(null)
    setAuthPassword('')
    setTelegramEventID('')
    setTelegramLinkStatus('not_linked')
    setStatus('Logged out.')
  }

  async function onSaveShortcut() {
    if (!hasElectronAPI || !window.electronAPI?.updateCaptureShortcut) {
      setStatus('Shortcut update only works inside Electron runtime.')
      return
    }

    const next = shortcutDraft.trim()
    if (!next) {
      setStatus('Shortcut cannot be empty.')
      return
    }

    try {
      setIsUpdatingShortcut(true)
      const result = await window.electronAPI.updateCaptureShortcut(next)
      if (!result?.ok) {
        setStatus(result?.error || 'Shortcut update failed.')
        return
      }

      setShortcut(result.shortcut)
      setShortcutDraft(result.shortcut)
      setStatus(`Capture shortcut updated to ${result.shortcut}.`)
    } catch (err) {
      setStatus(`Shortcut update failed: ${formatFetchError(err, backendURL)}`)
    } finally {
      setIsUpdatingShortcut(false)
    }
  }

  async function onIntegrateTelegram() {
    if (!authUser) {
      setStatus('Please log in to connect Telegram.')
      return
    }

    try {
      setIsStartingTelegramLink(true)
      setStatus('Generating Telegram event ID...')

      const res = await fetch(`${backendURL}/v1/integrations/telegram/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ user_id: userID })
      })

      const data = await res.json()
      if (!res.ok) {
        setStatus(`Telegram integration failed: ${data.error || 'unknown error'}`)
        return
      }

      const nextStatus = data.status || 'pending'
      setTelegramEventID(data.event_id || '')
      setTelegramLinkStatus(nextStatus)
      setBotUsername(data.bot_username || '')
      if (nextStatus === 'linked') {
        setStatus('Telegram is already linked for this account.')
      } else {
        setStatus('Telegram event ID generated. Follow the steps below to connect.')
      }
    } catch (err) {
      setStatus(`Telegram integration failed: ${formatFetchError(err, backendURL)}`)
    } finally {
      setIsStartingTelegramLink(false)
    }
  }

  async function onAsk(event) {
    event.preventDefault()

    if (!authUser) {
      setStatus('Please log in to ask SnapRecall.')
      return
    }

    if (!question.trim()) {
      setStatus('Enter a question first.')
      return
    }

    try {
      setIsAsking(true)
      setStatus('Asking SnapRecall...')

      const res = await fetch(`${backendURL}/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          user_id: userID,
          question: question.trim()
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setStatus(`Ask failed: ${data.error || 'unknown error'}`)
        return
      }

      setQueryResult(data)
      setStatus('Answer ready.')
    } catch (err) {
      setStatus(`Ask failed: ${formatFetchError(err, backendURL)}`)
    } finally {
      setIsAsking(false)
    }
  }

  const accountBody = authUser ? (
    <div className="stack">
      <div className="identity-pill">
        <span className="identity-label">Signed in as</span>
        <strong>{authUser.email}</strong>
      </div>
      <button type="button" className="secondary-btn" onClick={onLogout} disabled={isCheckingAuth}>
        Log Out
      </button>
      <p className="hint">Telegram linkage and memory stay attached to this account.</p>
    </div>
  ) : (
    <form onSubmit={onAuthSubmit} className="stack">
      <label>
        Email
        <input
          value={authEmail}
          onChange={(e) => setAuthEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={authPassword}
          onChange={(e) => setAuthPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
        />
      </label>

      <div className="row-2">
        <button type="submit" disabled={isAuthenticating || isCheckingAuth}>
          {isAuthenticating
            ? authMode === 'register'
              ? 'Creating...'
              : 'Logging In...'
            : authMode === 'register'
              ? 'Register'
              : 'Login'}
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
          disabled={isAuthenticating || isCheckingAuth}
        >
          {authMode === 'register' ? 'Use Login' : 'Use Register'}
        </button>
      </div>

      <p className="hint">Login unlocks capture sync, Telegram, and searchable history.</p>
    </form>
  )

  return (
    <div className="app-shell mode-workspace">
      <header className="topbar">
        <div>
          <p className="eyebrow">SnapRecall</p>
          <h1>Command Workspace</h1>
          <p className="subtitle">
            Capture important info instantly, then ask naturally whenever you need it.
          </p>
        </div>

        <div className="top-actions">
          <span className={`status-badge tone-${statusTone}`}>{status}</span>
        </div>
      </header>

      <main className="workspace-layout">
        <section className="panel panel-account">
          <div className="panel-head">
            <h2>Account</h2>
            <p>Persistent login keeps integrations portable across devices.</p>
          </div>
          {accountBody}
        </section>

        <section className="panel panel-capture">
          <div className="panel-head">
            <h2>Capture Studio</h2>
            <p>Fast capture with shortcut control.</p>
          </div>

          <div className="shortcut-panel">
            <label>
              Screenshot Shortcut
              <input
                value={shortcutDraft}
                onChange={(e) => setShortcutDraft(e.target.value)}
                placeholder="CommandOrControl+Shift+S"
              />
            </label>
            <button type="button" onClick={onSaveShortcut} disabled={isUpdatingShortcut}>
              {isUpdatingShortcut ? 'Saving Shortcut...' : 'Save Shortcut'}
            </button>
            <p className="hint">
              Current shortcut: <code>{shortcut}</code>
            </p>
          </div>

          <button type="button" onClick={captureAndSave} disabled={!authUser || isSavingCapture}>
            {!authUser ? 'Login Required' : isSavingCapture ? 'Capturing...' : 'Capture and Save'}
          </button>

          {imageDataURL ? (
            <div className="preview-wrap">
              <h3>Latest Capture</h3>
              <img src={imageDataURL} alt="capture preview" className="preview" />
            </div>
          ) : null}

          {captureResult ? (
            <div className="result">
              <h3>Capture Result</h3>
              <pre>{JSON.stringify(captureResult, null, 2)}</pre>
            </div>
          ) : null}
        </section>

        <section className="panel panel-ask">
          <div className="panel-head">
            <h2>Ask Memory</h2>
            <p>Natural-language retrieval over your saved context.</p>
          </div>

          <form onSubmit={onAsk} className="stack">
            <label>
              Question
              <textarea
                rows={5}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What time is my exam and where is it?"
              />
            </label>

            <button type="submit" disabled={!authUser || isAsking}>
              {!authUser ? 'Login Required' : isAsking ? 'Asking...' : 'Ask SnapRecall'}
            </button>
          </form>

          {queryResult ? (
            <div className="result result-answer">
              <h3>Answer</h3>
              <pre>{JSON.stringify(queryResult, null, 2)}</pre>
            </div>
          ) : null}
        </section>

        <section className="panel panel-telegram">
          <div className="panel-head">
            <h2>Telegram Bridge</h2>
            <p>Link once, then query directly from Telegram chat.</p>
          </div>

          <button
            type="button"
            onClick={onIntegrateTelegram}
            disabled={!authUser || isStartingTelegramLink || isCheckingTelegramLink || isTelegramLinked}
          >
            {!authUser
              ? 'Login Required'
              : isCheckingTelegramLink
                ? 'Checking Connection...'
                : isStartingTelegramLink
                  ? 'Generating Event ID...'
                  : isTelegramLinked
                    ? 'Telegram Connected'
                    : 'Integrate with Telegram'}
          </button>

          {isTelegramLinked && !telegramEventID ? (
            <div className="result">
              <p>Telegram is linked for this account. New captures are pushed to your linked chat.</p>
            </div>
          ) : null}

          {telegramEventID ? (
            <div className="result">
              <h3>Connection Steps</h3>
              <p>
                1. Open your bot
                {botUsername ? (
                  <>
                    {' '}
                    <a href={`https://t.me/${botUsername}`} target="_blank" rel="noreferrer">
                      @{botUsername}
                    </a>
                  </>
                ) : (
                  '.'
                )}
              </p>
              <p>
                2. Send event ID <code>{telegramEventID}</code>
              </p>
              <p>
                3. Wait until status becomes <strong>linked</strong>
              </p>
              <p>
                Current status: <strong>{telegramLinkStatus}</strong>
              </p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  )
}

export default App
