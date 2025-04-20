package infra

import (
	"context"
	"time"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/ent/dailytask"
	"github.com/aki-13627/animalia/backend-go/ent/like"
	"github.com/aki-13627/animalia/backend-go/ent/post"
	"github.com/aki-13627/animalia/backend-go/ent/user"
	"github.com/google/uuid"
	"github.com/labstack/gommon/log"
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
		WithComments(func(q *ent.CommentQuery) {
			q.WithUser()
		}).
		WithLikes(func(q *ent.LikeQuery) {
			q.WithUser()
		}).
		WithDailyTask().
		Where(post.DeletedAtIsNil()).
		Select(post.FieldID, post.FieldCaption, post.FieldImageKey, post.FieldCreatedAt).
		All(context.Background())
	if err != nil {
		log.Errorf("Failed to get all posts: %v", err)
		return nil, err
	}
	return posts, nil
}

func (r *PostRepository) GetPostsByUser(userID uuid.UUID) ([]*ent.Post, error) {
	posts, err := r.db.Post.Query().
		WithUser().
		WithComments(func(q *ent.CommentQuery) {
			q.WithUser()
		}).
		WithLikes(func(q *ent.LikeQuery) {
			q.WithUser()
		}).
		WithDailyTask().
		Where(post.HasUserWith(user.ID(userID))).
		Where(post.DeletedAtIsNil()).
		Order(ent.Desc(post.FieldCreatedAt)).
		Select(post.FieldID, post.FieldCaption, post.FieldImageKey, post.FieldCreatedAt).
		All(context.Background())
	if err != nil {
		log.Errorf("Failed to get posts by user: %v", err)
		return nil, err
	}
	return posts, nil
}

func (r *PostRepository) GetLikedPosts(userID uuid.UUID) ([]*ent.Post, error) {
	posts, err := r.db.Post.Query().
		WithUser().
		WithComments(func(q *ent.CommentQuery) {
			q.WithUser()
		}).
		WithLikes(func(q *ent.LikeQuery) {
			q.WithUser()
		}).
		WithDailyTask().
		Where(post.HasLikesWith(like.HasUserWith(user.ID(userID)))).
		Where(post.DeletedAtIsNil()).
		Order(ent.Desc(post.FieldCreatedAt)).
		Select(post.FieldID, post.FieldCaption, post.FieldImageKey, post.FieldCreatedAt).
		All(context.Background())
	if err != nil {
		log.Errorf("Failed to get posts by user: %v", err)
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
		err = r.db.Post.
			Update().
			Where(
				post.HasDailyTaskWith(dailytask.ID(dailyTaskUUID)),
				post.DeletedAtNotNil(), // 論理削除済みのみ対象
			).
			ClearDailyTask().
			Exec(context.Background())
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

	return r.db.Post.UpdateOneID(postUUID).
		SetDeletedAt(time.Now()).
		Exec(context.Background())
}
