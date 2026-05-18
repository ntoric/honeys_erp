package models

import (
	"time"

	"gorm.io/gorm"
)

// Note: In a real app, these models would fully mirror or map to the OpenAPI types
// and have appropriate tags for SQLite/GORM mapping.

type User struct {
	gorm.Model
	ID       string `gorm:"primaryKey" json:"id"`
	Username string `gorm:"uniqueIndex" json:"username"`
	Name     string `json:"name"`
	Email    string `gorm:"uniqueIndex" json:"email"`
	Password string `json:"-"` // Never export password in JSON
	Phone    string `json:"phone"`
	Role     string `json:"role"`
	IsActive bool   `json:"is_active"`
}

type Category struct {
	ID        string         `gorm:"primaryKey" json:"id"`
	StoreID   string         `gorm:"index;uniqueIndex:idx_store_category_name;uniqueIndex:idx_store_category_sku;default:'store-default'" json:"store_id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Name      string         `gorm:"uniqueIndex:idx_store_category_name" json:"name"`
	SKU       string         `gorm:"uniqueIndex:idx_store_category_sku" json:"sku"`
	IsActive  bool           `gorm:"default:true" json:"is_active"`
}

type Product struct {
	gorm.Model
	ID                        string `gorm:"primaryKey"`
	SKU                       string `gorm:"uniqueIndex"`
	Name                      string
	Description               string
	ProductType               string // "Product" or "Service"
	CategoryID                string
	EnableBatching            bool
	ItemCode                  string `gorm:"index"`
	HSNCode                   string
	MeasuringUnit             string
	StockQuantity             float32
	LowStockWarning           bool
	LowStockQuantity          float32
	SalePrice                 float32
	SalePriceTaxInclusive     bool
	PurchasePrice             float32
	PurchasePriceTaxInclusive bool
	GSTRate                   float32
	DiscountOnSale            float32
	Barcode                   string
	ExpiryDate                *string // ISO date string
	IsDraft                   bool `gorm:"default:false"`
	IsActive                  bool `gorm:"default:true"`
}

type Customer struct {
	gorm.Model
	ID                 string `gorm:"primaryKey"`
	Name               string
	Phone              string `gorm:"uniqueIndex"`
	Email              string
	CreditLimit        float32
	OutstandingBalance float32
	IsActive           bool
}

type Party struct {
	gorm.Model
	ID        string `gorm:"primaryKey"`
	StoreID   string `gorm:"index;uniqueIndex:idx_store_mobile;default:'store-default'" json:"store_id"`
	Name      string
	Category  string
	Mobile    string `gorm:"uniqueIndex:idx_store_mobile"`
	Email     string
	PartyType string // "customer" or "vendor"
	Balance   float32
	IsBlocked bool
	IsActive  bool
}

type SalesInvoice struct {
	gorm.Model
	ID              string `gorm:"primaryKey"`
	InvoiceNo       string `gorm:"uniqueIndex"`
	PartyID         string `gorm:"index"`
	PartyName       string
	PartyMobile     string
	InvoiceDate     string
	DueDate         string
	PaymentTerms    int
	Status          string // draft, paid, partially_paid, unpaid, cancelled
	Subtotal        float32
	TaxableAmount   float32
	TotalTax        float32
	TotalDiscount   float32
	RoundOff        float32
	GrandTotal      float32
	PaidAmount      float32
	BalanceAmount   float32
	PaymentMethod   string
	Notes           string
	Signature       string
	IsDraft         bool `gorm:"default:false"`
	Items           []SalesInvoiceItem `gorm:"foreignKey:InvoiceID"`
	Charges         []SalesInvoiceCharge `gorm:"foreignKey:InvoiceID"`
}

type SalesInvoiceCharge struct {
	gorm.Model
	ID        string `gorm:"primaryKey"`
	InvoiceID string `gorm:"index"`
	Label     string
	Amount    float32
}

type SalesInvoiceItem struct {
	gorm.Model
	ID          string `gorm:"primaryKey"`
	InvoiceID   string `gorm:"index"`
	ProductID   string `gorm:"index"`
	ProductName string
	HSNCode     string
	Quantity    float32
	UnitPrice   float32
	Discount    float32
	TaxRate     float32
	TaxAmount   float32
	Amount      float32
	Barcode     string
}

type PurchaseInvoice struct {
	gorm.Model
	ID              string `gorm:"primaryKey"`
	InvoiceNo       string `gorm:"uniqueIndex"`
	PartyID         string `gorm:"index"`
	PartyName       string
	PartyMobile     string
	InvoiceDate     string
	DueDate         string
	PaymentTerms    int
	Status          string // draft, paid, partially_paid, unpaid, cancelled
	Subtotal        float32
	TaxableAmount   float32
	TotalTax        float32
	TotalDiscount   float32
	RoundOff        float32
	GrandTotal      float32
	PaidAmount      float32
	BalanceAmount   float32
	PaymentMethod   string
	Notes           string
	Signature       string
	IsDraft         bool `gorm:"default:false"`
	Items           []PurchaseInvoiceItem `gorm:"foreignKey:InvoiceID"`
	Charges         []PurchaseInvoiceCharge `gorm:"foreignKey:InvoiceID"`
}

type PurchaseInvoiceCharge struct {
	gorm.Model
	ID        string `gorm:"primaryKey"`
	InvoiceID string `gorm:"index"`
	Label     string
	Amount    float32
}

type PurchaseInvoiceItem struct {
	gorm.Model
	ID          string `gorm:"primaryKey"`
	InvoiceID   string `gorm:"index"`
	ProductID   string `gorm:"index"`
	ProductName string
	HSNCode     string
	Quantity    float32
	UnitPrice   float32
	Discount    float32
	TaxRate     float32
	TaxAmount   float32
	Amount      float32
	Barcode     string
}

type SalesReturn struct {
	gorm.Model
	ID              string `gorm:"primaryKey"`
	ReturnNo        string `gorm:"uniqueIndex"`
	InvoiceID       string `gorm:"index"`
	InvoiceNo       string
	PartyID         string `gorm:"index"`
	PartyName       string
	PartyMobile     string
	ReturnDate      string
	Status          string // draft, paid, partially_paid, unpaid, cancelled
	Subtotal        float32
	TaxableAmount   float32
	TotalTax        float32
	TotalDiscount   float32
	RoundOff        float32
	GrandTotal      float32
	PaidAmount      float32
	BalanceAmount   float32
	PaymentMethod   string
	Notes           string
	IsDraft         bool `gorm:"default:false"`
	Items           []SalesReturnItem   `gorm:"foreignKey:ReturnID"`
	Charges         []SalesReturnCharge `gorm:"foreignKey:ReturnID"`
}

type SalesReturnCharge struct {
	gorm.Model
	ID       string `gorm:"primaryKey"`
	ReturnID string `gorm:"index"`
	Label    string
	Amount   float32
}

type SalesReturnItem struct {
	gorm.Model
	ID          string `gorm:"primaryKey"`
	ReturnID    string `gorm:"index"`
	ProductID   string `gorm:"index"`
	ProductName string
	HSNCode     string
	Quantity    float32
	UnitPrice   float32
	Discount    float32
	TaxRate     float32
	TaxAmount   float32
	Amount      float32
	Barcode     string
}

type PurchaseReturn struct {
	gorm.Model
	ID              string `gorm:"primaryKey"`
	ReturnNo        string `gorm:"uniqueIndex"`
	InvoiceID       string `gorm:"index"`
	InvoiceNo       string
	PartyID         string `gorm:"index"`
	PartyName       string
	PartyMobile     string
	ReturnDate      string
	Status          string // draft, completed, cancelled
	Subtotal        float32
	TaxableAmount   float32
	TotalTax        float32
	TotalDiscount   float32
	RoundOff        float32
	GrandTotal      float32
	PaidAmount      float32
	BalanceAmount   float32
	PaymentMethod   string
	Notes           string
	IsDraft         bool `gorm:"default:false"`
	Items           []PurchaseReturnItem   `gorm:"foreignKey:ReturnID"`
	Charges         []PurchaseReturnCharge `gorm:"foreignKey:ReturnID"`
}

type PurchaseReturnCharge struct {
	gorm.Model
	ID       string `gorm:"primaryKey"`
	ReturnID string `gorm:"index"`
	Label    string
	Amount   float32
}

type PurchaseReturnItem struct {
	gorm.Model
	ID          string `gorm:"primaryKey"`
	ReturnID    string `gorm:"index"`
	ProductID   string `gorm:"index"`
	ProductName string
	HSNCode     string
	Quantity    float32
	UnitPrice   float32
	Discount    float32
	TaxRate     float32
	TaxAmount   float32
	Amount      float32
	Barcode     string
}

type Payment struct {
	gorm.Model
	ID            string `gorm:"primaryKey"`
	PaymentNo     string `gorm:"uniqueIndex"`
	PaymentType   string // "receive" or "pay"
	PartyID       string `gorm:"index"`
	PartyName     string
	PaymentDate   string
	Amount        float32
	Discount      float32
	PaymentMode   string // "cash", "bank", "upi", etc.
	ReferenceNo   string
	Notes         string
	Status        string // "submitted", "cancelled"
	Allocations   []PaymentAllocation `gorm:"foreignKey:PaymentID"`
}

type PaymentAllocation struct {
	gorm.Model
	ID              string `gorm:"primaryKey"`
	PaymentID       string `gorm:"index"`
	InvoiceID       string `gorm:"index"`
	AllocatedAmount float32
}

type BankAccount struct {
	gorm.Model
	ID             string  `gorm:"primaryKey" json:"id"`
	AccountName    string  `json:"account_name"`
	BankName       string  `json:"bank_name"`
	AccountNumber  string  `json:"account_number"`
	IFSCCode       string  `json:"ifsc_code"`
	Branch         string  `json:"branch"`
	OpeningBalance float32 `json:"opening_balance"`
	Balance        float32 `json:"balance"`
	IsActive       bool    `gorm:"default:true" json:"is_active"`
	IsCash         bool    `gorm:"default:false" json:"is_cash"` // To distinguish "Cash in-hand"
}

type CashBankTransaction struct {
	gorm.Model
	ID            string  `gorm:"primaryKey" json:"id"`
	Date          string  `json:"date"`
	Type          string  `json:"type"` // deposit, withdraw, transfer, adjustment
	FromAccountID *string `gorm:"index" json:"from_account_id"`
	ToAccountID   *string `gorm:"index" json:"to_account_id"`
	Amount        float32 `json:"amount"`
	ReferenceNo   string  `json:"reference_no"`
	Notes         string  `json:"notes"`
	// Join fields for UI
	FromAccountName string `gorm:"-" json:"from_account_name"`
	ToAccountName   string `gorm:"-" json:"to_account_name"`
}

type ExpenseCategory struct {
	gorm.Model
	ID       string `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"uniqueIndex" json:"name"`
	IsActive bool   `gorm:"default:true" json:"is_active"`
}

type Expense struct {
	gorm.Model
	ID                string  `gorm:"primaryKey" json:"id"`
	ExpenseNo         string  `gorm:"uniqueIndex" json:"expense_no"`
	Date              string  `json:"date"`
	PartyID           string  `gorm:"index" json:"party_id"`
	PartyName         string  `json:"party_name"`
	CategoryID        string  `gorm:"index" json:"category_id"`
	CategoryName      string  `json:"category_name"`
	Amount            float32 `json:"amount"`
	TaxInclusive      bool    `json:"tax_inclusive"`
	OriginalInvoiceNo string  `json:"original_invoice_no"`
	PaymentMode       string  `json:"payment_mode"`
	Notes             string  `json:"notes"`
	Status            string  `json:"status"` // submitted, cancelled
	Items             []ExpenseItem `gorm:"foreignKey:ExpenseID" json:"items"`
}

type ExpenseItem struct {
	gorm.Model
	ID          string  `gorm:"primaryKey" json:"id"`
	ExpenseID   string  `gorm:"index" json:"expense_id"`
	Description string  `json:"description"`
	Amount      float32 `json:"amount"`
}

type Staff struct {
	gorm.Model
	ID          string  `gorm:"primaryKey" json:"id"`
	Name        string  `json:"name"`
	Phone       string  `gorm:"uniqueIndex" json:"phone"`
	Email       string  `json:"email"`
	Role        string  `json:"role"`
	JoiningDate string  `json:"joining_date"`
	Salary      float32 `json:"salary"`
	IsActive    bool    `gorm:"default:true" json:"is_active"`
}

type Attendance struct {
	gorm.Model
	ID      string `gorm:"primaryKey" json:"id"`
	StaffID string `gorm:"index" json:"staff_id"`
	Date    string `gorm:"index" json:"date"`
	Status  string `json:"status"` // Present, Absent, Half Day, Paid Leave, Weekly Off
	Notes   string `json:"notes"`
	// Join field
	StaffName string `gorm:"-" json:"staff_name"`
}

type SalaryPayment struct {
	gorm.Model
	ID          string  `gorm:"primaryKey" json:"id"`
	StaffID     string  `gorm:"index" json:"staff_id"`
	PaymentDate string  `json:"payment_date"`
	Month       string  `json:"month"`
	Year        int     `json:"year"`
	Amount      float32 `json:"amount"`
	PaymentMode string  `json:"payment_mode"`
	ReferenceNo string  `json:"reference_no"`
	Notes       string  `json:"notes"`
	// Join field
	StaffName string `gorm:"-" json:"staff_name"`
}

// AutoMigrate runs the gorm auto migration for the defined models
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&Category{},
		&Product{},
		&Customer{},
		&Party{},
		&SalesInvoice{},
		&SalesInvoiceItem{},
		&SalesInvoiceCharge{},
		&PurchaseInvoice{},
		&PurchaseInvoiceItem{},
		&PurchaseInvoiceCharge{},
		&Payment{},
		&PaymentAllocation{},
		&SalesReturn{},
		&SalesReturnItem{},
		&SalesReturnCharge{},
		&PurchaseReturn{},
		&PurchaseReturnItem{},
		&PurchaseReturnCharge{},
		&BankAccount{},
		&CashBankTransaction{},
		&ExpenseCategory{},
		&Expense{},
		&ExpenseItem{},
		&Staff{},
		&Attendance{},
		&SalaryPayment{},
	)
}
