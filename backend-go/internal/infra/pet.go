package infra

import (
	"context"

	"github.com/google/uuid"
	"github.com/htanos/animalia/backend-go/ent"
	"github.com/htanos/animalia/backend-go/ent/pet"
	"github.com/htanos/animalia/backend-go/ent/user"
)

type PetRepository struct {
	db *ent.Client
}

func NewPetRepository(db *ent.Client) *PetRepository {
	return &PetRepository{
		db: db,
	}
}

func (r *PetRepository) GetByOwner(ownerID string) ([]*ent.Pet, error) {
	ownerUUID, err := uuid.Parse(ownerID)
	if err != nil {
		return nil, err
	}

	pets, err := r.db.Pet.Query().Where(pet.HasOwnerWith(user.ID(ownerUUID))).All(context.Background())
	if err != nil {
		return nil, err
	}
	return pets, nil
}

func (r *PetRepository) Create(name, petType, species, birthDay, fileKey, userID string) (*ent.Pet, error) {
	ownerID, err := uuid.Parse(userID)
	if err != nil {
		return nil, err
	}

	pet, err := r.db.Pet.Create().
		SetName(name).
		SetType(pet.Type(petType)).
		SetSpecies(pet.Species(species)).
		SetBirthDay(birthDay).
		SetImageKey(fileKey).
		SetOwnerID(ownerID).
		Save(context.Background())
	if err != nil {
		return nil, err
	}

	return pet, nil
}

func (r *PetRepository) Update(petID, name, petType, species, birthDay string) error {
	petUUID, err := uuid.Parse(petID)
	if err != nil {
		return err
	}

	_, err = r.db.Pet.UpdateOneID(petUUID).
		SetName(name).
		SetType(pet.Type(petType)).
		SetSpecies(pet.Species(species)).
		SetBirthDay(birthDay).
		Save(context.Background())
	return err
}

func (r *PetRepository) Delete(petID string) error {
	petUUID, err := uuid.Parse(petID)
	if err != nil {
		return err
	}

	return r.db.Pet.DeleteOneID(petUUID).Exec(context.Background())
}
