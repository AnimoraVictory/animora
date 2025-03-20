package infra

import (
	"github.com/htanos/animalia/backend-go/internal/domain/models"
	"gorm.io/gorm"
)

type PetRepository struct {
	db *gorm.DB
}

func NewPetRepository(db *gorm.DB) *PetRepository {
	return &PetRepository{
		db: db,
	}
}

func (r *PetRepository) GetByOwner(ownerID string) ([]*models.Pet, error) {
	var pets []*models.Pet
	if err := r.db.Where("owner_id = ?", ownerID).Find(&pets).Error; err != nil {
		return nil, err
	}
	return pets, nil
}

func (r *PetRepository) Create(name, petType, species, birthDay, fileKey, userID string) (*models.Pet, error) {

	pet := models.Pet{
		Name:     name,
		Type:     models.PetType(petType),
		Species:  species,
		BirthDay: birthDay,
		ImageKey: fileKey,
		OwnerID:  userID,
	}

	if err := r.db.Create(&pet).Error; err != nil {
		return nil, err
	}

	return &pet, nil
}

func (r *PetRepository) Update(petId, name, petType, species, birthDay string) error {
	pet := models.Pet{
		Name:     name,
		Type:     models.PetType(petType),
		Species:  species,
		BirthDay: birthDay,
	}

	if err := r.db.Model(&models.Pet{}).Where("id = ?", petId).Updates(&pet).Error; err != nil {
		return err
	}

	return nil
}

func (r *PetRepository) Delete(petId string) error {
	return r.db.Delete(&models.Pet{}, petId).Error
}
