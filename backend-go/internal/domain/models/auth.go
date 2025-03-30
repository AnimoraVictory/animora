package models

import (
	"github.com/google/uuid"
	"github.com/htanos/animalia/backend-go/ent"
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
