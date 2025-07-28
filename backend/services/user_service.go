package services

import (
	"go-backend/database"
	"go-backend/dto"
	"go-backend/logging"
	"go-backend/models"
	"go-backend/repository"
	"go-backend/utils"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type UserService struct {
	Repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{Repo: repo}
}

func (s *UserService) GetUsers(limit, offset int) ([]dto.UserResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("GetUsers called", zap.Int("limit", limit), zap.Int("offset", offset))
	users, err := s.Repo.FindAll(limit, offset)
	if err != nil {
		logger.Error("GetUsers failed", zap.Error(err))
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
	logger.Debug("GetUsers success", zap.Int("count", len(resp)))
	return resp, nil
}

func (s *UserService) GetUserByID(id uuid.UUID) (dto.UserResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("GetUserByID called", zap.String("id", id.String()))
	user, err := s.Repo.FindByID(id)
	if err != nil {
		logger.Error("GetUserByID failed", zap.String("id", id.String()), zap.Error(err))
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
	logger.Debug("GetUserByID success", zap.String("id", id.String()))
	return resp, nil
}

func (s *UserService) CreateUser(user *models.User) error {
	logger := logging.GetLogger()
	logger.Debug("CreateUser called", zap.String("email", user.Email))
	if user.Nickname == "" {
		user.Nickname = utils.GenerateNickname(user.Email)
	}
	if user.Password != "" {
		hashed, err := utils.HashPassword(user.Password)
		if err != nil {
			logger.Error("CreateUser hash password failed", zap.String("email", user.Email), zap.Error(err))
			return err
		}
		user.Password = hashed
	}
	if err := s.Repo.Create(user); err != nil {
		logger.Error("CreateUser repo create failed", zap.String("email", user.Email), zap.Error(err))
		return err
	}
	code := utils.GenerateReferralCode(8)
	user.ReferralCode = &code
	if err := database.DB.Model(user).Update("referral_code", code).Error; err != nil {
		logger.Error("CreateUser update referral_code failed", zap.String("email", user.Email), zap.Error(err))
		return err
	}
	logger.Info("CreateUser success", zap.String("email", user.Email), zap.String("user_id", user.ID.String()))
	return nil
}

func (s *UserService) UpdateUser(user *models.User) error {
	return s.Repo.Update(user)
}

func (s *UserService) DeleteUser(id uuid.UUID) error {
	return s.Repo.Delete(id)
}

func (s *UserService) GetOrCreateUser(email, avatar, password, refCode string) (*models.User, error) {
	user, err := s.Repo.FindByEmail(email)
	if err != nil {
		if err == repository.ErrUserNotFound {
			userPtr, err := s.Repo.CreateUser(email, avatar, password, refCode)
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
