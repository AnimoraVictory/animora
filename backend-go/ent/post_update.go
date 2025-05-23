// Code generated by ent, DO NOT EDIT.

package ent

import (
	"context"
	"errors"
	"fmt"
	"time"

	"entgo.io/ent/dialect/sql"
	"entgo.io/ent/dialect/sql/sqlgraph"
	"entgo.io/ent/schema/field"
	"github.com/aki-13627/animalia/backend-go/ent/comment"
	"github.com/aki-13627/animalia/backend-go/ent/dailytask"
	"github.com/aki-13627/animalia/backend-go/ent/like"
	"github.com/aki-13627/animalia/backend-go/ent/post"
	"github.com/aki-13627/animalia/backend-go/ent/predicate"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
)

// PostUpdate is the builder for updating Post entities.
type PostUpdate struct {
	config
	hooks    []Hook
	mutation *PostMutation
}

// Where appends a list predicates to the PostUpdate builder.
func (pu *PostUpdate) Where(ps ...predicate.Post) *PostUpdate {
	pu.mutation.Where(ps...)
	return pu
}

// SetCaption sets the "caption" field.
func (pu *PostUpdate) SetCaption(s string) *PostUpdate {
	pu.mutation.SetCaption(s)
	return pu
}

// SetNillableCaption sets the "caption" field if the given value is not nil.
func (pu *PostUpdate) SetNillableCaption(s *string) *PostUpdate {
	if s != nil {
		pu.SetCaption(*s)
	}
	return pu
}

// SetImageKey sets the "image_key" field.
func (pu *PostUpdate) SetImageKey(s string) *PostUpdate {
	pu.mutation.SetImageKey(s)
	return pu
}

// SetNillableImageKey sets the "image_key" field if the given value is not nil.
func (pu *PostUpdate) SetNillableImageKey(s *string) *PostUpdate {
	if s != nil {
		pu.SetImageKey(*s)
	}
	return pu
}

// SetCreatedAt sets the "created_at" field.
func (pu *PostUpdate) SetCreatedAt(t time.Time) *PostUpdate {
	pu.mutation.SetCreatedAt(t)
	return pu
}

// SetNillableCreatedAt sets the "created_at" field if the given value is not nil.
func (pu *PostUpdate) SetNillableCreatedAt(t *time.Time) *PostUpdate {
	if t != nil {
		pu.SetCreatedAt(*t)
	}
	return pu
}

// SetDeletedAt sets the "deleted_at" field.
func (pu *PostUpdate) SetDeletedAt(t time.Time) *PostUpdate {
	pu.mutation.SetDeletedAt(t)
	return pu
}

// SetNillableDeletedAt sets the "deleted_at" field if the given value is not nil.
func (pu *PostUpdate) SetNillableDeletedAt(t *time.Time) *PostUpdate {
	if t != nil {
		pu.SetDeletedAt(*t)
	}
	return pu
}

// ClearDeletedAt clears the value of the "deleted_at" field.
func (pu *PostUpdate) ClearDeletedAt() *PostUpdate {
	pu.mutation.ClearDeletedAt()
	return pu
}

// SetUserID sets the "user" edge to the User entity by ID.
func (pu *PostUpdate) SetUserID(id uuid.UUID) *PostUpdate {
	pu.mutation.SetUserID(id)
	return pu
}

// SetUser sets the "user" edge to the User entity.
func (pu *PostUpdate) SetUser(u *User) *PostUpdate {
	return pu.SetUserID(u.ID)
}

// AddCommentIDs adds the "comments" edge to the Comment entity by IDs.
func (pu *PostUpdate) AddCommentIDs(ids ...uuid.UUID) *PostUpdate {
	pu.mutation.AddCommentIDs(ids...)
	return pu
}

// AddComments adds the "comments" edges to the Comment entity.
func (pu *PostUpdate) AddComments(c ...*Comment) *PostUpdate {
	ids := make([]uuid.UUID, len(c))
	for i := range c {
		ids[i] = c[i].ID
	}
	return pu.AddCommentIDs(ids...)
}

// AddLikeIDs adds the "likes" edge to the Like entity by IDs.
func (pu *PostUpdate) AddLikeIDs(ids ...uuid.UUID) *PostUpdate {
	pu.mutation.AddLikeIDs(ids...)
	return pu
}

// AddLikes adds the "likes" edges to the Like entity.
func (pu *PostUpdate) AddLikes(l ...*Like) *PostUpdate {
	ids := make([]uuid.UUID, len(l))
	for i := range l {
		ids[i] = l[i].ID
	}
	return pu.AddLikeIDs(ids...)
}

// SetDailyTaskID sets the "daily_task" edge to the DailyTask entity by ID.
func (pu *PostUpdate) SetDailyTaskID(id uuid.UUID) *PostUpdate {
	pu.mutation.SetDailyTaskID(id)
	return pu
}

// SetNillableDailyTaskID sets the "daily_task" edge to the DailyTask entity by ID if the given value is not nil.
func (pu *PostUpdate) SetNillableDailyTaskID(id *uuid.UUID) *PostUpdate {
	if id != nil {
		pu = pu.SetDailyTaskID(*id)
	}
	return pu
}

// SetDailyTask sets the "daily_task" edge to the DailyTask entity.
func (pu *PostUpdate) SetDailyTask(d *DailyTask) *PostUpdate {
	return pu.SetDailyTaskID(d.ID)
}

// Mutation returns the PostMutation object of the builder.
func (pu *PostUpdate) Mutation() *PostMutation {
	return pu.mutation
}

// ClearUser clears the "user" edge to the User entity.
func (pu *PostUpdate) ClearUser() *PostUpdate {
	pu.mutation.ClearUser()
	return pu
}

// ClearComments clears all "comments" edges to the Comment entity.
func (pu *PostUpdate) ClearComments() *PostUpdate {
	pu.mutation.ClearComments()
	return pu
}

// RemoveCommentIDs removes the "comments" edge to Comment entities by IDs.
func (pu *PostUpdate) RemoveCommentIDs(ids ...uuid.UUID) *PostUpdate {
	pu.mutation.RemoveCommentIDs(ids...)
	return pu
}

// RemoveComments removes "comments" edges to Comment entities.
func (pu *PostUpdate) RemoveComments(c ...*Comment) *PostUpdate {
	ids := make([]uuid.UUID, len(c))
	for i := range c {
		ids[i] = c[i].ID
	}
	return pu.RemoveCommentIDs(ids...)
}

// ClearLikes clears all "likes" edges to the Like entity.
func (pu *PostUpdate) ClearLikes() *PostUpdate {
	pu.mutation.ClearLikes()
	return pu
}

// RemoveLikeIDs removes the "likes" edge to Like entities by IDs.
func (pu *PostUpdate) RemoveLikeIDs(ids ...uuid.UUID) *PostUpdate {
	pu.mutation.RemoveLikeIDs(ids...)
	return pu
}

// RemoveLikes removes "likes" edges to Like entities.
func (pu *PostUpdate) RemoveLikes(l ...*Like) *PostUpdate {
	ids := make([]uuid.UUID, len(l))
	for i := range l {
		ids[i] = l[i].ID
	}
	return pu.RemoveLikeIDs(ids...)
}

// ClearDailyTask clears the "daily_task" edge to the DailyTask entity.
func (pu *PostUpdate) ClearDailyTask() *PostUpdate {
	pu.mutation.ClearDailyTask()
	return pu
}

// Save executes the query and returns the number of nodes affected by the update operation.
func (pu *PostUpdate) Save(ctx context.Context) (int, error) {
	return withHooks(ctx, pu.sqlSave, pu.mutation, pu.hooks)
}

// SaveX is like Save, but panics if an error occurs.
func (pu *PostUpdate) SaveX(ctx context.Context) int {
	affected, err := pu.Save(ctx)
	if err != nil {
		panic(err)
	}
	return affected
}

// Exec executes the query.
func (pu *PostUpdate) Exec(ctx context.Context) error {
	_, err := pu.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (pu *PostUpdate) ExecX(ctx context.Context) {
	if err := pu.Exec(ctx); err != nil {
		panic(err)
	}
}

// check runs all checks and user-defined validators on the builder.
func (pu *PostUpdate) check() error {
	if v, ok := pu.mutation.Caption(); ok {
		if err := post.CaptionValidator(v); err != nil {
			return &ValidationError{Name: "caption", err: fmt.Errorf(`ent: validator failed for field "Post.caption": %w`, err)}
		}
	}
	if v, ok := pu.mutation.ImageKey(); ok {
		if err := post.ImageKeyValidator(v); err != nil {
			return &ValidationError{Name: "image_key", err: fmt.Errorf(`ent: validator failed for field "Post.image_key": %w`, err)}
		}
	}
	if pu.mutation.UserCleared() && len(pu.mutation.UserIDs()) > 0 {
		return errors.New(`ent: clearing a required unique edge "Post.user"`)
	}
	return nil
}

func (pu *PostUpdate) sqlSave(ctx context.Context) (n int, err error) {
	if err := pu.check(); err != nil {
		return n, err
	}
	_spec := sqlgraph.NewUpdateSpec(post.Table, post.Columns, sqlgraph.NewFieldSpec(post.FieldID, field.TypeUUID))
	if ps := pu.mutation.predicates; len(ps) > 0 {
		_spec.Predicate = func(selector *sql.Selector) {
			for i := range ps {
				ps[i](selector)
			}
		}
	}
	if pu.mutation.IndexCleared() {
		_spec.ClearField(post.FieldIndex, field.TypeUint32)
	}
	if value, ok := pu.mutation.Caption(); ok {
		_spec.SetField(post.FieldCaption, field.TypeString, value)
	}
	if value, ok := pu.mutation.ImageKey(); ok {
		_spec.SetField(post.FieldImageKey, field.TypeString, value)
	}
	if value, ok := pu.mutation.CreatedAt(); ok {
		_spec.SetField(post.FieldCreatedAt, field.TypeTime, value)
	}
	if value, ok := pu.mutation.DeletedAt(); ok {
		_spec.SetField(post.FieldDeletedAt, field.TypeTime, value)
	}
	if pu.mutation.DeletedAtCleared() {
		_spec.ClearField(post.FieldDeletedAt, field.TypeTime)
	}
	if pu.mutation.UserCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2O,
			Inverse: true,
			Table:   post.UserTable,
			Columns: []string{post.UserColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(user.FieldID, field.TypeUUID),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := pu.mutation.UserIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2O,
			Inverse: true,
			Table:   post.UserTable,
			Columns: []string{post.UserColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(user.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if pu.mutation.CommentsCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.CommentsTable,
			Columns: []string{post.CommentsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(comment.FieldID, field.TypeUUID),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := pu.mutation.RemovedCommentsIDs(); len(nodes) > 0 && !pu.mutation.CommentsCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.CommentsTable,
			Columns: []string{post.CommentsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(comment.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := pu.mutation.CommentsIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.CommentsTable,
			Columns: []string{post.CommentsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(comment.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if pu.mutation.LikesCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.LikesTable,
			Columns: []string{post.LikesColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(like.FieldID, field.TypeUUID),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := pu.mutation.RemovedLikesIDs(); len(nodes) > 0 && !pu.mutation.LikesCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.LikesTable,
			Columns: []string{post.LikesColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(like.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := pu.mutation.LikesIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.LikesTable,
			Columns: []string{post.LikesColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(like.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if pu.mutation.DailyTaskCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2O,
			Inverse: false,
			Table:   post.DailyTaskTable,
			Columns: []string{post.DailyTaskColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(dailytask.FieldID, field.TypeUUID),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := pu.mutation.DailyTaskIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2O,
			Inverse: false,
			Table:   post.DailyTaskTable,
			Columns: []string{post.DailyTaskColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(dailytask.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if n, err = sqlgraph.UpdateNodes(ctx, pu.driver, _spec); err != nil {
		if _, ok := err.(*sqlgraph.NotFoundError); ok {
			err = &NotFoundError{post.Label}
		} else if sqlgraph.IsConstraintError(err) {
			err = &ConstraintError{msg: err.Error(), wrap: err}
		}
		return 0, err
	}
	pu.mutation.done = true
	return n, nil
}

// PostUpdateOne is the builder for updating a single Post entity.
type PostUpdateOne struct {
	config
	fields   []string
	hooks    []Hook
	mutation *PostMutation
}

// SetCaption sets the "caption" field.
func (puo *PostUpdateOne) SetCaption(s string) *PostUpdateOne {
	puo.mutation.SetCaption(s)
	return puo
}

// SetNillableCaption sets the "caption" field if the given value is not nil.
func (puo *PostUpdateOne) SetNillableCaption(s *string) *PostUpdateOne {
	if s != nil {
		puo.SetCaption(*s)
	}
	return puo
}

// SetImageKey sets the "image_key" field.
func (puo *PostUpdateOne) SetImageKey(s string) *PostUpdateOne {
	puo.mutation.SetImageKey(s)
	return puo
}

// SetNillableImageKey sets the "image_key" field if the given value is not nil.
func (puo *PostUpdateOne) SetNillableImageKey(s *string) *PostUpdateOne {
	if s != nil {
		puo.SetImageKey(*s)
	}
	return puo
}

// SetCreatedAt sets the "created_at" field.
func (puo *PostUpdateOne) SetCreatedAt(t time.Time) *PostUpdateOne {
	puo.mutation.SetCreatedAt(t)
	return puo
}

// SetNillableCreatedAt sets the "created_at" field if the given value is not nil.
func (puo *PostUpdateOne) SetNillableCreatedAt(t *time.Time) *PostUpdateOne {
	if t != nil {
		puo.SetCreatedAt(*t)
	}
	return puo
}

// SetDeletedAt sets the "deleted_at" field.
func (puo *PostUpdateOne) SetDeletedAt(t time.Time) *PostUpdateOne {
	puo.mutation.SetDeletedAt(t)
	return puo
}

// SetNillableDeletedAt sets the "deleted_at" field if the given value is not nil.
func (puo *PostUpdateOne) SetNillableDeletedAt(t *time.Time) *PostUpdateOne {
	if t != nil {
		puo.SetDeletedAt(*t)
	}
	return puo
}

// ClearDeletedAt clears the value of the "deleted_at" field.
func (puo *PostUpdateOne) ClearDeletedAt() *PostUpdateOne {
	puo.mutation.ClearDeletedAt()
	return puo
}

// SetUserID sets the "user" edge to the User entity by ID.
func (puo *PostUpdateOne) SetUserID(id uuid.UUID) *PostUpdateOne {
	puo.mutation.SetUserID(id)
	return puo
}

// SetUser sets the "user" edge to the User entity.
func (puo *PostUpdateOne) SetUser(u *User) *PostUpdateOne {
	return puo.SetUserID(u.ID)
}

// AddCommentIDs adds the "comments" edge to the Comment entity by IDs.
func (puo *PostUpdateOne) AddCommentIDs(ids ...uuid.UUID) *PostUpdateOne {
	puo.mutation.AddCommentIDs(ids...)
	return puo
}

// AddComments adds the "comments" edges to the Comment entity.
func (puo *PostUpdateOne) AddComments(c ...*Comment) *PostUpdateOne {
	ids := make([]uuid.UUID, len(c))
	for i := range c {
		ids[i] = c[i].ID
	}
	return puo.AddCommentIDs(ids...)
}

// AddLikeIDs adds the "likes" edge to the Like entity by IDs.
func (puo *PostUpdateOne) AddLikeIDs(ids ...uuid.UUID) *PostUpdateOne {
	puo.mutation.AddLikeIDs(ids...)
	return puo
}

// AddLikes adds the "likes" edges to the Like entity.
func (puo *PostUpdateOne) AddLikes(l ...*Like) *PostUpdateOne {
	ids := make([]uuid.UUID, len(l))
	for i := range l {
		ids[i] = l[i].ID
	}
	return puo.AddLikeIDs(ids...)
}

// SetDailyTaskID sets the "daily_task" edge to the DailyTask entity by ID.
func (puo *PostUpdateOne) SetDailyTaskID(id uuid.UUID) *PostUpdateOne {
	puo.mutation.SetDailyTaskID(id)
	return puo
}

// SetNillableDailyTaskID sets the "daily_task" edge to the DailyTask entity by ID if the given value is not nil.
func (puo *PostUpdateOne) SetNillableDailyTaskID(id *uuid.UUID) *PostUpdateOne {
	if id != nil {
		puo = puo.SetDailyTaskID(*id)
	}
	return puo
}

// SetDailyTask sets the "daily_task" edge to the DailyTask entity.
func (puo *PostUpdateOne) SetDailyTask(d *DailyTask) *PostUpdateOne {
	return puo.SetDailyTaskID(d.ID)
}

// Mutation returns the PostMutation object of the builder.
func (puo *PostUpdateOne) Mutation() *PostMutation {
	return puo.mutation
}

// ClearUser clears the "user" edge to the User entity.
func (puo *PostUpdateOne) ClearUser() *PostUpdateOne {
	puo.mutation.ClearUser()
	return puo
}

// ClearComments clears all "comments" edges to the Comment entity.
func (puo *PostUpdateOne) ClearComments() *PostUpdateOne {
	puo.mutation.ClearComments()
	return puo
}

// RemoveCommentIDs removes the "comments" edge to Comment entities by IDs.
func (puo *PostUpdateOne) RemoveCommentIDs(ids ...uuid.UUID) *PostUpdateOne {
	puo.mutation.RemoveCommentIDs(ids...)
	return puo
}

// RemoveComments removes "comments" edges to Comment entities.
func (puo *PostUpdateOne) RemoveComments(c ...*Comment) *PostUpdateOne {
	ids := make([]uuid.UUID, len(c))
	for i := range c {
		ids[i] = c[i].ID
	}
	return puo.RemoveCommentIDs(ids...)
}

// ClearLikes clears all "likes" edges to the Like entity.
func (puo *PostUpdateOne) ClearLikes() *PostUpdateOne {
	puo.mutation.ClearLikes()
	return puo
}

// RemoveLikeIDs removes the "likes" edge to Like entities by IDs.
func (puo *PostUpdateOne) RemoveLikeIDs(ids ...uuid.UUID) *PostUpdateOne {
	puo.mutation.RemoveLikeIDs(ids...)
	return puo
}

// RemoveLikes removes "likes" edges to Like entities.
func (puo *PostUpdateOne) RemoveLikes(l ...*Like) *PostUpdateOne {
	ids := make([]uuid.UUID, len(l))
	for i := range l {
		ids[i] = l[i].ID
	}
	return puo.RemoveLikeIDs(ids...)
}

// ClearDailyTask clears the "daily_task" edge to the DailyTask entity.
func (puo *PostUpdateOne) ClearDailyTask() *PostUpdateOne {
	puo.mutation.ClearDailyTask()
	return puo
}

// Where appends a list predicates to the PostUpdate builder.
func (puo *PostUpdateOne) Where(ps ...predicate.Post) *PostUpdateOne {
	puo.mutation.Where(ps...)
	return puo
}

// Select allows selecting one or more fields (columns) of the returned entity.
// The default is selecting all fields defined in the entity schema.
func (puo *PostUpdateOne) Select(field string, fields ...string) *PostUpdateOne {
	puo.fields = append([]string{field}, fields...)
	return puo
}

// Save executes the query and returns the updated Post entity.
func (puo *PostUpdateOne) Save(ctx context.Context) (*Post, error) {
	return withHooks(ctx, puo.sqlSave, puo.mutation, puo.hooks)
}

// SaveX is like Save, but panics if an error occurs.
func (puo *PostUpdateOne) SaveX(ctx context.Context) *Post {
	node, err := puo.Save(ctx)
	if err != nil {
		panic(err)
	}
	return node
}

// Exec executes the query on the entity.
func (puo *PostUpdateOne) Exec(ctx context.Context) error {
	_, err := puo.Save(ctx)
	return err
}

// ExecX is like Exec, but panics if an error occurs.
func (puo *PostUpdateOne) ExecX(ctx context.Context) {
	if err := puo.Exec(ctx); err != nil {
		panic(err)
	}
}

// check runs all checks and user-defined validators on the builder.
func (puo *PostUpdateOne) check() error {
	if v, ok := puo.mutation.Caption(); ok {
		if err := post.CaptionValidator(v); err != nil {
			return &ValidationError{Name: "caption", err: fmt.Errorf(`ent: validator failed for field "Post.caption": %w`, err)}
		}
	}
	if v, ok := puo.mutation.ImageKey(); ok {
		if err := post.ImageKeyValidator(v); err != nil {
			return &ValidationError{Name: "image_key", err: fmt.Errorf(`ent: validator failed for field "Post.image_key": %w`, err)}
		}
	}
	if puo.mutation.UserCleared() && len(puo.mutation.UserIDs()) > 0 {
		return errors.New(`ent: clearing a required unique edge "Post.user"`)
	}
	return nil
}

func (puo *PostUpdateOne) sqlSave(ctx context.Context) (_node *Post, err error) {
	if err := puo.check(); err != nil {
		return _node, err
	}
	_spec := sqlgraph.NewUpdateSpec(post.Table, post.Columns, sqlgraph.NewFieldSpec(post.FieldID, field.TypeUUID))
	id, ok := puo.mutation.ID()
	if !ok {
		return nil, &ValidationError{Name: "id", err: errors.New(`ent: missing "Post.id" for update`)}
	}
	_spec.Node.ID.Value = id
	if fields := puo.fields; len(fields) > 0 {
		_spec.Node.Columns = make([]string, 0, len(fields))
		_spec.Node.Columns = append(_spec.Node.Columns, post.FieldID)
		for _, f := range fields {
			if !post.ValidColumn(f) {
				return nil, &ValidationError{Name: f, err: fmt.Errorf("ent: invalid field %q for query", f)}
			}
			if f != post.FieldID {
				_spec.Node.Columns = append(_spec.Node.Columns, f)
			}
		}
	}
	if ps := puo.mutation.predicates; len(ps) > 0 {
		_spec.Predicate = func(selector *sql.Selector) {
			for i := range ps {
				ps[i](selector)
			}
		}
	}
	if puo.mutation.IndexCleared() {
		_spec.ClearField(post.FieldIndex, field.TypeUint32)
	}
	if value, ok := puo.mutation.Caption(); ok {
		_spec.SetField(post.FieldCaption, field.TypeString, value)
	}
	if value, ok := puo.mutation.ImageKey(); ok {
		_spec.SetField(post.FieldImageKey, field.TypeString, value)
	}
	if value, ok := puo.mutation.CreatedAt(); ok {
		_spec.SetField(post.FieldCreatedAt, field.TypeTime, value)
	}
	if value, ok := puo.mutation.DeletedAt(); ok {
		_spec.SetField(post.FieldDeletedAt, field.TypeTime, value)
	}
	if puo.mutation.DeletedAtCleared() {
		_spec.ClearField(post.FieldDeletedAt, field.TypeTime)
	}
	if puo.mutation.UserCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2O,
			Inverse: true,
			Table:   post.UserTable,
			Columns: []string{post.UserColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(user.FieldID, field.TypeUUID),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := puo.mutation.UserIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.M2O,
			Inverse: true,
			Table:   post.UserTable,
			Columns: []string{post.UserColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(user.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if puo.mutation.CommentsCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.CommentsTable,
			Columns: []string{post.CommentsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(comment.FieldID, field.TypeUUID),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := puo.mutation.RemovedCommentsIDs(); len(nodes) > 0 && !puo.mutation.CommentsCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.CommentsTable,
			Columns: []string{post.CommentsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(comment.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := puo.mutation.CommentsIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.CommentsTable,
			Columns: []string{post.CommentsColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(comment.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if puo.mutation.LikesCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.LikesTable,
			Columns: []string{post.LikesColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(like.FieldID, field.TypeUUID),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := puo.mutation.RemovedLikesIDs(); len(nodes) > 0 && !puo.mutation.LikesCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.LikesTable,
			Columns: []string{post.LikesColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(like.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := puo.mutation.LikesIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2M,
			Inverse: false,
			Table:   post.LikesTable,
			Columns: []string{post.LikesColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(like.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	if puo.mutation.DailyTaskCleared() {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2O,
			Inverse: false,
			Table:   post.DailyTaskTable,
			Columns: []string{post.DailyTaskColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(dailytask.FieldID, field.TypeUUID),
			},
		}
		_spec.Edges.Clear = append(_spec.Edges.Clear, edge)
	}
	if nodes := puo.mutation.DailyTaskIDs(); len(nodes) > 0 {
		edge := &sqlgraph.EdgeSpec{
			Rel:     sqlgraph.O2O,
			Inverse: false,
			Table:   post.DailyTaskTable,
			Columns: []string{post.DailyTaskColumn},
			Bidi:    false,
			Target: &sqlgraph.EdgeTarget{
				IDSpec: sqlgraph.NewFieldSpec(dailytask.FieldID, field.TypeUUID),
			},
		}
		for _, k := range nodes {
			edge.Target.Nodes = append(edge.Target.Nodes, k)
		}
		_spec.Edges.Add = append(_spec.Edges.Add, edge)
	}
	_node = &Post{config: puo.config}
	_spec.Assign = _node.assignValues
	_spec.ScanValues = _node.scanValues
	if err = sqlgraph.UpdateNode(ctx, puo.driver, _spec); err != nil {
		if _, ok := err.(*sqlgraph.NotFoundError); ok {
			err = &NotFoundError{post.Label}
		} else if sqlgraph.IsConstraintError(err) {
			err = &ConstraintError{msg: err.Error(), wrap: err}
		}
		return nil, err
	}
	puo.mutation.done = true
	return _node, nil
}
