package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// Post holds the schema definition for the Post entity.
type Post struct {
	ent.Schema
}

// Fields of the Post.
func (Post) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New).Unique(),
		field.Int("index").Immutable().NonNegative().Unique().Optional(),
		field.String("caption").NotEmpty(),
		field.String("image_key").NotEmpty(),
		field.Time("created_at").Default(time.Now),
		field.Time("deleted_at").Optional(),
	}
}

// Edges of the Post.
func (Post) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("posts").Unique().Required(),
		edge.To("comments", Comment.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("likes", Like.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("daily_task", DailyTask.Type).Unique(),
	}
}
