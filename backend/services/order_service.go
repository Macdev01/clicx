package services

import (
	"go-backend/dto"
	"go-backend/models"
	"go-backend/repository"
)

type OrderService struct {
	Repo repository.OrderRepository
}

func NewOrderService(repo repository.OrderRepository) *OrderService {
	return &OrderService{Repo: repo}
}

func (s *OrderService) GetOrders(limit, offset int) ([]dto.OrderResponseDTO, error) {
	orders, err := s.Repo.FindAll(limit, offset)
	if err != nil {
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
	return resp, nil
}

func (s *OrderService) CreateOrder(input *dto.OrderCreateDTO) (dto.OrderResponseDTO, error) {
	order := models.Order{
		UserID: input.UserID,
		Summ:   input.Summ,
	}
	if err := s.Repo.Create(&order); err != nil {
		return dto.OrderResponseDTO{}, err
	}
	resp := dto.OrderResponseDTO{
		ID:     order.ID,
		UserID: order.UserID,
		Summ:   order.Summ,
	}
	return resp, nil
}
