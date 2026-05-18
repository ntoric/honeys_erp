package items

import (
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"pos-api/internal/models"
)

func TestCategoriesService(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	err = db.AutoMigrate(&models.Category{})
	if err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}

	s := NewCategoriesService(db)
	storeID := "store-default"

	t.Run("CreateCategory", func(t *testing.T) {
		cat := &models.Category{
			ID:       "cat1",
			Name:     "Electronics",
			SKU:      "SKU-ELEC",
			IsActive: true,
		}
		created, err := s.CreateCategory(storeID, cat)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if created.Name != "Electronics" {
			t.Errorf("expected Name to be 'Electronics', got %s", created.Name)
		}
		if created.StoreID != storeID {
			t.Errorf("expected StoreID to be '%s', got '%s'", storeID, created.StoreID)
		}
	})

	t.Run("GetCategories", func(t *testing.T) {
		cats, err := s.GetCategories(storeID, nil, nil)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(cats) != 1 {
			t.Errorf("expected 1 category, got %d", len(cats))
		}
	})

	t.Run("MultiStoreIsolationAndCrossStoreSkuReuse", func(t *testing.T) {
		// Create a category in store-a
		catStoreA := &models.Category{
			ID:       "cat-store-a",
			Name:     "Clothing",
			SKU:      "SKU-CLOTH",
			IsActive: true,
		}
		_, err := s.CreateCategory("store-a", catStoreA)
		if err != nil {
			t.Fatalf("failed to create category in store-a: %v", err)
		}

		// Verify GetCategories in store-b does not return Clothing
		catsB, err := s.GetCategories("store-b", nil, nil)
		if err != nil {
			t.Fatalf("failed to query store-b: %v", err)
		}
		for _, cat := range catsB {
			if cat.ID == "cat-store-a" {
				t.Fatalf("leaked category from store-a to store-b")
			}
		}

		// Create a category in store-b with the SAME Name and SKU number
		catStoreB := &models.Category{
			ID:       "cat-store-b",
			Name:     "Clothing",
			SKU:      "SKU-CLOTH", // duplicate of Clothing's name and SKU
			IsActive: true,
		}
		_, err = s.CreateCategory("store-b", catStoreB)
		if err != nil {
			t.Fatalf("should be able to reuse Name/SKU number across different stores under multi-store tenancy, got error: %v", err)
		}
	})

	t.Run("UpdateCategory", func(t *testing.T) {
		updated, err := s.UpdateCategory(storeID, "cat1", &models.Category{
			Name: "Electronics Updated",
			SKU:  "SKU-ELEC-UPD",
		})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if updated.Name != "Electronics Updated" {
			t.Errorf("expected name to be 'Electronics Updated', got %s", updated.Name)
		}
	})

	t.Run("BulkAction deactivate", func(t *testing.T) {
		err := s.BulkAction(storeID, "deactivate", []string{"cat1"})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		var check models.Category
		db.First(&check, "store_id = ? AND id = ?", storeID, "cat1")
		if check.IsActive {
			t.Errorf("expected IsActive to be false, got %t", check.IsActive)
		}
	})

	t.Run("DeleteCategory", func(t *testing.T) {
		err := s.DeleteCategory(storeID, "cat1")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		var check models.Category
		err = db.First(&check, "store_id = ? AND id = ?", storeID, "cat1").Error
		if err == nil {
			t.Errorf("expected record not found, found record")
		}
	})

	t.Run("CreateWithSoftDeletedNameConflict", func(t *testing.T) {
		// cat1 is soft-deleted, and has name "Electronics Updated" and SKU "SKU-ELEC-UPD"
		
		// 1. First test when ALLOW_SOFT_DELETED_REUSE is disabled / false
		t.Setenv("ALLOW_SOFT_DELETED_REUSE", "false")
		catFail := &models.Category{
			ID:       "cat2",
			Name:     "Electronics Updated",
			SKU:      "SKU-ELEC-UPD",
			IsActive: true,
		}
		_, err := s.CreateCategory(storeID, catFail)
		if err == nil {
			t.Fatal("expected error since ALLOW_SOFT_DELETED_REUSE is false, got nil")
		}
		if err.Error() != "A Category with these details has already been deleted, please use different details to create the category" {
			t.Errorf("expected error, got '%s'", err.Error())
		}

		// 2. Next test when ALLOW_SOFT_DELETED_REUSE is enabled
		t.Setenv("ALLOW_SOFT_DELETED_REUSE", "true")
		created, err := s.CreateCategory(storeID, catFail)
		if err != nil {
			t.Fatalf("expected no unique constraint error since ALLOW_SOFT_DELETED_REUSE is true, got %v", err)
		}
		if created.ID != "cat2" {
			t.Errorf("expected ID to be 'cat2', got %s", created.ID)
		}

		// Verify the old soft-deleted record is permanently gone
		var check models.Category
		err = db.Unscoped().First(&check, "store_id = ? AND id = ?", storeID, "cat1").Error
		if err == nil {
			t.Errorf("expected old soft-deleted record to be completely purged, but still exists")
		}
	})
}
