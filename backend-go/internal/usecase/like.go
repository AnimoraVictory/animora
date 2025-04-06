package usecase

import "github.com/aki-13627/animalia/backend-go/internal/domain/repository"

type LikeUsecase struct {
	likeRepository repository.LikeRepository
}

func NewLikeUsecase(likeRepository repository.LikeRepository) *LikeUsecase {
	return &LikeUsecase{
		likeRepository: likeRepository,
	}
}

func (u *LikeUsecase) Create(userID, postId string) error {
	err := u.likeRepository.Create(userID, postId)
	return err
}

func (u *LikeUsecase) Delete(userID, postId string) error {
	return u.likeRepository.Delete(userID, postId)
}

func (u *LikeUsecase) Count(postId string) (int, error) {
	count, err := u.likeRepository.Count(postId)
	if err != nil {
		return 0, err
	}
	return count, nil
}
