package sales

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"pos-api/internal/models"
)

type SalesService interface {
	GetInvoices(storeID string, params GetInvoicesParams) ([]models.SalesInvoice, int64, interface{}, error)
	GetInvoiceByID(storeID string, id string) (*models.SalesInvoice, error)
	CreateInvoice(storeID string, invoice *models.SalesInvoice, items []models.SalesInvoiceItem, charges []models.SalesInvoiceCharge) (*models.SalesInvoice, error)
	UpdateInvoice(storeID string, id string, invoice *models.SalesInvoice, items []models.SalesInvoiceItem, charges []models.SalesInvoiceCharge) (*models.SalesInvoice, error)
	CancelInvoice(storeID string, id string) error
	DeleteInvoice(storeID string, id string) error
	BulkCancelInvoices(storeID string, ids []string) error
	BulkDeleteInvoices(storeID string, ids []string) error
	BulkExport(storeID string) ([]models.SalesInvoice, error)
}

type GetInvoicesParams struct {
	Status     *string
	CustomerId *string
	FromDate   *string
	ToDate     *string
	Q          *string
	Page       *int
	PerPage    *int
}

type salesService struct {
	db *gorm.DB
}

func NewSalesService(db *gorm.DB) SalesService {
	return &salesService{db: db}
}

func (s *salesService) GetInvoices(storeID string, params GetInvoicesParams) ([]models.SalesInvoice, int64, interface{}, error) {
	var invoices []models.SalesInvoice
	query := s.db.Preload("Items").Preload("Charges").Model(&models.SalesInvoice{}).Where("store_id = ?", storeID)

	if params.Status != nil && *params.Status != "" {
		query = query.Where("status = ?", *params.Status)
	}
	if params.CustomerId != nil && *params.CustomerId != "" {
		query = query.Where("party_id = ?", *params.CustomerId)
	}
	if params.FromDate != nil && *params.FromDate != "" {
		query = query.Where("invoice_date >= ?", *params.FromDate)
	}
	if params.ToDate != nil && *params.ToDate != "" {
		query = query.Where("invoice_date <= ?", *params.ToDate)
	}
	if params.Q != nil && *params.Q != "" {
		searchTerm := "%" + *params.Q + "%"
		query = query.Where("invoice_no LIKE ? OR party_name LIKE ?", searchTerm, searchTerm)
	}

	var total int64
	query.Count(&total)

	page := 1
	if params.Page != nil {
		page = *params.Page
	}
	perPage := 20
	if params.PerPage != nil {
		perPage = *params.PerPage
	}

	if err := query.Offset((page - 1) * perPage).Limit(perPage).Order("created_at desc").Find(&invoices).Error; err != nil {
		log.Printf("[SalesService] Error fetching invoices: %v", err)
		return nil, 0, nil, err
	}

	// Calculate summary stats
	var stats struct {
		TotalSales     float32 `json:"total_sales"`
		PaidAmount     float32 `json:"paid_amount"`
		UnpaidAmount   float32 `json:"unpaid_amount"`
		CancelledCount int64   `json:"cancelled_count"`
	}

	s.db.Model(&models.SalesInvoice{}).Where("store_id = ? AND status != ?", storeID, "cancelled").Select("SUM(grand_total)").Scan(&stats.TotalSales)
	s.db.Model(&models.SalesInvoice{}).Where("store_id = ? AND status != ?", storeID, "cancelled").Select("SUM(paid_amount)").Scan(&stats.PaidAmount)
	s.db.Model(&models.SalesInvoice{}).Where("store_id = ? AND status != ?", storeID, "cancelled").Select("SUM(balance_amount)").Scan(&stats.UnpaidAmount)
	s.db.Model(&models.SalesInvoice{}).Where("store_id = ? AND status = ?", storeID, "cancelled").Count(&stats.CancelledCount)

	return invoices, total, stats, nil
}

func (s *salesService) GetInvoiceByID(storeID string, id string) (*models.SalesInvoice, error) {
	var invoice models.SalesInvoice
	if err := s.db.Preload("Items").Preload("Charges").First(&invoice, "id = ? AND store_id = ?", id, storeID).Error; err != nil {
		log.Printf("[SalesService] Error fetching invoice %s: %v", id, err)
		return nil, err
	}
	return &invoice, nil
}

func (s *salesService) CreateInvoice(storeID string, invoice *models.SalesInvoice, items []models.SalesInvoiceItem, charges []models.SalesInvoiceCharge) (*models.SalesInvoice, error) {
	log.Printf("[SalesService] Creating new invoice for party: %s", invoice.PartyName)
	if invoice.ID == "" {
		invoice.ID = uuid.New().String()
	}

	invoice.StoreID = storeID

	if invoice.InvoiceNo == "" {
		var count int64
		s.db.Model(&models.SalesInvoice{}).Where("store_id = ?", storeID).Count(&count)
		invoice.InvoiceNo = fmt.Sprintf("INV-%04d", count+1)
	}

	// Unscoped soft-deleted reuse check
	var existingSoftDeleted models.SalesInvoice
	if err := s.db.Unscoped().Where("store_id = ? AND invoice_no = ? AND deleted_at IS NOT NULL", storeID, invoice.InvoiceNo).First(&existingSoftDeleted).Error; err == nil {
		envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
		allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
		if allowReuse {
			log.Printf("[SalesService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted invoice with same InvoiceNo %s. Hard deleting to resolve unique constraint conflict.", invoice.InvoiceNo)
			if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
				log.Printf("[SalesService] Error purging soft-deleted record: %v", err)
				return nil, err
			}
		} else {
			log.Printf("[SalesService] ALLOW_SOFT_DELETED_REUSE is disabled. Rejecting creation due to conflict with soft-deleted invoice: %s", invoice.InvoiceNo)
			return nil, fmt.Errorf("An Invoice with these details has already been deleted, please use different details to create the invoice")
		}
	}

	// Calculate totals
	var subtotal, totalTax, totalDiscount float32
	for i := range items {
		items[i].ID = uuid.New().String()
		items[i].InvoiceID = invoice.ID
		itemAmount := items[i].UnitPrice * items[i].Quantity
		items[i].Amount = itemAmount
		subtotal += itemAmount
		totalTax += items[i].TaxAmount
		totalDiscount += items[i].Discount
	}

	var totalCharges float32
	for i := range charges {
		charges[i].ID = uuid.New().String()
		charges[i].InvoiceID = invoice.ID
		totalCharges += charges[i].Amount
	}

	invoice.Subtotal = subtotal
	invoice.TotalTax = totalTax
	invoice.TotalDiscount = totalDiscount
	invoice.GrandTotal = invoice.Subtotal + invoice.TotalTax + totalCharges - invoice.TotalDiscount + invoice.RoundOff
	invoice.BalanceAmount = invoice.GrandTotal - invoice.PaidAmount

	if invoice.BalanceAmount <= 0 {
		invoice.Status = "paid"
		invoice.PaidAmount = invoice.GrandTotal
		invoice.BalanceAmount = 0
	} else if invoice.PaidAmount > 0 {
		invoice.Status = "partially_paid"
	} else {
		invoice.Status = "unpaid"
	}

	if invoice.IsDraft {
		invoice.Status = "draft"
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(invoice).Error; err != nil {
			return err
		}
		if len(items) > 0 {
			if err := tx.Create(&items).Error; err != nil {
				return err
			}
		}
		if len(charges) > 0 {
			if err := tx.Create(&charges).Error; err != nil {
				return err
			}
		}

		if !invoice.IsDraft {
			for _, item := range items {
				if item.ProductID != "" {
					log.Printf("[SalesService] Decrementing stock for product %s by %f", item.ProductID, item.Quantity)
					if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
						UpdateColumn("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity)).Error; err != nil {
						return err
					}
				}
			}

			if invoice.PartyID != "" {
				log.Printf("[SalesService] Updating balance for party %s by +%f", invoice.PartyID, invoice.BalanceAmount)
				if err := tx.Model(&models.Party{}).Where("id = ? AND store_id = ?", invoice.PartyID, storeID).
					UpdateColumn("balance", gorm.Expr("balance + ?", invoice.BalanceAmount)).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})

	if err != nil {
		log.Printf("[SalesService] Error creating invoice: %v", err)
		return nil, err
	}

	log.Printf("[SalesService] Successfully created invoice: %s", invoice.InvoiceNo)
	return invoice, nil
}

func (s *salesService) UpdateInvoice(storeID string, id string, invoice *models.SalesInvoice, items []models.SalesInvoiceItem, charges []models.SalesInvoiceCharge) (*models.SalesInvoice, error) {
	log.Printf("[SalesService] Updating invoice: %s", id)
	var oldInvoice models.SalesInvoice
	if err := s.db.Preload("Items").Preload("Charges").First(&oldInvoice, "id = ? AND store_id = ?", id, storeID).Error; err != nil {
		log.Printf("[SalesService] Error fetching old invoice %s: %v", id, err)
		return nil, err
	}

	invoice.ID = id
	invoice.StoreID = storeID

	if invoice.InvoiceNo != "" && invoice.InvoiceNo != oldInvoice.InvoiceNo {
		// Active check
		var activeExisting models.SalesInvoice
		if err := s.db.Where("store_id = ? AND invoice_no = ? AND id != ?", storeID, invoice.InvoiceNo, id).First(&activeExisting).Error; err == nil {
			return nil, fmt.Errorf("an invoice with this number already exists")
		}

		// Unscoped soft-deleted reuse check
		var existingSoftDeleted models.SalesInvoice
		if err := s.db.Unscoped().Where("store_id = ? AND invoice_no = ? AND deleted_at IS NOT NULL", storeID, invoice.InvoiceNo).First(&existingSoftDeleted).Error; err == nil {
			envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
			allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
			if allowReuse {
				log.Printf("[SalesService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted invoice with same InvoiceNo %s during update. Hard deleting.", invoice.InvoiceNo)
				if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
					log.Printf("[SalesService] Error purging soft-deleted record during update: %v", err)
					return nil, err
				}
			} else {
				log.Printf("[SalesService] ALLOW_SOFT_DELETED_REUSE is disabled. Rejecting update due to conflict with soft-deleted invoice: %s", invoice.InvoiceNo)
				return nil, fmt.Errorf("An Invoice with these details has already been deleted, please use different details to create the invoice")
			}
		}
	}

	// Calculate totals
	var subtotal, totalTax, totalDiscount float32
	for i := range items {
		items[i].ID = uuid.New().String()
		items[i].InvoiceID = id
		itemAmount := items[i].UnitPrice * items[i].Quantity
		items[i].Amount = itemAmount
		subtotal += itemAmount
		totalTax += items[i].TaxAmount
		totalDiscount += items[i].Discount
	}

	var totalCharges float32
	for i := range charges {
		charges[i].ID = uuid.New().String()
		charges[i].InvoiceID = id
		totalCharges += charges[i].Amount
	}

	invoice.Subtotal = subtotal
	invoice.TotalTax = totalTax
	invoice.TotalDiscount = totalDiscount
	invoice.GrandTotal = invoice.Subtotal + invoice.TotalTax + totalCharges - invoice.TotalDiscount + invoice.RoundOff
	invoice.BalanceAmount = invoice.GrandTotal - invoice.PaidAmount

	if invoice.BalanceAmount <= 0 {
		invoice.Status = "paid"
		invoice.PaidAmount = invoice.GrandTotal
		invoice.BalanceAmount = 0
	} else if invoice.PaidAmount > 0 {
		invoice.Status = "partially_paid"
	} else {
		invoice.Status = "unpaid"
	}

	if invoice.IsDraft {
		invoice.Status = "draft"
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if !oldInvoice.IsDraft && oldInvoice.Status != "cancelled" {
			for _, item := range oldInvoice.Items {
				if item.ProductID != "" {
					if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
						UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", item.Quantity)).Error; err != nil {
						return err
					}
				}
			}
			if oldInvoice.PartyID != "" {
				if err := tx.Model(&models.Party{}).Where("id = ? AND store_id = ?", oldInvoice.PartyID, storeID).
					UpdateColumn("balance", gorm.Expr("balance - ?", oldInvoice.BalanceAmount)).Error; err != nil {
					return err
				}
			}
		}

		if err := tx.Where("invoice_id = ?", id).Delete(&models.SalesInvoiceItem{}).Error; err != nil {
			return err
		}
		if err := tx.Where("invoice_id = ?", id).Delete(&models.SalesInvoiceCharge{}).Error; err != nil {
			return err
		}

		if err := tx.Save(invoice).Error; err != nil {
			return err
		}

		if len(items) > 0 {
			if err := tx.Create(&items).Error; err != nil {
				return err
			}
		}
		if len(charges) > 0 {
			if err := tx.Create(&charges).Error; err != nil {
				return err
			}
		}

		if !invoice.IsDraft && invoice.Status != "cancelled" {
			for _, item := range items {
				if item.ProductID != "" {
					if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
						UpdateColumn("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity)).Error; err != nil {
						return err
					}
				}
			}
			if invoice.PartyID != "" {
				if err := tx.Model(&models.Party{}).Where("id = ? AND store_id = ?", invoice.PartyID, storeID).
					UpdateColumn("balance", gorm.Expr("balance + ?", invoice.BalanceAmount)).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})

	if err != nil {
		log.Printf("[SalesService] Error updating invoice %s: %v", id, err)
		return nil, err
	}

	log.Printf("[SalesService] Successfully updated invoice: %s", invoice.InvoiceNo)
	return invoice, nil
}

func (s *salesService) CancelInvoice(storeID string, id string) error {
	log.Printf("[SalesService] Cancelling invoice: %s", id)
	var invoice models.SalesInvoice
	if err := s.db.Preload("Items").First(&invoice, "id = ? AND store_id = ?", id, storeID).Error; err != nil {
		log.Printf("[SalesService] Error fetching invoice %s for cancellation: %v", id, err)
		return err
	}

	if invoice.Status == "cancelled" {
		return fmt.Errorf("invoice is already cancelled")
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&invoice).Update("status", "cancelled").Error; err != nil {
			return err
		}

		if !invoice.IsDraft {
			for _, item := range invoice.Items {
				if item.ProductID != "" {
					if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
						UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", item.Quantity)).Error; err != nil {
						return err
					}
				}
			}

			if invoice.PartyID != "" {
				if err := tx.Model(&models.Party{}).Where("id = ? AND store_id = ?", invoice.PartyID, storeID).
					UpdateColumn("balance", gorm.Expr("balance - ?", invoice.BalanceAmount)).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})

	if err != nil {
		log.Printf("[SalesService] Error during cancellation transaction for invoice %s: %v", id, err)
		return err
	}

	log.Printf("[SalesService] Successfully cancelled invoice: %s", invoice.InvoiceNo)
	return nil
}

func (s *salesService) DeleteInvoice(storeID string, id string) error {
	log.Printf("[SalesService] Deleting invoice: %s", id)
	var invoice models.SalesInvoice
	if err := s.db.Preload("Items").First(&invoice, "id = ? AND store_id = ?", id, storeID).Error; err != nil {
		log.Printf("[SalesService] Error fetching invoice %s for deletion: %v", id, err)
		return err
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if !invoice.IsDraft && invoice.Status != "cancelled" {
			for _, item := range invoice.Items {
				if item.ProductID != "" {
					if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
						UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", item.Quantity)).Error; err != nil {
						return err
					}
				}
			}

			if invoice.PartyID != "" {
				if err := tx.Model(&models.Party{}).Where("id = ? AND store_id = ?", invoice.PartyID, storeID).
					UpdateColumn("balance", gorm.Expr("balance - ?", invoice.BalanceAmount)).Error; err != nil {
					return err
				}
			}
		}

		if err := tx.Where("invoice_id = ?", id).Delete(&models.SalesInvoiceItem{}).Error; err != nil {
			return err
		}
		if err := tx.Where("invoice_id = ?", id).Delete(&models.SalesInvoiceCharge{}).Error; err != nil {
			return err
		}

		if err := tx.Delete(&invoice).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		log.Printf("[SalesService] Error during deletion transaction for invoice %s: %v", id, err)
		return err
	}

	log.Printf("[SalesService] Successfully deleted invoice: %s", invoice.InvoiceNo)
	return nil
}

func (s *salesService) BulkCancelInvoices(storeID string, ids []string) error {
	log.Printf("[SalesService] Bulk cancelling %d invoices", len(ids))
	for _, id := range ids {
		if err := s.CancelInvoice(storeID, id); err != nil {
			log.Printf("[SalesService] Error bulk cancelling invoice %s: %v", id, err)
		}
	}
	return nil
}

func (s *salesService) BulkDeleteInvoices(storeID string, ids []string) error {
	log.Printf("[SalesService] Bulk deleting %d invoices", len(ids))
	for _, id := range ids {
		if err := s.DeleteInvoice(storeID, id); err != nil {
			log.Printf("[SalesService] Error bulk deleting invoice %s: %v", id, err)
		}
	}
	return nil
}

func (s *salesService) BulkExport(storeID string) ([]models.SalesInvoice, error) {
	log.Printf("[SalesService] Bulk exporting invoices for store %s", storeID)
	var invoices []models.SalesInvoice
	if err := s.db.Preload("Items").Preload("Charges").Where("store_id = ?", storeID).Order("created_at desc").Find(&invoices).Error; err != nil {
		log.Printf("[SalesService] Error fetching invoices for export: %v", err)
		return nil, err
	}
	return invoices, nil
}
