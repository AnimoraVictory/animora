package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/htanos/animalia/backend-go/ent"
)

type PostResponse struct {
	ID        uuid.UUID `json:"id"`
	Caption   string    `json:"caption"`
	ImageURL  string    `json:"imageURL"`
	CreatedAt time.Time `json:"createdAt"`
}

func NewPostResponse(post *ent.Post, imageURL string) *PostResponse {
	return &PostResponse{
		ID:        post.ID,
		Caption:   post.Caption,
		ImageURL:  imageURL,
		CreatedAt: post.CreatedAt,
	}
}
