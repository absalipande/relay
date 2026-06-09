package id

import (
	"context"
	"testing"

	"github.com/thecodearcher/limen"
)

func TestUUIDGenerator(t *testing.T) {
	generator := NewUUIDGenerator()

	id, err := generator.Generate(context.Background())
	if err != nil {
		t.Fatalf("generate uuid: %v", err)
	}

	value, ok := id.(string)
	if !ok {
		t.Fatalf("expected string id, got %T", id)
	}

	if len(value) != 36 {
		t.Fatalf("expected uuid length 36, got %d", len(value))
	}

	if generator.GetColumnType() != limen.ColumnTypeUUID {
		t.Fatalf("expected uuid column type, got %q", generator.GetColumnType())
	}
}
