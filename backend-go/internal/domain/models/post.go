package models

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/google/uuid"
)

type PostResponse struct {
	ID        uuid.UUID `json:"id"`
	Caption   string    `json:"caption"`
	UserId    uuid.UUID `json:"userId"`
	ImageURL  string    `json:"imageUrl"`
	CreatedAt time.Time `json:"createdAt"`
}

func NewPostResponse(post *ent.Post, imageURL string) *PostResponse {
	return &PostResponse{
		ID:        post.ID,
		Caption:   post.Caption,
		UserId:    post.Edges.User.ID,
		ImageURL:  imageURL,
		CreatedAt: post.CreatedAt,
	}
}
