package responses

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/google/uuid"
)

type RefreshTokenResponse struct {
	AccessToken string
	IdToken     string
}

type UserResponse struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	Name         string    `json:"name"`
	Bio          string    `json:"bio"`
	IconImageUrl string    `json:"iconImageUrl"`
}

// NewPetResponse converts a Pet to a PetResponse
func NewUserResponse(user *ent.User, imageURL string) UserResponse {
	return UserResponse{
		ID:           user.ID,
		Name:         user.Name,
		Bio:          user.Bio,
		IconImageUrl: imageURL,
	}
}
