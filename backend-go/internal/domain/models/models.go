package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID           string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email        string    `json:"email" gorm:"unique"`
	Name         string    `json:"name"`
	Bio          string    `json:"bio"`
	IconImageKey string    `json:"iconImageKey"`
	Posts        []Post    `json:"posts,omitempty" gorm:"foreignKey:UserID"`
	Comments     []Comment `json:"comments,omitempty" gorm:"foreignKey:UserID"`
	Likes        []Like    `json:"likes,omitempty" gorm:"foreignKey:UserID"`
	Pets         []Pet     `json:"pets,omitempty" gorm:"foreignKey:OwnerID"`
	CreatedAt    time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Post represents a post in the system
type Post struct {
	ID           string           `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Caption      string           `json:"caption"`
	ImageKey     string           `json:"imageKey"`
	UserID       string           `json:"userId"`
	User         User             `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Comments     []Comment        `json:"comments,omitempty" gorm:"foreignKey:PostID"`
	Likes        []Like           `json:"likes,omitempty" gorm:"foreignKey:PostID"`
	CreatedAt    time.Time        `json:"createdAt" gorm:"autoCreateTime"`
	DeletedAt    gorm.DeletedAt   `json:"deletedAt"`
	TextFeature  *pq.Float64Array `json:"textFeature,omitempty"  gorm:"type:vector(768)"`
	ImageFeature *pq.Float64Array `json:"imageFeature,omitempty" gorm:"type:vector(768)"`
}

// Comment represents a comment on a post
type Comment struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Content   string    `json:"content"`
	PostID    string    `json:"postId"`
	Post      Post      `json:"post,omitempty" gorm:"foreignKey:PostID"`
	UserID    string    `json:"userId"`
	User      User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Like represents a like on a post
type Like struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	PostID    string    `json:"postId"`
	Post      Post      `json:"post,omitempty" gorm:"foreignKey:PostID"`
	UserID    string    `json:"userId"`
	User      User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// Pet represents a pet in the system
type Pet struct {
	ID        string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name      string         `json:"name"`
	BirthDay  string         `json:"birthDay"`
	Type      PetType        `json:"type" gorm:"type:pet_type"`
	Species   string         `json:"species" gorm:"type:pet_species"`
	ImageKey  string         `json:"imageKey"`
	OwnerID   string         `json:"ownerId"`
	Owner     User           `json:"owner,omitempty" gorm:"foreignKey:OwnerID"`
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt"`
}

type FollowRelation struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	FromID    string    `json:"fromId" gorm:"uniqueIndex:idx_fromId_toId"`
	ToID      string    `json:"toId" gorm:"uniqueIndex:idx_fromId_toId"`
	Follower  User      `json:"follower,omitempty" gorm:"foreignKey:FromID;constraint:OnDelete:CASCADE;"`
	Followed  User      `json:"followed,omitempty" gorm:"foreignKey:ToID;constraint:OnDelete:CASCADE;"`
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

type PetType string

const (
	PetTypeDog PetType = "dog"
	PetTypeCat PetType = "cat"
)

// 犬用の品種を示す型
type DogSpecies string

const (
	DogSpeciesLabrador                     DogSpecies = "labrador"
	DogSpeciesPoodle                       DogSpecies = "poodle"
	DogSpeciesGermanShepherd               DogSpecies = "german_shepherd"
	DogSpeciesIrishWolfhound               DogSpecies = "irish_wolfhound"
	DogSpeciesIrishSetter                  DogSpecies = "irish_setter"
	DogSpeciesAfghanHound                  DogSpecies = "afghan_hound"
	DogSpeciesAmericanCockerSpaniel        DogSpecies = "american_cocker_spaniel"
	DogSpeciesAmericanStaffordshireTerrier DogSpecies = "american_staffordshire_terrier"
	DogSpeciesEnglishCockerSpaniel         DogSpecies = "english_cocker_spaniel"
	DogSpeciesEnglishSpringerSpaniel       DogSpecies = "english_springer_spaniel"
	DogSpeciesWestHighlandWhiteTerrier     DogSpecies = "west_highland_white_terrier"
	DogSpeciesWelshCorgiPembroke           DogSpecies = "welsh_corgi_pembroke"
	DogSpeciesAiredaleTerrier              DogSpecies = "airedale_terrier"
	DogSpeciesAustralianShepherd           DogSpecies = "australian_shepherd"
	DogSpeciesKaiKen                       DogSpecies = "kai_ken"
	DogSpeciesCavalierKingCharlesSpaniel   DogSpecies = "cavalier_king_charles_spaniel"
	DogSpeciesGreatPyrenees                DogSpecies = "great_pyrenees"
	DogSpeciesKeeshond                     DogSpecies = "keeshond"
	DogSpeciesCairnTerrier                 DogSpecies = "cairn_terrier"
	DogSpeciesGoldenRetriever              DogSpecies = "golden_retriever"
	DogSpeciesSaluki                       DogSpecies = "saluki"
	DogSpeciesShihTzu                      DogSpecies = "shih_tzu"
	DogSpeciesShetlandSheepdog             DogSpecies = "shetland_sheepdog"
	DogSpeciesShibaInu                     DogSpecies = "shiba_inu"
	DogSpeciesSiberianHusky                DogSpecies = "siberian_husky"
	DogSpeciesJackRussellTerrier           DogSpecies = "jack_russell_terrier"
	DogSpeciesScottishTerrier              DogSpecies = "scottish_terrier"
	DogSpeciesStBernard                    DogSpecies = "st_bernard"
	DogSpeciesDachshund                    DogSpecies = "dachshund"
	DogSpeciesDalmatian                    DogSpecies = "dalmatian"
	DogSpeciesChineseCrestedDog            DogSpecies = "chinese_crested_dog"
	DogSpeciesChihuahua                    DogSpecies = "chihuahua"
	DogSpeciesDogoArgentino                DogSpecies = "dogo_argentino"
	DogSpeciesDoberman                     DogSpecies = "doberman"
	DogSpeciesJapaneseSpitz                DogSpecies = "japanese_spitz"
	DogSpeciesBerneseMountainDog           DogSpecies = "bernese_mountain_dog"
	DogSpeciesPug                          DogSpecies = "pug"
	DogSpeciesBassetHound                  DogSpecies = "basset_hound"
	DogSpeciesPapillon                     DogSpecies = "papillon"
	DogSpeciesBeardedCollie                DogSpecies = "bearded_collie"
	DogSpeciesBeagle                       DogSpecies = "beagle"
	DogSpeciesBichonFrise                  DogSpecies = "bichon_frise"
	DogSpeciesBouvierDesFlandres           DogSpecies = "bouvier_des_flandres"
	DogSpeciesFlatCoatedRetriever          DogSpecies = "flat_coated_retriever"
	DogSpeciesBullTerrier                  DogSpecies = "bull_terrier"
	DogSpeciesBulldog                      DogSpecies = "bulldog"
	DogSpeciesFrenchBulldog                DogSpecies = "french_bulldog"
	DogSpeciesPekinese                     DogSpecies = "pekinese"
	DogSpeciesBedlingtonTerrier            DogSpecies = "bedlington_terrier"
	DogSpeciesBelgianTervuren              DogSpecies = "belgian_tervuren"
	DogSpeciesBorderCollie                 DogSpecies = "border_collie"
	DogSpeciesBoxer                        DogSpecies = "boxer"
	DogSpeciesBostonTerrier                DogSpecies = "boston_terrier"
	DogSpeciesPomeranian                   DogSpecies = "pomeranian"
	DogSpeciesBorzoi                       DogSpecies = "borzoi"
	DogSpeciesMaltese                      DogSpecies = "maltese"
	DogSpeciesMiniatureSchnauzer           DogSpecies = "miniature_schnauzer"
	DogSpeciesMiniaturePincher             DogSpecies = "miniature_pincher"
	DogSpeciesYorkshireTerrier             DogSpecies = "yorkshire_terrier"
	DogSpeciesRoughCollie                  DogSpecies = "rough_collie"
	DogSpeciesLabradorRetriever            DogSpecies = "labrador_retriever"
	DogSpeciesRottweiler                   DogSpecies = "rottweiler"
	DogSpeciesWeimaraner                   DogSpecies = "weimaraner"
)

// 猫用の品種を示す型
type CatSpecies string

const (
	CatSpeciesSiamese            CatSpecies = "siamese"
	CatSpeciesPersian            CatSpecies = "persian"
	CatSpeciesMaineCoon          CatSpecies = "maine_coon"
	CatSpeciesAmericanCurl       CatSpecies = "american_curl"
	CatSpeciesAmericanShorthair  CatSpecies = "american_shorthair"
	CatSpeciesEgyptianMau        CatSpecies = "egyptian_mau"
	CatSpeciesCornishRex         CatSpecies = "cornish_rex"
	CatSpeciesJapaneseBobtail    CatSpecies = "japanese_bobtail"
	CatSpeciesSingapura          CatSpecies = "singapura"
	CatSpeciesScottishFold       CatSpecies = "scottish_fold"
	CatSpeciesSomali             CatSpecies = "somali"
	CatSpeciesTurkishAngora      CatSpecies = "turkish_angora"
	CatSpeciesTonkinese          CatSpecies = "tonkinese"
	CatSpeciesNorwegianForestCat CatSpecies = "norwegian_forest_cat"
	CatSpeciesBurmilla           CatSpecies = "burmilla"
	CatSpeciesBritishShorthair   CatSpecies = "british_shorthair"
	CatSpeciesHouseholdPet       CatSpecies = "household_pet"
	CatSpeciesBengal             CatSpecies = "bengal"
	CatSpeciesMunchkin           CatSpecies = "munchkin"
	CatSpeciesRagdoll            CatSpecies = "ragdoll"
	CatSpeciesRussianBlue        CatSpecies = "russian_blue"
)

var ValidSpeciesByPetType = map[PetType][]string{
	PetTypeDog: {string(DogSpeciesLabrador), string(DogSpeciesPoodle), string(DogSpeciesGermanShepherd)},
	PetTypeCat: {string(CatSpeciesSiamese), string(CatSpeciesPersian), string(CatSpeciesMaineCoon)},
}

// BeforeCreate is a GORM hook that generates a UUID for the ID field if it's empty
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

// BeforeCreate is a GORM hook that generates a UUID for the ID field if it's empty
func (p *Post) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

// BeforeCreate is a GORM hook that generates a UUID for the ID field if it's empty
func (c *Comment) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

// BeforeCreate is a GORM hook that generates a UUID for the ID field if it's empty
func (p *Pet) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

func (f *FollowRelation) BeforeCreate(tx *gorm.DB) error {
	if f.ID == "" {
		f.ID = uuid.New().String()
	}
	return nil
}

// TableName specifies the table name for the Like model
func (Like) TableName() string {
	return "likes"
}

// UniqueConstraint ensures that a user can only like a post once
func (Like) UniqueConstraint() string {
	return "unique_post_user"
}
