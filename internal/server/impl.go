package server

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"pos-api/internal/models"
	"pos-api/internal/sales"
	"pos-api/internal/validator"
	"strings"
	"time"
)

func (s *ServerImpl) GetAccountingAccounts(c *gin.Context, params GetAccountingAccountsParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostAccountingAccounts(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetAccountingAccountsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutAccountingAccountsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetAccountingAccountsIdLedger(c *gin.Context, id string, params GetAccountingAccountsIdLedgerParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetAccountingBalanceSheet(c *gin.Context, params GetAccountingBalanceSheetParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetAccountingCashFlow(c *gin.Context, params GetAccountingCashFlowParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetAccountingJournalEntries(c *gin.Context, params GetAccountingJournalEntriesParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostAccountingJournalEntries(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeleteAccountingJournalEntriesId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetAccountingJournalEntriesId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostAccountingJournalEntriesIdSubmit(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostAccountingPeriodClosing(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetAccountingProfitAndLoss(c *gin.Context, params GetAccountingProfitAndLossParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetAccountingTrialBalance(c *gin.Context, params GetAccountingTrialBalanceParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostAuthChangePassword(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostAuthForgotPassword(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostAuthLogin(c *gin.Context) {
	var body LoginRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	v := validator.New()
	v.Required("username", body.Username, "Username is required")
	v.Required("password", body.Password, "Password is required")

	if v.HasErrors() {
		var firstErr string
		for _, errs := range v.Errors {
			if len(errs) > 0 {
				firstErr = errs[0]
				break
			}
		}
		c.JSON(400, gin.H{"error": firstErr, "errors": v.Errors})
		return
	}

	resp, err := s.authService.Login(body.Username, body.Password)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	role := UserRole(resp.User.Role)
	c.JSON(200, LoginResponse{
		AccessToken: &resp.AccessToken,
		User: &User{
			Id:       &resp.User.ID,
			Name:     &resp.User.Name,
			Email:    &resp.User.Email,
			Role:     &role,
			IsActive: &resp.User.IsActive,
		},
	})
}

func (s *ServerImpl) PostAuthLogout(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Logged out successfully"})
}

func (s *ServerImpl) GetAuthMe(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	resp, err := s.authService.GetMe(userID.(string))
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	role := UserRole(resp.Role)
	c.JSON(200, User{
		Id:       &resp.ID,
		Name:     &resp.Name,
		Email:    &resp.Email,
		Role:     &role,
		IsActive: &resp.IsActive,
	})
}

func (s *ServerImpl) PostAuthRefresh(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostAuthResetPassword(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostBarcodeGenerate(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetBarcodeLookup(c *gin.Context, params GetBarcodeLookupParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostBarcodePrintLabels(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetCategories(c *gin.Context, params GetCategoriesParams) {
	storeID := s.getStoreID(c)
	categories, err := s.categoriesService.GetCategories(storeID, params.Flat, params.ParentId)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, categories)
}

func (s *ServerImpl) PostCategories(c *gin.Context) {
	storeID := s.getStoreID(c)
	var cat models.Category
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	v := validator.New()
	v.Required("name", cat.Name, "Category Name is required")
	if v.HasErrors() {
		var firstErr string
		for _, errs := range v.Errors {
			if len(errs) > 0 {
				firstErr = errs[0]
				break
			}
		}
		c.JSON(400, gin.H{"error": firstErr, "errors": v.Errors})
		return
	}

	if cat.ID == "" {
		cat.ID = uuid.New().String()
	}

	created, err := s.categoriesService.CreateCategory(storeID, &cat)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, created)
}

func (s *ServerImpl) DeleteCategoriesId(c *gin.Context, id string) {
	storeID := s.getStoreID(c)
	if err := s.categoriesService.DeleteCategory(storeID, id); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(204, nil)
}

func (s *ServerImpl) GetCategoriesId(c *gin.Context, id string) {
	storeID := s.getStoreID(c)
	cat, err := s.categoriesService.GetCategoryByID(storeID, id)
	if err != nil {
		c.JSON(404, gin.H{"error": "Category not found"})
		return
	}
	c.JSON(200, cat)
}

func (s *ServerImpl) PutCategoriesId(c *gin.Context, id string) {
	storeID := s.getStoreID(c)
	var update models.Category
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	v := validator.New()
	v.Required("name", update.Name, "Category Name is required")
	if v.HasErrors() {
		var firstErr string
		for _, errs := range v.Errors {
			if len(errs) > 0 {
				firstErr = errs[0]
				break
			}
		}
		c.JSON(400, gin.H{"error": firstErr, "errors": v.Errors})
		return
	}

	updated, err := s.categoriesService.UpdateCategory(storeID, id, &update)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, updated)
}

func (s *ServerImpl) PostCategoriesBulkAction(c *gin.Context) {
	storeID := s.getStoreID(c)
	var body struct {
		Action string   `json:"action"`
		Ids    []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := s.categoriesService.BulkAction(storeID, body.Action, body.Ids); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"status": "success", "message": "Action executed successfully"})
}

func (s *ServerImpl) GetCategoriesBulkExport(c *gin.Context) {
	storeID := s.getStoreID(c)
	categories, err := s.categoriesService.GetCategories(storeID, nil, nil)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=categories_export.csv")
	c.Header("Content-Type", "text/csv")

	var builder strings.Builder
	builder.WriteString("ID,Name,SKU,Status,Created At,Updated At\n")
	for _, cat := range categories {
		status := "Inactive"
		if cat.IsActive {
			status = "Active"
		}
		builder.WriteString(fmt.Sprintf("%s,%s,%s,%s,%s,%s\n",
			cat.ID,
			strings.ReplaceAll(cat.Name, ",", " "),
			strings.ReplaceAll(cat.SKU, ",", " "),
			status,
			cat.CreatedAt.Format(time.RFC3339),
			cat.UpdatedAt.Format(time.RFC3339),
		))
	}

	c.String(200, builder.String())
}

func (s *ServerImpl) GetCompany(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutCompany(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostCompanyLogo(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetCustomers(c *gin.Context, params GetCustomersParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostCustomers(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeleteCustomersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetCustomersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutCustomersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetCustomersIdInvoices(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetCustomersIdLedger(c *gin.Context, id string, params GetCustomersIdLedgerParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetCustomersIdLoyalty(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostCustomersIdLoyaltyAdjust(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostCustomersIdSendStatement(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetExpenses(c *gin.Context, params GetExpensesParams) {
	var expenses []models.Expense
	query := s.db.Preload("Items").Model(&models.Expense{})

	if params.Category != nil && *params.Category != "" {
		query = query.Where("category_id = ? OR category_name = ?", *params.Category, *params.Category)
	}
	if params.FromDate != nil {
		query = query.Where("date >= ?", params.FromDate.String())
	}
	if params.ToDate != nil {
		query = query.Where("date <= ?", params.ToDate.String())
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

	if err := query.Offset((page - 1) * perPage).Limit(perPage).Order("date desc, created_at desc").Find(&expenses).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"data": expenses,
		"meta": gin.H{
			"page":        page,
			"per_page":    perPage,
			"total":       total,
			"total_pages": (int(total) + perPage - 1) / perPage,
		},
	})
}

func (s *ServerImpl) PostExpenses(c *gin.Context) {
	var expense models.Expense
	if err := c.ShouldBindJSON(&expense); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if expense.ID == "" {
		expense.ID = uuid.New().String()
	}
	if expense.ExpenseNo == "" {
		// Basic expense number generation if not provided
		var count int64
		s.db.Model(&models.Expense{}).Count(&count)
		expense.ExpenseNo = fmt.Sprintf("EXP-%05d", count+1)
	}
	expense.Status = "submitted"

	// Ensure items have IDs and ExpenseID
	for i := range expense.Items {
		if expense.Items[i].ID == "" {
			expense.Items[i].ID = uuid.New().String()
		}
		expense.Items[i].ExpenseID = expense.ID
	}

	if err := s.db.Create(&expense).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, expense)
}

func (s *ServerImpl) GetExpensesCategories(c *gin.Context) {
	var categories []models.ExpenseCategory
	if err := s.db.Where("is_active = ?", true).Find(&categories).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, categories)
}

func (s *ServerImpl) PostExpensesCategories(c *gin.Context) {
	var cat models.ExpenseCategory
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if cat.ID == "" {
		cat.ID = uuid.New().String()
	}
	if err := s.db.Create(&cat).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, cat)
}

func (s *ServerImpl) DeleteExpensesId(c *gin.Context, id string) {
	if err := s.db.Delete(&models.Expense{}, "id = ?", id).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(204, nil)
}

func (s *ServerImpl) GetExpensesId(c *gin.Context, id string) {
	var expense models.Expense
	if err := s.db.Preload("Items").First(&expense, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Expense not found"})
		return
	}
	c.JSON(200, expense)
}

func (s *ServerImpl) PutExpensesId(c *gin.Context, id string) {
	var expense models.Expense
	if err := s.db.First(&expense, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Expense not found"})
		return
	}

	var update models.Expense
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	update.ID = id // Ensure ID remains the same

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Delete old items
		if err := tx.Delete(&models.ExpenseItem{}, "expense_id = ?", id).Error; err != nil {
			return err
		}
		// Save expense
		if err := tx.Save(&update).Error; err != nil {
			return err
		}
		// Items are saved via association if using GORM Save with correct setup,
		// but since we deleted them, we should ensure they are recreated.
		for i := range update.Items {
			if update.Items[i].ID == "" {
				update.Items[i].ID = uuid.New().String()
			}
			update.Items[i].ExpenseID = id
			if err := tx.Create(&update.Items[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, update)
}

func (s *ServerImpl) PostExpensesIdReceipt(c *gin.Context, id string) {
	// Mock file upload
	c.JSON(200, gin.H{"receipt_url": "https://via.placeholder.com/150"})
}

func (s *ServerImpl) PostExpensesBulkAction(c *gin.Context) {
	var body struct {
		Action string   `json:"action"`
		Ids    []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	switch body.Action {
	case "delete":
		if err := s.db.Delete(&models.Expense{}, "id IN ?", body.Ids).Error; err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	case "cancel":
		if err := s.db.Model(&models.Expense{}).Where("id IN ?", body.Ids).Update("status", "cancelled").Error; err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	case "export":
		// Mock export
	}

	c.JSON(200, gin.H{"status": "success", "message": "Action executed successfully"})
}

func (s *ServerImpl) PostGstEinvoiceCancel(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostGstEinvoiceGenerate(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetGstEinvoiceInvoiceId(c *gin.Context, invoiceId string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostGstEwaybillCancel(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostGstEwaybillGenerate(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetGstEwaybillEwbNo(c *gin.Context, ewbNo string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostGstEwaybillEwbNoExtend(c *gin.Context, ewbNo string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetGstGstr1(c *gin.Context, params GetGstGstr1Params) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetGstGstr2(c *gin.Context, params GetGstGstr2Params) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetGstGstr3b(c *gin.Context, params GetGstGstr3bParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetGstHsnRates(c *gin.Context, params GetGstHsnRatesParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetGstSummary(c *gin.Context, params GetGstSummaryParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetInventoryBalance(c *gin.Context, params GetInventoryBalanceParams) {
	var products []models.Product
	query := s.db.Model(&models.Product{})

	if params.CategoryId != nil && *params.CategoryId != "" {
		query = query.Where("category_id = ?", *params.CategoryId)
	}

	if params.LowStockOnly != nil && *params.LowStockOnly {
		query = query.Where("stock_quantity <= low_stock_quantity AND low_stock_warning = ?", true)
	}

	if err := query.Find(&products).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Calculate summary if requested via a custom header or just return in a wrapper
	// For now, let's just return the data as required by OpenAPI
	// But we'll add a "summary" field in the response which Gin allows

	var totalValue float32
	var lowStockCount int
	var expiringCount int

	importTime := "2026-04-24" // Current date for mock expiry logic

	for _, p := range products {
		totalValue += p.StockQuantity * p.PurchasePrice
		if p.LowStockWarning && p.StockQuantity <= p.LowStockQuantity {
			lowStockCount++
		}
		if p.ExpiryDate != nil && *p.ExpiryDate != "" && *p.ExpiryDate < importTime {
			expiringCount++
		}
	}

	c.JSON(200, gin.H{
		"data": products,
		"summary": gin.H{
			"total_value":     totalValue,
			"low_stock_count": lowStockCount,
			"expiring_count":  expiringCount,
		},
	})
}

func (s *ServerImpl) GetInventoryBatchSerials(c *gin.Context, params GetInventoryBatchSerialsParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetInventoryEntries(c *gin.Context, params GetInventoryEntriesParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostInventoryEntries(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostInventoryOpeningStock(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetInventoryTransfers(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostInventoryTransfers(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetInventoryTransfersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutInventoryTransfersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostInventoryTransfersIdReceive(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostInventoryTransfersIdSubmit(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetNotificationsLogs(c *gin.Context, params GetNotificationsLogsParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostNotificationsPaymentReminder(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostNotificationsSend(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetNotificationsTemplates(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostNotificationsTemplates(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeleteNotificationsTemplatesId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutNotificationsTemplatesId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetOutlets(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostOutlets(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeleteOutletsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetOutletsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutOutletsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetOutletsIdPosConfig(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutOutletsIdPosConfig(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPaymentGatewayConfig(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutPaymentGatewayConfig(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPaymentGatewayInitiate(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPaymentGatewayRefund(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPaymentGatewayStatusTransactionId(c *gin.Context, transactionId string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPaymentGatewayWebhook(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPayments(c *gin.Context, params GetPaymentsParams) {
	var payments []models.Payment
	query := s.db.Model(&models.Payment{})

	if params.PaymentType != nil {
		query = query.Where("payment_type = ?", string(*params.PaymentType))
	}
	if params.PartyId != nil {
		query = query.Where("party_id = ?", *params.PartyId)
	}
	if params.FromDate != nil {
		query = query.Where("payment_date >= ?", params.FromDate.String())
	}
	if params.ToDate != nil {
		query = query.Where("payment_date <= ?", params.ToDate.String())
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

	if err := query.Offset((page - 1) * perPage).Limit(perPage).Order("created_at desc").Find(&payments).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"data": payments,
		"meta": gin.H{
			"page":        page,
			"per_page":    perPage,
			"total":       total,
			"total_pages": (int(total) + perPage - 1) / perPage,
		},
	})
}

func (s *ServerImpl) PostPayments(c *gin.Context) {
	var body PaymentEntry
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	payment := models.Payment{
		ID:          uuid.New().String(),
		PaymentNo:   *body.PaymentNo,
		PaymentType: string(*body.PaymentType),
		PartyID:     *body.PartyId,
		PaymentDate: body.PaymentDate.String(),
		Amount:      *body.Amount,
		Discount:    *body.Discount,
		PaymentMode: string(*body.Mode),
		ReferenceNo: *body.ReferenceNo,
		Notes:       *body.Notes,
		Status:      "submitted",
	}

	if body.Id != nil && *body.Id != "" {
		payment.ID = *body.Id
	}

	// Get Party Name
	var party models.Party
	if err := s.db.Where("id = ?", payment.PartyID).First(&party).Error; err == nil {
		payment.PartyName = party.Name
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&payment).Error; err != nil {
			return err
		}

		// Handle Allocations if any
		if body.Allocations != nil {
			for _, alloc := range *body.Allocations {
				tx.Create(&models.PaymentAllocation{
					ID:              uuid.New().String(),
					PaymentID:       payment.ID,
					InvoiceID:       *alloc.InvoiceId,
					AllocatedAmount: *alloc.AllocatedAmount,
				})
			}
		}

		// Update Party Balance
		// For "receive", balance decreases (customer owes less)
		// For "pay", balance decreases (we owe vendor less)
		// Assuming balance is absolute debt
		if payment.PaymentType == "receive" {
			if err := tx.Model(&models.Party{}).Where("id = ?", payment.PartyID).
				UpdateColumn("balance", gorm.Expr("balance - ?", payment.Amount+payment.Discount)).Error; err != nil {
				return err
			}
		} else if payment.PaymentType == "pay" {
			if err := tx.Model(&models.Party{}).Where("id = ?", payment.PartyID).
				UpdateColumn("balance", gorm.Expr("balance - ?", payment.Amount+payment.Discount)).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, payment)
}

func (s *ServerImpl) GetPaymentsOutstanding(c *gin.Context, params GetPaymentsOutstandingParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeletePaymentsId(c *gin.Context, id string) {
	var payment models.Payment
	if err := s.db.First(&payment, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Payment not found"})
		return
	}

	if payment.Status == "cancelled" {
		c.JSON(400, gin.H{"error": "Payment already cancelled"})
		return
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&payment).Update("status", "cancelled").Error; err != nil {
			return err
		}

		// Revert Party Balance
		if payment.PaymentType == "receive" || payment.PaymentType == "pay" {
			if err := tx.Model(&models.Party{}).Where("id = ?", payment.PartyID).
				UpdateColumn("balance", gorm.Expr("balance + ?", payment.Amount+payment.Discount)).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Payment cancelled"})
}

func (s *ServerImpl) GetPaymentsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPaymentsBulkAction(c *gin.Context) {
	var body struct {
		Action string   `json:"action"`
		Ids    []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	switch body.Action {
	case "delete":
		for _, id := range body.Ids {
			var payment models.Payment
			if err := s.db.First(&payment, "id = ?", id).Error; err == nil {
				if payment.Status != "cancelled" {
					s.db.Transaction(func(tx *gorm.DB) error {
						tx.Model(&payment).Update("status", "cancelled")
						tx.Model(&models.Party{}).Where("id = ?", payment.PartyID).
							UpdateColumn("balance", gorm.Expr("balance + ?", payment.Amount+payment.Discount))
						return nil
					})
				}
				s.db.Delete(&payment)
			}
		}
	case "cancel":
		for _, id := range body.Ids {
			var payment models.Payment
			if err := s.db.First(&payment, "id = ?", id).Error; err == nil && payment.Status != "cancelled" {
				s.db.Transaction(func(tx *gorm.DB) error {
					tx.Model(&payment).Update("status", "cancelled")
					tx.Model(&models.Party{}).Where("id = ?", payment.PartyID).
						UpdateColumn("balance", gorm.Expr("balance + ?", payment.Amount+payment.Discount))
					return nil
				})
			}
		}
	case "export":
		// Mock export
	}

	c.JSON(200, gin.H{"status": "success"})
}

func (s *ServerImpl) GetPosSessions(c *gin.Context, params GetPosSessionsParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPosSessions(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPosSessionsActive(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPosSessionsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPosSessionsIdCashMovements(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPosSessionsIdCashMovements(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPosSessionsIdClose(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPosSessionsIdSummary(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetProducts(c *gin.Context, params GetProductsParams) {
	var q string
	if params.Q != nil {
		q = *params.Q
	}
	var categoryID string
	if params.CategoryId != nil {
		categoryID = *params.CategoryId
	}
	var page int
	if params.Page != nil {
		page = *params.Page
	}
	if page <= 0 {
		page = 1
	}
	var perPage int
	if params.PerPage != nil {
		perPage = *params.PerPage
	}
	if perPage <= 0 {
		perPage = 20
	}

	products, total, err := s.itemsService.GetProducts(q, categoryID, params.IsActive, params.LowStock, page, perPage)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"data": products,
		"meta": gin.H{
			"page":        page,
			"per_page":    perPage,
			"total":       total,
			"total_pages": (int(total) + perPage - 1) / perPage,
		},
	})
}

func (s *ServerImpl) PostProducts(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if product.ID == "" {
		product.ID = uuid.New().String()
	}
	if product.SKU == "" {
		product.SKU = "SKU-" + uuid.New().String()[:8]
	}

	created, err := s.itemsService.CreateProduct(&product)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, created)
}

func (s *ServerImpl) PostProductsBulkAction(c *gin.Context) {
	var body struct {
		Action string   `json:"action"`
		Ids    []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if err := s.itemsService.BulkAction(body.Action, body.Ids); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"status": "success", "message": "Action executed successfully"})
}

func (s *ServerImpl) GetProductsBulkExport(c *gin.Context, params GetProductsBulkExportParams) {
	products, err := s.itemsService.BulkExport()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=products_export.csv")
	c.Header("Content-Type", "text/csv")

	var builder strings.Builder
	builder.WriteString("ID,Name,SKU,Item Code,Barcode,Product Type,Measuring Unit,Sale Price,Wholesale Price,Purchase Price,GST Rate,Stock Quantity,Status\n")
	for _, p := range products {
		status := "Inactive"
		if p.IsActive {
			status = "Active"
		}
		builder.WriteString(fmt.Sprintf("%s,%s,%s,%s,%s,%s,%s,%.2f,%.2f,%.2f,%.2f,%.2f,%s\n",
			p.ID,
			strings.ReplaceAll(p.Name, ",", " "),
			strings.ReplaceAll(p.SKU, ",", " "),
			strings.ReplaceAll(p.ItemCode, ",", " "),
			strings.ReplaceAll(p.Barcode, ",", " "),
			p.ProductType,
			strings.ReplaceAll(p.MeasuringUnit, ",", " "),
			p.SalePrice,
			p.WholesalePrice,
			p.PurchasePrice,
			p.GSTRate,
			p.StockQuantity,
			status,
		))
	}

	c.String(200, builder.String())
}

func (s *ServerImpl) PostProductsBulkImport(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeleteProductsId(c *gin.Context, id string) {
	if err := s.itemsService.DeleteProduct(id); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Product soft-deleted successfully"})
}

func (s *ServerImpl) GetProductsId(c *gin.Context, id string) {
	product, err := s.itemsService.GetProductByID(id)
	if err != nil {
		c.JSON(404, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(200, product)
}

func (s *ServerImpl) PutProductsId(c *gin.Context, id string) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	updated, err := s.itemsService.UpdateProduct(id, &product)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, updated)
}

func (s *ServerImpl) PostProductsIdImage(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetProductsIdPriceHistory(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetProductsIdVariants(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostProductsIdVariants(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPurchaseBills(c *gin.Context, params GetPurchaseBillsParams) {
	var invoices []models.PurchaseInvoice
	query := s.db.Preload("Items").Preload("Charges").Model(&models.PurchaseInvoice{})

	if params.Status != nil && *params.Status != "" {
		query = query.Where("status = ?", *params.Status)
	}
	if params.VendorId != nil && *params.VendorId != "" {
		query = query.Where("party_id = ?", *params.VendorId)
	}

	var total int64
	query.Count(&total)

	page := 1
	if params.Page != nil {
		page = *params.Page
	}
	perPage := 20
	// PerPage is not in GetPurchaseBillsParams but we'll use a default

	if err := query.Offset((page - 1) * perPage).Limit(perPage).Order("created_at desc").Find(&invoices).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Calculate summary stats
	var stats struct {
		TotalPurchase float32 `json:"total_purchase"`
		PaidAmount    float32 `json:"paid_amount"`
		UnpaidAmount  float32 `json:"unpaid_amount"`
	}

	s.db.Model(&models.PurchaseInvoice{}).Where("status != ?", "cancelled").Select("SUM(grand_total)").Scan(&stats.TotalPurchase)
	s.db.Model(&models.PurchaseInvoice{}).Where("status != ?", "cancelled").Select("SUM(paid_amount)").Scan(&stats.PaidAmount)
	s.db.Model(&models.PurchaseInvoice{}).Where("status != ?", "cancelled").Select("SUM(balance_amount)").Scan(&stats.UnpaidAmount)

	c.JSON(200, gin.H{
		"data":    invoices,
		"summary": stats,
		"meta": gin.H{
			"page":        page,
			"per_page":    perPage,
			"total":       total,
			"total_pages": (int(total) + perPage - 1) / perPage,
		},
	})
}

func (s *ServerImpl) PostPurchaseBills(c *gin.Context) {
	var invoice models.PurchaseInvoice
	if err := c.ShouldBindJSON(&invoice); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if invoice.ID == "" {
		invoice.ID = uuid.New().String()
	}

	// Calculate totals if not provided or to ensure correctness
	var subtotal float32
	var totalTax float32
	var totalDiscount float32

	for i := range invoice.Items {
		if invoice.Items[i].ID == "" {
			invoice.Items[i].ID = uuid.New().String()
		}
		invoice.Items[i].InvoiceID = invoice.ID

		itemAmount := invoice.Items[i].Quantity * invoice.Items[i].UnitPrice
		lineDiscount := invoice.Items[i].Discount
		taxableLine := itemAmount - lineDiscount
		lineTax := taxableLine * (invoice.Items[i].TaxRate / 100)

		invoice.Items[i].TaxAmount = lineTax
		invoice.Items[i].Amount = taxableLine + lineTax

		subtotal += itemAmount
		totalDiscount += lineDiscount
		totalTax += lineTax

		// Update stock (increment for purchase)
		if invoice.Status != "draft" && invoice.Status != "cancelled" {
			s.db.Model(&models.Product{}).Where("id = ?", invoice.Items[i].ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", invoice.Items[i].Quantity))
		}
	}

	for i := range invoice.Charges {
		if invoice.Charges[i].ID == "" {
			invoice.Charges[i].ID = uuid.New().String()
		}
		invoice.Charges[i].InvoiceID = invoice.ID
	}

	invoice.Subtotal = subtotal
	invoice.TotalTax = totalTax
	invoice.TotalDiscount = totalDiscount
	// invoice.GrandTotal and other fields should be handled by the frontend or calculated here

	if err := s.db.Create(&invoice).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, invoice)
}

func (s *ServerImpl) GetPurchaseBillDetail(c *gin.Context) {
	id := c.Param("id")
	var invoice models.PurchaseInvoice
	if err := s.db.Preload("Items").Preload("Charges").Where("id = ?", id).First(&invoice).Error; err != nil {
		c.JSON(404, gin.H{"error": "Purchase invoice not found"})
		return
	}
	c.JSON(200, invoice)
}

func (s *ServerImpl) PutPurchaseBillDetail(c *gin.Context) {
	id := c.Param("id")
	var existing models.PurchaseInvoice
	if err := s.db.Preload("Items").Where("id = ?", id).First(&existing).Error; err != nil {
		c.JSON(404, gin.H{"error": "Purchase invoice not found"})
		return
	}

	var updated models.PurchaseInvoice
	if err := c.ShouldBindJSON(&updated); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Handle stock reversal if cancelling or if quantities changed
	if updated.Status == "cancelled" && existing.Status != "cancelled" && existing.Status != "draft" {
		for _, item := range existing.Items {
			s.db.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity))
		}
	}

	// Simplified: delete old items and charges and re-create them
	// In a real app, you'd update them more carefully
	s.db.Unscoped().Where("invoice_id = ?", id).Delete(&models.PurchaseInvoiceItem{})
	s.db.Unscoped().Where("invoice_id = ?", id).Delete(&models.PurchaseInvoiceCharge{})

	updated.ID = id
	for i := range updated.Items {
		if updated.Items[i].ID == "" {
			updated.Items[i].ID = uuid.New().String()
		}
		updated.Items[i].InvoiceID = id
	}
	for i := range updated.Charges {
		if updated.Charges[i].ID == "" {
			updated.Charges[i].ID = uuid.New().String()
		}
		updated.Charges[i].InvoiceID = id
	}

	if err := s.db.Save(&updated).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, updated)
}

func (s *ServerImpl) DeletePurchaseBillDetail(c *gin.Context) {
	id := c.Param("id")
	var invoice models.PurchaseInvoice
	if err := s.db.Preload("Items").Where("id = ?", id).First(&invoice).Error; err != nil {
		c.JSON(404, gin.H{"error": "Purchase invoice not found"})
		return
	}

	// Revert stock if not draft and not already cancelled
	if invoice.Status != "draft" && invoice.Status != "cancelled" {
		for _, item := range invoice.Items {
			s.db.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity))
		}
	}

	s.db.Unscoped().Where("invoice_id = ?", id).Delete(&models.PurchaseInvoiceItem{})
	s.db.Unscoped().Where("invoice_id = ?", id).Delete(&models.PurchaseInvoiceCharge{})
	s.db.Delete(&invoice)

	c.JSON(200, gin.H{"message": "Deleted successfully"})
}

func (s *ServerImpl) GetPurchaseOrders(c *gin.Context, params GetPurchaseOrdersParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPurchaseOrders(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeletePurchaseOrdersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPurchaseOrdersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutPurchaseOrdersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPurchaseOrdersIdPdf(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPurchaseOrdersIdSubmit(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPurchaseReceipts(c *gin.Context, params GetPurchaseReceiptsParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPurchaseReceipts(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPurchaseReceiptsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutPurchaseReceiptsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostPurchaseReceiptsIdSubmit(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetPurchaseReturns(c *gin.Context) {
	var returns []models.PurchaseReturn
	query := s.db.Model(&models.PurchaseReturn{}).Preload("Items").Preload("Charges")

	if partyId := c.Query("party_id"); partyId != "" {
		query = query.Where("party_id = ?", partyId)
	}

	var total int64
	query.Count(&total)

	if err := query.Order("created_at desc").Find(&returns).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"data": returns,
		"meta": gin.H{
			"total": total,
		},
	})
}

func (s *ServerImpl) PostPurchaseReturns(c *gin.Context) {
	var pr models.PurchaseReturn
	if err := c.ShouldBindJSON(&pr); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if pr.ID == "" {
		pr.ID = uuid.New().String()
	}
	if pr.ReturnNo == "" {
		pr.ReturnNo = "PR-" + uuid.New().String()[:8]
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&pr).Error; err != nil {
			return err
		}

		// Update Stock for each item (Decrement for return to vendor)
		for _, item := range pr.Items {
			if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		// Update Party Balance (Decrease debt to vendor)
		if err := tx.Model(&models.Party{}).Where("id = ?", pr.PartyID).
			UpdateColumn("balance", gorm.Expr("balance - ?", pr.GrandTotal)).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, pr)
}

func (s *ServerImpl) GetPurchaseReturnsId(c *gin.Context) {
	id := c.Param("id")
	var pr models.PurchaseReturn
	if err := s.db.Preload("Items").Preload("Charges").First(&pr, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Purchase Return not found"})
		return
	}
	c.JSON(200, pr)
}

func (s *ServerImpl) PutPurchaseReturnsId(c *gin.Context) {
	id := c.Param("id")
	var pr models.PurchaseReturn
	if err := s.db.First(&pr, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Purchase Return not found"})
		return
	}

	var input models.PurchaseReturn
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Revert old stock changes
		var oldItems []models.PurchaseReturnItem
		tx.Where("return_id = ?", pr.ID).Find(&oldItems)
		for _, item := range oldItems {
			tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", item.Quantity))
		}

		// Revert old balance
		tx.Model(&models.Party{}).Where("id = ?", pr.PartyID).
			UpdateColumn("balance", gorm.Expr("balance + ?", pr.GrandTotal))

		// Delete old items and charges
		tx.Where("return_id = ?", pr.ID).Delete(&models.PurchaseReturnItem{})
		tx.Where("return_id = ?", pr.ID).Delete(&models.PurchaseReturnCharge{})

		// Update return record
		input.ID = pr.ID
		if err := tx.Save(&input).Error; err != nil {
			return err
		}

		// Apply new stock changes
		for _, item := range input.Items {
			if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		// Apply new balance change
		if err := tx.Model(&models.Party{}).Where("id = ?", input.PartyID).
			UpdateColumn("balance", gorm.Expr("balance - ?", input.GrandTotal)).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, input)
}

func (s *ServerImpl) DeletePurchaseReturnsId(c *gin.Context) {
	id := c.Param("id")
	var pr models.PurchaseReturn
	if err := s.db.First(&pr, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Purchase Return not found"})
		return
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Revert stock changes
		var items []models.PurchaseReturnItem
		tx.Where("return_id = ?", pr.ID).Find(&items)
		for _, item := range items {
			tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", item.Quantity))
		}

		// Revert balance change
		tx.Model(&models.Party{}).Where("id = ?", pr.PartyID).
			UpdateColumn("balance", gorm.Expr("balance + ?", pr.GrandTotal))

		// Delete record and children
		tx.Where("return_id = ?", pr.ID).Delete(&models.PurchaseReturnItem{})
		tx.Where("return_id = ?", pr.ID).Delete(&models.PurchaseReturnCharge{})
		tx.Delete(&pr)

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Purchase Return deleted"})
}

func (s *ServerImpl) PostPurchaseReturnsBulkAction(c *gin.Context) {
	var body struct {
		Action string   `json:"action"`
		Ids    []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	switch body.Action {
	case "delete":
		for _, id := range body.Ids {
			var pr models.PurchaseReturn
			if err := s.db.First(&pr, "id = ?", id).Error; err == nil {
				s.db.Transaction(func(tx *gorm.DB) error {
					var items []models.PurchaseReturnItem
					tx.Where("return_id = ?", pr.ID).Find(&items)
					for _, item := range items {
						tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
							UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", item.Quantity))
					}
					tx.Model(&models.Party{}).Where("id = ?", pr.PartyID).
						UpdateColumn("balance", gorm.Expr("balance + ?", pr.GrandTotal))
					tx.Where("return_id = ?", pr.ID).Delete(&models.PurchaseReturnItem{})
					tx.Where("return_id = ?", pr.ID).Delete(&models.PurchaseReturnCharge{})
					tx.Delete(&pr)
					return nil
				})
			}
		}
	case "cancel":
		for _, id := range body.Ids {
			var pr models.PurchaseReturn
			if err := s.db.First(&pr, "id = ?", id).Error; err == nil && pr.Status != "cancelled" {
				s.db.Transaction(func(tx *gorm.DB) error {
					var items []models.PurchaseReturnItem
					tx.Where("return_id = ?", pr.ID).Find(&items)
					for _, item := range items {
						tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
							UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", item.Quantity))
					}
					tx.Model(&models.Party{}).Where("id = ?", pr.PartyID).
						UpdateColumn("balance", gorm.Expr("balance + ?", pr.GrandTotal))
					tx.Model(&pr).Update("status", "cancelled")
					return nil
				})
			}
		}
	}

	c.JSON(200, gin.H{"status": "success"})
}

func (s *ServerImpl) GetReportsDayBook(c *gin.Context, params GetReportsDayBookParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsDiscountAnalysis(c *gin.Context, params GetReportsDiscountAnalysisParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsExpiryAlert(c *gin.Context, params GetReportsExpiryAlertParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsExportReportType(c *gin.Context, reportType string, params GetReportsExportReportTypeParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsLowStock(c *gin.Context, params GetReportsLowStockParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsPartyBalance(c *gin.Context, params GetReportsPartyBalanceParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsPaymentCollection(c *gin.Context, params GetReportsPaymentCollectionParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsProfitByProduct(c *gin.Context, params GetReportsProfitByProductParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsPurchaseSummary(c *gin.Context, params GetReportsPurchaseSummaryParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsSalesByCashier(c *gin.Context, params GetReportsSalesByCashierParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsSalesByCategory(c *gin.Context, params GetReportsSalesByCategoryParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsSalesByCustomer(c *gin.Context, params GetReportsSalesByCustomerParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsSalesByProduct(c *gin.Context, params GetReportsSalesByProductParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsSalesSummary(c *gin.Context, params GetReportsSalesSummaryParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsStockMovement(c *gin.Context, params GetReportsStockMovementParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetReportsStockValuation(c *gin.Context, params GetReportsStockValuationParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSalesInvoices(c *gin.Context, params GetSalesInvoicesParams) {
	storeID := s.getStoreID(c)
	var fromDateStr, toDateStr *string
	if params.FromDate != nil {
		s := params.FromDate.String()
		fromDateStr = &s
	}
	if params.ToDate != nil {
		s := params.ToDate.String()
		toDateStr = &s
	}

	invoices, total, stats, err := s.salesService.GetInvoices(storeID, sales.GetInvoicesParams{
		Status:     params.Status,
		CustomerId: params.CustomerId,
		FromDate:   fromDateStr,
		ToDate:     toDateStr,
		Q:          params.Q,
		Page:       params.Page,
		PerPage:    params.PerPage,
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	page := 1
	if params.Page != nil {
		page = *params.Page
	}
	perPage := 20
	if params.PerPage != nil {
		perPage = *params.PerPage
	}

	c.JSON(200, gin.H{
		"data":    invoices,
		"summary": stats,
		"meta": gin.H{
			"page":        page,
			"per_page":    perPage,
			"total":       total,
			"total_pages": (int(total) + perPage - 1) / perPage,
		},
	})
}

func (s *ServerImpl) PostSalesInvoices(c *gin.Context) {
	storeID := s.getStoreID(c)
	var body struct {
		models.SalesInvoice
		Items   []models.SalesInvoiceItem   `json:"items"`
		Charges []models.SalesInvoiceCharge `json:"charges"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	invoice, err := s.salesService.CreateInvoice(storeID, &body.SalesInvoice, body.Items, body.Charges)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, invoice)
}

func (s *ServerImpl) PostSalesInvoicesCalculateTax(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSalesInvoicesId(c *gin.Context, id string) {
	storeID := s.getStoreID(c)
	invoice, err := s.salesService.GetInvoiceByID(storeID, id)
	if err != nil {
		c.JSON(404, gin.H{"error": "Invoice not found"})
		return
	}
	c.JSON(200, invoice)
}

func (s *ServerImpl) PutSalesInvoicesId(c *gin.Context, id string) {
	storeID := s.getStoreID(c)
	var body struct {
		models.SalesInvoice
		Items   []models.SalesInvoiceItem   `json:"items"`
		Charges []models.SalesInvoiceCharge `json:"charges"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	invoice, err := s.salesService.UpdateInvoice(storeID, id, &body.SalesInvoice, body.Items, body.Charges)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, invoice)
}

func (s *ServerImpl) DeleteSalesInvoicesId(c *gin.Context, id string) {
	storeID := s.getStoreID(c)
	if err := s.salesService.DeleteInvoice(storeID, id); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Invoice deleted successfully"})
}

func (s *ServerImpl) PostSalesInvoicesIdCancel(c *gin.Context) {
	id := c.Param("id")
	storeID := s.getStoreID(c)
	if err := s.salesService.CancelInvoice(storeID, id); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Invoice cancelled successfully"})
}

func (s *ServerImpl) PostSalesInvoicesBulkAction(c *gin.Context) {
	storeID := s.getStoreID(c)
	var body struct {
		Action string   `json:"action"`
		IDs    []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if body.Action == "cancel" {
		if err := s.salesService.BulkCancelInvoices(storeID, body.IDs); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	} else if body.Action == "delete" {
		if err := s.salesService.BulkDeleteInvoices(storeID, body.IDs); err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	} else {
		c.JSON(400, gin.H{"error": "Invalid action. Supported: cancel, delete"})
		return
	}

	c.JSON(200, gin.H{"status": "success", "message": "Bulk action executed successfully"})
}

func (s *ServerImpl) GetSalesInvoicesBulkExport(c *gin.Context) {
	storeID := s.getStoreID(c)
	invoices, err := s.salesService.BulkExport(storeID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=sales_invoices_export.csv")
	c.Header("Content-Type", "text/csv")

	var builder strings.Builder
	builder.WriteString("ID,Invoice No,Party Name,Party Mobile,Invoice Date,Due Date,Status,Grand Total,Paid Amount,Balance Amount,Created At\n")
	for _, inv := range invoices {
		builder.WriteString(fmt.Sprintf("%s,%s,%s,%s,%s,%s,%s,%f,%f,%f,%s\n",
			inv.ID,
			strings.ReplaceAll(inv.InvoiceNo, ",", " "),
			strings.ReplaceAll(inv.PartyName, ",", " "),
			strings.ReplaceAll(inv.PartyMobile, ",", " "),
			inv.InvoiceDate,
			inv.DueDate,
			inv.Status,
			inv.GrandTotal,
			inv.PaidAmount,
			inv.BalanceAmount,
			inv.CreatedAt.Format(time.RFC3339),
		))
	}

	c.String(200, builder.String())
}

func (s *ServerImpl) PostSalesInvoicesIdCreditNote(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostSalesInvoicesIdDuplicate(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostSalesInvoicesIdPayment(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSalesInvoicesIdPdf(c *gin.Context, id string, params GetSalesInvoicesIdPdfParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostSalesInvoicesIdShare(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostSalesInvoicesIdSubmit(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsAuditLog(c *gin.Context, params GetSettingsAuditLogParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostSettingsBackup(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsBackupList(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsEmail(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutSettingsEmail(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsGstCredentials(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutSettingsGstCredentials(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsInvoiceSequence(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutSettingsInvoiceSequence(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsInvoiceTemplates(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostSettingsInvoiceTemplates(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsLoyaltyProgram(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutSettingsLoyaltyProgram(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsPriceLists(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostSettingsPriceLists(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsPriceListsIdItems(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutSettingsPriceListsIdItems(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsSms(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutSettingsSms(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsTaxRates(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostSettingsTaxRates(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetSettingsWhatsapp(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutSettingsWhatsapp(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetUsers(c *gin.Context, params GetUsersParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostUsers(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeleteUsersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetUsersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutUsersId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutUsersIdOutlets(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetVendors(c *gin.Context, params GetVendorsParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostVendors(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeleteVendorsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetVendorsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutVendorsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetVendorsIdLedger(c *gin.Context, id string, params GetVendorsIdLedgerParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetVendorsIdPurchaseOrders(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetWebhooksLogs(c *gin.Context, params GetWebhooksLogsParams) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetWebhooksSubscriptions(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostWebhooksSubscriptions(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) DeleteWebhooksSubscriptionsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PutWebhooksSubscriptionsId(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostWebhooksSubscriptionsIdTest(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetWeighingDevices(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostWeighingDevices(c *gin.Context) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostWeighingDevicesIdCalibrate(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetWeighingDevicesIdRead(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetWeighingDevicesIdStatus(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) PostWeighingDevicesIdTare(c *gin.Context, id string) {
	c.JSON(501, gin.H{"error": "Not Implemented"})
}

func (s *ServerImpl) GetParties(c *gin.Context, params GetPartiesParams) {
	var partyType *string
	if params.PartyType != nil {
		str := string(*params.PartyType)
		partyType = &str
	}

	storeID := s.getStoreID(c)
	partiesData, toCollect, toPay, err := s.partiesService.GetParties(storeID, partyType, params.Search, params.Category)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	total := len(partiesData)
	stats := PartiesStats{
		TotalParties: &total,
		ToCollect:    &toCollect,
		ToPay:        &toPay,
	}

	resp := make([]Party, len(partiesData))
	for i := range partiesData {
		resp[i] = Party{
			Id:        &partiesData[i].ID,
			Name:      &partiesData[i].Name,
			Category:  &partiesData[i].Category,
			Mobile:    &partiesData[i].Mobile,
			Email:     &partiesData[i].Email,
			PartyType: (*PartyPartyType)(&partiesData[i].PartyType),
			Balance:   &partiesData[i].Balance,
			IsBlocked: &partiesData[i].IsBlocked,
			IsActive:  &partiesData[i].IsActive,
			CreatedAt: &partiesData[i].CreatedAt,
		}
	}

	c.JSON(200, gin.H{
		"data":  resp,
		"stats": stats,
	})
}

func (s *ServerImpl) PostParties(c *gin.Context) {
	var body Party
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	v := validator.New()

	var name string
	if body.Name != nil {
		name = *body.Name
	}
	v.Required("name", name, "Name is required")
	v.MinLength("name", name, 3, "Name must be at least 3 characters")
	v.MaxLength("name", name, 100, "Name must be at most 100 characters")

	var mobile string
	if body.Mobile != nil {
		mobile = *body.Mobile
	}
	v.Required("mobile", mobile, "Mobile number is required")
	v.Phone("mobile", mobile, "Invalid mobile number format (must be 10-15 digits)")

	var partyType string
	if body.PartyType != nil {
		partyType = string(*body.PartyType)
	}
	v.Required("party_type", partyType, "Party type is required")
	v.Check(partyType == "customer" || partyType == "vendor", "party_type", "Party type must be 'customer' or 'vendor'")

	var category string
	if body.Category != nil {
		category = *body.Category
	} else {
		category = "General"
	}

	var email string
	if body.Email != nil {
		email = *body.Email
	}
	v.Email("email", email, "Invalid email format")

	var balance float32
	if body.Balance != nil {
		balance = *body.Balance
	}
	v.Min("balance", float64(balance), 0.0, "Opening balance cannot be negative")

	if v.HasErrors() {
		var firstErr string
		for _, errs := range v.Errors {
			if len(errs) > 0 {
				firstErr = errs[0]
				break
			}
		}
		c.JSON(400, gin.H{"error": firstErr, "errors": v.Errors})
		return
	}

	var isBlocked bool
	if body.IsBlocked != nil {
		isBlocked = *body.IsBlocked
	}

	var isActive bool
	if body.IsActive != nil {
		isActive = *body.IsActive
	} else {
		isActive = true
	}

	party := &models.Party{
		Name:      name,
		Category:  category,
		Mobile:    mobile,
		Email:     email,
		PartyType: partyType,
		Balance:   balance,
		IsBlocked: isBlocked,
		IsActive:  isActive,
	}

	storeID := s.getStoreID(c)
	if body.Id != nil && *body.Id != "" {
		party.ID = *body.Id
		updated, err := s.partiesService.UpdateParty(storeID, party.ID, party)
		if err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "unique") || strings.Contains(strings.ToLower(err.Error()), "duplicate") {
				c.JSON(400, gin.H{"error": "A party with this mobile number already exists"})
				return
			}
			if strings.Contains(strings.ToLower(err.Error()), "soft-deleted") {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		party = updated
	} else {
		party.ID = uuid.New().String()
		created, err := s.partiesService.CreateParty(storeID, party)
		if err != nil {
			if strings.Contains(strings.ToLower(err.Error()), "unique") || strings.Contains(strings.ToLower(err.Error()), "duplicate") {
				c.JSON(400, gin.H{"error": "A party with this mobile number already exists"})
				return
			}
			if strings.Contains(strings.ToLower(err.Error()), "soft-deleted") {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		party = created
	}

	body.Id = &party.ID
	body.Name = &party.Name
	body.Mobile = &party.Mobile
	body.Email = &party.Email
	body.Category = &party.Category
	body.PartyType = (*PartyPartyType)(&party.PartyType)
	body.Balance = &party.Balance
	body.IsBlocked = &party.IsBlocked
	body.IsActive = &party.IsActive
	body.CreatedAt = &party.CreatedAt
	c.JSON(200, body)
}

func (s *ServerImpl) PutPartiesId(c *gin.Context, id string) {
	var body Party
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var partyType string
	if body.PartyType != nil {
		partyType = string(*body.PartyType)
		if partyType != "customer" && partyType != "vendor" {
			c.JSON(400, gin.H{"error": "Invalid party type"})
			return
		}
	}

	var name string
	if body.Name != nil {
		name = *body.Name
		if name == "" {
			c.JSON(400, gin.H{"error": "Name cannot be empty"})
			return
		}
	}

	var mobile string
	if body.Mobile != nil {
		mobile = *body.Mobile
		if mobile == "" {
			c.JSON(400, gin.H{"error": "Mobile number cannot be empty"})
			return
		}
	}

	var email string
	if body.Email != nil {
		email = *body.Email
	}

	var category string
	if body.Category != nil {
		category = *body.Category
	}

	var balance float32
	if body.Balance != nil {
		balance = *body.Balance
	}

	var isBlocked bool
	if body.IsBlocked != nil {
		isBlocked = *body.IsBlocked
	}

	var isActive bool
	if body.IsActive != nil {
		isActive = *body.IsActive
	}

	partyInput := &models.Party{
		Name:      name,
		Category:  category,
		Mobile:    mobile,
		Email:     email,
		PartyType: partyType,
		Balance:   balance,
		IsBlocked: isBlocked,
		IsActive:  isActive,
	}

	storeID := s.getStoreID(c)
	updated, err := s.partiesService.UpdateParty(storeID, id, partyInput)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Party not found"})
			return
		}
		if strings.Contains(strings.ToLower(err.Error()), "unique") || strings.Contains(strings.ToLower(err.Error()), "duplicate") {
			c.JSON(400, gin.H{"error": "A party with this mobile number already exists"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	body.Id = &updated.ID
	body.Name = &updated.Name
	body.Mobile = &updated.Mobile
	body.Email = &updated.Email
	body.Category = &updated.Category
	body.PartyType = (*PartyPartyType)(&updated.PartyType)
	body.Balance = &updated.Balance
	body.IsBlocked = &updated.IsBlocked
	body.IsActive = &updated.IsActive
	createdAt := updated.CreatedAt
	body.CreatedAt = &createdAt

	c.JSON(200, body)
}

func (s *ServerImpl) DeletePartiesId(c *gin.Context, id string) {
	storeID := s.getStoreID(c)
	err := s.partiesService.DeleteParty(storeID, id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Party not found"})
			return
		}
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"status": "success"})
}

func (s *ServerImpl) PostPartiesBulkAction(c *gin.Context) {
	var body struct {
		Action string   `json:"action"`
		Ids    []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	storeID := s.getStoreID(c)
	err := s.partiesService.BulkAction(storeID, body.Action, body.Ids)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"status": "success"})
}

func (s *ServerImpl) GetSalesReturns(c *gin.Context) {
	var returns []models.SalesReturn
	query := s.db.Model(&models.SalesReturn{}).Preload("Items").Preload("Charges")

	if partyId := c.Query("party_id"); partyId != "" {
		query = query.Where("party_id = ?", partyId)
	}

	var total int64
	query.Count(&total)

	if err := query.Order("created_at desc").Find(&returns).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"data": returns,
		"meta": gin.H{
			"total": total,
		},
	})
}

func (s *ServerImpl) PostSalesReturns(c *gin.Context) {
	var sr models.SalesReturn
	if err := c.ShouldBindJSON(&sr); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if sr.ID == "" {
		sr.ID = uuid.New().String()
	}
	if sr.ReturnNo == "" {
		sr.ReturnNo = "SR-" + uuid.New().String()[:8]
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&sr).Error; err != nil {
			return err
		}

		// Update Stock for each item
		for _, item := range sr.Items {
			if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		// Update Party Balance (Decrease customer debt)
		if err := tx.Model(&models.Party{}).Where("id = ?", sr.PartyID).
			UpdateColumn("balance", gorm.Expr("balance - ?", sr.GrandTotal)).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, sr)
}

func (s *ServerImpl) GetSalesReturnsId(c *gin.Context) {
	id := c.Param("id")
	var sr models.SalesReturn
	if err := s.db.Preload("Items").Preload("Charges").First(&sr, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Sales Return not found"})
		return
	}
	c.JSON(200, sr)
}

func (s *ServerImpl) PutSalesReturnsId(c *gin.Context) {
	id := c.Param("id")
	var sr models.SalesReturn
	if err := s.db.First(&sr, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Sales Return not found"})
		return
	}

	var input models.SalesReturn
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Simplified update: delete old items/charges and create new ones
	// In a real app, you'd compare and update stock accordingly.
	// For this task, we'll keep it simple but functional.

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Revert old stock changes
		var oldItems []models.SalesReturnItem
		tx.Where("return_id = ?", sr.ID).Find(&oldItems)
		for _, item := range oldItems {
			tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity))
		}

		// Revert old balance
		tx.Model(&models.Party{}).Where("id = ?", sr.PartyID).
			UpdateColumn("balance", gorm.Expr("balance + ?", sr.GrandTotal))

		// Delete old items and charges
		tx.Where("return_id = ?", sr.ID).Delete(&models.SalesReturnItem{})
		tx.Where("return_id = ?", sr.ID).Delete(&models.SalesReturnCharge{})

		// Update main record
		input.ID = sr.ID
		if err := tx.Save(&input).Error; err != nil {
			return err
		}

		// Apply new stock changes
		for _, item := range input.Items {
			tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity + ?", item.Quantity))
		}

		// Apply new balance
		tx.Model(&models.Party{}).Where("id = ?", input.PartyID).
			UpdateColumn("balance", gorm.Expr("balance - ?", input.GrandTotal))

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, input)
}

func (s *ServerImpl) DeleteSalesReturnsId(c *gin.Context) {
	id := c.Param("id")
	var sr models.SalesReturn
	if err := s.db.First(&sr, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Sales Return not found"})
		return
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Revert stock changes
		var items []models.SalesReturnItem
		tx.Where("return_id = ?", sr.ID).Find(&items)
		for _, item := range items {
			tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity))
		}

		// Revert balance
		tx.Model(&models.Party{}).Where("id = ?", sr.PartyID).
			UpdateColumn("balance", gorm.Expr("balance + ?", sr.GrandTotal))

		// Delete everything
		tx.Where("return_id = ?", sr.ID).Delete(&models.SalesReturnItem{})
		tx.Where("return_id = ?", sr.ID).Delete(&models.SalesReturnCharge{})
		tx.Delete(&sr)

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "Sales Return deleted"})
}

func (s *ServerImpl) PostSalesReturnsBulkAction(c *gin.Context) {
	var body struct {
		Action string   `json:"action"`
		Ids    []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	switch body.Action {
	case "delete":
		for _, id := range body.Ids {
			// Reuse delete logic (could be optimized)
			var sr models.SalesReturn
			if err := s.db.First(&sr, "id = ?", id).Error; err == nil {
				s.db.Transaction(func(tx *gorm.DB) error {
					var items []models.SalesReturnItem
					tx.Where("return_id = ?", sr.ID).Find(&items)
					for _, item := range items {
						tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
							UpdateColumn("stock_quantity", gorm.Expr("stock_quantity - ?", item.Quantity))
					}
					tx.Model(&models.Party{}).Where("id = ?", sr.PartyID).
						UpdateColumn("balance", gorm.Expr("balance + ?", sr.GrandTotal))
					tx.Where("return_id = ?", sr.ID).Delete(&models.SalesReturnItem{})
					tx.Where("return_id = ?", sr.ID).Delete(&models.SalesReturnCharge{})
					tx.Delete(&sr)
					return nil
				})
			}
		}
	case "cancel":
		s.db.Model(&models.SalesReturn{}).Where("id IN ?", body.Ids).Update("status", "cancelled")
	case "export":
		// Mock export
	}

	c.JSON(200, gin.H{"status": "success"})
}

// --- Cash & Bank Handlers ---

func (s *ServerImpl) GetAccountingCashBankAccounts(c *gin.Context) {
	var accounts []models.BankAccount
	if err := s.db.Find(&accounts).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Ensure at least one Cash account exists
	hasCash := false
	for _, acc := range accounts {
		if acc.IsCash {
			hasCash = true
			break
		}
	}

	if !hasCash {
		cashAcc := models.BankAccount{
			ID:             uuid.New().String(),
			AccountName:    "Cash in-hand",
			OpeningBalance: 0,
			Balance:        0,
			IsActive:       true,
			IsCash:         true,
		}
		s.db.Create(&cashAcc)
		accounts = append(accounts, cashAcc)
	}

	c.JSON(200, accounts)
}

func (s *ServerImpl) PostAccountingCashBankAccounts(c *gin.Context) {
	var acc models.BankAccount
	if err := c.ShouldBindJSON(&acc); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if acc.ID == "" {
		acc.ID = uuid.New().String()
	}
	acc.Balance = acc.OpeningBalance
	if err := s.db.Create(&acc).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, acc)
}

func (s *ServerImpl) PutAccountingCashBankAccountsId(c *gin.Context) {
	id := c.Param("id")
	var acc models.BankAccount
	if err := s.db.First(&acc, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Account not found"})
		return
	}
	if err := c.ShouldBindJSON(&acc); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if err := s.db.Save(&acc).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, acc)
}

func (s *ServerImpl) DeleteAccountingCashBankAccountsId(c *gin.Context) {
	id := c.Param("id")
	if err := s.db.Model(&models.BankAccount{}).Where("id = ?", id).Update("is_active", false).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Account deactivated"})
}

func (s *ServerImpl) GetAccountingCashBankTransactions(c *gin.Context) {
	var txs []models.CashBankTransaction
	query := s.db.Model(&models.CashBankTransaction{})

	fromDate := c.Query("from_date")
	toDate := c.Query("to_date")
	if fromDate != "" {
		query = query.Where("date >= ?", fromDate)
	}
	if toDate != "" {
		query = query.Where("date <= ?", toDate)
	}

	if err := query.Order("date desc, created_at desc").Find(&txs).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Fetch account names for UI
	var accounts []models.BankAccount
	s.db.Find(&accounts)
	accMap := make(map[string]string)
	for _, a := range accounts {
		accMap[a.ID] = a.AccountName
	}

	for i := range txs {
		if txs[i].FromAccountID != nil {
			txs[i].FromAccountName = accMap[*txs[i].FromAccountID]
		}
		if txs[i].ToAccountID != nil {
			txs[i].ToAccountName = accMap[*txs[i].ToAccountID]
		}
	}

	c.JSON(200, txs)
}

func (s *ServerImpl) PostAccountingCashBankTransactions(c *gin.Context) {
	var txReq models.CashBankTransaction
	if err := c.ShouldBindJSON(&txReq); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if txReq.ID == "" {
		txReq.ID = uuid.New().String()
	}

	err := s.db.Transaction(func(dbTx *gorm.DB) error {
		if err := dbTx.Create(&txReq).Error; err != nil {
			return err
		}

		// Update balances
		switch txReq.Type {
		case "deposit", "add":
			if txReq.ToAccountID != nil {
				if err := dbTx.Model(&models.BankAccount{}).Where("id = ?", *txReq.ToAccountID).
					UpdateColumn("balance", gorm.Expr("balance + ?", txReq.Amount)).Error; err != nil {
					return err
				}
			}
		case "withdraw", "reduce":
			if txReq.FromAccountID != nil {
				if err := dbTx.Model(&models.BankAccount{}).Where("id = ?", *txReq.FromAccountID).
					UpdateColumn("balance", gorm.Expr("balance - ?", txReq.Amount)).Error; err != nil {
					return err
				}
			}
		case "transfer":
			if txReq.FromAccountID != nil && txReq.ToAccountID != nil {
				if err := dbTx.Model(&models.BankAccount{}).Where("id = ?", *txReq.FromAccountID).
					UpdateColumn("balance", gorm.Expr("balance - ?", txReq.Amount)).Error; err != nil {
					return err
				}
				if err := dbTx.Model(&models.BankAccount{}).Where("id = ?", *txReq.ToAccountID).
					UpdateColumn("balance", gorm.Expr("balance + ?", txReq.Amount)).Error; err != nil {
					return err
				}
			}
		case "adjustment":
			if txReq.ToAccountID != nil {
				// Adjustment usually means setting the balance or adding/subtracting
				// Here we'll treat it as a signed addition (negative for subtraction)
				if err := dbTx.Model(&models.BankAccount{}).Where("id = ?", *txReq.ToAccountID).
					UpdateColumn("balance", gorm.Expr("balance + ?", txReq.Amount)).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, txReq)
}

func (s *ServerImpl) GetAccountingCashBankSummary(c *gin.Context) {
	var accounts []models.BankAccount
	if err := s.db.Find(&accounts).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var totalBalance, cashBalance, bankBalance float32
	for _, acc := range accounts {
		if !acc.IsActive {
			continue
		}
		totalBalance += acc.Balance
		if acc.IsCash {
			cashBalance += acc.Balance
		} else {
			bankBalance += acc.Balance
		}
	}

	c.JSON(200, gin.H{
		"total_balance": totalBalance,
		"cash_balance":  cashBalance,
		"bank_balance":  bankBalance,
	})
}

// Staff Handlers
func (s *ServerImpl) GetStaff(c *gin.Context) {
	var staff []models.Staff
	query := s.db.Model(&models.Staff{})

	search := c.Query("search")
	if search != "" {
		query = query.Where("name LIKE ? OR phone LIKE ? OR email LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if err := query.Find(&staff).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, staff)
}

func (s *ServerImpl) PostStaff(c *gin.Context) {
	var staff models.Staff
	if err := c.ShouldBindJSON(&staff); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if staff.ID == "" {
		staff.ID = uuid.New().String()
	}
	if err := s.db.Create(&staff).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, staff)
}

func (s *ServerImpl) PutStaffId(c *gin.Context) {
	id := c.Param("id")
	var staff models.Staff
	if err := s.db.First(&staff, "id = ?", id).Error; err != nil {
		c.JSON(404, gin.H{"error": "Staff not found"})
		return
	}
	if err := c.ShouldBindJSON(&staff); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	staff.ID = id
	if err := s.db.Save(&staff).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, staff)
}

func (s *ServerImpl) DeleteStaffId(c *gin.Context) {
	id := c.Param("id")
	if err := s.db.Delete(&models.Staff{}, "id = ?", id).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(204, nil)
}

func (s *ServerImpl) PostStaffBulkAction(c *gin.Context) {
	var body struct {
		Action string   `json:"action"`
		Ids    []string `json:"ids"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	switch body.Action {
	case "delete":
		s.db.Delete(&models.Staff{}, "id IN ?", body.Ids)
	case "activate":
		s.db.Model(&models.Staff{}).Where("id IN ?", body.Ids).Update("is_active", true)
	case "deactivate":
		s.db.Model(&models.Staff{}).Where("id IN ?", body.Ids).Update("is_active", false)
	}
	c.JSON(200, gin.H{"message": "Action executed successfully"})
}

// Attendance Handlers
func (s *ServerImpl) GetAttendance(c *gin.Context) {
	date := c.Query("date")        // YYYY-MM-DD
	staffID := c.Query("staff_id") // Optional
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var attendance []models.Attendance
	db := s.db.Table("attendances").Select("attendances.*, staffs.name as staff_name").
		Joins("JOIN staffs ON attendances.staff_id = staffs.id").
		Where("attendances.deleted_at IS NULL")

	if date != "" {
		db = db.Where("attendances.date = ?", date)
	}
	if staffID != "" {
		db = db.Where("attendances.staff_id = ?", staffID)
	}
	if startDate != "" {
		db = db.Where("attendances.date >= ?", startDate)
	}
	if endDate != "" {
		db = db.Where("attendances.date <= ?", endDate)
	}

	if err := db.Order("attendances.date DESC").Find(&attendance).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, attendance)
}

func (s *ServerImpl) PostAttendance(c *gin.Context) {
	var records []models.Attendance
	if err := c.ShouldBindJSON(&records); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		for _, r := range records {
			if r.Date == "" {
				continue
			}
			// Upsert logic: check if record exists for this staff and date
			var existing models.Attendance
			result := tx.Where("staff_id = ? AND date = ?", r.StaffID, r.Date).First(&existing)
			if result.Error == nil {
				// Update
				existing.Status = r.Status
				existing.Notes = r.Notes
				if err := tx.Save(&existing).Error; err != nil {
					return err
				}
			} else {
				// Create
				if r.ID == "" {
					r.ID = uuid.New().String()
				}
				if err := tx.Create(&r).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Attendance recorded successfully"})
}

func (s *ServerImpl) GetAttendanceSummary(c *gin.Context) {
	date := c.Query("date")
	if date == "" {
		c.JSON(400, gin.H{"error": "Date is required"})
		return
	}

	var summary []struct {
		Status string
		Count  int
	}
	s.db.Model(&models.Attendance{}).
		Select("status, count(*) as count").
		Where("date = ?", date).
		Group("status").
		Scan(&summary)

	counts := map[string]int{
		"Present":    0,
		"Absent":     0,
		"Half Day":   0,
		"Paid Leave": 0,
		"Weekly Off": 0,
	}
	for _, s := range summary {
		counts[s.Status] = s.Count
	}

	c.JSON(200, counts)
}

// Salary Handlers
func (s *ServerImpl) GetSalaryPayments(c *gin.Context) {
	var payments []models.SalaryPayment
	if err := s.db.Raw(`
		SELECT p.*, s.name as staff_name 
		FROM salary_payments p 
		JOIN staffs s ON p.staff_id = s.id 
		WHERE p.deleted_at IS NULL 
		ORDER BY p.payment_date DESC`).Scan(&payments).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, payments)
}

func (s *ServerImpl) PostSalaryPayments(c *gin.Context) {
	var payment models.SalaryPayment
	if err := c.ShouldBindJSON(&payment); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if payment.ID == "" {
		payment.ID = uuid.New().String()
	}
	if err := s.db.Create(&payment).Error; err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, payment)
}
