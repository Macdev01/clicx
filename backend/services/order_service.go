package services

import (
	"go-backend/dto"
	"go-backend/logging"
	"go-backend/models"
	"go-backend/repository"

	"go.uber.org/zap"
)

type OrderService struct {
	Repo repository.OrderRepository
}

func NewOrderService(repo repository.OrderRepository) *OrderService {
	return &OrderService{Repo: repo}
}

func (s *OrderService) GetOrders(limit, offset int) ([]dto.OrderResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("GetOrders called", zap.Int("limit", limit), zap.Int("offset", offset))
	orders, err := s.Repo.FindAll(limit, offset)
	if err != nil {
		logger.Error("GetOrders failed", zap.Error(err))
		return nil, err
	}
	resp := make([]dto.OrderResponseDTO, 0, len(orders))
	for _, order := range orders {
		resp = append(resp, dto.OrderResponseDTO{
			ID:     order.ID,
			UserID: order.UserID,
			Summ:   order.Summ,
		})
	}
	logger.Debug("GetOrders success", zap.Int("count", len(resp)))
	return resp, nil
}

func (s *OrderService) CreateOrder(input *dto.OrderCreateDTO) (dto.OrderResponseDTO, error) {
	logger := logging.GetLogger()
	logger.Debug("CreateOrder called", zap.String("user_id", input.UserID.String()), zap.Int("summ", input.Summ))
	order := models.Order{
		UserID: input.UserID,
		Summ:   input.Summ,
	}
	if err := s.Repo.Create(&order); err != nil {
		logger.Error("CreateOrder failed", zap.Error(err))
		return dto.OrderResponseDTO{}, err
	}
	resp := dto.OrderResponseDTO{
		ID:     order.ID,
		UserID: order.UserID,
		Summ:   order.Summ,
	}
	logger.Debug("CreateOrder success", zap.String("user_id", resp.UserID.String()), zap.Int("summ", resp.Summ))
	return resp, nil
}
