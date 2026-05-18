package main

import (
	"bufio"
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"pos-api/internal/models"
	"pos-api/internal/server"
	"pos-api/internal/middleware"
	"golang.org/x/crypto/bcrypt"
)

func loadEnv() {
	file, err := os.Open(".env")
	if err != nil {
		// No .env file is fine, skip silently
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])

			// Remove surrounding quotes
			if (strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"")) ||
				(strings.HasPrefix(val, "'") && strings.HasSuffix(val, "'")) {
				val = val[1 : len(val)-1]
			}

			if os.Getenv(key) == "" {
				os.Setenv(key, val)
			}
		}
	}
}

func main() {
	// Load environment variables from .env
	loadEnv()

	// Initialize SQLite database
	db, err := gorm.Open(sqlite.Open("pos.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// Auto-migrate the database schema
	if err := models.AutoMigrate(db); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Create gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, X-Store-ID")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Seed default admin user
	seedAdminUser(db)

	// Initialize server implementation
	srv := server.NewServer(db)

	// Register generated handlers with middleware
	server.RegisterHandlersWithOptions(r, srv, server.GinServerOptions{
		BaseURL: "/api/v1",
		Middlewares: []server.MiddlewareFunc{
			server.MiddlewareFunc(middleware.AuthMiddleware(srv.GetAuthService())),
		},
	})

	// Custom Routes (Protected)
	protected := r.Group("/api/v1")
	protected.Use(middleware.AuthMiddleware(srv.GetAuthService()))
	{
		protected.GET("/purchase/bills/:id", srv.GetPurchaseBillDetail)
		protected.PUT("/purchase/bills/:id", srv.PutPurchaseBillDetail)
		protected.DELETE("/purchase/bills/:id", srv.DeletePurchaseBillDetail)
		protected.POST("/payments/bulk-action", srv.PostPaymentsBulkAction)
		protected.GET("/sales/returns", srv.GetSalesReturns)
		protected.POST("/sales/returns", srv.PostSalesReturns)
		protected.GET("/sales/returns/:id", srv.GetSalesReturnsId)
		protected.PUT("/sales/returns/:id", srv.PutSalesReturnsId)
		protected.DELETE("/sales/returns/:id", srv.DeleteSalesReturnsId)
		protected.POST("/sales/returns/bulk-action", srv.PostSalesReturnsBulkAction)
		protected.POST("/expenses/bulk-action", srv.PostExpensesBulkAction)
		protected.POST("/categories/bulk-action", srv.PostCategoriesBulkAction)
		protected.GET("/categories/bulk-export", srv.GetCategoriesBulkExport)
		
		// Cash & Bank Routes
		protected.GET("/accounting/cash-bank/accounts", srv.GetAccountingCashBankAccounts)
		protected.POST("/accounting/cash-bank/accounts", srv.PostAccountingCashBankAccounts)
		protected.PUT("/accounting/cash-bank/accounts/:id", srv.PutAccountingCashBankAccountsId)
		protected.DELETE("/accounting/cash-bank/accounts/:id", srv.DeleteAccountingCashBankAccountsId)
		protected.GET("/accounting/cash-bank/transactions", srv.GetAccountingCashBankTransactions)
		protected.POST("/accounting/cash-bank/transactions", srv.PostAccountingCashBankTransactions)
		protected.GET("/accounting/cash-bank/summary", srv.GetAccountingCashBankSummary)

		// Staff & Payroll Routes
		protected.GET("/staff", srv.GetStaff)
		protected.POST("/staff", srv.PostStaff)
		protected.PUT("/staff/:id", srv.PutStaffId)
		protected.DELETE("/staff/:id", srv.DeleteStaffId)
		protected.POST("/staff/bulk-action", srv.PostStaffBulkAction)
		protected.GET("/attendance", srv.GetAttendance)
		protected.POST("/attendance", srv.PostAttendance)
		protected.GET("/attendance/summary", srv.GetAttendanceSummary)
		protected.GET("/salary/payments", srv.GetSalaryPayments)
		protected.POST("/salary/payments", srv.PostSalaryPayments)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server is running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func seedAdminUser(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count == 0 {
		log.Println("Seeding default admin user...")
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("ntoric@2026"), bcrypt.DefaultCost)
		admin := models.User{
			ID:       "user-admin",
			Username: "ntoric",
			Name:     "Administrator",
			Email:    "admin@hexonics.com",
			Password: string(hashedPassword),
			Role:     "admin",
			IsActive: true,
		}
		if err := db.Create(&admin).Error; err != nil {
			log.Printf("Failed to seed admin user: %v", err)
		} else {
			log.Println("Default admin user seeded successfully.")
		}
	}
}
