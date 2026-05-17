package validator

import (
	"regexp"
	"testing"
)

func TestValidatorRequired(t *testing.T) {
	v := New()

	v.Required("name", "", "Name is required")
	if !v.HasErrors() {
		t.Error("Expected error for empty required field, got none")
	}
	if v.Errors.Get("name") != "Name is required" {
		t.Errorf("Expected 'Name is required', got '%s'", v.Errors.Get("name"))
	}

	v2 := New()
	v2.Required("name", "John Doe", "Name is required")
	if v2.HasErrors() {
		t.Error("Expected no error for filled required field, got errors")
	}
}

func TestValidatorRequiredSlice(t *testing.T) {
	v := New()
	v.RequiredSlice("items", []string{}, "Items cannot be empty")
	if !v.HasErrors() {
		t.Error("Expected error for empty required slice, got none")
	}

	v2 := New()
	v2.RequiredSlice("items", []string{"apple"}, "Items cannot be empty")
	if v2.HasErrors() {
		t.Error("Expected no error for non-empty slice, got errors")
	}
}

func TestValidatorEmail(t *testing.T) {
	tests := []struct {
		email   string
		isValid bool
	}{
		{"test@example.com", true},
		{"user.name+tag@sub.domain.co.uk", true},
		{"invalid-email", false},
		{"@example.com", false},
		{"test@", false},
		{"", true}, // Optional email
	}

	for _, tt := range tests {
		v := New()
		v.Email("email", tt.email, "Invalid email format")
		if (len(v.Errors["email"]) == 0) != tt.isValid {
			t.Errorf("Email validation failed for: %s, expected isValid=%t", tt.email, tt.isValid)
		}
	}
}

func TestValidatorPhone(t *testing.T) {
	tests := []struct {
		phone   string
		isValid bool
	}{
		{"9876543210", true},
		{"+919876543210", true},
		{"001234567890", true},
		{"12345", false}, // too short
		{"abcde12345", false},
		{"", true}, // Optional phone
	}

	for _, tt := range tests {
		v := New()
		v.Phone("phone", tt.phone, "Invalid phone number")
		if (len(v.Errors["phone"]) == 0) != tt.isValid {
			t.Errorf("Phone validation failed for: %s, expected isValid=%t", tt.phone, tt.isValid)
		}
	}
}

func TestValidatorMinMaxLength(t *testing.T) {
	v := New()
	v.MinLength("code", "12", 3, "Min length is 3")
	if !v.HasErrors() {
		t.Error("Expected error for string shorter than min, got none")
	}

	v2 := New()
	v2.MaxLength("code", "12345", 4, "Max length is 4")
	if !v2.HasErrors() {
		t.Error("Expected error for string longer than max, got none")
	}
}

func TestValidatorMinMax(t *testing.T) {
	v := New()
	v.Min("quantity", 2.5, 3.0, "Quantity must be at least 3")
	if !v.HasErrors() {
		t.Error("Expected error for numeric below min, got none")
	}

	v2 := New()
	v2.Max("quantity", 5.5, 5.0, "Quantity must be at most 5")
	if !v2.HasErrors() {
		t.Error("Expected error for numeric above max, got none")
	}
}

func TestValidatorNumericAndAlphanumeric(t *testing.T) {
	v := New()
	v.Numeric("code", "123a5", "Code must be numeric")
	if !v.HasErrors() {
		t.Error("Expected error for non-numeric, got none")
	}

	v2 := New()
	v2.Alphanumeric("code", "123a5-", "Code must be alphanumeric")
	if !v2.HasErrors() {
		t.Error("Expected error for non-alphanumeric, got none")
	}
}

func TestValidatorPattern(t *testing.T) {
	rx := regexp.MustCompile(`^[A-Z]{3}-[0-9]{3}$`)
	v := New()
	v.Pattern("sku", "abc-123", rx, "Invalid SKU")
	if !v.HasErrors() {
		t.Error("Expected error for unmatched pattern, got none")
	}

	v2 := New()
	v2.Pattern("sku", "XYZ-987", rx, "Invalid SKU")
	if v2.HasErrors() {
		t.Error("Expected no error for matched pattern, got errors")
	}
}

func TestValidatorURL(t *testing.T) {
	tests := []struct {
		url     string
		isValid bool
	}{
		{"https://example.com", true},
		{"http://www.google.com/path?query=val", true},
		{"ftp://files.org", true},
		{"invalid-url", false},
		{"www.google.com", false}, // no scheme
		{"", true}, // Optional
	}

	for _, tt := range tests {
		v := New()
		v.URL("website", tt.url, "Invalid URL format")
		if (len(v.Errors["website"]) == 0) != tt.isValid {
			t.Errorf("URL validation failed for: %s, expected isValid=%t", tt.url, tt.isValid)
		}
	}
}

func TestValidatorDate(t *testing.T) {
	tests := []struct {
		date    string
		isValid bool
	}{
		{"2026-05-17", true},
		{"2026-13-17", false}, // invalid month
		{"2026-02-30", false}, // invalid day
		{"17-05-2026", false}, // wrong layout
		{"", true}, // Optional
	}

	for _, tt := range tests {
		v := New()
		v.Date("dob", tt.date, "Invalid date format")
		if (len(v.Errors["dob"]) == 0) != tt.isValid {
			t.Errorf("Date validation failed for: %s, expected isValid=%t", tt.date, tt.isValid)
		}
	}
}

func TestValidatorPassword(t *testing.T) {
	tests := []struct {
		password string
		isValid  bool
	}{
		{"StrongPass123!", true},
		{"weak", false},          // too short
		{"NoNumberAndSpecial", false},
		{"no_capital_123!", false},
		{"CAPITAL_NO_LOWER_123!", false},
	}

	for _, tt := range tests {
		v := New()
		v.Password("password", tt.password, "Password is too weak")
		if (len(v.Errors["password"]) == 0) != tt.isValid {
			t.Errorf("Password validation failed for: %s, expected isValid=%t", tt.password, tt.isValid)
		}
	}
}
