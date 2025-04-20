package fastapi

import (
	"fmt"
	"time"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
)

type FastAPILike struct {
	ID        string          `json:"id"`
	CreatedAt string          `json:"created_at"`
	User      FastAPIUserBase `json:"user"`
}

func NewLikeResponseFromFastAPI(like FastAPILike, imageUrl string) models.LikeResponse {
	user := like.User
	CreatedAt, err := time.Parse(time.RFC3339Nano, like.CreatedAt)
	if err != nil {
		fmt.Printf("failed to parse CreatedAt: %v\n", err)
	}

	return models.LikeResponse{
		ID:        like.ID,
		User:      NewUserBaseResponseFromFastAPI(user, imageUrl),
		CreatedAt: CreatedAt,
	}
}
