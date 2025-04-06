package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/field"
	"github.com/aki-13627/animalia/backend-go/ent/enum"
	"github.com/pgvector/pgvector-go"
)

// TaskType holds the schema definition for the TaskType entity.
type TaskType struct {
	ent.Schema
}

// Fields of the TaskType.
func (TaskType) Fields() []ent.Field {
	return []ent.Field{
		field.String("type").GoType(enum.TypeEating),
		field.Other("text_feature", pgvector.Vector{}).
			SchemaType(map[string]string{
				dialect.Postgres: "vector(768)",
			}).Optional(),
	}
}

// Edges of the TaskType.
func (TaskType) Edges() []ent.Edge {
	return nil
}
