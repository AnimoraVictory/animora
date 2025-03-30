package repository

import (
	"github.com/htanos/animalia/backend-go/ent"
)

type UserRepository interface {
	Create(name, email string) (*ent.User, error)
	ExistsEmail(email string) (bool, error)
	FindByEmail(email string) (*ent.User, error)
	GetById(id string) (*ent.User, error)
	Update(id string, name string, description string, newImageKey string) error
	Follow(fromId string, toId string) error
}
