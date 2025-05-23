// Code generated by ent, DO NOT EDIT.

package ent

import (
	"fmt"
	"strings"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/sql"
	"github.com/aki-13627/animalia/backend-go/ent/dailytask"
	"github.com/aki-13627/animalia/backend-go/ent/post"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
)

// Post is the model entity for the Post schema.
type Post struct {
	config `json:"-"`
	// ID of the ent.
	ID uuid.UUID `json:"id,omitempty"`
	// Index holds the value of the "index" field.
	Index uint32 `json:"index,omitempty"`
	// Caption holds the value of the "caption" field.
	Caption string `json:"caption,omitempty"`
	// ImageKey holds the value of the "image_key" field.
	ImageKey string `json:"image_key,omitempty"`
	// CreatedAt holds the value of the "created_at" field.
	CreatedAt time.Time `json:"created_at,omitempty"`
	// DeletedAt holds the value of the "deleted_at" field.
	DeletedAt time.Time `json:"deleted_at,omitempty"`
	// Edges holds the relations/edges for other nodes in the graph.
	// The values are being populated by the PostQuery when eager-loading is set.
	Edges        PostEdges `json:"edges"`
	user_posts   *uuid.UUID
	selectValues sql.SelectValues
}

// PostEdges holds the relations/edges for other nodes in the graph.
type PostEdges struct {
	// User holds the value of the user edge.
	User *User `json:"user,omitempty"`
	// Comments holds the value of the comments edge.
	Comments []*Comment `json:"comments,omitempty"`
	// Likes holds the value of the likes edge.
	Likes []*Like `json:"likes,omitempty"`
	// DailyTask holds the value of the daily_task edge.
	DailyTask *DailyTask `json:"daily_task,omitempty"`
	// loadedTypes holds the information for reporting if a
	// type was loaded (or requested) in eager-loading or not.
	loadedTypes [4]bool
}

// UserOrErr returns the User value or an error if the edge
// was not loaded in eager-loading, or loaded but was not found.
func (e PostEdges) UserOrErr() (*User, error) {
	if e.User != nil {
		return e.User, nil
	} else if e.loadedTypes[0] {
		return nil, &NotFoundError{label: user.Label}
	}
	return nil, &NotLoadedError{edge: "user"}
}

// CommentsOrErr returns the Comments value or an error if the edge
// was not loaded in eager-loading.
func (e PostEdges) CommentsOrErr() ([]*Comment, error) {
	if e.loadedTypes[1] {
		return e.Comments, nil
	}
	return nil, &NotLoadedError{edge: "comments"}
}

// LikesOrErr returns the Likes value or an error if the edge
// was not loaded in eager-loading.
func (e PostEdges) LikesOrErr() ([]*Like, error) {
	if e.loadedTypes[2] {
		return e.Likes, nil
	}
	return nil, &NotLoadedError{edge: "likes"}
}

// DailyTaskOrErr returns the DailyTask value or an error if the edge
// was not loaded in eager-loading, or loaded but was not found.
func (e PostEdges) DailyTaskOrErr() (*DailyTask, error) {
	if e.DailyTask != nil {
		return e.DailyTask, nil
	} else if e.loadedTypes[3] {
		return nil, &NotFoundError{label: dailytask.Label}
	}
	return nil, &NotLoadedError{edge: "daily_task"}
}

// scanValues returns the types for scanning values from sql.Rows.
func (*Post) scanValues(columns []string) ([]any, error) {
	values := make([]any, len(columns))
	for i := range columns {
		switch columns[i] {
		case post.FieldIndex:
			values[i] = new(sql.NullInt64)
		case post.FieldCaption, post.FieldImageKey:
			values[i] = new(sql.NullString)
		case post.FieldCreatedAt, post.FieldDeletedAt:
			values[i] = new(sql.NullTime)
		case post.FieldID:
			values[i] = new(uuid.UUID)
		case post.ForeignKeys[0]: // user_posts
			values[i] = &sql.NullScanner{S: new(uuid.UUID)}
		default:
			values[i] = new(sql.UnknownType)
		}
	}
	return values, nil
}

// assignValues assigns the values that were returned from sql.Rows (after scanning)
// to the Post fields.
func (po *Post) assignValues(columns []string, values []any) error {
	if m, n := len(values), len(columns); m < n {
		return fmt.Errorf("mismatch number of scan values: %d != %d", m, n)
	}
	for i := range columns {
		switch columns[i] {
		case post.FieldID:
			if value, ok := values[i].(*uuid.UUID); !ok {
				return fmt.Errorf("unexpected type %T for field id", values[i])
			} else if value != nil {
				po.ID = *value
			}
		case post.FieldIndex:
			if value, ok := values[i].(*sql.NullInt64); !ok {
				return fmt.Errorf("unexpected type %T for field index", values[i])
			} else if value.Valid {
				po.Index = uint32(value.Int64)
			}
		case post.FieldCaption:
			if value, ok := values[i].(*sql.NullString); !ok {
				return fmt.Errorf("unexpected type %T for field caption", values[i])
			} else if value.Valid {
				po.Caption = value.String
			}
		case post.FieldImageKey:
			if value, ok := values[i].(*sql.NullString); !ok {
				return fmt.Errorf("unexpected type %T for field image_key", values[i])
			} else if value.Valid {
				po.ImageKey = value.String
			}
		case post.FieldCreatedAt:
			if value, ok := values[i].(*sql.NullTime); !ok {
				return fmt.Errorf("unexpected type %T for field created_at", values[i])
			} else if value.Valid {
				po.CreatedAt = value.Time
			}
		case post.FieldDeletedAt:
			if value, ok := values[i].(*sql.NullTime); !ok {
				return fmt.Errorf("unexpected type %T for field deleted_at", values[i])
			} else if value.Valid {
				po.DeletedAt = value.Time
			}
		case post.ForeignKeys[0]:
			if value, ok := values[i].(*sql.NullScanner); !ok {
				return fmt.Errorf("unexpected type %T for field user_posts", values[i])
			} else if value.Valid {
				po.user_posts = new(uuid.UUID)
				*po.user_posts = *value.S.(*uuid.UUID)
			}
		default:
			po.selectValues.Set(columns[i], values[i])
		}
	}
	return nil
}

// Value returns the ent.Value that was dynamically selected and assigned to the Post.
// This includes values selected through modifiers, order, etc.
func (po *Post) Value(name string) (ent.Value, error) {
	return po.selectValues.Get(name)
}

// QueryUser queries the "user" edge of the Post entity.
func (po *Post) QueryUser() *UserQuery {
	return NewPostClient(po.config).QueryUser(po)
}

// QueryComments queries the "comments" edge of the Post entity.
func (po *Post) QueryComments() *CommentQuery {
	return NewPostClient(po.config).QueryComments(po)
}

// QueryLikes queries the "likes" edge of the Post entity.
func (po *Post) QueryLikes() *LikeQuery {
	return NewPostClient(po.config).QueryLikes(po)
}

// QueryDailyTask queries the "daily_task" edge of the Post entity.
func (po *Post) QueryDailyTask() *DailyTaskQuery {
	return NewPostClient(po.config).QueryDailyTask(po)
}

// Update returns a builder for updating this Post.
// Note that you need to call Post.Unwrap() before calling this method if this Post
// was returned from a transaction, and the transaction was committed or rolled back.
func (po *Post) Update() *PostUpdateOne {
	return NewPostClient(po.config).UpdateOne(po)
}

// Unwrap unwraps the Post entity that was returned from a transaction after it was closed,
// so that all future queries will be executed through the driver which created the transaction.
func (po *Post) Unwrap() *Post {
	_tx, ok := po.config.driver.(*txDriver)
	if !ok {
		panic("ent: Post is not a transactional entity")
	}
	po.config.driver = _tx.drv
	return po
}

// String implements the fmt.Stringer.
func (po *Post) String() string {
	var builder strings.Builder
	builder.WriteString("Post(")
	builder.WriteString(fmt.Sprintf("id=%v, ", po.ID))
	builder.WriteString("index=")
	builder.WriteString(fmt.Sprintf("%v", po.Index))
	builder.WriteString(", ")
	builder.WriteString("caption=")
	builder.WriteString(po.Caption)
	builder.WriteString(", ")
	builder.WriteString("image_key=")
	builder.WriteString(po.ImageKey)
	builder.WriteString(", ")
	builder.WriteString("created_at=")
	builder.WriteString(po.CreatedAt.Format(time.ANSIC))
	builder.WriteString(", ")
	builder.WriteString("deleted_at=")
	builder.WriteString(po.DeletedAt.Format(time.ANSIC))
	builder.WriteByte(')')
	return builder.String()
}

// Posts is a parsable slice of Post.
type Posts []*Post
