package repository

import (
	"github.com/htanos/animalia/backend-go/internal/domain/models"
)

type UserRepository interface {
	Create(name, email string) (*models.User, error)
	ExistsEmail(email string) (bool, error)
	FindByEmail(email string) (*models.User, error)
	GetById(id string) (*models.User, error)
	Update(id string, name string, description string, newImageKey string) error
	Follow(followerId string, followedId string) error
}
