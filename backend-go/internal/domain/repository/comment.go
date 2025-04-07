package repository

type CommentRepository interface {
	Create(userId string, postId string, content string) error
	Delete(commentId string) error
}
