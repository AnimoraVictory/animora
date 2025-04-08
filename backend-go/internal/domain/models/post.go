package models

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/google/uuid"
)

type PostResponse struct {
	ID            uuid.UUID         `json:"id"`
	Caption       string            `json:"caption"`
	User          UserBaseResponse  `json:"user"`
	ImageURL      string            `json:"imageUrl"`
	CreatedAt     time.Time         `json:"createdAt"`
	Comments      []CommentResponse `json:"comments"`
	CommentsCount int               `json:"commentsCount"`
	Likes         []LikeResponse    `json:"likes"`
	LikesCount    int               `json:"likesCount"`
}

func NewPostResponse(
	post *ent.Post,
	postImageURL string,
	userImageURL string,
	comments []CommentResponse,
	likes []LikeResponse,
) PostResponse {
	user := post.Edges.User
	return PostResponse{
		ID:            post.ID,
		Caption:       post.Caption,
		User:          NewUserBaseResponse(user, userImageURL),
		ImageURL:      postImageURL,
		CreatedAt:     post.CreatedAt,
		Comments:      comments,
		CommentsCount: len(comments),
		Likes:         likes,
		LikesCount:    len(likes),
	}
}
