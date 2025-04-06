package infra

import (
	"context"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/like"
	"github.com/aki-13627/animalia/backend-go/ent/post"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
)

type LikeRepository struct {
	db *ent.Client
}

func NewLikeRepository(db *ent.Client) *LikeRepository {
	return &LikeRepository{
		db: db,
	}
}
func (r *LikeRepository) Create(userID, postId string) error {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return err

	}
	parsedPostId, err := uuid.Parse(postId)
	if err != nil {
		return err
	}

	_, err = r.db.Like.Create().
		SetUserID(parsedUserID).
		SetPostID(parsedPostId).
		Save(context.Background())
	if err != nil {
		return err
	}

	return nil
}

func (r *LikeRepository) Delete(userID, postId string) error {
	parsedUserID, err := uuid.Parse(userID)
	if err != nil {
		return err

	}
	parsedPostId, err := uuid.Parse(postId)
	if err != nil {
		return err
	}

	_, err = r.db.Like.Delete().
		Where(
			like.And(
				like.HasPostWith(post.ID(parsedPostId)),
				like.HasUserWith(user.ID(parsedUserID)),
			),
		).
		Exec(context.Background())
	if err != nil {
		return err
	}

	return nil
}

func (r *LikeRepository) Count(postId string) (int, error) {
	parsedPostId, err := uuid.Parse(postId)
	if err != nil {
		return 0, err
	}

	count, err := r.db.Like.Query().
		Where(like.HasPostWith(post.ID(parsedPostId))).
		Count(context.Background())
	if err != nil {
		return 0, err
	}

	return count, nil
}
