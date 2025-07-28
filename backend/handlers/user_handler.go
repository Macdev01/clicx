package handlers

import (
	"go-backend/database"
	"go-backend/dto"
	"go-backend/models"
	"go-backend/repository"
	"go-backend/services"
	"go-backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetUsers godoc
// @Summary      List users
// @Description  Returns all users
// @Tags         users
// @Produce      json
// @Success      200 {array} models.User
// @Router       /users [get]
func GetUsers(c *gin.Context) {
	limit, offset := utils.GetPagination(c)
	userRepo := &repository.GormUserRepository{DB: database.GetDB()}
	service := services.NewUserService(userRepo)
	resp, err := service.GetUsers(limit, offset)
	if err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Internal server error", err)
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
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}
	userService := services.NewUserService(&repository.GormUserRepository{DB: database.GetDB()})
	resp, err := userService.GetUserByID(id)
	if err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "User not found", err)
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
	if !utils.BindAndValidate(c, &input) {
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
		utils.AbortWithError(c, http.StatusInternalServerError, "Could not create user", err)
		return
	}
	resp, _ := service.GetUserByID(user.ID)
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
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}
	userRepo := &repository.GormUserRepository{DB: database.GetDB()}
	service := services.NewUserService(userRepo)
	userModel, err := service.GetUserByID(id)
	if err != nil {
		utils.AbortWithError(c, http.StatusNotFound, "User not found", err)
		return
	}
	var input models.User
	if !utils.BindAndValidate(c, &input) {
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
		ReferredBy:   input.ReferredBy,
	}
	if err := service.UpdateUser(&user); err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Could not update user", err)
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
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.AbortWithError(c, http.StatusBadRequest, "Invalid user ID", err)
		return
	}
	userRepo := &repository.GormUserRepository{DB: database.GetDB()}
	service := services.NewUserService(userRepo)
	if err := service.DeleteUser(id); err != nil {
		utils.AbortWithError(c, http.StatusInternalServerError, "Could not delete user", err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}
