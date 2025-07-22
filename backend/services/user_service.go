package services

import (
	"go-backend/database"
	"go-backend/dto"
	"go-backend/models"
	"go-backend/repository"
	"go-backend/utils"
	"strings"
)

type UserService struct {
	Repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{Repo: repo}
}

func (s *UserService) GetUsers(limit, offset int) ([]dto.UserResponseDTO, error) {
	users, err := s.Repo.FindAll(limit, offset)
	if err != nil {
		return nil, err
	}
	resp := make([]dto.UserResponseDTO, 0, len(users))
	for _, user := range users {
		resp = append(resp, dto.UserResponseDTO{
			ID:           user.ID,
			Email:        user.Email,
			Nickname:     user.Nickname,
			Balance:      user.Balance,
			AvatarURL:    user.AvatarURL,
			IsAdmin:      user.IsAdmin,
			ReferralCode: user.ReferralCode,
			ReferredBy:   user.ReferredBy,
		})
	}
	return resp, nil
}

func (s *UserService) GetUserByID(id string) (dto.UserResponseDTO, error) {
	user, err := s.Repo.FindByID(id)
	if err != nil {
		return dto.UserResponseDTO{}, err
	}
	resp := dto.UserResponseDTO{
		ID:           user.ID,
		Email:        user.Email,
		Nickname:     user.Nickname,
		Balance:      user.Balance,
		AvatarURL:    user.AvatarURL,
		IsAdmin:      user.IsAdmin,
		ReferralCode: user.ReferralCode,
		ReferredBy:   user.ReferredBy,
	}
	return resp, nil
}

func (s *UserService) CreateUser(user *models.User) error {
	if user.Nickname == "" {
		user.Nickname = generateNickname(user.Email)
	}
	if user.Password != "" {
		hashed, err := utils.HashPassword(user.Password)
		if err != nil {
			return err
		}
		user.Password = hashed
	}
	if err := s.Repo.Create(user); err != nil {
		return err
	}
	code := utils.GenerateReferralCode(8)
	user.ReferralCode = &code
	if err := database.DB.Model(user).Update("referral_code", code).Error; err != nil {
		return err
	}
	return nil
}

func generateNickname(email string) string {
	return "user_" + strings.Split(email, "@")[0]
}

func (s *UserService) UpdateUser(user *models.User) error {
	return s.Repo.Update(user)
}

func (s *UserService) DeleteUser(id string) error {
	return s.Repo.Delete(id)
}

func (s *UserService) GetOrCreateUser(email, avatar, refCode string) (*models.User, error) {
	user, err := s.Repo.FindByEmail(email)
	if err != nil {
		if err == repository.ErrUserNotFound {
			userPtr, err := s.Repo.CreateUser(email, avatar, refCode)
			if err != nil {
				return nil, err
			}
			return userPtr, nil
		} else {
			return nil, err
		}
	}
	return &user, nil
}
