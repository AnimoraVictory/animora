package responses

import "github.com/htanos/animalia/backend-go/internal/domain/models"

type RefreshTokenResponse struct {
	AccessToken string
	IdToken     string
}

type UserResponse struct {
	ID           string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email        string `json:"email" gorm:"unique"`
	Name         string `json:"name"`
	Bio          string `json:"bio"`
	IconImageUrl string `json:"iconImageKey"`
}

// NewPetResponse converts a Pet to a PetResponse
func NewUserResponse(user *models.User, imageURL string) UserResponse {
	return UserResponse{
		ID:           user.ID,
		Name:         user.Name,
		Bio:          user.Bio,
		IconImageUrl: imageURL,
	}
}
