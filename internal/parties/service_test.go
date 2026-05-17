package parties

import (
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"pos-api/internal/models"
)

func TestPartiesService(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	err = db.AutoMigrate(&models.Party{})
	if err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}

	s := NewPartiesService(db)
	storeID := "store-default"

	t.Run("CreateParty", func(t *testing.T) {
		p := &models.Party{
			ID:        "p1",
			Name:      "John Doe",
			Mobile:    "1234567890",
			PartyType: "customer",
			IsActive:  true,
		}
		created, err := s.CreateParty(storeID, p)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if created.Name != "John Doe" {
			t.Errorf("expected Name to be 'John Doe', got %s", created.Name)
		}
		if created.StoreID != storeID {
			t.Errorf("expected StoreID to be '%s', got '%s'", storeID, created.StoreID)
		}
	})

	t.Run("GetParties", func(t *testing.T) {
		parties, collect, pay, err := s.GetParties(storeID, nil, nil, nil)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(parties) != 1 {
			t.Errorf("expected 1 party, got %d", len(parties))
		}
		if collect != 0 {
			t.Errorf("expected collect to be 0, got %f", collect)
		}
		if pay != 0 {
			t.Errorf("expected pay to be 0, got %f", pay)
		}
	})

	t.Run("MultiStoreIsolationAndCrossStoreMobileReuse", func(t *testing.T) {
		// Create a customer in store-a
		pStoreA := &models.Party{
			ID:        "p-store-a",
			Name:      "Alice",
			Mobile:    "9999999999",
			PartyType: "customer",
			IsActive:  true,
		}
		_, err := s.CreateParty("store-a", pStoreA)
		if err != nil {
			t.Fatalf("failed to create party in store-a: %v", err)
		}

		// Verify GetParties in store-b does not return Alice
		partiesB, _, _, err := s.GetParties("store-b", nil, nil, nil)
		if err != nil {
			t.Fatalf("failed to query store-b: %v", err)
		}
		for _, party := range partiesB {
			if party.ID == "p-store-a" {
				t.Fatalf("leaked party from store-a to store-b")
			}
		}

		// Create a customer in store-b with the SAME mobile number
		pStoreB := &models.Party{
			ID:        "p-store-b",
			Name:      "Bob",
			Mobile:    "9999999999", // duplicate of Alice's mobile
			PartyType: "customer",
			IsActive:  true,
		}
		_, err = s.CreateParty("store-b", pStoreB)
		if err != nil {
			t.Fatalf("should be able to reuse mobile number across different stores under multi-store tenancy, got error: %v", err)
		}
	})

	t.Run("UpdateParty", func(t *testing.T) {
		updated, err := s.UpdateParty(storeID, "p1", &models.Party{
			Name: "John Updated",
		})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if updated.Name != "John Updated" {
			t.Errorf("expected name to be 'John Updated', got %s", updated.Name)
		}
	})

	t.Run("BulkAction disable", func(t *testing.T) {
		err := s.BulkAction(storeID, "disable", []string{"p1"})
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		var check models.Party
		db.First(&check, "store_id = ? AND id = ?", storeID, "p1")
		if check.IsActive {
			t.Errorf("expected IsActive to be false, got %t", check.IsActive)
		}
	})

	t.Run("DeleteParty", func(t *testing.T) {
		err := s.DeleteParty(storeID, "p1")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		var check models.Party
		err = db.First(&check, "store_id = ? AND id = ?", storeID, "p1").Error
		if err == nil {
			t.Errorf("expected record not found, found record")
		}
	})

	t.Run("CreateWithSoftDeletedMobileConflict", func(t *testing.T) {
		// p1 is soft-deleted, and has mobile "1234567890"
		
		// 1. First test when ALLOW_SOFT_DELETED_REUSE is disabled / false
		t.Setenv("ALLOW_SOFT_DELETED_REUSE", "false")
		p2Fail := &models.Party{
			ID:        "p2",
			Name:      "New Person",
			Mobile:    "1234567890",
			PartyType: "customer",
			IsActive:  true,
		}
		_, err := s.CreateParty(storeID, p2Fail)
		if err == nil {
			t.Fatal("expected error since ALLOW_SOFT_DELETED_REUSE is false, got nil")
		}
		if err.Error() != "A Party with these details has already been deleted, please use different details to create the party" {
			t.Errorf("expected error 'A Party with these details has already been deleted, please use different details to create the party', got '%s'", err.Error())
		}

		// 2. Next test when ALLOW_SOFT_DELETED_REUSE is enabled
		t.Setenv("ALLOW_SOFT_DELETED_REUSE", "true")
		created, err := s.CreateParty(storeID, p2Fail)
		if err != nil {
			t.Fatalf("expected no unique constraint error since ALLOW_SOFT_DELETED_REUSE is true, got %v", err)
		}
		if created.ID != "p2" {
			t.Errorf("expected ID to be 'p2', got %s", created.ID)
		}

		// Verify the old soft-deleted record is permanently gone
		var check models.Party
		err = db.Unscoped().First(&check, "store_id = ? AND id = ?", storeID, "p1").Error
		if err == nil {
			t.Errorf("expected old soft-deleted record to be completely purged, but still exists")
		}
	})
}
