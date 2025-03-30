package usecase

import (
	"github.com/htanos/animalia/backend-go/ent"
	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"github.com/htanos/animalia/backend-go/internal/domain/repository"
)

type PostUsecase struct {
	postRepository    repository.PostRepository
	storageRepository repository.StorageRepository
}

func NewPostUsecase(postRepository repository.PostRepository, storageRepository repository.StorageRepository) *PostUsecase {
	return &PostUsecase{
		postRepository:    postRepository,
		storageRepository: storageRepository,
	}
}

func (u *PostUsecase) GetAllPosts() ([]*models.PostResponse, error) {
	posts, err := u.postRepository.GetAllPosts()
	if err != nil {
		return nil, err
	}

	postResponses := make([]*models.PostResponse, len(posts))
	for i, post := range posts {
		imageURL, err := u.storageRepository.GetUrl(post.ImageKey)
		if err != nil {
			return nil, err
		}
		postResponses[i] = models.NewPostResponse(post, imageURL)
	}

	return postResponses, nil
}

func (u *PostUsecase) GetPostsByUser(userId string) ([]*ent.Post, error) {
	return u.postRepository.GetPostsByUser(userId)
}

func (u *PostUsecase) CreatePost(caption, userId, fileKey string) (*ent.Post, error) {
	return u.postRepository.CreatePost(caption, userId, fileKey)
}

func (u *PostUsecase) UpdatePost(postId, caption string) error {
	return u.postRepository.UpdatePost(postId, caption)
}

func (u *PostUsecase) DeletePost(postId string) error {
	return u.postRepository.DeletePost(postId)
}
