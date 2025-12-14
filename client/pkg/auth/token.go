package auth

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/spf13/viper"
)

// TokenManager manages JWT tokens for different instances
type TokenManager struct {
	configDir string
}

// NewTokenManager creates a new token manager
func NewTokenManager() (*TokenManager, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	configDir := filepath.Join(homeDir, ".rhobee")
	if err := os.MkdirAll(configDir, 0700); err != nil {
		return nil, fmt.Errorf("failed to create config directory: %w", err)
	}

	return &TokenManager{
		configDir: configDir,
	}, nil
}

// SaveToken saves a token for an instance
func (tm *TokenManager) SaveToken(instance, url, user, token string) error {
	configFile := filepath.Join(tm.configDir, "config.yaml")

	viper.SetConfigFile(configFile)
	viper.SetConfigType("yaml")

	// Try to read existing config
	if err := viper.ReadInConfig(); err != nil {
		// File doesn't exist, will create new one
		if !os.IsNotExist(err) {
			return fmt.Errorf("failed to read config: %w", err)
		}
	}

	// Set values
	viper.Set(fmt.Sprintf("instances.%s.url", instance), url)
	viper.Set(fmt.Sprintf("instances.%s.user", instance), user)
	viper.Set(fmt.Sprintf("instances.%s.token", instance), token)

	// Set default instance if not set
	if !viper.IsSet("default_instance") {
		viper.Set("default_instance", instance)
	}

	// Write config
	if err := viper.WriteConfig(); err != nil {
		// If file doesn't exist, create it
		if os.IsNotExist(err) {
			if err := viper.SafeWriteConfig(); err != nil {
				return fmt.Errorf("failed to write config: %w", err)
			}
		} else {
			return fmt.Errorf("failed to write config: %w", err)
		}
	}

	// Set restrictive permissions
	if err := os.Chmod(configFile, 0600); err != nil {
		return fmt.Errorf("failed to set config file permissions: %w", err)
	}

	return nil
}

// GetToken retrieves token for an instance
func (tm *TokenManager) GetToken(instance string) (url, user, token string, err error) {
	configFile := filepath.Join(tm.configDir, "config.yaml")

	viper.SetConfigFile(configFile)
	viper.SetConfigType("yaml")

	if err := viper.ReadInConfig(); err != nil {
		return "", "", "", fmt.Errorf("config file not found. Run 'rhobee login' first: %w", err)
	}

	// Use default instance if not specified
	if instance == "" {
		instance = viper.GetString("default_instance")
		if instance == "" {
			return "", "", "", fmt.Errorf("no default instance configured")
		}
	}

	url = viper.GetString(fmt.Sprintf("instances.%s.url", instance))
	user = viper.GetString(fmt.Sprintf("instances.%s.user", instance))
	token = viper.GetString(fmt.Sprintf("instances.%s.token", instance))

	if url == "" || user == "" || token == "" {
		return "", "", "", fmt.Errorf("instance '%s' not configured. Run 'rhobee login --instance %s' first", instance, instance)
	}

	return url, user, token, nil
}

// GetDefaultInstance returns the default instance name
func (tm *TokenManager) GetDefaultInstance() string {
	configFile := filepath.Join(tm.configDir, "config.yaml")

	viper.SetConfigFile(configFile)
	viper.SetConfigType("yaml")

	if err := viper.ReadInConfig(); err != nil {
		return ""
	}

	return viper.GetString("default_instance")
}

// SetDefaultInstance sets the default instance
func (tm *TokenManager) SetDefaultInstance(instance string) error {
	configFile := filepath.Join(tm.configDir, "config.yaml")

	viper.SetConfigFile(configFile)
	viper.SetConfigType("yaml")

	if err := viper.ReadInConfig(); err != nil {
		return fmt.Errorf("config file not found: %w", err)
	}

	viper.Set("default_instance", instance)

	if err := viper.WriteConfig(); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	return nil
}
