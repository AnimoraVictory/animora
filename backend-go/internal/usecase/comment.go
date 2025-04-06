package usecase

import (
	"fmt"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/labstack/gommon/log"
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

func (u *CommentUsecase) Create(userID, postId, content string) error {
	err := u.commentRepository.Create(userID, postId, content)
	if err != nil {
		return err
	}
	return nil
}

func (u *CommentUsecase) Delete(commentId string) error {
	err := u.commentRepository.Delete(commentId)
	if err != nil {
		return err
	}
	return nil
}

func (u *CommentUsecase) Count(postId string) (int, error) {
	count, err := u.commentRepository.Count(postId)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (u *CommentUsecase) convertToResponse(comment *ent.Comment) (models.CommentResponse, error) {
	user := comment.Edges.User
	if user == nil {
		return models.CommentResponse{}, fmt.Errorf("user not found for comment ID %v", comment.ID)
	}

	imageURL, err := u.storageRepository.GetUrl(user.IconImageKey)
	if err != nil {
		return models.CommentResponse{}, fmt.Errorf("failed to get url for user %v: %w", user.ID, err)
	}

	return models.NewCommentResponse(comment, user, imageURL), nil
}

func (u *CommentUsecase) GetByPostId(postId string) ([]models.CommentResponse, error) {
	comments, err := u.commentRepository.GetByPostId(postId)
	if err != nil {
		log.Errorf("Failed to get Comments: %v", err)
		return nil, err
	}

	commentResponses := make([]models.CommentResponse, 0)
	for _, comment := range comments {
		resp, err := u.convertToResponse(comment)
		if err != nil {
			log.Errorf("Conversion error for comment ID %v: %v", comment.ID, err)
			return nil, err
		}
		commentResponses = append(commentResponses, resp)
	}

	return commentResponses, nil
}
