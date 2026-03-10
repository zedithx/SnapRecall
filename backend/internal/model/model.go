package model

import "time"

type Field struct {
	Type       string  `json:"type"`
	Value      string  `json:"value"`
	Confidence float64 `json:"confidence"`
}

type SourceMeta struct {
	App   string `json:"app"`
	Title string `json:"title"`
}

type CaptureRecord struct {
	ID         string     `json:"id"`
	UserID     string     `json:"user_id"`
	CapturedAt time.Time  `json:"captured_at"`
	Source     SourceMeta `json:"source"`
	OCRText    string     `json:"ocr_text"`
	Summary    string     `json:"summary"`
	Tag        string     `json:"tag"`
	Fields     []Field    `json:"fields"`
}

type CaptureInput struct {
	UserID      string `json:"user_id"`
	OCRText     string `json:"ocr_text"`
	ImageBase64 string `json:"image_base64"`
	TagHint     string `json:"tag_hint"`
	SourceApp   string `json:"source_app"`
	SourceTitle string `json:"source_title"`
	ChatID      string `json:"chat_id"`
}

type QueryInput struct {
	UserID   string `json:"user_id"`
	Question string `json:"question"`
}

type QueryAnswer struct {
	Answer          string  `json:"answer"`
	SourceCaptureID string  `json:"source_capture_id"`
	Confidence      float64 `json:"confidence"`
}

type TelegramLinkStartInput struct {
	UserID string `json:"user_id"`
}

type TelegramLinkStatus struct {
	EventID   string     `json:"event_id"`
	UserID    string     `json:"user_id"`
	Status    string     `json:"status"`
	ChatID    string     `json:"chat_id,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	LinkedAt  *time.Time `json:"linked_at,omitempty"`
}

type TelegramIntegrationStatus struct {
	UserID string `json:"user_id"`
	Status string `json:"status"`
	ChatID string `json:"chat_id,omitempty"`
}

type UserAuth struct {
	ID           string
	Email        string
	PasswordHash string
	CreatedAt    time.Time
}

type UserProfile struct {
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

type AuthRegisterInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthLoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  UserProfile `json:"user"`
}
