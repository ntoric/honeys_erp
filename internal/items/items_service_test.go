package items

import (
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"pos-api/internal/models"
)

func TestItemsService(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	err = db.AutoMigrate(&models.Product{})
	if err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}

	s := NewItemsService(db)

	t.Run("CreateProduct", func(t *testing.T) {
		prod := &models.Product{
			ID:             "p1",
			SKU:            "SKU-TEST-1",
			Name:           "Product 1",
			WholesalePrice: 150.0,
			IsActive:       true,
		}
		created, err := s.CreateProduct(prod)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if created.Name != "Product 1" {
			t.Errorf("expected Name to be 'Product 1', got %s", created.Name)
		}
		if created.WholesalePrice != 150.0 {
			t.Errorf("expected WholesalePrice to be 150.0, got %f", created.WholesalePrice)
		}
	})

	t.Run("GetProducts", func(t *testing.T) {
		prods, total, err := s.GetProducts("Product", "", nil, nil, 1, 10)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if total != 1 {
			t.Errorf("expected total to be 1, got %d", total)
		}
		if len(prods) != 1 {
			t.Errorf("expected 1 product, got %d", len(prods))
		}
	})

	t.Run("ActiveDuplicateConflict", func(t *testing.T) {
		prodDup := &models.Product{
			ID:   "p2",
			SKU:  "SKU-TEST-1",
			Name: "Product 2",
		}
		_, err := s.CreateProduct(prodDup)
		if err == nil {
			t.Fatal("expected active duplicate SKU conflict, got nil")
		}
		if err.Error() != "a product with this SKU already exists" {
			t.Errorf("expected error 'a product with this SKU already exists', got '%s'", err.Error())
		}
	})

	t.Run("UpdateProduct", func(t *testing.T) {
		updated, err := s.UpdateProduct("p1", &models.Product{
			Name:           "Product 1 Updated",
			WholesalePrice: 160.0,
		})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if updated.Name != "Product 1 Updated" {
			t.Errorf("expected name to be updated, got %s", updated.Name)
		}
		if updated.WholesalePrice != 160.0 {
			t.Errorf("expected wholesale price to be 160.0, got %f", updated.WholesalePrice)
		}
	})

	t.Run("BulkAction deactivate", func(t *testing.T) {
		err := s.BulkAction("disable", []string{"p1"})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		var check models.Product
		db.First(&check, "id = ?", "p1")
		if check.IsActive {
			t.Errorf("expected product to be inactive, got %t", check.IsActive)
		}
	})

	t.Run("DeleteProduct", func(t *testing.T) {
		err := s.DeleteProduct("p1")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		var check models.Product
		err = db.First(&check, "id = ?", "p1").Error
		if err == nil {
			t.Errorf("expected record to be soft deleted, but found")
		}
	})

	t.Run("CreateWithSoftDeletedSKUConflict", func(t *testing.T) {
		// p1 is soft-deleted, and has SKU "SKU-TEST-1"
		
		// 1. First test when ALLOW_SOFT_DELETED_REUSE is disabled / false
		t.Setenv("ALLOW_SOFT_DELETED_REUSE", "false")
		prodFail := &models.Product{
			ID:   "p3",
			SKU:  "SKU-TEST-1",
			Name: "Product 3",
		}
		_, err := s.CreateProduct(prodFail)
		if err == nil {
			t.Fatal("expected error since ALLOW_SOFT_DELETED_REUSE is false, got nil")
		}
		if err.Error() != "An Item with these details has already been deleted, please use different details to create the item" {
			t.Errorf("expected error, got '%s'", err.Error())
		}

		// 2. Next test when ALLOW_SOFT_DELETED_REUSE is enabled
		t.Setenv("ALLOW_SOFT_DELETED_REUSE", "true")
		created, err := s.CreateProduct(prodFail)
		if err != nil {
			t.Fatalf("expected no unique constraint error since ALLOW_SOFT_DELETED_REUSE is true, got %v", err)
		}
		if created.ID != "p3" {
			t.Errorf("expected ID to be 'p3', got %s", created.ID)
		}

		// Verify the old soft-deleted record is permanently gone
		var check models.Product
		err = db.Unscoped().First(&check, "id = ?", "p1").Error
		if err == nil {
			t.Errorf("expected old soft-deleted record to be completely purged, but still exists")
		}
	})
}
