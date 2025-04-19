package fastapi

import (
	"fmt"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/google/uuid"
)

type FastAPIUserBase struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	Bio          string `json:"bio"`
	IconImageKey string `json:"icon_image_key"`
}

func NewUserBaseResponseFromFastAPI(user FastAPIUserBase, iconImageUrl string) models.UserBaseResponse {
	var iconURL *string
	if iconImageUrl != "" {
		iconURL = &iconImageUrl
	}
	UserID, err := uuid.Parse(user.ID)
	if err != nil {
		fmt.Printf("failed to parse UUID: %v\n", err)
	}
	return models.UserBaseResponse{
		ID:           UserID,
		Email:        user.Email,
		Name:         user.Name,
		Bio:          user.Bio,
		IconImageUrl: iconURL,
	}
}
