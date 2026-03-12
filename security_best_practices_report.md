# Security Best Practices Report

## Executive Summary

Scope reviewed on 2026-03-13:

- `backend/` Go HTTP API, auth flow, Telegram integration, and OpenAI integration
- `desktop/` React/Electron renderer and main-process shell

I did not find evidence of committed secret files in tracked Git content, direct SQL injection sinks, or React HTML injection sinks such as `dangerouslySetInnerHTML`. I did find several meaningful security gaps, with the biggest risks centered around abuse resistance for the public API and the Telegram account-link flow.

## High Severity

### SEC-001: API request bodies are not size-bounded

- Rule IDs: `GO-HTTP-002`
- Severity: High
- Location:
  - `backend/cmd/server/main.go:171`
  - `backend/cmd/server/main.go:284`
  - `backend/cmd/server/main.go:527`
  - `backend/internal/model/model.go:27`
- Evidence:

```go
// backend/cmd/server/main.go:527-531
func decodeJSON(r *http.Request, out any) error {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	return dec.Decode(out)
}
```

```go
// backend/internal/model/model.go:27-35
type CaptureInput struct {
	UserID      string `json:"user_id"`
	OCRText     string `json:"ocr_text"`
	ImageBase64 string `json:"image_base64"`
	...
}
```

- Impact: An attacker can send oversized JSON or very large `image_base64` payloads to `/v1/captures` and other endpoints, tying up memory/CPU and potentially driving OpenAI request cost or service degradation.
- Fix: Wrap request bodies with `http.MaxBytesReader` before decoding, and enforce stricter per-route limits. The capture endpoint should also validate decoded/base64 payload size before any AI call.
- Mitigation: Add upstream ingress/proxy body limits as defense in depth.
- False positive notes: This would be less severe if a reverse proxy already enforces tight body-size limits, but that protection is not visible in repo code.

## Medium Severity

### SEC-002: Telegram account-link verification codes are too short for a security token

- Rule IDs: General secure token handling
- Severity: Medium
- Location:
  - `backend/internal/service/service.go:427`
  - `backend/internal/service/service.go:527`
  - `backend/internal/service/service.go:509`
- Evidence:

```go
// backend/internal/service/service.go:527-533
func generateTelegramEventID() string {
	buf := make([]byte, 3)
	if _, err := rand.Read(buf); err != nil {
		return fmt.Sprintf("EVT-%06d", time.Now().UnixNano()%1000000)
	}
	return "EVT-" + strings.ToUpper(hex.EncodeToString(buf))
}
```

```go
// backend/internal/service/service.go:427-447
func (s *Service) TryCompleteTelegramLink(text, chatID string) (model.TelegramLinkStatus, bool) {
	eventID := extractTelegramEventID(text)
	...
	link, ok := s.store.ClaimTelegramLink(eventID, strings.TrimSpace(chatID), time.Now().UTC())
	...
}
```

- Impact: The Telegram link code is only 24 bits of entropy. If an attacker can interact with the bot and guess a still-pending code inside the 10-minute validity window, they can bind their Telegram chat to another user’s account and receive future capture summaries or recall answers.
- Fix: Replace the current event ID with a one-time token of at least 128 bits of randomness, encoded in a user-friendly format such as Base32/Base64URL. Keep the human-facing display if you want, but do not use a 6-hex-character secret as the authorizing factor.
- Mitigation: Add throttling for repeated failed link attempts per chat and per bot instance.
- False positive notes: Telegram-side rate limits reduce brute-force speed, but the token length is still below the usual bar for account-link secrets.

### SEC-003: Internet-facing server is missing explicit header hardening limits

- Rule IDs: `GO-HTTP-001`
- Severity: Medium
- Location:
  - `backend/cmd/server/main.go:423`
- Evidence:

```go
server := &http.Server{
	Addr:         addr,
	Handler:      withRequestLogging(withRecovery(withCORS(mux)), authManager),
	ReadTimeout:  10 * time.Second,
	WriteTimeout: writeTimeout,
	IdleTimeout:  60 * time.Second,
}
```

- Impact: `ReadHeaderTimeout` and `MaxHeaderBytes` are not set, which leaves the API more exposed to slowloris-style header abuse and oversized-header resource exhaustion.
- Fix: Set `ReadHeaderTimeout` and `MaxHeaderBytes` explicitly on the `http.Server`.
- Mitigation: Also enforce request/header limits at the reverse proxy or load balancer.
- False positive notes: Edge infrastructure may already enforce header size/time limits, but those controls are not visible here.

### SEC-004: No rate limiting or abuse controls on auth and costly AI endpoints

- Rule IDs: Go secure baseline (`SHOULD implement rate limiting and abuse controls for auth and expensive endpoints`)
- Severity: Medium
- Location:
  - `backend/cmd/server/main.go:77`
  - `backend/cmd/server/main.go:114`
  - `backend/cmd/server/main.go:171`
  - `backend/cmd/server/main.go:284`
  - `backend/cmd/server/main.go:425`
- Evidence:

```go
// Handlers are wrapped only with logging, recovery, and CORS.
Handler: withRequestLogging(withRecovery(withCORS(mux)), authManager)
```

```go
// Public auth and expensive AI routes exist with no visible throttling middleware.
/v1/auth/register
/v1/auth/login
/v1/captures
/v1/query
```

- Impact: Attackers can brute-force passwords on `/v1/auth/login`, mass-register accounts, or drive up AI spend and service load on `/v1/captures` and `/v1/query`.
- Fix: Add IP- and account-aware rate limiting plus lockout/backoff for login attempts. Add separate quotas for AI-backed routes because those have direct cost impact.
- Mitigation: If you already have edge throttling, document and verify it; do not rely on undocumented infra assumptions.
- False positive notes: A gateway/WAF may already rate limit these routes, but I did not see any app-level or repo-visible configuration for it.

### SEC-005: Renderer persists bearer tokens in `localStorage`

- Rule IDs: React frontend secure storage guidance
- Severity: Medium
- Location:
  - `desktop/src/App.jsx:176`
  - `desktop/src/App.jsx:199`
  - `desktop/src/App.jsx:565`
  - `desktop/src/App.jsx:619`
- Evidence:

```jsx
const AUTH_TOKEN_KEY = 'snaprecall.auth_token'

function saveAuthSession(token, user) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

const [authToken, setAuthToken] = useState(() => {
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || ''
})
```

- Impact: Any renderer compromise, future XSS bug, or malicious injected web content would be able to read a long-lived bearer token and use it directly against the backend API.
- Fix: In Electron, move token storage to the main process and preferably into OS-backed secure storage/keychain. At minimum, shorten token lifetime and avoid exposing long-lived bearer tokens to renderer-local storage.
- Mitigation: Add a renderer CSP and consider enabling Electron renderer sandboxing for additional defense in depth.
- False positive notes: This is somewhat less exposed than a normal browser tab because the app is packaged Electron, but renderer-accessible storage is still a weaker boundary than OS-secure storage.

## Low Severity

### SEC-006: API CORS policy allows any origin

- Rule IDs: Least-privilege CORS posture
- Severity: Low
- Location:
  - `backend/cmd/server/main.go:540`
- Evidence:

```go
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
```

- Impact: Any website can fully script the API from a browser. This is not an auth bypass by itself, but it widens the abuse surface and combines poorly with token theft or missing rate limits.
- Fix: Replace `*` with an allowlist of trusted origins for development and production. If packaged Electron requires `Origin: null`, allow that intentionally rather than allowing every origin.
- Mitigation: Pair tighter CORS with route-level rate limiting.
- False positive notes: If the product intentionally exposes a public browser API to arbitrary origins, this may be accepted risk; document it if so.

## Positive Notes

- `backend/.env` is present locally but is ignored by Git; it did not appear in `git ls-files`.
- Passwords are hashed with bcrypt rather than stored in plaintext.
- I did not find use of `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or obvious SQL string concatenation in the audited codepaths.
- Electron already enables `contextIsolation: true` and `nodeIntegration: false`, which is a solid baseline.

## Report Location

This report was written to `security_best_practices_report.md` in the repo root.
