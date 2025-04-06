package usecase

import (
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

func (u *CommentUsecase) GetByPostId(postId string) ([]models.CommentResponse, error) {

	comments, err := u.commentRepository.GetByPostId(postId)
	if err != nil {
		log.Errorf("Failed to get comments: %v", err)
		return nil, err
	}

	commentResponses := make([]models.CommentResponse, 0, len(comments))
	for _, comment := range comments {
		user := comment.Edges.User
		if user == nil {
			log.Errorf("Missing user edge for comment ID %v", comment.ID)
			continue
		}

		imageURL, err := u.storageRepository.GetUrl(user.IconImageKey)
		if err != nil {
			log.Errorf("Failed to get icon URL: %v", err)
			return nil, err
		}

		resp := models.NewCommentResponse(comment, user, imageURL)
		commentResponses = append(commentResponses, resp)
	}

	return commentResponses, nil
}
