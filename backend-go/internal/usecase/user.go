package usecase

import (
	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"github.com/htanos/animalia/backend-go/internal/domain/repository"
)

type UserUsecase struct {
	userRepository repository.UserRepository
}

func NewUserUsecase(userRepository repository.UserRepository) *UserUsecase {
	return &UserUsecase{
		userRepository: userRepository,
	}
}

func (u *UserUsecase) CreateUser(name, email string) (*models.User, error) {
	return u.userRepository.Create(name, email)
}

func (u *UserUsecase) Update(id string, name string, description string) error {
	return u.userRepository.Update(id, name, description)
}
