package routes

import (
	"go-backend/database"
	"go-backend/handlers"
	"go-backend/middleware"
	"go-backend/services"

	"go.uber.org/zap"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func InitRoutes(r *gin.Engine, logger *zap.Logger) {
	// Initialize services and handlers
	videoService := services.NewVideoService(database.GetDB(), logger)
	handlers.InitVideoHandler(videoService)
	imageService := services.NewImageService(database.GetDB(), logger)
	handlers.InitImageHandler(imageService)

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	// Users (protected)
	users := r.Group("/users", middleware.UserMiddleware(logger))
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

	// Posts (GET public, others protected)
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

	// Orders (protected)
	orders := r.Group("/orders", middleware.UserMiddleware(logger))
	{
		orders.GET("", handlers.GetOrders)
		orders.GET("/:id", handlers.GetOrderByID)
		orders.POST("", handlers.CreateOrder)
		orders.PUT("/:id", handlers.UpdateOrder)
		orders.DELETE("/:id", handlers.DeleteOrder)
	}

	// Models (protected)
	models := r.Group("/models", middleware.UserMiddleware(logger))
	{
		models.GET("", handlers.GetModelProfiles)
		models.GET("/:id", handlers.GetModelProfileByID)
		models.POST("", handlers.CreateModelProfile)
		models.PUT("/:id", handlers.UpdateModelProfile)
		models.DELETE("/:id", handlers.DeleteModelProfile)
	}

	// Media / Videos (protected)
	videos := r.Group("/videos", middleware.UserMiddleware(logger))
	{
		videos.POST("/upload", handlers.UploadVideo)
		videos.GET("/:id", handlers.GetVideo)
		videos.DELETE("/:id", handlers.DeleteVideo)
	}

	images := r.Group("/images", middleware.UserMiddleware(logger))
	{
		images.POST("/upload", handlers.UploadImage)
		images.GET("/:id", handlers.GetImage)
		images.DELETE("/:id", handlers.DeleteImage)
	}

	// Saved videos for any user (admin or self)
	r.GET("/users/:id/saved-videos", handlers.GetSavedVideosByUserID)

	// Покупка контента (protected)
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
	r.GET("/models/:modelId/photos/:photoId/url", handlers.GetPhotoURL)
	r.GET("/models/:modelId/videos/:videoId/url", handlers.GetVideoURL)

	// Webhook Bunny
	r.POST("/webhook/bunny", handlers.BunnyWebhook)

	// Plisio Payment
	r.POST("/payments/plisio", handlers.CreatePlisioInvoice)
	r.POST("/payments/plisio/callback", handlers.PlisioCallback)

	// Технические маршруты
	r.GET("/migrate", handlers.MigrateHandler)
	r.GET("/seed", handlers.SeedHandler)
	r.GET("/metrics", handlers.GetMetrics)

	admin := r.Group("/admin", middleware.AdminMiddleware())
	admin.POST("/models/:modelId/portfolio/batch", handlers.BatchUploadPortfolio)
}
