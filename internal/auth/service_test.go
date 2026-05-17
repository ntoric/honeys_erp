package auth

import (
	"testing"
	"pos-api/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"golang.org/x/crypto/bcrypt"
)

func TestAuthService_Login(t *testing.T) {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.User{})

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user := models.User{
		ID:       "test-user",
		Username: "testuser",
		Password: string(hashedPassword),
		Role:     "admin",
		IsActive: true,
	}
	db.Create(&user)

	service := NewAuthService(db)

	t.Run("Successful Login", func(t *testing.T) {
		resp, err := service.Login("testuser", "password123")
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		if resp.AccessToken == "" {
			t.Error("Expected access token, got empty string")
		}
		if resp.User.ID != "test-user" {
			t.Errorf("Expected user ID test-user, got %s", resp.User.ID)
		}
	})

	t.Run("Invalid Password", func(t *testing.T) {
		_, err := service.Login("testuser", "wrongpassword")
		if err == nil {
			t.Error("Expected error for invalid password, got nil")
		}
	})

	t.Run("User Not Found", func(t *testing.T) {
		_, err := service.Login("nonexistent", "password123")
		if err == nil {
			t.Error("Expected error for non-existent user, got nil")
		}
	})
}

func TestAuthService_TokenValidation(t *testing.T) {
	service := NewAuthService(nil)
	user := &models.User{
		ID:   "test-user",
		Role: "admin",
	}

	token, err := service.GenerateToken(user)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	claims, err := service.ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if claims.UserID != "test-user" {
		t.Errorf("Expected user ID test-user, got %s", claims.UserID)
	}
	if claims.Role != "admin" {
		t.Errorf("Expected role admin, got %s", claims.Role)
	}
}
