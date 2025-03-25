package usecase

import (
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

// 自分のフォロワーの総数
func (u *UserUsecase) FollowerCount(id string) (int, error) {
	var count int64
	// 自分をフォローしているユーザーは、followed_idが対象のユーザーIDになっている
	if err := u.db.Model(&models.FollowRelation{}).
		Where("followed_id = ?", id).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}

// 自分がフォローをしたユーザーの総数
func (u *UserUsecase) FollowedCount(id string) (int, error) {
	var count int64
	// 自分がフォローしているユーザーは、follower_idが対象のユーザーIDになっている
	if err := u.db.Model(&models.FollowRelation{}).
		Where("follower_id = ?", id).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}

// 自分のフォロワーを全て取得する
func (u *UserUsecase) FollowerUsers(id string) ([]models.User, error) {
	var relations []models.FollowRelation
	if err := u.db.
		Where("followed_id = ?", id).
		Preload("Follower").
		Find(&relations).Error; err != nil {
		return nil, err
	}
	users := make([]models.User, len(relations))
	for i, rel := range relations {
		users[i] = rel.Follower
	}
	return users, nil
}

// 自分がフォローしたユーザーを全て取得する
func (u *UserUsecase) FollowedUsers(id string) ([]models.User, error) {
	var relations []models.FollowRelation
	if err := u.db.
		Where("follower_id = ?", id).
		Preload("Followed").
		Find(&relations).Error; err != nil {
		return nil, err
	}
	users := make([]models.User, len(relations))
	for i, rel := range relations {
		users[i] = rel.Followed
	}
	return users, nil
}
