package usecase

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
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
	return u.userRepository.Update(id, name, description, newImageKey)
}

func (u *UserUsecase) GetById(id string) (*ent.User, error) {
	return u.userRepository.GetById(id)
}

func (u *UserUsecase) GetByEmail(email string) (models.UserResponse, error) {
	user, err := u.userRepository.FindByEmail(email)
	if err != nil {
		return models.UserResponse{}, err
	}

	iconURL := ""
	// ユーザーのアイコン画像がある場合は URL を取得
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
		postResponses[i] = models.NewPostResponse(post, imageURL, iconURL)
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

	userResponse := models.NewUserResponse(user, iconURL, postResponses, petResponses)

	return userResponse, nil
}

func (u *UserUsecase) Follow(followerId string, followedId string) error {
	return u.userRepository.Follow(followerId, followedId)
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
