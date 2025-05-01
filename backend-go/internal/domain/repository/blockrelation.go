package repository

import "github.com/aki-13627/animalia/backend-go/ent"

type BlockRelationRepository interface {
	Create(fromID, toID string) error
	Delete(fromID, toID string) error
	BlockingUsers(fromID string) ([]*ent.User, error)
	BlockedByUsers(toID string) ([]*ent.User, error)
}
