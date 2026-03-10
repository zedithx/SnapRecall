package auth

import (
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string `json:"uid"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

type Manager struct {
	secret []byte
	ttl    time.Duration
}

func NewManager(secret string, ttl time.Duration) (*Manager, error) {
	normalized := strings.TrimSpace(secret)
	if len(normalized) < 16 {
		return nil, fmt.Errorf("auth jwt secret must be at least 16 characters")
	}
	if ttl <= 0 {
		ttl = 30 * 24 * time.Hour
	}

	return &Manager{
		secret: []byte(normalized),
		ttl:    ttl,
	}, nil
}

func (m *Manager) GenerateToken(userID, email string) (string, error) {
	now := time.Now().UTC()
	claims := Claims{
		UserID: strings.TrimSpace(userID),
		Email:  strings.TrimSpace(email),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   strings.TrimSpace(userID),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(m.ttl)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secret)
}

func (m *Manager) ParseToken(tokenString string) (Claims, error) {
	tokenString = strings.TrimSpace(tokenString)
	if tokenString == "" {
		return Claims{}, fmt.Errorf("token is required")
	}

	parsed, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (any, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return m.secret, nil
	})
	if err != nil {
		return Claims{}, err
	}

	claims, ok := parsed.Claims.(*Claims)
	if !ok || !parsed.Valid {
		return Claims{}, fmt.Errorf("invalid token")
	}

	if strings.TrimSpace(claims.UserID) == "" {
		claims.UserID = strings.TrimSpace(claims.Subject)
	}
	if strings.TrimSpace(claims.UserID) == "" {
		return Claims{}, fmt.Errorf("token missing user id")
	}

	return *claims, nil
}
