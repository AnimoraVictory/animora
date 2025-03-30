package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/htanos/animalia/backend-go/ent"
	"github.com/htanos/animalia/backend-go/ent/pet"
)

// PetResponse represents the API response structure for a pet
type PetResponse struct {
	ID        uuid.UUID   `json:"id"`
	Name      string      `json:"name"`
	BirthDay  string      `json:"birthDay"`
	Type      pet.Type    `json:"type"`
	Species   pet.Species `json:"species"`
	ImageURL  string      `json:"imageUrl"`
	OwnerID   uuid.UUID   `json:"ownerId"`
	Owner     *ent.User   `json:"owner,omitempty"`
	CreatedAt time.Time   `json:"createdAt"`
}

// NewPetResponse converts a Pet to a PetResponse
func NewPetResponse(pet *ent.Pet, imageURL string) PetResponse {
	owner, _ := pet.Edges.OwnerOrErr()
	return PetResponse{
		ID:        pet.ID,
		Name:      pet.Name,
		BirthDay:  pet.BirthDay,
		Type:      pet.Type,
		Species:   pet.Species,
		ImageURL:  imageURL,
		OwnerID:   owner.ID,
		Owner:     owner,
		CreatedAt: pet.CreatedAt,
	}
}
