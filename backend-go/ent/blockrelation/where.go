// Code generated by ent, DO NOT EDIT.

package blockrelation

import (
	"time"

	"entgo.io/ent/dialect/sql"
	"entgo.io/ent/dialect/sql/sqlgraph"
	"github.com/aki-13627/animalia/backend-go/ent/predicate"
	"github.com/google/uuid"
)

// ID filters vertices based on their ID field.
func ID(id uuid.UUID) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldEQ(FieldID, id))
}

// IDEQ applies the EQ predicate on the ID field.
func IDEQ(id uuid.UUID) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldEQ(FieldID, id))
}

// IDNEQ applies the NEQ predicate on the ID field.
func IDNEQ(id uuid.UUID) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldNEQ(FieldID, id))
}

// IDIn applies the In predicate on the ID field.
func IDIn(ids ...uuid.UUID) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldIn(FieldID, ids...))
}

// IDNotIn applies the NotIn predicate on the ID field.
func IDNotIn(ids ...uuid.UUID) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldNotIn(FieldID, ids...))
}

// IDGT applies the GT predicate on the ID field.
func IDGT(id uuid.UUID) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldGT(FieldID, id))
}

// IDGTE applies the GTE predicate on the ID field.
func IDGTE(id uuid.UUID) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldGTE(FieldID, id))
}

// IDLT applies the LT predicate on the ID field.
func IDLT(id uuid.UUID) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldLT(FieldID, id))
}

// IDLTE applies the LTE predicate on the ID field.
func IDLTE(id uuid.UUID) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldLTE(FieldID, id))
}

// CreatedAt applies equality check predicate on the "created_at" field. It's identical to CreatedAtEQ.
func CreatedAt(v time.Time) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldEQ(FieldCreatedAt, v))
}

// CreatedAtEQ applies the EQ predicate on the "created_at" field.
func CreatedAtEQ(v time.Time) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldEQ(FieldCreatedAt, v))
}

// CreatedAtNEQ applies the NEQ predicate on the "created_at" field.
func CreatedAtNEQ(v time.Time) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldNEQ(FieldCreatedAt, v))
}

// CreatedAtIn applies the In predicate on the "created_at" field.
func CreatedAtIn(vs ...time.Time) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldIn(FieldCreatedAt, vs...))
}

// CreatedAtNotIn applies the NotIn predicate on the "created_at" field.
func CreatedAtNotIn(vs ...time.Time) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldNotIn(FieldCreatedAt, vs...))
}

// CreatedAtGT applies the GT predicate on the "created_at" field.
func CreatedAtGT(v time.Time) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldGT(FieldCreatedAt, v))
}

// CreatedAtGTE applies the GTE predicate on the "created_at" field.
func CreatedAtGTE(v time.Time) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldGTE(FieldCreatedAt, v))
}

// CreatedAtLT applies the LT predicate on the "created_at" field.
func CreatedAtLT(v time.Time) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldLT(FieldCreatedAt, v))
}

// CreatedAtLTE applies the LTE predicate on the "created_at" field.
func CreatedAtLTE(v time.Time) predicate.BlockRelation {
	return predicate.BlockRelation(sql.FieldLTE(FieldCreatedAt, v))
}

// HasFrom applies the HasEdge predicate on the "from" edge.
func HasFrom() predicate.BlockRelation {
	return predicate.BlockRelation(func(s *sql.Selector) {
		step := sqlgraph.NewStep(
			sqlgraph.From(Table, FieldID),
			sqlgraph.Edge(sqlgraph.M2O, true, FromTable, FromColumn),
		)
		sqlgraph.HasNeighbors(s, step)
	})
}

// HasFromWith applies the HasEdge predicate on the "from" edge with a given conditions (other predicates).
func HasFromWith(preds ...predicate.User) predicate.BlockRelation {
	return predicate.BlockRelation(func(s *sql.Selector) {
		step := newFromStep()
		sqlgraph.HasNeighborsWith(s, step, func(s *sql.Selector) {
			for _, p := range preds {
				p(s)
			}
		})
	})
}

// HasTo applies the HasEdge predicate on the "to" edge.
func HasTo() predicate.BlockRelation {
	return predicate.BlockRelation(func(s *sql.Selector) {
		step := sqlgraph.NewStep(
			sqlgraph.From(Table, FieldID),
			sqlgraph.Edge(sqlgraph.M2O, true, ToTable, ToColumn),
		)
		sqlgraph.HasNeighbors(s, step)
	})
}

// HasToWith applies the HasEdge predicate on the "to" edge with a given conditions (other predicates).
func HasToWith(preds ...predicate.User) predicate.BlockRelation {
	return predicate.BlockRelation(func(s *sql.Selector) {
		step := newToStep()
		sqlgraph.HasNeighborsWith(s, step, func(s *sql.Selector) {
			for _, p := range preds {
				p(s)
			}
		})
	})
}

// And groups predicates with the AND operator between them.
func And(predicates ...predicate.BlockRelation) predicate.BlockRelation {
	return predicate.BlockRelation(sql.AndPredicates(predicates...))
}

// Or groups predicates with the OR operator between them.
func Or(predicates ...predicate.BlockRelation) predicate.BlockRelation {
	return predicate.BlockRelation(sql.OrPredicates(predicates...))
}

// Not applies the not operator on the given predicate.
func Not(p predicate.BlockRelation) predicate.BlockRelation {
	return predicate.BlockRelation(sql.NotPredicates(p))
}
