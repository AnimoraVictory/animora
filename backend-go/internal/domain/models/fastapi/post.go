package fastapi

import (
	"fmt"
	"time"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/google/uuid"
)

type FastAPIPost struct {
	ID        string            `json:"id"`
	Caption   string            `json:"caption"`
	ImageKey  string            `json:"image_key"`
	CreatedAt string            `json:"created_at"`
	Score     float64           `json:"score"`
	User      FastAPIUserBase   `json:"user"`
	Comments  []FastAPIComment  `json:"comments"`
	Likes     []FastAPILike     `json:"likes"`
	DailyTask *FastAPIDailyTask `json:"daily_task,omitempty"`
}

func NewPostResponseFromFastAPI(
	post FastAPIPost,
	imageURL string,
	userIconURL *string,
	commentResponses []models.CommentResponse,
	likeResponses []models.LikeResponse,
) models.PostResponse {
	var dailyTaskResponse *models.DailyTaskBaseResponse
	if post.DailyTask != nil {
		resp := NewDailyTaskResponseFromFastAPI(post.DailyTask)
		dailyTaskResponse = &resp
	}
	CreatedAt, err := time.Parse(time.RFC3339Nano, post.CreatedAt)
	if err != nil {
		fmt.Printf("failed to parse CreatedAt: %v\n", err)
	}
	UserID, err := uuid.Parse(post.User.ID)
	if err != nil {
		fmt.Printf("failed to parse UUID: %v\n", err)
	}

	return models.PostResponse{
		ID:       uuid.MustParse(post.ID),
		Caption:  post.Caption,
		ImageURL: imageURL,
		User: models.UserBaseResponse{
			ID:           UserID,
			Email:        post.User.Email,
			Name:         post.User.Name,
			Bio:          post.User.Bio,
			IconImageUrl: userIconURL,
		},
		Comments:      commentResponses,
		CommentsCount: len(commentResponses),
		Likes:         likeResponses,
		LikesCount:    len(likeResponses),
		CreatedAt:     CreatedAt,
		DailyTask:     dailyTaskResponse,
	}
}
