package seed

import (
	"fmt"
	"go-backend/config"
	"go-backend/database"
	"go-backend/models"
	"math/rand"
	"time"

	"go.uber.org/zap"

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
	zap.L().Info("Таблицы очищены")
	return nil
}

func RunUsers() ([]models.User, error) {
	var users []models.User

	// Добавляем админа первым
	users = append(users, models.User{
		Email:     "admin@example.com",
		Nickname:  "admin",
		Password:  "admin123", // ❗ лучше хэшировать
		Balance:   1000,
		AvatarURL: faker.URL(),
		IsAdmin:   true,
	})

	// Генерируем остальных пользователей
	for i := 0; i < 10; i++ {
		users = append(users, models.User{
			Email:     faker.Email(),
			Nickname:  faker.Username(),
			Password:  faker.Password(),
			Balance:   rand.Intn(1000),
			AvatarURL: faker.URL(),
		})
	}

	if err := database.DB.Create(&users).Error; err != nil {
		return nil, fmt.Errorf("ошибка при создании Users: %w", err)
	}
	zap.S().Infof("Сидировано Users: %d (включая админа)", len(users))
	return users, nil
}

func RunModelProfiles(users []models.User) ([]models.ModelProfile, error) {
	var profiles []models.ModelProfile
	for _, user := range users {
		profiles = append(profiles, models.ModelProfile{
			UserID: user.ID,
			Name:   faker.Name(),
			Bio:    faker.Sentence(),
			Banner: faker.URL(),
		})
	}
	if err := database.DB.Create(&profiles).Error; err != nil {
		return nil, fmt.Errorf("ошибка при создании ModelProfiles: %w", err)
	}
	zap.S().Infof("Сидировано ModelProfiles: %d", len(profiles))
	return profiles, nil
}

func RunPosts(users []models.User, profiles []models.ModelProfile) ([]models.Post, error) {
	var posts []models.Post
	for i := 0; i < 15; i++ {
		postID := uuid.New() // генерируем UUID для поста
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
					PostID:   postID, // UUID
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

	zap.S().Infof("Сидировано Posts: %d", len(posts))
	return posts, nil
}

func RunComments(posts []models.Post, users []models.User) error {
	var comments []models.Comment
	for i := 0; i < 30; i++ {
		comments = append(comments, models.Comment{
			PostID: posts[i%len(posts)].ID, // UUID
			UserID: users[i%len(users)].ID,
			Text:   faker.Sentence(),
			Time:   time.Now().Add(-time.Duration(rand.Intn(500)) * time.Minute),
		})
	}
	if err := database.DB.Create(&comments).Error; err != nil {
		return fmt.Errorf("ошибка при создании Comments: %w", err)
	}
	zap.S().Infof("Сидировано Comments: %d", len(comments))
	return nil
}

func SeedData() error {
	config.LoadConfig()
	database.InitDB()

	if err := truncateAllTables(); err != nil {
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
	if err := RunComments(posts, users); err != nil {
		return err
	}
	zap.L().Info("Сидирование завершено успешно")
	return nil
}
