package fastapi

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/google/uuid"
)

type FastAPILike struct {
	ID        uuid.UUID       `json:"id"`
	CreatedAt time.Time       `json:"created_at"`
	User      FastAPIUserBase `json:"user"`
}

func NewLikeResponseFromFastAPI(like FastAPILike, imageUrl string) models.LikeResponse {
	user := like.User
	return models.LikeResponse{
		ID:        like.ID.String(),
		User:      NewUserBaseResponseFromFastAPI(user, imageUrl),
		CreatedAt: like.CreatedAt,
	}
}
