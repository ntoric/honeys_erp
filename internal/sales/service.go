package sales

import (
	"fmt"
	"log"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"pos-api/internal/models"
)

type SalesService interface {
	GetInvoices(params GetInvoicesParams) ([]models.SalesInvoice, int64, interface{}, error)
	GetInvoiceByID(id string) (*models.SalesInvoice, error)
	CreateInvoice(invoice *models.SalesInvoice, items []models.SalesInvoiceItem, charges []models.SalesInvoiceCharge) (*models.SalesInvoice, error)
	UpdateInvoice(id string, invoice *models.SalesInvoice, items []models.SalesInvoiceItem, charges []models.SalesInvoiceCharge) (*models.SalesInvoice, error)
	CancelInvoice(id string) error
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

func (s *salesService) GetInvoices(params GetInvoicesParams) ([]models.SalesInvoice, int64, interface{}, error) {
	var invoices []models.SalesInvoice
	query := s.db.Preload("Items").Preload("Charges").Model(&models.SalesInvoice{})

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

	s.db.Model(&models.SalesInvoice{}).Where("status != ?", "cancelled").Select("SUM(grand_total)").Scan(&stats.TotalSales)
	s.db.Model(&models.SalesInvoice{}).Where("status != ?", "cancelled").Select("SUM(paid_amount)").Scan(&stats.PaidAmount)
	s.db.Model(&models.SalesInvoice{}).Where("status != ?", "cancelled").Select("SUM(balance_amount)").Scan(&stats.UnpaidAmount)
	s.db.Model(&models.SalesInvoice{}).Where("status = ?", "cancelled").Count(&stats.CancelledCount)

	return invoices, total, stats, nil
}

func (s *salesService) GetInvoiceByID(id string) (*models.SalesInvoice, error) {
	var invoice models.SalesInvoice
	if err := s.db.Preload("Items").Preload("Charges").First(&invoice, "id = ?", id).Error; err != nil {
		log.Printf("[SalesService] Error fetching invoice %s: %v", id, err)
		return nil, err
	}
	return &invoice, nil
}

func (s *salesService) CreateInvoice(invoice *models.SalesInvoice, items []models.SalesInvoiceItem, charges []models.SalesInvoiceCharge) (*models.SalesInvoice, error) {
	log.Printf("[SalesService] Creating new invoice for party: %s", invoice.PartyName)
	if invoice.ID == "" {
		invoice.ID = uuid.New().String()
	}

	if invoice.InvoiceNo == "" {
		var count int64
		s.db.Model(&models.SalesInvoice{}).Count(&count)
		invoice.InvoiceNo = fmt.Sprintf("INV-%04d", count+1)
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
				if err := tx.Model(&models.Party{}).Where("id = ?", invoice.PartyID).
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

func (s *salesService) UpdateInvoice(id string, invoice *models.SalesInvoice, items []models.SalesInvoiceItem, charges []models.SalesInvoiceCharge) (*models.SalesInvoice, error) {
	log.Printf("[SalesService] Updating invoice: %s", id)
	var oldInvoice models.SalesInvoice
	if err := s.db.Preload("Items").Preload("Charges").First(&oldInvoice, "id = ?", id).Error; err != nil {
		log.Printf("[SalesService] Error fetching old invoice %s: %v", id, err)
		return nil, err
	}

	invoice.ID = id

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
				if err := tx.Model(&models.Party{}).Where("id = ?", oldInvoice.PartyID).
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
				if err := tx.Model(&models.Party{}).Where("id = ?", invoice.PartyID).
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

func (s *salesService) CancelInvoice(id string) error {
	log.Printf("[SalesService] Cancelling invoice: %s", id)
	var invoice models.SalesInvoice
	if err := s.db.Preload("Items").First(&invoice, "id = ?", id).Error; err != nil {
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
				if err := tx.Model(&models.Party{}).Where("id = ?", invoice.PartyID).
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
