package cmd

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"syscall"

	"github.com/echoes1971/r-prj-ng/client/pkg/api"
	"github.com/echoes1971/r-prj-ng/client/pkg/auth"
	"github.com/spf13/cobra"
	"golang.org/x/term"
)

var (
	loginURL      string
	loginUser     string
	loginPassword string
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Login to ρBee instance",
	Long: `Login to a ρBee instance and save the JWT token.
	
Examples:
  # Interactive login
  rhobee login

  # Non-interactive login
  rhobee login --url https://mybee.com --user admin --password secret

  # Login to specific instance
  rhobee login --instance prod --url https://mybee.com`,
	RunE: runLogin,
}

func init() {
	rootCmd.AddCommand(loginCmd)

	loginCmd.Flags().StringVar(&loginURL, "url", "", "ρBee instance URL")
	loginCmd.Flags().StringVar(&loginUser, "user", "", "Username")
	loginCmd.Flags().StringVar(&loginPassword, "password", "", "Password")
}

func runLogin(cmd *cobra.Command, args []string) error {
	reader := bufio.NewReader(os.Stdin)

	// Get URL
	url := loginURL
	if url == "" {
		fmt.Print("ρBee URL: ")
		input, err := reader.ReadString('\n')
		if err != nil {
			return fmt.Errorf("failed to read URL: %w", err)
		}
		url = strings.TrimSpace(input)
	}

	// Get username
	user := loginUser
	if user == "" {
		fmt.Print("Username: ")
		input, err := reader.ReadString('\n')
		if err != nil {
			return fmt.Errorf("failed to read username: %w", err)
		}
		user = strings.TrimSpace(input)
	}

	// Get password
	password := loginPassword
	if password == "" {
		fmt.Print("Password: ")
		passwordBytes, err := term.ReadPassword(int(syscall.Stdin))
		if err != nil {
			return fmt.Errorf("failed to read password: %w", err)
		}
		fmt.Println()
		password = string(passwordBytes)
	}

	// Login
	client := api.NewClient(url, "")
	token, err := client.Login(user, password)
	if err != nil {
		return fmt.Errorf("login failed: %w", err)
	}

	// Save token
	tokenManager, err := auth.NewTokenManager()
	if err != nil {
		return fmt.Errorf("failed to create token manager: %w", err)
	}

	instance, _ := cmd.Flags().GetString("instance")
	if instance == "" {
		instance = "prod"
	}

	if err := tokenManager.SaveToken(instance, url, user, token); err != nil {
		return fmt.Errorf("failed to save token: %w", err)
	}

	fmt.Printf("✓ Logged in as %s\n", user)
	fmt.Printf("✓ Token saved to ~/.rhobee/config.yaml\n")

	return nil
}
