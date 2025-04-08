package usecase

import (
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
