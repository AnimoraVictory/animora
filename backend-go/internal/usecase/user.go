package usecase

import (
	"fmt"

	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"github.com/htanos/animalia/backend-go/internal/domain/repository"
	"gorm.io/gorm"
)

type UserUsecase struct {
	db             *gorm.DB
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

func (u *UserUsecase) Update(id string, name string, description string, newImageKey string) error {
	return u.userRepository.Update(id, name, description, newImageKey)
}

func (u *UserUsecase) GetById(id string) (*models.User, error) {
	return u.userRepository.GetById(id)
}

func (u *UserUsecase) Follow(followerId string, followedId string) error {
	return u.userRepository.Follow(followerId, followedId)
}

func (u *UserUsecase) countFollowRelations(id, column string) (int, error) {
	var count int64
	if err := u.db.
		Model(&models.FollowRelation{}).
		Where(fmt.Sprintf("%s = ?", column), id).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}

func (u *UserUsecase) FollowsCount(id string) (int, error) {
	return u.countFollowRelations(id, "from_id")
}

func (u *UserUsecase) FollowerCount(id string) (int, error) {
	return u.countFollowRelations(id, "to_id")
}

func (u *UserUsecase) fetchUserRelations(id, column, preloadField string) ([]models.FollowRelation, error) {
	var relations []models.FollowRelation
	if err := u.db.
		Where(fmt.Sprintf("%s = ?", column), id).
		Preload(preloadField).
		Find(&relations).Error; err != nil {
		return nil, err
	}
	return relations, nil
}
func (u *UserUsecase) FollowsUsers(id string) ([]models.User, error) {
	relations, err := u.fetchUserRelations(id, "from_id", "Followed")
	if err != nil {
		return nil, err
	}
	users := make([]models.User, len(relations))
	for i, rel := range relations {
		users[i] = rel.Followed
	}
	return users, nil
}

func (u *UserUsecase) FollowerUsers(id string) ([]models.User, error) {
	relations, err := u.fetchUserRelations(id, "to_id", "Follower")
	if err != nil {
		return nil, err
	}
	users := make([]models.User, len(relations))
	for i, rel := range relations {
		users[i] = rel.Follower
	}
	return users, nil
}
