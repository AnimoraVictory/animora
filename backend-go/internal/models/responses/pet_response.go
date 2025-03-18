package responses

import (
	"time"

	"github.com/htanos/animalia/backend-go/internal/models"
)

// PetResponse represents the API response structure for a pet
type PetResponse struct {
	ID        string         `json:"id"`
	Name      string         `json:"name"`
	BirthDay  string         `json:"birthDay"`
	Type      models.PetType `json:"type"`
	Species   string         `json:"species"`
	ImageURL  string        `json:"imageUrl"`
	OwnerID   string         `json:"ownerId"`
	Owner     models.User    `json:"owner,omitempty"`
	CreatedAt time.Time      `json:"createdAt"`
}

// NewPetResponse converts a Pet to a PetResponse
func NewPetResponse(pet *models.Pet, imageURL string) PetResponse {
	return PetResponse{
		ID:        pet.ID,
		Name:      pet.Name,
		BirthDay:  pet.BirthDay,
		Type:      pet.Type,
		Species:   pet.Species,
		ImageURL:  imageURL,
		OwnerID:   pet.OwnerID,
		Owner:     pet.Owner,
		CreatedAt: pet.CreatedAt,
	}
}
