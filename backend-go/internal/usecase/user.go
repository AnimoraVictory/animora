package usecase

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/google/uuid"
	"github.com/labstack/gommon/log"
)

type UserUsecase struct {
	userRepository           repository.UserRepository
	storageRepository        repository.StorageRepository
	postRepository           repository.PostRepository
	petRepository            repository.PetRepository
	followRelationRepository repository.FollowRelationRepository
}

func NewUserUsecase(userRepository repository.UserRepository, storageRepository repository.StorageRepository, postRepository repository.PostRepository, petRepository repository.PetRepository, followRelationRepository repository.FollowRelationRepository) *UserUsecase {
	return &UserUsecase{
		userRepository:           userRepository,
		storageRepository:        storageRepository,
		postRepository:           postRepository,
		petRepository:            petRepository,
		followRelationRepository: followRelationRepository,
	}
}

func (u *UserUsecase) CreateUser(name, email string) (*ent.User, error) {
	return u.userRepository.Create(name, email)
}

func (u *UserUsecase) Update(id string, name string, description string, newImageKey string) error {
	userUUID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return u.userRepository.Update(userUUID, name, description, newImageKey)
}

func (u *UserUsecase) UpdateStreakCount(id string, streakCount int) error {
	userUUID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return u.userRepository.UpdateStreakCount(userUUID, streakCount)
}

func (u *UserUsecase) GetAll() ([]*ent.User, error) {
	return u.userRepository.GetAll()
}

func (u *UserUsecase) GetById(id string) (*ent.User, error) {
	userUUID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return u.userRepository.GetById(userUUID)
}

func (u *UserUsecase) FindByEmail(email string) (*ent.User, error) {
	return u.userRepository.FindByEmail(email)
}

func (u *UserUsecase) GetByEmail(email string) (models.UserResponse, error) {
	user, err := u.userRepository.FindByEmail(email)
	if err != nil {
		return models.UserResponse{}, err
	}

	iconURL := ""
	if user.IconImageKey != "" {
		url, err := u.storageRepository.GetUrl(user.IconImageKey)
		if err != nil {
			log.Errorf("Failed to get url: %v", err)
			return models.UserResponse{}, err
		}
		iconURL = url
	}

	posts, err := u.postRepository.GetPostsByUser(user.ID)
	if err != nil {
		log.Errorf("Failed to get posts by user: %v", err)
		return models.UserResponse{}, err
	}
	postResponses := make([]models.PostResponse, len(posts))
	for i, post := range posts {
		imageURL, err := u.storageRepository.GetUrl(post.ImageKey)
		if err != nil {
			log.Errorf("Failed to get url: %v", err)
			return models.UserResponse{}, err
		}

		commentResponses := make([]models.CommentResponse, len(post.Edges.Comments))
		for j, comment := range post.Edges.Comments {
			commentUserImageURL := ""
			if comment.Edges.User.IconImageKey != "" {
				commentUserImageURL, err = u.storageRepository.GetUrl(comment.Edges.User.IconImageKey)
				if err != nil {
					log.Errorf("Failed to get comment user url: %v", err)
					return models.UserResponse{}, err
				}
			}
			commentResponses[j] = models.NewCommentResponse(comment, comment.Edges.User, commentUserImageURL)
		}
		likeResponses := make([]models.LikeResponse, len(post.Edges.Likes))
		for j, like := range post.Edges.Likes {
			likeUserImageURL := ""
			if like.Edges.User.IconImageKey != "" {
				likeUserImageURL, err = u.storageRepository.GetUrl(like.Edges.User.IconImageKey)
				if err != nil {
					log.Errorf("Failed to get like user url: %v", err)
					return models.UserResponse{}, err
				}
			}
			likeResponses[j] = models.NewLikeResponse(like, likeUserImageURL)
		}
		postResponses[i] = models.NewPostResponse(post, imageURL, iconURL, commentResponses, likeResponses)
	}

	pets, err := u.petRepository.GetByOwner(user.ID.String())
	if err != nil {
		return models.UserResponse{}, err
	}
	petResponses := make([]models.PetResponse, len(pets))
	for i, pet := range pets {
		imageURL, err := u.storageRepository.GetUrl(pet.ImageKey)
		if err != nil {
			log.Errorf("Failed to get url: %v", err)
			return models.UserResponse{}, err
		}
		petResponses[i] = models.NewPetResponse(pet, imageURL)
	}

	followers := make([]models.UserBaseResponse, 0)
	for _, followersRelation := range user.Edges.Followers {
		follower := followersRelation.Edges.From

		imageUrl := ""
		if follower.IconImageKey != "" {
			url, err := u.storageRepository.GetUrl(follower.IconImageKey)
			if err != nil {
				log.Warnf("Failed to get icon URL for follower %s: %v", follower.Name, err)
			} else {
				imageUrl = url
			}
		}

		followers = append(followers, models.NewUserBaseResponse(follower, imageUrl))
	}

	follows := make([]models.UserBaseResponse, 0)
	for _, followsRelation := range user.Edges.Following {
		follow := followsRelation.Edges.To

		imageUrl := ""
		if follow.IconImageKey != "" {
			url, err := u.storageRepository.GetUrl(follow.IconImageKey)
			if err != nil {
				log.Warnf("Failed to get icon URL for follow %s: %v", follow.Name, err)
			} else {
				imageUrl = url
			}
		}

		follows = append(follows, models.NewUserBaseResponse(follow, imageUrl))
	}

	dailyTask := user.Edges.DailyTasks[0]
	dailyTaskResoponse := models.NewDailyTaskResponse(dailyTask)

	userResponse := models.NewUserResponse(user, iconURL, postResponses, petResponses, followers, follows, dailyTaskResoponse)
	return userResponse, nil
}

func (u *UserUsecase) Delete(id string) error {
	userUUID, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return u.userRepository.Delete(userUUID)
}

func (u *UserUsecase) Follow(toId string, fromId string) error {
	return u.userRepository.Follow(toId, fromId)
}

func (u *UserUsecase) Unfollow(toId string, fromId string) error {
	return u.userRepository.Unfollow(toId, fromId)
}

func (u *UserUsecase) FollowsCount(id string) (int, error) {
	return u.followRelationRepository.CountFollows(id)
}

func (u *UserUsecase) FollowerCount(id string) (int, error) {
	return u.followRelationRepository.CountFollowers(id)
}

func (u *UserUsecase) FollowingUsers(id string) ([]*ent.User, error) {
	return u.followRelationRepository.Followings(id)
}

func (u *UserUsecase) Followers(id string) ([]*ent.User, error) {
	return u.followRelationRepository.Followers(id)
}
