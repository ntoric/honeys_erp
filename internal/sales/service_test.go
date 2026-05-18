package sales

import (
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"pos-api/internal/models"
)

func TestSalesService(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	err = db.AutoMigrate(
		&models.SalesInvoice{},
		&models.SalesInvoiceItem{},
		&models.SalesInvoiceCharge{},
		&models.Product{},
		&models.Party{},
	)
	if err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}

	s := NewSalesService(db)

	// Seed some initial data: Product and Party
	prod1 := &models.Product{
		ID:            "prod-1",
		SKU:           "SKU-1",
		Name:          "Product One",
		StockQuantity: 100,
	}
	db.Create(prod1)

	party1 := &models.Party{
		ID:      "party-1",
		StoreID: "store-a",
		Name:    "Customer One",
		Balance: 0,
	}
	db.Create(party1)

	t.Run("CreateInvoice and Multi-Store Isolation", func(t *testing.T) {
		invA := &models.SalesInvoice{
			ID:          "inv-a1",
			InvoiceNo:   "INV-0001",
			PartyID:     "party-1",
			PartyName:   "Customer One",
			InvoiceDate: "2026-05-18",
			IsDraft:     false,
		}
		itemsA := []models.SalesInvoiceItem{
			{
				ProductID: "prod-1",
				Quantity:  10,
				UnitPrice: 50.0,
			},
		}

		// Create in store-a
		createdA, err := s.CreateInvoice("store-a", invA, itemsA, nil)
		if err != nil {
			t.Fatalf("expected no error creating invoice, got %v", err)
		}

		if createdA.StoreID != "store-a" {
			t.Errorf("expected StoreID to be store-a, got %s", createdA.StoreID)
		}

		// Verify stock decreased by 10 (100 -> 90)
		var checkProd models.Product
		db.First(&checkProd, "id = ?", "prod-1")
		if checkProd.StockQuantity != 90 {
			t.Errorf("expected product stock to be 90, got %f", checkProd.StockQuantity)
		}

		// Verify party balance increased by 500 (balance_amount is grand total = 500 - 0 = 500)
		var checkParty models.Party
		db.First(&checkParty, "id = ?", "party-1")
		if checkParty.Balance != 500 {
			t.Errorf("expected party balance to be 500, got %f", checkParty.Balance)
		}

		// Create in store-b with identical InvoiceNo (should succeed since store-b is a different store!)
		invB := &models.SalesInvoice{
			ID:          "inv-b1",
			InvoiceNo:   "INV-0001",
			PartyID:     "party-1",
			PartyName:   "Customer One",
			InvoiceDate: "2026-05-18",
			IsDraft:     false,
		}
		itemsB := []models.SalesInvoiceItem{
			{
				ProductID: "prod-1",
				Quantity:  5,
				UnitPrice: 40.0,
			},
		}

		createdB, err := s.CreateInvoice("store-b", invB, itemsB, nil)
		if err != nil {
			t.Fatalf("expected no error creating duplicate invoice number in store-b, got %v", err)
		}
		if createdB.StoreID != "store-b" {
			t.Errorf("expected StoreID to be store-b, got %s", createdB.StoreID)
		}

		// Verify Listing isolates stores correctly
		invoicesA, totalA, _, _ := s.GetInvoices("store-a", GetInvoicesParams{})
		if totalA != 1 || len(invoicesA) != 1 {
			t.Errorf("expected 1 invoice for store-a, got total=%d len=%d", totalA, len(invoicesA))
		}
		if invoicesA[0].ID != "inv-a1" {
			t.Errorf("expected store-a invoice to be inv-a1, got %s", invoicesA[0].ID)
		}

		invoicesB, totalB, _, _ := s.GetInvoices("store-b", GetInvoicesParams{})
		if totalB != 1 || len(invoicesB) != 1 {
			t.Errorf("expected 1 invoice for store-b, got total=%d len=%d", totalB, len(invoicesB))
		}
		if invoicesB[0].ID != "inv-b1" {
			t.Errorf("expected store-b invoice to be inv-b1, got %s", invoicesB[0].ID)
		}
	})

	t.Run("CancelInvoice Reversion", func(t *testing.T) {
		// Cancel inv-a1 (store-a)
		err := s.CancelInvoice("store-a", "inv-a1")
		if err != nil {
			t.Fatalf("expected no error cancelling, got %v", err)
		}

		// Verify invoice status changed to cancelled
		var checkInv models.SalesInvoice
		db.First(&checkInv, "id = ?", "inv-a1")
		if checkInv.Status != "cancelled" {
			t.Errorf("expected status to be cancelled, got %s", checkInv.Status)
		}

		// Verify stock went back up by 10 (90 - 5 + 10 = 95)
		var checkProd models.Product
		db.First(&checkProd, "id = ?", "prod-1")
		if checkProd.StockQuantity != 95 {
			t.Errorf("expected product stock to be 95 after cancellation, got %f", checkProd.StockQuantity)
		}

		// Verify party balance decreased by 500 (500 - 500 = 0)
		var checkParty models.Party
		db.First(&checkParty, "id = ?", "party-1")
		if checkParty.Balance != 0 {
			t.Errorf("expected party balance to be 0, got %f", checkParty.Balance)
		}
	})

	t.Run("ALLOW_SOFT_DELETED_REUSE Check", func(t *testing.T) {
		// First delete inv-b1 from store-b so it is soft-deleted
		err := s.DeleteInvoice("store-b", "inv-b1")
		if err != nil {
			t.Fatalf("expected no error soft deleting, got %v", err)
		}

		// Try to create another invoice in store-b with same invoice number "INV-0001"
		// 1. With ALLOW_SOFT_DELETED_REUSE=false
		t.Setenv("ALLOW_SOFT_DELETED_REUSE", "false")
		invBNew := &models.SalesInvoice{
			ID:        "inv-b2",
			InvoiceNo: "INV-0001",
		}
		_, err = s.CreateInvoice("store-b", invBNew, nil, nil)
		if err == nil {
			t.Fatal("expected error creating invoice with same InvoiceNo when ALLOW_SOFT_DELETED_REUSE=false, got nil")
		}

		// 2. With ALLOW_SOFT_DELETED_REUSE=true
		t.Setenv("ALLOW_SOFT_DELETED_REUSE", "true")
		createdNew, err := s.CreateInvoice("store-b", invBNew, nil, nil)
		if err != nil {
			t.Fatalf("expected no error creating invoice with same InvoiceNo when ALLOW_SOFT_DELETED_REUSE=true, got %v", err)
		}
		if createdNew.ID != "inv-b2" {
			t.Errorf("expected ID to be inv-b2, got %s", createdNew.ID)
		}

		// Verify the old soft-deleted record is permanently purged
		var check models.SalesInvoice
		err = db.Unscoped().First(&check, "id = ?", "inv-b1").Error
		if err == nil {
			t.Error("expected old soft-deleted invoice to be completely purged, but still exists")
		}
	})

	t.Run("Bulk Operations", func(t *testing.T) {
		// Create two invoices in store-c
		inv1 := &models.SalesInvoice{ID: "inv-c1", InvoiceNo: "C-0001"}
		inv2 := &models.SalesInvoice{ID: "inv-c2", InvoiceNo: "C-0002"}
		s.CreateInvoice("store-c", inv1, nil, nil)
		s.CreateInvoice("store-c", inv2, nil, nil)

		// Bulk Cancel
		err := s.BulkCancelInvoices("store-c", []string{"inv-c1", "inv-c2"})
		if err != nil {
			t.Fatalf("expected no error bulk cancelling, got %v", err)
		}

		var check1, check2 models.SalesInvoice
		db.First(&check1, "id = ?", "inv-c1")
		db.First(&check2, "id = ?", "inv-c2")
		if check1.Status != "cancelled" || check2.Status != "cancelled" {
			t.Errorf("expected both invoices to be cancelled, got %s and %s", check1.Status, check2.Status)
		}

		// Bulk Delete
		err = s.BulkDeleteInvoices("store-c", []string{"inv-c1", "inv-c2"})
		if err != nil {
			t.Fatalf("expected no error bulk deleting, got %v", err)
		}

		var count int64
		db.Model(&models.SalesInvoice{}).Where("store_id = ?", "store-c").Count(&count)
		if count != 0 {
			t.Errorf("expected 0 active invoices left in store-c, got %d", count)
		}
	})

	t.Run("Bulk Export", func(t *testing.T) {
		inv := &models.SalesInvoice{ID: "inv-export", InvoiceNo: "EXP-0001"}
		s.CreateInvoice("store-export", inv, nil, nil)

		invoices, err := s.BulkExport("store-export")
		if err != nil {
			t.Fatalf("expected no error exporting, got %v", err)
		}

		if len(invoices) != 1 {
			t.Errorf("expected 1 invoice exported, got %d", len(invoices))
		}
		if invoices[0].ID != "inv-export" {
			t.Errorf("expected invoice to be inv-export, got %s", invoices[0].ID)
		}
	})
}
