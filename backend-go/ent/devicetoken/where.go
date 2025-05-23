// Code generated by ent, DO NOT EDIT.

package devicetoken

import (
	"time"

	"entgo.io/ent/dialect/sql"
	"entgo.io/ent/dialect/sql/sqlgraph"
	"github.com/aki-13627/animalia/backend-go/ent/predicate"
	"github.com/google/uuid"
)

// ID filters vertices based on their ID field.
func ID(id uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldID, id))
}

// IDEQ applies the EQ predicate on the ID field.
func IDEQ(id uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldID, id))
}

// IDNEQ applies the NEQ predicate on the ID field.
func IDNEQ(id uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNEQ(FieldID, id))
}

// IDIn applies the In predicate on the ID field.
func IDIn(ids ...uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldIn(FieldID, ids...))
}

// IDNotIn applies the NotIn predicate on the ID field.
func IDNotIn(ids ...uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNotIn(FieldID, ids...))
}

// IDGT applies the GT predicate on the ID field.
func IDGT(id uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGT(FieldID, id))
}

// IDGTE applies the GTE predicate on the ID field.
func IDGTE(id uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGTE(FieldID, id))
}

// IDLT applies the LT predicate on the ID field.
func IDLT(id uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLT(FieldID, id))
}

// IDLTE applies the LTE predicate on the ID field.
func IDLTE(id uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLTE(FieldID, id))
}

// UserID applies equality check predicate on the "user_id" field. It's identical to UserIDEQ.
func UserID(v uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldUserID, v))
}

// DeviceID applies equality check predicate on the "device_id" field. It's identical to DeviceIDEQ.
func DeviceID(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldDeviceID, v))
}

// Token applies equality check predicate on the "token" field. It's identical to TokenEQ.
func Token(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldToken, v))
}

// Platform applies equality check predicate on the "platform" field. It's identical to PlatformEQ.
func Platform(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldPlatform, v))
}

// CreatedAt applies equality check predicate on the "created_at" field. It's identical to CreatedAtEQ.
func CreatedAt(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldCreatedAt, v))
}

// UpdatedAt applies equality check predicate on the "updated_at" field. It's identical to UpdatedAtEQ.
func UpdatedAt(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldUpdatedAt, v))
}

// UserIDEQ applies the EQ predicate on the "user_id" field.
func UserIDEQ(v uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldUserID, v))
}

// UserIDNEQ applies the NEQ predicate on the "user_id" field.
func UserIDNEQ(v uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNEQ(FieldUserID, v))
}

// UserIDIn applies the In predicate on the "user_id" field.
func UserIDIn(vs ...uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldIn(FieldUserID, vs...))
}

// UserIDNotIn applies the NotIn predicate on the "user_id" field.
func UserIDNotIn(vs ...uuid.UUID) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNotIn(FieldUserID, vs...))
}

// DeviceIDEQ applies the EQ predicate on the "device_id" field.
func DeviceIDEQ(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldDeviceID, v))
}

// DeviceIDNEQ applies the NEQ predicate on the "device_id" field.
func DeviceIDNEQ(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNEQ(FieldDeviceID, v))
}

// DeviceIDIn applies the In predicate on the "device_id" field.
func DeviceIDIn(vs ...string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldIn(FieldDeviceID, vs...))
}

// DeviceIDNotIn applies the NotIn predicate on the "device_id" field.
func DeviceIDNotIn(vs ...string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNotIn(FieldDeviceID, vs...))
}

// DeviceIDGT applies the GT predicate on the "device_id" field.
func DeviceIDGT(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGT(FieldDeviceID, v))
}

// DeviceIDGTE applies the GTE predicate on the "device_id" field.
func DeviceIDGTE(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGTE(FieldDeviceID, v))
}

// DeviceIDLT applies the LT predicate on the "device_id" field.
func DeviceIDLT(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLT(FieldDeviceID, v))
}

// DeviceIDLTE applies the LTE predicate on the "device_id" field.
func DeviceIDLTE(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLTE(FieldDeviceID, v))
}

// DeviceIDContains applies the Contains predicate on the "device_id" field.
func DeviceIDContains(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldContains(FieldDeviceID, v))
}

// DeviceIDHasPrefix applies the HasPrefix predicate on the "device_id" field.
func DeviceIDHasPrefix(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldHasPrefix(FieldDeviceID, v))
}

// DeviceIDHasSuffix applies the HasSuffix predicate on the "device_id" field.
func DeviceIDHasSuffix(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldHasSuffix(FieldDeviceID, v))
}

// DeviceIDEqualFold applies the EqualFold predicate on the "device_id" field.
func DeviceIDEqualFold(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEqualFold(FieldDeviceID, v))
}

// DeviceIDContainsFold applies the ContainsFold predicate on the "device_id" field.
func DeviceIDContainsFold(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldContainsFold(FieldDeviceID, v))
}

// TokenEQ applies the EQ predicate on the "token" field.
func TokenEQ(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldToken, v))
}

// TokenNEQ applies the NEQ predicate on the "token" field.
func TokenNEQ(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNEQ(FieldToken, v))
}

// TokenIn applies the In predicate on the "token" field.
func TokenIn(vs ...string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldIn(FieldToken, vs...))
}

// TokenNotIn applies the NotIn predicate on the "token" field.
func TokenNotIn(vs ...string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNotIn(FieldToken, vs...))
}

// TokenGT applies the GT predicate on the "token" field.
func TokenGT(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGT(FieldToken, v))
}

// TokenGTE applies the GTE predicate on the "token" field.
func TokenGTE(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGTE(FieldToken, v))
}

// TokenLT applies the LT predicate on the "token" field.
func TokenLT(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLT(FieldToken, v))
}

// TokenLTE applies the LTE predicate on the "token" field.
func TokenLTE(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLTE(FieldToken, v))
}

// TokenContains applies the Contains predicate on the "token" field.
func TokenContains(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldContains(FieldToken, v))
}

// TokenHasPrefix applies the HasPrefix predicate on the "token" field.
func TokenHasPrefix(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldHasPrefix(FieldToken, v))
}

// TokenHasSuffix applies the HasSuffix predicate on the "token" field.
func TokenHasSuffix(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldHasSuffix(FieldToken, v))
}

// TokenEqualFold applies the EqualFold predicate on the "token" field.
func TokenEqualFold(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEqualFold(FieldToken, v))
}

// TokenContainsFold applies the ContainsFold predicate on the "token" field.
func TokenContainsFold(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldContainsFold(FieldToken, v))
}

// PlatformEQ applies the EQ predicate on the "platform" field.
func PlatformEQ(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldPlatform, v))
}

// PlatformNEQ applies the NEQ predicate on the "platform" field.
func PlatformNEQ(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNEQ(FieldPlatform, v))
}

// PlatformIn applies the In predicate on the "platform" field.
func PlatformIn(vs ...string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldIn(FieldPlatform, vs...))
}

// PlatformNotIn applies the NotIn predicate on the "platform" field.
func PlatformNotIn(vs ...string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNotIn(FieldPlatform, vs...))
}

// PlatformGT applies the GT predicate on the "platform" field.
func PlatformGT(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGT(FieldPlatform, v))
}

// PlatformGTE applies the GTE predicate on the "platform" field.
func PlatformGTE(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGTE(FieldPlatform, v))
}

// PlatformLT applies the LT predicate on the "platform" field.
func PlatformLT(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLT(FieldPlatform, v))
}

// PlatformLTE applies the LTE predicate on the "platform" field.
func PlatformLTE(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLTE(FieldPlatform, v))
}

// PlatformContains applies the Contains predicate on the "platform" field.
func PlatformContains(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldContains(FieldPlatform, v))
}

// PlatformHasPrefix applies the HasPrefix predicate on the "platform" field.
func PlatformHasPrefix(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldHasPrefix(FieldPlatform, v))
}

// PlatformHasSuffix applies the HasSuffix predicate on the "platform" field.
func PlatformHasSuffix(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldHasSuffix(FieldPlatform, v))
}

// PlatformEqualFold applies the EqualFold predicate on the "platform" field.
func PlatformEqualFold(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEqualFold(FieldPlatform, v))
}

// PlatformContainsFold applies the ContainsFold predicate on the "platform" field.
func PlatformContainsFold(v string) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldContainsFold(FieldPlatform, v))
}

// CreatedAtEQ applies the EQ predicate on the "created_at" field.
func CreatedAtEQ(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldCreatedAt, v))
}

// CreatedAtNEQ applies the NEQ predicate on the "created_at" field.
func CreatedAtNEQ(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNEQ(FieldCreatedAt, v))
}

// CreatedAtIn applies the In predicate on the "created_at" field.
func CreatedAtIn(vs ...time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldIn(FieldCreatedAt, vs...))
}

// CreatedAtNotIn applies the NotIn predicate on the "created_at" field.
func CreatedAtNotIn(vs ...time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNotIn(FieldCreatedAt, vs...))
}

// CreatedAtGT applies the GT predicate on the "created_at" field.
func CreatedAtGT(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGT(FieldCreatedAt, v))
}

// CreatedAtGTE applies the GTE predicate on the "created_at" field.
func CreatedAtGTE(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGTE(FieldCreatedAt, v))
}

// CreatedAtLT applies the LT predicate on the "created_at" field.
func CreatedAtLT(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLT(FieldCreatedAt, v))
}

// CreatedAtLTE applies the LTE predicate on the "created_at" field.
func CreatedAtLTE(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLTE(FieldCreatedAt, v))
}

// UpdatedAtEQ applies the EQ predicate on the "updated_at" field.
func UpdatedAtEQ(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldEQ(FieldUpdatedAt, v))
}

// UpdatedAtNEQ applies the NEQ predicate on the "updated_at" field.
func UpdatedAtNEQ(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNEQ(FieldUpdatedAt, v))
}

// UpdatedAtIn applies the In predicate on the "updated_at" field.
func UpdatedAtIn(vs ...time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldIn(FieldUpdatedAt, vs...))
}

// UpdatedAtNotIn applies the NotIn predicate on the "updated_at" field.
func UpdatedAtNotIn(vs ...time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldNotIn(FieldUpdatedAt, vs...))
}

// UpdatedAtGT applies the GT predicate on the "updated_at" field.
func UpdatedAtGT(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGT(FieldUpdatedAt, v))
}

// UpdatedAtGTE applies the GTE predicate on the "updated_at" field.
func UpdatedAtGTE(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldGTE(FieldUpdatedAt, v))
}

// UpdatedAtLT applies the LT predicate on the "updated_at" field.
func UpdatedAtLT(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLT(FieldUpdatedAt, v))
}

// UpdatedAtLTE applies the LTE predicate on the "updated_at" field.
func UpdatedAtLTE(v time.Time) predicate.DeviceToken {
	return predicate.DeviceToken(sql.FieldLTE(FieldUpdatedAt, v))
}

// HasUser applies the HasEdge predicate on the "user" edge.
func HasUser() predicate.DeviceToken {
	return predicate.DeviceToken(func(s *sql.Selector) {
		step := sqlgraph.NewStep(
			sqlgraph.From(Table, FieldID),
			sqlgraph.Edge(sqlgraph.M2O, true, UserTable, UserColumn),
		)
		sqlgraph.HasNeighbors(s, step)
	})
}

// HasUserWith applies the HasEdge predicate on the "user" edge with a given conditions (other predicates).
func HasUserWith(preds ...predicate.User) predicate.DeviceToken {
	return predicate.DeviceToken(func(s *sql.Selector) {
		step := newUserStep()
		sqlgraph.HasNeighborsWith(s, step, func(s *sql.Selector) {
			for _, p := range preds {
				p(s)
			}
		})
	})
}

// And groups predicates with the AND operator between them.
func And(predicates ...predicate.DeviceToken) predicate.DeviceToken {
	return predicate.DeviceToken(sql.AndPredicates(predicates...))
}

// Or groups predicates with the OR operator between them.
func Or(predicates ...predicate.DeviceToken) predicate.DeviceToken {
	return predicate.DeviceToken(sql.OrPredicates(predicates...))
}

// Not applies the not operator on the given predicate.
func Not(p predicate.DeviceToken) predicate.DeviceToken {
	return predicate.DeviceToken(sql.NotPredicates(p))
}
