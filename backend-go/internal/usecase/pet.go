package usecase

import (
	"github.com/aki-13627/animalia/backend-go/ent"
	"github.com/aki-13627/animalia/backend-go/internal/domain/repository"
)

type PetUsecase struct {
	petRepository repository.PetRepository
}

func NewPetUsecase(petRepository repository.PetRepository) *PetUsecase {
	return &PetUsecase{
		petRepository: petRepository,
	}
}

func (u *PetUsecase) GetByOwner(ownerID string) ([]*ent.Pet, error) {
	return u.petRepository.GetByOwner(ownerID)
}

func (u *PetUsecase) Create(name, petType, species, birthDay, fileKey, userID string) (*ent.Pet, error) {
	return u.petRepository.Create(name, petType, species, birthDay, fileKey, userID)
}

func (u *PetUsecase) Update(petId, name, petType, species, birthDay string) error {
	return u.petRepository.Update(petId, name, petType, species, birthDay)
}

func (u *PetUsecase) Delete(petId string) error {
	return u.petRepository.Delete(petId)
}
