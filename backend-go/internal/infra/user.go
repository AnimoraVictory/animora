package infra

import (
	"fmt"

	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) Create(name, email string) (*models.User, error) {
	var existingUser models.User
	if err := r.db.Where("email = ?", email).First(&existingUser).Error; err == nil {
		return nil, fmt.Errorf("このメールアドレスは既に登録されています")
	}

	user := models.User{
		Email: email,
		Name:  name,
	}

	if err := r.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user in database: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) ExistsEmail(email string) (bool, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User

	// メールアドレスで検索し、最初の一致したレコードを取得
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) Update(id string, name string, description string) error {
	var user models.User
	if err := r.db.Where("id = ?", id).First(&user).Error; err != nil {
		return err
	}

	user.Name = name
	user.Bio = description

	if err := r.db.Save(&user).Error; err != nil {
		return err
	}

	return nil
}
