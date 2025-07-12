package seed

import (
	"fmt"
	"go-backend/config"
	"go-backend/database"
	"go-backend/models"
	"log"
	"math/rand"
	"time"

	"github.com/bxcodec/faker/v4"
	"github.com/google/uuid"
)

func truncateAllTables() error {
	err := database.DB.Exec(`
		TRUNCATE TABLE 
			admins, users, model_profiles, posts, orders, media, comments 
		RESTART IDENTITY CASCADE
	`).Error
	if err != nil {
		return fmt.Errorf("ошибка при очистке таблиц: %w", err)
	}
	log.Println("🧹 Таблицы очищены")
	return nil
}

func RunUsers() ([]models.User, error) {
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
		return nil, fmt.Errorf("ошибка при создании Users: %w", err)
	}
	log.Printf("✅ Сидировано Users: %d", len(users))
	return users, nil
}

func RunModelProfiles(users []models.User) ([]models.ModelProfile, error) {
	var profiles []models.ModelProfile
	for _, user := range users {
		profiles = append(profiles, models.ModelProfile{
			UserID: user.ID,
			Bio:    faker.Sentence(),
			Banner: faker.URL(),
		})
	}
	if err := database.DB.Create(&profiles).Error; err != nil {
		return nil, fmt.Errorf("ошибка при создании ModelProfiles: %w", err)
	}
	log.Printf("✅ Сидировано ModelProfiles: %d", len(profiles))
	return profiles, nil
}

func RunAdmins() error {
	admin := models.Admin{
		Name:      "Admin",
		Email:     "admin@example.com",
		Nickname:  "admin",
		Password:  "admin123",
		AvatarURL: faker.URL(),
		Balance:   999.99,
	}
	if err := database.DB.Create(&admin).Error; err != nil {
		return fmt.Errorf("ошибка при создании Admin: %w", err)
	}
	log.Println("✅ Сидирован 1 Admin")
	return nil
}

func RunPosts(users []models.User, profiles []models.ModelProfile) ([]models.Post, error) {
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
		return nil, fmt.Errorf("ошибка при создании Posts: %w", err)
	}
	log.Printf("✅ Сидировано Posts: %d", len(posts))
	return posts, nil
}

func RunOrders(users []models.User) error {
	var orders []models.Order
	for i := 0; i < 20; i++ {
		orders = append(orders, models.Order{
			UserID: users[i%len(users)].ID,
			Summ:   rand.Intn(5000),
		})
	}
	if err := database.DB.Create(&orders).Error; err != nil {
		return fmt.Errorf("ошибка при создании Orders: %w", err)
	}
	log.Printf("✅ Сидировано Orders: %d", len(orders))
	return nil
}

func RunComments(posts []models.Post, users []models.User) error {
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
		return fmt.Errorf("ошибка при создании Comments: %w", err)
	}
	log.Printf("✅ Сидировано Comments: %d", len(comments))
	return nil
}

func SeedData() error {
	config.LoadConfig()
	database.InitDB()

	if err := truncateAllTables(); err != nil {
		return err
	}
	if err := RunAdmins(); err != nil {
		return err
	}
	users, err := RunUsers()
	if err != nil {
		return err
	}
	profiles, err := RunModelProfiles(users)
	if err != nil {
		return err
	}
	posts, err := RunPosts(users, profiles)
	if err != nil {
		return err
	}
	if err := RunOrders(users); err != nil {
		return err
	}
	if err := RunComments(posts, users); err != nil {
		return err
	}

	log.Println("🎉 Сидирование завершено успешно.")
	return nil
}
