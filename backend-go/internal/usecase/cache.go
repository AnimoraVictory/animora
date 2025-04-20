package usecase

import (
	"sync"

	"github.com/aki-13627/animalia/backend-go/internal/domain/models"
	"github.com/google/uuid"
)

type cacheUsecase struct {
	mu    sync.RWMutex
	cache map[uuid.UUID][]models.PostResponse
}

type CacheUsecase interface {
	StorePostResponses(userID uuid.UUID, posts []models.PostResponse)
	GetPostResponses(userID uuid.UUID) []models.PostResponse
	ClearPostResponses(userID uuid.UUID)
}

func NewCacheUsecase() CacheUsecase {
	return &cacheUsecase{
		cache: make(map[uuid.UUID][]models.PostResponse),
	}
}

func (c *cacheUsecase) StorePostResponses(userID uuid.UUID, posts []models.PostResponse) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.cache[userID] = posts
}

func (c *cacheUsecase) GetPostResponses(userID uuid.UUID) []models.PostResponse {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.cache[userID]
}

func (c *cacheUsecase) ClearPostResponses(userID uuid.UUID) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.cache, userID)
}
