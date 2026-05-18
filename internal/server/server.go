package server

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"pos-api/internal/auth"
	"pos-api/internal/categories"
	"pos-api/internal/parties"
	"pos-api/internal/sales"
)

type ServerImpl struct {
	db                *gorm.DB
	salesService      sales.SalesService
	authService       auth.AuthService
	partiesService    parties.PartiesService
	categoriesService categories.CategoriesService
}

func (s *ServerImpl) GetAuthService() auth.AuthService {
	return s.authService
}

func (s *ServerImpl) getStoreID(c *gin.Context) string {
	if storeID := c.GetHeader("X-Store-ID"); storeID != "" {
		return storeID
	}
	return "store-default"
}

func NewServer(db *gorm.DB) *ServerImpl {
	return &ServerImpl{
		db:                db,
		salesService:      sales.NewSalesService(db),
		authService:       auth.NewAuthService(db),
		partiesService:    parties.NewPartiesService(db),
		categoriesService: categories.NewCategoriesService(db),
	}
}
