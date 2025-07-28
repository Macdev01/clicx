package seed

import (
	"fmt"
	"math/rand"
	"time"

	"go-backend/config"
	"go-backend/database"
	"go-backend/models"
	"go-backend/utils"

	"go.uber.org/zap"

	"github.com/bxcodec/faker/v4"
	"github.com/google/uuid"
)

func truncateAllTables() error {
	err := database.DB.Exec(`
               TRUNCATE TABLE
                       users, model_profiles, posts, media, comments, likes,
                       orders, payments, purchases, saved_posts, follows, referrals, logs
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
	hashedAdminPassword, _ := utils.HashPassword("admin123")
	users = append(users, models.User{
		ID:        uuid.New(),
		Email:     "admin@example.com",
		Nickname:  "admin",
		Password:  hashedAdminPassword, // hashed
		Balance:   1000,
		AvatarURL: faker.URL(),
		IsAdmin:   true,
	})

	// Генерируем остальных пользователей
	for i := 0; i < 10; i++ {
		rawPassword := faker.Password()
		hashedPassword, _ := utils.HashPassword(rawPassword)
		users = append(users, models.User{
			ID:        uuid.New(),
			Email:     faker.Email(),
			Nickname:  faker.Username(),
			Password:  hashedPassword, // hashed
			Balance:   rand.Intn(1000),
			AvatarURL: faker.URL(),
		})
	}

	if err := database.DB.Create(&users).Error; err != nil {
		return nil, fmt.Errorf("ошибка при создании Users: %w", err)
	}

	// Генерируем реферальные коды
	for i := range users {
		code := utils.GenerateReferralCode(8)
		users[i].ReferralCode = &code
		database.DB.Model(&users[i]).Update("referral_code", code)
	}
	zap.S().Infof("Сидировано Users: %d (включая админа)", len(users))
	return users, nil
}

func RunModelProfiles(users []models.User) ([]models.ModelProfile, error) {
	var profiles []models.ModelProfile
	for _, user := range users {
		profiles = append(profiles, models.ModelProfile{
			ID:     uuid.New(),
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
					ID:       uuid.New(),
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
			ID:     uuid.New(),
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

func RunLikes(posts []models.Post, users []models.User) error {
	var likes []models.Like
	for i := 0; i < 20; i++ {
		likes = append(likes, models.Like{
			ID:     uuid.New(),
			UserID: users[rand.Intn(len(users))].ID,
			PostID: posts[rand.Intn(len(posts))].ID,
		})
	}
	return database.DB.Create(&likes).Error
}

func RunFollows(users []models.User) error {
	var follows []models.Follow
	for i := 1; i < len(users); i++ {
		follows = append(follows, models.Follow{
			ID:         uuid.New(),
			FollowerID: users[i].ID,
			FollowedID: users[0].ID,
		})
	}
	return database.DB.Create(&follows).Error
}

func RunOrders(users []models.User) ([]models.Order, error) {
	var orders []models.Order
	for _, u := range users {
		orders = append(orders, models.Order{
			ID:     uuid.New(),
			UserID: u.ID,
			Summ:   rand.Intn(500) + 10,
		})
	}
	return orders, database.DB.Create(&orders).Error
}

func RunPayments(orders []models.Order) error {
	var payments []models.Payment
	for i, o := range orders {
		payments = append(payments, models.Payment{
			ID:          uuid.New(),
			TxnID:       uuid.NewString(),
			OrderNumber: fmt.Sprintf("ORD-%d", i+1),
			Amount:      fmt.Sprintf("%d", o.Summ),
			Status:      "paid",
		})
	}
	return database.DB.Create(&payments).Error
}

func RunPurchases(posts []models.Post, users []models.User) error {
	var purchases []models.Purchase

	// Fetch all media and videos for use in purchases
	var media []models.Media
	database.DB.Find(&media)
	var videos []models.Video
	database.DB.Find(&videos)

	// Standard post purchases
	for i := 0; i < 10; i++ {
		purchases = append(purchases, models.Purchase{
			ID:        uuid.New(),
			UserID:    users[rand.Intn(len(users))].ID,
			PostID:    posts[rand.Intn(len(posts))].ID,
			Completed: true,
		})
	}

	// Per-photo purchases (if media exists)
	for i := 0; i < 5 && len(media) > 0; i++ {
		m := media[rand.Intn(len(media))]
		purchases = append(purchases, models.Purchase{
			ID:        uuid.New(),
			UserID:    users[rand.Intn(len(users))].ID,
			PostID:    m.PostID,
			PhotoID:   &m.ID,
			Completed: true,
		})
	}

	// Per-video purchases (if videos exist)
	for i := 0; i < 5 && len(videos) > 0; i++ {
		v := videos[rand.Intn(len(videos))]
		// Find a post to associate (random)
		var postID uuid.UUID
		if len(posts) > 0 {
			postID = posts[rand.Intn(len(posts))].ID
		} else {
			postID = uuid.New()
		}
		purchases = append(purchases, models.Purchase{
			ID:        uuid.New(),
			UserID:    users[rand.Intn(len(users))].ID,
			PostID:    postID,
			VideoID:   &v.ID, // Now correct type
			Completed: true,
		})
	}

	return database.DB.Create(&purchases).Error
}

func RunSavedPosts(posts []models.Post, users []models.User) error {
	var saved []models.SavedPost
	for i := 0; i < 10; i++ {
		saved = append(saved, models.SavedPost{
			ID:        uuid.New(),
			UserID:    users[rand.Intn(len(users))].ID,
			PostID:    posts[rand.Intn(len(posts))].ID,
			CreatedAt: time.Now(),
		})
	}
	return database.DB.Create(&saved).Error
}

func RunReferrals(users []models.User) error {
	if len(users) < 2 {
		return nil
	}
	var refs []models.Referral
	for i := 1; i < len(users); i++ {
		refs = append(refs, models.Referral{
			ID:            uuid.New(),
			UserID:        users[0].ID,
			ReferralCode:  *users[0].ReferralCode,
			InvitedUserID: users[i].ID,
			CreatedAt:     time.Now(),
		})
	}
	return database.DB.Create(&refs).Error
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
	if err := RunLikes(posts, users); err != nil {
		return err
	}
	if err := RunFollows(users); err != nil {
		return err
	}
	orders, err := RunOrders(users)
	if err != nil {
		return err
	}
	if err := RunPayments(orders); err != nil {
		return err
	}
	if err := RunPurchases(posts, users); err != nil {
		return err
	}
	if err := RunSavedPosts(posts, users); err != nil {
		return err
	}
	if err := RunReferrals(users); err != nil {
		return err
	}
	zap.L().Info("Сидирование завершено успешно")
	return nil
}
