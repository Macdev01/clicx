package routes

import (
	"go-backend/handlers"
	"go-backend/middleware"

	"go.uber.org/zap"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func InitRoutes(r *gin.Engine, logger *zap.Logger) {
	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	// Users
	users := r.Group("/users")
	{
		users.GET("", handlers.GetUsers)
		users.GET("/:id", handlers.GetUserByID)
		users.GET("/:id/model-profile", handlers.GetModelProfileByUserID)
		users.GET("/:id/saved-posts", handlers.GetSavedPosts)
		users.GET("/:id/purchased-posts", handlers.GetPurchasedPosts)
		users.POST("", handlers.CreateUser)
		users.PUT("/:id", handlers.UpdateUser)
		users.DELETE("/:id", handlers.DeleteUser)
	}

	// Posts
	posts := r.Group("/posts")
	{
		posts.GET("", handlers.GetPosts)
		posts.GET("/:id", handlers.GetPostByID)
		posts.POST("", middleware.UserMiddleware(logger), handlers.CreatePost)
		posts.PUT("/:id", middleware.UserMiddleware(logger), handlers.UpdatePost)
		posts.DELETE("/:id", middleware.UserMiddleware(logger), handlers.DeletePost)
		// Лайки для постов
		posts.POST("/:id/like", middleware.UserMiddleware(logger), handlers.ToggleLikePost)
		posts.POST("/:id/save", middleware.UserMiddleware(logger), handlers.ToggleSavePost)
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
	videos := r.Group("/videos", middleware.UserMiddleware(logger))
	{
		videos.POST("/upload", handlers.UploadVideo)    // Загрузка видео для поста
		videos.GET("/:id/stream", handlers.StreamVideo) // Получение ссылки для стрима
		videos.GET("/:id", handlers.GetMediaByID)       // Получить медиа по ID
		videos.DELETE("/:id", handlers.DeleteVideo)     // Удалить видео
	}

	// Покупка контента
	purchases := r.Group("/purchases", middleware.UserMiddleware(logger))
	{
		purchases.POST("", handlers.BuyContent)                   // Покупка
		purchases.GET("", handlers.GetPurchases)                  // История покупок
		purchases.PUT("/:id/complete", handlers.CompletePurchase) // Завершить покупку
	}

	r.POST("/follow/:id", middleware.UserMiddleware(logger), handlers.FollowUser)
	r.DELETE("/follow/:id", middleware.UserMiddleware(logger), handlers.UnfollowUser)
	r.GET("/followers", middleware.UserMiddleware(logger), handlers.GetFollowers)
	r.GET("/referrals", middleware.UserMiddleware(logger), handlers.GetReferrals)

	// Админские маршруты
	admin := r.Group("/admin", middleware.UserMiddleware(logger))
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
	r.GET("/metrics", handlers.GetMetrics)
}
