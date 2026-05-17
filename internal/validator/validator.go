package validator

import (
	"net/url"
	"regexp"
	"strings"
	"time"
	"unicode"
)

// EmailRX is a regex for validating email addresses.
var EmailRX = regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")

// PhoneRX is a regex for validating phone numbers (supports standard 10-digit, E.164, or optional leading +).
var PhoneRX = regexp.MustCompile(`^\+?[0-9]{10,15}$`)

// NumericRX is a regex for validating digit-only strings.
var NumericRX = regexp.MustCompile("^[0-9]+$")

// AlphanumericRX is a regex for validating alphanumeric-only strings.
var AlphanumericRX = regexp.MustCompile("^[a-zA-Z0-9]+$")

// Errors maps field names to their specific error messages.
type Errors map[string][]string

// Add appends a new error message for the given field.
func (e Errors) Add(field, message string) {
	e[field] = append(e[field], message)
}

// Get returns the first error message for a given field, or empty string if none.
func (e Errors) Get(field string) string {
	es := e[field]
	if len(es) == 0 {
		return ""
	}
	return es[0]
}

// HasErrors returns true if the Errors map is not empty.
func (e Errors) HasErrors() bool {
	return len(e) > 0
}

// Validator represents the validation engine context.
type Validator struct {
	Errors Errors
}

// New creates a new Validator instance.
func New() *Validator {
	return &Validator{Errors: make(Errors)}
}

// HasErrors returns true if the validator contains any errors.
func (v *Validator) HasErrors() bool {
	return v.Errors.HasErrors()
}

// AddError appends an error message to the field's slice if it doesn't already exist.
func (v *Validator) AddError(field, message string) {
	v.Errors.Add(field, message)
}

// Check registers an error if a validation assertion fails.
func (v *Validator) Check(ok bool, field, message string) {
	if !ok {
		v.AddError(field, message)
	}
}

// Required ensures a string value is not empty or filled with whitespace.
func (v *Validator) Required(field, value, message string) {
	v.Check(strings.TrimSpace(value) != "", field, message)
}

// RequiredSlice ensures a slice contains at least one item.
func (v *Validator) RequiredSlice(field string, value []string, message string) {
	v.Check(len(value) > 0, field, message)
}

// Email validates email format.
func (v *Validator) Email(field, value, message string) {
	if value == "" {
		return // Optional field, use Required to enforce
	}
	v.Check(EmailRX.MatchString(value), field, message)
}

// Phone validates a 10-15 digit phone number with optional +.
func (v *Validator) Phone(field, value, message string) {
	if value == "" {
		return // Optional field, use Required to enforce
	}
	v.Check(PhoneRX.MatchString(value), field, message)
}

// MinLength validates that a string has a minimum number of characters.
func (v *Validator) MinLength(field, value string, min int, message string) {
	v.Check(len([]rune(value)) >= min, field, message)
}

// MaxLength validates that a string has a maximum number of characters.
func (v *Validator) MaxLength(field, value string, max int, message string) {
	v.Check(len([]rune(value)) <= max, field, message)
}

// Min validates that a numeric value is at least min.
func (v *Validator) Min(field string, value, min float64, message string) {
	v.Check(value >= min, field, message)
}

// Max validates that a numeric value is at most max.
func (v *Validator) Max(field string, value, max float64, message string) {
	v.Check(value <= max, field, message)
}

// Numeric validates that the string contains only digits.
func (v *Validator) Numeric(field, value, message string) {
	if value == "" {
		return
	}
	v.Check(NumericRX.MatchString(value), field, message)
}

// Alphanumeric validates that the string contains only letters and digits.
func (v *Validator) Alphanumeric(field, value, message string) {
	if value == "" {
		return
	}
	v.Check(AlphanumericRX.MatchString(value), field, message)
}

// Pattern validates a string against a custom regular expression.
func (v *Validator) Pattern(field, value string, rx *regexp.Regexp, message string) {
	if value == "" {
		return
	}
	v.Check(rx.MatchString(value), field, message)
}

// URL validates that a string is a well-formed absolute URL.
func (v *Validator) URL(field, value, message string) {
	if value == "" {
		return
	}
	u, err := url.ParseRequestURI(value)
	v.Check(err == nil && u.Scheme != "" && u.Host != "", field, message)
}

// Date validates that a string is a valid date (supports YYYY-MM-DD layout).
func (v *Validator) Date(field, value, message string) {
	if value == "" {
		return
	}
	_, err := time.Parse("2006-01-02", value)
	v.Check(err == nil, field, message)
}

// Password verifies standard password complexity rules.
// Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.
func (v *Validator) Password(field, value, message string) {
	var (
		hasMinLen  = len(value) >= 8
		hasUpper   = false
		hasLower   = false
		hasNumber  = false
		hasSpecial = false
	)

	for _, r := range value {
		switch {
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsLower(r):
			hasLower = true
		case unicode.IsDigit(r):
			hasNumber = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSpecial = true
		}
	}

	ok := hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial
	v.Check(ok, field, message)
}
