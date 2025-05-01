package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

// BlockRelation holds the schema definition for the BlockRelation entity.
type BlockRelation struct {
	ent.Schema
}

// Fields of the BlockRelation.
func (BlockRelation) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New).Unique(),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the BlockRelation.
func (BlockRelation) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("from", User.Type).Ref("blocking").Unique().Required(),
		edge.From("to", User.Type).Ref("blocked_by").Unique().Required(),
	}
}

// Ensure uniqueness: a user cannot block the same person twice.
func (BlockRelation) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("from", "to").Unique(),
	}
}
