package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/echoes1971/r-prj-ng/client/pkg/api"
	"github.com/echoes1971/r-prj-ng/client/pkg/auth"
	"github.com/echoes1971/r-prj-ng/client/pkg/models"
	"github.com/spf13/cobra"
)

var (
	createFile        string
	createType        string
	createName        string
	createDescription string
	createFatherID    string
	createPermissions string
	createLanguage    string
	createHTML        string
)

var createCmd = &cobra.Command{
	Use:   "create",
	Short: "Create a new object",
	Long: `Create a new object in ρBee.
	
Examples:
  # Create from command line flags
  rhobee create --type DBPage --name "My Page" --description "Page description" --father-id 0

  # Create from JSON file
  rhobee create --file page.json`,
	RunE: runCreate,
}

func init() {
	rootCmd.AddCommand(createCmd)

	createCmd.Flags().StringVar(&createFile, "file", "", "JSON file with object data")
	createCmd.Flags().StringVar(&createType, "type", "", "Object type (DBPage, DBFolder, DBNote, etc.)")
	createCmd.Flags().StringVar(&createName, "name", "", "Object name")
	createCmd.Flags().StringVar(&createDescription, "description", "", "Object description")
	createCmd.Flags().StringVar(&createFatherID, "father-id", "0", "Parent folder ID")
	createCmd.Flags().StringVar(&createPermissions, "permissions", "rw-r-----", "Permissions (default: rw-r-----)")
	createCmd.Flags().StringVar(&createLanguage, "language", "", "Language (default: empty)")
	createCmd.Flags().StringVar(&createHTML, "html", "", "HTML content (for DBPage/DBNote)")
}

func runCreate(cmd *cobra.Command, args []string) error {
	var obj models.DBObject

	// Load from file or build from flags
	if createFile != "" {
		data, err := os.ReadFile(createFile)
		if err != nil {
			return fmt.Errorf("failed to read file: %w", err)
		}

		if err := json.Unmarshal(data, &obj); err != nil {
			return fmt.Errorf("failed to parse JSON: %w", err)
		}
	} else {
		// Validate required fields
		if createType == "" || createName == "" {
			return fmt.Errorf("--type and --name are required when not using --file")
		}

		obj = models.DBObject{
			Classname:   createType,
			Name:        createName,
			Description: createDescription,
			FatherID:    createFatherID,
			Permissions: createPermissions,
			Language:    createLanguage,
			HTML:        createHTML,
		}
	}

	// Get token
	tokenManager, err := auth.NewTokenManager()
	if err != nil {
		return fmt.Errorf("failed to create token manager: %w", err)
	}

	instance, _ := cmd.Flags().GetString("instance")
	url, _, token, err := tokenManager.GetToken(instance)
	if err != nil {
		return fmt.Errorf("not logged in. Run 'rhobee login' first: %w", err)
	}

	// Create API client
	client := api.NewClient(url, token)

	// Create object
	created, err := client.Create(&obj)
	if err != nil {
		return fmt.Errorf("failed to create object: %w", err)
	}

	fmt.Printf("✓ Created %s with ID=%s\n", created.Classname, created.ID)

	// Print created object as JSON
	output, err := json.MarshalIndent(created, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal object: %w", err)
	}
	fmt.Println(string(output))

	return nil
}
