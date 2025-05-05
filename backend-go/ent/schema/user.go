package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
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
		field.Uint32("index").Immutable().Unique().Optional(),
		field.String("email").NotEmpty().Unique(),
		field.String("name").NotEmpty(),
		field.String("bio").Default(""),
		field.Uint32("streak_count").Default(0),
		field.String("icon_image_key").Optional(),
		field.Time("created_at").Default(time.Now),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("posts", Post.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("comments", Comment.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("likes", Like.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("pets", Pet.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("following", FollowRelation.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("followers", FollowRelation.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("blocking", BlockRelation.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("blocked_by", BlockRelation.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("daily_tasks", DailyTask.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("device_tokens", DeviceToken.Type).Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}
