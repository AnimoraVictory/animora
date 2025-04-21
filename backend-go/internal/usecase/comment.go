package usecase

import (
	"fmt"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
	"github.com/labstack/gommon/log"
)

type CommentUsecase struct {
	commentRepository repository.CommentRepository
	postRepository    repository.PostRepository
	storageRepository repository.StorageRepository
}

func NewCommentUsecase(commentRepository repository.CommentRepository, postRepository repository.PostRepository, storageRepository repository.StorageRepository) *CommentUsecase {
	return &CommentUsecase{
		commentRepository: commentRepository,
		postRepository:    postRepository,
		storageRepository: storageRepository,
	}
}

func (u *CommentUsecase) Create(userID uuid.UUID, postId uuid.UUID, content string) (*models.CommentResponse, error) {
	post, err := u.postRepository.GetById(postId)
	if err != nil {
		log.Errorf("Failed to find post with id %s: %v", postId, err)
		return nil, fmt.Errorf("post not found")
	}
	comment, err := u.commentRepository.Create(userID, post.ID, content)
	if err != nil {
		return nil, err
	}

	user := comment.Edges.User
	if user == nil {
		return nil, fmt.Errorf("user edge not loaded")
	}

	var iconURL string
	if user.IconImageKey != "" {
		var err error
		iconURL, err = u.storageRepository.GetUrl(user.IconImageKey)
		if err != nil {
			return nil, fmt.Errorf("failed to get icon image url: %w", err)
		}
	}

	commentResponse := models.NewCommentResponse(comment, user, iconURL)
	return &commentResponse, nil
}

func (u *CommentUsecase) Delete(commentId string) error {
	err := u.commentRepository.Delete(commentId)
	if err != nil {
		return err
	}
	return nil
}
