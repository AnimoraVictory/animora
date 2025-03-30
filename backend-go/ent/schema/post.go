package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
	"github.com/pgvector/pgvector-go"
)

// Post holds the schema definition for the Post entity.
type Post struct {
	ent.Schema
}

// Fields of the Post.
func (Post) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New).Unique(),
		field.String("caption").NotEmpty(),
		field.String("image_key").NotEmpty(),
		field.Time("created_at").Default(time.Now),
		field.Time("deleted_at").Optional(),
		field.Other("text_feature", pgvector.Vector{}).
			SchemaType(map[string]string{
				dialect.Postgres: "vector(768)",
			}).Optional(),
		field.Other("image_feature", pgvector.Vector{}).
			SchemaType(map[string]string{
				dialect.Postgres: "vector(768)",
			}).Optional(),
	}
}

// Edges of the Post.
func (Post) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("posts").Unique(),
		edge.To("comments", Comment.Type),
		edge.To("likes", Like.Type),
	}
}
