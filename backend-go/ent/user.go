// Code generated by ent, DO NOT EDIT.

package ent

import (
	"fmt"
	"strings"
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/sql"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
)

// User is the model entity for the User schema.
type User struct {
	config `json:"-"`
	// ID of the ent.
	ID uuid.UUID `json:"id,omitempty"`
	// Index holds the value of the "index" field.
	Index uint32 `json:"index,omitempty"`
	// Email holds the value of the "email" field.
	Email string `json:"email,omitempty"`
	// Name holds the value of the "name" field.
	Name string `json:"name,omitempty"`
	// Bio holds the value of the "bio" field.
	Bio string `json:"bio,omitempty"`
	// StreakCount holds the value of the "streak_count" field.
	StreakCount uint32 `json:"streak_count,omitempty"`
	// IconImageKey holds the value of the "icon_image_key" field.
	IconImageKey string `json:"icon_image_key,omitempty"`
	// CreatedAt holds the value of the "created_at" field.
	CreatedAt time.Time `json:"created_at,omitempty"`
	// Edges holds the relations/edges for other nodes in the graph.
	// The values are being populated by the UserQuery when eager-loading is set.
	Edges        UserEdges `json:"edges"`
	selectValues sql.SelectValues
}

// UserEdges holds the relations/edges for other nodes in the graph.
type UserEdges struct {
	// Posts holds the value of the posts edge.
	Posts []*Post `json:"posts,omitempty"`
	// Comments holds the value of the comments edge.
	Comments []*Comment `json:"comments,omitempty"`
	// Likes holds the value of the likes edge.
	Likes []*Like `json:"likes,omitempty"`
	// Pets holds the value of the pets edge.
	Pets []*Pet `json:"pets,omitempty"`
	// Following holds the value of the following edge.
	Following []*FollowRelation `json:"following,omitempty"`
	// Followers holds the value of the followers edge.
	Followers []*FollowRelation `json:"followers,omitempty"`
	// Blocking holds the value of the blocking edge.
	Blocking []*BlockRelation `json:"blocking,omitempty"`
	// BlockedBy holds the value of the blocked_by edge.
	BlockedBy []*BlockRelation `json:"blocked_by,omitempty"`
	// DailyTasks holds the value of the daily_tasks edge.
	DailyTasks []*DailyTask `json:"daily_tasks,omitempty"`
	// DeviceTokens holds the value of the device_tokens edge.
	DeviceTokens []*DeviceToken `json:"device_tokens,omitempty"`
	// loadedTypes holds the information for reporting if a
	// type was loaded (or requested) in eager-loading or not.
	loadedTypes [10]bool
}

// PostsOrErr returns the Posts value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) PostsOrErr() ([]*Post, error) {
	if e.loadedTypes[0] {
		return e.Posts, nil
	}
	return nil, &NotLoadedError{edge: "posts"}
}

// CommentsOrErr returns the Comments value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) CommentsOrErr() ([]*Comment, error) {
	if e.loadedTypes[1] {
		return e.Comments, nil
	}
	return nil, &NotLoadedError{edge: "comments"}
}

// LikesOrErr returns the Likes value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) LikesOrErr() ([]*Like, error) {
	if e.loadedTypes[2] {
		return e.Likes, nil
	}
	return nil, &NotLoadedError{edge: "likes"}
}

// PetsOrErr returns the Pets value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) PetsOrErr() ([]*Pet, error) {
	if e.loadedTypes[3] {
		return e.Pets, nil
	}
	return nil, &NotLoadedError{edge: "pets"}
}

// FollowingOrErr returns the Following value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) FollowingOrErr() ([]*FollowRelation, error) {
	if e.loadedTypes[4] {
		return e.Following, nil
	}
	return nil, &NotLoadedError{edge: "following"}
}

// FollowersOrErr returns the Followers value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) FollowersOrErr() ([]*FollowRelation, error) {
	if e.loadedTypes[5] {
		return e.Followers, nil
	}
	return nil, &NotLoadedError{edge: "followers"}
}

// BlockingOrErr returns the Blocking value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) BlockingOrErr() ([]*BlockRelation, error) {
	if e.loadedTypes[6] {
		return e.Blocking, nil
	}
	return nil, &NotLoadedError{edge: "blocking"}
}

// BlockedByOrErr returns the BlockedBy value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) BlockedByOrErr() ([]*BlockRelation, error) {
	if e.loadedTypes[7] {
		return e.BlockedBy, nil
	}
	return nil, &NotLoadedError{edge: "blocked_by"}
}

// DailyTasksOrErr returns the DailyTasks value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) DailyTasksOrErr() ([]*DailyTask, error) {
	if e.loadedTypes[8] {
		return e.DailyTasks, nil
	}
	return nil, &NotLoadedError{edge: "daily_tasks"}
}

// DeviceTokensOrErr returns the DeviceTokens value or an error if the edge
// was not loaded in eager-loading.
func (e UserEdges) DeviceTokensOrErr() ([]*DeviceToken, error) {
	if e.loadedTypes[9] {
		return e.DeviceTokens, nil
	}
	return nil, &NotLoadedError{edge: "device_tokens"}
}

// scanValues returns the types for scanning values from sql.Rows.
func (*User) scanValues(columns []string) ([]any, error) {
	values := make([]any, len(columns))
	for i := range columns {
		switch columns[i] {
		case user.FieldIndex, user.FieldStreakCount:
			values[i] = new(sql.NullInt64)
		case user.FieldEmail, user.FieldName, user.FieldBio, user.FieldIconImageKey:
			values[i] = new(sql.NullString)
		case user.FieldCreatedAt:
			values[i] = new(sql.NullTime)
		case user.FieldID:
			values[i] = new(uuid.UUID)
		default:
			values[i] = new(sql.UnknownType)
		}
	}
	return values, nil
}

// assignValues assigns the values that were returned from sql.Rows (after scanning)
// to the User fields.
func (u *User) assignValues(columns []string, values []any) error {
	if m, n := len(values), len(columns); m < n {
		return fmt.Errorf("mismatch number of scan values: %d != %d", m, n)
	}
	for i := range columns {
		switch columns[i] {
		case user.FieldID:
			if value, ok := values[i].(*uuid.UUID); !ok {
				return fmt.Errorf("unexpected type %T for field id", values[i])
			} else if value != nil {
				u.ID = *value
			}
		case user.FieldIndex:
			if value, ok := values[i].(*sql.NullInt64); !ok {
				return fmt.Errorf("unexpected type %T for field index", values[i])
			} else if value.Valid {
				u.Index = uint32(value.Int64)
			}
		case user.FieldEmail:
			if value, ok := values[i].(*sql.NullString); !ok {
				return fmt.Errorf("unexpected type %T for field email", values[i])
			} else if value.Valid {
				u.Email = value.String
			}
		case user.FieldName:
			if value, ok := values[i].(*sql.NullString); !ok {
				return fmt.Errorf("unexpected type %T for field name", values[i])
			} else if value.Valid {
				u.Name = value.String
			}
		case user.FieldBio:
			if value, ok := values[i].(*sql.NullString); !ok {
				return fmt.Errorf("unexpected type %T for field bio", values[i])
			} else if value.Valid {
				u.Bio = value.String
			}
		case user.FieldStreakCount:
			if value, ok := values[i].(*sql.NullInt64); !ok {
				return fmt.Errorf("unexpected type %T for field streak_count", values[i])
			} else if value.Valid {
				u.StreakCount = uint32(value.Int64)
			}
		case user.FieldIconImageKey:
			if value, ok := values[i].(*sql.NullString); !ok {
				return fmt.Errorf("unexpected type %T for field icon_image_key", values[i])
			} else if value.Valid {
				u.IconImageKey = value.String
			}
		case user.FieldCreatedAt:
			if value, ok := values[i].(*sql.NullTime); !ok {
				return fmt.Errorf("unexpected type %T for field created_at", values[i])
			} else if value.Valid {
				u.CreatedAt = value.Time
			}
		default:
			u.selectValues.Set(columns[i], values[i])
		}
	}
	return nil
}

// Value returns the ent.Value that was dynamically selected and assigned to the User.
// This includes values selected through modifiers, order, etc.
func (u *User) Value(name string) (ent.Value, error) {
	return u.selectValues.Get(name)
}

// QueryPosts queries the "posts" edge of the User entity.
func (u *User) QueryPosts() *PostQuery {
	return NewUserClient(u.config).QueryPosts(u)
}

// QueryComments queries the "comments" edge of the User entity.
func (u *User) QueryComments() *CommentQuery {
	return NewUserClient(u.config).QueryComments(u)
}

// QueryLikes queries the "likes" edge of the User entity.
func (u *User) QueryLikes() *LikeQuery {
	return NewUserClient(u.config).QueryLikes(u)
}

// QueryPets queries the "pets" edge of the User entity.
func (u *User) QueryPets() *PetQuery {
	return NewUserClient(u.config).QueryPets(u)
}

// QueryFollowing queries the "following" edge of the User entity.
func (u *User) QueryFollowing() *FollowRelationQuery {
	return NewUserClient(u.config).QueryFollowing(u)
}

// QueryFollowers queries the "followers" edge of the User entity.
func (u *User) QueryFollowers() *FollowRelationQuery {
	return NewUserClient(u.config).QueryFollowers(u)
}

// QueryBlocking queries the "blocking" edge of the User entity.
func (u *User) QueryBlocking() *BlockRelationQuery {
	return NewUserClient(u.config).QueryBlocking(u)
}

// QueryBlockedBy queries the "blocked_by" edge of the User entity.
func (u *User) QueryBlockedBy() *BlockRelationQuery {
	return NewUserClient(u.config).QueryBlockedBy(u)
}

// QueryDailyTasks queries the "daily_tasks" edge of the User entity.
func (u *User) QueryDailyTasks() *DailyTaskQuery {
	return NewUserClient(u.config).QueryDailyTasks(u)
}

// QueryDeviceTokens queries the "device_tokens" edge of the User entity.
func (u *User) QueryDeviceTokens() *DeviceTokenQuery {
	return NewUserClient(u.config).QueryDeviceTokens(u)
}

// Update returns a builder for updating this User.
// Note that you need to call User.Unwrap() before calling this method if this User
// was returned from a transaction, and the transaction was committed or rolled back.
func (u *User) Update() *UserUpdateOne {
	return NewUserClient(u.config).UpdateOne(u)
}

// Unwrap unwraps the User entity that was returned from a transaction after it was closed,
// so that all future queries will be executed through the driver which created the transaction.
func (u *User) Unwrap() *User {
	_tx, ok := u.config.driver.(*txDriver)
	if !ok {
		panic("ent: User is not a transactional entity")
	}
	u.config.driver = _tx.drv
	return u
}

// String implements the fmt.Stringer.
func (u *User) String() string {
	var builder strings.Builder
	builder.WriteString("User(")
	builder.WriteString(fmt.Sprintf("id=%v, ", u.ID))
	builder.WriteString("index=")
	builder.WriteString(fmt.Sprintf("%v", u.Index))
	builder.WriteString(", ")
	builder.WriteString("email=")
	builder.WriteString(u.Email)
	builder.WriteString(", ")
	builder.WriteString("name=")
	builder.WriteString(u.Name)
	builder.WriteString(", ")
	builder.WriteString("bio=")
	builder.WriteString(u.Bio)
	builder.WriteString(", ")
	builder.WriteString("streak_count=")
	builder.WriteString(fmt.Sprintf("%v", u.StreakCount))
	builder.WriteString(", ")
	builder.WriteString("icon_image_key=")
	builder.WriteString(u.IconImageKey)
	builder.WriteString(", ")
	builder.WriteString("created_at=")
	builder.WriteString(u.CreatedAt.Format(time.ANSIC))
	builder.WriteByte(')')
	return builder.String()
}

// Users is a parsable slice of User.
type Users []*User
