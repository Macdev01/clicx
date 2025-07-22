package handlers

import (
	"go-backend/models"
	"go-backend/services"
	"net/http"

	"go-backend/dto"
	"go-backend/utils"

	"strconv"

	"go-backend/database"
	"go-backend/repository"

	"github.com/gin-gonic/gin"
)

// GetUsers godoc
// @Summary      List users
// @Description  Returns all users
// @Tags         users
// @Produce      json
// @Success      200 {array} models.User
// @Router       /users [get]
func GetUsers(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)
	userRepo := &repository.GormUserRepository{DB: database.GetDB()}
	service := services.NewUserService(userRepo)
	resp, err := service.GetUsers(limit, offset)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

// GetUserByID godoc
// @Summary      Get user by ID
// @Tags         users
// @Produce      json
// @Param        id   path      int  true  "User ID"
// @Success      200 {object} models.User
// @Failure      404 {object} gin.H
// @Router       /users/{id} [get]
func GetUserByID(c *gin.Context) {
	id := c.Param("id")
	userRepo := &repository.GormUserRepository{DB: database.GetDB()}
	service := services.NewUserService(userRepo)
	resp, err := service.GetUserByID(id)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

// CreateUser godoc
// @Summary      Create user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        user  body      models.User  true  "User"
// @Success      201 {object} models.User
// @Failure      400 {object} gin.H
// @Router       /users [post]
func CreateUser(c *gin.Context) {
	var input dto.UserCreateDTO

	if err := c.ShouldBindJSON(&input); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := utils.ValidateStruct(input); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	userRepo := &repository.GormUserRepository{DB: database.GetDB()}
	service := services.NewUserService(userRepo)
	user := models.User{
		Email:    input.Email,
		Nickname: input.Nickname,
		Password: input.Password,
	}

	if err := service.CreateUser(&user); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	resp, _ := service.GetUserByID(strconv.Itoa(int(user.ID)))

	c.JSON(http.StatusCreated, resp)
}

// UpdateUser godoc
// @Summary      Update user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id    path      int         true  "User ID"
// @Param        user  body      models.User true  "User"
// @Success      200 {object} models.User
// @Failure      400 {object} gin.H
// @Router       /users/{id} [put]
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	userRepo := &repository.GormUserRepository{DB: database.GetDB()}
	service := services.NewUserService(userRepo)
	userModel, err := service.GetUserByID(id)
	if err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	var input dto.UserCreateDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if err := utils.ValidateStruct(input); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}
	user := models.User{
		ID:           userModel.ID,
		Email:        input.Email,
		Nickname:     input.Nickname,
		Password:     input.Password,
		Balance:      userModel.Balance,
		AvatarURL:    userModel.AvatarURL,
		IsAdmin:      userModel.IsAdmin,
		ReferralCode: userModel.ReferralCode,
		ReferredBy:   userModel.ReferredBy,
	}
	if err := service.UpdateUser(&user); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Could not update user"})
		return
	}
	resp, _ := service.GetUserByID(id)
	c.JSON(http.StatusOK, resp)
}

// DeleteUser godoc
// @Summary      Delete user
// @Tags         users
// @Produce      json
// @Param        id path int true "User ID"
// @Success      200 {object} gin.H
// @Router       /users/{id} [delete]
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	userRepo := &repository.GormUserRepository{DB: database.GetDB()}
	service := services.NewUserService(userRepo)
	if err := service.DeleteUser(id); err != nil {
		c.Error(err)
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Could not delete user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}
