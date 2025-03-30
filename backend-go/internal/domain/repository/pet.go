package repository

import (
	"github.com/htanos/animalia/backend-go/ent"
)

type PetRepository interface {
	GetByOwner(ownerID string) ([]*ent.Pet, error)
	Create(name, petType, species, birthDay, fileKey, userID string) (*ent.Pet, error)
	Update(petID, name, petType, species, birthDay string) error
	Delete(petID string) error
}
