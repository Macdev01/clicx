package services

import (
	"go-backend/dto"
	"go-backend/logging"
	"go-backend/models"
	"go-backend/repository"

	"go.uber.org/zap"
)

type ModelProfileService struct {
	Repo repository.ModelProfileRepository
}

func NewModelProfileService(repo repository.ModelProfileRepository) *ModelProfileService {
	return &ModelProfileService{Repo: repo}
}

func (s *ModelProfileService) GetModelProfiles(limit, offset int) ([]dto.ModelProfileResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("GetModelProfiles called", zap.Int("limit", limit), zap.Int("offset", offset))
	profiles, err := s.Repo.FindAll(limit, offset)
	if err != nil {
		logger.Error("GetModelProfiles failed", zap.Error(err))
		return nil, err
	}
	resp := make([]dto.ModelProfileResponseDTO, 0, len(profiles))
	for _, p := range profiles {
		resp = append(resp, dto.ModelProfileResponseDTO{
			ID:     p.ID,
			UserID: p.UserID,
			Name:   p.Name,
			Bio:    p.Bio,
			Banner: p.Banner,
		})
	}
	logger.Debug("GetModelProfiles success", zap.Int("count", len(resp)))
	return resp, nil
}

func (s *ModelProfileService) CreateModelProfile(input *dto.ModelProfileCreateDTO) (dto.ModelProfileResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("CreateModelProfile called", zap.String("user_id", input.UserID.String()), zap.String("name", input.Name))
	_, err := s.Repo.FindByUserID(input.UserID)
	if err == nil {
		logger.Error("CreateModelProfile failed", zap.Error(err))
		return dto.ModelProfileResponseDTO{}, err // already exists
	}
	newProfile := models.ModelProfile{
		UserID: input.UserID,
		Name:   input.Name,
		Bio:    input.Bio,
		Banner: input.Banner,
	}
	if err := s.Repo.Create(&newProfile); err != nil {
		logger.Error("CreateModelProfile failed", zap.Error(err))
		return dto.ModelProfileResponseDTO{}, err
	}
	resp := dto.ModelProfileResponseDTO{
		ID:     newProfile.ID,
		UserID: newProfile.UserID,
		Name:   newProfile.Name,
		Bio:    newProfile.Bio,
		Banner: newProfile.Banner,
	}
	logger.Debug("CreateModelProfile success", zap.String("user_id", newProfile.UserID.String()), zap.String("name", newProfile.Name))
	return resp, nil
}
