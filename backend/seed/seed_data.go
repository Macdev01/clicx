package seed

import (
	"log"
	"math/rand"
	"mvp-go-backend/config"
	"mvp-go-backend/database"
	"mvp-go-backend/models"
	"time"

	"github.com/bxcodec/faker/v4"
	"github.com/google/uuid"
)

func truncateAllTables() {
	err := database.DB.Exec(`
		TRUNCATE TABLE 
			admins, users, model_profiles, posts, orders, media, comments 
		RESTART IDENTITY CASCADE
	`).Error
	if err != nil {
		log.Fatalf("❌ Ошибка при очистке таблиц: %v", err)
	}
	log.Println("🧹 Таблицы очищены")
}

func RunUsers() []models.User {
	var users []models.User
	for i := 0; i < 10; i++ {
		users = append(users, models.User{
			Name:      faker.Name(),
			Email:     faker.Email(),
			Nickname:  faker.Username(),
			Password:  faker.Password(),
			Balance:   float64(rand.Intn(10000)) / 100.0,
			AvatarURL: faker.URL(),
		})
	}
	if err := database.DB.Create(&users).Error; err != nil {
		log.Fatalf("❌ Ошибка при создании Users: %v", err)
	}
	log.Printf("✅ Сидировано Users: %d", len(users))
	return users
}

func RunModelProfiles(users []models.User) []models.ModelProfile {
	var profiles []models.ModelProfile
	for i := 0; i < len(users); i++ {
		profiles = append(profiles, models.ModelProfile{
			UserID: users[i].ID,
			Bio:    faker.Sentence(),
			Banner: faker.URL(),
		})
	}
	if err := database.DB.Create(&profiles).Error; err != nil {
		log.Fatalf("❌ Ошибка при создании ModelProfiles: %v", err)
	}
	log.Printf("✅ Сидировано ModelProfiles: %d", len(profiles))
	return profiles
}

func RunAdmins() {
	admin := models.Admin{
		Name:      "Admin",
		Email:     "admin@example.com",
		Nickname:  "admin",
		Password:  "admin123",
		AvatarURL: faker.URL(),
		Balance:   999.99,
	}
	if err := database.DB.Create(&admin).Error; err != nil {
		log.Fatalf("❌ Ошибка при создании Admin: %v", err)
	}
	log.Println("✅ Сидирован 1 Admin")
}

func RunPosts(users []models.User, profiles []models.ModelProfile) []models.Post {
	var posts []models.Post

	for i := 0; i < 15; i++ {
		postID := uuid.New()
		post := models.Post{
			ID:          postID,
			UserID:      users[i%len(users)].ID,
			ModelID:     profiles[i%len(profiles)].ID,
			Text:        faker.Paragraph(),
			IsPremium:   rand.Intn(2) == 1,
			PublishedAt: time.Now().Add(-time.Duration(rand.Intn(720)) * time.Hour),
			LikesCount:  rand.Intn(1000),
			Media: []models.Media{
				{
					PostID:   postID,
					Type:     "video",
					URL:      "https://www.w3schools.com/html/mov_bbb.mp4",
					Cover:    "https://picsum.photos/600/400",
					Duration: rand.Intn(800),
				},
			},
		}
		posts = append(posts, post)
	}

	if err := database.DB.Create(&posts).Error; err != nil {
		log.Fatalf("❌ Ошибка при создании Posts: %v", err)
	}
	log.Printf("✅ Сидировано Posts: %d", len(posts))
	return posts
}

func RunMedia(posts []models.Post) []models.Media {
	var mediaList []models.Media

	for _, post := range posts {
		media := models.Media{
			PostID:   post.ID,
			Type:     "video",
			URL:      "https://www.w3schools.com/html/mov_bbb.mp4",
			Cover:    "https://picsum.photos/600/400",
			Duration: 720,
		}
		mediaList = append(mediaList, media)
	}

	if err := database.DB.Create(&mediaList).Error; err != nil {
		log.Fatalf("❌ Ошибка при создании Media: %v", err)
	}
	log.Printf("✅ Захардкожено Media: %d", len(mediaList))
	return mediaList
}

func RunOrders(users []models.User) {
	var orders []models.Order
	for i := 0; i < 20; i++ {
		orders = append(orders, models.Order{
			UserID: users[i%len(users)].ID,
			Summ:   rand.Intn(5000),
		})
	}
	if err := database.DB.Create(&orders).Error; err != nil {
		log.Fatalf("❌ Ошибка при создании Orders: %v", err)
	}
	log.Printf("✅ Сидировано Orders: %d", len(orders))
}

func RunComments(posts []models.Post, users []models.User) {
	var comments []models.Comment
	for i := 0; i < 30; i++ {
		comments = append(comments, models.Comment{
			PostID: posts[i%len(posts)].ID,
			UserID: users[i%len(users)].ID,
			Text:   faker.Sentence(),
			Time:   time.Now().Add(-time.Duration(rand.Intn(500)) * time.Minute),
		})
	}
	if err := database.DB.Create(&comments).Error; err != nil {
		log.Fatalf("❌ Ошибка при создании Comments: %v", err)
	}
	log.Printf("✅ Сидировано Comments: %d", len(comments))
}

func SeedData() {
	config.LoadConfig()
	database.InitDB()
	truncateAllTables()

	RunAdmins()
	users := RunUsers()
	profiles := RunModelProfiles(users)
	posts := RunPosts(users, profiles)
	//RunMedia(posts)
	RunOrders(users)
	RunComments(posts, users)

	log.Println("🎉 Сидирование завершено успешно.")
}
