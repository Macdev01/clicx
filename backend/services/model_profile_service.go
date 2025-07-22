package services

import (
	"go-backend/dto"
	"go-backend/models"
	"go-backend/repository"
)

type ModelProfileService struct {
	Repo repository.ModelProfileRepository
}

func NewModelProfileService(repo repository.ModelProfileRepository) *ModelProfileService {
	return &ModelProfileService{Repo: repo}
}

func (s *ModelProfileService) GetModelProfiles(limit, offset int) ([]dto.ModelProfileResponseDTO, error) {
	profiles, err := s.Repo.FindAll(limit, offset)
	if err != nil {
		return nil, err
	}
	resp := make([]dto.ModelProfileResponseDTO, 0, len(profiles))
	for _, profile := range profiles {
		resp = append(resp, dto.ModelProfileResponseDTO{
			ID:     profile.ID,
			UserID: profile.UserID,
			Name:   profile.Name,
			Bio:    profile.Bio,
			Banner: profile.Banner,
		})
	}
	return resp, nil
}

func (s *ModelProfileService) CreateModelProfile(input *dto.ModelProfileCreateDTO) (dto.ModelProfileResponseDTO, error) {
	_, err := s.Repo.FindByUserID(input.UserID)
	if err == nil {
		return dto.ModelProfileResponseDTO{}, err // already exists
	}
	newProfile := models.ModelProfile{
		UserID: input.UserID,
		Name:   input.Name,
		Bio:    input.Bio,
		Banner: input.Banner,
	}
	if err := s.Repo.Create(&newProfile); err != nil {
		return dto.ModelProfileResponseDTO{}, err
	}
	resp := dto.ModelProfileResponseDTO{
		ID:     newProfile.ID,
		UserID: newProfile.UserID,
		Name:   newProfile.Name,
		Bio:    newProfile.Bio,
		Banner: newProfile.Banner,
	}
	return resp, nil
}
