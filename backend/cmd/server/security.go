package main

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"

	"importanttracker/backend/internal/model"
)

const (
	serverReadHeaderTimeout = 5
	serverMaxHeaderBytes    = 1 << 20

	maxAuthBodyBytes     int64 = 8 << 10
	maxQueryBodyBytes    int64 = 16 << 10
	maxCaptureBodyBytes  int64 = 12 << 20
	maxCaptureImageBytes       = 8 << 20

	maxQuestionLength    = 2000
	maxOCRTextLength     = 64 << 10
	maxTagHintLength     = 80
	maxSourceAppLength   = 120
	maxSourceTitleLength = 300
)

func withCORS(next http.Handler, allowedOrigins []string) http.Handler {
	allowed := make(map[string]struct{}, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		value := strings.TrimSpace(origin)
		if value == "" {
			continue
		}
		allowed[value] = struct{}{}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if origin == "" {
			next.ServeHTTP(w, r)
			return
		}

		w.Header().Add("Vary", "Origin")

		if _, ok := allowed[origin]; !ok {
			writeJSON(w, http.StatusForbidden, map[string]string{"error": "origin not allowed"})
			return
		}

		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Request-Id")
		w.Header().Set("Access-Control-Max-Age", "600")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func decodeJSONBody(w http.ResponseWriter, r *http.Request, out any, maxBytes int64) error {
	if maxBytes > 0 {
		r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
	}
	defer r.Body.Close()

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(out); err != nil {
		return normalizeJSONDecodeError(err)
	}

	var extra struct{}
	if err := dec.Decode(&extra); !errors.Is(err, io.EOF) {
		if err == nil {
			return fmt.Errorf("request body must contain a single JSON object")
		}
		return normalizeJSONDecodeError(err)
	}

	return nil
}

func normalizeJSONDecodeError(err error) error {
	var maxBytesErr *http.MaxBytesError
	var syntaxErr *json.SyntaxError
	var typeErr *json.UnmarshalTypeError

	switch {
	case errors.As(err, &maxBytesErr):
		return fmt.Errorf("request body too large")
	case errors.Is(err, io.EOF):
		return fmt.Errorf("request body is required")
	case errors.As(err, &syntaxErr):
		return fmt.Errorf("request body contains malformed JSON")
	case errors.As(err, &typeErr):
		if strings.TrimSpace(typeErr.Field) != "" {
			return fmt.Errorf("request body contains an invalid value for %s", typeErr.Field)
		}
		return fmt.Errorf("request body contains an invalid value")
	default:
		raw := strings.TrimSpace(err.Error())
		if strings.HasPrefix(raw, "json: unknown field ") {
			field := strings.Trim(raw[len("json: unknown field "):], "\"")
			if field != "" {
				return fmt.Errorf("request body contains unknown field %s", field)
			}
		}
		return err
	}
}

func validateCaptureInput(in model.CaptureInput) error {
	if len(strings.TrimSpace(in.OCRText)) > maxOCRTextLength {
		return fmt.Errorf("ocr_text exceeds the maximum allowed length")
	}
	if len(strings.TrimSpace(in.TagHint)) > maxTagHintLength {
		return fmt.Errorf("tag_hint exceeds the maximum allowed length")
	}
	if len(strings.TrimSpace(in.SourceApp)) > maxSourceAppLength {
		return fmt.Errorf("source_app exceeds the maximum allowed length")
	}
	if len(strings.TrimSpace(in.SourceTitle)) > maxSourceTitleLength {
		return fmt.Errorf("source_title exceeds the maximum allowed length")
	}

	imageData := extractImagePayload(in.ImageBase64)
	if imageData == "" {
		return nil
	}

	decoded, err := decodeBase64Payload(imageData)
	if err != nil {
		return fmt.Errorf("image_base64 must be valid base64")
	}
	if len(decoded) > maxCaptureImageBytes {
		return fmt.Errorf("image_base64 exceeds the maximum allowed size")
	}

	return nil
}

func validateQueryInput(in model.QueryInput) error {
	question := strings.TrimSpace(in.Question)
	if question == "" {
		return fmt.Errorf("question is required")
	}
	if len(question) > maxQuestionLength {
		return fmt.Errorf("question exceeds the maximum allowed length")
	}
	return nil
}

func extractImagePayload(raw string) string {
	value := strings.TrimSpace(raw)
	if value == "" {
		return ""
	}
	if strings.HasPrefix(strings.ToLower(value), "data:") {
		if idx := strings.Index(value, ","); idx >= 0 {
			return value[idx+1:]
		}
	}
	return value
}

func decodeBase64Payload(raw string) ([]byte, error) {
	cleaned := strings.NewReplacer("\n", "", "\r", "", "\t", "", " ", "").Replace(strings.TrimSpace(raw))
	if cleaned == "" {
		return nil, nil
	}

	if decoded, err := base64.StdEncoding.DecodeString(cleaned); err == nil {
		return decoded, nil
	}
	return base64.RawStdEncoding.DecodeString(cleaned)
}

func rateLimitClientKey(r *http.Request) string {
	if r == nil {
		return ""
	}

	host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
	if err == nil {
		return host
	}
	return strings.TrimSpace(r.RemoteAddr)
}
