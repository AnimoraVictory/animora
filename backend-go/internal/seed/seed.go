package seed

import (
	"context"
	"log"

	"github.com/htanos/animalia/backend-go/ent"
)

// SeedData populates the database with sample data
func SeedData(client *ent.Client) error {
	log.Println("Seeding database...")

	// Create users
	users, err := client.User.CreateBulk(
		client.User.Create().
			SetEmail("john.doe@example.com").
			SetName("John Doe").
			SetBio("I'm a pet shop owner").
			SetIconImageKey(""),
		client.User.Create().
			SetEmail("jane.smith@example.com").
			SetName("Jane Smith").
			SetBio("I'm a cat lover").
			SetIconImageKey(""),
		client.User.Create().
			SetEmail("alex.johnson@example.com").
			SetName("Alex Johnson").
			SetBio("I'm a dog lover").
			SetIconImageKey(""),
		client.User.Create().
			SetEmail("emily.wilson@example.com").
			SetName("Emily Wilson").
			SetBio("I'm a food lover").
			SetIconImageKey(""),
		client.User.Create().
			SetEmail("michael.brown@example.com").
			SetName("Michael Brown").
			SetBio("I'm a flower shop owner").
			SetIconImageKey(""),
		client.User.Create().
			SetEmail("tanomitsu2002@gmail.com").
			SetName("Mitsuru Hatano").
			SetBio("I'm a software engineer").
			SetIconImageKey(""),
		client.User.Create().
			SetEmail("aki.kaku0627@gmail.com").
			SetName("Akihiro Kaku").
			SetBio("I'm a software engineer").
			SetIconImageKey(""),
	).Save(context.Background())
	if err != nil {
		return err
	}

	// Create pets
	_, err = createPets(client, users)
	if err != nil {
		return err
	}

	// Create posts
	posts, err := createPosts(client, users)
	if err != nil {
		return err
	}

	// Create comments
	if err := createComments(client, posts, users); err != nil {
		return err
	}

	// Create likes
	if err := createLikes(client, posts, users); err != nil {
		return err
	}

	if err := createFollowRelations(client, users); err != nil {
		return err
	}

	log.Println("Database seeding completed successfully")
	return nil
}

// createPets creates sample pets for users
func createPets(client *ent.Client, users []*ent.User) ([]*ent.Pet, error) {
	log.Println("Creating sample pets...")

	pets := []*ent.PetCreate{
		client.Pet.Create().
			SetName("Max").
			SetBirthDay("2023-01-15").
			SetType("dog").
			SetSpecies("saluki").
			SetImageKey("pets/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg").
			SetOwner(users[0]),
		client.Pet.Create().
			SetName("Luna").
			SetBirthDay("2022-05-10").
			SetType("cat").
			SetSpecies("siamese").
			SetImageKey("pets/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg").
			SetOwner(users[1]),
		client.Pet.Create().
			SetName("Buddy").
			SetBirthDay("2021-11-22").
			SetType("dog").
			SetSpecies("beagle").
			SetImageKey("pets/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg").
			SetOwner(users[2]),
		client.Pet.Create().
			SetName("Coco").
			SetBirthDay("2023-03-05").
			SetType("dog").
			SetSpecies("poodle").
			SetImageKey("pets/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg").
			SetOwner(users[3]),
		client.Pet.Create().
			SetName("Rocky").
			SetBirthDay("2022-08-17").
			SetType("dog").
			SetSpecies("golden_retriever").
			SetImageKey("pets/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg").
			SetOwner(users[4]),
		client.Pet.Create().
			SetName("Milo").
			SetBirthDay("2023-02-28").
			SetType("cat").
			SetSpecies("munchkin").
			SetImageKey("pets/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg").
			SetOwner(users[0]),
	}

	return client.Pet.CreateBulk(pets...).Save(context.Background())
}

// createPosts creates sample posts by users
func createPosts(client *ent.Client, users []*ent.User) ([]*ent.Post, error) {
	log.Println("Creating sample posts...")

	posts := []*ent.PostCreate{
		client.Post.Create().
			SetCaption("Max's first day at the park").
			SetUser(users[0]).
			SetImageKey("posts/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg"),
		client.Post.Create().
			SetCaption("Luna's New Toy").
			SetUser(users[1]).
			SetImageKey("posts/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg"),
		client.Post.Create().
			SetCaption("Buddy's Birthday Celebration").
			SetUser(users[2]).
			SetImageKey("posts/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg"),
		client.Post.Create().
			SetCaption("Coco's New Hutch").
			SetUser(users[3]).
			SetImageKey("posts/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg"),
		client.Post.Create().
			SetCaption("Rocky's First Swimming Lesson").
			SetUser(users[4]).
			SetImageKey("posts/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg"),
		client.Post.Create().
			SetCaption("Milo's Favorite Napping Spot").
			SetUser(users[0]).
			SetImageKey("posts/26c4d55c-c16b-49b7-a4ef-5daa6ef2777f-BAB51C25-2C0A-4EC9-B7F5-96CAE90B0C48.jpg"),
	}

	return client.Post.CreateBulk(posts...).Save(context.Background())
}

// createComments creates sample comments on posts
func createComments(client *ent.Client, posts []*ent.Post, users []*ent.User) error {
	log.Println("Creating sample comments...")

	comments := []*ent.CommentCreate{
		client.Comment.Create().
			SetContent("He looks so happy! What breed is he?").
			SetPost(posts[0]).
			SetUser(users[1]),
		client.Comment.Create().
			SetContent("That's such a cute toy! Where did you get it?").
			SetPost(posts[1]).
			SetUser(users[2]),
		client.Comment.Create().
			SetContent("Happy birthday, Buddy! That cake looks delicious.").
			SetPost(posts[2]).
			SetUser(users[3]),
		client.Comment.Create().
			SetContent("What a nice hutch! Coco must be very happy.").
			SetPost(posts[3]).
			SetUser(users[4]),
		client.Comment.Create().
			SetContent("Swimming is great exercise for dogs! Rocky looks like he's having fun.").
			SetPost(posts[4]).
			SetUser(users[0]),
		client.Comment.Create().
			SetContent("Haha, classic cat behavior! Milo is adorable.").
			SetPost(posts[5]).
			SetUser(users[1]),
		client.Comment.Create().
			SetContent("I love the park too! We should arrange a playdate for our dogs.").
			SetPost(posts[0]).
			SetUser(users[2]),
	}

	_, err := client.Comment.CreateBulk(comments...).Save(context.Background())
	return err
}

// createLikes creates sample likes on posts
func createLikes(client *ent.Client, posts []*ent.Post, users []*ent.User) error {
	log.Println("Creating sample likes...")

	likes := []*ent.LikeCreate{
		client.Like.Create().
			SetPost(posts[0]).
			SetUser(users[1]),
		client.Like.Create().
			SetPost(posts[0]).
			SetUser(users[2]),
		client.Like.Create().
			SetPost(posts[1]).
			SetUser(users[0]),
		client.Like.Create().
			SetPost(posts[1]).
			SetUser(users[3]),
		client.Like.Create().
			SetPost(posts[2]).
			SetUser(users[0]),
		client.Like.Create().
			SetPost(posts[2]).
			SetUser(users[1]),
		client.Like.Create().
			SetPost(posts[3]).
			SetUser(users[2]),
		client.Like.Create().
			SetPost(posts[4]).
			SetUser(users[3]),
		client.Like.Create().
			SetPost(posts[5]).
			SetUser(users[1]),
		client.Like.Create().
			SetPost(posts[5]).
			SetUser(users[4]),
	}

	_, err := client.Like.CreateBulk(likes...).Save(context.Background())
	return err
}

// createFollowRelations creates sample follow relations between users
func createFollowRelations(client *ent.Client, users []*ent.User) error {
	log.Println("Creating sample follow relations...")

	followRelations := []*ent.FollowRelationCreate{
		client.FollowRelation.Create().
			SetFrom(users[0]).
			SetTo(users[1]),
		client.FollowRelation.Create().
			SetFrom(users[2]).
			SetTo(users[3]),
		client.FollowRelation.Create().
			SetFrom(users[4]).
			SetTo(users[3]),
		client.FollowRelation.Create().
			SetFrom(users[5]).
			SetTo(users[6]),
		client.FollowRelation.Create().
			SetFrom(users[6]).
			SetTo(users[5]),
	}

	_, err := client.FollowRelation.CreateBulk(followRelations...).Save(context.Background())
	return err
}
