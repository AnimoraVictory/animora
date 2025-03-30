package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

// Pet holds the schema definition for the Pet entity.
type Pet struct {
	ent.Schema
}

// Fields of the Pet.
func (Pet) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New).Unique(),
		field.String("name").NotEmpty(),
		field.String("birth_day").NotEmpty(),
		field.Enum("type").Values("dog", "cat"),
		field.Enum("species").Values(
			// Dog species
			"labrador", "poodle", "german_shepherd", "irish_wolfhound", "irish_setter",
			"afghan_hound", "american_cocker_spaniel", "american_staffordshire_terrier",
			"english_cocker_spaniel", "english_springer_spaniel", "west_highland_white_terrier",
			"welsh_corgi_pembroke", "airedale_terrier", "australian_shepherd", "kai_ken",
			"cavalier_king_charles_spaniel", "great_pyrenees", "keeshond", "cairn_terrier",
			"golden_retriever", "saluki", "shih_tzu", "shetland_sheepdog", "shiba_inu",
			"siberian_husky", "jack_russell_terrier", "scottish_terrier", "st_bernard",
			"dachshund", "dalmatian", "chinese_crested_dog", "chihuahua", "dogo_argentino",
			"doberman", "japanese_spitz", "bernese_mountain_dog", "pug", "basset_hound",
			"papillon", "bearded_collie", "beagle", "bichon_frise", "bouvier_des_flandres",
			"flat_coated_retriever", "bull_terrier", "bulldog", "french_bulldog", "pekinese",
			"bedlington_terrier", "belgian_tervuren", "border_collie", "boxer", "boston_terrier",
			"pomeranian", "borzoi", "maltese", "miniature_schnauzer", "miniature_pincher",
			"yorkshire_terrier", "rough_collie", "labrador_retriever", "rottweiler", "weimaraner",
			// Cat species
			"siamese", "persian", "maine_coon", "american_curl", "american_shorthair",
			"egyptian_mau", "cornish_rex", "japanese_bobtail", "singapura", "scottish_fold",
			"somali", "turkish_angora", "tonkinese", "norwegian_forest_cat", "burmilla",
			"british_shorthair", "household_pet", "bengal", "munchkin", "ragdoll", "russian_blue",
		),
		field.String("image_key").NotEmpty(),
		field.Time("created_at").Default(time.Now),
		field.Time("deleted_at").Optional(),
	}
}

// Edges of the Pet.
func (Pet) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("owner", User.Type).Ref("pets").Unique().Required(),
	}
}
