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

	// Видео
	video := r.Group("/videos", middleware.UserMiddlewareGin())
	{
		video.POST("/upload", handlers.UploadVideo) // будет через сервис Bunny
		video.GET("/:id/stream", handlers.StreamVideo)
		video.DELETE("/:id", handlers.DeleteVideo)
	}

	// Админский контент
	adminContent := r.Group("/admin", middleware.UserMiddlewareGin())
	{
		adminContent.POST("/posts/upload", handlers.CreatePostWithMedia)
	}

	// Webhook Bunny для обновления статуса загрузки
	r.POST("/webhook/bunny", handlers.BunnyWebhook)

	//Plisio Payment
	r.POST("/payments/plisio", handlers.CreatePlisioInvoice)
	r.POST("/payments/plisio/callback", handlers.PlisioCallback)
	// r.GET("/payment/success", handlers.PaymentSuccessPage) // Uncomment when PaymentSuccessPage handler is implemented
	//r.GET("/payment/failed", handlers.PaymentFailedPage) // Uncomment when PaymentFailedPage handler is implemented

	// Migrate & Seed
	r.GET("/migrate", handlers.MigrateHandler)
	r.GET("/seed", handlers.SeedHandler)
}
