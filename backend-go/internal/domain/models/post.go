package models

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/google/uuid"
)

type PostResponse struct {
	ID        uuid.UUID    `json:"id"`
	Caption   string       `json:"caption"`
	UserId    uuid.UUID    `json:"userId"`
	User      UserResponse `json:"user"`
	ImageURL  string       `json:"imageUrl"`
	CreatedAt time.Time    `json:"createdAt"`
}

func NewPostResponse(post *ent.Post, postImageURL string, userImageURL string) *PostResponse {
	user := post.Edges.User
	return &PostResponse{
		ID:        post.ID,
		Caption:   post.Caption,
		UserId:    user.ID,
		User:      NewUserResponse(user, userImageURL),
		ImageURL:  postImageURL,
		CreatedAt: post.CreatedAt,
	}
}
