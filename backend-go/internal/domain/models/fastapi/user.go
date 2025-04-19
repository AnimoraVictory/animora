package fastapi

import (
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/google/uuid"
)

type FastAPIUserBase struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Bio          string    `json:"bio"`
	IconImageKey string    `json:"icon_image_key"`
}

func NewUserBaseResponseFromFastAPI(user FastAPIUserBase, iconImageUrl string) models.UserBaseResponse {
	var iconURL *string
	if iconImageUrl != "" {
		iconURL = &iconImageUrl
	}
	return models.UserBaseResponse{
		ID:           user.ID,
		Email:        user.Email,
		Name:         user.Name,
		Bio:          user.Bio,
		IconImageUrl: iconURL,
	}
}
