package models

import (
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/enum"
	"github.com/google/uuid"
)

type DailyTaskBaseResponse struct {
	ID        uuid.UUID     `json:"id"`
	CreatedAt time.Time     `json:"createdAt"`
	Type      enum.TaskType `json:"type"`
}

type DailyTaskResponse struct {
	ID        uuid.UUID         `json:"id"`
	CreatedAt time.Time         `json:"createdAt"`
	Type      enum.TaskType     `json:"type"`
	Post      *PostBaseResponse `json:"post"`
}

func NewDailyTaskBaseResponse(dailyTask *ent.DailyTask) DailyTaskBaseResponse {
	return DailyTaskBaseResponse{
		ID:        dailyTask.ID,
		CreatedAt: dailyTask.CreatedAt,
		Type:      dailyTask.Type,
	}
}

func NewDailyTaskResponse(dailyTask *ent.DailyTask) DailyTaskResponse {
	var postResp *PostBaseResponse
	if dailyTask.Edges.Post != nil {
		resp := NewPostBaseResponse(dailyTask.Edges.Post)
		postResp = &resp
	}
	return DailyTaskResponse{
		ID:        dailyTask.ID,
		CreatedAt: dailyTask.CreatedAt,
		Type:      dailyTask.Type,
		Post:      postResp,
	}
}
