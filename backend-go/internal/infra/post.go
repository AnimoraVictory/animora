package infra

import (
	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"gorm.io/gorm"
)

type PostRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{
		db: db,
	}
}

func (r *PostRepository) GetAllPosts() ([]*models.Post, error) {
	var posts []*models.Post
	if err := r.db.Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *PostRepository) GetPostsByUser(userId string) ([]*models.Post, error) {
	var posts []*models.Post
	if err := r.db.Where("user_id = ?", userId).Find(&posts).Error; err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *PostRepository) CreatePost(caption, userId, fileKey string) (*models.Post, error) {
	post := models.Post{
		Caption:  caption,
		UserID:   userId,
		ImageKey: fileKey,
	}

	if err := r.db.Create(&post).Error; err != nil {
		return nil, err
	}

	return &post, nil
}

func (r *PostRepository) UpdatePost(postId, caption string) error {
	post := models.Post{
		Caption: caption,
	}

	if err := r.db.Model(&models.Post{}).Where("id = ?", postId).Updates(&post).Error; err != nil {
		return err
	}

	return nil
}

func (r *PostRepository) DeletePost(postId string) error {
	return r.db.Delete(&models.Post{}, postId).Error
}
