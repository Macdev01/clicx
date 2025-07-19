package routes

import (
	"go-backend/handlers"
	"go-backend/middleware"

	"github.com/gin-gonic/gin"
)

func InitRoutes(r *gin.Engine) {
	// Users
	users := r.Group("/users")
	{
		users.GET("", handlers.GetUsers)
		users.GET("/:id", handlers.GetUserByID)
		users.GET("/:id/model-profile", handlers.GetModelProfileByUserID)
		users.POST("", handlers.CreateUser)
		users.PUT("/:id", handlers.UpdateUser)
		users.DELETE("/:id", handlers.DeleteUser)
	}

	// Posts
	posts := r.Group("/posts")
	{
		posts.GET("", handlers.GetPosts)
		posts.GET("/:id", handlers.GetPostByID)
		posts.POST("", handlers.CreatePost)
		posts.PUT("/:id", handlers.UpdatePost)
		posts.DELETE("/:id", handlers.DeletePost)
		// Лайки для постов
		posts.POST("/:id/like", middleware.UserMiddlewareGin(), handlers.ToggleLikePost)
	}

	// Orders
	orders := r.Group("/orders")
	{
		orders.GET("", handlers.GetOrders)
		orders.GET("/:id", handlers.GetOrderByID)
		orders.POST("", handlers.CreateOrder)
		orders.PUT("/:id", handlers.UpdateOrder)
		orders.DELETE("/:id", handlers.DeleteOrder)
	}

	// Models
	models := r.Group("/models")
	{
		models.GET("", handlers.GetModelProfiles)
		models.GET("/:id", handlers.GetModelProfileByID)
		models.POST("", handlers.CreateModelProfile)
		models.PUT("/:id", handlers.UpdateModelProfile)
		models.DELETE("/:id", handlers.DeleteModelProfile)
	}

	// Media / Videos
	videos := r.Group("/videos", middleware.UserMiddlewareGin())
	{
		videos.POST("/upload", handlers.UploadVideo)    // Загрузка видео для поста
		videos.GET("/user", handlers.GetUserVideos)     // Контент текущего пользователя
		videos.GET("/:id/stream", handlers.StreamVideo) // Получение ссылки для стрима
		videos.GET("/:id", handlers.GetMediaByID)       // Получить медиа по ID
		videos.DELETE("/:id", handlers.DeleteVideo)     // Удалить видео
	}

	// Покупка контента
	purchases := r.Group("/purchases", middleware.UserMiddlewareGin())
	{
		purchases.POST("", handlers.BuyContent)  // Покупка
		purchases.GET("", handlers.GetPurchases) // История покупок
	}

	// Админские маршруты
	admin := r.Group("/admin", middleware.UserMiddlewareGin())
	{
		admin.POST("/posts/upload", handlers.CreatePostWithMedia) // Создать пост с медиа
	}

	// Webhook Bunny
	r.POST("/webhook/bunny", handlers.BunnyWebhook)

	// Plisio Payment
	r.POST("/payments/plisio", handlers.CreatePlisioInvoice)
	r.POST("/payments/plisio/callback", handlers.PlisioCallback)

	// Технические маршруты
	r.GET("/migrate", handlers.MigrateHandler)
	r.GET("/seed", handlers.SeedHandler)
}
