package categories

import (
	"errors"
	"log"
	"os"
	"strings"

	"gorm.io/gorm"
	"pos-api/internal/models"
)

type CategoriesService interface {
	GetCategories(storeID string, flat *bool, parentID *string) ([]models.Category, error)
	CreateCategory(storeID string, category *models.Category) (*models.Category, error)
	GetCategoryByID(storeID string, id string) (*models.Category, error)
	UpdateCategory(storeID string, id string, category *models.Category) (*models.Category, error)
	DeleteCategory(storeID string, id string) error
	BulkAction(storeID string, action string, ids []string) error
}

type categoriesService struct {
	db *gorm.DB
}

func NewCategoriesService(db *gorm.DB) CategoriesService {
	return &categoriesService{db: db}
}

func (s *categoriesService) GetCategories(storeID string, flat *bool, parentID *string) ([]models.Category, error) {
	var categories []models.Category
	query := s.db.Model(&models.Category{}).Where("store_id = ?", storeID)

	if err := query.Find(&categories).Error; err != nil {
		log.Printf("[CategoriesService] Error fetching categories in store %s: %v", storeID, err)
		return nil, err
	}
	return categories, nil
}

func (s *categoriesService) CreateCategory(storeID string, category *models.Category) (*models.Category, error) {
	log.Printf("[CategoriesService] Creating new category in store %s: %s", storeID, category.Name)
	category.StoreID = storeID

	if strings.TrimSpace(category.Name) == "" {
		return nil, errors.New("category name is required")
	}

	// Active duplicate check
	var existing models.Category
	if err := s.db.Where("store_id = ? AND name = ?", storeID, category.Name).First(&existing).Error; err == nil {
		return nil, errors.New("a category with this name already exists")
	}
	if category.SKU != "" {
		if err := s.db.Where("store_id = ? AND sku = ?", storeID, category.SKU).First(&existing).Error; err == nil {
			return nil, errors.New("a category with this SKU already exists")
		}
	}

	// Soft-deleted duplicate check & reuse handling
	var existingSoftDeleted models.Category
	if err := s.db.Unscoped().Where("store_id = ? AND name = ? AND deleted_at IS NOT NULL", storeID, category.Name).First(&existingSoftDeleted).Error; err == nil {
		envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
		allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
		if allowReuse {
			log.Printf("[CategoriesService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted category with same Name %s. Hard deleting to resolve unique constraint conflict.", category.Name)
			if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
				log.Printf("[CategoriesService] Error purging soft-deleted record: %v", err)
				return nil, err
			}
		} else {
			return nil, errors.New("A Category with these details has already been deleted, please use different details to create the category")
		}
	}

	if category.SKU != "" {
		if err := s.db.Unscoped().Where("store_id = ? AND sku = ? AND deleted_at IS NOT NULL", storeID, category.SKU).First(&existingSoftDeleted).Error; err == nil {
			envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
			allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
			if allowReuse {
				log.Printf("[CategoriesService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted category with same SKU %s. Hard deleting to resolve unique constraint conflict.", category.SKU)
				if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
					log.Printf("[CategoriesService] Error purging soft-deleted record: %v", err)
					return nil, err
				}
			} else {
				return nil, errors.New("A Category with these details has already been deleted, please use different details to create the category")
			}
		}
	}

	if err := s.db.Create(category).Error; err != nil {
		log.Printf("[CategoriesService] Error creating category: %v", err)
		return nil, err
	}
	return category, nil
}

func (s *categoriesService) GetCategoryByID(storeID string, id string) (*models.Category, error) {
	var category models.Category
	if err := s.db.Where("store_id = ? AND id = ?", storeID, id).First(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}

func (s *categoriesService) UpdateCategory(storeID string, id string, category *models.Category) (*models.Category, error) {
	log.Printf("[CategoriesService] Updating category in store %s: %s", storeID, id)
	var existing models.Category
	if err := s.db.Where("store_id = ? AND id = ?", storeID, id).First(&existing).Error; err != nil {
		return nil, err
	}

	if category.Name != "" && category.Name != existing.Name {
		var dup models.Category
		if err := s.db.Where("store_id = ? AND name = ? AND id != ?", storeID, category.Name, id).First(&dup).Error; err == nil {
			return nil, errors.New("a category with this name already exists")
		}

		var existingSoftDeleted models.Category
		if err := s.db.Unscoped().Where("store_id = ? AND name = ? AND deleted_at IS NOT NULL", storeID, category.Name).First(&existingSoftDeleted).Error; err == nil {
			envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
			allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
			if allowReuse {
				log.Printf("[CategoriesService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted category with same Name %s during update. Hard deleting.", category.Name)
				if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
					return nil, err
				}
			} else {
				return nil, errors.New("A Category with these details has already been deleted, please use different details to create the category")
			}
		}
	}

	if category.SKU != "" && category.SKU != existing.SKU {
		var dup models.Category
		if err := s.db.Where("store_id = ? AND sku = ? AND id != ?", storeID, category.SKU, id).First(&dup).Error; err == nil {
			return nil, errors.New("a category with this SKU already exists")
		}

		var existingSoftDeleted models.Category
		if err := s.db.Unscoped().Where("store_id = ? AND sku = ? AND deleted_at IS NOT NULL", storeID, category.SKU).First(&existingSoftDeleted).Error; err == nil {
			envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
			allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
			if allowReuse {
				log.Printf("[CategoriesService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted category with same SKU %s during update. Hard deleting.", category.SKU)
				if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
					return nil, err
				}
			} else {
				return nil, errors.New("A Category with these details has already been deleted, please use different details to create the category")
			}
		}
	}

	if category.Name != "" {
		existing.Name = category.Name
	}
	existing.SKU = category.SKU
	existing.IsActive = category.IsActive

	if err := s.db.Save(&existing).Error; err != nil {
		log.Printf("[CategoriesService] Error saving category: %v", err)
		return nil, err
	}
	return &existing, nil
}

func (s *categoriesService) DeleteCategory(storeID string, id string) error {
	log.Printf("[CategoriesService] Deleting category in store %s: %s", storeID, id)
	var category models.Category
	if err := s.db.Where("store_id = ? AND id = ?", storeID, id).First(&category).Error; err != nil {
		return err
	}
	if err := s.db.Delete(&category).Error; err != nil {
		return err
	}
	return nil
}

func (s *categoriesService) BulkAction(storeID string, action string, ids []string) error {
	log.Printf("[CategoriesService] Performing bulk action: %s on %d items in store %s", action, len(ids), storeID)
	switch action {
	case "activate":
		return s.db.Model(&models.Category{}).Where("store_id = ? AND id IN ?", storeID, ids).Update("is_active", true).Error
	case "deactivate":
		return s.db.Model(&models.Category{}).Where("store_id = ? AND id IN ?", storeID, ids).Update("is_active", false).Error
	case "delete":
		return s.db.Where("store_id = ? AND id IN ?", storeID, ids).Delete(&models.Category{}).Error
	}
	return nil
}
