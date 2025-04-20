package infra

import (
	"context"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/comment"
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

func (r *CommentRepository) Create(userId, postId, content string) (*ent.Comment, error) {
	parsedUserID, err := uuid.Parse(userId)
	if err != nil {
		return nil, err
	}
	parsedPostId, err := uuid.Parse(postId)
	if err != nil {
		return nil, err
	}

	// ① コメント作成
	created, err := r.db.Comment.Create().
		SetUserID(parsedUserID).
		SetPostID(parsedPostId).
		SetContent(content).
		Save(context.Background())
	if err != nil {
		return nil, err
	}

	// ② 作成後に WithUser で再取得
	commentWithUser, err := r.db.Comment.Query().
		Where(comment.IDEQ(created.ID)).
		WithUser().
		Only(context.Background())
	if err != nil {
		return nil, err
	}

	return commentWithUser, nil
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
