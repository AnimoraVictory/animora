package injector

import (
	"os"

	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"github.com/htanos/animalia/backend-go/internal/domain/repository"
	"github.com/htanos/animalia/backend-go/internal/handler"
	"github.com/htanos/animalia/backend-go/internal/infra"
	"github.com/htanos/animalia/backend-go/internal/usecase"
	"gorm.io/gorm"
)

func InjectDB() *gorm.DB {
	return models.DB
}

func InjectCognitoRepository() repository.AuthRepository {
	authRepository := infra.NewCognitoRepository()
	return authRepository
}

func InjectUserRepository() repository.UserRepository {
	userRepository := infra.NewUserRepository(InjectDB())
	return userRepository
}

func InjectPostRepository() repository.PostRepository {
	postRepository := infra.NewPostRepository(InjectDB())
	return postRepository
}

func InjectPetRepository() repository.PetRepository {
	petRepository := infra.NewPetRepository(InjectDB())
	return petRepository
}

func InjectStorageRepository() repository.StorageRepository {
	storageRepository := infra.NewS3Repository(os.Getenv("AWS_S3_BUCKET_NAME"))
	return storageRepository
}

func InjectAuthUsecase() usecase.AuthUsecase {
	authUsecase := usecase.NewAuthUsecase(InjectCognitoRepository(), InjectUserRepository())
	return *authUsecase
}

func InjectPostUsecase() usecase.PostUsecase {
	postUsecase := usecase.NewPostUsecase(InjectPostRepository())
	return *postUsecase
}

func InjectPetUsecase() usecase.PetUsecase {
	petUsecase := usecase.NewPetUsecase(InjectPetRepository())
	return *petUsecase
}

func InjectStorageUsecase() usecase.StorageUsecase {
	storageUsecase := usecase.NewStorageUsecase(InjectStorageRepository())
	return *storageUsecase
}

func InjectUserUsecase() usecase.UserUsecase {
	userUsecase := usecase.NewUserUsecase(InjectUserRepository())
	return *userUsecase
}

func InjectAuthHandler() handler.AuthHandler {
	authHandler := handler.NewAuthHandler(InjectAuthUsecase(), InjectUserUsecase())
	return *authHandler
}

func InjectPostHandler() handler.PostHandler {
	postHandler := handler.NewPostHandler(InjectPostUsecase(), InjectStorageUsecase())
	return *postHandler
}

func InjectPetHandler() handler.PetHandler {
	petHandler := handler.NewPetHandler(InjectPetUsecase(), InjectStorageUsecase())
	return *petHandler
}

func InjectUserHandler() handler.UserHandler {
	userHandler := handler.NewUserHandler(InjectUserUsecase())
	return *userHandler
}
