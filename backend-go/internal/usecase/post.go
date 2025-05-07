package usecase

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
)

type PostUsecase struct {
	postRepository repository.PostRepository
}

func NewPostUsecase(postRepository repository.PostRepository) *PostUsecase {
	return &PostUsecase{
		postRepository: postRepository,
	}
}

func (u *PostUsecase) GetAllPosts() ([]*ent.Post, error) {
	return u.postRepository.GetAllPosts()
}

func (u *PostUsecase) GetFollowsPosts(userId uuid.UUID, cursor *uuid.UUID, limit int) ([]*ent.Post, error) {
	return u.postRepository.GetFollowsPosts(userId, cursor, limit)
}

func (u *PostUsecase) CreatePost(caption, userId, fileKey string, dailyTaskId *string) (*ent.Post, error) {
	return u.postRepository.CreatePost(caption, userId, fileKey, dailyTaskId)
}

func (u *PostUsecase) UpdatePost(postId, caption string) error {
	return u.postRepository.UpdatePost(postId, caption)
}

func (u *PostUsecase) DeletePost(postId string) error {
	return u.postRepository.DeletePost(postId)
}

func (u *PostUsecase) GetByIds(postIds []uuid.UUID) ([]*ent.Post, error) {
	return u.postRepository.GetByIds(postIds)
}
