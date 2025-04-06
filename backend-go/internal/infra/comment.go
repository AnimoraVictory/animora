package infra

import (
	"context"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/comment"
	"github.com/aki-13627/animalia/backend-go/ent/post"
	"github.com/google/uuid"
)

type CommentRepository struct {
	db *ent.Client
}

func NewCommentRepository(db *ent.Client) *CommentRepository {
	return &CommentRepository{
		db: db,
	}
}

func (r *CommentRepository) Create(userId, postId, content string) error {
	parsedUserID, err := uuid.Parse(userId)
	if err != nil {
		return err
	}
	parsedPostId, err := uuid.Parse(postId)
	if err != nil {
		return err
	}

	_, err = r.db.Comment.Create().
		SetUserID(parsedUserID).
		SetPostID(parsedPostId).
		SetContent(content).
		Save(context.Background())
	if err != nil {
		return err
	}

	return nil
}

func (r *CommentRepository) Delete(commentId string) error {
	parsedCommentId, err := uuid.Parse(commentId)
	if err != nil {
		return err
	}

	err = r.db.Comment.DeleteOneID(parsedCommentId).Exec(context.Background())
	if err != nil {
		return err
	}

	return nil
}

func (r *CommentRepository) Count(postId string) (int, error) {
	parsedPostId, err := uuid.Parse(postId)
	if err != nil {
		return 0, err
	}

	count, err := r.db.Comment.Query().
		Where(comment.HasPostWith(post.ID(parsedPostId))).
		Count(context.Background())
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (r *CommentRepository) GetByPostId(postId string) ([]*ent.Comment, error) {
	parsedPostId, err := uuid.Parse(postId)
	if err != nil {
		return nil, err
	}

	comments, err := r.db.Comment.Query().
		Where(comment.HasPostWith(post.ID(parsedPostId))).
		WithUser().
		All(context.Background())
	if err != nil {
		return nil, err
	}

	return comments, nil
}
