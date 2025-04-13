package usecase

import (
	"fmt"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
)

type CommentUsecase struct {
	commentRepository repository.CommentRepository
	storageRepository repository.StorageRepository
}

func NewCommentUsecase(commentRepository repository.CommentRepository, storageRepository repository.StorageRepository) *CommentUsecase {
	return &CommentUsecase{
		commentRepository: commentRepository,
		storageRepository: storageRepository,
	}
}

func (u *CommentUsecase) Create(userID, postId, content string) (*models.CommentResponse, error) {
	comment, err := u.commentRepository.Create(userID, postId, content)
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
