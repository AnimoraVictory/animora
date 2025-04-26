package repository

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/google/uuid"
)

type UserRepository interface {
	Create(name, email string) (*ent.User, error)
	ExistsEmail(email string) (bool, error)
	FindByEmail(email string) (*ent.User, error)
	GetById(id uuid.UUID) (*ent.User, error)
	Update(id uuid.UUID, name string, description string, iconImageKey string, streakCount int) error
	Follow(toId string, fromId string) error
	Unfollow(toId string, fromId string) error
}
