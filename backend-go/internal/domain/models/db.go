package models

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDB initializes the database connection
func InitDB() {
	var err error

	// Get database URL from environment variable
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	// Configure GORM logger
	gormLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			LogLevel: logger.Info,
		},
	)

	// Connect to the database
	DB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Connected to database")

	// Enable vector extension
	err = DB.Exec(`CREATE EXTENSION IF NOT EXISTS vector;`).Error
	if err != nil {
		log.Fatalf("Failed to create vector extension: %v", err)
	}

	err = DB.Exec(`DROP TYPE IF EXISTS daily_task_type CASCADE;`).Error
	if err != nil {
		log.Fatalf("Failed to drop daily_task_type enum: %v", err)
	}

	err = DB.Exec(`DROP TYPE IF EXISTS pet_type CASCADE;`).Error
	if err != nil {
		log.Fatalf("Failed to drop pet_type enum: %v", err)
	}
	err = DB.Exec(`DROP TYPE IF EXISTS pet_species CASCADE;`).Error
	if err != nil {
		log.Fatalf("Failed to drop pet_species enum: %v", err)
	}

	err = DB.Exec(`CREATE TYPE daily_task_type AS ENUM ('eating', 'sleeping', 'playing');`).Error
	if err != nil {
		log.Fatalf("Failed to create daily_task_type enum: %v", err)
	}

	err = DB.Exec(`
	CREATE TYPE pet_type AS ENUM ('dog', 'cat');
	`).Error
	if err != nil {
		log.Fatalf("Failed to create pet_type enum: %v", err)
	}

	err = DB.Exec(`
	CREATE TYPE pet_species AS ENUM (
		'labrador',
		'poodle',
		'german_shepherd',
		'irish_wolfhound',
		'irish_setter',
		'afghan_hound',
		'american_cocker_spaniel',
		'american_staffordshire_terrier',
		'english_cocker_spaniel',
		'english_springer_spaniel',
		'west_highland_white_terrier',
		'welsh_corgi_pembroke',
		'airedale_terrier',
		'australian_shepherd',
		'kai_ken',
		'cavalier_king_charles_spaniel',
		'great_pyrenees',
		'keeshond',
		'cairn_terrier',
		'golden_retriever',
		'saluki',
		'shih_tzu',
		'shetland_sheepdog',
		'shiba_inu',
		'siberian_husky',
		'jack_russell_terrier',
		'scottish_terrier',
		'st_bernard',
		'dachshund',
		'dalmatian',
		'chinese_crested_dog',
		'chihuahua',
		'dogo_argentino',
		'doberman',
		'japanese_spitz',
		'bernese_mountain_dog',
		'pug',
		'basset_hound',
		'papillon',
		'bearded_collie',
		'beagle',
		'bichon_frise',
		'bouvier_des_flandres',
		'flat_coated_retriever',
		'bull_terrier',
		'bulldog',
		'french_bulldog',
		'pekinese',
		'bedlington_terrier',
		'belgian_tervuren',
		'border_collie',
		'boxer',
		'boston_terrier',
		'pomeranian',
		'borzoi',
		'maltese',
		'miniature_schnauzer',
		'miniature_pincher',
		'yorkshire_terrier',
		'rough_collie',
		'labrador_retriever',
		'rottweiler',
		'weimaraner',
		'american_curl',
		'american_shorthair',
		'egyptian_mau',
		'cornish_rex',
		'japanese_bobtail',
		'siamese',
		'singapura',
		'scottish_fold',
		'somali',
		'turkish_angora',
		'tonkinese',
		'norwegian_forest_cat',
		'burmilla',
		'british_shorthair',
		'household_pet',
		'persian',
		'bengal',
		'maine_coon',
		'munchkin',
		'ragdoll',
		'russian_blue'
	);
	`).Error
	if err != nil {
		log.Fatalf("Failed to create pet_species enum: %v", err)
	}

	// Auto-migrate the schema
	err = DB.AutoMigrate(&User{}, &Post{}, &Comment{}, &Like{}, &Pet{}, &FollowRelation{})
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed")
}
