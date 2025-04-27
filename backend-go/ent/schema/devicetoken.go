package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

// DeviceToken holds the schema definition for the DeviceToken entity.
type DeviceToken struct {
	ent.Schema
}

// Fields of the DeviceToken.
func (DeviceToken) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).
			Default(uuid.New).
			Unique(),

		field.UUID("user_id", uuid.UUID{}),

		field.String("device_id").
			NotEmpty(),

		field.String("token").
			NotEmpty(),

		field.String("platform").
			NotEmpty(),

		field.Time("created_at").
			Default(time.Now),

		field.Time("updated_at").
			Default(time.Now).
			UpdateDefault(time.Now),
	}
}

// Edges of the DeviceToken.
func (DeviceToken) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("device_tokens").
			Field("user_id").
			Unique().
			Required(),
	}
}

// Indexes of the DeviceToken.
func (DeviceToken) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("user_id", "device_id").Unique(),
	}
}
