package usecase

import (
	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"github.com/htanos/animalia/backend-go/internal/domain/repository"
)

type PostUsecase struct {
	postRepository repository.PostRepository
}

func NewPostUsecase(postRepository repository.PostRepository) *PostUsecase {
	return &PostUsecase{
		postRepository: postRepository,
	}
}

func (u *PostUsecase) GetAllPosts() ([]*models.Post, error) {
	return u.postRepository.GetAllPosts()
}

func (u *PostUsecase) GetPostsByUser(userId string) ([]*models.Post, error) {
	return u.postRepository.GetPostsByUser(userId)
}

func (u *PostUsecase) CreatePost(caption, userId, fileKey string) (*models.Post, error) {
	return u.postRepository.CreatePost(caption, userId, fileKey)
}

func (u *PostUsecase) UpdatePost(postId, caption string) error {
	return u.postRepository.UpdatePost(postId, caption)
}

func (u *PostUsecase) DeletePost(postId string) error {
	return u.postRepository.DeletePost(postId)
}
