// Code generated by ent, DO NOT EDIT.

package ent

import (
	"context"
	"errors"
	"fmt"
	"time"

	"entgo.io/ent/dialect"
	"entgo.io/ent/dialect/sql"
	"entgo.io/ent/dialect/sql/sqlgraph"
	"entgo.io/ent/schema/field"
	"github.com/aki-13627/animalia/backend-go/ent/blockrelation"
	"github.com/aki-13627/animalia/backend-go/ent/comment"
	"github.com/aki-13627/animalia/backend-go/ent/dailytask"
	"github.com/aki-13627/animalia/backend-go/ent/devicetoken"
	"github.com/aki-13627/animalia/backend-go/ent/followrelation"
	"github.com/aki-13627/animalia/backend-go/ent/like"
	"github.com/aki-13627/animalia/backend-go/ent/pet"
	"github.com/aki-13627/animalia/backend-go/ent/post"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
)

// UserCreate is the builder for creating a User entity.
type UserCreate struct {
	config
	mutation *UserMutation
	hooks    []Hook
	conflict []sql.ConflictOption
}

// SetIndex sets the "index" field.
func (uc *UserCreate) SetIndex(u uint32) *UserCreate {
	uc.mutation.SetIndex(u)
	return uc
}

// SetNillableIndex sets the "index" field if the given value is not nil.
func (uc *UserCreate) SetNillableIndex(u *uint32) *UserCreate {
	if u != nil {
		uc.SetIndex(*u)
	}
	return uc
}

// SetEmail sets the "email" field.
func (uc *UserCreate) SetEmail(s string) *UserCreate {
	uc.mutation.SetEmail(s)
	return uc
}

// SetName sets the "name" field.
func (uc *UserCreate) SetName(s string) *UserCreate {
	uc.mutation.SetName(s)
	return uc
}

// SetBio sets the "bio" field.
func (uc *UserCreate) SetBio(s string) *UserCreate {
	uc.mutation.SetBio(s)
	return uc
}

// SetNillableBio sets the "bio" field if the given value is not nil.
func (uc *UserCreate) SetNillableBio(s *string) *UserCreate {
	if s != nil {
		uc.SetBio(*s)
	}
	return uc
}

// SetStreakCount sets the "streak_count" field.
func (uc *UserCreate) SetStreakCount(u uint32) *UserCreate {
	uc.mutation.SetStreakCount(u)
	return uc
}

// SetNillableStreakCount sets the "streak_count" field if the given value is not nil.
func (uc *UserCreate) SetNillableStreakCount(u *uint32) *UserCreate {
	if u != nil {
		uc.SetStreakCount(*u)
	}
	return uc
}

// SetIconImageKey sets the "icon_image_key" field.
func (uc *UserCreate) SetIconImageKey(s string) *UserCreate {
	uc.mutation.SetIconImageKey(s)
	return uc
}

// SetNillableIconImageKey sets the "icon_image_key" field if the given value is not nil.
func (uc *UserCreate) SetNillableIconImageKey(s *string) *UserCreate {
	if s != nil {
		uc.SetIconImageKey(*s)
	}
	return uc
}

// SetCreatedAt sets the "created_at" field.
func (uc *UserCreate) SetCreatedAt(t time.Time) *UserCreate {
	uc.mutation.SetCreatedAt(t)
	return uc
}

// SetNillableCreatedAt sets the "created_at" field if the given value is not nil.
func (uc *UserCreate) SetNillableCreatedAt(t *time.Time) *UserCreate {
	if t != nil {
		uc.SetCreatedAt(*t)
	}
	return uc
}

// SetID sets the "id" field.
func (uc *UserCreate) SetID(u uuid.UUID) *UserCreate {
	uc.mutation.SetID(u)
	return uc
}

// SetNillableID sets the "id" field if the given value is not nil.
func (uc *UserCreate) SetNillableID(u *uuid.UUID) *UserCreate {
	if u != nil {
		uc.SetID(*u)
	}
	return uc
}

// AddPostIDs adds the "posts" edge to the Post entity by IDs.
func (uc *UserCreate) AddPostIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddPostIDs(ids...)
	return uc
}

// AddPosts adds the "posts" edges to the Post entity.
func (uc *UserCreate) AddPosts(p ...*Post) *UserCreate {
	ids := make([]uuid.UUID, len(p))
	for i := range p {
		ids[i] = p[i].ID
	}
	return uc.AddPostIDs(ids...)
}

// AddCommentIDs adds the "comments" edge to the Comment entity by IDs.
func (uc *UserCreate) AddCommentIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddCommentIDs(ids...)
	return uc
}

// AddComments adds the "comments" edges to the Comment entity.
func (uc *UserCreate) AddComments(c ...*Comment) *UserCreate {
	ids := make([]uuid.UUID, len(c))
	for i := range c {
		ids[i] = c[i].ID
	}
	return uc.AddCommentIDs(ids...)
}

// AddLikeIDs adds the "likes" edge to the Like entity by IDs.
func (uc *UserCreate) AddLikeIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddLikeIDs(ids...)
	return uc
}

// AddLikes adds the "likes" edges to the Like entity.
func (uc *UserCreate) AddLikes(l ...*Like) *UserCreate {
	ids := make([]uuid.UUID, len(l))
	for i := range l {
		ids[i] = l[i].ID
	}
	return uc.AddLikeIDs(ids...)
}

// AddPetIDs adds the "pets" edge to the Pet entity by IDs.
func (uc *UserCreate) AddPetIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddPetIDs(ids...)
	return uc
}

// AddPets adds the "pets" edges to the Pet entity.
func (uc *UserCreate) AddPets(p ...*Pet) *UserCreate {
	ids := make([]uuid.UUID, len(p))
	for i := range p {
		ids[i] = p[i].ID
	}
	return uc.AddPetIDs(ids...)
}

// AddFollowingIDs adds the "following" edge to the FollowRelation entity by IDs.
func (uc *UserCreate) AddFollowingIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddFollowingIDs(ids...)
	return uc
}

// AddFollowing adds the "following" edges to the FollowRelation entity.
func (uc *UserCreate) AddFollowing(f ...*FollowRelation) *UserCreate {
	ids := make([]uuid.UUID, len(f))
	for i := range f {
		ids[i] = f[i].ID
	}
	return uc.AddFollowingIDs(ids...)
}

// AddFollowerIDs adds the "followers" edge to the FollowRelation entity by IDs.
func (uc *UserCreate) AddFollowerIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddFollowerIDs(ids...)
	return uc
}

// AddFollowers adds the "followers" edges to the FollowRelation entity.
func (uc *UserCreate) AddFollowers(f ...*FollowRelation) *UserCreate {
	ids := make([]uuid.UUID, len(f))
	for i := range f {
		ids[i] = f[i].ID
	}
	return uc.AddFollowerIDs(ids...)
}

// AddBlockingIDs adds the "blocking" edge to the BlockRelation entity by IDs.
func (uc *UserCreate) AddBlockingIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddBlockingIDs(ids...)
	return uc
}

// AddBlocking adds the "blocking" edges to the BlockRelation entity.
func (uc *UserCreate) AddBlocking(b ...*BlockRelation) *UserCreate {
	ids := make([]uuid.UUID, len(b))
	for i := range b {
		ids[i] = b[i].ID
	}
	return uc.AddBlockingIDs(ids...)
}

// AddBlockedByIDs adds the "blocked_by" edge to the BlockRelation entity by IDs.
func (uc *UserCreate) AddBlockedByIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddBlockedByIDs(ids...)
	return uc
}

// AddBlockedBy adds the "blocked_by" edges to the BlockRelation entity.
func (uc *UserCreate) AddBlockedBy(b ...*BlockRelation) *UserCreate {
	ids := make([]uuid.UUID, len(b))
	for i := range b {
		ids[i] = b[i].ID
	}
	return uc.AddBlockedByIDs(ids...)
}

// AddDailyTaskIDs adds the "daily_tasks" edge to the DailyTask entity by IDs.
func (uc *UserCreate) AddDailyTaskIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddDailyTaskIDs(ids...)
	return uc
}

// AddDailyTasks adds the "daily_tasks" edges to the DailyTask entity.
func (uc *UserCreate) AddDailyTasks(d ...*DailyTask) *UserCreate {
	ids := make([]uuid.UUID, len(d))
	for i := range d {
		ids[i] = d[i].ID
	}
	return uc.AddDailyTaskIDs(ids...)
}

// AddDeviceTokenIDs adds the "device_tokens" edge to the DeviceToken entity by IDs.
func (uc *UserCreate) AddDeviceTokenIDs(ids ...uuid.UUID) *UserCreate {
	uc.mutation.AddDeviceTokenIDs(ids...)
	return uc
}

// AddDeviceTokens adds the "device_tokens" edges to the DeviceToken entity.
func (uc *UserCreate) AddDeviceTokens(d ...*DeviceToken) *UserCreate {
	ids := make([]uuid.UUID, len(d))
	for i := range d {
		ids[i] = d[i].ID
	}
	return uc.AddDeviceTokenIDs(ids...)
}

// Mutation returns the UserMutation object of the builder.
func (uc *UserCreate) Mutation() *UserMutation {
	return uc.mutation
}

// Save creates the User in the database.
func (uc *UserCreate) Save(ctx context.Context) (*User, error) {
	uc.defaults()
	return withHooks(ctx, uc.sqlSave, uc.mutation, uc.hooks)
}

// SaveX calls Save and panics if Save returns an error.
func (uc *UserCreate) SaveX(ctx context.Context) *User {
	v, err := uc.Save(ctx)
	if err != nil {
		panic(err)
	}
	return v
}

// Exec executes the query.
func (uc *UserCreate) Exec(ctx context.Context) error {
	_, err := uc.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (uc *UserCreate) ExecX(ctx context.Context) {
	if err := uc.Exec(ctx); err != nil {
		panic(err)
	}
}

// defaults sets the default values of the builder before save.
func (uc *UserCreate) defaults() {
	if _, ok := uc.mutation.Bio(); !ok {
		v := user.DefaultBio
		uc.mutation.SetBio(v)
	}
	if _, ok := uc.mutation.StreakCount(); !ok {
		v := user.DefaultStreakCount
		uc.mutation.SetStreakCount(v)
	}
	if _, ok := uc.mutation.CreatedAt(); !ok {
		v := user.DefaultCreatedAt()
		uc.mutation.SetCreatedAt(v)
	}
	if _, ok := uc.mutation.ID(); !ok {
		v := user.DefaultID()
		uc.mutation.SetID(v)
	}
}

// check runs all checks and user-defined validators on the builder.
func (uc *UserCreate) check() error {
	if _, ok := uc.mutation.Email(); !ok {
		return &ValidationError{Name: "email", err: errors.New(`ent: missing required field "User.email"`)}
	}
	if v, ok := uc.mutation.Email(); ok {
		if err := user.EmailValidator(v); err != nil {
			return &ValidationError{Name: "email", err: fmt.Errorf(`ent: validator failed for field "User.email": %w`, err)}
		}
	}
	if _, ok := uc.mutation.Name(); !ok {
		return &ValidationError{Name: "name", err: errors.New(`ent: missing required field "User.name"`)}
	}
	if v, ok := uc.mutation.Name(); ok {
		if err := user.NameValidator(v); err != nil {
			return &ValidationError{Name: "name", err: fmt.Errorf(`ent: validator failed for field "User.name": %w`, err)}
		}
	}
	if _, ok := uc.mutation.Bio(); !ok {
		return &ValidationError{Name: "bio", err: errors.New(`ent: missing required field "User.bio"`)}
	}
	if _, ok := uc.mutation.StreakCount(); !ok {
		return &ValidationError{Name: "streak_count", err: errors.New(`ent: missing required field "User.streak_count"`)}
	}
	if _, ok := uc.mutation.CreatedAt(); !ok {
		return &ValidationError{Name: "created_at", err: errors.New(`ent: missing required field "User.created_at"`)}
	}
	return nil
}

func (uc *UserCreate) sqlSave(ctx context.Context) (*User, error) {
	if err := uc.check(); err != nil {
		return nil, err
	}
	_node, _spec := uc.createSpec()
	if err := sqlgraph.CreateNode(ctx, uc.driver, _spec); err != nil {
		if sqlgraph.IsConstraintError(err) {
			err = &ConstraintError{msg: err.Error(), wrap: err}
		}
		return nil, err
	}
	if _spec.ID.Value != nil {
		if id, ok := _spec.ID.Value.(*uuid.UUID); ok {
			_node.ID = *id
		} else if err := _node.ID.Scan(_spec.ID.Value); err != nil {
			return nil, err
		}
	}
	uc.mutation.id = &_node.ID
	uc.mutation.done = true
	return _node, nil
}

func (uc *UserCreate) createSpec() (*User, *sqlgraph.CreateSpec) {
	var (
		_node = &User{config: uc.config}
		_spec = sqlgraph.NewCreateSpec(user.Table, sqlgraph.NewFieldSpec(user.FieldID, field.TypeUUID))
	)
	_spec.OnConflict = uc.conflict
	if id, ok := uc.mutation.ID(); ok {
		_node.ID = id
		_spec.ID.Value = &id
	}
	if value, ok := uc.mutation.Index(); ok {
		_spec.SetField(user.FieldIndex, field.TypeUint32, value)
		_node.Index = value
	}
	if value, ok := uc.mutation.Email(); ok {
		_spec.SetField(user.FieldEmail, field.TypeString, value)
		_node.Email = value
	}
	if value, ok := uc.mutation.Name(); ok {
		_spec.SetField(user.FieldName, field.TypeString, value)
		_node.Name = value
	}
	if value, ok := uc.mutation.Bio(); ok {
		_spec.SetField(user.FieldBio, field.TypeString, value)
		_node.Bio = value
	}
	if value, ok := uc.mutation.StreakCount(); ok {
		_spec.SetField(user.FieldStreakCount, field.TypeUint32, value)
		_node.StreakCount = value
	}
	if value, ok := uc.mutation.IconImageKey(); ok {
		_spec.SetField(user.FieldIconImageKey, field.TypeString, value)
		_node.IconImageKey = value
	}
	if value, ok := uc.mutation.CreatedAt(); ok {
		_spec.SetField(user.FieldCreatedAt, field.TypeTime, value)
		_node.CreatedAt = value
	}
	if nodes := uc.mutation.PostsIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.PostsTable,
			Columns: []string{user.PostsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(post.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := uc.mutation.CommentsIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.CommentsTable,
			Columns: []string{user.CommentsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(comment.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := uc.mutation.LikesIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.LikesTable,
			Columns: []string{user.LikesColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(like.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := uc.mutation.PetsIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.PetsTable,
			Columns: []string{user.PetsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(pet.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := uc.mutation.FollowingIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.FollowingTable,
			Columns: []string{user.FollowingColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(followrelation.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := uc.mutation.FollowersIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.FollowersTable,
			Columns: []string{user.FollowersColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(followrelation.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := uc.mutation.BlockingIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.BlockingTable,
			Columns: []string{user.BlockingColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(blockrelation.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := uc.mutation.BlockedByIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.BlockedByTable,
			Columns: []string{user.BlockedByColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(blockrelation.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := uc.mutation.DailyTasksIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.DailyTasksTable,
			Columns: []string{user.DailyTasksColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(dailytask.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	if nodes := uc.mutation.DeviceTokensIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   user.DeviceTokensTable,
			Columns: []string{user.DeviceTokensColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(devicetoken.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges = append(_spec.Edges, edge)
	}
	return _node, _spec
}

// OnConflict allows configuring the `ON CONFLICT` / `ON DUPLICATE KEY` clause
// of the `INSERT` statement. For example:
//
//	client.User.Create().
//		SetIndex(v).
//		OnConflict(
//			// Update the row with the new values
//			// the was proposed for insertion.
//			sql.ResolveWithNewValues(),
//		).
//		// Override some of the fields with custom
//		// update values.
//		Update(func(u *ent.UserUpsert) {
//			SetIndex(v+v).
//		}).
//		Exec(ctx)
func (uc *UserCreate) OnConflict(opts ...sql.ConflictOption) *UserUpsertOne {
	uc.conflict = opts
	return &UserUpsertOne{
		create: uc,
	}
}

// OnConflictColumns calls `OnConflict` and configures the columns
// as conflict target. Using this option is equivalent to using:
//
//	client.User.Create().
//		OnConflict(sql.ConflictColumns(columns...)).
//		Exec(ctx)
func (uc *UserCreate) OnConflictColumns(columns ...string) *UserUpsertOne {
	uc.conflict = append(uc.conflict, sql.ConflictColumns(columns...))
	return &UserUpsertOne{
		create: uc,
	}
}

type (
	// UserUpsertOne is the builder for "upsert"-ing
	//  one User node.
	UserUpsertOne struct {
		create *UserCreate
	}

	// UserUpsert is the "OnConflict" setter.
	UserUpsert struct {
		*sql.UpdateSet
	}
)

// SetEmail sets the "email" field.
func (u *UserUpsert) SetEmail(v string) *UserUpsert {
	u.Set(user.FieldEmail, v)
	return u
}

// UpdateEmail sets the "email" field to the value that was provided on create.
func (u *UserUpsert) UpdateEmail() *UserUpsert {
	u.SetExcluded(user.FieldEmail)
	return u
}

// SetName sets the "name" field.
func (u *UserUpsert) SetName(v string) *UserUpsert {
	u.Set(user.FieldName, v)
	return u
}

// UpdateName sets the "name" field to the value that was provided on create.
func (u *UserUpsert) UpdateName() *UserUpsert {
	u.SetExcluded(user.FieldName)
	return u
}

// SetBio sets the "bio" field.
func (u *UserUpsert) SetBio(v string) *UserUpsert {
	u.Set(user.FieldBio, v)
	return u
}

// UpdateBio sets the "bio" field to the value that was provided on create.
func (u *UserUpsert) UpdateBio() *UserUpsert {
	u.SetExcluded(user.FieldBio)
	return u
}

// SetStreakCount sets the "streak_count" field.
func (u *UserUpsert) SetStreakCount(v uint32) *UserUpsert {
	u.Set(user.FieldStreakCount, v)
	return u
}

// UpdateStreakCount sets the "streak_count" field to the value that was provided on create.
func (u *UserUpsert) UpdateStreakCount() *UserUpsert {
	u.SetExcluded(user.FieldStreakCount)
	return u
}

// AddStreakCount adds v to the "streak_count" field.
func (u *UserUpsert) AddStreakCount(v uint32) *UserUpsert {
	u.Add(user.FieldStreakCount, v)
	return u
}

// SetIconImageKey sets the "icon_image_key" field.
func (u *UserUpsert) SetIconImageKey(v string) *UserUpsert {
	u.Set(user.FieldIconImageKey, v)
	return u
}

// UpdateIconImageKey sets the "icon_image_key" field to the value that was provided on create.
func (u *UserUpsert) UpdateIconImageKey() *UserUpsert {
	u.SetExcluded(user.FieldIconImageKey)
	return u
}

// ClearIconImageKey clears the value of the "icon_image_key" field.
func (u *UserUpsert) ClearIconImageKey() *UserUpsert {
	u.SetNull(user.FieldIconImageKey)
	return u
}

// SetCreatedAt sets the "created_at" field.
func (u *UserUpsert) SetCreatedAt(v time.Time) *UserUpsert {
	u.Set(user.FieldCreatedAt, v)
	return u
}

// UpdateCreatedAt sets the "created_at" field to the value that was provided on create.
func (u *UserUpsert) UpdateCreatedAt() *UserUpsert {
	u.SetExcluded(user.FieldCreatedAt)
	return u
}

// UpdateNewValues updates the mutable fields using the new values that were set on create except the ID field.
// Using this option is equivalent to using:
//
//	client.User.Create().
//		OnConflict(
//			sql.ResolveWithNewValues(),
//			sql.ResolveWith(func(u *sql.UpdateSet) {
//				u.SetIgnore(user.FieldID)
//			}),
//		).
//		Exec(ctx)
func (u *UserUpsertOne) UpdateNewValues() *UserUpsertOne {
	u.create.conflict = append(u.create.conflict, sql.ResolveWithNewValues())
	u.create.conflict = append(u.create.conflict, sql.ResolveWith(func(s *sql.UpdateSet) {
		if _, exists := u.create.mutation.ID(); exists {
			s.SetIgnore(user.FieldID)
		}
		if _, exists := u.create.mutation.Index(); exists {
			s.SetIgnore(user.FieldIndex)
		}
	}))
	return u
}

// Ignore sets each column to itself in case of conflict.
// Using this option is equivalent to using:
//
//	client.User.Create().
//	    OnConflict(sql.ResolveWithIgnore()).
//	    Exec(ctx)
func (u *UserUpsertOne) Ignore() *UserUpsertOne {
	u.create.conflict = append(u.create.conflict, sql.ResolveWithIgnore())
	return u
}

// DoNothing configures the conflict_action to `DO NOTHING`.
// Supported only by SQLite and PostgreSQL.
func (u *UserUpsertOne) DoNothing() *UserUpsertOne {
	u.create.conflict = append(u.create.conflict, sql.DoNothing())
	return u
}

// Update allows overriding fields `UPDATE` values. See the UserCreate.OnConflict
// documentation for more info.
func (u *UserUpsertOne) Update(set func(*UserUpsert)) *UserUpsertOne {
	u.create.conflict = append(u.create.conflict, sql.ResolveWith(func(update *sql.UpdateSet) {
		set(&UserUpsert{UpdateSet: update})
	}))
	return u
}

// SetEmail sets the "email" field.
func (u *UserUpsertOne) SetEmail(v string) *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.SetEmail(v)
	})
}

// UpdateEmail sets the "email" field to the value that was provided on create.
func (u *UserUpsertOne) UpdateEmail() *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.UpdateEmail()
	})
}

// SetName sets the "name" field.
func (u *UserUpsertOne) SetName(v string) *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.SetName(v)
	})
}

// UpdateName sets the "name" field to the value that was provided on create.
func (u *UserUpsertOne) UpdateName() *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.UpdateName()
	})
}

// SetBio sets the "bio" field.
func (u *UserUpsertOne) SetBio(v string) *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.SetBio(v)
	})
}

// UpdateBio sets the "bio" field to the value that was provided on create.
func (u *UserUpsertOne) UpdateBio() *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.UpdateBio()
	})
}

// SetStreakCount sets the "streak_count" field.
func (u *UserUpsertOne) SetStreakCount(v uint32) *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.SetStreakCount(v)
	})
}

// AddStreakCount adds v to the "streak_count" field.
func (u *UserUpsertOne) AddStreakCount(v uint32) *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.AddStreakCount(v)
	})
}

// UpdateStreakCount sets the "streak_count" field to the value that was provided on create.
func (u *UserUpsertOne) UpdateStreakCount() *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.UpdateStreakCount()
	})
}

// SetIconImageKey sets the "icon_image_key" field.
func (u *UserUpsertOne) SetIconImageKey(v string) *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.SetIconImageKey(v)
	})
}

// UpdateIconImageKey sets the "icon_image_key" field to the value that was provided on create.
func (u *UserUpsertOne) UpdateIconImageKey() *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.UpdateIconImageKey()
	})
}

// ClearIconImageKey clears the value of the "icon_image_key" field.
func (u *UserUpsertOne) ClearIconImageKey() *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.ClearIconImageKey()
	})
}

// SetCreatedAt sets the "created_at" field.
func (u *UserUpsertOne) SetCreatedAt(v time.Time) *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.SetCreatedAt(v)
	})
}

// UpdateCreatedAt sets the "created_at" field to the value that was provided on create.
func (u *UserUpsertOne) UpdateCreatedAt() *UserUpsertOne {
	return u.Update(func(s *UserUpsert) {
		s.UpdateCreatedAt()
	})
}

// Exec executes the query.
func (u *UserUpsertOne) Exec(ctx context.Context) error {
	if len(u.create.conflict) == 0 {
		return errors.New("ent: missing options for UserCreate.OnConflict")
	}
	return u.create.Exec(ctx)
}

// ExecX is like Exec, but panics if an error occurs.
func (u *UserUpsertOne) ExecX(ctx context.Context) {
	if err := u.create.Exec(ctx); err != nil {
		panic(err)
	}
}

// Exec executes the UPSERT query and returns the inserted/updated ID.
func (u *UserUpsertOne) ID(ctx context.Context) (id uuid.UUID, err error) {
	if u.create.driver.Dialect() == dialect.MySQL {
		// In case of "ON CONFLICT", there is no way to get back non-numeric ID
		// fields from the database since MySQL does not support the RETURNING clause.
		return id, errors.New("ent: UserUpsertOne.ID is not supported by MySQL driver. Use UserUpsertOne.Exec instead")
	}
	node, err := u.create.Save(ctx)
	if err != nil {
		return id, err
	}
	return node.ID, nil
}

// IDX is like ID, but panics if an error occurs.
func (u *UserUpsertOne) IDX(ctx context.Context) uuid.UUID {
	id, err := u.ID(ctx)
	if err != nil {
		panic(err)
	}
	return id
}

// UserCreateBulk is the builder for creating many User entities in bulk.
type UserCreateBulk struct {
	config
	err      error
	builders []*UserCreate
	conflict []sql.ConflictOption
}

// Save creates the User entities in the database.
func (ucb *UserCreateBulk) Save(ctx context.Context) ([]*User, error) {
	if ucb.err != nil {
		return nil, ucb.err
	}
	specs := make([]*sqlgraph.CreateSpec, len(ucb.builders))
	nodes := make([]*User, len(ucb.builders))
	mutators := make([]Mutator, len(ucb.builders))
	for i := range ucb.builders {
		func(i int, root context.Context) {
			builder := ucb.builders[i]
			builder.defaults()
			var mut Mutator = MutateFunc(func(ctx context.Context, m Mutation) (Value, error) {
				mutation, ok := m.(*UserMutation)
				if !ok {
					return nil, fmt.Errorf("unexpected mutation type %T", m)
				}
				if err := builder.check(); err != nil {
					return nil, err
				}
				builder.mutation = mutation
				var err error
				nodes[i], specs[i] = builder.createSpec()
				if i < len(mutators)-1 {
					_, err = mutators[i+1].Mutate(root, ucb.builders[i+1].mutation)
				} else {
					spec := &sqlgraph.BatchCreateSpec{Nodes: specs}
					spec.OnConflict = ucb.conflict
					// Invoke the actual operation on the latest mutation in the chain.
					if err = sqlgraph.BatchCreate(ctx, ucb.driver, spec); err != nil {
						if sqlgraph.IsConstraintError(err) {
							err = &ConstraintError{msg: err.Error(), wrap: err}
						}
					}
				}
				if err != nil {
					return nil, err
				}
				mutation.id = &nodes[i].ID
				mutation.done = true
				return nodes[i], nil
			})
			for i := len(builder.hooks) - 1; i >= 0; i-- {
				mut = builder.hooks[i](mut)
			}
			mutators[i] = mut
		}(i, ctx)
	}
	if len(mutators) > 0 {
		if _, err := mutators[0].Mutate(ctx, ucb.builders[0].mutation); err != nil {
			return nil, err
		}
	}
	return nodes, nil
}

// SaveX is like Save, but panics if an error occurs.
func (ucb *UserCreateBulk) SaveX(ctx context.Context) []*User {
	v, err := ucb.Save(ctx)
	if err != nil {
		panic(err)
	}
	return v
}

// Exec executes the query.
func (ucb *UserCreateBulk) Exec(ctx context.Context) error {
	_, err := ucb.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (ucb *UserCreateBulk) ExecX(ctx context.Context) {
	if err := ucb.Exec(ctx); err != nil {
		panic(err)
	}
}

// OnConflict allows configuring the `ON CONFLICT` / `ON DUPLICATE KEY` clause
// of the `INSERT` statement. For example:
//
//	client.User.CreateBulk(builders...).
//		OnConflict(
//			// Update the row with the new values
//			// the was proposed for insertion.
//			sql.ResolveWithNewValues(),
//		).
//		// Override some of the fields with custom
//		// update values.
//		Update(func(u *ent.UserUpsert) {
//			SetIndex(v+v).
//		}).
//		Exec(ctx)
func (ucb *UserCreateBulk) OnConflict(opts ...sql.ConflictOption) *UserUpsertBulk {
	ucb.conflict = opts
	return &UserUpsertBulk{
		create: ucb,
	}
}

// OnConflictColumns calls `OnConflict` and configures the columns
// as conflict target. Using this option is equivalent to using:
//
//	client.User.Create().
//		OnConflict(sql.ConflictColumns(columns...)).
//		Exec(ctx)
func (ucb *UserCreateBulk) OnConflictColumns(columns ...string) *UserUpsertBulk {
	ucb.conflict = append(ucb.conflict, sql.ConflictColumns(columns...))
	return &UserUpsertBulk{
		create: ucb,
	}
}

// UserUpsertBulk is the builder for "upsert"-ing
// a bulk of User nodes.
type UserUpsertBulk struct {
	create *UserCreateBulk
}

// UpdateNewValues updates the mutable fields using the new values that
// were set on create. Using this option is equivalent to using:
//
//	client.User.Create().
//		OnConflict(
//			sql.ResolveWithNewValues(),
//			sql.ResolveWith(func(u *sql.UpdateSet) {
//				u.SetIgnore(user.FieldID)
//			}),
//		).
//		Exec(ctx)
func (u *UserUpsertBulk) UpdateNewValues() *UserUpsertBulk {
	u.create.conflict = append(u.create.conflict, sql.ResolveWithNewValues())
	u.create.conflict = append(u.create.conflict, sql.ResolveWith(func(s *sql.UpdateSet) {
		for _, b := range u.create.builders {
			if _, exists := b.mutation.ID(); exists {
				s.SetIgnore(user.FieldID)
			}
			if _, exists := b.mutation.Index(); exists {
				s.SetIgnore(user.FieldIndex)
			}
		}
	}))
	return u
}

// Ignore sets each column to itself in case of conflict.
// Using this option is equivalent to using:
//
//	client.User.Create().
//		OnConflict(sql.ResolveWithIgnore()).
//		Exec(ctx)
func (u *UserUpsertBulk) Ignore() *UserUpsertBulk {
	u.create.conflict = append(u.create.conflict, sql.ResolveWithIgnore())
	return u
}

// DoNothing configures the conflict_action to `DO NOTHING`.
// Supported only by SQLite and PostgreSQL.
func (u *UserUpsertBulk) DoNothing() *UserUpsertBulk {
	u.create.conflict = append(u.create.conflict, sql.DoNothing())
	return u
}

// Update allows overriding fields `UPDATE` values. See the UserCreateBulk.OnConflict
// documentation for more info.
func (u *UserUpsertBulk) Update(set func(*UserUpsert)) *UserUpsertBulk {
	u.create.conflict = append(u.create.conflict, sql.ResolveWith(func(update *sql.UpdateSet) {
		set(&UserUpsert{UpdateSet: update})
	}))
	return u
}

// SetEmail sets the "email" field.
func (u *UserUpsertBulk) SetEmail(v string) *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.SetEmail(v)
	})
}

// UpdateEmail sets the "email" field to the value that was provided on create.
func (u *UserUpsertBulk) UpdateEmail() *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.UpdateEmail()
	})
}

// SetName sets the "name" field.
func (u *UserUpsertBulk) SetName(v string) *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.SetName(v)
	})
}

// UpdateName sets the "name" field to the value that was provided on create.
func (u *UserUpsertBulk) UpdateName() *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.UpdateName()
	})
}

// SetBio sets the "bio" field.
func (u *UserUpsertBulk) SetBio(v string) *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.SetBio(v)
	})
}

// UpdateBio sets the "bio" field to the value that was provided on create.
func (u *UserUpsertBulk) UpdateBio() *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.UpdateBio()
	})
}

// SetStreakCount sets the "streak_count" field.
func (u *UserUpsertBulk) SetStreakCount(v uint32) *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.SetStreakCount(v)
	})
}

// AddStreakCount adds v to the "streak_count" field.
func (u *UserUpsertBulk) AddStreakCount(v uint32) *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.AddStreakCount(v)
	})
}

// UpdateStreakCount sets the "streak_count" field to the value that was provided on create.
func (u *UserUpsertBulk) UpdateStreakCount() *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.UpdateStreakCount()
	})
}

// SetIconImageKey sets the "icon_image_key" field.
func (u *UserUpsertBulk) SetIconImageKey(v string) *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.SetIconImageKey(v)
	})
}

// UpdateIconImageKey sets the "icon_image_key" field to the value that was provided on create.
func (u *UserUpsertBulk) UpdateIconImageKey() *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.UpdateIconImageKey()
	})
}

// ClearIconImageKey clears the value of the "icon_image_key" field.
func (u *UserUpsertBulk) ClearIconImageKey() *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.ClearIconImageKey()
	})
}

// SetCreatedAt sets the "created_at" field.
func (u *UserUpsertBulk) SetCreatedAt(v time.Time) *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.SetCreatedAt(v)
	})
}

// UpdateCreatedAt sets the "created_at" field to the value that was provided on create.
func (u *UserUpsertBulk) UpdateCreatedAt() *UserUpsertBulk {
	return u.Update(func(s *UserUpsert) {
		s.UpdateCreatedAt()
	})
}

// Exec executes the query.
func (u *UserUpsertBulk) Exec(ctx context.Context) error {
	if u.create.err != nil {
		return u.create.err
	}
	for i, b := range u.create.builders {
		if len(b.conflict) != 0 {
			return fmt.Errorf("ent: OnConflict was set for builder %d. Set it on the UserCreateBulk instead", i)
		}
	}
	if len(u.create.conflict) == 0 {
		return errors.New("ent: missing options for UserCreateBulk.OnConflict")
	}
	return u.create.Exec(ctx)
}

// ExecX is like Exec, but panics if an error occurs.
func (u *UserUpsertBulk) ExecX(ctx context.Context) {
	if err := u.create.Exec(ctx); err != nil {
		panic(err)
	}
}
