package items

import (
	"errors"
	"log"
	"os"
	"strings"

	"gorm.io/gorm"
	"pos-api/internal/models"
)

type ItemsService interface {
	GetProducts(q string, categoryID string, isActive *bool, lowStock *bool, page int, perPage int) ([]models.Product, int64, error)
	CreateProduct(product *models.Product) (*models.Product, error)
	GetProductByID(id string) (*models.Product, error)
	UpdateProduct(id string, product *models.Product) (*models.Product, error)
	DeleteProduct(id string) error
	BulkAction(action string, ids []string) error
	BulkExport() ([]models.Product, error)
}

type itemsService struct {
	db *gorm.DB
}

func NewItemsService(db *gorm.DB) ItemsService {
	return &itemsService{db: db}
}

func (s *itemsService) GetProducts(q string, categoryID string, isActive *bool, lowStock *bool, page int, perPage int) ([]models.Product, int64, error) {
	var products []models.Product
	query := s.db.Model(&models.Product{})

	if q != "" {
		search := "%" + strings.ToLower(q) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(sku) LIKE ? OR LOWER(item_code) LIKE ? OR LOWER(hsn_code) LIKE ? OR LOWER(barcode) LIKE ?", search, search, search, search, search)
	}

	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	if isActive != nil {
		query = query.Where("is_active = ?", *isActive)
	}

	if lowStock != nil && *lowStock {
		query = query.Where("stock_quantity <= low_stock_quantity AND low_stock_warning = ?", true)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		log.Printf("[ItemsService] Error counting products: %v", err)
		return nil, 0, err
	}

	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 20
	}

	if err := query.Offset((page - 1) * perPage).Limit(perPage).Order("created_at desc").Find(&products).Error; err != nil {
		log.Printf("[ItemsService] Error listing products: %v", err)
		return nil, 0, err
	}

	return products, total, nil
}

func (s *itemsService) CreateProduct(product *models.Product) (*models.Product, error) {
	log.Printf("[ItemsService] Creating new product: %s", product.Name)

	if strings.TrimSpace(product.Name) == "" {
		return nil, errors.New("product name is required")
	}

	if product.SKU != "" {
		// Active check
		var activeExisting models.Product
		if err := s.db.Where("sku = ?", product.SKU).First(&activeExisting).Error; err == nil {
			return nil, errors.New("a product with this SKU already exists")
		}

		// Unscoped soft-deleted reuse check
		var existingSoftDeleted models.Product
		if err := s.db.Unscoped().Where("sku = ? AND deleted_at IS NOT NULL", product.SKU).First(&existingSoftDeleted).Error; err == nil {
			envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
			allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
			if allowReuse {
				log.Printf("[ItemsService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted product with same SKU %s. Hard deleting to resolve unique constraint conflict.", product.SKU)
				if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
					log.Printf("[ItemsService] Error purging soft-deleted record: %v", err)
					return nil, err
				}
			} else {
				log.Printf("[ItemsService] ALLOW_SOFT_DELETED_REUSE is disabled. Rejecting creation due to conflict with soft-deleted product: %s", product.SKU)
				return nil, errors.New("An Item with these details has already been deleted, please use different details to create the item")
			}
		}
	}

	if err := s.db.Create(product).Error; err != nil {
		log.Printf("[ItemsService] Error creating product: %v", err)
		return nil, err
	}
	return product, nil
}

func (s *itemsService) GetProductByID(id string) (*models.Product, error) {
	var product models.Product
	if err := s.db.Where("id = ?", id).First(&product).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (s *itemsService) UpdateProduct(id string, product *models.Product) (*models.Product, error) {
	log.Printf("[ItemsService] Updating product: %s", id)
	var existing models.Product
	if err := s.db.Where("id = ?", id).First(&existing).Error; err != nil {
		return nil, err
	}

	if product.SKU != "" && product.SKU != existing.SKU {
		// Active check
		var activeExisting models.Product
		if err := s.db.Where("sku = ? AND id != ?", product.SKU, id).First(&activeExisting).Error; err == nil {
			return nil, errors.New("a product with this SKU already exists")
		}

		// Unscoped soft-deleted reuse check
		var existingSoftDeleted models.Product
		if err := s.db.Unscoped().Where("sku = ? AND deleted_at IS NOT NULL", product.SKU).First(&existingSoftDeleted).Error; err == nil {
			envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
			allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
			if allowReuse {
				log.Printf("[ItemsService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted product with same SKU %s during update. Hard deleting.", product.SKU)
				if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
					log.Printf("[ItemsService] Error purging soft-deleted record during update: %v", err)
					return nil, err
				}
			} else {
				log.Printf("[ItemsService] ALLOW_SOFT_DELETED_REUSE is disabled. Rejecting update due to conflict with soft-deleted product: %s", product.SKU)
				return nil, errors.New("An Item with these details has already been deleted, please use different details to create the item")
			}
		}
	}

	if product.Name != "" {
		existing.Name = product.Name
	}
	if product.SKU != "" {
		existing.SKU = product.SKU
	}
	existing.Description = product.Description
	existing.ProductType = product.ProductType
	existing.CategoryID = product.CategoryID
	existing.EnableBatching = product.EnableBatching
	existing.ItemCode = product.ItemCode
	existing.HSNCode = product.HSNCode
	existing.MeasuringUnit = product.MeasuringUnit
	existing.StockQuantity = product.StockQuantity
	existing.LowStockWarning = product.LowStockWarning
	existing.LowStockQuantity = product.LowStockQuantity
	existing.SalePrice = product.SalePrice
	existing.WholesalePrice = product.WholesalePrice
	existing.SalePriceTaxInclusive = product.SalePriceTaxInclusive
	existing.PurchasePrice = product.PurchasePrice
	existing.PurchasePriceTaxInclusive = product.PurchasePriceTaxInclusive
	existing.GSTRate = product.GSTRate
	existing.DiscountOnSale = product.DiscountOnSale
	existing.Barcode = product.Barcode
	existing.ExpiryDate = product.ExpiryDate
	existing.IsDraft = product.IsDraft
	existing.IsActive = product.IsActive

	if err := s.db.Save(&existing).Error; err != nil {
		log.Printf("[ItemsService] Error saving product: %v", err)
		return nil, err
	}
	return &existing, nil
}

func (s *itemsService) DeleteProduct(id string) error {
	log.Printf("[ItemsService] Deleting product: %s", id)
	var product models.Product
	if err := s.db.Where("id = ?", id).First(&product).Error; err != nil {
		return err
	}
	if err := s.db.Delete(&product).Error; err != nil {
		return err
	}
	return nil
}

func (s *itemsService) BulkAction(action string, ids []string) error {
	log.Printf("[ItemsService] Performing bulk action: %s on %d products", action, len(ids))
	switch action {
	case "activate", "enable":
		return s.db.Model(&models.Product{}).Where("id IN ?", ids).Update("is_active", true).Error
	case "deactivate", "disable":
		return s.db.Model(&models.Product{}).Where("id IN ?", ids).Update("is_active", false).Error
	case "delete":
		return s.db.Where("id IN ?", ids).Delete(&models.Product{}).Error
	}
	return nil
}

func (s *itemsService) BulkExport() ([]models.Product, error) {
	var products []models.Product
	if err := s.db.Order("name asc").Find(&products).Error; err != nil {
		log.Printf("[ItemsService] Error listing products for bulk export: %v", err)
		return nil, err
	}
	return products, nil
}
