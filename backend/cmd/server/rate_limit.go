package main

import (
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	loginIPLimit         = 20
	loginIPWindow        = time.Minute
	loginIdentityLimit   = 10
	loginIdentityWindow  = 15 * time.Minute
	registerIPLimit      = 10
	registerIPWindow     = time.Hour
	registerEmailLimit   = 3
	registerEmailWindow  = time.Hour
	captureUserLimit     = 30
	captureUserWindow    = 5 * time.Minute
	captureIPLimit       = 40
	captureIPWindow      = 5 * time.Minute
	queryUserLimit       = 60
	queryUserWindow      = 5 * time.Minute
	queryIPLimit         = 80
	queryIPWindow        = 5 * time.Minute
	rateLimiterGCInterval = time.Minute
)

type rateLimitEntry struct {
	count   int
	resetAt time.Time
}

type fixedWindowRateLimiter struct {
	mu      sync.Mutex
	entries map[string]rateLimitEntry
	now     func() time.Time
	lastGC  time.Time
}

type rateLimitDecision struct {
	allowed    bool
	retryAfter time.Duration
}

func newFixedWindowRateLimiter() *fixedWindowRateLimiter {
	return &fixedWindowRateLimiter{
		entries: make(map[string]rateLimitEntry),
		now:     time.Now,
	}
}

func (l *fixedWindowRateLimiter) Allow(bucket, subject string, limit int, window time.Duration) rateLimitDecision {
	subject = strings.TrimSpace(subject)
	if l == nil || subject == "" || limit <= 0 || window <= 0 {
		return rateLimitDecision{allowed: true}
	}

	now := l.now().UTC()
	key := bucket + "|" + subject

	l.mu.Lock()
	defer l.mu.Unlock()

	if l.lastGC.IsZero() || now.Sub(l.lastGC) >= rateLimiterGCInterval {
		for entryKey, entry := range l.entries {
			if !now.Before(entry.resetAt) {
				delete(l.entries, entryKey)
			}
		}
		l.lastGC = now
	}

	entry := l.entries[key]
	if entry.resetAt.IsZero() || !now.Before(entry.resetAt) {
		entry = rateLimitEntry{
			count:   0,
			resetAt: now.Add(window),
		}
	}

	if entry.count >= limit {
		l.entries[key] = entry
		return rateLimitDecision{
			allowed:    false,
			retryAfter: entry.resetAt.Sub(now),
		}
	}

	entry.count++
	l.entries[key] = entry
	return rateLimitDecision{allowed: true}
}

func enforceRateLimit(w http.ResponseWriter, limiter *fixedWindowRateLimiter, bucket, subject string, limit int, window time.Duration) bool {
	decision := limiter.Allow(bucket, subject, limit, window)
	if decision.allowed {
		return true
	}

	retryAfterSeconds := int(decision.retryAfter / time.Second)
	if decision.retryAfter%time.Second != 0 {
		retryAfterSeconds++
	}
	if retryAfterSeconds < 1 {
		retryAfterSeconds = 1
	}

	w.Header().Set("Retry-After", strconv.Itoa(retryAfterSeconds))
	writeJSON(w, http.StatusTooManyRequests, map[string]string{"error": "rate limit exceeded; please try again later"})
	return false
}

func enforceLoginRateLimits(w http.ResponseWriter, r *http.Request, limiter *fixedWindowRateLimiter, email string) bool {
	if !enforceRateLimit(w, limiter, "auth:login:ip", rateLimitClientKey(r), loginIPLimit, loginIPWindow) {
		return false
	}
	return enforceRateLimit(
		w,
		limiter,
		"auth:login:identity",
		strings.ToLower(strings.TrimSpace(email)),
		loginIdentityLimit,
		loginIdentityWindow,
	)
}

func enforceRegisterRateLimits(w http.ResponseWriter, r *http.Request, limiter *fixedWindowRateLimiter, email string) bool {
	if !enforceRateLimit(w, limiter, "auth:register:ip", rateLimitClientKey(r), registerIPLimit, registerIPWindow) {
		return false
	}
	return enforceRateLimit(
		w,
		limiter,
		"auth:register:identity",
		strings.ToLower(strings.TrimSpace(email)),
		registerEmailLimit,
		registerEmailWindow,
	)
}

func enforceCaptureRateLimits(w http.ResponseWriter, r *http.Request, limiter *fixedWindowRateLimiter, userID string) bool {
	if !enforceRateLimit(w, limiter, "capture:ip", rateLimitClientKey(r), captureIPLimit, captureIPWindow) {
		return false
	}
	return enforceRateLimit(w, limiter, "capture:user", userID, captureUserLimit, captureUserWindow)
}

func enforceQueryRateLimits(w http.ResponseWriter, r *http.Request, limiter *fixedWindowRateLimiter, userID string) bool {
	if !enforceRateLimit(w, limiter, "query:ip", rateLimitClientKey(r), queryIPLimit, queryIPWindow) {
		return false
	}
	return enforceRateLimit(w, limiter, "query:user", userID, queryUserLimit, queryUserWindow)
}
