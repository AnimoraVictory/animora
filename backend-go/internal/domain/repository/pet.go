package repository

import (
	"github.com/htanos/animalia/backend-go/internal/domain/models"
)

type PetRepository interface {
	GetByOwner(ownerID string) ([]*models.Pet, error)
	Create(name, petType, species, birthDay, fileKey, userID string) (*models.Pet, error)
	Update(petID, name, petType, species, birthDay string) error
	Delete(petID string) error
}
