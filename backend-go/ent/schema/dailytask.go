package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/aki-13627/animalia/backend-go/ent/enum"
	"github.com/google/uuid"
)

// DailyTask holds the schema definition for the DailyTask entity.
type DailyTask struct {
	ent.Schema
}

// Fields of the DailyTask.
func (DailyTask) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New).Unique(),
		field.Time("created_at").Default(time.Now),
		field.Time("target_date").
			Default(func() time.Time {
				now := time.Now()
				return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
			}).
			SchemaType(map[string]string{
				dialect.Postgres: "DATE",
			}).
			Comment("タスクの対象日（日付のみ）"),
		field.String("type").GoType(enum.TypeEating),
	}
}

// Edges of the DailyTask.
func (DailyTask) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).Ref("daily_tasks").Unique().Required(),
		edge.From("post", Post.Type).Ref("daily_task").Unique(),
	}
}

func (DailyTask) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("target_date"),
		index.Fields("target_date").Edges("user").Unique(),
	}
}
