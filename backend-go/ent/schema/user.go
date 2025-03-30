package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New).Unique(),
		field.String("email").NotEmpty().Unique(),
		field.String("name").NotEmpty(),
		field.String("bio").Default(""),
		field.String("icon_image_key").Optional(),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("posts", Post.Type),
		edge.To("comments", Comment.Type),
		edge.To("likes", Like.Type),
		edge.To("pets", Pet.Type),
		edge.To("following", FollowRelation.Type),
		edge.To("followers", FollowRelation.Type),
	}
}
