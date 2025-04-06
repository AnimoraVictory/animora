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
		log.Errorf("Faild to get Comments: %v", err)
		return []models.CommentResponse{}, err
	}

	commentResponses := make([]models.CommentResponse, len(comments))
	for i, comment := range comments {
		user := comment.Edges.User
		if user == nil {
			log.Errorf("User not found for comment: %v", comment)
			return []models.CommentResponse{}, err
		}
		imageURL, err := u.storageRepository.GetUrl(user.IconImageKey)
		if err != nil {
			log.Errorf("Failed to get url: %v", err)
			return []models.CommentResponse{}, err
		}
		commentResponses[i] = models.NewCommentResponse(comment, user, imageURL)
	}

	return commentResponses, nil
}
