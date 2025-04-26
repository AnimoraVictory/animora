package injector

import (
	"context"
	"log"
	"os"

	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/middlewares"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
	"github.com/aki-13627/animalia/backend-go/internal/handler"
	"github.com/aki-13627/animalia/backend-go/internal/infra"
	"github.com/aki-13627/animalia/backend-go/internal/usecase"
	_ "github.com/lib/pq"
)

var client *ent.Client

func InjectDB() *ent.Client {
	if client == nil {
		var err error
		client, err = ent.Open("postgres", os.Getenv("DATABASE_URL"))
		if err != nil {
			log.Fatalf("failed opening connection to postgres: %v", err)
		}

		// Run the auto migration tool
		if err := client.Schema.Create(context.Background()); err != nil {
			log.Fatalf("failed creating schema resources: %v", err)
		}
	}
	return client
}

func InjectCognitoRepository() repository.AuthRepository {
	authRepository := infra.NewCognitoRepository()
	return authRepository
}

func InjectUserRepository() repository.UserRepository {
	userRepository := infra.NewUserRepository(InjectDB())
	return userRepository
}

func InjectFollowRelationRepository() repository.FollowRelationRepository {
	followRelationRepository := infra.NewFollowRelationRepository(InjectDB())
	return followRelationRepository
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

func InjectLikeRepository() repository.LikeRepository {
	likeRepository := infra.NewLikeRepository(InjectDB())
	return likeRepository
}

func InjectCommentRepository() repository.CommentRepository {
	commentRepository := infra.NewCommentRepository(InjectDB())
	return commentRepository
}

func InjectDailyTaskRepository() repository.DailyTaskRepository {
	dailyTaskRepository := infra.NewDailyTaskRepository(InjectDB())
	return dailyTaskRepository
}

func InjectDeviceTokenRepository() repository.DeviceTokenRepository {
	deviceTokenRepostory := infra.NewDeviceTokenRepository(InjectDB())
	return deviceTokenRepostory
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
	userUsecase := usecase.NewUserUsecase(InjectUserRepository(), InjectStorageRepository(), InjectPostRepository(), InjectPetRepository(), InjectFollowRelationRepository())
	return *userUsecase
}

func InjectLikeUsecase() usecase.LikeUsecase {
	likeUsecase := usecase.NewLikeUsecase(InjectLikeRepository())
	return *likeUsecase
}

func InjectCommentUsecase() usecase.CommentUsecase {
	commentUsecase := usecase.NewCommentUsecase(InjectCommentRepository(), InjectPostRepository(), InjectStorageRepository())
	return *commentUsecase
}

func InjectDailyTaskUsecase() usecase.DailyTaskUsecase {
	dailytaskUsecase := usecase.NewDailyTaskUsecase(InjectDailyTaskRepository())
	return *dailytaskUsecase
}

func InjectCacheUsecase() usecase.CacheUsecase {
	return usecase.NewCacheUsecase()
}

func InjectDeviceTokenUsecase() usecase.DeviceTokenUsecase {
	deviceTokenUsecase := usecase.NewDeviceTokenUsecase(InjectDeviceTokenRepository())
	return *deviceTokenUsecase
}

func InjectAuthHandler() handler.AuthHandler {
	authHandler := handler.NewAuthHandler(InjectAuthUsecase(), InjectUserUsecase(), InjectStorageUsecase(), InjectDailyTaskUsecase())
	return *authHandler
}

func InjectPostHandler() *handler.PostHandler {
	return handler.NewPostHandler(
		InjectPostUsecase(),
		InjectStorageUsecase(),
		InjectCacheUsecase(),
	)
}

func InjectPetHandler() handler.PetHandler {
	petHandler := handler.NewPetHandler(InjectPetUsecase(), InjectStorageUsecase())
	return *petHandler
}

func InjectUserHandler() handler.UserHandler {
	userHandler := handler.NewUserHandler(InjectUserUsecase(), InjectStorageUsecase())
	return *userHandler
}

func InjectLikeHandler() handler.LikeHandler {
	likeHandler := handler.NewLikeHandler(InjectLikeUsecase())
	return *likeHandler
}

func InjectCommentHandler() handler.CommentHandler {
	commentHandler := handler.NewCommentHandler(InjectCommentUsecase(), InjectUserUsecase())
	return *commentHandler
}

func InjectDeviceTokenHandler() handler.DeviceTokenHandler {
	deviceTokenHandler := handler.NewDeviceTokenHandler(InjectDeviceTokenUsecase())
	return *deviceTokenHandler
}

func InjectAuthMiddleware() middlewares.AuthMiddleware {
	authMiddleware := middlewares.NewAuthMiddleware(InjectAuthUsecase())
	return *authMiddleware
}
