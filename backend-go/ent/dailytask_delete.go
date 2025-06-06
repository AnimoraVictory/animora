// Code generated by ent, DO NOT EDIT.

package ent

import (
	"context"

	"entgo.io/ent/dialect/sql"
	"entgo.io/ent/dialect/sql/sqlgraph"
	"entgo.io/ent/schema/field"
	"github.com/aki-13627/animalia/backend-go/ent/dailytask"
	"github.com/aki-13627/animalia/backend-go/ent/predicate"
)

// DailyTaskDelete is the builder for deleting a DailyTask entity.
type DailyTaskDelete struct {
	config
	hooks    []Hook
	mutation *DailyTaskMutation
}

// Where appends a list predicates to the DailyTaskDelete builder.
func (dtd *DailyTaskDelete) Where(ps ...predicate.DailyTask) *DailyTaskDelete {
	dtd.mutation.Where(ps...)
	return dtd
}

// Exec executes the deletion query and returns how many vertices were deleted.
func (dtd *DailyTaskDelete) Exec(ctx context.Context) (int, error) {
	return withHooks(ctx, dtd.sqlExec, dtd.mutation, dtd.hooks)
}

// ExecX is like Exec, but panics if an error occurs.
func (dtd *DailyTaskDelete) ExecX(ctx context.Context) int {
	n, err := dtd.Exec(ctx)
	if err != nil {
		panic(err)
	}
	return n
}

func (dtd *DailyTaskDelete) sqlExec(ctx context.Context) (int, error) {
	_spec := sqlgraph.NewDeleteSpec(dailytask.Table, sqlgraph.NewFieldSpec(dailytask.FieldID, field.TypeUUID))
	if ps := dtd.mutation.predicates; len(ps) > 0 {
		_spec.Predicate = func(selector *sql.Selector) {
			for i := range ps {
				ps[i](selector)
			}
		}
	}
	affected, err := sqlgraph.DeleteNodes(ctx, dtd.driver, _spec)
	if err != nil && sqlgraph.IsConstraintError(err) {
		err = &ConstraintError{msg: err.Error(), wrap: err}
	}
	dtd.mutation.done = true
	return affected, err
}

// DailyTaskDeleteOne is the builder for deleting a single DailyTask entity.
type DailyTaskDeleteOne struct {
	dtd *DailyTaskDelete
}

// Where appends a list predicates to the DailyTaskDelete builder.
func (dtdo *DailyTaskDeleteOne) Where(ps ...predicate.DailyTask) *DailyTaskDeleteOne {
	dtdo.dtd.mutation.Where(ps...)
	return dtdo
}

// Exec executes the deletion query.
func (dtdo *DailyTaskDeleteOne) Exec(ctx context.Context) error {
	n, err := dtdo.dtd.Exec(ctx)
	switch {
	case err != nil:
		return err
	case n == 0:
		return &NotFoundError{dailytask.Label}
	default:
		return nil
	}
}

// ExecX is like Exec, but panics if an error occurs.
func (dtdo *DailyTaskDeleteOne) ExecX(ctx context.Context) {
	if err := dtdo.Exec(ctx); err != nil {
		panic(err)
	}
}
