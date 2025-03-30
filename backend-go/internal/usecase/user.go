package usecase

import (
	"github.com/htanos/animalia/backend-go/ent"
	"github.com/htanos/animalia/backend-go/internal/domain/repository"
)

type UserUsecase struct {
	userRepository           repository.UserRepository
	followRelationRepository repository.FollowRelationRepository
}

func NewUserUsecase(userRepository repository.UserRepository) *UserUsecase {
	return &UserUsecase{
		userRepository: userRepository,
	}
}

func (u *UserUsecase) CreateUser(name, email string) (*ent.User, error) {
	return u.userRepository.Create(name, email)
}

func (u *UserUsecase) Update(id string, name string, description string, newImageKey string) error {
	return u.userRepository.Update(id, name, description, newImageKey)
}

func (u *UserUsecase) GetById(id string) (*ent.User, error) {
	return u.userRepository.GetById(id)
}

func (u *UserUsecase) Follow(followerId string, followedId string) error {
	return u.userRepository.Follow(followerId, followedId)
}

func (u *UserUsecase) FollowsCount(id string) (int, error) {
	return u.followRelationRepository.CountFollows(id)
}

func (u *UserUsecase) FollowerCount(id string) (int, error) {
	return u.followRelationRepository.CountFollowers(id)
}

func (u *UserUsecase) FollowingUsers(id string) ([]*ent.User, error) {
	return u.followRelationRepository.Followings(id)
}

func (u *UserUsecase) Followers(id string) ([]*ent.User, error) {
	return u.followRelationRepository.Followers(id)
}
