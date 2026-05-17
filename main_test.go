package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"pos-api/internal/models"
	"pos-api/internal/server"
)

func setupTestServer() (*gin.Engine, *gorm.DB) {
	// Initialize in-memory SQLite database for testing
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect test database")
	}

	err = models.AutoMigrate(db)
	if err != nil {
		panic("failed to migrate test database")
	}

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	srv := server.NewServer(db)
	server.RegisterHandlersWithOptions(r, srv, server.GinServerOptions{})

	return r, db
}

func TestServerEndpoints(t *testing.T) {
	r, _ := setupTestServer()

	t.Run("GET /users returns 501 Not Implemented", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/users", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusNotImplemented {
			t.Errorf("Expected status code %d, got %d", http.StatusNotImplemented, w.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		if response["error"] != "Not Implemented" {
			t.Errorf("Expected error 'Not Implemented', got %v", response["error"])
		}
	})

	t.Run("GET /products returns 200 OK", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/products", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
		}
	})
}

func TestPartiesManagement(t *testing.T) {
	r, db := setupTestServer()

	var partyID string

	t.Run("POST /parties - create a customer safely with missing optional fields", func(t *testing.T) {
		body := `{"name": "Alice Smith", "mobile": "9876543210", "party_type": "customer"}`
		req, _ := http.NewRequest("POST", "/parties", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Expected status code 200, got %d. Body: %s", w.Code, w.Body.String())
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if resp["name"] != "Alice Smith" {
			t.Errorf("Expected name 'Alice Smith', got %v", resp["name"])
		}
		if resp["category"] != "General" {
			t.Errorf("Expected default category 'General', got %v", resp["category"])
		}

		id, ok := resp["id"].(string)
		if !ok || id == "" {
			t.Fatal("Expected returned party ID to be a non-empty string")
		}
		partyID = id
	})

	t.Run("POST /parties - return 400 for duplicate mobile", func(t *testing.T) {
		body := `{"name": "Bob Smith", "mobile": "9876543210", "party_type": "customer"}`
		req, _ := http.NewRequest("POST", "/parties", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status code 400, got %d. Body: %s", w.Code, w.Body.String())
		}
	})

	t.Run("GET /parties - returns Alice", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/parties?search=Alice", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Expected status code 200, got %d", w.Code)
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)

		data, ok := resp["data"].([]interface{})
		if !ok || len(data) == 0 {
			t.Fatal("Expected non-empty parties data list")
		}

		firstParty := data[0].(map[string]interface{})
		if firstParty["name"] != "Alice Smith" {
			t.Errorf("Expected name 'Alice Smith', got %v", firstParty["name"])
		}
	})

	t.Run("PUT /parties/{id} - successfully updates Alice's category and email", func(t *testing.T) {
		body := `{"category": "VIP", "email": "alice@example.com"}`
		req, _ := http.NewRequest("PUT", "/parties/"+partyID, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Expected status code 200, got %d. Body: %s", w.Code, w.Body.String())
		}

		// Verify changes in database
		var dbParty models.Party
		if err := db.First(&dbParty, "id = ?", partyID).Error; err != nil {
			t.Fatalf("Failed to fetch party from DB: %v", err)
		}

		if dbParty.Category != "VIP" {
			t.Errorf("Expected updated category 'VIP', got %s", dbParty.Category)
		}
		if dbParty.Email != "alice@example.com" {
			t.Errorf("Expected updated email 'alice@example.com', got %s", dbParty.Email)
		}
		// Mobile and Name should remain unchanged
		if dbParty.Name != "Alice Smith" {
			t.Errorf("Expected name 'Alice Smith' to remain, got %s", dbParty.Name)
		}
	})

	t.Run("PUT /parties/{id} - returns 404 for non-existent party", func(t *testing.T) {
		body := `{"name": "Non Existent"}`
		req, _ := http.NewRequest("PUT", "/parties/non-existent-id", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("Expected status code 404, got %d", w.Code)
		}
	})

	t.Run("POST /parties/bulk-action - disable action updates is_active", func(t *testing.T) {
		body := `{"action": "disable", "ids": ["` + partyID + `"]}`
		req, _ := http.NewRequest("POST", "/parties/bulk-action", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Expected status code 200, got %d. Body: %s", w.Code, w.Body.String())
		}

		var dbParty models.Party
		if err := db.First(&dbParty, "id = ?", partyID).Error; err != nil {
			t.Fatalf("Failed to fetch party from DB: %v", err)
		}
		if dbParty.IsActive {
			t.Error("Expected party to be disabled (IsActive = false)")
		}
	})

	t.Run("DELETE /parties/{id} - successfully deletes party", func(t *testing.T) {
		req, _ := http.NewRequest("DELETE", "/parties/"+partyID, nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Expected status code 200, got %d. Body: %s", w.Code, w.Body.String())
		}

		var dbParty models.Party
		err := db.First(&dbParty, "id = ?", partyID).Error
		if err == nil {
			t.Fatal("Expected party to be deleted, but still found in DB")
		}
	})
}
