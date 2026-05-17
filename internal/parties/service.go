package parties

import (
	"errors"
	"log"
	"os"
	"strings"

	"gorm.io/gorm"

	"pos-api/internal/models"
)

type PartiesService interface {
	GetParties(storeID string, partyType *string, search *string, category *string) ([]models.Party, float32, float32, error)
	CreateParty(storeID string, party *models.Party) (*models.Party, error)
	UpdateParty(storeID string, id string, party *models.Party) (*models.Party, error)
	DeleteParty(storeID string, id string) error
	BulkAction(storeID string, action string, ids []string) error
}

type partiesService struct {
	db *gorm.DB
}

func NewPartiesService(db *gorm.DB) PartiesService {
	return &partiesService{db: db}
}

func (s *partiesService) GetParties(storeID string, partyType *string, search *string, category *string) ([]models.Party, float32, float32, error) {
	var parties []models.Party
	query := s.db.Model(&models.Party{}).Where("store_id = ?", storeID)

	if partyType != nil && *partyType != "" {
		query = query.Where("party_type = ?", *partyType)
	}
	if category != nil && *category != "" {
		query = query.Where("category = ?", *category)
	}
	if search != nil && *search != "" {
		q := "%" + strings.ToLower(*search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR mobile LIKE ? OR LOWER(email) LIKE ?", q, q, q)
	}

	if err := query.Find(&parties).Error; err != nil {
		log.Printf("[PartiesService] Error fetching parties in store %s: %v", storeID, err)
		return nil, 0, 0, err
	}

	var toCollect float32
	var toPay float32

	s.db.Model(&models.Party{}).Where("store_id = ? AND party_type = ?", storeID, "customer").Select("COALESCE(SUM(balance), 0)").Scan(&toCollect)
	s.db.Model(&models.Party{}).Where("store_id = ? AND party_type = ?", storeID, "vendor").Select("COALESCE(SUM(balance), 0)").Scan(&toPay)

	return parties, toCollect, toPay, nil
}

func (s *partiesService) CreateParty(storeID string, party *models.Party) (*models.Party, error) {
	log.Printf("[PartiesService] Creating new party in store %s: %s", storeID, party.Name)
	party.StoreID = storeID

	// Unscoped query to see if there is any soft-deleted record in THIS store with the same unique mobile number
	var existingSoftDeleted models.Party
	if err := s.db.Unscoped().Where("store_id = ? AND mobile = ? AND deleted_at IS NOT NULL", storeID, party.Mobile).First(&existingSoftDeleted).Error; err == nil {
		envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
		allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
		if allowReuse {
			log.Printf("[PartiesService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted party with same mobile %s. Hard deleting to resolve unique constraint conflict.", party.Mobile)
			if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
				log.Printf("[PartiesService] Error purging soft-deleted record: %v", err)
				return nil, err
			}
		} else {
			log.Printf("[PartiesService] ALLOW_SOFT_DELETED_REUSE is disabled. Rejecting creation due to conflict with soft-deleted party: %s", party.Mobile)
			return nil, errors.New("A Party with these details has already been deleted, please use different details to create the party")
		}
	}

	if err := s.db.Create(party).Error; err != nil {
		log.Printf("[PartiesService] Error creating party: %v", err)
		return nil, err
	}
	return party, nil
}

func (s *partiesService) UpdateParty(storeID string, id string, party *models.Party) (*models.Party, error) {
	log.Printf("[PartiesService] Updating party in store %s: %s", storeID, id)
	var existing models.Party
	if err := s.db.Where("store_id = ? AND id = ?", storeID, id).First(&existing).Error; err != nil {
		log.Printf("[PartiesService] Error finding party %s in store %s: %v", id, storeID, err)
		return nil, err
	}

	// Check if updated mobile conflicts with an existing soft-deleted record in THIS store
	if party.Mobile != "" && party.Mobile != existing.Mobile {
		var existingSoftDeleted models.Party
		if err := s.db.Unscoped().Where("store_id = ? AND mobile = ? AND deleted_at IS NOT NULL", storeID, party.Mobile).First(&existingSoftDeleted).Error; err == nil {
			envVal := strings.ToLower(strings.TrimSpace(os.Getenv("ALLOW_SOFT_DELETED_REUSE")))
			allowReuse := envVal == "true" || envVal == "t" || envVal == "1" || envVal == "yes"
			if allowReuse {
				log.Printf("[PartiesService] ALLOW_SOFT_DELETED_REUSE is enabled. Found soft-deleted party with same mobile %s during update. Hard deleting to resolve unique constraint conflict.", party.Mobile)
				if err := s.db.Unscoped().Delete(&existingSoftDeleted).Error; err != nil {
					log.Printf("[PartiesService] Error purging soft-deleted record during update: %v", err)
					return nil, err
				}
			} else {
				log.Printf("[PartiesService] ALLOW_SOFT_DELETED_REUSE is disabled. Rejecting update due to conflict with soft-deleted party: %s", party.Mobile)
				return nil, errors.New("A Party with these details has already been deleted, please use different details to create the party")
			}
		}
	}

	if party.Name != "" {
		existing.Name = party.Name
	}
	if party.Category != "" {
		existing.Category = party.Category
	}
	if party.Mobile != "" {
		existing.Mobile = party.Mobile
	}
	if party.Email != "" {
		existing.Email = party.Email
	}
	if party.PartyType != "" {
		existing.PartyType = party.PartyType
	}
	if party.Balance != 0 {
		existing.Balance = party.Balance
	}

	existing.IsBlocked = party.IsBlocked
	existing.IsActive = party.IsActive

	if err := s.db.Save(&existing).Error; err != nil {
		log.Printf("[PartiesService] Error saving party %s in store %s: %v", id, storeID, err)
		return nil, err
	}

	return &existing, nil
}

func (s *partiesService) DeleteParty(storeID string, id string) error {
	log.Printf("[PartiesService] Deleting party in store %s: %s", storeID, id)
	var party models.Party
	if err := s.db.Where("store_id = ? AND id = ?", storeID, id).First(&party).Error; err != nil {
		log.Printf("[PartiesService] Error finding party %s for deletion in store %s: %v", id, storeID, err)
		return err
	}

	if err := s.db.Delete(&party).Error; err != nil {
		log.Printf("[PartiesService] Error deleting party %s in store %s: %v", id, storeID, err)
		return err
	}

	return nil
}

func (s *partiesService) BulkAction(storeID string, action string, ids []string) error {
	log.Printf("[PartiesService] Performing bulk action: %s on %d items in store %s", action, len(ids), storeID)
	switch action {
	case "block":
		return s.db.Model(&models.Party{}).Where("store_id = ? AND id IN ?", storeID, ids).Update("is_blocked", true).Error
	case "unblock":
		return s.db.Model(&models.Party{}).Where("store_id = ? AND id IN ?", storeID, ids).Update("is_blocked", false).Error
	case "disable":
		return s.db.Model(&models.Party{}).Where("store_id = ? AND id IN ?", storeID, ids).Update("is_active", false).Error
	case "enable":
		return s.db.Model(&models.Party{}).Where("store_id = ? AND id IN ?", storeID, ids).Update("is_active", true).Error
	case "delete":
		return s.db.Where("store_id = ? AND id IN ?", storeID, ids).Delete(&models.Party{}).Error
	}
	return nil
}
