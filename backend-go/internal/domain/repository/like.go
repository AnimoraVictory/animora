package repository

type LikeRepository interface {
	Create(userId string, postId string) error
	Delete(userId string, postId string) error
	Count(petID string) (int, error)
}
