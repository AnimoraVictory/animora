package models

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
)

type LikeResponse struct {
	ID        string           `json:"id"`
	User      UserBaseResponse `json:"user"`
	CreatedAt time.Time        `json:"createdAt"`
}

func NewLikeResponse(like *ent.Like, imageUrl string) LikeResponse {
	user := like.Edges.User
	return LikeResponse{
		ID:        like.ID.String(),
		User:      NewUserBaseResponse(user, imageUrl),
		CreatedAt: like.CreatedAt,
	}
}
