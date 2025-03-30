package infra

import (
	"context"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/post"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
)

type PostRepository struct {
	db *ent.Client
}

func NewPostRepository(db *ent.Client) *PostRepository {
	return &PostRepository{
		db: db,
	}
}

func (r *PostRepository) GetAllPosts() ([]*ent.Post, error) {
	posts, err := r.db.Post.Query().
		WithUser().
		Where(post.DeletedAtIsNil()).
		Select(post.FieldID, post.FieldCaption, post.FieldImageKey, post.FieldCreatedAt).
		All(context.Background())
	if err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *PostRepository) GetPostsByUser(userID string) ([]*ent.Post, error) {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	posts, err := r.db.Post.Query().
		Where(post.HasUserWith(user.ID(userUUID))).
		Where(post.DeletedAtIsNil()).
		All(context.Background())
	if err != nil {
		return nil, err
	}
	return posts, nil
}

func (r *PostRepository) CreatePost(caption, userID, fileKey string, dailyTaskId *string) (*ent.Post, error) {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	postCount, err := r.db.Post.Query().Count(context.Background())
	if err != nil {
		return nil, err
	}

	postCreate := r.db.Post.Create().
		SetCaption(caption).
		SetImageKey(fileKey).
		SetUserID(userUUID).
		SetIndex(postCount)

	if dailyTaskId != nil {
		dailyTaskUUID, err := uuid.Parse(*dailyTaskId)
		if err != nil {
			return nil, err
		}
		postCreate = postCreate.SetDailyTaskID(dailyTaskUUID)
	}

	post, err := postCreate.Save(context.Background())
	if err != nil {
		return nil, err
	}

	return post, nil
}

func (r *PostRepository) UpdatePost(postID, caption string) error {
	postUUID, err := uuid.Parse(postID)
	if err != nil {
		return err
	}

	_, err = r.db.Post.UpdateOneID(postUUID).
		SetCaption(caption).
		Save(context.Background())
	return err
}

func (r *PostRepository) DeletePost(postID string) error {
	postUUID, err := uuid.Parse(postID)
	if err != nil {
		return err
	}

	return r.db.Post.DeleteOneID(postUUID).Exec(context.Background())
}
