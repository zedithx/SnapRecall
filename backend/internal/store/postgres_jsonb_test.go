package store

import "testing"

func TestJSONBPayloadValue_ValidJSON(t *testing.T) {
	payload := jsonbPayload([]byte(`[{"type":"time","value":"09:00"}]`))

	value, err := payload.Value()
	if err != nil {
		t.Fatalf("Value() returned error: %v", err)
	}

	got, ok := value.(string)
	if !ok {
		t.Fatalf("expected string value, got %T", value)
	}
	if got != `[{"type":"time","value":"09:00"}]` {
		t.Fatalf("unexpected json payload: %q", got)
	}
}

func TestJSONBPayloadValue_EmptyDefaultsToArray(t *testing.T) {
	value, err := jsonbPayload(nil).Value()
	if err != nil {
		t.Fatalf("Value() returned error: %v", err)
	}

	got, ok := value.(string)
	if !ok {
		t.Fatalf("expected string value, got %T", value)
	}
	if got != "[]" {
		t.Fatalf("expected [] for empty payload, got %q", got)
	}
}

func TestJSONBPayloadValue_RejectsInvalidJSON(t *testing.T) {
	if _, err := jsonbPayload([]byte(`{"broken"`)).Value(); err == nil {
		t.Fatalf("expected Value() to reject invalid JSON")
	}
}

func TestJSONBPayloadScan(t *testing.T) {
	var payload jsonbPayload

	if err := (&payload).Scan([]byte(`[{"type":"time"}]`)); err != nil {
		t.Fatalf("Scan([]byte) returned error: %v", err)
	}
	if string(payload) != `[{"type":"time"}]` {
		t.Fatalf("unexpected payload after []byte scan: %q", string(payload))
	}

	if err := (&payload).Scan(nil); err != nil {
		t.Fatalf("Scan(nil) returned error: %v", err)
	}
	if string(payload) != "[]" {
		t.Fatalf("expected [] after nil scan, got %q", string(payload))
	}
}
