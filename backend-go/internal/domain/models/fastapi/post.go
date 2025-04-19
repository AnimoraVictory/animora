package fastapi

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/google/uuid"
)

type FastAPIPost struct {
	ID        string            `json:"id"`
	Caption   string            `json:"caption"`
	ImageKey  string            `json:"image_key"`
	CreatedAt time.Time         `json:"created_at"`
	Score     float64           `json:"score"`
	User      FastAPIUserBase   `json:"users"`
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
	return models.PostResponse{
		ID:       uuid.MustParse(post.ID),
		Caption:  post.Caption,
		ImageURL: imageURL,
		User: models.UserBaseResponse{
			ID:           post.User.ID,
			Email:        post.User.Email,
			Name:         post.User.Name,
			Bio:          post.User.Bio,
			IconImageUrl: userIconURL,
		},
		Comments:      commentResponses,
		CommentsCount: len(commentResponses),
		Likes:         likeResponses,
		LikesCount:    len(likeResponses),
		CreatedAt:     post.CreatedAt,
		DailyTask:     dailyTaskResponse,
	}
}
